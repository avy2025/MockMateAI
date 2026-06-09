const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  candidateEmail: {
    type: String,
    required: true,
  },
  candidateName: String,
  scheduledDate: {
    type: Date,
    required: true,
  },
  interviewType: String,
  inviteToken: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'expired'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Schedule', scheduleSchema);
