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
