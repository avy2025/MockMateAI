import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWebcam } from '../../hooks/useWebcam';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useBehaviorAnalysis } from '../../hooks/useBehaviorAnalysis';
import { uploadRecording } from '../../services/chatApi';
import InterviewHeader from './InterviewHeader';
import AIInterviewerPanel from './AIInterviewerPanel';
import CandidatePanel from './CandidatePanel';
import VoiceTranscriptPanel from './VoiceTranscriptPanel';
import ControlBar from './ControlBar';
import BehaviorSidebar from './BehaviorSidebar';
import IntegritySidebar from './IntegritySidebar';
import BehaviorAlertToast from './BehaviorAlertToast';
import { useIntegrityMonitoring } from '../../hooks/useIntegrityMonitoring';
import { useMediaRecording } from '../../hooks/useMediaRecording';
import { useInterviewSocket } from '../../hooks/useInterviewSocket';
import '../../styles/interview-room.css';
import '../../styles/behavior-analysis.css';

function InterviewRoom({ interviewType, resumeContext, onEndInterview }) {
  const sessionId = resumeContext?.sessionId;
  const isSpeakingRef = useRef(false);

  const [voiceNotice, setVoiceNotice] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [integritySidebarOpen, setIntegritySidebarOpen] = useState(false);

  // WebSocket Hook
  const {
    transcript: socketTranscript,
    lastQuestion,
    lastEvaluation,
    isProcessing,
    sendAnswer,
    sendAnalytics,
    isConnected: socketConnected
  } = useInterviewSocket(sessionId, interviewType);

  // Recording Hook
  const { startRecording, stopRecording, recordingBlob } = useMediaRecording();

  // Alert toast ref — wired between useBehaviorAnalysis and BehaviorAlertToast
  const alertToastRef = useRef(null);

  const {
    videoRef,
    status,
    error: webcamError,
    cameraOn,
    toggleCamera,
    startStream,
    endSession,
    streamRef,
  } = useWebcam({ autoStart: true });

  // Start recording when stream is active
  useEffect(() => {
    if (status === 'active' && streamRef.current) {
      startRecording(streamRef.current);
    }
  }, [status, streamRef, startRecording]);

  const { speak, stop: stopSpeaking, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();

  // Behavioral analysis — runs on the live video feed
  const { metrics: behaviorMetrics, onAlert, getSessionReport } = useBehaviorAnalysis({
    videoRef,
    isListening: false,
    isSpeaking,
    cameraOn,
  });

  // Sync behavioral analytics to server in real-time
  useEffect(() => {
    if (behaviorMetrics && socketConnected) {
      sendAnalytics(behaviorMetrics);
    }
  }, [behaviorMetrics, socketConnected, sendAnalytics]);

  // Integrity monitoring — tracks tab switches, focus, and multi-face signals
  const { integrityMetrics, getIntegrityReport } = useIntegrityMonitoring({
    isSpeaking,
    isListening: false,
    behaviorMetrics,
  });

  // Forward hook alerts → toast component
  useEffect(() => {
    onAlert((alert) => {
      alertToastRef.current?.(alert);
    });
  }, [onAlert]);

  // Handle incoming AI questions
  useEffect(() => {
    if (lastQuestion?.reply) {
      speak(lastQuestion.reply, {
        onEnd: () => {
          if (!isProcessing) {
            speechRef.current?.startListening();
          }
        },
      });
    }
  }, [lastQuestion, speak, isProcessing]);

  const submitAnswer = useCallback(
    (text) => {
      const trimmed = text?.trim();
      if (!trimmed || isProcessing) return;

      speechRef.current?.stopListening();
      speechRef.current?.resetTranscript();

      setVoiceNotice(null);
      sendAnswer(trimmed);
    },
    [sendAnswer, isProcessing],
  );

  const handleSilence = useCallback(
    (finalText) => {
      if (!finalText.trim()) {
        setVoiceNotice('No speech detected. Click the mic and try again.');
        return;
      }
      submitAnswer(finalText);
    },
    [submitAnswer],
  );

  const speech = useSpeechRecognition({ onSilence: handleSilence });
  const speechRef = useRef(speech);
  speechRef.current = speech;

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    if (speech.error) {
      setVoiceNotice(speech.error);
    }
  }, [speech.error]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      speechRef.current?.stopListening();
    };
  }, [stopSpeaking]);

  const handleToggleVoice = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    }

    if (speech.isListening) {
      speech.stopListening();
      return;
    }

    if (isProcessing) return;

    if (!speech.isSupported) {
      setVoiceNotice('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    setVoiceNotice(null);
    speech.resetTranscript();
    speech.startListening();
  }, [isLoading, isSpeaking, speech, stopSpeaking]);

  const handleEndInterview = async () => {
    stopSpeaking();
    speech.stopListening();
    stopRecording(); // Stop recording
    endSession();
    
    const behaviorReport = getSessionReport();
    const integrityReport = getIntegrityReport();

    // Combine for final report
    const finalReport = {
      ...behaviorReport,
      integrityScore: integrityReport.integrityScore,
      integrityEvents: integrityReport.events,
      focusLossCount: integrityReport.focusLossCount,
      timeAwayMs: integrityReport.timeAwayMs,
    };

    onEndInterview(finalReport, socketTranscript);
  };

  // Upload recording when blob is ready
  useEffect(() => {
    if (recordingBlob && sessionId) {
      uploadRecording(sessionId, recordingBlob)
        .then(() => console.log('Recording uploaded successfully'))
        .catch(err => console.error('Failed to upload recording:', err));
    }
  }, [recordingBlob, sessionId]);


  const combinedError = voiceNotice || (!speech.isSupported && !ttsSupported
    ? 'Voice features require a compatible browser (Chrome or Edge recommended).'
    : null);

  return (
    <div className="interview-room">
      <InterviewHeader interviewType={interviewType} />

      {/* Critical behavioral alert toasts — top-right, non-intrusive */}
      <BehaviorAlertToast alertRef={alertToastRef} />
      <main className="interview-room__stage">
        <AIInterviewerPanel
          isActive
          isSpeaking={isSpeaking}
          currentQuestion={lastQuestion?.reply || ''}
          isLoading={isProcessing && !isSpeaking}
        />
        <CandidatePanel
          videoRef={videoRef}
          cameraOn={cameraOn}
          status={status}
          error={webcamError}
          onRetry={startStream}
          isListening={speech.isListening}
        />
      </main>

      <VoiceTranscriptPanel
        isListening={speech.isListening}
        isSpeaking={isSpeaking}
        isProcessing={isProcessing}
        displayTranscript={speech.displayTranscript}
        currentQuestion={lastQuestion?.reply || ''}
        error={combinedError}
        isSupported={speech.isSupported && ttsSupported}
        transcript={socketTranscript}
      />

      <ControlBar
        isListening={speech.isListening}
        cameraOn={cameraOn}
        onToggleVoice={handleToggleVoice}
        onToggleCamera={toggleCamera}
        onEndInterview={handleEndInterview}
        voiceDisabled={isProcessing || isSpeaking}
      />

      {/* Behavior Analysis slide-out sidebar — collapsed by default */}
      <BehaviorSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        metrics={behaviorMetrics}
        onSecretToggle={() => setIntegritySidebarOpen(true)}
      />

      {/* Integrity Monitoring Sidebar — Hidden/Developer/Recruiter view */}
      <IntegritySidebar
        isOpen={integritySidebarOpen}
        onToggle={() => setIntegritySidebarOpen((prev) => !prev)}
        metrics={integrityMetrics}
      />
    </div>
  );
}

export default InterviewRoom;
