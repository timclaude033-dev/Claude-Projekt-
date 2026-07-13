import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'none' | 'violet' | 'green' | 'red';
  onClick?: () => void;
  delay?: number;
}

const glowShadow: Record<string, string> = {
  violet: 'shadow-glow-violet',
  green: 'shadow-glow-green',
  red: 'shadow-glow-red',
  none: '',
};

export function GlassCard({ children, className = '', hover = false, glow = 'none', onClick, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={`glass ${hover ? 'glass-hover cursor-pointer' : ''} ${glowShadow[glow]} ${className}`}
    >
      {children}
    </motion.div>
  );
}
