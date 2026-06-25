/* ============================================
   Chat AI - Konversationsinterface
   ============================================ */

const ChatAI = (() => {
  let isTyping = false;
  let pendingImageData = null;

  const init = () => {
    document.getElementById('chat-send-btn').addEventListener('click', sendMessage);
    document.getElementById('chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    document.getElementById('chat-voice-btn').addEventListener('click', startVoice);
    document.getElementById('chat-upload-btn').addEventListener('click', () => document.getElementById('image-upload').click());
    document.getElementById('image-upload').addEventListener('change', handleImageUpload);
    document.getElementById('chat-note-btn').addEventListener('click', createNoteFromChat);
    document.getElementById('chat-flash-btn').addEventListener('click', createFlashFromChat);

    // Auto-resize textarea
    const input = document.getElementById('chat-input');
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
  };

  const sendMessage = async () => {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text && !pendingImageData) return;
    if (isTyping) return;

    const userMessage = pendingImageData ? `[Bild] ${text || 'Was siehst du auf diesem Bild?'}` : text;
    appendMessage('user', userMessage);
    Storage.addChatMessage('user', userMessage);

    input.value = '';
    input.style.height = 'auto';

    if (pendingImageData) {
      const preview = document.getElementById('uploaded-image-preview');
      preview.classList.add('hidden');
      pendingImageData = null;
    }

    // KI-Antwort generieren
    isTyping = true;
    showTyping();

    await delay(600 + Math.random() * 800);

    const response = Brain.generateResponse(text || 'Was siehst du auf diesem Bild?');
    hideTyping();
    appendMessage('ai', response);
    Storage.addChatMessage('ai', response);

    isTyping = false;

    // Sprachausgabe wenn aktiviert
    if (document.getElementById('voice-btn').classList.contains('active')) {
      Speech.speak(response.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, ''));
    }
  };

  const sendSuggestion = async (text) => {
    document.getElementById('chat-input').value = text;
    await sendMessage();
  };

  const appendMessage = (role, content) => {
    const container = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = role === 'ai' ? '🤖' : '🎓';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = formatMessage(content);

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    container.appendChild(msg);

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^#{1,3}\s(.+)$/gm, '<strong>$1</strong>')
      .replace(/^▸\s(.+)$/gm, '<span>▸ $1</span>')
      .replace(/^•\s(.+)$/gm, '<span>• $1</span>')
      .replace(/^★\s(.+)$/gm, '<span>★ $1</span>')
      .replace(/^→\s(.+)$/gm, '<span>→ $1</span>')
      .replace(/^✓\s(.+)$/gm, '<span>✓ $1</span>')
      .replace(/^(\d+)\.\s(.+)$/gm, '<span>$1. $2</span>')
      .replace(/\n/g, '<br>');
  };

  const showTyping = () => {
    const container = document.getElementById('chat-messages');
    const typing = document.createElement('div');
    typing.className = 'chat-msg ai typing-indicator';
    typing.id = 'typing-indicator';
    typing.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>`;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
  };

  const hideTyping = () => {
    document.getElementById('typing-indicator')?.remove();
  };

  const startVoice = () => {
    if (Speech.getIsListening()) {
      Speech.stopListening();
      return;
    }

    const btn = document.getElementById('chat-voice-btn');
    btn.textContent = '🔴 Stopp';

    Speech.startListening((transcript, error) => {
      btn.textContent = '🎤 Sprechen';
      if (transcript) {
        document.getElementById('chat-input').value = transcript;
        sendMessage();
      } else if (error) {
        Animations.showToast('Spracherkennung fehlgeschlagen: ' + error, 'error');
      }
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      pendingImageData = ev.target.result;
      const preview = document.getElementById('uploaded-image-preview');
      preview.innerHTML = `<img src="${pendingImageData}" alt="Hochgeladenes Bild">`;
      preview.classList.remove('hidden');
      Animations.showToast('Bild hochgeladen! Schreibe eine Frage dazu.', 'info');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const createNoteFromChat = () => {
    const messages = document.getElementById('chat-messages');
    const aiMessages = messages.querySelectorAll('.chat-msg.ai .msg-bubble');
    if (aiMessages.length === 0) {
      Animations.showToast('Noch keine KI-Antworten vorhanden', 'info');
      return;
    }

    let content = '# Notizen aus KI-Chat\n\n';
    aiMessages.forEach((msg, i) => {
      content += `## Antwort ${i + 1}\n${msg.innerText}\n\n---\n\n`;
    });

    const note = Storage.saveNote({
      title: `KI-Chat ${new Date().toLocaleDateString('de-DE')}`,
      content,
      subject: 'general'
    });

    Animations.showToast('✓ Lernzettel aus Chat erstellt!', 'success');
    App.navigate('notes');
  };

  const createFlashFromChat = () => {
    // Erstelle Lernkarten aus der letzten KI-Antwort
    const messages = document.getElementById('chat-messages');
    const aiMsgs = messages.querySelectorAll('.chat-msg.ai .msg-bubble');
    if (aiMsgs.length === 0) return;

    const lastMsg = aiMsgs[aiMsgs.length - 1].innerText;
    const lines = lastMsg.split('\n').filter(l => l.trim().length > 10);

    let created = 0;
    lines.forEach(line => {
      if (line.includes(':') && line.length < 200) {
        const parts = line.split(':');
        if (parts.length >= 2) {
          Storage.addFlashcard({
            subject: 'general',
            topic: 'KI-Chat',
            question: parts[0].replace(/[▸•★→✓\d.]/g, '').trim(),
            answer: parts.slice(1).join(':').trim()
          });
          created++;
        }
      }
    });

    if (created > 0) {
      Animations.showToast(`✓ ${created} Lernkarten erstellt!`, 'success');
    } else {
      Animations.showToast('Erstelle zuerst Erklärungen mit der KI', 'info');
    }
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  return { init, sendMessage, sendSuggestion, appendMessage };
})();
