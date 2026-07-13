const eur = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const eurPrecise = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

export function fmtEur(v: number): string {
  return eur.format(v);
}

/** Für Kurse: kleine Werte (DOGE, XRP) mit mehr Nachkommastellen. */
export function fmtPrice(v: number): string {
  return Math.abs(v) < 10 ? eurPrecise.format(v) : eur.format(v);
}

export function fmtPct(v: number, signed = true): string {
  const s = signed && v > 0 ? '+' : '';
  return `${s}${v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
}

export function fmtSigned(v: number): string {
  return `${v > 0 ? '+' : ''}${fmtEur(v)}`;
}

export function fmtTime(ts: number | string): string {
  return new Date(ts).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fmtQty(v: number): string {
  return v.toLocaleString('de-DE', { maximumFractionDigits: 6 });
}
