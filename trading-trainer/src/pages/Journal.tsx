import { useState } from 'react';
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { StatTile } from '../components/StatTile';
import { PageHeader } from '../components/PageHeader';
import { usePolling } from '../hooks/usePolling';
import type { JournalStats, Trade } from '../lib/api';
import { fmtEur, fmtPct, fmtPrice, fmtSigned, fmtTime } from '../lib/format';

const closeReasonBadge: Record<string, { label: string; cls: string }> = {
  'stop-loss': { label: 'STOP-LOSS', cls: 'border-loss/40 bg-loss/10 text-loss' },
  'take-profit': { label: 'TAKE-PROFIT', cls: 'border-profit/40 bg-profit/10 text-profit' },
  manuell: { label: 'MANUELL', cls: 'border-white/15 bg-white/5 text-ink-dim' },
};

export function Journal() {
  const { data: stats } = usePolling<JournalStats>('/api/journal/stats', 5000);
  const { data: tradesData } = usePolling<{ trades: Trade[] }>('/api/trades', 5000);
  const [expanded, setExpanded] = useState<number | null>(null);

  const trades = tradesData?.trades ?? [];
  const curve = (stats?.equityCurve ?? []).map((c, i) => ({
    idx: i,
    time: fmtTime(c.t),
    equity: c.equity,
  }));
  const profitable = (stats?.totalPnl ?? 0) >= 0;
  const detected = (stats?.patterns ?? []).filter((p) => p.detected);
  const clean = (stats?.patterns ?? []).filter((p) => !p.detected);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Journal" subtitle="Jeder Trade wird gespeichert · Statistik · Fehlermuster" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Abgeschlossene Trades" value={stats?.totalTrades ?? 0} format={(v) => String(Math.round(v))} delay={0} />
        <StatTile
          label="Trefferquote"
          value={stats?.winRate ?? 0}
          format={(v) => `${v.toFixed(1)} %`}
          tone={(stats?.winRate ?? 0) >= 50 ? 'profit' : 'loss'}
          sub={`${stats?.wins ?? 0} Gewinner · ${stats?.losses ?? 0} Verlierer`}
          delay={0.05}
        />
        <StatTile
          label="Gesamt-P&L"
          value={stats?.totalPnl ?? 0}
          format={fmtSigned}
          tone={profitable ? 'profit' : 'loss'}
          delay={0.1}
        />
        <StatTile
          label="Profit-Faktor"
          value={Number.isFinite(stats?.profitFactor ?? 0) ? (stats?.profitFactor ?? 0) : 99}
          format={(v) => (v >= 99 ? '∞' : v.toFixed(2))}
          tone="violet"
          sub="Bruttogewinn ÷ Bruttoverlust"
          delay={0.15}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Gewinnkurve */}
        <GlassCard className="px-6 py-5 xl:col-span-2" delay={0.1}>
          <div className="label mb-4">Gewinnkurve (Kontowert nach jedem Trade)</div>
          <div className="h-72">
            {curve.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curve} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={profitable ? '#00FF9D' : '#FF3B5C'} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={profitable ? '#00FF9D' : '#FF3B5C'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fill: '#55556A', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} minTickGap={70} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#55556A', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => fmtEur(v)} width={92} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 12, fontFamily: 'monospace', fontSize: 12 }}
                    labelStyle={{ color: '#8A8A9E' }}
                    formatter={(v) => [fmtEur(Number(v)), 'Kontowert']}
                  />
                  <ReferenceLine y={10000} stroke="rgba(139,92,246,0.5)" strokeDasharray="4 4" label={{ value: 'Start', fill: '#A78BFA', fontSize: 10, position: 'insideTopRight' }} />
                  <Area type="stepAfter" dataKey="equity" stroke={profitable ? '#00FF9D' : '#FF3B5C'} strokeWidth={2} fill="url(#equityGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-ink-faint">
                Noch keine abgeschlossenen Trades — die Kurve entsteht mit deinem ersten Trade.
              </div>
            )}
          </div>
        </GlassCard>

        {/* Fehlermuster */}
        <GlassCard className="px-6 py-5" delay={0.15}>
          <div className="label mb-4">Deine Fehlermuster</div>
          <div className="space-y-3">
            {detected.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-xl border p-4 ${
                  p.severity === 'critical' ? 'border-loss/40 bg-loss/10 shadow-glow-red' : 'border-loss/25 bg-loss/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-loss">⚠</span>
                  <span className="text-sm font-bold text-ink">{p.title}</span>
                </div>
                <p className="num mt-1.5 text-xs text-ink-dim">{p.finding}</p>
                <p className="mt-2 text-xs leading-relaxed text-ink-faint">💡 {p.tip}</p>
              </motion.div>
            ))}
            {detected.length === 0 && (
              <div className="rounded-xl border border-profit/25 bg-profit/5 p-4 text-sm text-profit">
                ✓ Aktuell keine auffälligen Fehlermuster{(stats?.totalTrades ?? 0) < 3 ? ' — für belastbare Aussagen brauchst du noch ein paar Trades.' : '. Weiter so!'}
              </div>
            )}
            {clean.length > 0 && detected.length > 0 && (
              <p className="pt-1 text-xs text-ink-faint">
                Unauffällig: {clean.map((p) => p.title).join(' · ')}
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Trade-Historie */}
      <GlassCard className="mt-6 overflow-hidden" delay={0.2}>
        <div className="label px-6 pt-5">Alle Trades ({trades.length})</div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left">
                {['Zeit', 'Symbol', 'Richtung', 'Einstieg', 'Ausstieg', 'Größe', 'P&L', 'Geschlossen via', ''].map((h) => (
                  <th key={h} className="label whitespace-nowrap px-4 py-3 !text-[9px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => {
                const badge = closeReasonBadge[t.close_reason] ?? closeReasonBadge.manuell;
                const win = t.pnl >= 0;
                return (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="cursor-pointer border-b border-white/[0.03] transition-colors hover:bg-violet-glow/5"
                    onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                  >
                    <td className="num whitespace-nowrap px-4 py-3 text-xs text-ink-dim">{fmtTime(t.closed_at)}</td>
                    <td className="px-4 py-3 font-mono font-bold">{t.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={`num text-xs font-bold ${t.side === 'long' ? 'text-profit' : 'text-loss'}`}>
                        {t.side === 'long' ? '▲ LONG' : '▼ SHORT'}
                      </span>
                    </td>
                    <td className="num px-4 py-3 text-xs">{fmtPrice(t.entry)}</td>
                    <td className="num px-4 py-3 text-xs">{fmtPrice(t.exit_price)}</td>
                    <td className="num px-4 py-3 text-xs">{fmtEur(t.notional)}</td>
                    <td className={`num whitespace-nowrap px-4 py-3 font-bold ${win ? 'text-profit' : 'text-loss'}`}>
                      {fmtSigned(t.pnl)}
                      <span className="ml-1.5 text-[10px] opacity-60">{fmtPct((t.pnl / t.notional) * 100)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold ${badge.cls}`}>{badge.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-faint">{expanded === t.id ? '▲' : '▼'}</td>
                  </motion.tr>
                );
              })}
              {trades.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-ink-faint">
                    Noch keine abgeschlossenen Trades.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {expanded != null && (
            <div className="border-t border-violet-glow/20 bg-violet-glow/5 px-6 py-4 text-sm">
              <span className="label">Deine Begründung damals</span>
              <p className="mt-2 italic leading-relaxed text-ink-dim">
                „{trades.find((t) => t.id === expanded)?.reason}“
              </p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
