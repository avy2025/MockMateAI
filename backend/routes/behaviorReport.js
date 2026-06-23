const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');
const InterviewSession = require('../models/InterviewSession');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Behavioral and performance reports
 */

/**
 * @swagger
 * /api/behavior-report:
 *   post:
 *     summary: Store a behavioral report for a session
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - report
 *             properties:
 *               sessionId:
 *                 type: string
 *               report:
 *                 type: object
 *                 properties:
 *                   eyeContactScore:
 *                     type: number
 *                   attentionStatus:
 *                     type: string
 *     responses:
 *       200:
 *         description: Report stored successfully
 *       400:
 *         description: Invalid payload
 */
router.post('/', protect, async (req, res) => {
  try {
    const { sessionId, report } = req.body;

    if (!report || typeof report !== 'object') {
      return res.status(400).json({ error: 'Invalid report payload.' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required for persistence.' });
    }

    await InterviewSession.findOneAndUpdate(
      { sessionId },
      { 
        behaviorReport: {
          ...report,
          receivedAt: new Date()
        }
      }
    );

    logger.info({
      msg: `Stored behavior report for session ${sessionId}`,
      sessionId,
      eyeContactScore: report.eyeContactScore,
      integrityScore: report.integrityScore,
      eventsCount: report.sessionLog?.length
    });

    return res.json({ ok: true, sessionId });
  } catch (err) {
    logger.error({ msg: 'Error storing behavior report', error: err, sessionId: req.body.sessionId });
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /api/behavior-report/{sessionId}:
 *   get:
 *     summary: Get a behavioral report by session ID
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Behavior report data
 *       404:
 *         description: Report not found
 */
router.get('/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const session = await InterviewSession.findOne({ sessionId });
    if (!session || !session.behaviorReport) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    return res.json(session.behaviorReport);
  } catch (error) {
    logger.error({ msg: 'Error fetching behavior report', error, sessionId });
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
