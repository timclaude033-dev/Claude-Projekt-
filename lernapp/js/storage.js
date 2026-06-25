/* ============================================
   Storage - IndexedDB + LocalStorage
   ============================================ */

const Storage = (() => {
  const LS_KEY = 'learnai_';

  const get = (key, def = null) => {
    try {
      const v = localStorage.getItem(LS_KEY + key);
      return v !== null ? JSON.parse(v) : def;
    } catch { return def; }
  };

  const set = (key, val) => {
    try { localStorage.setItem(LS_KEY + key, JSON.stringify(val)); } catch {}
  };

  const update = (key, fn, def = {}) => {
    const current = get(key, def);
    const updated = fn(current);
    set(key, updated);
    return updated;
  };

  // User profile
  const getUser = () => get('user', {
    name: null,
    grade: 8,
    totalPoints: 0,
    level: 1,
    xp: 0,
    streak: 0,
    lastLoginDate: null,
    longestStreak: 0
  });

  const saveUser = (data) => set('user', data);

  // Progress per subject
  const getProgress = () => get('progress', {
    math: { completed: 0, correct: 0, topics: {} },
    deutsch: { completed: 0, correct: 0, topics: {} },
    english: { completed: 0, correct: 0, topics: {} }
  });

  const saveProgress = (data) => set('progress', data);

  // Daily tracking
  const getToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const data = get('daily', {});
    if (!data[today]) data[today] = { exercises: 0, correct: 0, points: 0, subjects: {} };
    return { today, data };
  };

  const addDailyExercise = (subject, correct, points) => {
    const { today, data } = getToday();
    data[today].exercises++;
    if (correct) data[today].correct++;
    data[today].points += points;
    if (!data[today].subjects[subject]) data[today].subjects[subject] = 0;
    data[today].subjects[subject]++;
    set('daily', data);
    return data[today];
  };

  const getTodayStats = () => {
    const { today, data } = getToday();
    return data[today];
  };

  const getWeekStats = () => {
    const data = get('daily', {});
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      result.push({ date: key, day: ['So','Mo','Di','Mi','Do','Fr','Sa'][d.getDay()], ...(data[key] || { exercises: 0, correct: 0, points: 0 }) });
    }
    return result;
  };

  // Activity log
  const addActivity = (icon, text, subject) => {
    const acts = get('activities', []);
    acts.unshift({ icon, text, subject, time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }), ts: Date.now() });
    if (acts.length > 50) acts.splice(50);
    set('activities', acts);
  };

  const getActivities = () => get('activities', []);

  // Flashcards
  const getFlashcards = () => get('flashcards', []);

  const addFlashcard = (card) => {
    const cards = getFlashcards();
    const newCard = { id: Date.now() + Math.random(), ...card, score: 0, seen: 0, correct: 0, createdAt: Date.now() };
    cards.push(newCard);
    set('flashcards', cards);
    return newCard;
  };

  const updateFlashcard = (id, updates) => {
    const cards = getFlashcards();
    const idx = cards.findIndex(c => c.id === id);
    if (idx >= 0) { cards[idx] = { ...cards[idx], ...updates }; set('flashcards', cards); }
  };

  const deleteFlashcard = (id) => {
    const cards = getFlashcards().filter(c => c.id !== id);
    set('flashcards', cards);
  };

  // Notes
  const getNotes = () => get('notes', []);

  const saveNote = (note) => {
    const notes = getNotes();
    if (note.id) {
      const idx = notes.findIndex(n => n.id === note.id);
      if (idx >= 0) notes[idx] = { ...notes[idx], ...note, updatedAt: Date.now() };
      else notes.unshift({ ...note, updatedAt: Date.now() });
    } else {
      notes.unshift({ ...note, id: Date.now(), createdAt: Date.now(), updatedAt: Date.now() });
    }
    set('notes', notes);
    return notes[0];
  };

  const deleteNote = (id) => set('notes', getNotes().filter(n => n.id !== id));

  // Brain knowledge
  const getBrain = () => get('brain', {
    concepts: {},
    sessions: 0,
    totalCorrect: 0,
    totalAnswers: 0
  });

  const learnConcept = (subject, topic, correct) => {
    const brain = getBrain();
    const key = `${subject}:${topic}`;
    if (!brain.concepts[key]) brain.concepts[key] = { subject, topic, seen: 0, correct: 0, mastery: 0 };
    brain.concepts[key].seen++;
    if (correct) brain.concepts[key].correct++;
    brain.concepts[key].mastery = Math.round((brain.concepts[key].correct / brain.concepts[key].seen) * 100);
    brain.totalAnswers++;
    if (correct) brain.totalCorrect++;
    set('brain', brain);
  };

  const startSession = () => {
    const brain = getBrain();
    brain.sessions++;
    set('brain', brain);
  };

  // Chat history
  const getChatHistory = () => get('chat_history', []);
  const addChatMessage = (role, content) => {
    const history = getChatHistory();
    history.push({ role, content, ts: Date.now() });
    if (history.length > 200) history.splice(0, history.length - 200);
    set('chat_history', history);
  };

  // Achievements
  const getAchievements = () => get('achievements', []);
  const unlockAchievement = (id) => {
    const ach = getAchievements();
    if (!ach.includes(id)) { ach.push(id); set('achievements', ach); return true; }
    return false;
  };

  // Update streak
  const updateStreak = () => {
    const user = getUser();
    const today = new Date().toISOString().split('T')[0];
    if (user.lastLoginDate === today) return user;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (user.lastLoginDate === yesterday) { user.streak++; }
    else if (user.lastLoginDate !== today) { user.streak = 1; }
    user.lastLoginDate = today;
    if (user.streak > user.longestStreak) user.longestStreak = user.streak;
    saveUser(user);
    return user;
  };

  return { get, set, update, getUser, saveUser, getProgress, saveProgress, getToday, addDailyExercise, getTodayStats, getWeekStats, addActivity, getActivities, getFlashcards, addFlashcard, updateFlashcard, deleteFlashcard, getNotes, saveNote, deleteNote, getBrain, learnConcept, startSession, getChatHistory, addChatMessage, getAchievements, unlockAchievement, updateStreak };
})();
