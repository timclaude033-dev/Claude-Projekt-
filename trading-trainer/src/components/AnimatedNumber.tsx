import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Props {
  value: number;
  format: (v: number) => string;
  className?: string;
  /** Bei Änderung kurz grün/rot aufleuchten lassen */
  flash?: boolean;
}

/** Zahl, die beim Kursupdate weich hoch-/runterzählt (Monospace). */
export function AnimatedNumber({ value, format, className = '', flash = false }: Props) {
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 90, damping: 22, mass: 0.6 });
  const display = useTransform(spring, (v) => format(v));
  const prev = useRef(value);
  const [flashDir, setFlashDir] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (value !== prev.current) {
      if (flash) {
        setFlashDir(value > prev.current ? 'up' : 'down');
        const t = setTimeout(() => setFlashDir(null), 700);
        prev.current = value;
        mv.set(value);
        return () => clearTimeout(t);
      }
      prev.current = value;
    }
    mv.set(value);
  }, [value, mv, flash]);

  const flashClass =
    flashDir === 'up'
      ? 'text-profit drop-shadow-[0_0_12px_rgba(0,255,157,0.6)]'
      : flashDir === 'down'
        ? 'text-loss drop-shadow-[0_0_12px_rgba(255,59,92,0.6)]'
        : '';

  return (
    <motion.span className={`num transition-colors duration-500 ${flashClass} ${className}`}>
      {display}
    </motion.span>
  );
}
