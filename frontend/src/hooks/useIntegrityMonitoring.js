import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useIntegrityMonitoring
 * ----------------------
 * Tracks professional integrity-related signals:
 * - Window focus/blur events
 * - Tab switching
 * - Focus return events
 * - Audio monitoring (silence/unexpected voice activity)
 * - Integrity scoring system
 */
export function useIntegrityMonitoring({ isSpeaking, isListening, behaviorMetrics }) {
  const [integrityMetrics, setIntegrityMetrics] = useState({
    focusLossCount: 0,
    timeAwayMs: 0,
    integrityScore: 100,
    events: [],
    lastFocusReturn: null,
  });

  const metricsRef = useRef({
    focusLossCount: 0,
    timeAwayMs: 0,
    events: [],
    blurStart: null,
  });

  const addEvent = useCallback((type, message, extra = {}) => {
    const event = {
      type,
      message,
      ts: Date.now(),
      ...extra,
    };
    metricsRef.current.events.push(event);
    calculateScore();
  }, []);

  const calculateScore = useCallback(() => {
    let score = 100;
    const m = metricsRef.current;
    const b = behaviorMetrics;

    // 1. Focus Deductions
    score -= m.focusLossCount * 5;
    score -= Math.floor(m.timeAwayMs / 10000) * 2;

    // 2. Face Visibility Deductions (from behaviorMetrics)
    if (b.faceVisibility.status === 'multiple') {
      score -= 15; // Significant signal
    }
    
    const faceMissedTime = b.faceVisibility.missedFrames * 500; // 500ms per frame
    score -= Math.floor(faceMissedTime / 5000) * 3;

    // 3. Attention Deductions
    if (b.headPose.attentionStatus === 'distracted') {
      score -= 5;
    }
    score -= Math.floor(b.eyeContact.deviationCount / 10) * 2;

    // Ensure score stays within [0, 100]
    const finalScore = Math.max(0, Math.min(100, score));
    setIntegrityMetrics((prev) => ({
      ...prev,
      focusLossCount: m.focusLossCount,
      timeAwayMs: m.timeAwayMs,
      integrityScore: finalScore,
      events: [...m.events],
    }));
  }, [behaviorMetrics]);

  // Window Focus Monitoring
  useEffect(() => {
    const handleBlur = () => {
      metricsRef.current.blurStart = Date.now();
      metricsRef.current.focusLossCount += 1;
      addEvent('focus_loss', 'Window focus lost');
    };

    const handleFocus = () => {
      if (metricsRef.current.blurStart) {
        const away = Date.now() - metricsRef.current.blurStart;
        metricsRef.current.timeAwayMs += away;
        metricsRef.current.blurStart = null;
        addEvent('focus_return', `Focus returned after ${Math.round(away / 1000)}s`);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Handled by blur usually, but visibilitychange is more robust for tab switches
      }
    });

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [addEvent]);

  // Audio Monitoring (Mock/Hook-based for now)
  // Tracking "Unexpected Voice Activity" while AI is speaking
  useEffect(() => {
    if (isSpeaking && !isListening) {
      // If we detect speech while AI is speaking, it's an integrity event
      // This requires the parent to pass down actual speech detection state
    }
  }, [isSpeaking, isListening]);

  // Recalculate score when behavior metrics change
  useEffect(() => {
    calculateScore();
  }, [behaviorMetrics, calculateScore]);

  const getIntegrityReport = useCallback(() => {
    return {
      integrityScore: integrityMetrics.integrityScore,
      focusLossCount: metricsRef.current.focusLossCount,
      timeAwayMs: metricsRef.current.timeAwayMs,
      events: [...metricsRef.current.events],
    };
  }, [integrityMetrics.integrityScore]);

  return { integrityMetrics, getIntegrityReport };
}
