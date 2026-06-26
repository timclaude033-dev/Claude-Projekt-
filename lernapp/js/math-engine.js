/* ============================================
   Math Engine - Aufgabengenerator & Prüfer
   ============================================ */

const MathEngine = (() => {

  const TOPICS = [
    { id: 'basics', label: '➕ Grundrechenarten', difficulty: 1 },
    { id: 'fractions', label: '½ Bruchrechnung', difficulty: 2 },
    { id: 'percent', label: '% Prozentrechnung', difficulty: 2 },
    { id: 'algebra', label: '🔡 Algebra', difficulty: 3 },
    { id: 'powers', label: '² Potenzen', difficulty: 2 },
    { id: 'roots', label: '√ Wurzeln', difficulty: 2 },
    { id: 'geometry', label: '📐 Geometrie', difficulty: 3 },
    { id: 'statistics', label: '📊 Statistik', difficulty: 2 },
    { id: 'equations', label: '= Gleichungen', difficulty: 3 },
    { id: 'wordproblems', label: '📖 Textaufgaben', difficulty: 3 },
    { id: 'functions', label: '📈 Funktionen', difficulty: 3 },
    { id: 'nullstellen', label: '✕ Nullstellen', difficulty: 3 },
    { id: 'probability', label: '🎲 Wahrscheinlichkeit', difficulty: 2 },
    { id: 'combinatorics', label: '🔢 Kombinatorik', difficulty: 3 },
    { id: 'trigonometry', label: '📐 Trigonometrie', difficulty: 3 },
    { id: 'analysis', label: '∫ Analysis', difficulty: 4 },
  ];

  let currentExercise = null;
  let currentTopic = null;
  let hintShown = false;

  // Zufallszahl im Bereich
  const rand = (min, max, step = 1) => {
    const range = Math.floor((max - min) / step) + 1;
    return min + Math.floor(Math.random() * range) * step;
  };

  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const lcm = (a, b) => (a * b) / gcd(a, b);

  const simplifyFraction = (n, d) => {
    const g = gcd(Math.abs(n), Math.abs(d));
    return [n / g, d / g];
  };

  // Aufgabengeneratoren pro Thema
  const generators = {
    basics: () => {
      const ops = ['+', '-', '×', '÷'];
      const op = ops[rand(0, 3)];
      let a, b, answer, question, steps;

      switch (op) {
        case '+':
          a = rand(10, 999); b = rand(10, 999);
          answer = (a + b).toString();
          question = `Berechne: **${a} + ${b}** = ?`;
          steps = [`${a} + ${b}`, `= ${a + b}`];
          break;
        case '-':
          a = rand(100, 999); b = rand(10, a);
          answer = (a - b).toString();
          question = `Berechne: **${a} − ${b}** = ?`;
          steps = [`${a} − ${b}`, `= ${a - b}`];
          break;
        case '×':
          a = rand(2, 25); b = rand(2, 25);
          answer = (a * b).toString();
          question = `Berechne: **${a} × ${b}** = ?`;
          steps = [`${a} × ${b}`, `= ${a * b}`];
          break;
        case '÷':
          b = rand(2, 12); answer = rand(2, 20);
          a = b * parseInt(answer);
          question = `Berechne: **${a} ÷ ${b}** = ?`;
          steps = [`${a} ÷ ${b}`, `= ${a / b}`];
          break;
      }
      return { question, answer, hint: `Nutze ${op === '+' ? 'Addition' : op === '-' ? 'Subtraktion' : op === '×' ? 'Multiplikation' : 'Division'} schrittweise`, steps, type: 'number', topic: 'Grundrechenarten' };
    },

    fractions: () => {
      const type = rand(0, 3);
      let a1, a2, b1, b2, answer, question, steps, hint;

      const a = rand(1, 8), b = rand(2, 9), c = rand(1, 8), d = rand(2, 9);

      switch (type) {
        case 0: { // Addition
          const commonD = lcm(b, d);
          const na = a * (commonD / b);
          const nc = c * (commonD / d);
          const sumN = na + nc;
          const [sn, sd] = simplifyFraction(sumN, commonD);
          answer = sd === 1 ? sn.toString() : `${sn}/${sd}`;
          question = `Berechne: **${a}/${b} + ${c}/${d}** = ?`;
          steps = [`Gemeinsamer Nenner: ${commonD}`, `${na}/${commonD} + ${nc}/${commonD}`, `= ${sumN}/${commonD}`, sn !== sumN || sd !== commonD ? `= ${sn}/${sd} (gekürzt)` : ''];
          hint = 'Bringe beide Brüche auf den gleichen Nenner (kgV)';
          break;
        }
        case 1: { // Subtraktion
          const commonD = lcm(b, d);
          const na = a * (commonD / b);
          const nc = c * (commonD / d);
          const diffN = na - nc;
          const [sn, sd] = simplifyFraction(Math.abs(diffN), commonD);
          answer = sd === 1 ? sn.toString() : `${diffN < 0 ? '-' : ''}${sn}/${sd}`;
          question = `Berechne: **${a}/${b} − ${c}/${d}** = ?`;
          steps = [`Gemeinsamer Nenner: ${commonD}`, `${na}/${commonD} − ${nc}/${commonD}`, `= ${diffN}/${commonD}`, `= ${sn}/${sd} (gekürzt)`];
          hint = 'Bringe beide Brüche auf den gleichen Nenner';
          break;
        }
        case 2: { // Multiplikation
          const n = a * c, den = b * d;
          const [sn, sd] = simplifyFraction(n, den);
          answer = sd === 1 ? sn.toString() : `${sn}/${sd}`;
          question = `Berechne: **${a}/${b} × ${c}/${d}** = ?`;
          steps = [`Zähler × Zähler: ${a} × ${c} = ${n}`, `Nenner × Nenner: ${b} × ${d} = ${den}`, `= ${n}/${den}`, `= ${sn}/${sd} (gekürzt)`];
          hint = 'Zähler mit Zähler, Nenner mit Nenner multiplizieren';
          break;
        }
        case 3: { // Division
          const n = a * d, den = b * c;
          const [sn, sd] = simplifyFraction(n, den);
          answer = sd === 1 ? sn.toString() : `${sn}/${sd}`;
          question = `Berechne: **${a}/${b} ÷ ${c}/${d}** = ?`;
          steps = [`Kehrwert des 2. Bruchs: ${d}/${c}`, `${a}/${b} × ${d}/${c}`, `= ${n}/${den}`, `= ${sn}/${sd} (gekürzt)`];
          hint = 'Division = Multiplikation mit dem Kehrwert';
          break;
        }
      }
      return { question, answer, hint, steps, type: 'exact', topic: 'Bruchrechnung' };
    },

    percent: () => {
      const type = rand(0, 2);
      let answer, question, steps, hint;

      switch (type) {
        case 0: { // Prozentwert berechnen
          const G = rand(50, 500, 10);
          const p = rand(5, 75, 5);
          const W = (G * p) / 100;
          answer = W.toString();
          question = `Berechne den **Prozentwert**:\nGrundwert: ${G}, Prozentsatz: ${p}%`;
          steps = [`Formel: W = (G × p) / 100`, `W = (${G} × ${p}) / 100`, `W = ${G * p} / 100`, `W = ${W}`];
          hint = 'Prozentwert W = (Grundwert × Prozentsatz) ÷ 100';
          break;
        }
        case 1: { // Prozentsatz berechnen
          const G = rand(50, 200, 10);
          const W = rand(5, G / 2, 5);
          const p = (W / G) * 100;
          answer = p % 1 === 0 ? p.toString() : p.toFixed(1);
          question = `Berechne den **Prozentsatz**:\nGrundwert: ${G}, Prozentwert: ${W}`;
          steps = [`Formel: p = (W × 100) / G`, `p = (${W} × 100) / ${G}`, `p = ${W * 100} / ${G}`, `p = ${answer}%`];
          hint = 'Prozentsatz p = (Prozentwert × 100) ÷ Grundwert';
          break;
        }
        case 2: { // Grundwert berechnen
          const p = rand(10, 50, 5);
          const W = rand(10, 100, 5);
          const G = (W * 100) / p;
          answer = G % 1 === 0 ? G.toString() : G.toFixed(1);
          question = `Berechne den **Grundwert**:\nProzentwert: ${W}, Prozentsatz: ${p}%`;
          steps = [`Formel: G = (W × 100) / p`, `G = (${W} × 100) / ${p}`, `G = ${W * 100} / ${p}`, `G = ${answer}`];
          hint = 'Grundwert G = (Prozentwert × 100) ÷ Prozentsatz';
          break;
        }
      }
      return { question, answer, hint, steps, type: 'number', topic: 'Prozentrechnung' };
    },

    algebra: () => {
      const type = rand(0, 2);

      if (type === 0) {
        // Einfache lineare Gleichung
        const a = rand(2, 9), b = rand(1, 20), c = rand(b + 1, 50);
        const answer = ((c - b) / a).toString();
        if ((c - b) % a !== 0) return generators.algebra();
        const x = (c - b) / a;
        return {
          question: `Löse die Gleichung: **${a}x + ${b} = ${c}**`,
          answer: x.toString(),
          hint: 'Bringe alle Zahlen auf eine Seite, x auf die andere',
          steps: [`${a}x + ${b} = ${c}`, `${a}x = ${c} − ${b}`, `${a}x = ${c - b}`, `x = ${c - b} / ${a}`, `x = ${x}`],
          type: 'number',
          topic: 'Algebra'
        };
      } else if (type === 1) {
        // Klammer auflösen
        const a = rand(2, 7), b = rand(1, 8), c = rand(1, 8);
        return {
          question: `Multipliziere aus: **${a}(${b}x + ${c})**`,
          answer: `${a * b}x + ${a * c}`,
          hint: 'Multipliziere jeden Term in der Klammer mit dem Faktor davor',
          steps: [`${a} × ${b}x = ${a * b}x`, `${a} × ${c} = ${a * c}`, `= ${a * b}x + ${a * c}`],
          type: 'exact',
          topic: 'Algebra'
        };
      } else {
        // Binomische Formel
        const a = rand(1, 8), b = rand(1, 8);
        return {
          question: `Wende die 1. Binomische Formel an: **(${a} + ${b})²**`,
          answer: `${a * a} + ${2 * a * b} + ${b * b}`,
          hint: '(a+b)² = a² + 2ab + b²',
          steps: [`(${a} + ${b})²`, `= ${a}² + 2·${a}·${b} + ${b}²`, `= ${a * a} + ${2 * a * b} + ${b * b}`],
          type: 'exact',
          topic: 'Algebra'
        };
      }
    },

    powers: () => {
      const type = rand(0, 3);
      if (type === 0) {
        const base = rand(2, 7), exp = rand(2, 4);
        const result = Math.pow(base, exp);
        return { question: `Berechne: **${base}^${exp}** = ?`, answer: result.toString(), hint: `${base}^${exp} = ${base} × ${base} × ... (${exp}-mal)`, steps: Array.from({ length: exp }, (_, i) => `${Array(i+1).fill(base).join(' × ')} = ${Math.pow(base, i+1)}`), type: 'number', topic: 'Potenzen' };
      } else if (type === 1) {
        const base = rand(2, 6), m = rand(1, 4), n = rand(1, 4);
        return { question: `Vereinfache: **${base}^${m} × ${base}^${n}** = ${base}^?`, answer: (m + n).toString(), hint: 'Gleiche Basis: Exponenten addieren!', steps: [`${base}^${m} × ${base}^${n} = ${base}^(${m}+${n}) = ${base}^${m+n}`], type: 'number', topic: 'Potenzen' };
      } else if (type === 2) {
        const base = rand(2, 5), m = rand(3, 6), n = rand(1, m - 1);
        return { question: `Vereinfache: **${base}^${m} ÷ ${base}^${n}** = ${base}^?`, answer: (m - n).toString(), hint: 'Gleiche Basis: Exponenten subtrahieren!', steps: [`${base}^${m} ÷ ${base}^${n} = ${base}^(${m}-${n}) = ${base}^${m-n}`], type: 'number', topic: 'Potenzen' };
      } else {
        const base = rand(2, 5), m = rand(1, 3), n = rand(1, 3);
        return { question: `Vereinfache: **(${base}^${m})^${n}** = ${base}^?`, answer: (m * n).toString(), hint: 'Potenzen potenzieren: Exponenten multiplizieren!', steps: [`(${base}^${m})^${n} = ${base}^(${m}×${n}) = ${base}^${m*n}`], type: 'number', topic: 'Potenzen' };
      }
    },

    roots: () => {
      const squares = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
      const sq = squares[rand(1, squares.length - 1)];
      const sqrt = Math.sqrt(sq);
      return {
        question: `Berechne: **√${sq}** = ?`,
        answer: sqrt.toString(),
        hint: `Welche Zahl mal sich selbst ergibt ${sq}?`,
        steps: [`√${sq} = ?`, `${sqrt} × ${sqrt} = ${sq}`, `→ √${sq} = ${sqrt}`],
        type: 'number',
        topic: 'Wurzeln'
      };
    },

    geometry: () => {
      const shapes = ['circle_area', 'circle_circumference', 'rectangle_area', 'triangle_area', 'pythagoras'];
      const shape = shapes[rand(0, shapes.length - 1)];

      switch (shape) {
        case 'circle_area': {
          const r = rand(1, 10);
          const area = (Math.PI * r * r).toFixed(2);
          return { question: `Berechne den **Flächeninhalt des Kreises** mit r = ${r} cm.\n(π = 3,14159...)`, answer: area, hint: 'A = π × r²', steps: [`A = π × r²`, `A = π × ${r}²`, `A = π × ${r * r}`, `A ≈ ${area} cm²`], type: 'number', topic: 'Geometrie' };
        }
        case 'circle_circumference': {
          const r = rand(1, 10);
          const u = (2 * Math.PI * r).toFixed(2);
          return { question: `Berechne den **Umfang des Kreises** mit r = ${r} cm.`, answer: u, hint: 'U = 2 × π × r', steps: [`U = 2 × π × r`, `U = 2 × π × ${r}`, `U = ${2*r} × π`, `U ≈ ${u} cm`], type: 'number', topic: 'Geometrie' };
        }
        case 'rectangle_area': {
          const l = rand(2, 20), b = rand(2, 15);
          return { question: `Berechne den **Flächeninhalt des Rechtecks**:\nLänge: ${l} cm, Breite: ${b} cm`, answer: (l * b).toString(), hint: 'A = Länge × Breite', steps: [`A = l × b`, `A = ${l} × ${b}`, `A = ${l * b} cm²`], type: 'number', topic: 'Geometrie' };
        }
        case 'triangle_area': {
          const g = rand(2, 20), h = rand(2, 15);
          const a = (g * h) / 2;
          return { question: `Berechne den **Flächeninhalt des Dreiecks**:\nGrundfläche: ${g} cm, Höhe: ${h} cm`, answer: a.toString(), hint: 'A = (Grundlinie × Höhe) / 2', steps: [`A = (g × h) / 2`, `A = (${g} × ${h}) / 2`, `A = ${g * h} / 2`, `A = ${a} cm²`], type: 'number', topic: 'Geometrie' };
        }
        case 'pythagoras': {
          const pythagorean = [[3,4,5],[5,12,13],[8,15,17],[6,8,10]];
          const [a, b, c] = pythagorean[rand(0, pythagorean.length - 1)];
          const type = rand(0, 1);
          if (type === 0) {
            return { question: `**Satz des Pythagoras**: Rechtwinkliges Dreieck mit a = ${a} cm, b = ${b} cm.\nBerechne die Hypotenuse c.`, answer: c.toString(), hint: 'c² = a² + b²  →  c = √(a² + b²)', steps: [`c² = a² + b²`, `c² = ${a}² + ${b}²`, `c² = ${a*a} + ${b*b}`, `c² = ${a*a + b*b}`, `c = √${a*a + b*b}`, `c = ${c} cm`], type: 'number', topic: 'Geometrie' };
          } else {
            return { question: `**Satz des Pythagoras**: Rechtwinkliges Dreieck mit a = ${a} cm, c = ${c} cm (Hypotenuse).\nBerechne Kathete b.`, answer: b.toString(), hint: 'b² = c² - a²  →  b = √(c² - a²)', steps: [`b² = c² − a²`, `b² = ${c}² − ${a}²`, `b² = ${c*c} − ${a*a}`, `b² = ${c*c - a*a}`, `b = ${b} cm`], type: 'number', topic: 'Geometrie' };
          }
        }
      }
    },

    statistics: () => {
      const count = rand(5, 8);
      const values = Array.from({ length: count }, () => rand(1, 20));
      const sorted = [...values].sort((a, b) => a - b);
      const sum = values.reduce((s, v) => s + v, 0);
      const mean = sum / count;

      const type = rand(0, 3);
      switch (type) {
        case 0: return { question: `Berechne den **Mittelwert** der Daten:\n${values.join(', ')}`, answer: (mean % 1 === 0 ? mean : mean.toFixed(2)).toString(), hint: 'Mittelwert = Summe ÷ Anzahl', steps: [`Summe: ${values.join(' + ')} = ${sum}`, `Anzahl: ${count}`, `Mittelwert = ${sum} ÷ ${count} = ${mean % 1 === 0 ? mean : mean.toFixed(2)}`], type: 'number', topic: 'Statistik' };
        case 1: {
          const median = count % 2 === 0 ? (sorted[count/2-1] + sorted[count/2]) / 2 : sorted[Math.floor(count/2)];
          return { question: `Berechne den **Median** der Daten:\n${values.join(', ')}`, answer: (median % 1 === 0 ? median : median.toFixed(1)).toString(), hint: 'Sortieren → mittlerer Wert', steps: [`Sortiert: ${sorted.join(', ')}`, count % 2 === 1 ? `Median (Position ${Math.floor(count/2)+1}): ${median}` : `Median = (${sorted[count/2-1]} + ${sorted[count/2]}) / 2 = ${median}`], type: 'number', topic: 'Statistik' };
        }
        case 2: {
          const max = Math.max(...values), min = Math.min(...values);
          return { question: `Berechne die **Spannweite** der Daten:\n${values.join(', ')}`, answer: (max - min).toString(), hint: 'Spannweite = Maximum − Minimum', steps: [`Maximum: ${max}`, `Minimum: ${min}`, `Spannweite = ${max} − ${min} = ${max - min}`], type: 'number', topic: 'Statistik' };
        }
        default: {
          const freq = {};
          values.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
          const maxFreq = Math.max(...Object.values(freq));
          const mode = Object.keys(freq).filter(k => freq[k] === maxFreq).join(', ');
          return { question: `Bestimme den **Modus** der Daten:\n${values.join(', ')}`, answer: mode, hint: 'Modus = am häufigsten vorkommender Wert', steps: [`Sortiert: ${sorted.join(', ')}`, `Häufigkeit: ${Object.entries(freq).map(([k,v]) => `${k}(${v}×)`).join(', ')}`, `Häufigster Wert: ${mode}`], type: 'exact', topic: 'Statistik' };
        }
      }
    },

    equations: () => {
      const type = rand(0, 2);
      if (type === 0) {
        // Lineare Gleichung mit Klammern
        const a = rand(2, 5), b = rand(1, 8), c = rand(2, 5), d = rand(1, 20);
        const solution = (d - a * b) / (a * c - a);
        if (!Number.isInteger(solution) || solution === 0) return generators.equations();
        return {
          question: `Löse: **${a}(${c}x − ${b}) = ${d}**`,
          answer: solution.toString(),
          hint: 'Erst Klammer auflösen, dann x isolieren',
          steps: [`${a}(${c}x − ${b}) = ${d}`, `${a*c}x − ${a*b} = ${d}`, `${a*c}x = ${d} + ${a*b}`, `${a*c}x = ${d + a*b}`, `x = ${d + a*b} ÷ ${a*c}`, `x = ${solution}`],
          type: 'number',
          topic: 'Gleichungen'
        };
      } else if (type === 1) {
        // Gleichung mit x auf beiden Seiten
        const a = rand(2, 8), b = rand(1, 15), c = rand(1, a - 1), d = rand(1, 20);
        const solution = (d - b) / (a - c);
        if (!Number.isInteger(solution) || solution <= 0 || a === c) return generators.equations();
        return {
          question: `Löse: **${a}x + ${b} = ${c}x + ${d + (a-c)*parseInt(solution)}**`,
          answer: solution.toString(),
          hint: 'Bringe alle x auf eine Seite',
          steps: [`${a}x + ${b} = ${c}x + ${d + (a-c)*solution}`, `${a}x − ${c}x = ${d + (a-c)*solution} − ${b}`, `${a-c}x = ${(a-c)*solution}`, `x = ${solution}`],
          type: 'number',
          topic: 'Gleichungen'
        };
      } else {
        // Quadratische Gleichung (einfach)
        const a = rand(1, 5), b = rand(1, 8);
        const sq = a * a;
        return {
          question: `Löse: **x² = ${sq}**\n(Gib die positive Lösung an)`,
          answer: a.toString(),
          hint: 'x = √(rechte Seite)',
          steps: [`x² = ${sq}`, `x = ±√${sq}`, `x₁ = ${a}, x₂ = −${a}`],
          type: 'number',
          topic: 'Gleichungen'
        };
      }
    },

    functions: () => {
      const types = [
        () => {
          const a = rand(1,4), b = rand(-5,5), c = rand(-8,8);
          const sign = b >= 0 ? '+' : '';
          const sign2 = c >= 0 ? '+' : '';
          const vertex_x = -b / (2*a);
          const vertex_y = a*vertex_x*vertex_x + b*vertex_x + c;
          return {
            question: `Gegeben: f(x) = ${a}x² ${b !== 0 ? (b>0?'+':'')+b+'x' : ''} ${c !== 0 ? (c>0?'+':'')+c : ''}\n\nWelchen **Wert hat die Funktion an der Stelle x = 2**?`,
            answer: (a*4 + b*2 + c).toString(),
            hint: 'Setze x = 2 in die Funktion ein',
            steps: [`f(2) = ${a}·2² ${b>=0?'+':''} ${b}·2 ${c>=0?'+':''} ${c}`, `= ${a*4} ${b>=0?'+':''} ${b*2} ${c>=0?'+':''} ${c}`, `= ${a*4 + b*2 + c}`],
            type: 'number', topic: 'Funktionen'
          };
        },
        () => {
          const a = rand(1,3), b = rand(-4,4);
          const yInt = b;
          return {
            question: `f(x) = ${a === 1 ? '' : a}x³ ${b >= 0 ? '+' : ''}${b}\n\nWie lautet der **y-Achsenabschnitt** (f(0))?`,
            answer: yInt.toString(),
            hint: 'y-Achsenabschnitt: setze x = 0 ein',
            steps: [`f(0) = ${a}·0³ + ${b}`, `= 0 + ${b}`, `= ${yInt}`],
            type: 'number', topic: 'Funktionen'
          };
        },
        () => {
          const a = rand(1,3);
          return {
            question: `Welche **Symmetrie** hat f(x) = ${a}x⁴?\n(achsensymmetrisch / punktsymmetrisch / keine)`,
            answer: 'achsensymmetrisch',
            hint: 'Gerade Exponenten → Achsensymmetrie zur y-Achse',
            steps: ['f(-x) = a(-x)⁴ = ax⁴ = f(x)', '→ f(-x) = f(x) → achsensymmetrisch zur y-Achse'],
            type: 'contains', topic: 'Funktionen'
          };
        },
        () => {
          const a = rand(1,3);
          return {
            question: `Welche **Symmetrie** hat f(x) = ${a}x³?\n(achsensymmetrisch / punktsymmetrisch / keine)`,
            answer: 'punktsymmetrisch',
            hint: 'Ungerade Exponenten → Punktsymmetrie zum Ursprung',
            steps: ['f(-x) = a(-x)³ = -ax³ = -f(x)', '→ f(-x) = -f(x) → punktsymmetrisch zum Ursprung'],
            type: 'contains', topic: 'Funktionen'
          };
        },
        () => {
          const a = rand(1,3), c = rand(1,9);
          return {
            question: `f(x) = ${a}x² + ${c}\n\nHat diese Funktion **Nullstellen**? (ja/nein)\nWenn ja: berechne sie.`,
            answer: c > 0 ? 'nein|keine' : `x = ${Math.sqrt(-c/a).toFixed(2)}`,
            hint: c > 0 ? `${a}x² + ${c} = 0 → x² = ${-c/a} → keine reelle Lösung!` : 'Setze f(x) = 0 und löse nach x auf',
            steps: c > 0 ? [`${a}x² + ${c} = 0`, `x² = ${-c/a}`, `Keine reelle Lösung (negativ unter Wurzel)!`] : [`${a}x² = ${-c}`, `x² = ${-c/a}`, `x = ±${Math.sqrt(-c/a).toFixed(2)}`],
            type: 'contains', topic: 'Funktionen'
          };
        },
        () => {
          const p = rand(-5, 5), q = rand(1, 6)*(-1);
          return {
            question: `Schnittpunkt mit y-Achse:\nf(x) = (x ${p>=0?'-':'+'}${Math.abs(p)})(x ${q>=0?'-':'+'}${Math.abs(q)})\n\nWie lautet f(0)?`,
            answer: (p * (-q) < 0 ? p*Math.abs(q) : (-p)*q).toString(),
            hint: 'Setze x = 0 ein: f(0) = (0-p)(0-q) = p·q',
            steps: [`f(0) = (0 − ${p})(0 − ${q})`, `= (${-p})(${-q})`, `= ${(-p)*(-q)}`],
            type: 'number', topic: 'Funktionen'
          };
        }
      ];
      return types[Math.floor(Math.random() * types.length)]();
    },

    nullstellen: () => {
      const types = [
        () => {
          const a = rand(1,4), b = rand(-6,6);
          const x0 = -b/a;
          const whole = Number.isInteger(x0);
          return {
            question: `Berechne die **Nullstelle** von:\nf(x) = ${a}x ${b>=0?'+':''}${b}`,
            answer: whole ? x0.toString() : x0.toFixed(2),
            hint: 'Setze f(x) = 0 und löse nach x auf',
            steps: [`${a}x ${b>=0?'+':''}${b} = 0`, `${a}x = ${-b}`, `x = ${-b}/${a}`, `x = ${x0.toFixed(2)}`],
            type: 'number', topic: 'Nullstellen'
          };
        },
        () => {
          const [r1, r2] = [rand(-5,5), rand(-5,5)];
          const b = -(r1+r2), c = r1*r2;
          return {
            question: `Berechne die **Nullstellen** mit der Mitternachtsformel:\nf(x) = x² ${b>=0?'+':''}${b}x ${c>=0?'+':''}${c}`,
            answer: `${Math.min(r1,r2)}|${Math.max(r1,r2)}`,
            hint: 'x = (-b ± √(b²-4ac)) / 2a',
            steps: [
              `a=1, b=${b}, c=${c}`,
              `Diskriminante: D = b²-4ac = ${b*b}-4·${c} = ${b*b - 4*c}`,
              `√D = ${Math.sqrt(b*b - 4*c).toFixed(2)}`,
              `x₁ = (${-b} + ${Math.sqrt(b*b-4*c).toFixed(2)}) / 2 = ${r1}`,
              `x₂ = (${-b} - ${Math.sqrt(b*b-4*c).toFixed(2)}) / 2 = ${r2}`
            ],
            type: 'contains', topic: 'Nullstellen'
          };
        },
        () => {
          const r = rand(1,6);
          return {
            question: `Berechne die **Nullstellen** durch Ausklammern:\nf(x) = x³ ${r>0?'- ':'+ '}${r}x²\n(Tipp: x ausklammern)`,
            answer: `0|${r}`,
            hint: 'x ausklammern: x(x² − rx) = x·x(x − r)',
            steps: [`x³ ${r>0?'-':'+'}${r}x² = 0`, `x²(x ${r>0?'-':'+'}${r}) = 0`, `x₁ = 0 (doppelte NS), x₂ = ${r}`],
            type: 'contains', topic: 'Nullstellen'
          };
        },
        () => {
          const a = rand(1,4), p = rand(1,5);
          return {
            question: `Diskriminante berechnen:\nf(x) = x² ${(2*p)>0?'+':''}${2*p}x ${p*p+1 > 0 ? '+' : ''}${p*p+1}\n\nWie viele Nullstellen hat die Funktion?\n(0 / 1 / 2)`,
            answer: '0',
            hint: 'D = b²-4ac. Wenn D < 0: keine reellen Nullstellen',
            steps: [`b = ${2*p}, c = ${p*p+1}`, `D = (${2*p})² - 4·1·${p*p+1}`, `= ${4*p*p} - ${4*(p*p+1)}`, `= ${4*p*p - 4*(p*p+1)}`, `D < 0 → keine reellen Nullstellen`],
            type: 'exact', topic: 'Nullstellen'
          };
        }
      ];
      return types[Math.floor(Math.random() * types.length)]();
    },

    probability: () => {
      const ex = Probability.generateBasicProbability();
      return { ...ex, type: 'contains' };
    },

    combinatorics: () => {
      const types = [
        () => {
          const n = rand(4,8), k = rand(2,Math.min(n-1,4));
          const factorial = (n) => n <= 1 ? 1 : n * factorial(n-1);
          const perm = factorial(n) / factorial(n-k);
          return {
            question: `**Permutation ohne Wiederholung:**\nWie viele geordnete Möglichkeiten gibt es, ${k} aus ${n} Elementen auszuwählen?\nP(${n},${k}) = ?`,
            answer: perm.toString(),
            hint: `P(n,k) = n! / (n-k)! = ${n}! / ${n-k}!`,
            steps: [`P(${n},${k}) = ${n}! / (${n}-${k})!`, `= ${n}! / ${n-k}!`, `= ${Array.from({length:k},(_,i)=>n-i).join(' × ')}`, `= ${perm}`],
            type: 'number', topic: 'Kombinatorik'
          };
        },
        () => {
          const n = rand(4,8), k = rand(2,Math.min(n-1,4));
          const factorial = (n) => n <= 1 ? 1 : n * factorial(n-1);
          const comb = factorial(n) / (factorial(k) * factorial(n-k));
          return {
            question: `**Kombination ohne Wiederholung:**\nWie viele Möglichkeiten gibt es, ${k} aus ${n} Elementen (ungeordnet) auszuwählen?\nC(${n},${k}) = ?`,
            answer: comb.toString(),
            hint: `C(n,k) = n! / (k! × (n-k)!)`,
            steps: [`C(${n},${k}) = ${n}! / (${k}! × ${n-k}!)`, `= ${Array.from({length:k},(_,i)=>n-i).join('×')} / ${Array.from({length:k},(_,i)=>k-i).join('×')}`, `= ${comb}`],
            type: 'number', topic: 'Kombinatorik'
          };
        },
        () => {
          const n = rand(2,5), k = rand(2,4);
          const res = Math.pow(n, k);
          return {
            question: `**Variation mit Wiederholung:**\nEin ${k}-stelliger Code aus ${n} Ziffern (0 bis ${n-1}).\nWie viele Codes gibt es?`,
            answer: res.toString(),
            hint: `n^k = ${n}^${k}`,
            steps: [`Jede Stelle: ${n} Möglichkeiten`, `${k} Stellen → ${n}^${k}`, `= ${res}`],
            type: 'number', topic: 'Kombinatorik'
          };
        }
      ];
      return types[Math.floor(Math.random() * types.length)]();
    },

    trigonometry: () => {
      const angles = [
        { deg: 0, rad: '0', sin: 0, cos: 1, tan: 0 },
        { deg: 30, rad: 'π/6', sin: 0.5, cos: '√3/2', tan: '1/√3' },
        { deg: 45, rad: 'π/4', sin: '√2/2', cos: '√2/2', tan: 1 },
        { deg: 60, rad: 'π/3', sin: '√3/2', cos: 0.5, tan: '√3' },
        { deg: 90, rad: 'π/2', sin: 1, cos: 0, tan: '∞' },
      ];

      const exercises = [
        () => {
          const angle = angles[Math.floor(Math.random() * (angles.length - 1))];
          return { question: `Berechne: **sin(${angle.deg}°)** = ?`, answer: angle.sin.toString(), hint: 'Einheitskreis: sin = y-Koordinate', steps: [`sin(${angle.deg}°) = ${angle.sin}`], type: 'contains', topic: 'Trigonometrie' };
        },
        () => {
          const angle = angles[Math.floor(Math.random() * (angles.length - 1))];
          return { question: `Berechne: **cos(${angle.deg}°)** = ?`, answer: angle.cos.toString(), hint: 'Einheitskreis: cos = x-Koordinate', steps: [`cos(${angle.deg}°) = ${angle.cos}`], type: 'contains', topic: 'Trigonometrie' };
        },
        () => {
          const sides = [[3,4,5],[5,12,13],[8,15,17]];
          const [a,b,c] = sides[Math.floor(Math.random()*sides.length)];
          return { question: `Rechtwinkliges Dreieck: a=${a}, b=${b}, c=${c}(Hyp.)\nBerechne: **sin(α)** (α liegt der Seite a gegenüber)`, answer: (a/c).toFixed(4), hint: 'sin(α) = Gegenkathete / Hypotenuse', steps: [`sin(α) = Gegenkathete / Hypotenuse`, `= ${a} / ${c}`, `= ${(a/c).toFixed(4)}`], type: 'number', topic: 'Trigonometrie' };
        },
        () => {
          return { question: `**Sinussatz:**\nIn einem Dreieck gilt:\na / sin(α) = b / sin(β) = c / sin(γ)\n\nMit a = 6 und α = 30°: Berechne **b**, wenn β = 60°.`, answer: (6 * Math.sin(Math.PI/3) / Math.sin(Math.PI/6)).toFixed(2), hint: 'b = a · sin(β) / sin(α)', steps: [`b = a · sin(β) / sin(α)`, `= 6 · sin(60°) / sin(30°)`, `= 6 · (√3/2) / (1/2)`, `= 6√3 ≈ ${(6*Math.sqrt(3)).toFixed(2)}`], type: 'number', topic: 'Trigonometrie' };
        }
      ];
      return exercises[Math.floor(Math.random() * exercises.length)]();
    },

    analysis: () => {
      const exercises = [
        () => {
          const n = rand(2,5), a = rand(1,4);
          return {
            question: `Leite ab: **f(x) = ${a}x^${n}**\nf'(x) = ?`,
            answer: `${a*n}x^${n-1}|${a*n}x${n-1 === 1 ? '' : '^'+(n-1)}`,
            hint: `Potenzregel: (axⁿ)' = n·a·xⁿ⁻¹`,
            steps: [`f(x) = ${a}x^${n}`, `f'(x) = ${n} · ${a} · x^(${n}-1)`, `f'(x) = ${a*n}x^${n-1}`],
            type: 'contains', topic: 'Analysis'
          };
        },
        () => {
          const a = rand(2,6), b = rand(1,5);
          return {
            question: `Leite ab: **f(x) = ${a}x² + ${b}x**\nf'(x) = ?`,
            answer: `${2*a}x + ${b}|${2*a}x+${b}`,
            hint: 'Summenregel: jeden Term einzeln ableiten',
            steps: [`(${a}x²)' = ${2*a}x`, `(${b}x)' = ${b}`, `f'(x) = ${2*a}x + ${b}`],
            type: 'contains', topic: 'Analysis'
          };
        },
        () => {
          const a = rand(1,5), b = rand(1,8);
          return {
            question: `Berechne das **Integral** (bestimmt von 0 bis ${b}):\n∫ ${a} dx`,
            answer: (a*b).toString(),
            hint: '∫ a dx = ax + C | von 0 bis b: a·b - a·0 = a·b',
            steps: [`∫₀^${b} ${a} dx`, `= [${a}x]₀^${b}`, `= ${a}·${b} - ${a}·0`, `= ${a*b}`],
            type: 'number', topic: 'Analysis'
          };
        },
        () => {
          const a = rand(1,4), n = rand(2,4);
          const result_upper = a * Math.pow(2, n) / n;
          return {
            question: `Berechne: ∫₀² **${a}x^${n-1}** dx`,
            answer: result_upper.toFixed(2),
            hint: `∫ axⁿ dx = a/(n+1) · x^(n+1) + C`,
            steps: [`∫₀² ${a}x^${n-1} dx`, `= [${a}/${n} · x^${n}]₀²`, `= ${a}/${n} · 2^${n} - 0`, `= ${a}/${n} · ${Math.pow(2,n)}`, `= ${result_upper.toFixed(2)}`],
            type: 'number', topic: 'Analysis'
          };
        }
      ];
      return exercises[Math.floor(Math.random() * exercises.length)]();
    },

    wordproblems: () => {
      const problems = [
        () => {
          const price = rand(1, 5) * 10 + rand(5, 9) * 0.1;
          const count = rand(2, 8);
          const total = Math.round(price * count * 100) / 100;
          return { question: `Lisa kauft ${count} Bücher zu je ${price.toFixed(2)} €.\nWas kostet sie das insgesamt?`, answer: total.toFixed(2), hint: 'Preis × Anzahl = Gesamtpreis', steps: [`${price.toFixed(2)} € × ${count}`, `= ${total.toFixed(2)} €`], type: 'number', topic: 'Textaufgaben' };
        },
        () => {
          const total = rand(100, 500, 50);
          const pct = rand(10, 40, 5);
          const discount = (total * pct) / 100;
          const result = total - discount;
          return { question: `Ein Fahrrad kostet ${total} €. Im Sale gibt es ${pct}% Rabatt.\nWas kostet das Fahrrad jetzt?`, answer: result.toString(), hint: `Rabatt = ${total} × ${pct}% → Neuer Preis = ${total} − Rabatt`, steps: [`Rabatt = ${total} × ${pct}/100 = ${discount} €`, `Neuer Preis = ${total} − ${discount} = ${result} €`], type: 'number', topic: 'Textaufgaben' };
        },
        () => {
          const speed = rand(40, 120, 10);
          const time = rand(1, 4);
          const distance = speed * time;
          return { question: `Ein Zug fährt ${speed} km/h und ist ${time} Stunden unterwegs.\nWelche Strecke legt er zurück?`, answer: distance.toString(), hint: 'Strecke = Geschwindigkeit × Zeit', steps: [`s = v × t`, `s = ${speed} km/h × ${time} h`, `s = ${distance} km`], type: 'number', topic: 'Textaufgaben' };
        },
        () => {
          const students = rand(20, 35);
          const pass = rand(15, students);
          const pct = Math.round((pass / students) * 100);
          return { question: `In einer Klasse mit ${students} Schülern haben ${pass} die Klausur bestanden.\nWie viel Prozent haben bestanden?`, answer: pct.toString(), hint: 'Prozentsatz = (Prozentwert / Grundwert) × 100', steps: [`p = (${pass} / ${students}) × 100`, `p ≈ ${pct}%`], type: 'number', topic: 'Textaufgaben' };
        }
      ];
      return problems[rand(0, problems.length - 1)]();
    }
  };

  const generate = (topicId) => {
    if (!generators[topicId]) return null;
    currentTopic = topicId;
    hintShown = false;
    currentExercise = generators[topicId]();
    return currentExercise;
  };

  const checkAnswer = (userAnswer) => {
    if (!currentExercise) return null;
    return Brain.checkAnswer(userAnswer, currentExercise.answer, currentExercise.type);
  };

  const getHint = () => {
    if (!currentExercise) return null;
    hintShown = true;
    return currentExercise.hint;
  };

  const getSolutionSteps = () => {
    if (!currentExercise) return null;
    return currentExercise.steps;
  };

  const getTopics = () => TOPICS;

  const getTopicLabel = (topicId) => {
    const t = TOPICS.find(t => t.id === topicId);
    return t ? t.label : topicId;
  };

  const getKnowledgeName = () => currentExercise ? currentExercise.topic : null;

  return { generate, checkAnswer, getHint, getSolutionSteps, getTopics, getTopicLabel, getKnowledgeName, current: () => currentExercise };
})();
