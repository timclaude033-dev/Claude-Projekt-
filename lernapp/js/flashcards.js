/* ============================================
   Flashcards - Lernkartensystem
   ============================================ */

const Flashcards = (() => {
  let reviewQueue = [];
  let currentCard = null;
  let reviewStats = { correct: 0, wrong: 0 };
  let filter = 'all';

  const init = () => {
    document.getElementById('fc-filter').addEventListener('change', (e) => {
      filter = e.target.value;
      render();
    });

    document.getElementById('fc-add-btn').addEventListener('click', () => {
      document.getElementById('fc-modal').classList.remove('hidden');
    });

    document.getElementById('fc-modal-cancel').addEventListener('click', () => {
      document.getElementById('fc-modal').classList.add('hidden');
    });

    document.getElementById('fc-modal-save').addEventListener('click', saveNewCard);

    document.getElementById('fc-current-card').addEventListener('click', () => {
      document.getElementById('fc-current-card').classList.toggle('flipped');
    });

    document.getElementById('fc-correct-btn').addEventListener('click', () => rateCard(true, 'correct'));
    document.getElementById('fc-wrong-btn').addEventListener('click', () => rateCard(false, 'wrong'));
    document.getElementById('fc-ok-btn').addEventListener('click', () => rateCard(true, 'ok'));
  };

  const render = () => {
    const cards = Storage.getFlashcards();
    const filtered = filter === 'all' ? cards : cards.filter(c => c.subject === filter);

    const grid = document.getElementById('fc-grid');
    const empty = document.getElementById('fc-empty');

    if (filtered.length === 0) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      document.getElementById('fc-review-mode').classList.add('hidden');
      return;
    }

    empty.classList.add('hidden');

    // Start review button
    if (!document.getElementById('fc-start-review-btn')) {
      const startBtn = document.createElement('button');
      startBtn.id = 'fc-start-review-btn';
      startBtn.className = 'btn btn-primary';
      startBtn.style.marginBottom = '1rem';
      startBtn.textContent = `▶ Lernsession starten (${filtered.length} Karten)`;
      startBtn.addEventListener('click', () => startReview(filtered));
      grid.parentElement.insertBefore(startBtn, grid);
    } else {
      document.getElementById('fc-start-review-btn').textContent = `▶ Lernsession starten (${filtered.length} Karten)`;
      document.getElementById('fc-start-review-btn').onclick = () => startReview(filtered);
    }

    grid.innerHTML = '';
    filtered.forEach(card => {
      const div = document.createElement('div');
      div.className = 'fc-grid-card';
      const subjectColors = { math: '#3b82f6', deutsch: '#ec4899', english: '#10b981', general: '#6366f1' };
      div.innerHTML = `
        <div class="fc-grid-subject" style="color:${subjectColors[card.subject] || '#6366f1'}">${card.subject.toUpperCase()}</div>
        <div class="fc-grid-question">${card.question}</div>
        <div class="fc-grid-score">✓ ${card.correct || 0} / ${card.seen || 0} Mal</div>
      `;
      div.addEventListener('click', () => quickFlip(card));
      grid.appendChild(div);
    });
  };

  const startReview = (cards) => {
    // Sortiere: Karten mit niedrigerer Erfolgsrate zuerst
    reviewQueue = [...cards].sort((a, b) => {
      const scoreA = a.seen > 0 ? a.correct / a.seen : 0;
      const scoreB = b.seen > 0 ? b.correct / b.seen : 0;
      return scoreA - scoreB;
    });

    reviewStats = { correct: 0, wrong: 0 };
    document.getElementById('fc-review-mode').classList.remove('hidden');
    document.getElementById('fc-grid-view').style.display = 'none';
    showNextCard();
  };

  const showNextCard = () => {
    if (reviewQueue.length === 0) {
      endReview();
      return;
    }

    currentCard = reviewQueue[0];
    document.getElementById('fc-current-card').classList.remove('flipped');

    const subjectNames = { math: 'Mathematik', deutsch: 'Deutsch', english: 'Englisch', general: 'Allgemein' };
    document.getElementById('fc-card-subject').textContent = subjectNames[currentCard.subject] || currentCard.subject;
    document.getElementById('fc-card-question').textContent = currentCard.question;
    document.getElementById('fc-card-answer').textContent = currentCard.answer;

    updateReviewStats();
  };

  const rateCard = (correct, rating) => {
    if (!currentCard) return;

    Storage.updateFlashcard(currentCard.id, {
      seen: (currentCard.seen || 0) + 1,
      correct: (currentCard.correct || 0) + (correct ? 1 : 0),
      lastSeen: Date.now()
    });

    if (correct) reviewStats.correct++;
    else { reviewStats.wrong++; reviewQueue.push({ ...currentCard }); }

    reviewQueue.shift();
    showNextCard();
  };

  const endReview = () => {
    const total = reviewStats.correct + reviewStats.wrong;
    const pct = total > 0 ? Math.round((reviewStats.correct / total) * 100) : 0;

    document.getElementById('fc-review-mode').classList.add('hidden');
    document.getElementById('fc-grid-view').style.display = '';

    const points = reviewStats.correct * 3;
    Progress.addPoints(points, 'Lernkarten-Session');
    Animations.showToast(`✓ Session beendet! ${pct}% korrekt · +${points} Punkte`, 'success');

    if (pct === 100) Animations.celebrate('🎉', 'Perfekt!');
    render();
  };

  const updateReviewStats = () => {
    document.getElementById('fc-remaining').textContent = `${reviewQueue.length} verbleibend`;
    document.getElementById('fc-score').textContent = `✓ ${reviewStats.correct} / ✗ ${reviewStats.wrong}`;
  };

  const quickFlip = (card) => {
    // Quick preview - kann hier erweitert werden
  };

  const saveNewCard = () => {
    const subject = document.getElementById('fc-new-subject').value;
    const question = document.getElementById('fc-new-question').value.trim();
    const answer = document.getElementById('fc-new-answer').value.trim();

    if (!question || !answer) {
      Animations.showToast('Bitte Frage und Antwort ausfüllen', 'error');
      return;
    }

    Storage.addFlashcard({ subject, topic: 'Manuell', question, answer });
    document.getElementById('fc-modal').classList.add('hidden');
    document.getElementById('fc-new-question').value = '';
    document.getElementById('fc-new-answer').value = '';

    Animations.showToast('✓ Lernkarte erstellt!', 'success');
    render();
  };

  return { init, render };
})();
