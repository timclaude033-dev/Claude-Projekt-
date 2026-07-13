/**
 * Regelbasierte Markt-Einschätzung ("KI-Einschätzung").
 * Läuft komplett lokal auf technischen Indikatoren — bewusst KEIN Orakel:
 * liefert Argumente für beide Seiten plus ehrliche Unsicherheit,
 * nie eine Kaufanweisung. Jede Einschätzung wird gespeichert und
 * später gegen den echten Kursverlauf geprüft.
 */

import type { PricePoint } from './market.js';

export interface Assessment {
  direction: 'up' | 'down' | 'neutral';
  confidence: number;
  bull: string[];
  bear: string[];
  uncertainty: string;
  horizonMin: number;
}

function returns(prices: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < prices.length; i++) out.push(prices[i] / prices[i - 1] - 1);
  return out;
}

function sma(prices: number[], n: number): number {
  const slice = prices.slice(-n);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function rsi(prices: number[], n = 14): number {
  const rets = returns(prices).slice(-n);
  let gain = 0;
  let loss = 0;
  for (const r of rets) {
    if (r > 0) gain += r;
    else loss -= r;
  }
  if (gain + loss === 0) return 50;
  return 100 * (gain / (gain + loss));
}

function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
}

export function assess(name: string, history: PricePoint[]): Assessment {
  const prices = history.map((h) => h.p);
  const last = prices[prices.length - 1];

  const maShort = sma(prices, 20);
  const maLong = sma(prices, 80);
  const momentum = (maShort - maLong) / maLong;
  const r = rsi(prices);
  const vol = stdev(returns(prices).slice(-60));
  const volHist = stdev(returns(prices).slice(-240, -60)) || vol;
  const volRatio = volHist > 0 ? vol / volHist : 1;
  const recent = prices.slice(-120);
  const high = Math.max(...recent);
  const low = Math.min(...recent);
  const range = high - low || 1;
  const posInRange = (last - low) / range;

  const bull: string[] = [];
  const bear: string[] = [];

  if (momentum > 0.001) {
    bull.push(`Der kurzfristige Durchschnitt liegt ${(momentum * 100).toFixed(2)} % über dem längerfristigen — das Momentum zeigt aktuell nach oben.`);
  } else if (momentum < -0.001) {
    bear.push(`Der kurzfristige Durchschnitt liegt ${(Math.abs(momentum) * 100).toFixed(2)} % unter dem längerfristigen — das Momentum zeigt aktuell nach unten.`);
  } else {
    bear.push('Kein klares Momentum: Die gleitenden Durchschnitte liegen praktisch aufeinander — Seitwärtsphase.');
  }

  if (r < 32) {
    bull.push(`RSI bei ${r.toFixed(0)} — kurzfristig überverkauft. Nach solchen Phasen kommt es oft (nicht immer!) zu Gegenbewegungen.`);
  } else if (r > 68) {
    bear.push(`RSI bei ${r.toFixed(0)} — kurzfristig überkauft. Das Risiko eines Rücksetzers ist erhöht.`);
  } else {
    bull.push(`RSI bei ${r.toFixed(0)} — neutraler Bereich, weder überkauft noch überverkauft.`);
  }

  if (posInRange > 0.85) {
    bull.push('Der Kurs notiert nahe am oberen Rand der jüngsten Spanne — ein Ausbruch nach oben wäre ein Stärkesignal.');
    bear.push('Direkt unter einem lokalen Hoch scheitern Ausbrüche häufig — Widerstandszone.');
  } else if (posInRange < 0.15) {
    bear.push('Der Kurs notiert nahe am unteren Rand der jüngsten Spanne — bricht die Unterstützung, kann es schnell weiter fallen.');
    bull.push('Nähe zur Unterstützung: Hier greifen erfahrungsgemäß eher Käufer zu — falls die Zone hält.');
  }

  if (volRatio > 1.4) {
    bear.push(`Die Schwankungsbreite ist zuletzt deutlich gestiegen (${volRatio.toFixed(1)}× des Normalwerts) — erhöhtes Risiko in beide Richtungen.`);
  } else if (volRatio < 0.7) {
    bull.push('Die Schwankungsbreite ist ungewöhnlich niedrig — solche Ruhephasen enden oft in einer stärkeren Bewegung (Richtung offen).');
  }

  // Richtung + Konfidenz aus dem kombinierten Score — bewusst gedeckelt
  let score = 0;
  score += Math.max(-1.5, Math.min(1.5, momentum * 400));
  score += (50 - r) / 60;
  score += (0.5 - posInRange) * 0.4;

  let direction: Assessment['direction'] = 'neutral';
  if (score > 0.45) direction = 'up';
  else if (score < -0.45) direction = 'down';

  const confidence = Math.round(Math.min(68, 50 + Math.abs(score) * 9));

  const uncertainty =
    `Ehrlich gesagt: Kurzfristige Kursbewegungen sind zum großen Teil Rauschen. ` +
    `Diese Einschätzung basiert nur auf dem Kursverlauf von ${name} (Momentum, RSI, Spanne, Volatilität) — ` +
    `keine Nachrichten, keine Fundamentaldaten, keine Orderbuchdaten. ` +
    `Selbst wenn alle Signale in eine Richtung zeigen, liegt die Trefferquote solcher Modelle historisch nur knapp über dem Münzwurf. ` +
    `Konfidenz ${confidence} % heißt: In etwa ${100 - confidence} von 100 Fällen läuft es anders. ` +
    `Das ist ein Denkanstoß für dein eigenes Urteil, keine Handelsempfehlung.`;

  return { direction, confidence, bull, bear, uncertainty, horizonMin: 30 };
}
