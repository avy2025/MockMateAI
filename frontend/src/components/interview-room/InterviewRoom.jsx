import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWebcam } from '../../hooks/useWebcam';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { sendChatMessage } from '../../services/chatApi';
import InterviewHeader from './InterviewHeader';
import AIInterviewerPanel from './AIInterviewerPanel';
import CandidatePanel from './CandidatePanel';
import VoiceTranscriptPanel from './VoiceTranscriptPanel';
import ControlBar from './ControlBar';
import '../../styles/interview-room.css';

function InterviewRoom({ interviewType, resumeContext, onEndInterview }) {
  const sessionId = resumeContext?.sessionId;
  const isLoadingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const messagesRef = useRef([]);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [voiceNotice, setVoiceNotice] = useState(null);

  const {
    videoRef,
    status,
    error: webcamError,
    cameraOn,
    toggleCamera,
    startStream,
    endSession,
  } = useWebcam({ autoStart: true });

  const { speak, stop: stopSpeaking, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();

  const submitAnswer = useCallback(
    async (text) => {
      const trimmed = text?.trim();
      if (!trimmed || isLoadingRef.current) return;

      speechRef.current?.stopListening();
      speechRef.current?.resetTranscript();

      isLoadingRef.current = true;
      setIsLoading(true);
      setVoiceNotice(null);

      const userMessage = { role: 'user', content: trimmed };
      const historyForBackend = [...messagesRef.current, userMessage];
      messagesRef.current = historyForBackend;
      setMessages(historyForBackend);

      try {
        const data = await sendChatMessage({
          message: trimmed,
          history: historyForBackend,
          interviewType,
          sessionId,
        });

        const updatedMessages = historyForBackend.map((msg, idx) => {
          if (idx === historyForBackend.length - 1) {
            return { ...msg, evaluation: data.evaluation };
          }
          return msg;
        });

        const aiMessage = { role: 'model', content: data.reply };
        const nextMessages = [...updatedMessages, aiMessage];
        messagesRef.current = nextMessages;
        setMessages(nextMessages);
        setCurrentQuestion(data.reply);

        speak(data.reply, {
          onEnd: () => {
            if (!isLoadingRef.current) {
              speechRef.current?.startListening();
            }
          },
        });
      } catch (err) {
        console.error('Interview chat error:', err);
        setVoiceNotice('Lost connection. Please check your server and try again.');
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [interviewType, sessionId, speak],
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
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (speech.error) {
      setVoiceNotice(speech.error);
    }
  }, [speech.error]);

  useEffect(() => {
    let cancelled = false;

    const startInterview = async () => {
      isLoadingRef.current = true;
      setIsLoading(true);
      setVoiceNotice(null);

      try {
        const data = await sendChatMessage({
          message: 'Hello, please start the interview.',
          history: [],
          interviewType,
          sessionId,
        });

        if (cancelled) return;

        const firstMessage = { role: 'model', content: data.reply };
        messagesRef.current = [firstMessage];
        setMessages([firstMessage]);
        setCurrentQuestion(data.reply);

        speak(data.reply, {
          onEnd: () => {
            if (!cancelled && !isLoadingRef.current) {
              speechRef.current?.startListening();
            }
          },
        });
      } catch (err) {
        console.error('Failed to start interview:', err);
        if (!cancelled) {
          setVoiceNotice(
            "Unable to connect to the interview server. Is the backend running?",
          );
        }
      } finally {
        if (!cancelled) {
          isLoadingRef.current = false;
          setIsLoading(false);
        }
      }
    };

    startInterview();

    return () => {
      cancelled = true;
      stopSpeaking();
      speechRef.current?.stopListening();
    };
  }, [interviewType, sessionId, speak, stopSpeaking]);

  const handleToggleVoice = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    }

    if (speech.isListening) {
      speech.stopListening();
      return;
    }

    if (isLoading) return;

    if (!speech.isSupported) {
      setVoiceNotice('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    setVoiceNotice(null);
    speech.resetTranscript();
    speech.startListening();
  }, [isLoading, isSpeaking, speech, stopSpeaking]);

  const handleEndInterview = () => {
    stopSpeaking();
    speech.stopListening();
    endSession();
    onEndInterview();
  };

  const combinedError = voiceNotice || (!speech.isSupported && !ttsSupported
    ? 'Voice features require a compatible browser (Chrome or Edge recommended).'
    : null);

  return (
    <div className="interview-room">
      <InterviewHeader interviewType={interviewType} />

      <main className="interview-room__stage">
        <AIInterviewerPanel
          isActive
          isSpeaking={isSpeaking}
          currentQuestion={currentQuestion}
          isLoading={isLoading && !isSpeaking}
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
        isProcessing={isLoading}
        displayTranscript={speech.displayTranscript}
        currentQuestion={currentQuestion}
        error={combinedError}
        isSupported={speech.isSupported && ttsSupported}
      />

      <ControlBar
        isListening={speech.isListening}
        cameraOn={cameraOn}
        onToggleVoice={handleToggleVoice}
        onToggleCamera={toggleCamera}
        onEndInterview={handleEndInterview}
        voiceDisabled={isLoading || isSpeaking}
      />
    </div>
  );
}

export default InterviewRoom;
