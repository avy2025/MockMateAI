const { generateInterviewResponse } = require('../services/interviewService');
const logger = require('../utils/logger');

const interviewSocketHandlers = (io, socket) => {
  // Listen for starting an interview
  socket.on('interview:start', async (data) => {
    try {
      const { interviewType, sessionId } = data;
      logger.info({
        msg: 'Starting interview session via socket',
        userId: socket.user.id,
        sessionId,
        interviewType
      });

      // Generate the first question
      const result = await generateInterviewResponse({
        message: 'Hello, please start the interview.',
        history: [],
        interviewType,
        sessionId
      });

      // Join a room for this session to broadcast analytics later
      socket.join(`interview_${sessionId}`);

      socket.emit('interview:question', {
        reply: result.reply,
        personalized: result.personalized,
        role: result.role
      });
    } catch (error) {
      logger.error({ msg: 'Socket Interview Start Error', error, sessionId: data?.sessionId });
      socket.emit('error', { message: 'Failed to start interview' });
    }
  });

  // Listen for candidate answers
  socket.on('interview:answer', async (data) => {
    try {
      const { message, history, interviewType, sessionId } = data;

      // Immediately emit the transcript update for the user's answer
      // (Though the client usually handles its own local update, this confirms receipt)
      socket.emit('transcript:update', { role: 'candidate', content: message });

      const result = await generateInterviewResponse({
        message,
        history,
        interviewType,
        sessionId
      });

      // Emit evaluation and next question
      socket.emit('interview:evaluation', result.evaluation);
      socket.emit('interview:question', {
        reply: result.reply,
        personalized: result.personalized,
        role: result.role
      });

      // Update transcript with AI response
      socket.emit('transcript:update', { role: 'interviewer', content: result.reply });

    } catch (error) {
      logger.error({ msg: 'Socket Interview Answer Error', error, sessionId: data?.sessionId });
      socket.emit('error', { message: 'Failed to process answer' });
    }
  });

  // Analytics updates (simulated or triggered by AI/Client sensors)
  socket.on('analytics:update', (data) => {
    const { sessionId, analytics } = data;
    // Broadcast behavioral analytics to the session room (e.g. for potential interviewer/dashboard viewing)
    // Or just echo back/process it
    socket.to(`interview_${sessionId}`).emit('analytics:live', analytics);
    
    // Also echo to sender if needed? Usually sender has this data.
    // For live behavioral analytics, we might just process it here.
    logger.debug({ msg: `Analytics for session ${sessionId}`, sessionId, analytics });
  });

  socket.on('interview:end', (data) => {
    const { sessionId } = data;
    logger.info({ msg: `Ending interview session ${sessionId}`, sessionId, userId: socket.user.id });
    socket.leave(`interview_${sessionId}`);
    socket.emit('interview:ended', { status: 'success' });
  });
};

module.exports = interviewSocketHandlers;
