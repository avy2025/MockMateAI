const mongoose = require('mongoose');

const interviewRecordingSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.ObjectId,
    ref: 'InterviewSession',
    required: true,
  },
  fileName: String,
  filePath: String,
  fileSize: Number,
  duration: Number,
  mimeType: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InterviewRecording', interviewRecordingSchema);
