const mongoose = require('mongoose');
const createModel = require('./modelFactory');

const interviewRecordingSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.ObjectId,
    ref: 'InterviewSession',
    required: true,
  },
  fileUrl: String,
  storageKey: String,
  fileType: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  fileSize: Number,
  duration: Number,
  mimeType: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = createModel('InterviewRecording', interviewRecordingSchema);

