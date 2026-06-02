import { useCallback, useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Constants — thresholds for observable behavioral signals
// ---------------------------------------------------------------------------
const GAZE_DEVIATION_THRESHOLD = 0.08;  // iris offset ratio — beyond = looking away
const YAW_THRESHOLD = 0.18;             // head lateral turn ratio
const PITCH_DOWN_THRESHOLD = 0.22;      // head downward tilt ratio
const LONG_GAZE_AWAY_MS = 5000;         // ms before "looking away" alert fires
const FACE_MISSING_MS = 3000;           // ms before "face missing" alert fires
const ANALYSIS_INTERVAL_MS = 500;       // run analysis every 500 ms
const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619';

// ---------------------------------------------------------------------------
// Default metric state
// ---------------------------------------------------------------------------
function defaultMetrics() {
  return {
    eyeContact: {
      score: 100,
      lookingAway: false,
      deviationCount: 0,
      onScreenMs: 0,
      totalMs: 0,
    },
    faceVisibility: {
      status: 'initializing', // 'visible' | 'missing' | 'multiple' | 'initializing'
      missedFrames: 0,
    },
    headPose: {
      attentionStatus: 'focused', // 'focused' | 'distracted' | 'scanning'
      downwardCount: 0,
      lateralCount: 0,
    },
    communication: {
      responseDelayMs: 0,
      speakingDurationMs: 0,
      pauseCount: 0,
    },
    sessionLog: [],
    isReady: false,
  };
}

// ---------------------------------------------------------------------------
// Utility — load MediaPipe script from CDN once
// ---------------------------------------------------------------------------
let mediaPipeLoadPromise = null;
function loadMediaPipe() {
  if (mediaPipeLoadPromise) return mediaPipeLoadPromise;

  mediaPipeLoadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.FaceMesh) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.crossOrigin = 'anonymous';
    script.src = `${MEDIAPIPE_CDN}/face_mesh.js`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load MediaPipe Face Mesh from CDN'));
    document.head.appendChild(script);
  });

  return mediaPipeLoadPromise;
}

// ---------------------------------------------------------------------------
// Landmark helpers
// ---------------------------------------------------------------------------

/**
 * Estimates horizontal gaze deviation.
 * Uses iris center (landmarks 468, 473) relative to eye corners.
 * Returns a ratio: 0 = center, positive = right, negative = left.
 */
function estimateGazeDeviation(landmarks) {
  if (!landmarks || landmarks.length < 474) return 0;

  // Left eye: corner 33 (outer), 133 (inner)  | iris center: 468
  const leftOuter = landmarks[33];
  const leftInner = landmarks[133];
  const leftIris  = landmarks[468];

  // Right eye: corner 362 (outer), 263 (inner) | iris center: 473
  const rightOuter = landmarks[362];
  const rightInner = landmarks[263];
  const rightIris  = landmarks[473];

  const leftEyeWidth  = Math.abs(leftOuter.x - leftInner.x);
  const rightEyeWidth = Math.abs(rightOuter.x - rightInner.x);

  if (leftEyeWidth < 0.001 || rightEyeWidth < 0.001) return 0;

  // Normalised iris offset within eye width
  const leftOffset  = (leftIris.x  - (leftOuter.x  + leftInner.x)  / 2) / leftEyeWidth;
  const rightOffset = (rightIris.x - (rightOuter.x + rightInner.x) / 2) / rightEyeWidth;

  return (leftOffset + rightOffset) / 2;
}

/**
 * Estimates head yaw (left/right) and pitch (up/down).
 * Uses nose tip (1), left ear (234), right ear (454), chin (152), forehead (10).
 */
function estimateHeadPose(landmarks) {
  if (!landmarks || landmarks.length < 455) return { yaw: 0, pitch: 0 };

  const noseTip   = landmarks[1];
  const leftEar   = landmarks[234];
  const rightEar  = landmarks[454];
  const chin      = landmarks[152];
  const forehead  = landmarks[10];

  // Yaw: nose horizontal offset from midpoint of ears
  const earMidX = (leftEar.x + rightEar.x) / 2;
  const earWidth = Math.abs(rightEar.x - leftEar.x);
  const yaw = earWidth > 0.001 ? (noseTip.x - earMidX) / earWidth : 0;

  // Pitch: nose vertical offset from midpoint of chin-forehead
  const vertMid   = (chin.y + forehead.y) / 2;
  const faceHeight = Math.abs(chin.y - forehead.y);
  const pitch = faceHeight > 0.001 ? (noseTip.y - vertMid) / faceHeight : 0;

  return { yaw, pitch };
}

