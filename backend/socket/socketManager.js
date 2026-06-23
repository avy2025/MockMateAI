const jwt = require('jsonwebtoken');
const interviewSocketHandlers = require('./interviewSocket');
const logger = require('../utils/logger');

const initSocketManager = (io) => {
  // Middleware for JWT authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info({
      msg: 'User connected via socket',
      userId: socket.user.id,
      socketId: socket.id
    });

    // Register interview handlers
    interviewSocketHandlers(io, socket);

    socket.on('disconnect', () => {
      logger.info({
        msg: 'User disconnected from socket',
        userId: socket.user.id,
        socketId: socket.id
      });
    });
  });
};

module.exports = initSocketManager;
