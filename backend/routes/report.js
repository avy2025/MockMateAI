const express = require('express');
const router = express.Router();
const { getResumeSession } = require('../services/resumeSessionStore');
const ReportGenerator = require('../services/report/ReportGenerator');
const { saveReport, getReport } = require('../services/report/reportStore');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

const apiKey = process.env.GEMINI_API_KEY;
const generator = new ReportGenerator(apiKey);

/**
 * @swagger
 * /api/report/generate:
 *   post:
 *     summary: Generate a final assessment report
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
 *             properties:
 *               sessionId:
 *                 type: string
 *               chatHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *               behaviorReport:
 *                 type: object
 *               interviewType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report generated successfully
 *       400:
 *         description: Session ID missing
 *       500:
 *         description: Generation failed
 */
router.post('/generate', protect, async (req, res) => {
  try {
    const { sessionId, chatHistory, behaviorReport, interviewType } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }

    const session = await getResumeSession(sessionId);
    const resumeInsights = session?.insights || {};
    const candidateName = resumeInsights.personalInfo?.name || 'Candidate';

    const finalReport = await generator.generate({
      sessionId,
      chatHistory,
      behaviorReport,
      interviewType,
      resumeInsights,
      candidateName
    });

    await saveReport(finalReport);

    res.json(finalReport);
  } catch (error) {
    logger.error({ msg: 'Report Generation Error', error, sessionId: req.body.sessionId });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/report/{sessionId}:
 *   get:
 *     summary: Retrieve a previously generated report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report data retrieved
 *       404:
 *         description: Report not found
 */
router.get('/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const report = await getReport(sessionId);

  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  res.json(report);
});

module.exports = router;

