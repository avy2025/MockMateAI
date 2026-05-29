import { useCallback, useEffect, useRef, useState } from 'react';

const PREFERRED_VOICE_NAMES = [
  'Google US English',
  'Microsoft Aria Online',
  'Microsoft Jenny Online',
  'Samantha',
  'Karen',
  'Daniel',
  'Alex',
];

function pickBestVoice(voices) {
  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
  const pool = englishVoices.length ? englishVoices : voices;

  for (const name of PREFERRED_VOICE_NAMES) {
    const match = pool.find((v) => v.name.includes(name));
    if (match) return match;
  }

  const natural = pool.find((v) => v.localService === false);
  if (natural) return natural;

  return pool[0] ?? null;
}

/**
 * Browser text-to-speech via SpeechSynthesis API.
 */
export function useTextToSpeech({ rate = 0.95, pitch = 1, volume = 1 } = {}) {
  const utteranceRef = useRef(null);
  const voiceRef = useRef(null);
  const onEndRef = useRef(null);

  const [isSupported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const loadVoices = useCallback(() => {
    if (!isSupported) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      voiceRef.current = pickBestVoice(voices);
      setVoicesLoaded(true);
    }
  }, [isSupported]);

  useEffect(() => {
    if (!isSupported) return undefined;

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, [isSupported, loadVoices]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, [isSupported]);

  const speak = useCallback(
    (text, { onEnd } = {}) => {
      if (!isSupported || !text?.trim()) return;

      stop();
      onEndRef.current = onEnd ?? null;

      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
      }

      utterance.onstart = () => setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        onEndRef.current?.();
        onEndRef.current = null;
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        onEndRef.current = null;
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, pitch, rate, stop, volume],
  );

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    isSupported,
    isSpeaking,
    voicesLoaded,
    speak,
    stop,
  };
}
