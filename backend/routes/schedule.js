const express = require('express');
const crypto = require('crypto');
const Schedule = require('../models/Schedule');
const { protect, authorize } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

/**
 * @desc    Get all schedules for recruiter
 * @route   GET /api/schedule
 * @access  Private/Recruiter
 */
router.get('/', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const schedules = await Schedule.find({ recruiter: req.user.id }).sort('-scheduledDate');
    res.json({ success: true, count: schedules.length, data: schedules });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

/**
 * @desc    Create a new schedule & invite
 * @route   POST /api/schedule
 * @access  Private/Recruiter
 */
router.post('/', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { candidateEmail, candidateName, scheduledDate, interviewType } = req.body;

    const inviteToken = crypto.randomBytes(20).toString('hex');

    const schedule = await Schedule.create({
      recruiter: req.user.id,
      candidateEmail,
      candidateName,
      scheduledDate,
      interviewType: interviewType || 'General',
      inviteToken
    });

    // Send email (Mock service or Nodemailer if configured)
    await sendInviteEmail(schedule);

    res.status(201).json({ success: true, data: schedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

/**
 * @desc    Verify invite token
 * @route   GET /api/schedule/invite/:token
 * @access  Public
 */
router.get('/invite/:token', async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ inviteToken: req.params.token }).populate('recruiter', 'name');

    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Invalid or expired invitation link' });
    }

    res.json({ success: true, data: schedule });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

async function sendInviteEmail(schedule) {
  // Logic for nodemailer
  // Since I don't have SMTP credentials, I'll log the link for now
  const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${schedule.inviteToken}`;
  console.log(`[EMAIL] To: ${schedule.candidateEmail}`);
  console.log(`[EMAIL] Subject: Mock Interview Invitation`);
  console.log(`[EMAIL] Content: You have been invited to a mock interview on ${schedule.scheduledDate}. Link: ${inviteUrl}`);
  
  // Real implementation would use nodemailer.createTransport
}

module.exports = router;
