/* ============================================
   Funktionsplotter - Canvas-basierter Grapher
   ============================================ */

const Plotter = (() => {
  let canvas, ctx;
  let xMin = -10, xMax = 10, yMin = -10, yMax = 10;
  let functions = [];
  let isDragging = false, lastMouseX = 0, lastMouseY = 0;

  const COLORS = ['#6366f1','#a855f7','#06b6d4','#10b981','#f59e0b','#ef4444'];

  const init = () => {
    canvas = document.getElementById('plotter-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    setupControls();
    draw();
  };

  const resize = () => {
    if (!canvas) return;
    const container = canvas.parentElement;
    canvas.width = container.clientWidth || 700;
    canvas.height = 420;
    draw();
  };

  // Koordinaten-Umrechnung
  const toCanvas = (x, y) => ({
    cx: ((x - xMin) / (xMax - xMin)) * canvas.width,
    cy: canvas.height - ((y - yMin) / (yMax - yMin)) * canvas.height
  });

  const toMath = (cx, cy) => ({
    x: xMin + (cx / canvas.width) * (xMax - xMin),
    y: yMin + ((canvas.height - cy) / canvas.height) * (yMax - yMin)
  });

  // Sichere Formel-Auswertung
  const evalFunc = (expr, x) => {
    try {
      const cleaned = expr
        .replace(/\^/g, '**')
        .replace(/(\d)(x)/g, '$1*$2')
        .replace(/(\d)\(/, '$1*(')
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bpi\b/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E')
        .replace(/\bln\b/g, 'Math.log')
        .replace(/\blog\b/g, 'Math.log10');
      // eslint-disable-next-line no-new-func
      return Function('"use strict"; const x = ' + x + '; return (' + cleaned + ');')();
    } catch { return NaN; }
  };

  const draw = () => {
    if (!ctx || !canvas) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Hintergrund
    ctx.fillStyle = 'rgba(10,10,15,0.95)';
    ctx.fillRect(0, 0, W, H);

    drawGrid();
    drawAxes();
    functions.forEach((fn, i) => drawFunction(fn.expr, COLORS[i % COLORS.length]));
  };

  const drawGrid = () => {
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;

    const stepX = niceStep((xMax - xMin) / 10);
    const stepY = niceStep((yMax - yMin) / 10);

    for (let x = Math.ceil(xMin / stepX) * stepX; x <= xMax; x += stepX) {
      const { cx } = toCanvas(x, 0);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, canvas.height);
      ctx.stroke();
    }

    for (let y = Math.ceil(yMin / stepY) * stepY; y <= yMax; y += stepY) {
      const { cy } = toCanvas(0, y);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(canvas.width, cy);
      ctx.stroke();
    }
  };

  const drawAxes = () => {
    const { cx: ox, cy: oy } = toCanvas(0, 0);

    // Achsen
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;

    // X-Achse
    ctx.beginPath();
    ctx.moveTo(0, oy);
    ctx.lineTo(canvas.width, oy);
    ctx.stroke();

    // Y-Achse
    ctx.beginPath();
    ctx.moveTo(ox, 0);
    ctx.lineTo(ox, canvas.height);
    ctx.stroke();

    // Achsenpfeile
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.moveTo(canvas.width - 5, oy);
    ctx.lineTo(canvas.width - 15, oy - 6);
    ctx.lineTo(canvas.width - 15, oy + 6);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(ox, 5);
    ctx.lineTo(ox - 6, 15);
    ctx.lineTo(ox + 6, 15);
    ctx.fill();

    // Beschriftungen
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';

    const stepX = niceStep((xMax - xMin) / 10);
    const stepY = niceStep((yMax - yMin) / 10);

    for (let x = Math.ceil(xMin / stepX) * stepX; x <= xMax; x += stepX) {
      if (Math.abs(x) < stepX * 0.01) continue;
      const { cx, cy: tickY } = toCanvas(x, 0);
      ctx.fillText(round(x), cx, Math.min(tickY + 18, canvas.height - 4));
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.moveTo(cx, tickY - 4);
      ctx.lineTo(cx, tickY + 4);
      ctx.stroke();
    }

    ctx.textAlign = 'right';
    for (let y = Math.ceil(yMin / stepY) * stepY; y <= yMax; y += stepY) {
      if (Math.abs(y) < stepY * 0.01) continue;
      const { cx: tickX, cy } = toCanvas(0, y);
      ctx.fillText(round(y), Math.max(tickX - 6, 30), cy + 4);
    }

    // Achsennamen
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 13px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('x', canvas.width - 15, oy - 12);
    ctx.fillText('y', ox + 10, 18);
    ctx.fillText('0', Math.min(ox + 6, canvas.width - 20), Math.max(oy + 16, 16));
  };

  const drawFunction = (expr, color) => {
    if (!expr) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;

    const steps = canvas.width * 2;
    let started = false;
    let prevY = null;

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = evalFunc(expr, x);

      if (isNaN(y) || !isFinite(y)) {
        started = false;
        prevY = null;
        continue;
      }

      // Sprünge erkennen (Asymptoten)
      if (prevY !== null && Math.abs(y - prevY) > (yMax - yMin) * 3) {
        started = false;
      }
      prevY = y;

      const { cx, cy } = toCanvas(x, y);
      if (!started) { ctx.moveTo(cx, cy); started = true; }
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  // Nullstellen berechnen (Bisektionsverfahren + Newton)
  const findZeros = (expr) => {
    const zeros = [];
    const steps = 2000;
    const dx = (xMax - xMin) / steps;

    for (let i = 0; i < steps; i++) {
      const x1 = xMin + i * dx;
      const x2 = x1 + dx;
      const y1 = evalFunc(expr, x1);
      const y2 = evalFunc(expr, x2);

      if (isNaN(y1) || isNaN(y2)) continue;

      if (y1 * y2 <= 0) {
        // Bisektionsverfahren
        let lo = x1, hi = x2;
        for (let iter = 0; iter < 50; iter++) {
          const mid = (lo + hi) / 2;
          const ymid = evalFunc(expr, mid);
          if (Math.abs(ymid) < 1e-10) { lo = mid; break; }
          if (evalFunc(expr, lo) * ymid < 0) hi = mid;
          else lo = mid;
        }
        const zero = (lo + hi) / 2;
        if (!zeros.some(z => Math.abs(z - zero) < 0.001)) {
          zeros.push(zero);
        }
      }
    }
    return zeros.map(z => round(z, 4));
  };

  // Extremstellen (numerisch)
  const findExtrema = (expr) => {
    const extrema = [];
    const steps = 1000;
    const dx = (xMax - xMin) / steps;
    const h = 1e-5;

    for (let i = 1; i < steps - 1; i++) {
      const x = xMin + i * dx;
      const dy1 = (evalFunc(expr, x) - evalFunc(expr, x - dx)) / dx;
      const dy2 = (evalFunc(expr, x + dx) - evalFunc(expr, x)) / dx;

      if (dy1 * dy2 < 0) {
        const y = evalFunc(expr, x);
        const d2 = (evalFunc(expr, x + h) - 2 * evalFunc(expr, x) + evalFunc(expr, x - h)) / (h * h);
        extrema.push({ x: round(x, 3), y: round(y, 3), type: d2 > 0 ? 'Tiefpunkt' : 'Hochpunkt' });
      }
    }
    return extrema;
  };

  // Nullstellen auf Graph markieren
  const markZeros = (expr) => {
    const zeros = findZeros(expr);
    zeros.forEach(z => {
      const { cx, cy } = toCanvas(z, 0);
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`x=${z}`, cx, cy - 12);
    });
    return zeros;
  };

  const niceStep = (rough) => {
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const frac = rough / pow;
    if (frac < 1.5) return pow;
    if (frac < 3.5) return 2 * pow;
    if (frac < 7.5) return 5 * pow;
    return 10 * pow;
  };

  const round = (n, dec = 2) => {
    const f = Math.pow(10, dec);
    return Math.round(n * f) / f;
  };

  const addFunction = (expr) => {
    if (!expr) return;
    functions.push({ expr });
    draw();
    // Nullstellen nach dem Draw markieren
    const zeros = markZeros(expr);
    return { zeros, extrema: findExtrema(expr) };
  };

  const clearFunctions = () => {
    functions = [];
    draw();
  };

  const removeFunction = (index) => {
    functions.splice(index, 1);
    draw();
  };

  const setRange = (xmin, xmax, ymin, ymax) => {
    xMin = xmin; xMax = xmax; yMin = ymin; yMax = ymax;
    draw();
  };

  const zoom = (factor, cx, cy) => {
    const { x, y } = toMath(cx || canvas.width/2, cy || canvas.height/2);
    const dx = (xMax - xMin) * factor / 2;
    const dy = (yMax - yMin) * factor / 2;
    xMin = x - dx; xMax = x + dx;
    yMin = y - dy; yMax = y + dy;
    draw();
    functions.forEach(fn => markZeros(fn.expr));
  };

  const setupControls = () => {
    if (!canvas) return;

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      zoom(e.deltaY > 0 ? 1.15 : 0.85, e.clientX - rect.left, e.clientY - rect.top);
    });

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = (e.clientX - lastMouseX) / canvas.width * (xMax - xMin);
      const dy = (e.clientY - lastMouseY) / canvas.height * (yMax - yMin);
      xMin -= dx; xMax -= dx;
      yMin += dy; yMax += dy;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      draw();
      functions.forEach(fn => markZeros(fn.expr));
    });

    canvas.addEventListener('mouseup', () => isDragging = false);
    canvas.addEventListener('mouseleave', () => isDragging = false);
  };

  return { init, addFunction, clearFunctions, removeFunction, setRange, zoom, findZeros, findExtrema, draw, markZeros };
})();
