/* ============================================
   Animations - Partikel, Konfetti, UI-Effekte
   ============================================ */

const Animations = (() => {
  let particles = [];
  let animFrame = null;
  let canvas, ctx;

  const init = () => {
    canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;';
    document.body.appendChild(canvas);

    resize();
    window.addEventListener('resize', resize);
    initParticles();
    animate();
  };

  const resize = () => {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');
  };

  const initParticles = () => {
    particles = [];
    const count = Math.min(window.innerWidth / 15, 80);
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  };

  const createParticle = (x, y) => {
    const colors = ['rgba(99,102,241,', 'rgba(168,85,247,', 'rgba(6,182,212,', 'rgba(16,185,129,'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return {
      x: x || Math.random() * (canvas?.width || window.innerWidth),
      y: y || Math.random() * (canvas?.height || window.innerHeight),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      color,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.02 + Math.random() * 0.03
    };
  };

  const animate = () => {
    animFrame = requestAnimationFrame(animate);
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.twinkle += p.twinkleSpeed;

      const alpha = p.alpha * (0.7 + 0.3 * Math.sin(p.twinkle));

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + alpha + ')';
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(99,102,241,${0.05 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  };

  // Toast Benachrichtigungen
  const showToast = (message, type = 'info', duration = 3000) => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // Konfetti
  const launchConfetti = (count = 60) => {
    const colors = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const shapes = ['circle', 'square', 'triangle'];

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';

        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const startX = Math.random() * window.innerWidth;
        const duration = 2000 + Math.random() * 2000;
        const size = 8 + Math.random() * 8;

        piece.style.cssText = `
          left: ${startX}px;
          top: -20px;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border-radius: ${shape === 'circle' ? '50%' : shape === 'triangle' ? '0' : '2px'};
          animation-duration: ${duration}ms;
          transform: rotate(${Math.random() * 360}deg);
        `;

        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), duration + 100);
      }, i * 30);
    }
  };

  // Celebration overlay
  const celebrate = (emoji = '🎉', text = 'Super!') => {
    const cel = document.getElementById('celebration');
    const celEmoji = document.getElementById('celebration-emoji');
    const celText = document.getElementById('celebration-text');

    if (!cel) return;

    celEmoji.textContent = emoji;
    celText.textContent = text;
    cel.classList.remove('hidden');

    launchConfetti(50);

    setTimeout(() => {
      cel.classList.add('hidden');
    }, 2500);
  };

  // Answer feedback animation
  const showAnswerFeedback = (element, correct) => {
    element.classList.add(correct ? 'correct-flash' : 'wrong-flash');

    // Add CSS dynamically
    const style = document.createElement('style');
    style.textContent = `
      @keyframes correct-flash-anim {
        0% { border-color: var(--border); }
        50% { border-color: var(--success); box-shadow: 0 0 20px rgba(16,185,129,0.4); }
        100% { border-color: var(--border); }
      }
      @keyframes wrong-flash-anim {
        0% { border-color: var(--border); }
        25% { border-color: var(--danger); transform: translateX(-5px); }
        75% { border-color: var(--danger); transform: translateX(5px); }
        100% { border-color: var(--border); transform: translateX(0); }
      }
      .correct-flash { animation: correct-flash-anim 0.6s ease; }
      .wrong-flash { animation: wrong-flash-anim 0.5s ease; }
    `;
    if (!document.getElementById('feedback-styles')) {
      style.id = 'feedback-styles';
      document.head.appendChild(style);
    }

    setTimeout(() => {
      element.classList.remove('correct-flash', 'wrong-flash');
    }, 600);
  };

  // Points popup
  const showPointsPopup = (points, x, y) => {
    const popup = document.createElement('div');
    popup.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-size: 1.2rem;
      font-weight: 800;
      color: ${points > 0 ? '#10b981' : '#ef4444'};
      pointer-events: none;
      z-index: 1000;
      animation: points-float 1.2s ease forwards;
      text-shadow: 0 2px 8px rgba(0,0,0,0.5);
    `;
    popup.textContent = (points > 0 ? '+' : '') + points + ' Punkte';

    const style = document.createElement('style');
    style.textContent = `
      @keyframes points-float {
        0% { opacity: 1; transform: translateY(0) scale(0.8); }
        50% { opacity: 1; transform: translateY(-30px) scale(1.1); }
        100% { opacity: 0; transform: translateY(-60px) scale(1); }
      }
    `;
    if (!document.getElementById('points-float-style')) {
      style.id = 'points-float-style';
      document.head.appendChild(style);
    }

    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1300);
  };

  // Splash screen ausblenden
  const hideSplash = () => {
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) {
        splash.classList.add('fade-out');
        setTimeout(() => splash.remove(), 600);
      }
    }, 2200);
  };

  // Motivational quotes
  const QUOTES = [
    'Bildung ist nicht das Füllen eines Eimers, sondern das Entzünden eines Feuers.',
    'Jeder Tag ist eine neue Chance zu lernen!',
    'Wiederholung ist die Mutter des Lernens.',
    'Wer aufhört zu lernen, ist alt, ob mit 20 oder 80.',
    'Der Weg zu Wissen führt durch Fehler – mach weiter!',
    'Eine Stunde Lernen heute ist eine Stunde Freiheit morgen.',
    'Disziplin ist die Brücke zwischen Zielen und Erfolg.',
    'Du bist heute klüger als gestern! 🧠',
    'Klein anfangen, groß denken, immer lernen!',
    'Fehler sind Beweise dafür, dass du es versuchst!',
  ];

  const getQuote = () => QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return { init, showToast, celebrate, launchConfetti, showAnswerFeedback, showPointsPopup, hideSplash, getQuote };
})();
