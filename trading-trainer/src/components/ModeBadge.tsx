interface Props {
  mode: 'live' | 'simulation';
}

/** Zeigt an, ob echte Kurse (Binance) oder der Offline-Simulator laufen. */
export function ModeBadge({ mode }: Props) {
  const live = mode === 'live';
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs font-semibold ${
        live
          ? 'border-profit/30 bg-profit/10 text-profit'
          : 'border-violet-glow/30 bg-violet-glow/10 text-violet-soft'
      }`}
      title={
        live
          ? 'Echte Kurse über die kostenlose Binance-API (EUR-Paare)'
          : 'Keine Internetverbindung — realistischer Kurssimulator aktiv'
      }
    >
      <span
        className={`h-2 w-2 animate-pulseGlow rounded-full ${
          live ? 'bg-profit shadow-glow-green' : 'bg-violet-soft shadow-glow-violet'
        }`}
      />
      {live ? 'LIVE-KURSE' : 'SIMULATOR'}
    </div>
  );
}
