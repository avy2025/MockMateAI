const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const swaggerUi = require('swagger-ui-express');
const rateLimit = require('express-rate-limit');

const logger = require('./utils/logger');
const swaggerSpec = require('./config/swagger');
const errorMiddleware = require('./middleware/errorMiddleware');

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

// Structured Logging
app.use(pinoHttp({ 
  logger,
  // Custom request ID generation
  genReqId: (req) => req.headers['x-request-id'] || require('crypto').randomUUID(),
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use('/api/auth', limiter);

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

// Centralized Error Handler
app.use(errorMiddleware);

module.exports = app;
