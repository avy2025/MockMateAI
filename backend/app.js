const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Route files
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const uploadRoutes = require('./routes/upload');
const resumeContextRoutes = require('./routes/resumeContext');
const behaviorReportRoutes = require('./routes/behaviorReport');
const reportRoutes = require('./routes/report');
const recruiterRoutes = require('./routes/recruiter');
const interviewPlanRoutes = require('./routes/interviewPlan');
const recordingsRoutes = require('./routes/recordings');
const scheduleRoutes = require('./routes/schedule');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet()); // Set security headers
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logging
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use('/api/auth', limiter);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload-resume', uploadRoutes);
app.use('/api/resume-context', resumeContextRoutes);
app.use('/api/behavior-report', behaviorReportRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/interview-plan', interviewPlanRoutes);
app.use('/api/recordings', recordingsRoutes);
app.use('/api/schedule', scheduleRoutes);


app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MockMate AI Backend' });
});

// ── Global error handler ───────────────────────────────────────────────────────
// Must have 4 params so Express treats it as an error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Unhandled Error]', err);
  }
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});

module.exports = app;