// ---------------------------------------------------------------------------
// Main hook
// ---------------------------------------------------------------------------
export function useBehaviorAnalysis({ videoRef, isListening, isSpeaking, cameraOn }) {
  const [metrics, setMetrics] = useState(defaultMetrics);

  const faceMeshRef        = useRef(null);
  const rafRef             = useRef(null);
  const lastResultRef      = useRef(null);
  const metricsRef         = useRef(defaultMetrics());
  const alertCallbackRef   = useRef(null);

  // Communication timing refs
  const speakStartRef      = useRef(null);
  const listenStartRef     = useRef(null);
  const pauseCountRef      = useRef(0);
  const responseDelayRef   = useRef(0);
  const speakDurationRef   = useRef(0);

  // Alert debounce refs
  const lookingAwayStartRef  = useRef(null);
  const faceMissingStartRef  = useRef(null);
  const lastAlertRef         = useRef({});

  // ---------------------------------------------------------------------------
  // Alert emitter — called by analysis loop; consumers attach via onAlert
  // ---------------------------------------------------------------------------
  const emitAlert = useCallback((type, message) => {
    const now = Date.now();
    if (lastAlertRef.current[type] && now - lastAlertRef.current[type] < 8000) return;
    lastAlertRef.current[type] = now;

    // Append to session log
    metricsRef.current.sessionLog.push({ ts: now, type, message });

    if (alertCallbackRef.current) {
      alertCallbackRef.current({ type, message, ts: now });
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Analysis — called with each FaceMesh result
  // ---------------------------------------------------------------------------
  const analyzeResult = useCallback((results) => {
    const now = Date.now();
    const m = metricsRef.current;
    const faces = results.multiFaceLandmarks || [];
    const faceCount = faces.length;

    // --- Face visibility ---
    let visStatus = 'visible';
    if (faceCount === 0) {
      visStatus = 'missing';
      m.faceVisibility.missedFrames += 1;

      if (!faceMissingStartRef.current) {
        faceMissingStartRef.current = now;
      } else if (now - faceMissingStartRef.current > FACE_MISSING_MS) {
        emitAlert('face_missing', 'Integrity Signal: Face not visible');
      }
    } else {
      faceMissingStartRef.current = null;
      m.faceVisibility.missedFrames = 0;
      if (faceCount > 1) {
        visStatus = 'multiple';
        emitAlert('multiple_faces', 'Integrity Signal: Multiple persons detected');
      }
    }
    m.faceVisibility.status = visStatus;

    if (faceCount === 0) {
      setMetrics({ ...metricsRef.current });
      return;
    }

    const landmarks = faces[0];

    // --- Eye contact ---
    const gazeDeviation = estimateGazeDeviation(landmarks);
    const isLookingAway = Math.abs(gazeDeviation) > GAZE_DEVIATION_THRESHOLD;

    m.eyeContact.totalMs += ANALYSIS_INTERVAL_MS;
    if (!isLookingAway) {
      m.eyeContact.onScreenMs += ANALYSIS_INTERVAL_MS;
    } else {
      m.eyeContact.deviationCount += 1;
    }

    // Long gaze-away alert
    if (isLookingAway) {
      if (!lookingAwayStartRef.current) lookingAwayStartRef.current = now;
      else if (now - lookingAwayStartRef.current > LONG_GAZE_AWAY_MS) {
        emitAlert('gaze_away', 'Attention check — focus on the screen');
      }
    } else {
      lookingAwayStartRef.current = null;
    }

    m.eyeContact.lookingAway = isLookingAway;
    m.eyeContact.score = m.eyeContact.totalMs > 0
      ? Math.round((m.eyeContact.onScreenMs / m.eyeContact.totalMs) * 100)
      : 100;

    // --- Head pose ---
    const { yaw, pitch } = estimateHeadPose(landmarks);
    const isLateral = Math.abs(yaw) > YAW_THRESHOLD;
    const isDownward = pitch > PITCH_DOWN_THRESHOLD;

    if (isLateral) m.headPose.lateralCount += 1;
    if (isDownward) m.headPose.downwardCount += 1;

    // Derive attention status
    const totalFrames = m.eyeContact.totalMs / ANALYSIS_INTERVAL_MS || 1;
    const lateralRatio = m.headPose.lateralCount / totalFrames;
    const downRatio    = m.headPose.downwardCount / totalFrames;

    if (lateralRatio > 0.4) {
      m.headPose.attentionStatus = 'scanning';
    } else if (downRatio > 0.3 || m.eyeContact.score < 40) {
      m.headPose.attentionStatus = 'distracted';
    } else {
      m.headPose.attentionStatus = 'focused';
    }

    lastResultRef.current = results;
    setMetrics({ ...metricsRef.current });
  }, [emitAlert]);

  // ---------------------------------------------------------------------------
  // Communication metric tracking via isListening / isSpeaking props
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const now = Date.now();
    if (isSpeaking) {
      // AI speaking — start tracking response delay for candidate
      if (!speakStartRef.current) speakStartRef.current = now;
    } else if (speakStartRef.current) {
      speakStartRef.current = null;
    }
  }, [isSpeaking]);

  useEffect(() => {
    const now = Date.now();
    if (isListening) {
      // Candidate starts speaking → response delay = now - AI finished speaking
      if (speakStartRef.current === null && !listenStartRef.current) {
        // AI had finished, candidate just started
        listenStartRef.current = now;
      }
      if (!listenStartRef.current) listenStartRef.current = now;
    } else if (listenStartRef.current) {
      const duration = Date.now() - listenStartRef.current;
      speakDurationRef.current += duration;
      metricsRef.current.communication.speakingDurationMs = speakDurationRef.current;
      listenStartRef.current = null;
    }
  }, [isListening]);

  // ---------------------------------------------------------------------------
  // MediaPipe init + rAF loop
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!cameraOn) return;

    let cancelled = false;
    let faceMesh = null;
    let lastAnalysis = 0;

    const init = async () => {
      try {
        await loadMediaPipe();
        if (cancelled) return;

        faceMesh = new window.FaceMesh({
          locateFile: (file) => `${MEDIAPIPE_CDN}/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 2,
          refineLandmarks: true,   // enables iris landmarks 468–477
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results) => {
          if (!cancelled) analyzeResult(results);
        });

        faceMeshRef.current = faceMesh;

        // Mark as ready
        metricsRef.current.isReady = true;
        setMetrics((prev) => ({ ...prev, isReady: true, faceVisibility: { ...prev.faceVisibility, status: 'visible' } }));

        // rAF loop
        const loop = async () => {
          if (cancelled) return;
          const now = Date.now();
          const video = videoRef.current;

          if (
            video &&
            video.readyState >= 2 &&
            now - lastAnalysis >= ANALYSIS_INTERVAL_MS
          ) {
            lastAnalysis = now;
            try {
              await faceMesh.send({ image: video });
            } catch (_) {
              // video frame not ready yet — skip silently
            }
          }

          rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.warn('[BehaviorAnalysis] MediaPipe load failed:', err.message);
        // Gracefully degrade — metrics stay at defaults, no crash
      }
    };

    init();

    return () => {
      cancelled = true;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close?.();
        faceMeshRef.current = null;
      }
      metricsRef.current = defaultMetrics();
      mediaPipeLoadPromise = null; // allow re-init if component remounts
    };
  }, [cameraOn, videoRef, analyzeResult]);

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Register a callback for critical alerts: fn({ type, message, ts }) */
  const onAlert = useCallback((fn) => {
    alertCallbackRef.current = fn;
  }, []);

  /** Returns final snapshot of session log for the report */
  const getSessionReport = useCallback(() => ({
    eyeContactScore: metricsRef.current.eyeContact.score,
    attentionStatus: metricsRef.current.headPose.attentionStatus,
    faceVisibilityMissedFrames: metricsRef.current.faceVisibility.missedFrames,
    gazeDeviationCount: metricsRef.current.eyeContact.deviationCount,
    lateralHeadCount: metricsRef.current.headPose.lateralCount,
    downwardHeadCount: metricsRef.current.headPose.downwardCount,
    speakingDurationMs: metricsRef.current.communication.speakingDurationMs,
    sessionLog: [...metricsRef.current.sessionLog],
  }), []);

  return { metrics, onAlert, getSessionReport };
}
