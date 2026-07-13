/** Subtiles animiertes Grid + violette Glow-Nebel im Seitenhintergrund. */
export function GridBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0 animate-gridMove"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="absolute -top-40 left-1/4 h-[480px] w-[640px] rounded-full opacity-25 blur-[140px]"
        style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-48 right-0 h-[420px] w-[560px] rounded-full opacity-15 blur-[140px]"
        style={{ background: 'radial-gradient(circle, #00FF9D 0%, transparent 70%)' }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, transparent 0%, #0A0A0F 78%)',
        }}
      />
    </div>
  );
}
