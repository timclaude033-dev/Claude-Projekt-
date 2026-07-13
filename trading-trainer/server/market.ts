/**
 * Markt-Engine: holt echte EUR-Kurse von der kostenlosen Binance-API.
 * Ohne Internet läuft ein Simulator (geometrische Brownsche Bewegung)
 * nahtlos weiter — die App funktioniert damit komplett offline.
 */

export interface SymbolMeta {
  symbol: string;
  pair: string;
  tvSymbol: string;
  name: string;
  base: number;
  vol: number;
}

export const SYMBOLS: SymbolMeta[] = [
  { symbol: 'BTC', pair: 'BTCEUR', tvSymbol: 'BINANCE:BTCEUR', name: 'Bitcoin', base: 96400, vol: 0.008 },
  { symbol: 'ETH', pair: 'ETHEUR', tvSymbol: 'BINANCE:ETHEUR', name: 'Ethereum', base: 3120, vol: 0.011 },
  { symbol: 'SOL', pair: 'SOLEUR', tvSymbol: 'BINANCE:SOLEUR', name: 'Solana', base: 214, vol: 0.015 },
  { symbol: 'XRP', pair: 'XRPEUR', tvSymbol: 'BINANCE:XRPEUR', name: 'XRP', base: 2.42, vol: 0.014 },
  { symbol: 'DOGE', pair: 'DOGEEUR', tvSymbol: 'BINANCE:DOGEEUR', name: 'Dogecoin', base: 0.318, vol: 0.018 },
  { symbol: 'LINK', pair: 'LINKEUR', tvSymbol: 'BINANCE:LINKEUR', name: 'Chainlink', base: 21.7, vol: 0.016 },
];

export interface PricePoint {
  t: number;
  p: number;
}

interface SymbolState {
  price: number;
  open24h: number;
  history: PricePoint[];
  drift: number;
}

const TICK_MS = 2500;
const HISTORY_MAX = 720;

const state = new Map<string, SymbolState>();
let mode: 'live' | 'simulation' = 'simulation';
let liveFailures = 0;
let lastLiveOk = 0;

type TickListener = (prices: Map<string, number>) => void;
const listeners: TickListener[] = [];

export function onTick(fn: TickListener) {
  listeners.push(fn);
}

export function getMode() {
  return mode;
}

export function getPrice(symbol: string): number | undefined {
  return state.get(symbol)?.price;
}

export function getHistory(symbol: string): PricePoint[] {
  return state.get(symbol)?.history ?? [];
}

export function getSnapshot() {
  const out: Record<string, { price: number; changePct: number; history: PricePoint[] }> = {};
  for (const meta of SYMBOLS) {
    const s = state.get(meta.symbol);
    if (!s) continue;
    const hist = s.history;
    const step = Math.max(1, Math.floor(hist.length / 140));
    const sampled = hist.filter((_, i) => i % step === 0 || i === hist.length - 1);
    out[meta.symbol] = {
      price: s.price,
      changePct: s.open24h > 0 ? ((s.price - s.open24h) / s.open24h) * 100 : 0,
      history: sampled,
    };
  }
  return { mode, prices: out };
}

function seed() {
  for (const meta of SYMBOLS) {
    const now = Date.now();
    const history: PricePoint[] = [];
    // Startverlauf rückwärts erzeugen, damit Charts & Analyse sofort Daten haben
    let p = meta.base * (1 + (Math.random() - 0.5) * 0.01);
    const points: number[] = [p];
    for (let i = 1; i < 200; i++) {
      p = p * (1 + gauss() * meta.vol * 0.08);
      points.push(p);
    }
    points.reverse();
    for (let i = 0; i < points.length; i++) {
      history.push({ t: now - (points.length - i) * TICK_MS, p: points[i] });
    }
    state.set(meta.symbol, {
      price: points[points.length - 1],
      open24h: points[0],
      history,
      drift: (Math.random() - 0.5) * 0.0004,
    });
  }
}

function gauss(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function simStep() {
  for (const meta of SYMBOLS) {
    const s = state.get(meta.symbol)!;
    // gelegentlich Drift wechseln → Trends entstehen
    if (Math.random() < 0.02) s.drift = (Math.random() - 0.5) * 0.0006;
    const shock = Math.random() < 0.01 ? gauss() * meta.vol * 0.6 : 0;
    s.price = s.price * (1 + s.drift + gauss() * meta.vol * 0.09 + shock);
    pushPoint(meta.symbol, s.price);
  }
}

function pushPoint(symbol: string, price: number) {
  const s = state.get(symbol)!;
  s.price = price;
  s.history.push({ t: Date.now(), p: price });
  if (s.history.length > HISTORY_MAX) s.history.splice(0, s.history.length - HISTORY_MAX);
}

async function fetchLive(): Promise<boolean> {
  const pairs = JSON.stringify(SYMBOLS.map((s) => s.pair));
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(pairs)}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return false;
    const data = (await res.json()) as Array<{ symbol: string; lastPrice: string; openPrice: string }>;
    for (const row of data) {
      const meta = SYMBOLS.find((s) => s.pair === row.symbol);
      if (!meta) continue;
      const price = Number(row.lastPrice);
      if (!Number.isFinite(price) || price <= 0) continue;
      const s = state.get(meta.symbol)!;
      s.open24h = Number(row.openPrice) || s.open24h;
      pushPoint(meta.symbol, price);
    }
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function startMarket() {
  seed();

  let fetching = false;
  const liveLoop = async () => {
    if (fetching) return;
    fetching = true;
    const ok = await fetchLive();
    fetching = false;
    if (ok) {
      liveFailures = 0;
      lastLiveOk = Date.now();
      if (mode !== 'live') {
        mode = 'live';
        console.log('[markt] Live-Kurse aktiv (Binance, EUR-Paare)');
      }
      emit();
    } else {
      liveFailures++;
      if (mode === 'live' && liveFailures >= 3) {
        mode = 'simulation';
        console.log('[markt] Live-API nicht erreichbar → Simulator übernimmt');
      }
    }
  };

  void liveLoop();
  setInterval(liveLoop, mode === 'live' ? 5000 : 5000);

  setInterval(() => {
    // Simulator tickt nur, wenn keine frischen Live-Daten da sind
    if (mode !== 'live' || Date.now() - lastLiveOk > 15000) {
      simStep();
      emit();
    }
  }, TICK_MS);
}

function emit() {
  const prices = new Map<string, number>();
  for (const meta of SYMBOLS) {
    prices.set(meta.symbol, state.get(meta.symbol)!.price);
  }
  for (const fn of listeners) fn(prices);
}
