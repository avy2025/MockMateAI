import { useCallback, useRef, useState } from 'react';

/**
 * Hook to record media stream using MediaRecorder API.
 */
export function useMediaRecording() {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState(null);

  const startRecording = useCallback((stream) => {
    if (!stream) return;

    chunksRef.current = [];
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm';
    }

    try {
      const recorder = new MediaRecorder(stream, options);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: options.mimeType });
        setRecordingBlob(blob);
        setIsRecording(false);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error('MediaRecorder start error:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const getRecordingFile = useCallback((filename = 'recording.webm') => {
    if (!recordingBlob) return null;
    return new File([recordingBlob], filename, { type: recordingBlob.type });
  }, [recordingBlob]);

  return {
    isRecording,
    recordingBlob,
    startRecording,
    stopRecording,
    getRecordingFile
  };
}
