import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

export const useInterviewSocket = (sessionId, interviewType) => {
  const { socket, isConnected } = useSocket();
  const [transcript, setTranscript] = useState([]);
  const [lastQuestion, setLastQuestion] = useState(null);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveAnalytics, setLiveAnalytics] = useState(null);

  useEffect(() => {
    if (!socket || !isConnected || !sessionId) return;

    // Join/Start session
    socket.emit('interview:start', { sessionId, interviewType });

    // Event listeners
    socket.on('interview:question', (data) => {
      setLastQuestion(data);
      setIsProcessing(false);
      setTranscript((prev) => [...prev, { role: 'interviewer', content: data.reply }]);
    });

    socket.on('interview:evaluation', (data) => {
      setLastEvaluation(data);
    });

    socket.on('transcript:update', (entry) => {
      // Check if entry already exists in transcript to avoid duplicates
      setTranscript((prev) => {
        const exists = prev.some(item => 
          item.role === entry.role && item.content === entry.content
        );
        if (exists) return prev;
        return [...prev, entry];
      });
    });

    socket.on('analytics:live', (data) => {
      setLiveAnalytics(data);
    });

    socket.on('error', (err) => {
      console.error('Interview socket error:', err);
      setIsProcessing(false);
    });

    return () => {
      socket.off('interview:question');
      socket.off('interview:evaluation');
      socket.off('transcript:update');
      socket.off('analytics:live');
      socket.off('error');
    };
  }, [socket, isConnected, sessionId, interviewType]);

  const sendAnswer = useCallback((message) => {
    if (!socket || !isConnected) return;

    setIsProcessing(true);
    // Include current transcript as history for AI context
    const history = transcript.map(t => ({
      role: t.role === 'candidate' ? 'user' : 'assistant',
      content: t.content
    }));

    socket.emit('interview:answer', {
      message,
      history,
      interviewType,
      sessionId
    });
    
    // Optimistic update
    setTranscript(prev => [...prev, { role: 'candidate', content: message }]);
  }, [socket, isConnected, transcript, interviewType, sessionId]);

  const sendAnalytics = useCallback((analytics) => {
    if (!socket || !isConnected) return;
    socket.emit('analytics:update', { sessionId, analytics });
  }, [socket, isConnected, sessionId]);

  return {
    transcript,
    lastQuestion,
    lastEvaluation,
    isProcessing,
    liveAnalytics,
    sendAnswer,
    sendAnalytics,
    isConnected
  };
};
