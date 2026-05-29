import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_SILENCE_MS = 2000;

function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * Browser speech-to-text via Web Speech API.
 * Supports manual start/stop and automatic silence detection.
 */
export function useSpeechRecognition({
  silenceTimeoutMs = DEFAULT_SILENCE_MS,
  onSilence,
  lang = 'en-US',
} = {}) {
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const onSilenceRef = useRef(onSilence);

  const [isSupported] = useState(() => Boolean(getSpeechRecognitionConstructor()));
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    onSilenceRef.current = onSilence;
  }, [onSilence]);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const scheduleSilenceStop = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      const recognition = recognitionRef.current;
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // Already stopped
        }
      }
    }, silenceTimeoutMs);
  }, [clearSilenceTimer, silenceTimeoutMs]);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    const recognition = recognitionRef.current;
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        // Already stopped
      }
    }
  }, [clearSilenceTimer]);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    setError(null);
    setPermissionDenied(false);
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      scheduleSilenceStop();
    };

    recognition.onresult = (event) => {
      let interim = '';
      let finalChunk = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalChunk = `${finalChunk}${text}`.trim();
          finalTranscriptRef.current = finalChunk;
        } else {
          interim = `${interim}${text}`;
        }
      }

      setTranscript(finalChunk);
      setInterimTranscript(interim.trim());
      scheduleSilenceStop();
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setPermissionDenied(true);
        setError('Microphone permission denied. Allow mic access to use voice input.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error !== 'aborted') {
        setError('Speech recognition failed. Please try again.');
      }
      setIsListening(false);
      clearSilenceTimer();
    };

    recognition.onend = () => {
      setIsListening(false);
      clearSilenceTimer();
      setInterimTranscript('');

      const finalText = finalTranscriptRef.current.trim();
      if (finalText && onSilenceRef.current) {
        onSilenceRef.current(finalText);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setError('Unable to start speech recognition. Please try again.');
      setIsListening(false);
    }
  }, [clearSilenceTimer, lang, scheduleSilenceStop]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        try {
          recognition.abort();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [clearSilenceTimer]);

  const displayTranscript = interimTranscript
    ? `${transcript}${transcript ? ' ' : ''}${interimTranscript}`
    : transcript;

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    displayTranscript,
    error,
    permissionDenied,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}
