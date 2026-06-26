/* ============================================
   Wahrscheinlichkeit - Vierfeldertafel & Baumdiagramm
   ============================================ */

const Probability = (() => {

  // ===== BAUMDIAGRAMM =====
  const drawTree = (canvasId, data) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth || 700;
    canvas.height = 360;
    const W = canvas.width, H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(10,10,15,0.95)';
    ctx.fillRect(0, 0, W, H);

    const { root, branches } = data;
    const startX = 60, midX = W * 0.42, endX = W - 60;
    const branchCount = branches.reduce((s, b) => s + b.children.length, 0);
    const rowH = Math.min(70, (H - 40) / branchCount);

    let rowIndex = 0;
    branches.forEach((branch, bi) => {
      const midY = (branch.children.reduce((s, _, ci) => {
        const idx = branches.slice(0, bi).reduce((s2, b2) => s2 + b2.children.length, 0) + ci;
        return s + (40 + idx * rowH + rowH / 2);
      }, 0)) / branch.children.length;

      const startY = H / 2;

      // Erste Ebene
      drawBranch(ctx, startX, startY, midX, midY, branch.label, branch.prob, '#6366f1');

      // Zweite Ebene
      branch.children.forEach((child, ci) => {
        const childIdx = branches.slice(0, bi).reduce((s, b2) => s + b2.children.length, 0) + ci;
        const endY = 40 + childIdx * rowH + rowH / 2;

        drawBranch(ctx, midX, midY, endX, endY, child.label, child.prob, '#a855f7');

        // Endergebnis
        const result = (branch.prob * child.prob).toFixed(4);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`P = ${result}`, endX + 8, endY + 4);
        rowIndex++;
      });
    });

    // Wurzel
    ctx.beginPath();
    ctx.arc(startX, H / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();

    if (root) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(root, startX - 10, H / 2 + 4);
    }
  };

  const drawBranch = (ctx, x1, y1, x2, y2, label, prob, color) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x2, y2, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(label, mx, my - 7);

    ctx.fillStyle = 'rgba(6,182,212,0.9)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText(prob % 1 === 0 ? prob : prob.toFixed ? prob.toFixed(3) : prob, mx, my + 10);
  };

  // ===== VIERFELDERTAFEL =====
  const drawVierfeldertafel = (canvasId, data) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = Math.min(canvas.parentElement.clientWidth || 600, 600);
    canvas.height = 260;
    const W = canvas.width, H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(10,10,15,0.95)';
    ctx.fillRect(0, 0, W, H);

    const { rowLabels, colLabels, values, total } = data;
    const cellW = (W - 160) / 3, cellH = (H - 60) / 3;
    const startX = 140, startY = 50;

    const drawCell = (x, y, w, h, text, bg, textColor = 'rgba(255,255,255,0.9)') => {
      ctx.fillStyle = bg;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = textColor;
      ctx.font = 'bold 13px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(text, x + w / 2, y + h / 2 + 5);
    };

    // Header Row
    const colHeaderBg = 'rgba(99,102,241,0.3)';
    drawCell(startX, startY, cellW, cellH, colLabels[0], colHeaderBg);
    drawCell(startX + cellW, startY, cellW, cellH, colLabels[1], colHeaderBg);
    drawCell(startX + 2 * cellW, startY, cellW, cellH, 'Gesamt', 'rgba(99,102,241,0.5)');

    // Rows
    const rowBg = ['rgba(168,85,247,0.15)', 'rgba(168,85,247,0.1)'];
    const rowHeaderBg = 'rgba(168,85,247,0.3)';

    for (let r = 0; r < 2; r++) {
      // Row header
      ctx.fillStyle = rowHeaderBg;
      ctx.fillRect(startX - cellW, startY + (r + 1) * cellH, cellW, cellH);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.strokeRect(startX - cellW, startY + (r + 1) * cellH, cellW, cellH);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 13px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(rowLabels[r], startX - cellW / 2, startY + (r + 1) * cellH + cellH / 2 + 5);

      const rowSum = values[r][0] + values[r][1];
      for (let c = 0; c < 2; c++) {
        drawCell(startX + c * cellW, startY + (r + 1) * cellH, cellW, cellH,
          values[r][c].toString(), rowBg[r]);
      }
      drawCell(startX + 2 * cellW, startY + (r + 1) * cellH, cellW, cellH,
        rowSum.toString(), 'rgba(6,182,212,0.2)');
    }

    // Gesamtzeile
    const totalRow = 'rgba(6,182,212,0.3)';
    ctx.fillStyle = totalRow;
    ctx.fillRect(startX - cellW, startY + 3 * cellH, cellW, cellH);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(startX - cellW, startY + 3 * cellH, cellW, cellH);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 13px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Gesamt', startX - cellW / 2, startY + 3 * cellH + cellH / 2 + 5);

    const col0Sum = values[0][0] + values[1][0];
    const col1Sum = values[0][1] + values[1][1];
    drawCell(startX, startY + 3 * cellH, cellW, cellH, col0Sum.toString(), totalRow);
    drawCell(startX + cellW, startY + 3 * cellH, cellW, cellH, col1Sum.toString(), totalRow);
    drawCell(startX + 2 * cellW, startY + 3 * cellH, cellW, cellH, total.toString(), 'rgba(6,182,212,0.5)');

    // Wahrscheinlichkeiten anzeigen
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(`P(${rowLabels[0]}|${colLabels[0]}) = ${(values[0][0]/col0Sum).toFixed(3)}`, 10, H - 35);
    ctx.fillText(`P(${rowLabels[0]}|${colLabels[1]}) = ${(values[0][1]/col1Sum).toFixed(3)}`, 10, H - 18);
  };

  // Aufgabengenerator
  const generateTreeProblem = () => {
    const scenarios = [
      {
        context: 'Eine Urne enthält 4 rote und 6 blaue Kugeln. Es wird zweimal gezogen (mit Zurücklegen).',
        root: 'Start',
        branches: [
          { label: 'Rot', prob: 0.4, children: [
            { label: 'Rot', prob: 0.4 },
            { label: 'Blau', prob: 0.6 }
          ]},
          { label: 'Blau', prob: 0.6, children: [
            { label: 'Rot', prob: 0.4 },
            { label: 'Blau', prob: 0.6 }
          ]}
        ],
        questions: [
          { q: 'Wie groß ist die Wahrscheinlichkeit, zweimal Rot zu ziehen?', a: '0.16', steps: ['P(R,R) = P(R) × P(R)', '= 0,4 × 0,4', '= 0,16'] },
          { q: 'Wie groß ist die Wahrscheinlichkeit, genau eine rote Kugel zu ziehen?', a: '0.48', steps: ['P(R,B) + P(B,R)', '= 0,4×0,6 + 0,6×0,4', '= 0,24 + 0,24', '= 0,48'] }
        ]
      },
      {
        context: 'Ein Würfel wird zweimal geworfen. Ereignis A: Augenzahl > 4 (P = 1/3). Ereignis B: gerade Zahl (P = 1/2).',
        root: 'Wurf 1',
        branches: [
          { label: '>4', prob: 0.333, children: [
            { label: '>4', prob: 0.333 },
            { label: '≤4', prob: 0.667 }
          ]},
          { label: '≤4', prob: 0.667, children: [
            { label: '>4', prob: 0.333 },
            { label: '≤4', prob: 0.667 }
          ]}
        ],
        questions: [
          { q: 'Wahrscheinlichkeit: Beide Male >4?', a: '0.111', steps: ['P = 1/3 × 1/3 = 1/9 ≈ 0,111'] },
          { q: 'Wahrscheinlichkeit: Mindestens einmal >4?', a: '0.556', steps: ['P = 1 - P(kein >4)', '= 1 - (2/3)² = 1 - 4/9 = 5/9 ≈ 0,556'] }
        ]
      },
      {
        context: 'Bei einer Prüfung bestehen 70% der Schüler. Wer besteht, hat 90% Chance auf Note gut. Wer nicht besteht, hat 10% Chance auf Note gut.',
        root: 'Schüler',
        branches: [
          { label: 'Bestanden', prob: 0.7, children: [
            { label: 'Gut', prob: 0.9 },
            { label: 'Nicht gut', prob: 0.1 }
          ]},
          { label: 'Nicht bestanden', prob: 0.3, children: [
            { label: 'Gut', prob: 0.1 },
            { label: 'Nicht gut', prob: 0.9 }
          ]}
        ],
        questions: [
          { q: 'P(Bestanden UND Note Gut)?', a: '0.63', steps: ['P = 0,7 × 0,9 = 0,63'] },
          { q: 'P(Note Gut) gesamt? (Satz der totalen Wahrscheinlichkeit)', a: '0.66', steps: ['P(Gut) = P(Best.)×P(Gut|Best.) + P(n.Best.)×P(Gut|n.Best.)', '= 0,7×0,9 + 0,3×0,1', '= 0,63 + 0,03 = 0,66'] }
        ]
      }
    ];
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  };

  const generateVierfeldertafel = () => {
    const scenarios = [
      {
        title: 'Medizinischer Test',
        rowLabels: ['Krank', 'Gesund'],
        colLabels: ['Test +', 'Test -'],
        values: [[90, 10], [20, 880]],
        total: 1000,
        context: 'In einer Studie mit 1000 Personen sind 100 krank. Der Test ist bei 90% der Kranken positiv und bei 2% der Gesunden falsch-positiv.'
      },
      {
        title: 'Klassenarbeit',
        rowLabels: ['Gelernt', 'Nicht gelernt'],
        colLabels: ['Bestanden', 'Nicht bestanden'],
        values: [[40, 5], [10, 15]],
        total: 70,
        context: 'In einer Klasse mit 70 Schülern haben 45 für die Arbeit gelernt.'
      },
      {
        title: 'Sport & Leistung',
        rowLabels: ['Sportlich', 'Nicht sportlich'],
        colLabels: ['Gute Noten', 'Schlechte Noten'],
        values: [[35, 15], [20, 30]],
        total: 100,
        context: 'Studie mit 100 Schülern: 50 sind sportlich aktiv.'
      }
    ];
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  };

  // Grundlegende Wahrscheinlichkeitsaufgaben
  const generateBasicProbability = () => {
    const exercises = [
      {
        question: 'Ein Würfel wird geworfen. Wie groß ist P(gerade Zahl)?',
        answer: '0.5|1/2|3/6',
        hint: 'Gerade Zahlen: 2, 4, 6 → 3 von 6 Seiten',
        steps: ['Günstige Ergebnisse: {2, 4, 6} → 3', 'Alle Ergebnisse: {1,2,3,4,5,6} → 6', 'P = 3/6 = 1/2 = 0,5'],
        topic: 'Wahrscheinlichkeit'
      },
      {
        question: 'Aus 10 Losen (3 Gewinne) wird eines gezogen. Wie groß ist P(Gewinn)?',
        answer: '0.3|3/10',
        hint: 'P = günstige Fälle / alle Fälle',
        steps: ['Günstige Fälle: 3 Gewinnlose', 'Alle Fälle: 10 Lose', 'P(Gewinn) = 3/10 = 0,3'],
        topic: 'Wahrscheinlichkeit'
      },
      {
        question: 'Gegenwahrscheinlichkeit: P(A) = 0,35. Berechne P(Ā).',
        answer: '0.65',
        hint: 'P(Ā) = 1 - P(A)',
        steps: ['P(Ā) = 1 - P(A)', '= 1 - 0,35', '= 0,65'],
        topic: 'Wahrscheinlichkeit'
      },
      {
        question: 'Zwei unabhängige Ereignisse: P(A) = 0,4 und P(B) = 0,3.\nWie groß ist P(A ∩ B)?',
        answer: '0.12',
        hint: 'Unabhängige Ereignisse: P(A ∩ B) = P(A) × P(B)',
        steps: ['P(A ∩ B) = P(A) × P(B)', '= 0,4 × 0,3', '= 0,12'],
        topic: 'Wahrscheinlichkeit'
      },
      {
        question: 'Additionssatz: P(A) = 0,5, P(B) = 0,4, P(A ∩ B) = 0,2.\nWie groß ist P(A ∪ B)?',
        answer: '0.7',
        hint: 'P(A ∪ B) = P(A) + P(B) - P(A ∩ B)',
        steps: ['P(A ∪ B) = P(A) + P(B) - P(A ∩ B)', '= 0,5 + 0,4 - 0,2', '= 0,7'],
        topic: 'Wahrscheinlichkeit'
      },
      {
        question: 'Bedingte Wahrscheinlichkeit: P(A) = 0,4, P(B|A) = 0,5.\nWie groß ist P(A ∩ B)?',
        answer: '0.2',
        hint: 'P(A ∩ B) = P(A) × P(B|A)',
        steps: ['P(A ∩ B) = P(A) × P(B|A)', '= 0,4 × 0,5', '= 0,2'],
        topic: 'Wahrscheinlichkeit'
      },
      {
        question: 'Binomialkoeffizient: Wie viele Möglichkeiten gibt es, aus 5 Schülern 2 auszuwählen?\nC(5,2) = ?',
        answer: '10',
        hint: 'C(n,k) = n! / (k! × (n-k)!)',
        steps: ['C(5,2) = 5! / (2! × 3!)', '= (5×4) / (2×1)', '= 20 / 2 = 10'],
        topic: 'Wahrscheinlichkeit'
      }
    ];
    return exercises[Math.floor(Math.random() * exercises.length)];
  };

  return { drawTree, drawVierfeldertafel, generateTreeProblem, generateVierfeldertafel, generateBasicProbability };
})();
