/* ============================================
   English Engine - Exercises & Checking
   ============================================ */

const EnglishEngine = (() => {
  const TOPICS = [
    { id: 'tenses', label: '⏰ Tenses', difficulty: 2 },
    { id: 'grammar', label: '📖 Grammar', difficulty: 2 },
    { id: 'vocabulary', label: '💬 Vocabulary', difficulty: 1 },
    { id: 'articles', label: '📌 Articles', difficulty: 1 },
    { id: 'prepositions', label: '📍 Prepositions', difficulty: 2 },
    { id: 'conditional', label: '🔀 Conditional', difficulty: 3 },
    { id: 'passive', label: '🔄 Passive Voice', difficulty: 3 },
    { id: 'relative', label: '🔗 Relative Clauses', difficulty: 3 },
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

  const getHint = () => currentExercise ? currentExercise.hint : null;
  const getTopics = () => TOPICS;
  const getTopicLabel = (id) => { const t = TOPICS.find(t => t.id === id); return t ? t.label : id; };
  const getKnowledgeName = () => currentExercise ? currentExercise.topic : null;

  return { generate, checkAnswer, getHint, getSolutionSteps: () => null, getTopics, getTopicLabel, getKnowledgeName, current: () => currentExercise };
})();
