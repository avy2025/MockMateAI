const jwt = require('jsonwebtoken');
const interviewSocketHandlers = require('./interviewSocket');

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
    console.log(`User connected: ${socket.user.id} (Socket: ${socket.id})`);

    // Register interview handlers
    interviewSocketHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
};

module.exports = initSocketManager;
