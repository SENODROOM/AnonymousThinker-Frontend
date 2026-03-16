import { useState, useRef, useCallback, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

/**
 * useVoiceInput
 *
 * Wraps the browser's Web Speech API (SpeechRecognition).
 * Appends transcript to the current input value in real-time.
 *
 * @param {Function} onTranscript  Called with (fullText) when speech is recognized
 * @returns {{ listening, supported, start, stop, error }}
 */
const useVoiceInput = (onTranscript) => {
  const { settings } = useSettings();
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const interimRef = useRef('');

  const supported = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (!supported) {
      setError('Voice input is not supported in your browser. Try Chrome or Edge.');
      return;
    }
    setError(null);
    interimRef.current = '';

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = settings.voiceInputLang || 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      let interim = '';
      let final = interimRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim = transcript;
        }
      }

      interimRef.current = final;
      onTranscript(final + interim);
    };

    recognition.onerror = (event) => {
      const messages = {
        'not-allowed': 'Microphone access denied. Please allow microphone permissions.',
        'no-speech': 'No speech detected. Please try again.',
        'network': 'Network error during voice recognition.',
        'aborted': null, // user stopped — no error message
      };
      const msg = messages[event.error];
      if (msg) setError(msg);
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [supported, settings.voiceInputLang, onTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  return { listening, supported, start, stop, error, clearError: () => setError(null) };
};

export default useVoiceInput;