/* ============================================
   Notes - Lernzettel System
   ============================================ */

const Notes = (() => {
  let currentNoteId = null;

  const init = () => {
    document.getElementById('create-note-btn').addEventListener('click', createNew);
    document.getElementById('note-save-btn').addEventListener('click', save);
    document.getElementById('note-delete-btn').addEventListener('click', deleteNote);
    document.getElementById('auto-gen-note-btn').addEventListener('click', autoGenerate);
    document.getElementById('note-speak-btn').addEventListener('click', speak);
    document.getElementById('note-ai-enhance-btn').addEventListener('click', aiEnhance);
    document.getElementById('note-ai-summary-btn').addEventListener('click', aiSummary);
    document.getElementById('note-to-flash-btn').addEventListener('click', toFlashcards);
  };

  const render = () => {
    const notes = Storage.getNotes();
    const list = document.getElementById('notes-list');

    if (notes.length === 0) {
      list.innerHTML = '<p class="empty-state" style="font-size:0.8rem">Noch keine Lernzettel</p>';
    } else {
      list.innerHTML = '';
      notes.forEach(note => {
        const item = document.createElement('div');
        item.className = `note-item${currentNoteId === note.id ? ' active' : ''}`;

        const subjectIcons = { math: '🔢', deutsch: '📝', english: '🇬🇧', general: '📋' };
        item.innerHTML = `
          <div class="note-item-title">${subjectIcons[note.subject] || '📋'} ${note.title || 'Unbenannt'}</div>
          <div class="note-item-meta">${new Date(note.updatedAt).toLocaleDateString('de-DE')}</div>
        `;
        item.addEventListener('click', () => open(note.id));
        list.appendChild(item);
      });
    }
  };

  const createNew = () => {
    currentNoteId = null;
    showEditor();
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    document.getElementById('note-subject').value = 'general';
  };

  const open = (id) => {
    const notes = Storage.getNotes();
    const note = notes.find(n => n.id === id);
    if (!note) return;

    currentNoteId = id;
    showEditor();
    document.getElementById('note-title').value = note.title || '';
    document.getElementById('note-content').value = note.content || '';
    document.getElementById('note-subject').value = note.subject || 'general';
    render();
  };

  const showEditor = () => {
    document.getElementById('note-empty').classList.add('hidden');
    document.getElementById('note-editor').classList.remove('hidden');
  };

  const save = () => {
    const title = document.getElementById('note-title').value.trim() || 'Unbenannt';
    const content = document.getElementById('note-content').value;
    const subject = document.getElementById('note-subject').value;

    const saved = Storage.saveNote({ id: currentNoteId, title, content, subject });
    currentNoteId = saved.id || currentNoteId;

    Animations.showToast('✓ Lernzettel gespeichert', 'success');
    render();
  };

  const deleteNote = () => {
    if (!currentNoteId) return;
    if (!confirm('Lernzettel wirklich löschen?')) return;

    Storage.deleteNote(currentNoteId);
    currentNoteId = null;
    document.getElementById('note-empty').classList.remove('hidden');
    document.getElementById('note-editor').classList.add('hidden');

    Animations.showToast('Lernzettel gelöscht', 'info');
    render();
  };

  const speak = () => {
    const content = document.getElementById('note-content').value;
    if (!content) return;
    Speech.speak(content);
    Animations.showToast('🔊 Lese Lernzettel vor...', 'info');
  };

  const autoGenerate = () => {
    const progress = Storage.getProgress();
    const brain = Storage.getBrain();
    const concepts = brain.concepts || {};

    if (Object.keys(concepts).length === 0) {
      Animations.showToast('Lerne erst etwas, dann generiere ich Lernzettel!', 'info');
      return;
    }

    // Finde häufigste Themen aus heutigem Lernen
    const topicsBySubject = {};
    Object.entries(concepts).forEach(([key, data]) => {
      const [subject, topic] = key.split(':');
      if (!topicsBySubject[subject]) topicsBySubject[subject] = [];
      if (!topicsBySubject[subject].includes(topic)) topicsBySubject[subject].push(topic);
    });

    let content = `# Auto-Lernzettel – ${new Date().toLocaleDateString('de-DE')}\n\n`;

    Object.entries(topicsBySubject).forEach(([subject, topics]) => {
      const subjectName = { math: 'Mathematik', deutsch: 'Deutsch', english: 'Englisch' }[subject] || subject;
      content += `## ${subjectName}\n\n`;

      topics.slice(0, 3).forEach(topic => {
        const kb = Brain.getKnowledge(subject, topic);
        if (kb) {
          content += `### ${topic}\n`;
          kb.rules.forEach(r => { content += `• ${r}\n`; });
          content += '\n';
        }
      });
    });

    content += '\n---\n_Automatisch aus deiner Lernsession erstellt_';

    Storage.saveNote({
      title: `Auto-Lernzettel ${new Date().toLocaleDateString('de-DE')}`,
      content,
      subject: 'general'
    });

    render();
    Animations.showToast('✓ Auto-Lernzettel erstellt!', 'success');

    // Zeige den neuen Zettel
    const notes = Storage.getNotes();
    if (notes.length > 0) open(notes[0].id);
  };

  const aiEnhance = () => {
    const content = document.getElementById('note-content').value;
    if (!content) return;

    // Füge Struktur hinzu
    let enhanced = content;
    if (!enhanced.startsWith('#')) {
      const title = document.getElementById('note-title').value || 'Lernzettel';
      enhanced = `# ${title}\n\n${enhanced}`;
    }

    // Füge Trennlinien zwischen Abschnitten ein
    enhanced = enhanced.replace(/\n\n([A-Z])/g, '\n\n---\n\n$1');

    document.getElementById('note-content').value = enhanced;
    Animations.showToast('✓ Lernzettel verbessert', 'success');
  };

  const aiSummary = () => {
    const content = document.getElementById('note-content').value;
    if (!content || content.length < 50) {
      Animations.showToast('Schreibe mehr Inhalt für eine Zusammenfassung', 'info');
      return;
    }

    const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    const keyLines = lines.slice(0, 5);
    const summary = `\n\n---\n## 📌 Zusammenfassung\n${keyLines.map(l => `• ${l.replace(/^[•▸★→✓\-\d.]\s*/, '').trim()}`).join('\n')}`;

    document.getElementById('note-content').value = content + summary;
    Animations.showToast('✓ Zusammenfassung hinzugefügt', 'success');
  };

  const toFlashcards = () => {
    const content = document.getElementById('note-content').value;
    const subject = document.getElementById('note-subject').value;

    const lines = content.split('\n').filter(l => l.includes(':') && l.length > 5 && l.length < 200);
    let created = 0;

    lines.forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const q = parts[0].replace(/^[#•▸★→✓\-\d.\s]+/, '').trim();
        const a = parts.slice(1).join(':').trim();
        if (q && a && q.length > 2) {
          Storage.addFlashcard({ subject: subject === 'general' ? 'math' : subject, topic: 'Lernzettel', question: q, answer: a });
          created++;
        }
      }
    });

    if (created > 0) {
      Animations.showToast(`✓ ${created} Lernkarten aus Lernzettel erstellt!`, 'success');
      Storage.addActivity('🗂️', `${created} Lernkarten aus Lernzettel erstellt`, 'general');
    } else {
      Animations.showToast('Füge Definitionen im Format "Begriff: Erklärung" hinzu', 'info');
    }
  };

  return { init, render, autoGenerate };
})();
