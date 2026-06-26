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

    // Math tab switching
    document.querySelectorAll('.math-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.math-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.math-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById('math-tab-' + tab.dataset.tab);
        if (target) target.classList.add('active');
        if (tab.dataset.tab === 'plotter') {
          setTimeout(() => Plotter.init('plotter-canvas'), 100);
        }
        if (tab.dataset.tab === 'probability') {
          initProbabilityButtons();
          loadProbabilityExercise();
        }
      });
    });

    // Plotter controls
    const plotterInput = document.getElementById('plotter-input');
    document.getElementById('plotter-add-btn')?.addEventListener('click', () => {
      const expr = plotterInput?.value.trim();
      if (!expr) return;
      const info = Plotter.addFunction(expr);
      const list = document.getElementById('plotter-fn-list');
      if (list && info) {
        const item = document.createElement('div');
        item.className = 'plotter-fn-item';
        let details = `<span class="fn-expr">${expr}</span>`;
        if (info.zeros?.length) details += ` <span class="fn-zeros">Nullstellen: ${info.zeros.map(z => z.toFixed(2)).join(', ')}</span>`;
        if (info.extrema?.length) details += ` <span class="fn-extrema">Extrema: ${info.extrema.map(e => `(${e.x.toFixed(2)}|${e.y.toFixed(2)})`).join(', ')}</span>`;
        item.innerHTML = details;
        list.appendChild(item);
      }
      if (plotterInput) plotterInput.value = '';
    });
    plotterInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('plotter-add-btn')?.click();
    });

    document.getElementById('plotter-clear-btn')?.addEventListener('click', () => {
      Plotter.clearFunctions();
      const list = document.getElementById('plotter-fn-list');
      if (list) list.innerHTML = '';
    });
    document.getElementById('plotter-zoom-in')?.addEventListener('click', () => Plotter.zoom(0.7));
    document.getElementById('plotter-zoom-out')?.addEventListener('click', () => Plotter.zoom(1.4));
    document.getElementById('plotter-reset')?.addEventListener('click', () => {
      Plotter.setRange(-10, 10, -10, 10);
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (plotterInput) plotterInput.value = btn.dataset.fn;
        document.getElementById('plotter-add-btn')?.click();
      });
    });

    // Probability buttons wired in initProbabilityButtons (called when tab opens)
  };

  let probMode = 'basic';
  let currentProbExercise = null;

  const initProbabilityButtons = () => {
    const basicBtn = document.getElementById('prob-basic-btn');
    const treeBtn = document.getElementById('prob-tree-btn');
    const tableBtn = document.getElementById('prob-table-btn');
    if (!basicBtn || basicBtn._wired) return;
    basicBtn._wired = true;

    const switchView = (mode) => {
      probMode = mode;
      document.getElementById('prob-basic-view').classList.toggle('hidden', mode !== 'basic');
      document.getElementById('prob-tree-view').classList.toggle('hidden', mode !== 'tree');
      document.getElementById('prob-table-view').classList.toggle('hidden', mode !== 'table');
      [basicBtn, treeBtn, tableBtn].forEach(b => b.classList.remove('active'));
      if (mode === 'basic') basicBtn.classList.add('active');
      if (mode === 'tree') treeBtn.classList.add('active');
      if (mode === 'table') tableBtn.classList.add('active');
      loadProbabilityExercise();
    };

    basicBtn.addEventListener('click', () => switchView('basic'));
    treeBtn.addEventListener('click', () => switchView('tree'));
    tableBtn.addEventListener('click', () => switchView('table'));

    document.getElementById('prob-check-btn')?.addEventListener('click', checkProbabilityAnswer);
    document.getElementById('prob-next-btn')?.addEventListener('click', loadProbabilityExercise);
    document.getElementById('prob-hint-btn')?.addEventListener('click', () => {
      const hint = document.getElementById('prob-hint');
      if (hint && currentProbExercise?.hint) {
        hint.textContent = '💡 ' + currentProbExercise.hint;
        hint.classList.remove('hidden');
      }
    });
    document.getElementById('prob-answer')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') checkProbabilityAnswer();
    });
    document.getElementById('prob-tree-next')?.addEventListener('click', loadProbabilityExercise);
    document.getElementById('prob-table-next')?.addEventListener('click', loadProbabilityExercise);
  };

  const loadProbabilityExercise = () => {
    if (probMode === 'basic') {
      const exercises = Probability.generateBasicProbability();
      if (!exercises?.length) return;
      currentProbExercise = exercises[Math.floor(Math.random() * exercises.length)];
      document.getElementById('prob-question').textContent = currentProbExercise.question;
      document.getElementById('prob-answer').value = '';
      document.getElementById('prob-feedback').className = 'feedback-area hidden';
      document.getElementById('prob-hint').classList.add('hidden');
      document.getElementById('prob-steps').classList.add('hidden');
    } else if (probMode === 'tree') {
      const result = Probability.generateTreeProblem();
      if (!result) return;
      document.getElementById('prob-tree-context').innerHTML = result.scenario;
      const canvas = document.getElementById('tree-canvas');
      if (canvas) {
        canvas.width = 600; canvas.height = 300;
        setTimeout(() => Probability.drawTree('tree-canvas', result.treeData), 100);
      }
      document.getElementById('prob-tree-questions').innerHTML = result.questions.map(q =>
        `<div class="prob-card"><div class="prob-q">${q.question}</div>
        <button class="btn btn-ghost" style="margin-top:.5rem" onclick="this.nextElementSibling.classList.toggle('hidden')">Lösung</button>
        <div class="prob-a hidden" style="margin-top:.5rem;color:var(--success)">${q.answer}</div></div>`
      ).join('');
    } else if (probMode === 'table') {
      const result = Probability.generateVierfeldertafel();
      if (!result) return;
      document.getElementById('prob-table-context').innerHTML = result.scenario;
      const canvas = document.getElementById('table-canvas');
      if (canvas) {
        canvas.width = 500; canvas.height = 200;
        setTimeout(() => Probability.drawVierfeldertafel('table-canvas', result.tableData), 100);
      }
      document.getElementById('prob-table-questions').innerHTML = result.questions.map(q =>
        `<div class="prob-card"><div class="prob-q">${q.question}</div>
        <button class="btn btn-ghost" style="margin-top:.5rem" onclick="this.nextElementSibling.classList.toggle('hidden')">Lösung</button>
        <div class="prob-a hidden" style="margin-top:.5rem;color:var(--success)">${q.answer}</div></div>`
      ).join('');
    }
  };

  const checkProbabilityAnswer = () => {
    if (!currentProbExercise) return;
    const answer = document.getElementById('prob-answer').value.trim();
    if (!answer) return;
    const correct = Brain.checkAnswer(answer, currentProbExercise.answer, currentProbExercise.type || 'number');
    const fb = document.getElementById('prob-feedback');
    if (correct) {
      fb.className = 'feedback-area correct';
      fb.innerHTML = `✅ <strong>Richtig!</strong>`;
      Progress.addExerciseResult('math', true, false);
      Animations.showToast('✓ Richtig! +10 Punkte', 'success');
      setTimeout(loadProbabilityExercise, 2000);
    } else {
      fb.className = 'feedback-area wrong';
      fb.innerHTML = `❌ Nicht ganz. Richtig: <strong>${currentProbExercise.answer}</strong>`;
      if (currentProbExercise.explanation) {
        const steps = document.getElementById('prob-steps');
        steps.innerHTML = currentProbExercise.explanation;
        steps.classList.remove('hidden');
      }
    }
    fb.classList.remove('hidden');
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
