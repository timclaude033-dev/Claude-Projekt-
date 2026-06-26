/* ============================================
   English Engine - Exercises & Checking
   ============================================ */

const EnglishEngine = (() => {
  const TOPICS = [
    { id: 'tenses', label: '⏰ Tenses', difficulty: 2 },
    { id: 'grammar', label: '📖 Grammar', difficulty: 2 },
    { id: 'vocabulary', label: '💬 Vocabulary Basic', difficulty: 1 },
    { id: 'vocab_advanced', label: '📚 Vocabulary Advanced', difficulty: 2 },
    { id: 'vocab_thematic', label: '🌍 Thematic Vocab', difficulty: 2 },
    { id: 'irregular_verbs', label: '🔄 Irregular Verbs', difficulty: 2 },
    { id: 'articles', label: '📌 Articles', difficulty: 1 },
    { id: 'prepositions', label: '📍 Prepositions', difficulty: 2 },
    { id: 'conditional', label: '🔀 Conditional', difficulty: 3 },
    { id: 'passive', label: '🔄 Passive Voice', difficulty: 3 },
    { id: 'relative', label: '🔗 Relative Clauses', difficulty: 3 },
    { id: 'reported_speech', label: '💬 Reported Speech', difficulty: 3 },
    { id: 'modal_verbs', label: '⚡ Modal Verbs', difficulty: 2 },
  ];

  let currentExercise = null;

  const generators = {
    tenses: () => {
      const exercises = [
        { question: 'Complete with the correct tense (Present Simple):\n"She ___ (to go) to school every day."', answer: 'goes', hint: 'Present Simple, 3rd person singular: verb + -s', type: 'exact', topic: 'Grammar Tenses' },
        { question: 'Complete with the correct tense (Present Continuous):\n"They ___ (to play) football right now."', answer: 'are playing', hint: 'Present Continuous: am/is/are + verb-ing', type: 'exact', topic: 'Grammar Tenses' },
        { question: 'Complete with the correct tense (Past Simple):\n"Yesterday, he ___ (to eat) pizza."', answer: 'ate', hint: 'Past Simple of "eat" is irregular: eat → ate', type: 'exact', topic: 'Grammar Tenses' },
        { question: 'Complete with the correct tense (Present Perfect):\n"I ___ never ___ (to be) to Paris."', answer: 'have never been|have been', hint: 'Present Perfect: have/has + past participle', type: 'contains', topic: 'Grammar Tenses' },
        { question: 'Complete with the correct tense (Future with "will"):\n"It is cloudy. It ___ (to rain) tomorrow."', answer: 'will rain', hint: 'Future Simple: will + infinitive', type: 'exact', topic: 'Grammar Tenses' },
        { question: 'Which tense do we use for habits and routines?', answer: 'present simple', hint: 'Signal words: always, usually, often, every day', type: 'contains', topic: 'Grammar Tenses' },
        { question: 'Which tense do we use for actions happening right now?', answer: 'present continuous|present progressive', hint: 'Signal words: now, at the moment, currently', type: 'contains', topic: 'Grammar Tenses' },
        { question: 'What is the Past Simple of "go"?', answer: 'went', hint: 'Irregular verb: go → went → gone', type: 'exact', topic: 'Grammar Tenses' },
        { question: 'What is the Past Simple of "buy"?', answer: 'bought', hint: 'Irregular verb: buy → bought → bought', type: 'exact', topic: 'Grammar Tenses' },
        { question: 'What is the Past Participle of "write"?', answer: 'written', hint: 'Irregular verb: write → wrote → written', type: 'exact', topic: 'Grammar Tenses' },
        { question: 'Complete: "She has ___ (to write) three books."', answer: 'written', hint: 'Present Perfect needs the Past Participle', type: 'exact', topic: 'Grammar Tenses' },
        { question: 'Choose the correct form:\n"I am ___ to the cinema tonight."\n(go / going / went)', answer: 'going', hint: 'Be going to = planned future action', type: 'exact', topic: 'Grammar Tenses' },
      ];
      return exercises[Math.floor(Math.random() * exercises.length)];
    },

    grammar: () => {
      const exercises = [
        { question: 'Choose the correct form:\n"This is ___ best film I have ever seen."\n(a / an / the)', answer: 'the', hint: 'Superlatives always use "the"', type: 'exact', topic: 'Grammar Tenses' },
        { question: 'Make it negative:\n"He can swim."', answer: 'he cannot swim|he can\'t swim', hint: 'can → cannot / can\'t', type: 'contains', topic: 'Grammar Tenses' },
        { question: 'Form a question:\n"She likes pizza."', answer: 'does she like pizza?|does she like pizza', hint: 'Present Simple question: Do/Does + subject + infinitive', type: 'contains', topic: 'Grammar Tenses' },
        { question: 'Choose the correct comparative:\n"This box is ___ (heavy) than that one."', answer: 'heavier', hint: 'Short adjectives + -er: heavy → heavier (y → ier)', type: 'exact', topic: 'Grammar Tenses' },
        { question: 'What is the superlative of "good"?', answer: 'the best|best', hint: 'Irregular: good → better → the best', type: 'contains', topic: 'Grammar Tenses' },
        { question: 'What is the comparative of "beautiful"?', answer: 'more beautiful', hint: 'Long adjectives: more + adjective', type: 'exact', topic: 'Grammar Tenses' },
        { question: 'Choose correctly:\n"There ___ many people at the party."\n(was / were)', answer: 'were', hint: 'many people = plural → were', type: 'exact', topic: 'Grammar Tenses' },
        { question: 'Choose correctly:\n"I have lived here ___ 5 years."\n(since / for)', answer: 'for', hint: 'for + period of time | since + point in time', type: 'exact', topic: 'Grammar Tenses' },
        { question: 'Choose correctly:\n"She arrived ___ Monday."\n(at / on / in)', answer: 'on', hint: 'on + days of the week', type: 'exact', topic: 'Grammar Tenses' },
      ];
      return exercises[Math.floor(Math.random() * exercises.length)];
    },

    vocabulary: () => {
      const vocabPairs = [
        { q: 'What is the English word for "Freundschaft"?', a: 'friendship', h: 'Friend = Freund + -ship (noun suffix)' },
        { q: 'What does "ambitious" mean in German?', a: 'ehrgeizig|strebsam|ambitioniert', h: 'Think of "ambition"' },
        { q: 'What is the English word for "Verantwortung"?', a: 'responsibility', h: 'responsible = verantwortlich → responsibility' },
        { q: 'What does "despite" mean?', a: 'trotz|obwohl|ungeachtet', h: '"Despite the rain, we went out." = Trotz des Regens gingen wir raus.' },
        { q: 'What is a synonym for "happy"?', a: 'glad|joyful|cheerful|pleased|delighted|content', h: 'Several words express positive emotions' },
        { q: 'What is the opposite of "success"?', a: 'failure', h: 'succeed (Verb) ↔ fail | success ↔ failure' },
        { q: 'What does "approximately" mean?', a: 'ungefähr|etwa|circa', h: 'Similar to: about, around, roughly' },
        { q: 'What is the English word for "Meinungsverschiedenheit"?', a: 'disagreement|dispute|difference of opinion', h: 'dis- (not) + agree + -ment' },
        { q: 'What does "although" mean?', a: 'obwohl|obgleich|auch wenn', h: 'Similar to "even though" / "though"' },
        { q: 'What is the English word for "Umwelt"?', a: 'environment', h: 'environmental problems = Umweltprobleme' },
        { q: 'What does "persuade" mean?', a: 'überzeugen|überreden|jemanden dazu bringen', h: 'I persuaded him to come = Ich überzeugte ihn zu kommen' },
        { q: 'What is the English word for "Gesetze"?', a: 'laws', h: 'One law, many laws' },
      ];
      const pair = vocabPairs[Math.floor(Math.random() * vocabPairs.length)];
      return { question: pair.q, answer: pair.a, hint: pair.h, type: 'contains', topic: 'Vocabulary' };
    },

    articles: () => {
      const exercises = [
        { question: 'Fill in: "___ apple a day keeps the doctor away."', answer: 'an', hint: '"a" before consonant sounds, "an" before vowel sounds', type: 'exact', topic: 'Articles' },
        { question: 'Fill in: "She is ___ best student in the class."', answer: 'the', hint: 'Superlative → always "the"', type: 'exact', topic: 'Articles' },
        { question: 'Fill in: "I want to become ___ engineer."', answer: 'an', hint: '"engineer" starts with a vowel sound /ɛ/', type: 'exact', topic: 'Articles' },
        { question: 'Fill in: "___ sun rises in the east."', answer: 'the', hint: '"The" is used for unique things', type: 'exact', topic: 'Articles' },
        { question: 'Fill in: "I go to ___ school by bus."\n(a / the / no article)', answer: 'no article|-', hint: 'No article with institutions used for their purpose', type: 'contains', topic: 'Articles' },
        { question: 'Fill in: "She plays ___ guitar."', answer: 'the', hint: '"The" is used with musical instruments', type: 'exact', topic: 'Articles' },
        { question: 'Fill in: "This is ___ interesting book."', answer: 'an', hint: '"interesting" starts with a vowel sound', type: 'exact', topic: 'Articles' },
        { question: 'When do we NOT use an article?\n(Give one example rule)', answer: 'plural general|uncountable general|proper nouns|countries|languages|sports', hint: 'Think about general statements', type: 'contains', topic: 'Articles' },
      ];
      return exercises[Math.floor(Math.random() * exercises.length)];
    },

    prepositions: () => {
      const exercises = [
        { question: 'Choose: "The meeting is ___ Monday ___ 3 pm."\n(at/on/in for both blanks)', answer: 'on monday at 3|on...at', hint: 'on + day, at + specific time', type: 'contains', topic: 'Prepositions' },
        { question: 'Fill in: "She was born ___ 1998."', answer: 'in', hint: 'in + year / in + month / in + season', type: 'exact', topic: 'Prepositions' },
        { question: 'Fill in: "I have been waiting ___ two hours."', answer: 'for', hint: 'for + period of time', type: 'exact', topic: 'Prepositions' },
        { question: 'Fill in: "He has lived here ___ 2010."', answer: 'since', hint: 'since + specific point in time', type: 'exact', topic: 'Prepositions' },
        { question: 'Fill in: "The book is ___ the table." (on it, physically)', answer: 'on', hint: 'on = on a surface', type: 'exact', topic: 'Prepositions' },
        { question: 'Fill in: "The cat is ___ the box." (inside)', answer: 'in', hint: 'in = inside an enclosed space', type: 'exact', topic: 'Prepositions' },
        { question: 'Fill in: "She arrived ___ the airport."', answer: 'at', hint: 'at = at a specific point/location', type: 'exact', topic: 'Prepositions' },
        { question: 'Fill in: "I go to school ___ foot."', answer: 'on', hint: 'Means of transport on foot: on foot', type: 'exact', topic: 'Prepositions' },
      ];
      return exercises[Math.floor(Math.random() * exercises.length)];
    },

    conditional: () => {
      const exercises = [
        { question: 'Complete (Type 1 Conditional):\n"If it ___ (to rain), I ___ (to stay) at home."', answer: 'rains, i will stay|rains...will stay', hint: 'Type 1: If + Present Simple, will + infinitive', type: 'contains', topic: 'Conditional' },
        { question: 'Complete (Type 2 Conditional):\n"If I ___ (to have) more money, I ___ (to travel) the world."', answer: 'had...would travel|if i had more money, i would travel', hint: 'Type 2: If + Past Simple, would + infinitive', type: 'contains', topic: 'Conditional' },
        { question: 'Complete (Type 3 Conditional):\n"If she ___ (to study) harder, she ___ (to pass) the exam."', answer: 'had studied...would have passed', hint: 'Type 3: If + Past Perfect, would have + past participle', type: 'contains', topic: 'Conditional' },
        { question: 'Which conditional type is used for real/possible future situations?', answer: 'type 1|first conditional', hint: 'If it rains, I will...', type: 'contains', topic: 'Conditional' },
        { question: 'Which conditional type is used for unreal/hypothetical present situations?', answer: 'type 2|second conditional', hint: 'If I were rich, I would...', type: 'contains', topic: 'Conditional' },
        { question: 'Complete (Type 0):\n"If you ___ (to heat) water to 100°C, it ___ (to boil)."', answer: 'heat...boils|heat water...it boils', hint: 'Type 0: General truth, both clauses in Present Simple', type: 'contains', topic: 'Conditional' },
      ];
      return exercises[Math.floor(Math.random() * exercises.length)];
    },

    passive: () => {
      const exercises = [
        { question: 'Change to passive voice:\n"The dog bites the man."', answer: 'the man is bitten by the dog', hint: 'Passive: Object + to be + past participle + (by + agent)', type: 'contains', topic: 'Passive Voice' },
        { question: 'Change to passive voice:\n"Shakespeare wrote Hamlet."', answer: 'hamlet was written by shakespeare', hint: 'Past passive: was/were + past participle', type: 'contains', topic: 'Passive Voice' },
        { question: 'Change to passive voice:\n"They are building a new school."', answer: 'a new school is being built', hint: 'Present Continuous passive: is/are + being + past participle', type: 'contains', topic: 'Passive Voice' },
        { question: 'What is the Past Participle of "build"?', answer: 'built', hint: 'Irregular: build → built → built', type: 'exact', topic: 'Passive Voice' },
        { question: 'When do we use the passive voice?\n(Give the main reason)', answer: 'agent unknown|agent unimportant|focus on action|focus on object', hint: 'When the "doer" is not important or unknown', type: 'contains', topic: 'Passive Voice' },
        { question: 'Change to passive (Present Perfect):\n"They have finished the project."', answer: 'the project has been finished', hint: 'Present Perfect passive: has/have + been + past participle', type: 'contains', topic: 'Passive Voice' },
      ];
      return exercises[Math.floor(Math.random() * exercises.length)];
    },

    relative: () => {
      const exercises = [
        { question: 'Fill in the correct relative pronoun:\n"The man ___ called you is my uncle."', answer: 'who', hint: 'who = for people', type: 'exact', topic: 'Relative Clauses' },
        { question: 'Fill in the correct relative pronoun:\n"The book ___ I read was amazing."', answer: 'which|that', hint: 'which/that = for things', type: 'contains', topic: 'Relative Clauses' },
        { question: 'Fill in the correct relative pronoun:\n"The girl ___ bag was stolen went to the police."', answer: 'whose', hint: 'whose = possession (shows belonging)', type: 'exact', topic: 'Relative Clauses' },
        { question: 'Fill in the correct relative pronoun:\n"The town ___ I was born is small."', answer: 'where', hint: 'where = for places', type: 'exact', topic: 'Relative Clauses' },
        { question: 'Is this a defining or non-defining relative clause?\n"My brother, who lives in London, is a doctor."', answer: 'non-defining', hint: 'Non-defining: has commas, adds extra info', type: 'contains', topic: 'Relative Clauses' },
        { question: 'Can we omit the relative pronoun here?\n"The film (that) I watched was great."', answer: 'yes', hint: 'Relative pronoun can be omitted when it is the object', type: 'contains', topic: 'Relative Clauses' },
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

  generators.vocab_advanced = () => {
    const vocab = [
      { q: 'What does "inevitable" mean?', a: 'unvermeidlich|unausweichlich|zwangsläufig', h: 'in- (not) + evitable → cannot be avoided' },
      { q: 'What does "ambiguous" mean?', a: 'zweideutig|mehrdeutig|unklar|doppeldeutig', h: 'ambi- = both → can be interpreted in more than one way' },
      { q: 'What does "persevere" mean?', a: 'durchhalten|beharren|weitermachen|nicht aufgeben', h: 'per- (through) + severe → to keep going despite difficulties' },
      { q: 'What does "contemplate" mean?', a: 'nachdenken|überlegen|betrachten|erwägen', h: 'To think deeply about something' },
      { q: 'What does "elaborate" mean as an adjective?', a: 'ausgearbeitet|detailliert|aufwendig|komplex', h: 'Carefully worked out, with many details' },
      { q: 'What does "concise" mean?', a: 'prägnant|kurz und bündig|knapp|kurz gefasst', h: 'Opposite of verbose/wordy – short but complete' },
      { q: 'What does "advocate" mean as a verb?', a: 'befürworten|eintreten für|vertreten|unterstützen', h: '"I advocate for human rights" = Ich trete für Menschenrechte ein' },
      { q: 'What does "predominantly" mean?', a: 'überwiegend|hauptsächlich|vorwiegend|größtenteils', h: 'Mostly, for the most part' },
      { q: 'What does "reinforce" mean?', a: 'verstärken|bekräftigen|stärken|untermauern', h: 'To make stronger or support' },
      { q: 'What does "coherent" mean?', a: 'kohärent|zusammenhängend|logisch|schlüssig', h: 'Logical and consistent, fitting together well' },
      { q: 'What does "imply" mean?', a: 'andeuten|implizieren|nahelegen|bedeuten', h: 'To suggest without saying directly' },
      { q: 'What does "substantial" mean?', a: 'erheblich|beträchtlich|wesentlich|bedeutend', h: 'Large in size, amount, or importance' },
      { q: 'What does "undermine" mean?', a: 'untergraben|schwächen|aushöhlen|sabotieren', h: 'To weaken or damage gradually' },
      { q: 'What is the noun form of "develop"?', a: 'development', h: 'develop → development (-ment suffix for nouns)' },
      { q: 'What is the adjective form of "rely"?', a: 'reliable', h: 'rely → reliable (-able suffix)' },
    ];
    const pair = vocab[Math.floor(Math.random() * vocab.length)];
    return { question: pair.q, answer: pair.a, hint: pair.h, type: 'contains', topic: 'Vocabulary Advanced' };
  };

  generators.vocab_thematic = () => {
    const themes = [
      { theme: '🌍 Environment', words: [
        { q: 'What is the English word for "Klimawandel"?', a: 'climate change', h: 'One of the biggest global challenges' },
        { q: 'What does "sustainable" mean?', a: 'nachhaltig', h: 'sustainable development = nachhaltige Entwicklung' },
        { q: 'What does "renewable energy" mean?', a: 'erneuerbare energie', h: 'Solar, wind, water → renewable' },
        { q: 'What is "deforestation"?', a: 'abholzung|entwaldung', h: 'de- (remove) + forest → removing trees' },
        { q: 'What does "carbon footprint" mean?', a: 'co2-fußabdruck|kohlenstoff-fußabdruck', h: 'The amount of CO₂ you produce' },
      ]},
      { theme: '🏙️ Society', words: [
        { q: 'What does "inequality" mean?', a: 'ungleichheit', h: 'in- (not) + equality' },
        { q: 'What does "migration" mean?', a: 'migration|einwanderung|auswanderung', h: 'Moving from one place/country to another' },
        { q: 'What does "discrimination" mean?', a: 'diskriminierung|benachteiligung', h: 'Treating people differently/unfairly' },
        { q: 'What does "integration" mean?', a: 'integration|eingliederung', h: 'Becoming part of a group/society' },
        { q: 'What does "poverty" mean?', a: 'armut', h: 'poor (adjective) → poverty (noun)' },
      ]},
      { theme: '💻 Technology', words: [
        { q: 'What does "artificial intelligence" mean?', a: 'künstliche intelligenz|ki', h: 'AI = Artificial Intelligence = KI' },
        { q: 'What does "privacy" mean in a digital context?', a: 'datenschutz|privatsphäre', h: 'Your right to control your personal data' },
        { q: 'What does "algorithm" mean?', a: 'algorithmus', h: 'A set of rules/instructions for solving a problem' },
        { q: 'What does "cyberbullying" mean?', a: 'cybermobbing|online mobbing', h: 'Bullying that takes place online' },
        { q: 'What does "digital footprint" mean?', a: 'digitale spur|digitaler fußabdruck', h: 'The data trail you leave online' },
      ]},
      { theme: '🎓 School & Education', words: [
        { q: 'What does "curriculum" mean?', a: 'lehrplan', h: 'The subjects studied at school' },
        { q: 'What does "compulsory" mean?', a: 'pflicht|verpflichtend|obligatorisch', h: 'compulsory education = Schulpflicht' },
        { q: 'What does "scholarship" mean?', a: 'stipendium', h: 'Money given to a student to pay for studies' },
        { q: 'What does "graduate" mean as a verb?', a: 'abschließen|abschluss machen|graduieren', h: 'To complete a course of study successfully' },
        { q: 'What is "peer pressure"?', a: 'gruppenzwang', h: 'Pressure from people your own age to do something' },
      ]},
    ];
    const theme = themes[Math.floor(Math.random() * themes.length)];
    const pair = theme.words[Math.floor(Math.random() * theme.words.length)];
    return { question: `[${theme.theme}]\n${pair.q}`, answer: pair.a, hint: pair.h, type: 'contains', topic: 'Vocabulary Thematic' };
  };

  generators.irregular_verbs = () => {
    const verbs = [
      ['begin', 'began', 'begun'], ['break', 'broke', 'broken'], ['bring', 'brought', 'brought'],
      ['build', 'built', 'built'], ['buy', 'bought', 'bought'], ['catch', 'caught', 'caught'],
      ['choose', 'chose', 'chosen'], ['come', 'came', 'come'], ['cut', 'cut', 'cut'],
      ['do', 'did', 'done'], ['drink', 'drank', 'drunk'], ['drive', 'drove', 'driven'],
      ['eat', 'ate', 'eaten'], ['fall', 'fell', 'fallen'], ['feel', 'felt', 'felt'],
      ['find', 'found', 'found'], ['fly', 'flew', 'flown'], ['forget', 'forgot', 'forgotten'],
      ['get', 'got', 'gotten/got'], ['give', 'gave', 'given'], ['go', 'went', 'gone'],
      ['grow', 'grew', 'grown'], ['have', 'had', 'had'], ['hear', 'heard', 'heard'],
      ['hold', 'held', 'held'], ['keep', 'kept', 'kept'], ['know', 'knew', 'known'],
      ['leave', 'left', 'left'], ['lose', 'lost', 'lost'], ['make', 'made', 'made'],
      ['meet', 'met', 'met'], ['put', 'put', 'put'], ['read', 'read', 'read'],
      ['run', 'ran', 'run'], ['say', 'said', 'said'], ['see', 'saw', 'seen'],
      ['sell', 'sold', 'sold'], ['send', 'sent', 'sent'], ['sit', 'sat', 'sat'],
      ['sleep', 'slept', 'slept'], ['speak', 'spoke', 'spoken'], ['spend', 'spent', 'spent'],
      ['stand', 'stood', 'stood'], ['steal', 'stole', 'stolen'], ['swim', 'swam', 'swum'],
      ['take', 'took', 'taken'], ['teach', 'taught', 'taught'], ['tell', 'told', 'told'],
      ['think', 'thought', 'thought'], ['throw', 'threw', 'thrown'], ['understand', 'understood', 'understood'],
      ['wake', 'woke', 'woken'], ['wear', 'wore', 'worn'], ['win', 'won', 'won'], ['write', 'wrote', 'written'],
    ];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const type = Math.floor(Math.random() * 3);
    if (type === 0) return { question: `What is the **Past Simple** of "${verb[0]}"?`, answer: verb[1], hint: `Infinitive: ${verb[0]} | Past: ? | Past Participle: ${verb[2]}`, type: 'exact', topic: 'Irregular Verbs' };
    if (type === 1) return { question: `What is the **Past Participle** of "${verb[0]}"?`, answer: verb[2], hint: `Infinitive: ${verb[0]} | Past: ${verb[1]} | PP: ?`, type: 'contains', topic: 'Irregular Verbs' };
    return { question: `Complete: Infinitive → Past → Past Participle\n"${verb[0]}" → ??? → ???`, answer: `${verb[1]}|${verb[2]}`, hint: 'Learn all three forms!', type: 'contains', topic: 'Irregular Verbs' };
  };

  generators.reported_speech = () => {
    const exercises = [
      { question: 'Change to reported speech:\n"I am happy," she said.', answer: 'she said (that) she was happy|she said she was happy', hint: 'am → was (Backshift: Present Simple → Past Simple)', type: 'contains', topic: 'Reported Speech' },
      { question: 'Change to reported speech:\n"I will come tomorrow," he said.', answer: 'he said (that) he would come|he said he would come', hint: 'will → would | tomorrow → the next day', type: 'contains', topic: 'Reported Speech' },
      { question: 'Change to reported speech:\n"I have finished my homework," she said.', answer: 'she said (that) she had finished|she said she had finished', hint: 'Present Perfect → Past Perfect (Backshift)', type: 'contains', topic: 'Reported Speech' },
      { question: 'Change the question to reported speech:\n"Where do you live?" he asked.', answer: 'he asked where i lived|he asked where she lived', hint: 'Questions: no question mark, normal word order, tense backshift', type: 'contains', topic: 'Reported Speech' },
      { question: 'What happens to "now" in reported speech?', answer: 'then|at that time', h: 'Time expressions change: now → then, today → that day, tomorrow → the next day', type: 'contains', topic: 'Reported Speech' },
      { question: 'Change to reported speech:\n"Don\'t touch that!" she told him.', answer: 'she told him not to touch|she told him to not touch', hint: 'Commands: tell + object + (not) to + infinitive', type: 'contains', topic: 'Reported Speech' },
    ];
    return exercises[Math.floor(Math.random() * exercises.length)];
  };

  generators.modal_verbs = () => {
    const exercises = [
      { question: 'Choose the correct modal verb:\n"You ___ wear a seatbelt. It\'s the law!"\n(must / should / could)', answer: 'must', hint: 'must = obligation (legal/strong) | should = advice', type: 'exact', topic: 'Modal Verbs' },
      { question: 'Choose the correct modal verb:\n"She ___ speak five languages!" (ability)', answer: 'can', hint: 'can = ability in the present', type: 'exact', topic: 'Modal Verbs' },
      { question: 'Choose the correct modal verb:\n"It ___ rain today. The sky is dark." (possibility)', answer: 'might|may|could', hint: 'might/may/could = possibility (not certain)', type: 'contains', topic: 'Modal Verbs' },
      { question: 'What is the difference between "must" and "have to"?', answer: 'must: internal obligation|have to: external|must: personal|have to: rules|both: obligation', hint: 'must = personal feeling/decision | have to = external rule/necessity', type: 'contains', topic: 'Modal Verbs' },
      { question: '"You ___ smoke here. It\'s forbidden!"\nChoose: must not / don\'t have to', answer: 'must not|mustn\'t', hint: 'must not = forbidden! | don\'t have to = not necessary (but allowed)', type: 'contains', topic: 'Modal Verbs' },
      { question: '"You ___ come if you don\'t want to."\nChoose: must not / don\'t have to', answer: 'don\'t have to', hint: 'don\'t have to = it\'s not necessary, but you CAN', type: 'contains', topic: 'Modal Verbs' },
      { question: 'What does "should have done" express?', answer: 'hätte sollen|regret|bedauern|hätte machen sollen|past regret', hint: 'should have + past participle = Bedauern über Vergangenheit', type: 'contains', topic: 'Modal Verbs' },
    ];
    return exercises[Math.floor(Math.random() * exercises.length)];
  };

  const getHint = () => currentExercise ? currentExercise.hint : null;
  const getTopics = () => TOPICS;
  const getTopicLabel = (id) => { const t = TOPICS.find(t => t.id === id); return t ? t.label : id; };
  const getKnowledgeName = () => currentExercise ? currentExercise.topic : null;

  return { generate, checkAnswer, getHint, getSolutionSteps: () => null, getTopics, getTopicLabel, getKnowledgeName, current: () => currentExercise };
})();
