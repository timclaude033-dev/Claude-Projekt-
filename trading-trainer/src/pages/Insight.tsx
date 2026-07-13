import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { StatTile } from '../components/StatTile';
import { PageHeader } from '../components/PageHeader';
import { usePolling } from '../hooks/usePolling';
import { apiPost, type AssessmentData, type AssessmentStats, type MarketData } from '../lib/api';
import { fmtPct, fmtPrice, fmtTime } from '../lib/format';

const dirMeta: Record<string, { label: string; cls: string; arrow: string }> = {
  up: { label: 'EHER AUFWÄRTS', cls: 'border-profit/50 bg-profit/10 text-profit shadow-glow-green', arrow: '▲' },
  down: { label: 'EHER ABWÄRTS', cls: 'border-loss/50 bg-loss/10 text-loss shadow-glow-red', arrow: '▼' },
  neutral: { label: 'SEITWÄRTS / UNKLAR', cls: 'border-violet-glow/50 bg-violet-glow/10 text-violet-soft shadow-glow-violet', arrow: '◆' },
};

export function Insight() {
  const { data: market } = usePolling<MarketData>('/api/market', 5000);
  const { data: assessData, refresh } = usePolling<{ assessments: AssessmentData[]; stats: AssessmentStats }>(
    '/api/assessments',
    10000
  );
  const [symbol, setSymbol] = useState('BTC');
  const [current, setCurrent] = useState<AssessmentData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = assessData?.stats;
  const history = assessData?.assessments ?? [];

  async function runAssessment() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiPost<{ assessment: AssessmentData }>('/api/assess', { symbol });
      setCurrent(res.assessment);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="KI-Einschätzung"
        subtitle="Argumente statt Anweisungen · Jede Einschätzung wird gegen den echten Kurs geprüft"
      />

      <GlassCard className="border-violet-glow/20 px-6 py-4" delay={0}>
        <p className="text-sm leading-relaxed text-ink-dim">
          <span className="font-bold text-violet-soft">Was das hier ist:</span> Eine regelbasierte Analyse des
          Kursverlaufs (Momentum, RSI, Spanne, Volatilität) — lokal auf deinem Rechner, ohne Cloud.{' '}
          <span className="font-bold text-ink">Sie sagt dir nie, was du kaufen sollst.</span> Sie liefert Argumente
          für beide Seiten, damit du selbst denkst. Nach 30 Minuten wird jede Einschätzung automatisch gegen den
          tatsächlichen Kurs geprüft — die Bilanz siehst du unten, ungeschönt.
        </p>
      </GlassCard>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Einschätzung anfordern */}
        <div>
          <GlassCard className="px-6 py-6" glow="violet" delay={0.05}>
            <div className="label mb-4">Markt wählen</div>
            <div className="grid grid-cols-3 gap-2">
              {market?.symbols.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => setSymbol(s.symbol)}
                  className={`rounded-xl border px-2 py-2.5 font-mono text-sm font-bold transition-all duration-200 ${
                    symbol === s.symbol
                      ? 'border-violet-glow/60 bg-violet-glow/15 text-violet-soft shadow-glow-violet'
                      : 'border-white/8 bg-white/[0.02] text-ink-dim hover:border-white/20 hover:text-ink'
                  }`}
                >
                  {s.symbol}
                </button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: busy ? 1 : 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={runAssessment}
              disabled={busy}
              className="neon-btn mt-5 w-full border border-violet-glow/60 bg-violet-glow/15 text-base font-bold text-violet-soft shadow-glow-violet disabled:opacity-50"
            >
              {busy ? 'Analysiere …' : `◈ Lage einschätzen — ${symbol}`}
            </motion.button>
            {error && <p className="mt-3 text-sm text-loss">{error}</p>}
          </GlassCard>

          <AnimatePresence mode="wait">
            {current && (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="glass mt-6 px-6 py-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-lg font-bold">{current.symbol}</span>
                    <span className="num ml-3 text-sm text-ink-dim">{fmtPrice(current.price)}</span>
                  </div>
                  <div className={`rounded-xl border px-4 py-2 font-mono text-sm font-bold ${dirMeta[current.direction].cls}`}>
                    {dirMeta[current.direction].arrow} {dirMeta[current.direction].label}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="label">Konfidenz</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${current.confidence}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-glow to-violet-soft shadow-glow-violet"
                    />
                  </div>
                  <span className="num text-sm font-bold text-violet-soft">{current.confidence} %</span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-profit/20 bg-profit/5 p-4">
                    <div className="label !text-profit/80">Dafür spricht</div>
                    <ul className="mt-2.5 space-y-2.5">
                      {current.bull.map((a, i) => (
                        <li key={i} className="flex gap-2 text-xs leading-relaxed text-ink-dim">
                          <span className="text-profit">＋</span>{a}
                        </li>
                      ))}
                      {current.bull.length === 0 && <li className="text-xs text-ink-faint">Kaum bullische Signale erkennbar.</li>}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-loss/20 bg-loss/5 p-4">
                    <div className="label !text-loss/80">Dagegen spricht</div>
                    <ul className="mt-2.5 space-y-2.5">
                      {current.bear.map((a, i) => (
                        <li key={i} className="flex gap-2 text-xs leading-relaxed text-ink-dim">
                          <span className="text-loss">－</span>{a}
                        </li>
                      ))}
                      {current.bear.length === 0 && <li className="text-xs text-ink-faint">Kaum bärische Signale erkennbar.</li>}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-violet-glow/25 bg-violet-glow/5 p-4">
                  <div className="label !text-violet-soft/80">Ehrliche Unsicherheit</div>
                  <p className="mt-2 text-xs leading-relaxed text-ink-dim">{current.uncertainty}</p>
                </div>

                <p className="num mt-3 text-center text-[10px] text-ink-faint">
                  Wird in {current.horizonMin} Minuten automatisch gegen den echten Kurs geprüft.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bilanz */}
        <div>
          <div className="label mb-4">Wie oft lag die KI richtig?</div>
          <div className="grid grid-cols-3 gap-4">
            <StatTile label="Einschätzungen" value={stats?.total ?? 0} format={(v) => String(Math.round(v))} delay={0.05} />
            <StatTile label="Davon geprüft" value={stats?.evaluated ?? 0} format={(v) => String(Math.round(v))} delay={0.1} />
            <StatTile
              label="Trefferquote"
              value={stats?.accuracy ?? 0}
              format={(v) => (stats?.accuracy == null ? '—' : `${v.toFixed(0)} %`)}
              tone={stats?.accuracy == null ? 'neutral' : stats.accuracy >= 50 ? 'profit' : 'loss'}
              sub={stats?.evaluated ? `${stats.correct} von ${stats.evaluated} korrekt` : 'noch nichts fällig'}
              delay={0.15}
            />
          </div>

          {stats && stats.evaluated > 0 && (
            <GlassCard className="mt-4 px-6 py-5" delay={0.2}>
              <div className="label mb-4">Nach Richtung</div>
              <div className="space-y-3">
                {stats.byDirection.filter((d) => d.total > 0).map((d) => {
                  const acc = (d.correct / d.total) * 100;
                  return (
                    <div key={d.direction} className="flex items-center gap-3">
                      <span className="num w-36 text-xs text-ink-dim">{dirMeta[d.direction].arrow} {dirMeta[d.direction].label}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div
                          className={`h-full rounded-full ${acc >= 50 ? 'bg-profit' : 'bg-loss'}`}
                          style={{ width: `${acc}%` }}
                        />
                      </div>
                      <span className="num w-24 text-right text-xs font-bold">
                        {d.correct}/{d.total} · {acc.toFixed(0)} %
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}

          <div className="mt-4 max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {history.map((a) => (
              <GlassCard key={a.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold">{a.symbol}</span>
                    <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold ${dirMeta[a.direction].cls.replace(/shadow-\S+/, '')}`}>
                      {dirMeta[a.direction].arrow} {dirMeta[a.direction].label}
                    </span>
                    <span className="num text-[10px] text-ink-faint">{fmtTime(a.createdAt)}</span>
                  </div>
                  {a.correct == null ? (
                    <span className="num rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-ink-faint">
                      ⧗ WIRD GEPRÜFT
                    </span>
                  ) : a.correct ? (
                    <span className="num rounded-md border border-profit/40 bg-profit/10 px-2 py-0.5 text-[10px] font-bold text-profit">
                      ✓ RICHTIG {a.changePct != null && `(${fmtPct(a.changePct)})`}
                    </span>
                  ) : (
                    <span className="num rounded-md border border-loss/40 bg-loss/10 px-2 py-0.5 text-[10px] font-bold text-loss">
                      ✗ FALSCH {a.changePct != null && `(${fmtPct(a.changePct)})`}
                    </span>
                  )}
                </div>
                <div className="num mt-2 text-xs text-ink-dim">
                  Kurs damals {fmtPrice(a.price)} · Konfidenz {a.confidence} %
                  {a.evalPrice != null && <> · Kurs bei Prüfung {fmtPrice(a.evalPrice)}</>}
                </div>
              </GlassCard>
            ))}
            {history.length === 0 && (
              <GlassCard className="px-6 py-10 text-center text-sm text-ink-faint" delay={0.2}>
                Noch keine Einschätzungen. Fordere links deine erste an.
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
