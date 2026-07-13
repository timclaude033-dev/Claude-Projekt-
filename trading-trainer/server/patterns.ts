/**
 * Fehlermuster-Erkennung fürs Journal: typische Anfängerfehler
 * werden aus den abgeschlossenen Trades abgeleitet.
 */

export interface TradeRow {
  id: number;
  symbol: string;
  side: string;
  qty: number;
  entry: number;
  exit_price: number;
  notional: number;
  stop_loss: number | null;
  take_profit: number | null;
  reason: string;
  opened_at: number;
  closed_at: number;
  pnl: number;
  close_reason: string;
}

export interface Pattern {
  id: string;
  title: string;
  detected: boolean;
  severity: 'ok' | 'warn' | 'critical';
  finding: string;
  tip: string;
}

export function detectPatterns(trades: TradeRow[], startCapital: number): Pattern[] {
  const n = trades.length;
  const patterns: Pattern[] = [];
  const pct = (x: number) => `${Math.round(x * 100)} %`;

  // 1. Ohne Stop-Loss handeln
  const noSl = trades.filter((t) => t.stop_loss == null).length;
  const noSlRatio = n ? noSl / n : 0;
  patterns.push({
    id: 'no-stop-loss',
    title: 'Trades ohne Stop-Loss',
    detected: n >= 3 && noSlRatio > 0.3,
    severity: noSlRatio > 0.6 ? 'critical' : noSlRatio > 0.3 ? 'warn' : 'ok',
    finding: n
      ? `${noSl} von ${n} Trades (${pct(noSlRatio)}) liefen ohne Stop-Loss.`
      : 'Noch keine abgeschlossenen Trades.',
    tip: 'Lege den Stop-Loss fest, BEVOR du den Trade eröffnest. Ein Trade ohne Ausstiegsplan ist eine Wette, kein Trade.',
  });

  // 2. Zu große Positionen
  const oversized = trades.filter((t) => t.notional > startCapital * 0.2).length;
  const overRatio = n ? oversized / n : 0;
  patterns.push({
    id: 'oversized',
    title: 'Zu große Positionen',
    detected: n >= 3 && overRatio > 0.25,
    severity: overRatio > 0.5 ? 'critical' : overRatio > 0.25 ? 'warn' : 'ok',
    finding: n
      ? `${oversized} von ${n} Trades banden mehr als 20 % des Startkapitals.`
      : 'Noch keine abgeschlossenen Trades.',
    tip: 'Faustregel: Riskiere pro Trade höchstens 1–2 % deines Kapitals. Positionsgröße = Risiko ÷ Abstand zum Stop.',
  });

  // 3. Revenge-Trading: neuer Trade < 10 Min nach einem Verlust
  const sorted = [...trades].sort((a, b) => a.opened_at - b.opened_at);
  let revenge = 0;
  for (const t of sorted) {
    const priorLoss = sorted.some(
      (o) => o.pnl < 0 && o.closed_at < t.opened_at && t.opened_at - o.closed_at < 10 * 60 * 1000
    );
    if (priorLoss) revenge++;
  }
  const revengeRatio = n ? revenge / n : 0;
  patterns.push({
    id: 'revenge',
    title: 'Revenge-Trading',
    detected: n >= 4 && revengeRatio > 0.25,
    severity: revengeRatio > 0.4 ? 'critical' : revengeRatio > 0.25 ? 'warn' : 'ok',
    finding: n
      ? `${revenge} Trades wurden innerhalb von 10 Minuten nach einem Verlust eröffnet.`
      : 'Noch keine abgeschlossenen Trades.',
    tip: 'Nach einem Verlust: Pause machen, Journal lesen, erst dann weiter. Frust-Trades holen Verluste selten zurück — sie vergrößern sie.',
  });

  // 4. Verluste laufen lassen (Halten von Verlierern deutlich länger als Gewinnern)
  const winners = trades.filter((t) => t.pnl > 0);
  const losers = trades.filter((t) => t.pnl < 0);
  const avgHold = (xs: TradeRow[]) =>
    xs.length ? xs.reduce((a, t) => a + (t.closed_at - t.opened_at), 0) / xs.length : 0;
  const holdW = avgHold(winners);
  const holdL = avgHold(losers);
  const holdBad = winners.length >= 2 && losers.length >= 2 && holdL > holdW * 1.5;
  patterns.push({
    id: 'hold-losers',
    title: 'Verluste laufen lassen',
    detected: holdBad,
    severity: holdBad ? 'warn' : 'ok',
    finding:
      winners.length >= 2 && losers.length >= 2
        ? `Verlust-Trades wurden im Schnitt ${(holdL / 60000).toFixed(0)} Min gehalten, Gewinn-Trades nur ${(holdW / 60000).toFixed(0)} Min.`
        : 'Noch zu wenige Gewinn-/Verlust-Trades für eine Aussage.',
    tip: '„Hoffen“ ist keine Strategie. Klassischer Anfängerfehler: Gewinne schnell mitnehmen, Verluste aussitzen — genau umgekehrt wird ein Schuh draus.',
  });

  // 5. Schwaches Verhältnis von Durchschnittsgewinn zu -verlust
  const avgWin = winners.length ? winners.reduce((a, t) => a + t.pnl, 0) / winners.length : 0;
  const avgLoss = losers.length ? Math.abs(losers.reduce((a, t) => a + t.pnl, 0) / losers.length) : 0;
  const rrBad = winners.length >= 2 && losers.length >= 2 && avgLoss > avgWin * 1.3;
  patterns.push({
    id: 'bad-rr',
    title: 'Schwaches Chance-Risiko-Verhältnis',
    detected: rrBad,
    severity: rrBad ? 'warn' : 'ok',
    finding:
      winners.length >= 2 && losers.length >= 2
        ? `Durchschnittlicher Verlust ${avgLoss.toFixed(2)} € vs. durchschnittlicher Gewinn ${avgWin.toFixed(2)} €.`
        : 'Noch zu wenige Daten für eine Aussage.',
    tip: 'Plane Trades so, dass der mögliche Gewinn mindestens das 1,5- bis 2-Fache des Risikos beträgt (Take-Profit vs. Stop-Loss).',
  });

  // 6. Dünne Begründungen
  const avgReasonLen = n ? trades.reduce((a, t) => a + t.reason.trim().length, 0) / n : 0;
  const thinReason = n >= 3 && avgReasonLen < 40;
  patterns.push({
    id: 'thin-reason',
    title: 'Oberflächliche Trade-Begründungen',
    detected: thinReason,
    severity: thinReason ? 'warn' : 'ok',
    finding: n
      ? `Deine Begründungen sind im Schnitt ${Math.round(avgReasonLen)} Zeichen lang.`
      : 'Noch keine abgeschlossenen Trades.',
    tip: 'Wer den Einstieg nicht in 2–3 Sätzen begründen kann (Setup, Auslöser, Ausstiegsplan), hat kein Setup — sondern ein Bauchgefühl.',
  });

  return patterns;
}
