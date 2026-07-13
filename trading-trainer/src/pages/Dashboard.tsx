import { useMemo, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { GlassCard } from '../components/GlassCard';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { Sparkline } from '../components/Sparkline';
import { PageHeader } from '../components/PageHeader';
import { ModeBadge } from '../components/ModeBadge';
import { usePolling } from '../hooks/usePolling';
import type { MarketData, NewsItem } from '../lib/api';
import { fmtPct, fmtPrice, fmtTime } from '../lib/format';

export function Dashboard() {
  const { data: market } = usePolling<MarketData>('/api/market', 2500);
  const { data: news } = usePolling<{ items: NewsItem[] }>('/api/news', 5 * 60 * 1000);
  const [selected, setSelected] = useState('BTC');

  const selMeta = market?.symbols.find((s) => s.symbol === selected);
  const selData = market?.prices[selected];

  const chartData = useMemo(
    () =>
      (selData?.history ?? []).map((h) => ({
        time: new Date(h.t).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        price: h.p,
      })),
    [selData?.history]
  );

  const positive = (selData?.changePct ?? 0) >= 0;
  const lineColor = positive ? '#00FF9D' : '#FF3B5C';

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Dashboard"
        subtitle="Marktübersicht · Watchlist · News"
        right={market ? <ModeBadge mode={market.mode} /> : undefined}
      />

      {/* Watchlist */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {market?.symbols.map((s, i) => {
          const d = market.prices[s.symbol];
          if (!d) return null;
          const pos = d.changePct >= 0;
          const active = s.symbol === selected;
          return (
            <GlassCard
              key={s.symbol}
              hover
              delay={i * 0.05}
              glow={active ? 'violet' : 'none'}
              onClick={() => setSelected(s.symbol)}
              className={`px-4 py-4 ${active ? 'border-violet-glow/50' : ''}`}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-sm font-bold text-ink">{s.symbol}</span>
                <span className={`num text-xs font-semibold ${pos ? 'text-profit' : 'text-loss'}`}>
                  {pos ? '▲' : '▼'} {fmtPct(d.changePct)}
                </span>
              </div>
              <div className="label mt-0.5">{s.name}</div>
              <div className="mt-2 text-lg font-bold">
                <AnimatedNumber value={d.price} format={fmtPrice} flash />
              </div>
              <div className="mt-2">
                <Sparkline data={d.history.slice(-60)} positive={pos} width={150} height={34} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Charts */}
        <div className="space-y-6 xl:col-span-2">
          <GlassCard className="overflow-hidden" delay={0.1}>
            <div className="flex items-center justify-between px-6 pt-5">
              <div>
                <div className="label">TradingView · {selMeta?.name ?? ''}</div>
                <div className="mt-1 text-2xl font-extrabold">
                  {selData && <AnimatedNumber value={selData.price} format={fmtPrice} flash />}
                </div>
              </div>
              <span className={`num text-sm font-bold ${positive ? 'text-profit' : 'text-loss'}`}>
                {selData ? fmtPct(selData.changePct) : ''} <span className="label ml-1">24h</span>
              </span>
            </div>
            <div className="mt-4 h-[380px] w-full border-t border-white/5 bg-black/30">
              {selMeta && market?.mode === 'live' ? (
                <iframe
                  key={selMeta.tvSymbol}
                  title="TradingView Chart"
                  className="h-full w-full"
                  src={`https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(selMeta.tvSymbol)}&interval=15&theme=dark&style=1&locale=de&hidesidetoolbar=1&hidetoptoolbar=0&saveimage=0&toolbarbg=0A0A0F`}
                />
              ) : (
                <div className="grid h-full place-items-center px-8 text-center">
                  <div>
                    <div className="text-3xl">📡</div>
                    <p className="mt-3 text-sm text-ink-dim">
                      Der TradingView-Chart benötigt eine Internetverbindung.
                    </p>
                    <p className="mt-1 text-xs text-ink-faint">
                      Sobald Live-Kurse verfügbar sind, erscheint er hier automatisch — bis dahin zeigt der lokale
                      Live-Chart darunter den Simulator-Kurs.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="px-6 py-5" delay={0.15}>
            <div className="label mb-4">Lokaler Live-Chart · {selMeta?.name ?? ''} (Tick-Daten)</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="localChart" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#55556A', fontSize: 10, fontFamily: 'monospace' }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    minTickGap={60}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: '#55556A', fontSize: 10, fontFamily: 'monospace' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => fmtPrice(v)}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(10,10,15,0.95)',
                      border: '1px solid rgba(139,92,246,0.4)',
                      borderRadius: 12,
                      fontFamily: 'monospace',
                      fontSize: 12,
                    }}
                    labelStyle={{ color: '#8A8A9E' }}
                    formatter={(v) => [fmtPrice(Number(v)), 'Kurs']}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={lineColor}
                    strokeWidth={2}
                    fill="url(#localChart)"
                    isAnimationActive={false}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* News */}
        <GlassCard className="flex max-h-[860px] flex-col px-6 py-5" delay={0.2}>
          <div className="label mb-4">News-Feed</div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {(news?.items ?? []).map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className={`block rounded-xl border border-white/5 bg-white/[0.02] p-3.5 transition-all duration-200 hover:border-violet-glow/30 hover:bg-violet-glow/5 ${
                  item.offline ? 'pointer-events-none' : ''
                }`}
              >
                <p className="text-sm leading-snug text-ink">{item.title}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="label !text-[9px] text-violet-soft/70">{item.source}</span>
                  <span className="num text-[10px] text-ink-faint">{fmtTime(item.publishedAt)}</span>
                </div>
              </a>
            ))}
            {!news && <p className="text-sm text-ink-faint">Lade News …</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
