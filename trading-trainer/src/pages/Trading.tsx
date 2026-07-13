import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { StatTile } from '../components/StatTile';
import { PageHeader } from '../components/PageHeader';
import { ModeBadge } from '../components/ModeBadge';
import { usePolling } from '../hooks/usePolling';
import { apiPost, type MarketData, type Portfolio, type Position } from '../lib/api';
import { fmtEur, fmtPct, fmtPrice, fmtQty, fmtSigned, fmtTime } from '../lib/format';

export function Trading() {
  const { data: market } = usePolling<MarketData>('/api/market', 2500);
  const { data: portfolio, refresh } = usePolling<Portfolio>('/api/portfolio', 2500);

  const [symbol, setSymbol] = useState('BTC');
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [notional, setNotional] = useState('500');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const price = market?.prices[symbol]?.price;
  const cash = portfolio?.cash ?? 0;
  const openPnl = (portfolio?.positions ?? []).reduce((a, p) => a + p.pnl, 0);

  const risk = useMemo(() => {
    const amt = Number(notional);
    const sl = Number(stopLoss);
    if (!price || !Number.isFinite(amt) || !Number.isFinite(sl) || sl <= 0 || amt <= 0) return null;
    const qty = amt / price;
    const r = side === 'long' ? (price - sl) * qty : (sl - price) * qty;
    return r > 0 ? r : null;
  }, [notional, stopLoss, price, side]);

  const reasonOk = reason.trim().length >= 20;

  async function submit() {
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      await apiPost('/api/positions', {
        symbol,
        side,
        notional: Number(notional),
        stopLoss: stopLoss || null,
        takeProfit: takeProfit || null,
        reason: reason.trim(),
      });
      setSuccess(`${side === 'long' ? 'Long' : 'Short'} ${symbol} über ${fmtEur(Number(notional))} eröffnet.`);
      setReason('');
      setStopLoss('');
      setTakeProfit('');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler');
    } finally {
      setBusy(false);
    }
  }

  async function closePosition(p: Position) {
    try {
      await apiPost(`/api/positions/${p.id}/close`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Schließen');
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Paper Trading"
        subtitle="10.000 € Spielgeld · Long & Short · Stop-Loss & Take-Profit"
        right={portfolio ? <ModeBadge mode={portfolio.mode} /> : undefined}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatTile label="Verfügbares Kapital" value={cash} format={fmtEur} delay={0} flash />
        <StatTile
          label="Kontowert (Equity)"
          value={portfolio?.equity ?? 0}
          format={fmtEur}
          tone={(portfolio?.equity ?? 0) >= (portfolio?.startCapital ?? 0) ? 'profit' : 'loss'}
          sub={`Start: ${fmtEur(portfolio?.startCapital ?? 10000)}`}
          delay={0.05}
          flash
        />
        <StatTile
          label="Offener Gewinn/Verlust"
          value={openPnl}
          format={fmtSigned}
          tone={openPnl > 0 ? 'profit' : openPnl < 0 ? 'loss' : 'neutral'}
          sub={`${portfolio?.positions.length ?? 0} offene Position(en)`}
          delay={0.1}
          flash
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Order-Ticket */}
        <GlassCard className="px-6 py-6 xl:col-span-2" glow="violet" delay={0.1}>
          <div className="label mb-5">Neuer Trade</div>

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

          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3">
            <span className="label">Aktueller Kurs</span>
            <span className="text-lg font-bold">
              {price != null && <AnimatedNumber value={price} format={fmtPrice} flash />}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setSide('long')}
              className={`neon-btn border text-sm ${
                side === 'long'
                  ? 'border-profit/60 bg-profit/15 text-profit shadow-glow-green'
                  : 'border-white/8 bg-white/[0.02] text-ink-dim hover:text-ink'
              }`}
            >
              ▲ LONG — auf steigende Kurse
            </button>
            <button
              onClick={() => setSide('short')}
              className={`neon-btn border text-sm ${
                side === 'short'
                  ? 'border-loss/60 bg-loss/15 text-loss shadow-glow-red'
                  : 'border-white/8 bg-white/[0.02] text-ink-dim hover:text-ink'
              }`}
            >
              ▼ SHORT — auf fallende Kurse
            </button>
          </div>

          <div className="mt-4">
            <label className="label">Positionsgröße (EUR)</label>
            <input
              className="input-dark mt-2"
              type="number"
              min={10}
              value={notional}
              onChange={(e) => setNotional(e.target.value)}
            />
            <div className="mt-2 flex gap-2">
              {[0.01, 0.02, 0.05, 0.1].map((f) => (
                <button
                  key={f}
                  onClick={() => setNotional(String(Math.max(10, Math.floor(cash * f))))}
                  className="rounded-lg border border-white/8 px-3 py-1 font-mono text-xs text-ink-dim transition-colors hover:border-violet-glow/40 hover:text-violet-soft"
                >
                  {f * 100} %
                </button>
              ))}
            </div>
            {price != null && Number(notional) > 0 && (
              <p className="num mt-2 text-xs text-ink-faint">
                ≈ {fmtQty(Number(notional) / price)} {symbol}
              </p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="label">Stop-Loss (Kurs)</label>
              <input
                className="input-dark mt-2"
                type="number"
                placeholder={price ? fmtPrice(side === 'long' ? price * 0.97 : price * 1.03) : '–'}
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Take-Profit (Kurs)</label>
              <input
                className="input-dark mt-2"
                type="number"
                placeholder={price ? fmtPrice(side === 'long' ? price * 1.06 : price * 0.94) : '–'}
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
              />
            </div>
          </div>

          {risk != null ? (
            <div className="mt-3 rounded-xl border border-loss/25 bg-loss/5 px-4 py-2.5 text-xs">
              <span className="label !text-loss/80">Risiko bei Stop-Loss</span>
              <span className="num ml-2 font-bold text-loss">−{fmtEur(risk)}</span>
              <span className="ml-2 text-ink-faint">({fmtPct((risk / Math.max(1, cash)) * 100, false)} des Kapitals)</span>
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs text-ink-faint">
              Tipp: Ohne Stop-Loss kennst du dein Risiko nicht. Das Journal merkt sich das.
            </div>
          )}

          <div className="mt-4">
            <label className="label flex items-center justify-between">
              <span>Warum dieser Trade? (Pflicht)</span>
              <span className={`num ${reasonOk ? 'text-profit' : 'text-loss'}`}>{reason.trim().length}/20</span>
            </label>
            <textarea
              className="input-dark mt-2 min-h-[90px] resize-y font-sans"
              placeholder="Setup, Auslöser, Plan — z. B.: RSI überverkauft an Unterstützung, Stop unter dem letzten Tief, Ziel am Widerstand."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <motion.button
            whileHover={{ scale: busy ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={busy || !reasonOk || !price}
            onClick={submit}
            className={`neon-btn mt-5 w-full border text-base font-bold disabled:cursor-not-allowed disabled:opacity-40 ${
              side === 'long'
                ? 'border-profit/60 bg-profit/15 text-profit hover:shadow-glow-green'
                : 'border-loss/60 bg-loss/15 text-loss hover:shadow-glow-red'
            }`}
          >
            {busy ? 'Wird ausgeführt …' : `${side === 'long' ? 'LONG' : 'SHORT'} ${symbol} eröffnen`}
          </motion.button>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 rounded-xl border border-loss/30 bg-loss/10 px-4 py-2.5 text-sm text-loss"
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 rounded-xl border border-profit/30 bg-profit/10 px-4 py-2.5 text-sm text-profit"
              >
                {success}
              </motion.p>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Offene Positionen */}
        <div className="space-y-4 xl:col-span-3">
          <div className="label">Offene Positionen</div>
          <AnimatePresence>
            {(portfolio?.positions ?? []).map((p) => {
              const winning = p.pnl >= 0;
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, x: 40 }}
                  className={`glass px-6 py-5 ${winning ? 'shadow-glow-green' : 'shadow-glow-red'}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span
                        className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-bold ${
                          p.side === 'long'
                            ? 'border-profit/40 bg-profit/10 text-profit'
                            : 'border-loss/40 bg-loss/10 text-loss'
                        }`}
                      >
                        {p.side === 'long' ? '▲ LONG' : '▼ SHORT'}
                      </span>
                      <div>
                        <div className="font-mono text-lg font-bold">{p.symbol}</div>
                        <div className="label !text-[9px]">{fmtTime(p.openedAt)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-extrabold ${winning ? 'text-profit' : 'text-loss'}`}>
                        <AnimatedNumber value={p.pnl} format={fmtSigned} flash />
                      </div>
                      <div className={`num text-xs ${winning ? 'text-profit/70' : 'text-loss/70'}`}>
                        {fmtPct(p.pnlPct)}
                      </div>
                    </div>
                  </div>

                  <div className="num mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-ink-dim sm:grid-cols-3">
                    <span>Einstieg <b className="text-ink">{fmtPrice(p.entry)}</b></span>
                    <span>Aktuell <b className="text-ink">{fmtPrice(p.currentPrice)}</b></span>
                    <span>Größe <b className="text-ink">{fmtEur(p.notional)}</b></span>
                    <span>Stop-Loss <b className={p.stopLoss ? 'text-ink' : 'text-loss'}>{p.stopLoss ? fmtPrice(p.stopLoss) : 'FEHLT'}</b></span>
                    <span>Take-Profit <b className="text-ink">{p.takeProfit ? fmtPrice(p.takeProfit) : '—'}</b></span>
                    <span>Menge <b className="text-ink">{fmtQty(p.qty)}</b></span>
                  </div>

                  <p className="mt-3 border-t border-white/5 pt-3 text-xs italic leading-relaxed text-ink-faint">
                    „{p.reason}“
                  </p>

                  <button
                    onClick={() => closePosition(p)}
                    className="neon-btn mt-4 w-full border border-white/10 bg-white/[0.03] py-2.5 text-sm text-ink-dim hover:border-violet-glow/50 hover:text-ink hover:shadow-glow-violet"
                  >
                    Position schließen
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {portfolio && portfolio.positions.length === 0 && (
            <GlassCard className="px-6 py-10 text-center" delay={0.15}>
              <p className="text-ink-dim">Keine offenen Positionen.</p>
              <p className="mt-1 text-sm text-ink-faint">
                Eröffne links deinen ersten Übungs-Trade — mit Begründung und idealerweise Stop-Loss.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
