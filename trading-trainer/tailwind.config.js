/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0A0A0F',
        panel: 'rgba(255,255,255,0.03)',
        profit: '#00FF9D',
        loss: '#FF3B5C',
        violet: {
          glow: '#8B5CF6',
          soft: '#A78BFA',
        },
        ink: {
          DEFAULT: '#E8E8F0',
          dim: '#8A8A9E',
          faint: '#55556A',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 24px 64px -16px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow-green': '0 0 24px rgba(0,255,157,0.25), 0 0 64px rgba(0,255,157,0.08)',
        'glow-red': '0 0 24px rgba(255,59,92,0.25), 0 0 64px rgba(255,59,92,0.08)',
        'glow-violet': '0 0 32px rgba(139,92,246,0.35), 0 0 96px rgba(139,92,246,0.12)',
      },
      keyframes: {
        gridMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '48px 48px' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        gridMove: 'gridMove 6s linear infinite',
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
