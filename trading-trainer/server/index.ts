import express from 'express';
import { db, getCash, setCash, resetAccount, START_CAPITAL } from './db.js';
import { SYMBOLS, startMarket, getSnapshot, getPrice, getHistory, onTick, getMode } from './market.js';
import { assess } from './analysis.js';
import { detectPatterns, type TradeRow } from './patterns.js';
import { getNews } from './news.js';

const app = express();
app.use(express.json());

const PORT = 5175;

// ---------- Markt ----------

app.get('/api/market', (_req, res) => {
  res.json({ symbols: SYMBOLS, ...getSnapshot() });
});

// ---------- Portfolio & Positionen ----------

interface PositionRow {
  id: number;
  symbol: string;
  side: 'long' | 'short';
  qty: number;
  entry: number;
  notional: number;
  stop_loss: number | null;
  take_profit: number | null;
  reason: string;
  opened_at: number;
}

function positionPnl(p: PositionRow, price: number): number {
  return p.side === 'long' ? (price - p.entry) * p.qty : (p.entry - price) * p.qty;
}

function serializePosition(p: PositionRow) {
  const price = getPrice(p.symbol) ?? p.entry;
  const pnl = positionPnl(p, price);
  return {
    id: p.id,
    symbol: p.symbol,
    side: p.side,
    qty: p.qty,
    entry: p.entry,
    notional: p.notional,
    stopLoss: p.stop_loss,
    takeProfit: p.take_profit,
    reason: p.reason,
    openedAt: p.opened_at,
    currentPrice: price,
    pnl,
    pnlPct: (pnl / p.notional) * 100,
  };
}

app.get('/api/portfolio', (_req, res) => {
  const positions = db.prepare('SELECT * FROM positions ORDER BY opened_at DESC').all() as PositionRow[];
  const cash = getCash();
  const serialized = positions.map(serializePosition);
  const equity = cash + serialized.reduce((a, p) => a + p.notional + p.pnl, 0);
  res.json({ cash, equity, startCapital: START_CAPITAL, positions: serialized, mode: getMode() });
});

