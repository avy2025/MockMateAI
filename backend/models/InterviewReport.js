const mongoose = require('mongoose');

const interviewReportSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.ObjectId,
    ref: 'InterviewSession',
    required: true,
  },
  candidateName: String,
  overallScore: Number,
  technicalAssessment: {
    score: Number,
    strengths: [String],
    weaknesses: [String],
    detailedFeedback: String,
  },
  communicationAssessment: {
    score: Number,
    fluency: String,
    clarity: String,
  },
  integritySummary: {
    integrityScore: Number,
    status: String,
    incidents: [Object],
  },
  behavioralIndicators: Object,
  careerReadiness: Object,
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InterviewReport', interviewReportSchema);
