const dotenv = require('dotenv');

// Load env vars FIRST — before any other require reads process.env
dotenv.config();

// ── Startup guards ────────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  logger.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
  process.exit(1);
}

const logger = require('./utils/logger');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const app = require('./app');
const initSocketManager = require('./socket/socketManager');

// Connect to database
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST']
  }
});

// Initialize Socket Manager
initSocketManager(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