app.post('/api/positions', (req, res) => {
  const { symbol, side, notional, stopLoss, takeProfit, reason } = req.body ?? {};

  const meta = SYMBOLS.find((s) => s.symbol === symbol);
  if (!meta) return res.status(400).json({ error: 'Unbekanntes Symbol.' });
  if (side !== 'long' && side !== 'short') return res.status(400).json({ error: 'Richtung muss long oder short sein.' });

  const amount = Number(notional);
  if (!Number.isFinite(amount) || amount < 10) {
    return res.status(400).json({ error: 'Positionsgröße muss mindestens 10 € betragen.' });
  }
  const cash = getCash();
  if (amount > cash) {
    return res.status(400).json({ error: `Nicht genug Kapital: verfügbar sind ${cash.toFixed(2)} €.` });
  }

  const reasonText = typeof reason === 'string' ? reason.trim() : '';
  if (reasonText.length < 20) {
    return res.status(400).json({ error: 'Begründung ist Pflicht: Warum dieser Trade? (mindestens 20 Zeichen)' });
  }

  const price = getPrice(symbol);
  if (!price) return res.status(500).json({ error: 'Kein Kurs verfügbar.' });

  const sl = stopLoss != null && stopLoss !== '' ? Number(stopLoss) : null;
  const tp = takeProfit != null && takeProfit !== '' ? Number(takeProfit) : null;
  if (sl != null && (!Number.isFinite(sl) || sl <= 0)) return res.status(400).json({ error: 'Ungültiger Stop-Loss.' });
  if (tp != null && (!Number.isFinite(tp) || tp <= 0)) return res.status(400).json({ error: 'Ungültiger Take-Profit.' });

  if (side === 'long') {
    if (sl != null && sl >= price) return res.status(400).json({ error: 'Long: Stop-Loss muss UNTER dem aktuellen Kurs liegen.' });
    if (tp != null && tp <= price) return res.status(400).json({ error: 'Long: Take-Profit muss ÜBER dem aktuellen Kurs liegen.' });
  } else {
    if (sl != null && sl <= price) return res.status(400).json({ error: 'Short: Stop-Loss muss ÜBER dem aktuellen Kurs liegen.' });
    if (tp != null && tp >= price) return res.status(400).json({ error: 'Short: Take-Profit muss UNTER dem aktuellen Kurs liegen.' });
  }

  const qty = amount / price;
  const info = db
    .prepare(
      `INSERT INTO positions (symbol, side, qty, entry, notional, stop_loss, take_profit, reason, opened_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(symbol, side, qty, price, amount, sl, tp, reasonText, Date.now());
  setCash(cash - amount);

  const row = db.prepare('SELECT * FROM positions WHERE id = ?').get(info.lastInsertRowid) as PositionRow;
  res.json({ position: serializePosition(row) });
});

function closePosition(p: PositionRow, exitPrice: number, closeReason: string) {
  const pnl = positionPnl(p, exitPrice);
  db.prepare(
    `INSERT INTO trades (symbol, side, qty, entry, exit_price, notional, stop_loss, take_profit, reason, opened_at, closed_at, pnl, close_reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(p.symbol, p.side, p.qty, p.entry, exitPrice, p.notional, p.stop_loss, p.take_profit, p.reason, p.opened_at, Date.now(), pnl, closeReason);
  db.prepare('DELETE FROM positions WHERE id = ?').run(p.id);
  setCash(getCash() + p.notional + pnl);
  return pnl;
}

app.post('/api/positions/:id/close', (req, res) => {
  const p = db.prepare('SELECT * FROM positions WHERE id = ?').get(Number(req.params.id)) as PositionRow | undefined;
  if (!p) return res.status(404).json({ error: 'Position nicht gefunden.' });
  const price = getPrice(p.symbol);
  if (!price) return res.status(500).json({ error: 'Kein Kurs verfügbar.' });
  const pnl = closePosition(p, price, 'manuell');
  res.json({ pnl });
});

// Stop-Loss / Take-Profit automatisch prüfen — bei jedem Kurs-Tick
onTick((prices) => {
  const positions = db.prepare('SELECT * FROM positions').all() as PositionRow[];
  for (const p of positions) {
    const price = prices.get(p.symbol);
    if (!price) continue;
    if (p.side === 'long') {
      if (p.stop_loss != null && price <= p.stop_loss) closePosition(p, p.stop_loss, 'stop-loss');
      else if (p.take_profit != null && price >= p.take_profit) closePosition(p, p.take_profit, 'take-profit');
    } else {
      if (p.stop_loss != null && price >= p.stop_loss) closePosition(p, p.stop_loss, 'stop-loss');
      else if (p.take_profit != null && price <= p.take_profit) closePosition(p, p.take_profit, 'take-profit');
    }
  }
});

// ---------- Journal ----------

app.get('/api/trades', (_req, res) => {
  const trades = db.prepare('SELECT * FROM trades ORDER BY closed_at DESC').all() as TradeRow[];
  res.json({ trades });
});

app.get('/api/journal/stats', (_req, res) => {
  const trades = db.prepare('SELECT * FROM trades ORDER BY closed_at ASC').all() as TradeRow[];
  const n = trades.length;
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const grossWin = wins.reduce((a, t) => a + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((a, t) => a + t.pnl, 0));

  let equity = START_CAPITAL;
  const curve = [{ t: trades[0]?.opened_at ?? Date.now(), equity }];
  for (const t of trades) {
    equity += t.pnl;
    curve.push({ t: t.closed_at, equity });
  }

  res.json({
    totalTrades: n,
    winRate: n ? (wins.length / n) * 100 : 0,
    wins: wins.length,
    losses: losses.length,
    totalPnl: trades.reduce((a, t) => a + t.pnl, 0),
    avgWin: wins.length ? grossWin / wins.length : 0,
    avgLoss: losses.length ? grossLoss / losses.length : 0,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0,
    bestTrade: n ? Math.max(...trades.map((t) => t.pnl)) : 0,
    worstTrade: n ? Math.min(...trades.map((t) => t.pnl)) : 0,
    equityCurve: curve,
    patterns: detectPatterns(trades, START_CAPITAL),
  });
});

// ---------- KI-Einschätzung ----------

interface AssessmentRow {
  id: number;
  symbol: string;
  price: number;
  direction: 'up' | 'down' | 'neutral';
  confidence: number;
  bull_args: string;
  bear_args: string;
  uncertainty: string;
  horizon_min: number;
  created_at: number;
  evaluated_at: number | null;
  eval_price: number | null;
  change_pct: number | null;
  correct: number | null;
}

function serializeAssessment(a: AssessmentRow) {
  return {
    id: a.id,
    symbol: a.symbol,
    price: a.price,
    direction: a.direction,
    confidence: a.confidence,
    bull: JSON.parse(a.bull_args) as string[],
    bear: JSON.parse(a.bear_args) as string[],
    uncertainty: a.uncertainty,
    horizonMin: a.horizon_min,
    createdAt: a.created_at,
    evaluatedAt: a.evaluated_at,
    evalPrice: a.eval_price,
    changePct: a.change_pct,
    correct: a.correct == null ? null : a.correct === 1,
  };
}

app.post('/api/assess', (req, res) => {
  const { symbol } = req.body ?? {};
  const meta = SYMBOLS.find((s) => s.symbol === symbol);
  if (!meta) return res.status(400).json({ error: 'Unbekanntes Symbol.' });
  const history = getHistory(symbol);
  if (history.length < 30) return res.status(500).json({ error: 'Noch nicht genug Kursdaten.' });

  const price = history[history.length - 1].p;
  const a = assess(meta.name, history);
  const info = db
    .prepare(
      `INSERT INTO assessments (symbol, price, direction, confidence, bull_args, bear_args, uncertainty, horizon_min, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(symbol, price, a.direction, a.confidence, JSON.stringify(a.bull), JSON.stringify(a.bear), a.uncertainty, a.horizonMin, Date.now());

  const row = db.prepare('SELECT * FROM assessments WHERE id = ?').get(info.lastInsertRowid) as AssessmentRow;
  res.json({ assessment: serializeAssessment(row) });
});

/** Fällige Einschätzungen gegen den echten Kurs prüfen. */
function evaluateDueAssessments() {
  const due = db
    .prepare('SELECT * FROM assessments WHERE evaluated_at IS NULL')
    .all() as AssessmentRow[];
  const now = Date.now();
  for (const a of due) {
    if (now - a.created_at < a.horizon_min * 60 * 1000) continue;
    const price = getPrice(a.symbol);
    if (!price) continue;
    const changePct = ((price - a.price) / a.price) * 100;
    let correct: boolean;
    if (a.direction === 'up') correct = changePct > 0;
    else if (a.direction === 'down') correct = changePct < 0;
    else correct = Math.abs(changePct) < 0.35;
    db.prepare('UPDATE assessments SET evaluated_at = ?, eval_price = ?, change_pct = ?, correct = ? WHERE id = ?').run(
      now, price, changePct, correct ? 1 : 0, a.id
    );
  }
}

app.get('/api/assessments', (_req, res) => {
  evaluateDueAssessments();
  const rows = db.prepare('SELECT * FROM assessments ORDER BY created_at DESC LIMIT 100').all() as AssessmentRow[];
  const evaluated = rows.filter((r) => r.evaluated_at != null);
  const correct = evaluated.filter((r) => r.correct === 1).length;
  const byDirection = (['up', 'down', 'neutral'] as const).map((d) => {
    const rowsD = evaluated.filter((r) => r.direction === d);
    return {
      direction: d,
      total: rowsD.length,
      correct: rowsD.filter((r) => r.correct === 1).length,
    };
  });
  res.json({
    assessments: rows.map(serializeAssessment),
    stats: {
      total: rows.length,
      evaluated: evaluated.length,
      correct,
      accuracy: evaluated.length ? (correct / evaluated.length) * 100 : null,
      byDirection,
    },
  });
});

// ---------- News ----------

app.get('/api/news', async (_req, res) => {
  res.json({ items: await getNews() });
});

// ---------- Lernbereich ----------

app.get('/api/lessons/progress', (_req, res) => {
  const rows = db.prepare('SELECT * FROM lesson_progress').all() as Array<{
    lesson_id: string;
    completed_at: number;
    score: number;
    total: number;
  }>;
  res.json({
    progress: Object.fromEntries(
      rows.map((r) => [r.lesson_id, { completedAt: r.completed_at, score: r.score, total: r.total }])
    ),
  });
});

app.post('/api/lessons/:id/complete', (req, res) => {
  const { score, total } = req.body ?? {};
  if (!Number.isFinite(Number(score)) || !Number.isFinite(Number(total))) {
    return res.status(400).json({ error: 'score und total erforderlich.' });
  }
  db.prepare(
    `INSERT INTO lesson_progress (lesson_id, completed_at, score, total) VALUES (?, ?, ?, ?)
     ON CONFLICT(lesson_id) DO UPDATE SET completed_at = excluded.completed_at,
       score = MAX(score, excluded.score), total = excluded.total`
  ).run(req.params.id, Date.now(), Number(score), Number(total));
  res.json({ ok: true });
});

// ---------- Konto zurücksetzen ----------

app.post('/api/reset', (_req, res) => {
  resetAccount();
  res.json({ ok: true, cash: getCash() });
});

startMarket();
app.listen(PORT, () => {
  console.log(`[server] Trading-Trainer-API läuft auf http://localhost:${PORT}`);
});
