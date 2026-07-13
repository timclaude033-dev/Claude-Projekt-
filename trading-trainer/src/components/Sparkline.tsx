import { useId } from 'react';
import type { PricePoint } from '../lib/api';

interface Props {
  data: PricePoint[];
  positive: boolean;
  width?: number;
  height?: number;
}

/** Leichtgewichtige SVG-Sparkline für Watchlist-Karten. */
export function Sparkline({ data, positive, width = 120, height = 36 }: Props) {
  const gid = useId();
  if (data.length < 2) return <div style={{ width, height }} />;

  const ps = data.map((d) => d.p);
  const min = Math.min(...ps);
  const max = Math.max(...ps);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 3 - ((d.p - min) / range) * (height - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const color = positive ? '#00FF9D' : '#FF3B5C';

  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts.join(' ')} ${width},${height}`} fill={`url(#${gid})`} />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
      />
    </svg>
  );
}
