/* ============================================
   Deutsch Engine - Aufgaben & Prüfung
   ============================================ */

const DeutschEngine = (() => {
  const TOPICS = [
    { id: 'grammatik', label: '📖 Wortarten', difficulty: 1 },
    { id: 'satzglieder', label: '🔗 Satzglieder', difficulty: 2 },
    { id: 'zeitformen', label: '⏰ Zeitformen', difficulty: 2 },
    { id: 'rechtschreibung', label: '✏️ Rechtschreibung', difficulty: 2 },
    { id: 'interpunktion', label: '，Interpunktion', difficulty: 2 },
    { id: 'wortschatz', label: '💬 Wortschatz', difficulty: 1 },
    { id: 'stilmittel', label: '🎨 Stilmittel', difficulty: 3 },
    { id: 'literatur', label: '📚 Literatur', difficulty: 3 },
    { id: 'charakterisierung', label: '🎭 Charakterisierung', difficulty: 3 },
    { id: 'inhaltsangabe', label: '📄 Inhaltsangabe', difficulty: 2 },
    { id: 'dramenanalyse', label: '🎬 Dramenanalyse', difficulty: 4 },
    { id: 'eroeiterung', label: '✍️ Erörterung', difficulty: 3 },
  ];

  let currentExercise = null;

  const generators = {
    grammatik: () => {
      const exercises = [
        { question: 'Welche Wortart ist das fett gedruckte Wort?\n"Das **schnelle** Auto fährt."', answer: 'adjektiv', hint: 'Adjektive beschreiben Nomen. Frage: Wie ist das Auto?', type: 'contains', topic: 'Grammatik' },
        { question: 'Welche Wortart ist das fett gedruckte Wort?\n"**Er** liest ein Buch."', answer: 'pronomen', hint: 'Pronomen stehen stellvertretend für Nomen', type: 'contains', topic: 'Grammatik' },
        { question: 'Welche Wortart ist das fett gedruckte Wort?\n"Das Kind **läuft** schnell."', answer: 'verb', hint: 'Verben sind Tätigkeits-/Handlungswörter', type: 'contains', topic: 'Grammatik' },
        { question: 'Welche Wortart ist das fett gedruckte Wort?\n"Die **Schule** beginnt früh."', answer: 'substantiv|nomen', hint: 'Substantive (Nomen) werden großgeschrieben', type: 'contains', topic: 'Grammatik' },
        { question: 'Welche Wortart ist **"sehr"** in diesem Satz?\n"Das Essen ist sehr lecker."', answer: 'adverb', hint: 'Adverbien beschreiben Verben oder Adjektive', type: 'contains', topic: 'Grammatik' },
        { question: 'Welche Wortart ist **"und"** in diesem Satz?\n"Peter und Lisa spielen."', answer: 'konjunktion', hint: 'Konjunktionen verbinden Sätze oder Satzteile', type: 'contains', topic: 'Grammatik' },
        { question: 'Wie lautet der Plural von "das Kind"?', answer: 'die Kinder', hint: 'Unregelmäßiger Plural: Kind → Kinder', type: 'exact', topic: 'Grammatik' },
        { question: 'Wie lautet der Genitiv Singular von "der Mann"?', answer: 'des Mannes', hint: 'Maskuline Substantive: des + Substantiv + (e)s', type: 'exact', topic: 'Grammatik' },
        { question: 'Welcher Artikel gehört zu "Haus"?\n(der/die/das)', answer: 'das', hint: 'Haus ist sächlich (Neutrum)', type: 'exact', topic: 'Grammatik' },
        { question: 'Welcher Artikel gehört zu "Schule"?\n(der/die/das)', answer: 'die', hint: 'Schule ist weiblich (Femininum)', type: 'exact', topic: 'Grammatik' },
        { question: 'Welcher Kasus (Fall) ist das Subjekt immer?', answer: 'nominativ', hint: 'Das Subjekt antwortet auf die Frage "Wer oder was?"', type: 'contains', topic: 'Grammatik' },
        { question: 'Welchen Kasus hat das direkte Objekt (Akkusativobjekt)?', answer: 'akkusativ', hint: 'Frage: "Wen oder was?"', type: 'contains', topic: 'Grammatik' },
      ];
      return exercises[Math.floor(Math.random() * exercises.length)];
    },

    satzglieder: () => {
      const exercises = [
        { question: 'Bestimme das Subjekt:\n"**Der Hund** bellt laut."', answer: 'der hund', hint: 'Subjekt: Wer oder was? → findet man mit der "Wer?"-Frage', type: 'contains', topic: 'Satzglieder' },
        { question: 'Bestimme das Prädikat:\n"Die Katze **schläft** im Korb."', answer: 'schläft', hint: 'Prädikat = das Verb im Satz', type: 'contains', topic: 'Satzglieder' },
        { question: 'Welches Satzglied ist "das Buch" in:\n"Das Kind liest **das Buch**."?', answer: 'akkusativobjekt|objekt', hint: 'Frage: "Was liest das Kind?" → Akkusativobjekt', type: 'contains', topic: 'Satzglieder' },
        { question: 'Welches Satzglied ist "dem Freund" in:\n"Er gibt **dem Freund** das Heft."?', answer: 'dativobjekt', hint: 'Frage: "Wem gibt er das Heft?" → Dativobjekt', type: 'contains', topic: 'Satzglieder' },
        { question: 'Bestimme das Satzglied "morgen" in:\n"**Morgen** fahren wir ans Meer."', answer: 'adverbiale|temporale|adverbialbestimmung', hint: 'Frage: Wann? → Temporale Adverbialbestimmung', type: 'contains', topic: 'Satzglieder' },
        { question: 'Mit welcher Frage findet man das Subjekt?', answer: 'wer oder was|wer? oder was?', hint: 'Das Subjekt ist der "Handelnde" im Satz', type: 'contains', topic: 'Satzglieder' },
        { question: 'Was ist der Unterschied zwischen Akkusativ- und Dativobjekt?\n(Erkläre kurz)', answer: 'akkusativ: wen oder was / dativ: wem', hint: 'Akkusativ: Wen/Was? | Dativ: Wem?', type: 'contains', topic: 'Satzglieder' },
      ];
      return exercises[Math.floor(Math.random() * exercises.length)];
    },

    zeitformen: () => {
      const verbData = [
        { inf: 'spielen', praesens: 'spielt', praeteritum: 'spielte', perfekt: 'gespielt', type: 'schwach' },
        { inf: 'gehen', praesens: 'geht', praeteritum: 'ging', perfekt: 'gegangen', type: 'stark' },
        { inf: 'haben', praesens: 'hat', praeteritum: 'hatte', perfekt: 'gehabt', type: 'unregel' },
        { inf: 'sein', praesens: 'ist', praeteritum: 'war', perfekt: 'gewesen', type: 'unregel' },
        { inf: 'lesen', praesens: 'liest', praeteritum: 'las', perfekt: 'gelesen', type: 'stark' },
        { inf: 'schreiben', praesens: 'schreibt', praeteritum: 'schrieb', perfekt: 'geschrieben', type: 'stark' },
        { inf: 'kommen', praesens: 'kommt', praeteritum: 'kam', perfekt: 'gekommen', type: 'stark' },
        { inf: 'machen', praesens: 'macht', praeteritum: 'machte', perfekt: 'gemacht', type: 'schwach' },
      ];

      const verb = verbData[Math.floor(Math.random() * verbData.length)];
      const type = Math.floor(Math.random() * 4);

      const exercises = [
        { question: `Wie lautet die **Präsensform** (er/sie/es) von "${verb.inf}"?`, answer: verb.praesens, hint: `${verb.type === 'schwach' ? 'Schwaches Verb: Stamm + t' : 'Starkes Verb: Stammvokalwechsel möglich'}`, type: 'exact', topic: 'Zeitformen' },
        { question: `Wie lautet die **Präteritumform** (er/sie/es) von "${verb.inf}"?`, answer: verb.praeteritum, hint: `Präteritum = Erzählvergangenheit`, type: 'exact', topic: 'Zeitformen' },
        { question: `Wie lautet das **Partizip II** von "${verb.inf}"? (für Perfekt)`, answer: verb.perfekt, hint: `Schwache Verben: ge- + Stamm + -t | Starke Verben: ge- + Stamm + -en`, type: 'exact', topic: 'Zeitformen' },
        { question: `Bilde das **Perfekt** (er): "${verb.inf}"`, answer: `er hat ${verb.perfekt}|er ist ${verb.perfekt}`, hint: `Perfekt = haben/sein + Partizip II`, type: 'contains', topic: 'Zeitformen' },
      ];
      return exercises[type];
    },

    rechtschreibung: () => {
      const exercises = [
        { question: 'Welches Wort ist richtig geschrieben?\nA) Straße  B) Strasse  C) straße', answer: 'a|straße', hint: 'ß nach langem Vokal oder Diphthong (au, ei, eu)', type: 'contains', topic: 'Rechtschreibung' },
        { question: 'Richtig oder falsch: "Das Wasser fliesst"\n(Antworte: richtig oder falsch)', answer: 'falsch', hint: 'ss nach kurzem Vokal: fließen (langes ie → ß)', type: 'exact', topic: 'Rechtschreibung' },
        { question: 'Welches Wort schreibt man groß?\n"er/das/laufen/freude"', answer: 'freude|das', hint: 'Substantive (Nomen) werden großgeschrieben', type: 'contains', topic: 'Rechtschreibung' },
        { question: 'Schreibe richtig: "das haus meines freundes"', answer: 'Das Haus meines Freundes', hint: 'Satzanfang groß, alle Nomen groß', type: 'exact', topic: 'Rechtschreibung' },
        { question: 'Welches Wort schreibt man mit "ie"?\n"v_l / L_be / b_tten"', answer: 'viel|liebe|bitten', hint: 'ie-Schreibung bei langem i-Laut', type: 'contains', topic: 'Rechtschreibung' },
        { question: 'Richtig oder falsch: "Er hat Angst"\n(Antworte: richtig oder falsch)', answer: 'richtig', hint: 'Angst ist ein Substantiv → Großschreibung', type: 'exact', topic: 'Rechtschreibung' },
        { question: 'Schreibe den Plural: "das Buch"', answer: 'die Bücher', hint: 'Buch → Bücher (Umlautbildung + er-Plural)', type: 'exact', topic: 'Rechtschreibung' },
        { question: 'Schreibe den Plural: "die Stadt"', answer: 'die Städte', hint: 'Stadt → Städte (Umlautbildung + e-Plural)', type: 'exact', topic: 'Rechtschreibung' },
        { question: 'Warum schreibt man "Wald" und nicht "Walt"?\n(Erkläre kurz)', answer: 'ableitung|wälder|verlängerung', hint: 'Verlängerungsprobe: Wald → Wälder (d bleibt)', type: 'contains', topic: 'Rechtschreibung' },
        { question: '"Das Kind spielt im __ark."\nWelcher Buchstabe fehlt? (P/B)', answer: 'p|park', hint: 'Verlängerung: Parks → P am Anfang', type: 'contains', topic: 'Rechtschreibung' },
      ];
      return exercises[Math.floor(Math.random() * exercises.length)];
    },

    interpunktion: () => {
      const exercises = [
        { question: 'Setze Kommas richtig:\n"Ich lerne Mathe Deutsch und Englisch."', answer: 'ich lerne mathe, deutsch und englisch.', hint: 'Aufzählung: zwischen allen Gliedern außer vor "und/oder" am Ende', type: 'contains', topic: 'Interpunktion' },
        { question: 'Braucht dieser Satz ein Komma vor "weil"?\n"Ich lerne weil ich die Prüfung bestehen will."\n(ja/nein)', answer: 'ja', hint: 'Vor Nebensatz-Konjunktionen (weil, dass, obwohl...) steht immer ein Komma', type: 'exact', topic: 'Interpunktion' },
        { question: 'Setze Kommas:\n"Er sagte dass er morgen kommt."', answer: 'er sagte, dass er morgen kommt.', hint: '"dass" leitet einen Nebensatz ein → Komma davor', type: 'contains', topic: 'Interpunktion' },
        { question: 'Braucht "obwohl" ein Komma davor?\n"Sie lernte obwohl sie müde war."\n(ja/nein)', answer: 'ja', hint: 'obwohl = Nebensatz-Konjunktion → immer Komma', type: 'exact', topic: 'Interpunktion' },
        { question: 'Welche Wörter brauchen ein Komma davor?\n(weil / aber / und / jedoch / dass)', answer: 'weil, dass|weil|dass|jedoch|aber', hint: 'Nebensatzkonjunktionen und adversative Konjunktionen', type: 'contains', topic: 'Interpunktion' },
        { question: 'Setze Satzzeichen richtig:\n"Hast du das Buch gelesen"', answer: 'Hast du das Buch gelesen?', hint: 'Fragesatz → Fragezeichen', type: 'contains', topic: 'Interpunktion' },
      ];
      return exercises[Math.floor(Math.random() * exercises.length)];
    },

    wortschatz: () => {
      const vocab = [
        { question: 'Was ist ein Synonym für "schnell"?', answer: 'rasch|flink|eilig|zügig|hurtig|behende', hint: 'Synonyme sind bedeutungsgleiche Wörter', type: 'contains', topic: 'Wortschatz' },
        { question: 'Was ist das Antonym (Gegenteil) von "groß"?', answer: 'klein|winzig|gering', hint: 'Antonyme sind bedeutungsgegensätzliche Wörter', type: 'contains', topic: 'Wortschatz' },
        { question: 'Was ist das Antonym von "laut"?', answer: 'leise|still|ruhig', hint: 'Gegenteil suchen', type: 'contains', topic: 'Wortschatz' },
        { question: 'Was bedeutet "ambivalent"?', answer: 'zwiespältig|doppeldeutig|gegensätzlich|widersprüchlich', hint: 'Latein: ambi- = beides, valere = gelten', type: 'contains', topic: 'Wortschatz' },
        { question: 'Was bedeutet "konsequent"?', answer: 'folgerichtig|beharrlich|konsequent durchhalten|durchhaltend', hint: 'Latein: consequi = folgen', type: 'contains', topic: 'Wortschatz' },
        { question: 'Erkläre den Begriff "Metapher" kurz.', answer: 'bildlicher|übertragener|vergleich ohne wie|sprachbild', hint: 'Stilmittel: ein Begriff wird übertragen verwendet', type: 'contains', topic: 'Wortschatz' },
        { question: 'Was ist ein Homonym? Nenne ein Beispiel.', answer: 'gleich lautend|schloss|bank|tor|flügel', hint: 'Gleiche Schreibung, verschiedene Bedeutung', type: 'contains', topic: 'Wortschatz' },
      ];
      return vocab[Math.floor(Math.random() * vocab.length)];
    },

    stilmittel: () => {
      const exercises = [
        { question: 'Welches Stilmittel liegt vor?\n"Das Leben ist ein Traum."', answer: 'metapher', hint: 'Übertragener Ausdruck ohne "wie" oder "als"', type: 'contains', topic: 'Stilmittel' },
        { question: 'Welches Stilmittel liegt vor?\n"Der Wind flüstert durch die Bäume."', answer: 'personifikation', hint: 'Eine Sache erhält menschliche Eigenschaften', type: 'contains', topic: 'Stilmittel' },
        { question: 'Welches Stilmittel liegt vor?\n"Er ist so schnell wie ein Blitz."', answer: 'vergleich|simile', hint: '"wie" oder "als" im Vergleich → kein Metapher', type: 'contains', topic: 'Stilmittel' },
        { question: 'Welches Stilmittel liegt vor?\n"Milch, Mehl, Mohn macht müde Menschen munter."', answer: 'alliteration', hint: 'Gleicher Anfangsbuchstabe bei mehreren Wörtern', type: 'contains', topic: 'Stilmittel' },
        { question: 'Welches Stilmittel liegt vor?\n"Er ist gerade der Größte!" (Er ist eigentlich klein)', answer: 'ironie', hint: 'Das Gegenteil wird gemeint', type: 'contains', topic: 'Stilmittel' },
        { question: 'Was ist eine Anaphora?', answer: 'wiederholung am satzanfang|wortwiederholung zu beginn|rhetorische wiederholung', hint: 'Wiederholung desselben Wortes/Satzes am Anfang', type: 'contains', topic: 'Stilmittel' },
        { question: 'Was ist eine Euphemismus? Gib ein Beispiel.', answer: 'beschönigung|verharmlosung|entlassung|kollateralschäden|heimgang', hint: 'Beschönigung einer unangenehmen Aussage', type: 'contains', topic: 'Stilmittel' },
      ];
      return exercises[Math.floor(Math.random() * exercises.length)];
    },

    literatur: () => {
      const exercises = [
        { question: 'Zu welcher Gattung gehört ein Roman?\n(Epik / Lyrik / Dramatik)', answer: 'epik', hint: 'Epik = Prosa mit Erzähler (Roman, Novelle, Kurzgeschichte)', type: 'contains', topic: 'Literatur' },
        { question: 'Was ist ein Sonett?', answer: 'gedicht|14 verse|zwei quartette|zwei terzette|vierzeiler', hint: '14 Verse, unterteilt in 2 Quartette und 2 Terzette', type: 'contains', topic: 'Literatur' },
        { question: 'Was unterscheidet Novelle und Roman?', answer: 'novelle kürzer|novelle eine handlung|roman länger|roman mehrere|begebenheit', hint: 'Novelle: kürzer, eine zentrale Begebenheit', type: 'contains', topic: 'Literatur' },
        { question: 'Was versteht man unter der "Exposition" eines Dramas?', answer: 'einleitung|einführung|figuren werden vorgestellt|ausgangssituation', hint: '1. Akt: Einführung in Personen und Ausgangssituation', type: 'contains', topic: 'Literatur' },
        { question: 'Was ist eine "Ich-Erzählperspektive"?', answer: 'erzähler ist figur|erste person|ich erzähle selbst|ich-form', hint: 'Der Erzähler ist selbst eine Figur in der Geschichte', type: 'contains', topic: 'Literatur' },
        { question: 'Welche Epoche steht für Vernunft und Aufklärung (ca. 1720-1800)?', answer: 'aufklärung', hint: 'Lessing, Kant – Vernunft über Aberglaube', type: 'contains', topic: 'Literatur' },
        { question: 'Wer schrieb "Faust"?', answer: 'goethe|johann wolfgang von goethe', hint: 'Einer der bedeutendsten deutschen Schriftsteller', type: 'contains', topic: 'Literatur' },
      ];
      return exercises[Math.floor(Math.random() * exercises.length)];
    }
  };

  const generate = (topicId) => {
    if (!generators[topicId]) return null;
    currentExercise = generators[topicId]();
    return currentExercise;
  };

  const checkAnswer = (userAnswer) => {
    if (!currentExercise) return null;
    return Brain.checkAnswer(userAnswer, currentExercise.answer, currentExercise.type);
  };

  // ===== NEUE THEMEN =====
  generators.charakterisierung = () => {
    const exercises = [
      { question: 'In welcher **Reihenfolge** baut man eine Charakterisierung auf?\n(Einleitung / Hauptteil / Schluss)', answer: 'einleitung|hauptteil|schluss', hint: 'Klassischer Dreischritt: Einleitung → Hauptteil → Schluss', type: 'contains', topic: 'Charakterisierung' },
      { question: 'Was gehört in die **Einleitung** einer Charakterisierung?\n(Nenne 3 Elemente)', answer: 'name|werk|autor|figur|kurz|erscheint', hint: 'Name der Figur, Werk/Autor, kurze Vorstellung der Rolle', type: 'contains', topic: 'Charakterisierung' },
      { question: 'Was ist der Unterschied zwischen **direkter und indirekter Charakterisierung**?', answer: 'direkt: autor beschreibt|indirekt: handlungen|verhalten|dialog|indirekt zeigt|direkt sagt', hint: 'Direkt: Autor nennt Eigenschaften | Indirekt: Leser erschließt aus Verhalten', type: 'contains', topic: 'Charakterisierung' },
      { question: 'Formuliere einen **Einleitungssatz** für eine Charakterisierung:\nFigur: "Gregor Samsa" aus "Die Verwandlung" von Kafka', answer: 'gregor samsa|verwandlung|kafka|hauptfigur', hint: 'Muster: "Die folgende Charakterisierung befasst sich mit [Figur] aus [Werk] von [Autor]."', type: 'contains', topic: 'Charakterisierung' },
      { question: 'Welche **Aspekte** werden im Hauptteil einer Charakterisierung analysiert?\n(Nenne mindestens 3)', answer: 'äußere erscheinung|charakter|verhalten|beziehungen|entwicklung|eigenschaften', hint: 'Äußeres → Inneres → Verhalten → Beziehungen → Entwicklung', type: 'contains', topic: 'Charakterisierung' },
      { question: 'Welcher **Tempus** (Zeitform) wird in einer Charakterisierung verwendet?', answer: 'präsens', hint: 'In literarischen Analysen immer Präsens verwenden!', type: 'contains', topic: 'Charakterisierung' },
      { question: 'Wie belegt man eine Behauptung in der Charakterisierung?', answer: 'zitat|textstelle|beleg|nachweis|beispiel', hint: 'Behauptung → Beleg (Zitat/Textstelle) → Deutung', type: 'contains', topic: 'Charakterisierung' },
      { question: 'Was ist der **Unterschied** zwischen Charakterisierung und Personenbeschreibung?', answer: 'charakterisierung: innere eigenschaften|literarisch|analyse|personenbeschreibung: äußerlich|real', hint: 'Charakterisierung = literarische Figur, innere+äußere Analyse | Personenbeschreibung = reale Person, meist äußerlich', type: 'contains', topic: 'Charakterisierung' },
      { question: 'Was schreibt man in den **Schluss** einer Charakterisierung?', answer: 'fazit|zusammenfassung|bedeutung|funktion|stellung|gesamteindruck', hint: 'Fazit: Gesamtbewertung der Figur + ihre Funktion im Werk', type: 'contains', topic: 'Charakterisierung' },
      { question: 'Korrigiere: "Der Autor schrieb, dass Hamlet traurig war."\nWas ist falsch?', answer: 'tempus|vergangenheit|präsens|schreibt|ist', hint: 'Literarisches Präsens: "Der Autor schreibt, dass Hamlet traurig ist."', type: 'contains', topic: 'Charakterisierung' },
    ];
    return exercises[Math.floor(Math.random() * exercises.length)];
  };

  generators.inhaltsangabe = () => {
    const exercises = [
      { question: 'Welche **5 W-Fragen** beantwortet eine Inhaltsangabe?', answer: 'wer|was|wann|wo|warum|wie', hint: 'Wer? Was? Wann? Wo? Warum? (+ Wie?)', type: 'contains', topic: 'Inhaltsangabe' },
      { question: 'In welchem **Tempus** schreibt man eine Inhaltsangabe?', answer: 'präsens', hint: 'Inhaltsangabe IMMER im Präsens (Gegenwartsform)!', type: 'exact', topic: 'Inhaltsangabe' },
      { question: 'Was gehört in den **Einleitungssatz** einer Inhaltsangabe?\n(nenne alle Elemente)', answer: 'titel|autor|textsorte|erscheinungsjahr|thema', hint: 'Muster: "[Textsorte] „[Titel]" von [Autor] ([Jahr]) handelt von..."', type: 'contains', topic: 'Inhaltsangabe' },
      { question: 'Formuliere einen korrekten **Einleitungssatz**:\nRoman "Der Vorleser", Bernhard Schlink, 1995', answer: 'roman|vorleser|bernhard schlink|1995|handelt', hint: 'Die Inhaltsangabe des Romans „Der Vorleser" von Bernhard Schlink (1995) handelt von...', type: 'contains', topic: 'Inhaltsangabe' },
      { question: 'Was soll eine Inhaltsangabe **NICHT** enthalten?', answer: 'eigene meinung|wertung|direkte rede|zitat|wörtliche rede|gefühle', hint: 'Nur Wiedergabe des Inhalts – keine Meinung, keine Zitate, keine direkte Rede!', type: 'contains', topic: 'Inhaltsangabe' },
      { question: 'Wie formuliert man **indirekte Rede** in der Inhaltsangabe?\nBeispiel: Er sagte: "Ich komme morgen."', answer: 'er sage|er käme|konjunktiv|er komme|indirekte rede', hint: 'Indirekte Rede: Konjunktiv I → "Er sagte, er komme morgen."', type: 'contains', topic: 'Inhaltsangabe' },
      { question: 'Welche **Wörter** helfen beim Strukturieren einer Inhaltsangabe?\n(Nenne Beispiele)', answer: 'zunächst|danach|anschließend|schließlich|daraufhin|zum schluss|darüber hinaus', hint: 'Temporale Konnektoren: zunächst, danach, anschließend, schließlich, daraufhin...', type: 'contains', topic: 'Inhaltsangabe' },
      { question: 'Wie lang sollte eine Inhaltsangabe sein?\n(Verhältnis zum Original)', answer: '10|quarter|viertel|25|kürzer|zusammengefasst', hint: 'Faustregel: ca. 1/4 bis max. 1/3 des Originals – nur das Wesentliche!', type: 'contains', topic: 'Inhaltsangabe' },
      { question: 'Darf man in der Inhaltsangabe **Rückblenden oder Vorgriffe** erwähnen?', answer: 'ja|kann|wenn wichtig|wenn zum verständnis', hint: 'Ja, aber: immer die chronologische Handlung im Fokus behalten', type: 'contains', topic: 'Inhaltsangabe' },
      { question: 'Was unterscheidet eine **Inhaltsangabe** von einer **Zusammenfassung**?', answer: 'inhaltsangabe: literarischer text|zusammenfassung: allgemein|sachtext|beide: kürzen', hint: 'Inhaltsangabe: speziell für literarische Texte | Zusammenfassung: für Sach- und Fachtexte', type: 'contains', topic: 'Inhaltsangabe' },
    ];
    return exercises[Math.floor(Math.random() * exercises.length)];
  };

  generators.dramenanalyse = () => {
    const exercises = [
      { question: 'Aus welchen **5 Akten** besteht das klassische Drama nach Aristoteles/Freytag?', answer: 'exposition|steigende handlung|höhepunkt|fallende handlung|katastrophe|auflösung', hint: '1. Exposition 2. Steigende Handlung 3. Höhepunkt/Peripetie 4. Fallende Handlung 5. Katastrophe/Lösung', type: 'contains', topic: 'Dramenanalyse' },
      { question: 'Was ist eine **Peripetie** im Drama?', answer: 'wendepunkt|umschwung|wende|entscheidende wendung|schicksalswende', hint: 'Der entscheidende Wendepunkt/Umschwung – meist im 3. Akt', type: 'contains', topic: 'Dramenanalyse' },
      { question: 'Was ist eine **Exposition** im Drama?', answer: 'einleitung|einführung|vorstellung|ausgangslage|figuren vorgestellt|konflikt angedeutet', hint: '1. Akt: Figuren und Ausgangssituation werden eingeführt, Konflikt angedeutet', type: 'contains', topic: 'Dramenanalyse' },
      { question: 'Was unterscheidet **Tragödie** und **Komödie**?', answer: 'tragödie: trauriges ende|tod|scheitern|komödie: glückliches ende|hochzeit|auflösung', hint: 'Tragödie: Ende in Leid/Tod | Komödie: Ende in Glück/Lösung', type: 'contains', topic: 'Dramenanalyse' },
      { question: 'Was ist ein **Monolog** im Drama?', answer: 'eine person|allein|selbstgespräch|inneres gefühl|gedanken laut', hint: 'Eine Figur spricht allein auf der Bühne – Gedanken werden laut', type: 'contains', topic: 'Dramenanalyse' },
      { question: 'Was versteht man unter dem **epischen Theater** (Brecht)?', answer: 'verfremdung|zuschauer nachdenken|nicht mitfühlen|kritisch|v-effekt', hint: 'Brecht: Zuschauer soll NICHT mitfühlen, sondern kritisch nachdenken (Verfremdungseffekt)', type: 'contains', topic: 'Dramenanalyse' },
      { question: 'Was ist ein **Akt** und was ist eine **Szene** im Drama?', answer: 'akt: großer abschnitt|szene: kleiner|vorhang|ort oder personenwechsel', hint: 'Akt = großer Abschnitt (Vorhang fällt) | Szene = kleinere Einheit (Personenwechsel/Ortswechsel)', type: 'contains', topic: 'Dramenanalyse' },
      { question: 'Wie analysiert man einen **Dialog** im Drama?\n(Nenne die wichtigsten Analysepunkte)', answer: 'ton|verhältnis|macht|dominanz|absicht|strategie|information|gefühl', hint: 'Wer spricht wie viel? Wer dominiert? Welche Absicht? Welche Informationen werden geteilt?', type: 'contains', topic: 'Dramenanalyse' },
      { question: 'Was ist eine **Regieanweisung** (Bühnenanweisung)?', answer: 'anweisung|kursiv|klammer|regie|bühne|handlung|not verbally|bewegung', hint: 'In Klammern oder kursiv: Anweisungen für Schauspieler/Regie – gehören nicht zum Dialog', type: 'contains', topic: 'Dramenanalyse' },
      { question: 'Was ist der **Unterschied** zwischen offenem und geschlossenem Drama?', answer: 'geschlossen: einheit von ort zeit handlung|offen: verschiedene orte|zeiten|keine strenge einheit', hint: 'Geschlossen (klassisch): Einheit von Ort, Zeit, Handlung | Offen (modern): freie Struktur', type: 'contains', topic: 'Dramenanalyse' },
      { question: 'Nenne 3 **berühmte deutsche Dramen** und ihre Autoren.', answer: 'faust|goethe|kabale und liebe|schiller|nathan|lessing|woyzeck|büchner|brecht', hint: 'Faust (Goethe) / Kabale und Liebe (Schiller) / Nathan der Weise (Lessing) / Woyzeck (Büchner)', type: 'contains', topic: 'Dramenanalyse' },
    ];
    return exercises[Math.floor(Math.random() * exercises.length)];
  };

  generators.eroeiterung = () => {
    const exercises = [
      { question: 'Was ist der **Aufbau** einer Erörterung?', answer: 'einleitung|hauptteil|schluss|these|argument|beispiel|fazit', hint: 'Einleitung (These) → Hauptteil (Argumente + Beispiele) → Schluss (Fazit)', type: 'contains', topic: 'Erörterung' },
      { question: 'Was ist das **Sanduhr-Prinzip** bei der Erörterung?', answer: 'gegenargumente|eigene meinung|stärkste argumente zuletzt|pro contra', hint: 'Erst Gegenargumente, dann eigene Meinung – stärkstes Argument zuletzt (Steigerung)', type: 'contains', topic: 'Erörterung' },
      { question: 'Welche **Argumente** sind in einer Erörterung besonders überzeugend?\n(Typen nennen)', answer: 'fakten|statistik|experten|beispiele|logisch|erfahrung|normativ', hint: 'Faktenargument / Expertenargument / Beispielargument / Normatives Argument', type: 'contains', topic: 'Erörterung' },
      { question: 'Was ist der Unterschied zwischen **linearer und dialektischer Erörterung**?', answer: 'linear: nur eine seite|dialektisch: pro und contra|beide seiten|abwägung', hint: 'Linear: nur eine Position | Dialektisch: Pro und Contra, dann eigenes Fazit', type: 'contains', topic: 'Erörterung' },
      { question: 'Formuliere einen **Einleitungssatz** für eine Erörterung zum Thema "Handyverbot in der Schule".', answer: 'handyverbot|schule|frage|diskutiert|debattiert|kontrovers', hint: 'Muster: "Das Thema [X] wird derzeit kontrovers diskutiert. In der folgenden Erörterung..."', type: 'contains', topic: 'Erörterung' },
    ];
    return exercises[Math.floor(Math.random() * exercises.length)];
  };

  const getHint = () => currentExercise ? currentExercise.hint : null;
  const getTopics = () => TOPICS;
  const getTopicLabel = (id) => { const t = TOPICS.find(t => t.id === id); return t ? t.label : id; };
  const getKnowledgeName = () => currentExercise ? currentExercise.topic : null;

  return { generate, checkAnswer, getHint, getSolutionSteps: () => null, getTopics, getTopicLabel, getKnowledgeName, current: () => currentExercise };
})();
