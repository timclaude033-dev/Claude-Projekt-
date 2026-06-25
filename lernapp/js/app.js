/* ============================================
   App - Hauptcontroller
   ============================================ */

const App = (() => {
  let currentPage = 'dashboard';
  let currentSubjectTopics = {};
  let hintUsed = { math: false, deutsch: false, english: false };

  const PAGE_TITLES = {
    dashboard: 'Dashboard',
    math: 'Mathematik',
    deutsch: 'Deutsch',
    english: 'Englisch',
    chat: 'KI-Chat',
    flashcards: 'Lernkarten',
    notes: 'Lernzettel',
    brain: 'Lerngehirn',
    progress: 'Fortschritt'
  };

  const init = () => {
    // Partikel-Animation starten
    Animations.init();
    Animations.hideSplash();

    // Motivationszitat
    const quoteEl = document.getElementById('motivational-quote');
    if (quoteEl) quoteEl.textContent = Animations.getQuote();

    // Streak aktualisieren
    Storage.startSession();
    const user = Storage.updateStreak();
    Progress.updateUI(user);

    // Ersten Start prüfen
    if (!user.name) {
      setTimeout(() => {
        document.getElementById('app').classList.remove('hidden');
        document.getElementById('first-run-modal').classList.remove('hidden');
      }, 2500);
    } else {
      setTimeout(() => {
        document.getElementById('app').classList.remove('hidden');
        Progress.updateDashboard();
      }, 2500);
    }

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(link.dataset.page);
      });
    });

    // First run setup
    document.getElementById('first-run-start').addEventListener('click', () => {
      const name = document.getElementById('first-run-name').value.trim() || 'Lernender';
      const grade = document.getElementById('first-run-grade').value;

      const user = Storage.getUser();
      user.name = name;
      user.grade = parseInt(grade);
      Storage.saveUser(user);

      document.getElementById('first-run-modal').classList.add('hidden');
      Progress.updateUI(user);
      Progress.updateDashboard();

      Animations.showToast(`Willkommen, ${name}! 🎉`, 'success');
      Animations.celebrate('🎓', `Willkommen, ${name}!`);
    });

    // Voice button
    document.getElementById('voice-btn').addEventListener('click', () => {
      const btn = document.getElementById('voice-btn');
      if (Speech.getIsListening()) {
        Speech.stopListening();
        btn.classList.remove('active');
        btn.textContent = '🎤';
      } else {
        Speech.startListening((text, err) => {
          if (text) {
            Animations.showToast(`Erkannt: "${text}"`, 'info');
            if (currentPage === 'chat') {
              document.getElementById('chat-input').value = text;
              ChatAI.sendMessage();
            } else if (currentPage === 'math') {
              document.getElementById('math-answer').value = text;
            } else if (currentPage === 'deutsch') {
              document.getElementById('deutsch-answer').value = text;
            } else if (currentPage === 'english') {
              document.getElementById('english-answer').value = text;
            }
          }
          btn.classList.remove('active');
          btn.textContent = '🎤';
        });
        btn.classList.add('active');
        btn.textContent = '🔴';
      }
    });

    // Subject pages init
    initMath();
    initDeutsch();
    initEnglish();
    ChatAI.init();
    Flashcards.init();
    Notes.init();
  };

  const navigate = (page) => {
    currentPage = page;

    // Update nav
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.page === page);
    });

    // Update pages
    document.querySelectorAll('.page').forEach(p => {
      p.classList.toggle('active', p.id === `page-${page}`);
    });

    // Update title
    document.getElementById('page-title').textContent = PAGE_TITLES[page] || page;

    // Page-specific init
    switch (page) {
      case 'dashboard': Progress.updateDashboard(); break;
      case 'flashcards': Flashcards.render(); break;
      case 'notes': Notes.render(); break;
      case 'progress': Progress.renderProgressPage(); break;
      case 'brain': Progress.renderBrainPage(); break;
    }
  };

  // ======= MATH =======
  const initMath = () => {
    const topicsContainer = document.getElementById('math-topics');
    MathEngine.getTopics().forEach(topic => {
      const btn = document.createElement('button');
      btn.className = 'topic-btn';
      btn.innerHTML = `<span>${topic.label}</span><div class="topic-progress-dot" id="math-dot-${topic.id}"></div>`;
      btn.addEventListener('click', () => loadMathExercise(topic.id, btn));
      topicsContainer.appendChild(btn);
    });

    document.getElementById('math-check-btn').addEventListener('click', checkMathAnswer);
    document.getElementById('math-next-btn').addEventListener('click', () => {
      if (currentSubjectTopics.math) loadMathExercise(currentSubjectTopics.math);
    });
    document.getElementById('math-hint-btn').addEventListener('click', showMathHint);
    document.getElementById('math-answer').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkMathAnswer();
    });
  };

  const loadMathExercise = (topicId, btn) => {
    currentSubjectTopics.math = topicId;
    hintUsed.math = false;

    // Update active button
    document.querySelectorAll('#math-topics .topic-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    else document.querySelectorAll('#math-topics .topic-btn').forEach(b => {
      if (b.textContent.includes(MathEngine.getTopicLabel(topicId).split(' ')[1])) b.classList.add('active');
    });

    const exercise = MathEngine.generate(topicId);
    if (!exercise) return;

    // Update UI
    document.getElementById('math-topic-label').textContent = MathEngine.getTopicLabel(topicId);
    document.getElementById('math-question').innerHTML = formatExerciseText(exercise.question);
    document.getElementById('math-answer').value = '';
    document.getElementById('math-feedback').className = 'feedback-area hidden';
    document.getElementById('math-hint').classList.add('hidden');
    document.getElementById('math-solution-steps').classList.add('hidden');
    document.getElementById('math-answer').focus();
  };

  const checkMathAnswer = () => {
    const answer = document.getElementById('math-answer').value.trim();
    if (!answer) return;

    const correct = MathEngine.checkAnswer(answer);
    showSubjectFeedback('math', correct);

    const result = Progress.addExerciseResult('math', correct, hintUsed.math);
    Animations.showAnswerFeedback(document.getElementById('math-answer'), correct);

    if (correct) {
      Animations.showToast(`✓ Richtig! +${result.points} Punkte`, 'success');
      // Schritte anzeigen
      const steps = MathEngine.getSolutionSteps();
      if (steps && steps.length > 0) {
        const stepsEl = document.getElementById('math-solution-steps');
        stepsEl.innerHTML = `<h4>📖 Lösungsweg:</h4>${steps.filter(s => s).map(s => `<div class="solution-step">${s}</div>`).join('')}`;
        stepsEl.classList.remove('hidden');
      }
      // Auto-Flashcard für schwierige Themen
      const topicName = MathEngine.getKnowledgeName();
      if (topicName) Storage.learnConcept('math', topicName, true);

      setTimeout(() => loadMathExercise(currentSubjectTopics.math), 3000);
    } else {
      if (currentSubjectTopics.math) Storage.learnConcept('math', MathEngine.getKnowledgeName() || 'Aufgabe', false);
    }
  };

  const showMathHint = () => {
    hintUsed.math = true;
    const hint = MathEngine.getHint();
    const hintEl = document.getElementById('math-hint');
    hintEl.textContent = '💡 ' + hint;
    hintEl.classList.remove('hidden');
  };

  // ======= DEUTSCH =======
  const initDeutsch = () => {
    const topicsContainer = document.getElementById('deutsch-topics');
    DeutschEngine.getTopics().forEach(topic => {
      const btn = document.createElement('button');
      btn.className = 'topic-btn';
      btn.innerHTML = `<span>${topic.label}</span><div class="topic-progress-dot" id="deutsch-dot-${topic.id}"></div>`;
      btn.addEventListener('click', () => loadDeutschExercise(topic.id, btn));
      topicsContainer.appendChild(btn);
    });

    document.getElementById('deutsch-check-btn').addEventListener('click', checkDeutschAnswer);
    document.getElementById('deutsch-next-btn').addEventListener('click', () => {
      if (currentSubjectTopics.deutsch) loadDeutschExercise(currentSubjectTopics.deutsch);
    });
    document.getElementById('deutsch-hint-btn').addEventListener('click', showDeutschHint);
  };

  const loadDeutschExercise = (topicId, btn) => {
    currentSubjectTopics.deutsch = topicId;
    hintUsed.deutsch = false;

    document.querySelectorAll('#deutsch-topics .topic-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const exercise = DeutschEngine.generate(topicId);
    if (!exercise) return;

    document.getElementById('deutsch-topic-label').textContent = DeutschEngine.getTopicLabel(topicId);
    document.getElementById('deutsch-question').innerHTML = formatExerciseText(exercise.question);
    document.getElementById('deutsch-answer').value = '';
    document.getElementById('deutsch-feedback').className = 'feedback-area hidden';
    document.getElementById('deutsch-hint').classList.add('hidden');
    document.getElementById('deutsch-answer').focus();
  };

  const checkDeutschAnswer = () => {
    const answer = document.getElementById('deutsch-answer').value.trim();
    if (!answer) return;

    const correct = DeutschEngine.checkAnswer(answer);
    showSubjectFeedback('deutsch', correct);

    const result = Progress.addExerciseResult('deutsch', correct, hintUsed.deutsch);
    Animations.showAnswerFeedback(document.getElementById('deutsch-answer'), correct);

    if (correct) {
      Animations.showToast(`✓ Richtig! +${result.points} Punkte`, 'success');
      Storage.learnConcept('deutsch', DeutschEngine.getKnowledgeName() || 'Aufgabe', true);
      setTimeout(() => loadDeutschExercise(currentSubjectTopics.deutsch), 2500);
    } else {
      Storage.learnConcept('deutsch', DeutschEngine.getKnowledgeName() || 'Aufgabe', false);
    }
  };

  const showDeutschHint = () => {
    hintUsed.deutsch = true;
    const hint = DeutschEngine.getHint();
    const hintEl = document.getElementById('deutsch-hint');
    hintEl.textContent = '💡 ' + hint;
    hintEl.classList.remove('hidden');
  };

  // ======= ENGLISH =======
  const initEnglish = () => {
    const topicsContainer = document.getElementById('english-topics');
    EnglishEngine.getTopics().forEach(topic => {
      const btn = document.createElement('button');
      btn.className = 'topic-btn';
      btn.innerHTML = `<span>${topic.label}</span><div class="topic-progress-dot" id="english-dot-${topic.id}"></div>`;
      btn.addEventListener('click', () => loadEnglishExercise(topic.id, btn));
      topicsContainer.appendChild(btn);
    });

    document.getElementById('english-check-btn').addEventListener('click', checkEnglishAnswer);
    document.getElementById('english-next-btn').addEventListener('click', () => {
      if (currentSubjectTopics.english) loadEnglishExercise(currentSubjectTopics.english);
    });
    document.getElementById('english-hint-btn').addEventListener('click', showEnglishHint);
    document.getElementById('english-answer').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkEnglishAnswer();
    });
  };

  const loadEnglishExercise = (topicId, btn) => {
    currentSubjectTopics.english = topicId;
    hintUsed.english = false;

    document.querySelectorAll('#english-topics .topic-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const exercise = EnglishEngine.generate(topicId);
    if (!exercise) return;

    document.getElementById('english-topic-label').textContent = EnglishEngine.getTopicLabel(topicId);
    document.getElementById('english-question').innerHTML = formatExerciseText(exercise.question);
    document.getElementById('english-answer').value = '';
    document.getElementById('english-feedback').className = 'feedback-area hidden';
    document.getElementById('english-hint').classList.add('hidden');
    document.getElementById('english-answer').focus();
  };

  const checkEnglishAnswer = () => {
    const answer = document.getElementById('english-answer').value.trim();
    if (!answer) return;

    const correct = EnglishEngine.checkAnswer(answer);
    showSubjectFeedback('english', correct);

    const result = Progress.addExerciseResult('english', correct, hintUsed.english);
    Animations.showAnswerFeedback(document.getElementById('english-answer'), correct);

    if (correct) {
      Animations.showToast(`✓ Correct! +${result.points} points`, 'success');
      Storage.learnConcept('english', EnglishEngine.getKnowledgeName() || 'Exercise', true);
      setTimeout(() => loadEnglishExercise(currentSubjectTopics.english), 2500);
    } else {
      Storage.learnConcept('english', EnglishEngine.getKnowledgeName() || 'Exercise', false);
    }
  };

  const showEnglishHint = () => {
    hintUsed.english = true;
    const hint = EnglishEngine.getHint();
    const hintEl = document.getElementById('english-hint');
    hintEl.textContent = '💡 ' + hint;
    hintEl.classList.remove('hidden');
  };

  // ======= HELPERS =======
  const showSubjectFeedback = (subject, correct) => {
    const feedbackEl = document.getElementById(`${subject}-feedback`);
    const exercise = subject === 'math' ? MathEngine.current() :
                     subject === 'deutsch' ? DeutschEngine.current() :
                     EnglishEngine.current();

    if (!feedbackEl) return;

    if (correct) {
      feedbackEl.className = 'feedback-area correct';
      feedbackEl.innerHTML = `✅ <strong>Richtig!</strong> Super gemacht!`;
    } else {
      feedbackEl.className = 'feedback-area wrong';
      feedbackEl.innerHTML = `❌ <strong>Nicht ganz.</strong> Die richtige Antwort: <strong>${exercise?.answer || ''}</strong>`;
    }

    feedbackEl.classList.remove('hidden');
  };

  const formatExerciseText = (text) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };

  return { init, navigate };
})();

// Start
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
