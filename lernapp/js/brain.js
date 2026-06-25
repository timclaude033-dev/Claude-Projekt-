/* ============================================
   Brain - KI-Wissensbase & Lernlogik
   ============================================ */

const Brain = (() => {

  // Wissensdatenbank eingebaut
  const KNOWLEDGE_BASE = {
    math: {
      'Grundrechenarten': {
        rules: ['Addition: a + b', 'Subtraktion: a - b', 'Multiplikation: a × b', 'Division: a ÷ b'],
        tips: ['Commutativgesetz: a+b = b+a', 'Assoziativgesetz: (a+b)+c = a+(b+c)']
      },
      'Bruchrechnung': {
        rules: ['Gleichnamige Brüche: gleicher Nenner nötig', 'Addition: a/c + b/c = (a+b)/c', 'Multiplikation: (a/b) × (c/d) = (a×c)/(b×d)', 'Division: (a/b) ÷ (c/d) = (a×d)/(b×c)', 'Kürzen: Zähler und Nenner durch ggT teilen'],
        tips: ['Erweitern: Zähler & Nenner mit gleicher Zahl multiplizieren', 'Gemischte Zahlen in unechte Brüche umwandeln']
      },
      'Prozentrechnung': {
        rules: ['Prozentwert: W = (G × p) / 100', 'Prozentsatz: p = (W × 100) / G', 'Grundwert: G = (W × 100) / p'],
        tips: ['1% = 1/100 des Grundwertes', 'Preiserhöhung: Faktor > 1', 'Preissenkung: Faktor < 1']
      },
      'Algebra': {
        rules: ['Gleichungen umformen: Was auf einer Seite, auf der anderen auch', 'Klammer auflösen: a(b+c) = ab+ac', 'Binomische Formeln: (a+b)² = a²+2ab+b²', '(a-b)² = a²-2ab+b²', '(a+b)(a-b) = a²-b²'],
        tips: ['Variablen auf eine Seite', 'Zahlen auf andere Seite']
      },
      'Geometrie': {
        rules: ['Pythagoras: a²+b²=c²', 'Umfang Kreis: U = 2πr', 'Fläche Kreis: A = πr²', 'Fläche Rechteck: A = l×b', 'Fläche Dreieck: A = (g×h)/2'],
        tips: ['Winkelsum Dreieck = 180°', 'Winkelsum Viereck = 360°']
      },
      'Statistik': {
        rules: ['Mittelwert: Summe aller Werte / Anzahl', 'Median: mittlerer Wert einer sortierten Liste', 'Modus: häufigster Wert', 'Spannweite: Maximum - Minimum'],
        tips: ['Daten immer erst sortieren', 'Bei geradem n: Median = Mittel der zwei Mittelwerte']
      },
      'Potenzen': {
        rules: ['a^n = a × a × ... (n-mal)', 'a^m × a^n = a^(m+n)', 'a^m / a^n = a^(m-n)', '(a^m)^n = a^(m×n)', 'a^0 = 1', 'a^(-n) = 1/a^n'],
        tips: ['Gleiche Basis: Exponenten addieren/subtrahieren', 'Potenzen potenzieren: Exponenten multiplizieren']
      },
      'Wurzeln': {
        rules: ['√(a×b) = √a × √b', '√(a/b) = √a / √b', '√a × √a = a', '(√a)² = a'],
        tips: ['Quadratzahlen merken: 1,4,9,16,25,36,49,64,81,100', 'Wurzel = Potenz mit Exponent 1/2']
      }
    },
    deutsch: {
      'Grammatik': {
        rules: ['Substantive: Nomen, großgeschrieben', 'Verben: Tätigkeits-/Zustands-/Vorgangswörter', 'Adjektive: beschreiben Substantive', 'Adverbien: beschreiben Verben/Adjektive', 'Pronomen: stehen für Nomen'],
        tips: ['Substantive erkennen: "ein/eine/einen ___"', 'Verb erkennen: nach "ich/du/er" fragen']
      },
      'Satzglieder': {
        rules: ['Subjekt: Wer/Was macht etwas? (Nominativ)', 'Prädikat: Was tut das Subjekt? (Verb)', 'Objekt: Wen/Was? (Akkusativ), Wem? (Dativ)', 'Adverbiale: Wann? Wo? Wie? Warum?'],
        tips: ['Subjekt immer im Nominativ', 'Umstellen: Subjekt ändert nicht die Bedeutung']
      },
      'Zeitformen': {
        rules: ['Präsens: jetzt/immer (ich lerne)', 'Präteritum: Erzählvergangenheit (ich lernte)', 'Perfekt: Gesprächsvergangenheit (ich habe gelernt)', 'Plusquamperfekt: Vorvergangenheit (ich hatte gelernt)', 'Futur I: Zukunft (ich werde lernen)'],
        tips: ['Perfekt = haben/sein + Partizip II', 'Starke Verben: unregelmäßige Stammvokalwechsel']
      },
      'Rechtschreibung': {
        rules: ['ss nach kurzem Vokal', 'ß nach langem Vokal/Diphthong', 'Groß: Satzanfang, Nomen, Anrede (Sie)', 'ie/i: Dehnung → ie (viel, Liebe)'],
        tips: ['Verlängerungsregel: Haus → Häuser (ä, nicht e)', 'Ableitungsregel: Wald → Waldes (d, nicht t)']
      },
      'Aufsatz': {
        rules: ['Einleitung: Hinführung zum Thema', 'Hauptteil: Argumente/Handlung', 'Schluss: Fazit/Ausblick/Zusammenfassung', 'Erörterung: These → Argument → Beispiel → Fazit'],
        tips: ['Satzverbindungen verwenden: jedoch, außerdem, deshalb', 'Abwechslungsreiche Satzstruktur']
      },
      'Literatur': {
        rules: ['Epik: Prosa, Erzähler (Roman, Novelle, Kurzgeschichte)', 'Lyrik: Gedicht, Versmaß, Reime', 'Dramatik: Dialog, Akt, Szene', 'Erzählperspektive: Ich-, Er/Sie-, allwissend'],
        tips: ['Stilmittel: Metapher, Personifikation, Alliteration, Ironie', 'Epoche erkennen: Sprache, Themen, Kontext']
      },
      'Interpunktion': {
        rules: ['Komma vor: weil, dass, obwohl, wenn, als, da, damit', 'Komma bei Aufzählungen', 'Komma bei Apposition', 'Semikolon: zwischen gleichwertigen Hauptsätzen'],
        tips: ['Relativsätze immer mit Komma einschließen', 'Infinitiv mit "zu" → Komma prüfen']
      }
    },
    english: {
      'Grammar Tenses': {
        rules: ['Present Simple: habits/facts (I go)', 'Present Continuous: now (I am going)', 'Past Simple: finished action (I went)', 'Present Perfect: past with present relevance (I have gone)', 'Future: will/going to (I will go)'],
        tips: ['Signal words: always/usually→ Pres.Simple; now/at the moment→ Pres.Cont.; yesterday/ago→ Past Simple; just/already/ever→ Pres.Perfect']
      },
      'Vocabulary': {
        rules: ['Word families: act → action → active → actively', 'Prefixes: un-, dis-, re-, pre-, over-', 'Suffixes: -tion, -ness, -ful, -less, -er'],
        tips: ['Learn words in context, not isolation', 'Use new words in sentences']
      },
      'Articles': {
        rules: ['a/an: indefinite, first mention, countable (a dog, an apple)', 'the: definite, known, unique (the sun, the door)', 'No article: uncountable in general (Water is life), plurals in general'],
        tips: ['an before vowel sounds (an hour)', 'the with superlatives (the best)']
      },
      'Prepositions': {
        rules: ['Time: at (3pm), on (Monday), in (April/2024)', 'Place: at (point), on (surface), in (enclosed space)', 'Movement: to, from, into, out of, through'],
        tips: ['Learn prepositions with fixed phrases', 'in the morning/afternoon/evening, at night']
      },
      'Conditional': {
        rules: ['Type 0: If + present, present (If water boils, it evaporates)', 'Type 1: If + present, will + inf. (If it rains, I will stay)', 'Type 2: If + past, would + inf. (If I had money, I would buy)', 'Type 3: If + past perfect, would have + pp (If I had known, I would have come)'],
        tips: ['Type 1: real/possible situations', 'Type 2: unreal/hypothetical', 'Type 3: unreal in the past']
      },
      'Passive Voice': {
        rules: ['Active: Subject + verb + object', 'Passive: Object + to be + past participle + (by subject)', 'Present: is/are + pp', 'Past: was/were + pp', 'Perfect: has/have been + pp'],
        tips: ['Use passive when agent is unknown/unimportant', 'By-phrase only when agent is important']
      },
      'Relative Clauses': {
        rules: ['who: for people (The man who came...)', 'which: for things (The book which I read...)', 'that: for people or things', 'whose: possession (The girl whose bag...)', 'where: place (The town where I live...)'],
        tips: ['Defining clause: no commas (The man who called is here)', 'Non-defining: with commas (My father, who lives in Berlin, is...)']
      }
    }
  };

  // Berechne Antwort für Mathefragen
  const evaluateMath = (expression) => {
    try {
      // Sicheres Evaluieren - nur Zahlen und Operatoren
      const cleaned = expression.toString()
        .replace(/[^0-9+\-*/().%, ]/g, '')
        .replace(/,/g, '.');
      if (!cleaned) return null;
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + cleaned + ')')();
      return isFinite(result) ? Math.round(result * 10000) / 10000 : null;
    } catch { return null; }
  };

  // Antwortvergleich
  const checkAnswer = (userAnswer, correctAnswer, type = 'exact') => {
    const u = userAnswer.toString().trim().toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[„"]/g, '"');
    const c = correctAnswer.toString().trim().toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[„"]/g, '"');

    if (type === 'exact') return u === c;

    if (type === 'number') {
      const uNum = parseFloat(u.replace(',', '.'));
      const cNum = parseFloat(c.replace(',', '.'));
      if (isNaN(uNum) || isNaN(cNum)) return false;
      return Math.abs(uNum - cNum) < 0.001;
    }

    if (type === 'contains') {
      return c.split('|').some(variant => u.includes(variant.trim()) || variant.trim().includes(u));
    }

    if (type === 'fuzzy') {
      const threshold = 0.8;
      return similarity(u, c) >= threshold;
    }

    return u === c;
  };

  // String-Ähnlichkeit (Levenshtein-basiert)
  const similarity = (a, b) => {
    if (a === b) return 1;
    if (!a.length || !b.length) return 0;
    const maxLen = Math.max(a.length, b.length);
    const dist = levenshtein(a, b);
    return (maxLen - dist) / maxLen;
  };

  const levenshtein = (a, b) => {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      }
    }
    return dp[m][n];
  };

  // Wissensbasis abrufen
  const getKnowledge = (subject, topic) => {
    if (!KNOWLEDGE_BASE[subject]) return null;
    if (!topic) return KNOWLEDGE_BASE[subject];
    return KNOWLEDGE_BASE[subject][topic] || null;
  };

  const getAllSubjectKnowledge = (subject) => {
    return KNOWLEDGE_BASE[subject] || {};
  };

  // KI-Antwort generieren (lokal, kein API)
  const generateResponse = (input, context = {}) => {
    const q = input.toLowerCase();

    // Erkenne Thema
    const subject = detectSubject(q);
    const topic = detectTopic(q, subject);

    // Pattern-basierte Antworten
    if (matchesMath(q)) return generateMathResponse(input);
    if (matchesDefinition(q)) return generateDefinitionResponse(input, subject, topic);
    if (matchesExplanation(q)) return generateExplanationResponse(input, subject, topic);
    if (matchesNote(q)) return generateNoteResponse(subject, topic);
    if (matchesExercise(q)) return generateExerciseRequest(subject);
    if (matchesGreeting(q)) return generateGreeting();
    if (matchesHelp(q)) return generateHelp();
    if (matchesTranslation(q)) return generateTranslation(input);

    // Themenspezifisch
    if (subject && topic) return generateTopicExplanation(subject, topic);
    if (subject) return generateSubjectResponse(subject, input);

    return generateGenericResponse(input);
  };

  const detectSubject = (q) => {
    if (/\b(mathe|math|rechnen|gleichung|zahl|bruch|prozent|algebra|geometrie|pythagoras|winkel|integral|ableitung|funktion|vektor|matrix|statistik|wahrscheinlichkeit|potenzen?|wurzel|logarithm|trigonometrie|sinus|cosinus|tangens)\b/.test(q)) return 'math';
    if (/\b(deutsch|grammatik|rechtschreib|aufsatz|komma|verb|adjektiv|substantiv|nomen|satz|deutsch|literatur|gedicht|roman|erzähl|zeitform|konjunktiv|partizip|relativsatz|pronomen|artikel)\b/.test(q)) return 'deutsch';
    if (/\b(english|englisch|grammar|tense|vocabulary|present|past|future|conditional|passive|verb|noun|pronoun|preposition|adjective|relative|clause)\b/.test(q)) return 'english';
    return null;
  };

  const detectTopic = (q, subject) => {
    if (!subject || !KNOWLEDGE_BASE[subject]) return null;
    for (const topic of Object.keys(KNOWLEDGE_BASE[subject])) {
      if (q.includes(topic.toLowerCase())) return topic;
    }
    // Keyword-Matching
    const keywordMap = {
      math: { 'bruch': 'Bruchrechnung', 'prozent': 'Prozentrechnung', 'gleichung': 'Algebra', 'potenz': 'Potenzen', 'wurzel': 'Wurzeln', 'winkel': 'Geometrie', 'mittelwert': 'Statistik', 'pythagoras': 'Geometrie', 'kreis': 'Geometrie' },
      deutsch: { 'verb': 'Grammatik', 'nomen': 'Grammatik', 'subjekt': 'Satzglieder', 'objekt': 'Satzglieder', 'präteritum': 'Zeitformen', 'perfekt': 'Zeitformen', 'komma': 'Interpunktion', 'aufsatz': 'Aufsatz', 'gedicht': 'Literatur' },
      english: { 'present': 'Grammar Tenses', 'past': 'Grammar Tenses', 'future': 'Grammar Tenses', 'article': 'Articles', 'preposition': 'Prepositions', 'if': 'Conditional', 'passive': 'Passive Voice', 'relative': 'Relative Clauses' }
    };
    if (keywordMap[subject]) {
      for (const [kw, topic] of Object.entries(keywordMap[subject])) {
        if (q.includes(kw)) return topic;
      }
    }
    return null;
  };

  const matchesMath = (q) => /\d[\d\s]*[+\-*/^%]\s*[\d\s]/.test(q) || /berechn|rechne|ergebnis von|wieviel ist|was ist \d/.test(q);
  const matchesDefinition = (q) => /was (ist|sind|bedeutet)|definier|erkläre? mir (was|den|die|das)/.test(q);
  const matchesExplanation = (q) => /erkläre?|wie (funktioniert|rechnet|geht)|wie macht man|zeig mir|lern.*über/.test(q);
  const matchesNote = (q) => /lernzettel|spickzettel|merkzettel|zusammenfassung|fasse.*zusammen|erstelle.*zettel/.test(q);
  const matchesExercise = (q) => /aufgabe|übung|test|quiz|frag mich|prüf mich/.test(q);
  const matchesGreeting = (q) => /^(hallo|hi|hey|guten morgen|guten tag|servus|moin|nabend)/i.test(q.trim());
  const matchesHelp = (q) => /was kannst du|hilf mir|wie kann ich dich|was machst du/.test(q);
  const matchesTranslation = (q) => /übersetz|translate|auf englisch|auf deutsch|what is.*auf deutsch|wie sagt man/.test(q);

  const generateMathResponse = (input) => {
    const expr = input.replace(/[^0-9+\-*/().,^% ]/g, '').trim();
    if (expr) {
      const result = evaluateMath(expr);
      if (result !== null) {
        return `🔢 **Berechnung:** \`${expr} = ${result}\`\n\nIch habe den Ausdruck ausgewertet: Das Ergebnis ist **${result}**.\n\nMöchtest du wissen, wie man das schrittweise löst?`;
      }
    }
    return `🔢 Ich sehe, du hast eine Matheaufgabe. Gib den Ausdruck klar ein, zum Beispiel:\n- \`3 + 4 * 2\`\n- \`(15 + 5) / 4\`\n\nOder beschreibe die Aufgabe und ich erkläre sie dir!`;
  };

  const generateDefinitionResponse = (input, subject, topic) => {
    if (topic && subject && KNOWLEDGE_BASE[subject] && KNOWLEDGE_BASE[subject][topic]) {
      const kb = KNOWLEDGE_BASE[subject][topic];
      return `📖 **${topic}** erklärt:\n\n${kb.rules.map(r => `• ${r}`).join('\n')}\n\n💡 **Tipps:**\n${kb.tips.map(t => `→ ${t}`).join('\n')}`;
    }
    return generateGenericResponse(input);
  };

  const generateExplanationResponse = (input, subject, topic) => {
    if (topic && subject && KNOWLEDGE_BASE[subject] && KNOWLEDGE_BASE[subject][topic]) {
      const kb = KNOWLEDGE_BASE[subject][topic];
      return `🧠 **${topic} – Erklärung:**\n\n**Wichtigste Regeln:**\n${kb.rules.map((r, i) => `${i+1}. ${r}`).join('\n')}\n\n**Merktipps:**\n${kb.tips.map(t => `✓ ${t}`).join('\n')}\n\nHast du noch Fragen dazu? Ich kann auch Übungsaufgaben generieren!`;
    }
    if (subject) return generateSubjectResponse(subject, input);
    return generateGenericResponse(input);
  };

  const generateNoteResponse = (subject, topic) => {
    if (!subject) {
      return `📋 Für welches Fach soll ich einen Lernzettel erstellen?\n- **Mathe** – z.B. Bruchrechnung, Algebra\n- **Deutsch** – z.B. Grammatik, Zeitformen\n- **Englisch** – z.B. Tenses, Conditional\n\nSag einfach: "Erstelle einen Lernzettel über [Thema]"`;
    }
    const subjectTopics = KNOWLEDGE_BASE[subject] ? Object.keys(KNOWLEDGE_BASE[subject]) : [];
    const t = topic || subjectTopics[0];
    if (!t || !KNOWLEDGE_BASE[subject][t]) return `Über welches ${subject}-Thema soll ich den Lernzettel erstellen? Verfügbar: ${subjectTopics.join(', ')}`;

    const kb = KNOWLEDGE_BASE[subject][t];
    const subjectName = subject === 'math' ? 'Mathematik' : subject === 'deutsch' ? 'Deutsch' : 'English';

    return `📋 **Lernzettel: ${t} (${subjectName})**\n\n**━━━ REGELN & FORMELN ━━━**\n${kb.rules.map(r => `▸ ${r}`).join('\n')}\n\n**━━━ MERKTIPPS ━━━**\n${kb.tips.map(t => `★ ${t}`).join('\n')}\n\n_Soll ich diesen Lernzettel speichern? Klicke auf "📋 Lernzettel erstellen"!_`;
  };

  const generateExerciseRequest = (subject) => {
    const subjectName = subject === 'math' ? 'Mathematik' : subject === 'deutsch' ? 'Deutsch' : subject === 'english' ? 'Englisch' : 'einem Fach';
    return `✏️ Klar! Geh zu **${subjectName}** (im Menü links) für interaktive Aufgaben mit sofortiger Auswertung und Punkten!\n\nOder sage mir: "Gib mir eine Aufgabe über [Thema]" und ich erstelle eine direkt hier.`;
  };

  const generateGreeting = () => {
    const greetings = [
      '👋 Hallo! Schön, dass du da bist! Womit kann ich dir heute beim Lernen helfen?',
      '🌟 Hey! Ich bin bereit zum Lernen. Was möchtest du heute üben?',
      '🚀 Willkommen zurück! Bereit für eine neue Lernsession?'
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const generateHelp = () => {
    return `🤖 **Was ich kann:**\n\n**📚 Erklären**\n• "Erkläre mir den Pythagoras"\n• "Was ist ein Relativsatz?"\n• "How does the Present Perfect work?"\n\n**🔢 Rechnen**\n• "Was ist 345 × 67?"\n• "Berechne 15% von 80"\n\n**📋 Lernzettel erstellen**\n• "Erstelle einen Lernzettel über Bruchrechnung"\n• "Mache einen Spickzettel zu Zeitformen"\n\n**✏️ Aufgaben**\n• "Gib mir eine Mathe-Aufgabe"\n• "Teste mich auf Grammatik"\n\n**🗂️ Lernkarten**\n• "Erstelle Lernkarten zu Potenzen"\n\n**🌍 Übersetzen**\n• "Übersetze: Hund auf Englisch"`;
  };

  const generateTranslation = (input) => {
    const dict = {
      'hund': 'dog', 'katze': 'cat', 'haus': 'house', 'schule': 'school', 'buch': 'book',
      'lernen': 'to learn', 'spielen': 'to play', 'essen': 'to eat', 'trinken': 'to drink',
      'groß': 'big', 'klein': 'small', 'gut': 'good', 'schlecht': 'bad',
      'dog': 'Hund', 'cat': 'Katze', 'house': 'Haus', 'school': 'Schule', 'book': 'Buch',
      'learn': 'lernen', 'play': 'spielen', 'eat': 'essen', 'drink': 'trinken',
      'big': 'groß', 'small': 'klein', 'good': 'gut', 'bad': 'schlecht'
    };
    const words = input.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (dict[word]) return `🌍 **Übersetzung:** "${word}" = **${dict[word]}**`;
    }
    return `🌍 Ich kann einfache Wörter übersetzen. Für komplexe Texte nutze bitte ein Wörterbuch.\n\nBeispiel: "Übersetze: Hund" → "dog"`;
  };

  const generateTopicExplanation = (subject, topic) => {
    return generateExplanationResponse('', subject, topic);
  };

  const generateSubjectResponse = (subject, input) => {
    const topics = Object.keys(KNOWLEDGE_BASE[subject] || {});
    const subjectName = subject === 'math' ? 'Mathematik' : subject === 'deutsch' ? 'Deutsch' : 'Englisch';
    return `📚 In **${subjectName}** kann ich dir bei diesen Themen helfen:\n\n${topics.map(t => `• ${t}`).join('\n')}\n\nWelches Thema interessiert dich? Oder geh direkt zum **${subjectName}-Bereich** für Übungsaufgaben!`;
  };

  const generateGenericResponse = (input) => {
    const responses = [
      `🤔 Das ist eine interessante Frage! Ich bin eine lokale KI und habe Wissen über **Mathematik**, **Deutsch** und **Englisch**.\n\nPräzisiere deine Frage, z.B.:\n• "Erkläre mir Bruchrechnung"\n• "Was ist ein Adjektiv?"\n• "Explain the Present Perfect"`,
      `📚 Ich bin dein Lernassistent für Mathe, Deutsch und Englisch! Stelle mir eine spezifische Frage zu einem dieser Fächer.\n\nTipp: Je genauer deine Frage, desto besser meine Antwort!`,
      `🧠 Ich verstehe die Anfrage. Als lokale KI (ohne Internet-Verbindung) kann ich dir am besten bei **Schulthemen** helfen. Frag mich etwas über Mathe, Deutsch oder Englisch!`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Auto-Lernzettel aus Session generieren
  const generateAutoNote = (subject, completedTopics) => {
    if (!completedTopics || completedTopics.length === 0) return null;
    const subjectName = subject === 'math' ? 'Mathematik' : subject === 'deutsch' ? 'Deutsch' : 'Englisch';
    const date = new Date().toLocaleDateString('de-DE');

    let content = `# Lernzettel ${subjectName} – ${date}\n\n`;

    for (const topic of completedTopics) {
      const kb = KNOWLEDGE_BASE[subject] && KNOWLEDGE_BASE[subject][topic];
      if (kb) {
        content += `## ${topic}\n\n`;
        content += `**Regeln:**\n${kb.rules.map(r => `• ${r}`).join('\n')}\n\n`;
        content += `**Tipps:**\n${kb.tips.map(t => `→ ${t}`).join('\n')}\n\n---\n\n`;
      }
    }

    return { title: `${subjectName} – ${date}`, content, subject };
  };

  // Auto-Lernkarten aus Konzept generieren
  const generateFlashcardsForTopic = (subject, topic) => {
    const kb = KNOWLEDGE_BASE[subject] && KNOWLEDGE_BASE[subject][topic];
    if (!kb) return [];

    const cards = [];
    const subjectName = subject === 'math' ? 'Mathematik' : subject === 'deutsch' ? 'Deutsch' : 'Englisch';

    kb.rules.forEach((rule, i) => {
      const parts = rule.split(':');
      if (parts.length >= 2) {
        cards.push({ subject, topic, question: `[${subjectName}] ${parts[0].trim()}?`, answer: parts.slice(1).join(':').trim() });
      } else {
        cards.push({ subject, topic, question: `Was besagt Regel ${i+1} bei ${topic}?`, answer: rule });
      }
    });

    return cards;
  };

  return { evaluateMath, checkAnswer, getKnowledge, getAllSubjectKnowledge, generateResponse, generateAutoNote, generateFlashcardsForTopic, KNOWLEDGE_BASE };
})();
