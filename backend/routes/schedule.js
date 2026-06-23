const express = require('express');
const crypto = require('crypto');
const Schedule = require('../models/Schedule');
const { protect, authorize } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Scheduling
 *   description: Interview scheduling and invitations
 */

/**
 * @swagger
 * /api/schedule:
 *   get:
 *     summary: Get all schedules for recruiter
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of schedules
 */
router.get('/', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const schedules = await Schedule.find({ recruiter: req.user.id }).sort('-scheduledDate');
    res.json({ success: true, count: schedules.length, data: schedules });
  } catch (err) {
    logger.error({ msg: 'Error fetching schedules', error: err, userId: req.user.id });
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

/**
 * @swagger
 * /api/schedule:
 *   post:
 *     summary: Create a new interview schedule and send invitation
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidateEmail
 *               - scheduledDate
 *             properties:
 *               candidateEmail:
 *                 type: string
 *               candidateName:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               interviewType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Schedule created successfully
 */
router.post('/', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { candidateEmail, candidateName, scheduledDate, interviewType } = req.body;

    if (!candidateEmail || !scheduledDate) {
      return res.status(400).json({ success: false, error: 'candidateEmail and scheduledDate are required' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(candidateEmail)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email' });
    }

    const dateObj = new Date(scheduledDate);
    if (isNaN(dateObj.getTime()) || dateObj < new Date()) {
      return res.status(400).json({ success: false, error: 'scheduledDate must be a valid future date' });
    }

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

    logger.info({
      msg: 'Interview scheduled',
      scheduleId: schedule._id,
      candidateEmail: schedule.candidateEmail,
      recruiterId: req.user.id
    });

    res.status(201).json({ success: true, data: schedule });
  } catch (err) {
    logger.error({ msg: 'Error creating schedule', error: err, body: req.body });
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

/**
 * @swagger
 * /api/schedule/invite/{token}:
 *   get:
 *     summary: Verify an interview invitation token
 *     tags: [Scheduling]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invite verified
 *       404:
 *         description: Invalid token
 */
router.get('/invite/:token', async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ inviteToken: req.params.token }).populate('recruiter', 'name');

    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Invalid or expired invitation link' });
    }

    res.json({ success: true, data: schedule });
  } catch (err) {
    logger.error({ msg: 'Error verifying invite token', error: err, token: req.params.token });
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

async function sendInviteEmail(schedule) {
  const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${schedule.inviteToken}`;
  logger.info({
    msg: 'Sending interview invitation email (MOCK)',
    to: schedule.candidateEmail,
    inviteUrl
  });
}

module.exports = router;
