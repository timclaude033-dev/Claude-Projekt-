import { AnimatedNumber } from './AnimatedNumber';
import { GlassCard } from './GlassCard';

interface Props {
  label: string;
  value: number;
  format: (v: number) => string;
  tone?: 'neutral' | 'profit' | 'loss' | 'violet';
  sub?: string;
  delay?: number;
  flash?: boolean;
}

const toneClass: Record<string, string> = {
  neutral: 'text-ink',
  profit: 'text-profit drop-shadow-[0_0_16px_rgba(0,255,157,0.35)]',
  loss: 'text-loss drop-shadow-[0_0_16px_rgba(255,59,92,0.35)]',
  violet: 'text-violet-soft drop-shadow-[0_0_16px_rgba(139,92,246,0.4)]',
};

export function StatTile({ label, value, format, tone = 'neutral', sub, delay = 0, flash }: Props) {
  return (
    <GlassCard className="px-5 py-4" delay={delay}>
      <div className="label">{label}</div>
      <div className={`mt-1.5 text-[26px] font-bold leading-none ${toneClass[tone]}`}>
        <AnimatedNumber value={value} format={format} flash={flash} />
      </div>
      {sub && <div className="mt-1.5 text-xs text-ink-faint">{sub}</div>}
    </GlassCard>
  );
}
