import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '◧' },
  { to: '/trading', label: 'Paper Trading', icon: '⇄' },
  { to: '/journal', label: 'Journal', icon: '▤' },
  { to: '/ki', label: 'KI-Einschätzung', icon: '◈' },
  { to: '/lernen', label: 'Lernbereich', icon: '✦' },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="px-6 pb-8 pt-7">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-violet-glow to-violet-soft shadow-glow-violet">
            <span className="absolute inset-0 grid place-items-center font-mono text-lg font-bold text-black">N</span>
          </div>
          <div>
            <div className="font-mono text-sm font-bold tracking-tight text-ink">NEON&nbsp;TERMINAL</div>
            <div className="label mt-0.5">Trading Trainer</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}>
            {({ isActive }) => (
              <div
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 ${
                  isActive
                    ? 'text-ink'
                    : 'text-ink-dim hover:translate-x-1 hover:bg-white/[0.04] hover:text-ink'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl border border-violet-glow/40 bg-violet-glow/10 shadow-glow-violet"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={`relative text-base ${isActive ? 'text-violet-soft' : ''}`}>{item.icon}</span>
                <span className="relative font-medium">{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="m-3 rounded-xl border border-profit/20 bg-profit/5 p-4">
        <div className="label text-profit/80">Übungsmodus</div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-dim">
          100&nbsp;% Spielgeld. Kein Broker, kein echtes Geld, keine Anlageberatung.
        </p>
      </div>
    </aside>
  );
}
