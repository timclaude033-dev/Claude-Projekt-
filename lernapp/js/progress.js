/* ============================================
   Progress - Punkte, Level, Achievements
   ============================================ */

const Progress = (() => {
  const LEVELS = [
    { level: 1, xpNeeded: 0, title: 'Anfänger' },
    { level: 2, xpNeeded: 100, title: 'Lernender' },
    { level: 3, xpNeeded: 250, title: 'Fortgeschrittener' },
    { level: 4, xpNeeded: 500, title: 'Fleißiger Schüler' },
    { level: 5, xpNeeded: 900, title: 'Wissender' },
    { level: 6, xpNeeded: 1400, title: 'Experte' },
    { level: 7, xpNeeded: 2000, title: 'Meister' },
    { level: 8, xpNeeded: 3000, title: 'Gelehrter' },
    { level: 9, xpNeeded: 4500, title: 'Professor' },
    { level: 10, xpNeeded: 7000, title: 'Genius' },
  ];

  const ACHIEVEMENTS = [
    { id: 'first_exercise', icon: '🎯', name: 'Erste Aufgabe', desc: 'Löse deine erste Aufgabe' },
    { id: 'ten_correct', icon: '🔟', name: '10 Richtige', desc: '10 Aufgaben korrekt beantwortet' },
    { id: 'fifty_correct', icon: '⭐', name: '50 Richtige', desc: '50 Aufgaben korrekt beantwortet' },
    { id: 'streak_3', icon: '🔥', name: '3-Tage-Streak', desc: '3 Tage in Folge gelernt' },
    { id: 'streak_7', icon: '🔥🔥', name: 'Wochenstreak', desc: '7 Tage in Folge gelernt' },
    { id: 'all_subjects', icon: '🌟', name: 'Allrounder', desc: 'Alle 3 Fächer geübt' },
    { id: 'level_5', icon: '🏆', name: 'Level 5', desc: 'Level 5 erreicht' },
    { id: 'hundred_points', icon: '💯', name: '100 Punkte', desc: '100 Punkte gesammelt' },
    { id: 'note_creator', icon: '📋', name: 'Zettelkönig', desc: 'Ersten Lernzettel erstellt' },
    { id: 'flashcard_master', icon: '🗂️', name: 'Kartenkönig', desc: '10 Lernkarten erstellt' },
    { id: 'chat_user', icon: '🤖', name: 'KI-Freund', desc: 'KI-Chat genutzt' },
    { id: 'perfect_session', icon: '💎', name: 'Perfekter Lauf', desc: '5 Aufgaben in Folge richtig' },
  ];

  let consecutiveCorrect = 0;

  const addPoints = (points, reason = '') => {
    const user = Storage.getUser();
    user.totalPoints += points;
    user.xp += points;

    // Level up check
    const newLevel = calculateLevel(user.xp);
    if (newLevel > user.level) {
      user.level = newLevel;
      const levelData = LEVELS.find(l => l.level === newLevel);
      Animations.celebrate('🎊', `Level ${newLevel} erreicht! ${levelData?.title || ''}`);
      checkAchievement('level_5', () => newLevel >= 5);
    }

    Storage.saveUser(user);
    updateUI(user);
    checkAchievements(user);
    return user;
  };

  const addExerciseResult = (subject, correct, hintUsed = false) => {
    const basePoints = correct ? (hintUsed ? 3 : 5) : 1;
    const progress = Storage.getProgress();

    progress[subject].completed++;
    if (correct) {
      progress[subject].correct++;
      consecutiveCorrect++;
    } else {
      consecutiveCorrect = 0;
    }

    const topicKey = 'general';
    if (!progress[subject].topics[topicKey]) progress[subject].topics[topicKey] = { done: 0, correct: 0 };
    progress[subject].topics[topicKey].done++;
    if (correct) progress[subject].topics[topicKey].correct++;

    Storage.saveProgress(progress);

    const dailyData = Storage.addDailyExercise(subject, correct, basePoints);
    addPoints(basePoints, `${subject} Aufgabe`);

    // Achievement-Checks
    checkAchievement('first_exercise', () => true);
    const totalCorrect = progress.math.correct + progress.deutsch.correct + progress.english.correct;
    checkAchievement('ten_correct', () => totalCorrect >= 10);
    checkAchievement('fifty_correct', () => totalCorrect >= 50);
    checkAchievement('all_subjects', () => progress.math.completed > 0 && progress.deutsch.completed > 0 && progress.english.completed > 0);
    checkAchievement('hundred_points', () => Storage.getUser().totalPoints >= 100);
    checkAchievement('perfect_session', () => consecutiveCorrect >= 5);

    // Brain aktualisieren
    const topicName = 'Übungsaufgabe';
    Storage.learnConcept(subject, topicName, correct);

    // Aktivität loggen
    const subjectEmojis = { math: '🔢', deutsch: '📝', english: '🇬🇧' };
    Storage.addActivity(
      correct ? '✅' : '❌',
      `${subjectEmojis[subject]} ${correct ? 'Richtig' : 'Falsch'} · ${basePoints} Punkte`,
      subject
    );

    updateDashboard();
    return { points: basePoints, dailyData };
  };

  const checkAchievement = (id, condition) => {
    if (condition()) {
      const unlocked = Storage.unlockAchievement(id);
      if (unlocked) {
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if (ach) {
          Animations.showToast(`🏆 Errungenschaft: ${ach.name}!`, 'success');
        }
      }
    }
  };

  const checkAchievements = (user) => {
    const streak = user.streak || 0;
    checkAchievement('streak_3', () => streak >= 3);
    checkAchievement('streak_7', () => streak >= 7);
  };

  const calculateLevel = (xp) => {
    let level = 1;
    for (const l of LEVELS) {
      if (xp >= l.xpNeeded) level = l.level;
    }
    return level;
  };

  const getXPForLevel = (level) => {
    const current = LEVELS.find(l => l.level === level);
    const next = LEVELS.find(l => l.level === level + 1);
    return { current: current?.xpNeeded || 0, next: next?.xpNeeded || 9999 };
  };

  const updateUI = (user) => {
    if (!user) user = Storage.getUser();

    // XP bar
    const xpBounds = getXPForLevel(user.level);
    const xpInLevel = user.xp - xpBounds.current;
    const xpNeeded = xpBounds.next - xpBounds.current;
    const pct = Math.min((xpInLevel / xpNeeded) * 100, 100);

    const xpFill = document.getElementById('xp-fill');
    if (xpFill) xpFill.style.width = pct + '%';

    const xpText = document.getElementById('xp-text');
    if (xpText) xpText.textContent = `${xpInLevel} / ${xpNeeded} XP`;

    const levelDisplay = document.getElementById('user-level-display');
    if (levelDisplay) {
      const levelData = LEVELS.find(l => l.level === user.level);
      levelDisplay.textContent = `⭐ Level ${user.level} – ${levelData?.title || ''}`;
    }

    const nameDisplay = document.getElementById('user-name-display');
    if (nameDisplay && user.name) nameDisplay.textContent = user.name;

    const pointsDisplay = document.getElementById('total-points-display');
    if (pointsDisplay) pointsDisplay.textContent = user.totalPoints;

    const streakDisplay = document.getElementById('streak-count');
    if (streakDisplay) streakDisplay.textContent = user.streak || 0;
  };

  const updateDashboard = () => {
    const user = Storage.getUser();
    const dailyStats = Storage.getTodayStats();
    const progress = Storage.getProgress();

    // Dashboard elements
    const welcomeName = document.getElementById('welcome-name');
    if (welcomeName) welcomeName.textContent = user.name || 'Lernender';

    const dashStreak = document.getElementById('dash-streak');
    if (dashStreak) dashStreak.textContent = user.streak || 0;

    const dashLevel = document.getElementById('dash-level');
    if (dashLevel) dashLevel.textContent = user.level || 1;

    const dashPoints = document.getElementById('dash-points');
    if (dashPoints) dashPoints.textContent = user.totalPoints || 0;

    const todayPoints = document.getElementById('today-points');
    if (todayPoints) todayPoints.textContent = dailyStats.points || 0;

    // Daily ring
    const GOAL = 10;
    const done = dailyStats.exercises || 0;
    const dailyRing = document.getElementById('daily-ring');
    if (dailyRing) {
      const circumference = 314;
      const offset = circumference - (Math.min(done, GOAL) / GOAL) * circumference;
      dailyRing.style.strokeDashoffset = offset;
    }

    const dailyCount = document.getElementById('daily-exercises-count');
    if (dailyCount) dailyCount.textContent = done;

    // Subject bars
    const subjects = ['math', 'deutsch', 'english'];
    subjects.forEach(subject => {
      const total = progress[subject].completed || 0;
      const correct = progress[subject].correct || 0;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

      const bar = document.getElementById(`${subject}-progress-bar`);
      const pctEl = document.getElementById(`${subject}-progress-pct`);
      if (bar) bar.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct + '%';
    });

    // Activities
    const activities = Storage.getActivities().slice(0, 8);
    const actList = document.getElementById('recent-activity');
    if (actList) {
      if (activities.length === 0) {
        actList.innerHTML = '<p class="empty-state">Noch keine Aktivitäten. Fang an zu lernen!</p>';
      } else {
        actList.innerHTML = activities.map(a => `
          <div class="activity-item">
            <span>${a.icon}</span>
            <span>${a.text}</span>
            <span class="activity-time">${a.time}</span>
          </div>
        `).join('');
      }
    }

    // Achievements
    renderAchievements();
  };

  const renderAchievements = () => {
    const unlocked = Storage.getAchievements();

    // Dashboard mini view
    const grid = document.getElementById('achievements-grid');
    if (grid) {
      grid.innerHTML = ACHIEVEMENTS.slice(0, 8).map(a => `
        <div class="achievement-item ${unlocked.includes(a.id) ? 'unlocked' : ''}" title="${a.desc}">
          <div class="achievement-icon">${unlocked.includes(a.id) ? a.icon : '🔒'}</div>
          <div>${a.name}</div>
        </div>
      `).join('');
    }

    // Progress full view
    const fullGrid = document.getElementById('progress-achievements');
    if (fullGrid) {
      fullGrid.innerHTML = ACHIEVEMENTS.map(a => `
        <div class="achievement-full-item ${unlocked.includes(a.id) ? 'unlocked' : ''}">
          <div class="afi-icon">${unlocked.includes(a.id) ? a.icon : '🔒'}</div>
          <div class="afi-name">${a.name}</div>
          <div class="afi-desc">${a.desc}</div>
        </div>
      `).join('');
    }
  };

  const renderProgressPage = () => {
    const user = Storage.getUser();
    const progress = Storage.getProgress();

    const totalCorrect = progress.math.correct + progress.deutsch.correct + progress.english.correct;
    const totalExercises = progress.math.completed + progress.deutsch.completed + progress.english.completed;

    document.getElementById('ps-total-points').textContent = user.totalPoints || 0;
    document.getElementById('ps-correct').textContent = totalCorrect;
    document.getElementById('ps-exercises').textContent = totalExercises;
    document.getElementById('ps-best-streak').textContent = user.longestStreak || 0;
    document.getElementById('ps-level').textContent = user.level || 1;

    // Weekly chart
    const weekStats = Storage.getWeekStats();
    const maxPoints = Math.max(...weekStats.map(d => d.points), 1);
    const chart = document.getElementById('weekly-chart');
    if (chart) {
      chart.innerHTML = weekStats.map(day => {
        const height = Math.max((day.points / maxPoints) * 90, 4);
        return `
          <div class="wc-bar-wrap">
            <div class="wc-bar" style="height:${height}px" title="${day.points} Punkte"></div>
            <div class="wc-label">${day.day}</div>
          </div>
        `;
      }).join('');
    }

    // Progress canvas (simple line chart)
    drawProgressChart(weekStats);
    renderAchievements();
  };

  const drawProgressChart = (weekStats) => {
    const canvas = document.getElementById('progress-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 800;
    canvas.height = 150;
    const w = canvas.width, h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const maxVal = Math.max(...weekStats.map(d => d.exercises), 1);
    const points = weekStats.map((d, i) => ({
      x: (i / (weekStats.length - 1)) * (w - 60) + 30,
      y: h - 20 - ((d.exercises / maxVal) * (h - 40))
    }));

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(99,102,241,0.4)');
    grad.addColorStop(1, 'rgba(99,102,241,0)');

    // Draw area
    ctx.beginPath();
    ctx.moveTo(points[0].x, h - 20);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h - 20);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Draw points
    points.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
      ctx.fillStyle = 'rgba(232,232,240,0.7)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(weekStats[i].exercises, p.x, p.y - 10);
    });
  };

  const renderBrainPage = () => {
    const brain = Storage.getBrain();
    const concepts = brain.concepts || {};

    document.getElementById('brain-concepts').textContent = Object.keys(concepts).length;
    document.getElementById('brain-correct').textContent = brain.totalCorrect || 0;
    document.getElementById('brain-sessions').textContent = brain.sessions || 0;

    const accuracy = brain.totalAnswers > 0 ? Math.round((brain.totalCorrect / brain.totalAnswers) * 100) : 0;
    document.getElementById('brain-accuracy').textContent = accuracy + '%';

    const list = document.getElementById('brain-knowledge-list');
    const conceptEntries = Object.entries(concepts);

    if (conceptEntries.length === 0) {
      list.innerHTML = '<p class="empty-state">Noch nichts gelernt. Starte Aufgaben!</p>';
    } else {
      list.innerHTML = conceptEntries.map(([key, data]) => `
        <div class="knowledge-item" data-subject="${data.subject}">
          <div class="ki-subject-dot ${data.subject}"></div>
          <span>${data.topic}</span>
          <span style="color:var(--text-muted);font-size:0.8rem">${data.seen}× gesehen</span>
          <span class="ki-mastery" style="color:${data.mastery >= 80 ? 'var(--success)' : data.mastery >= 50 ? 'var(--warning)' : 'var(--danger)'}">${data.mastery}%</span>
        </div>
      `).join('');
    }

    // Schwächen finden
    const weakList = document.getElementById('brain-weak-list');
    const weakItems = conceptEntries.filter(([,d]) => d.mastery < 60 && d.seen > 0);

    if (weakItems.length === 0) {
      weakList.innerHTML = '<p style="color:var(--success);font-size:0.85rem">✓ Keine Schwächen erkannt – super!</p>';
    } else {
      weakList.innerHTML = weakItems.map(([, d]) => `<div class="weak-item">⚠️ ${d.topic} (${d.mastery}%)</div>`).join('');
    }

    // Brain filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        document.querySelectorAll('.knowledge-item').forEach(item => {
          item.style.display = f === 'all' || item.dataset.subject === f ? '' : 'none';
        });
      });
    });
  };

  return { addPoints, addExerciseResult, updateUI, updateDashboard, renderProgressPage, renderBrainPage, ACHIEVEMENTS };
})();
