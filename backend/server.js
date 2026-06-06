const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

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



// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

