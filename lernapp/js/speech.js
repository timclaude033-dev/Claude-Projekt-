/* ============================================
   Speech - Web Speech API
   ============================================ */

const Speech = (() => {
  let recognition = null;
  let synthesis = window.speechSynthesis;
  let isListening = false;
  let onResult = null;
  let currentUtterance = null;

  const isSupported = () => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  const isSynthesisSupported = () => 'speechSynthesis' in window;

  const initRecognition = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return null;
    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'de-DE';
    return rec;
  };

  const startListening = (callback, lang = 'de-DE') => {
    if (!isSupported()) {
      if (callback) callback(null, 'Spracherkennung nicht unterstützt');
      return false;
    }

    if (isListening) stopListening();

    recognition = initRecognition();
    recognition.lang = lang;

    recognition.onstart = () => {
      isListening = true;
      document.getElementById('voice-status')?.classList.remove('hidden');
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      if (callback) callback(transcript, null);
    };

    recognition.onerror = (e) => {
      isListening = false;
      document.getElementById('voice-status')?.classList.add('hidden');
      if (callback) callback(null, e.error);
    };

    recognition.onend = () => {
      isListening = false;
      document.getElementById('voice-status')?.classList.add('hidden');
    };

    try {
      recognition.start();
      return true;
    } catch (e) {
      return false;
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      isListening = false;
    }
    document.getElementById('voice-status')?.classList.add('hidden');
  };

  const speak = (text, options = {}) => {
    if (!isSynthesisSupported()) return;

    stop();

    const cleanText = text.replace(/[*_`#~\[\]]/g, '').replace(/\*\*(.+?)\*\*/g, '$1').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = options.lang || 'de-DE';
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Stimme auswählen
    const voices = synthesis.getVoices();
    const preferredLang = options.lang || 'de-DE';
    const voice = voices.find(v => v.lang.startsWith(preferredLang.split('-')[0])) || voices[0];
    if (voice) utterance.voice = voice;

    if (options.onEnd) utterance.onend = options.onEnd;

    currentUtterance = utterance;
    synthesis.speak(utterance);
    return utterance;
  };

  const stop = () => {
    if (synthesis && synthesis.speaking) {
      synthesis.cancel();
    }
    currentUtterance = null;
  };

  const getIsListening = () => isListening;

  // Warte auf Stimmen (async laden)
  if (isSynthesisSupported()) {
    if (synthesis.onvoiceschanged !== undefined) {
      synthesis.onvoiceschanged = () => {};
    }
  }

  return { startListening, stopListening, speak, stop, isSupported, isSynthesisSupported, getIsListening };
})();
