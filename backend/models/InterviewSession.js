const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  candidateName: String,
  interviewType: {
    type: String,
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'in-progress',
  },
  resume: {
    type: mongoose.Schema.ObjectId,
    ref: 'Resume',
  },
  transcript: [
    {
      role: String,
      content: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  interviewPlan: Object,
  behaviorReport: Object,
  report: {
    type: mongoose.Schema.ObjectId,
    ref: 'InterviewReport',
  },
  recording: {
    type: mongoose.Schema.ObjectId,
    ref: 'InterviewRecording',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
});

const createModel = require('./modelFactory');

module.exports = createModel('InterviewSession', interviewSessionSchema);
