import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Manages browser webcam/mic via getUserMedia.
 * Modular hook for future voice/gesture integration.
 */
export function useWebcam({ autoStart = true } = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const attachStreamToVideo = useCallback((stream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, []);

  const stopStream = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startStream = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('error');
      setError('Your browser does not support camera access.');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      attachStreamToVideo(stream);
      setCameraOn(true);
      setMicOn(true);
      setStatus('active');
    } catch (err) {
      setStatus('error');
      const name = err?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError('Camera access was denied. Allow camera permission in your browser settings.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setError('No camera was found on this device.');
      } else {
        setError('Unable to access your camera. Please try again.');
      }
    }
  }, [attachStreamToVideo, stopStream]);

  useEffect(() => {
    if (!autoStart) return undefined;

    startStream();
    return () => stopStream();
  }, [autoStart, startStream, stopStream]);

  const toggleCamera = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;

    const videoTracks = stream.getVideoTracks();
    if (!videoTracks.length) return;

    const next = !cameraOn;
    videoTracks.forEach((track) => {
      track.enabled = next;
    });
    setCameraOn(next);
  }, [cameraOn]);

  const toggleMic = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;

    const audioTracks = stream.getAudioTracks();
    if (!audioTracks.length) {
      setMicOn((prev) => !prev);
      return;
    }

    const next = !micOn;
    audioTracks.forEach((track) => {
      track.enabled = next;
    });
    setMicOn(next);
  }, [micOn]);

  const endSession = useCallback(() => {
    stopStream();
    setStatus('idle');
  }, [stopStream]);

  return {
    videoRef,
    status,
    error,
    cameraOn,
    micOn,
    toggleCamera,
    toggleMic,
    startStream,
    endSession,
  };
}
