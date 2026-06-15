const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  fileUrl: String,
  storageKey: String,
  fileType: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  insights: {
    personalInfo: Object,
    skills: [String],
    experience: [Object],
    education: [Object],
    summary: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resume', resumeSchema);
