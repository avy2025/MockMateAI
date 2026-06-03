const express = require('express');
const router = express.Router();
const { getResumeSession } = require('../services/resumeSessionStore');
const ReportGenerator = require('../services/report/ReportGenerator');
const { saveReport, getReport } = require('../services/report/reportStore');

const apiKey = process.env.GEMINI_API_KEY;
const generator = new ReportGenerator(apiKey);

/**
 * POST /api/report/generate
 * Generates a report and saves it.
 */
router.post('/generate', async (req, res) => {
  try {
    const { sessionId, chatHistory, behaviorReport, interviewType } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }

    const session = getResumeSession(sessionId);
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

    saveReport(finalReport);

    res.json(finalReport);
  } catch (error) {
    console.error('Report Generation Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/report/:sessionId
 * Retrieves a previously generated report.
 */
router.get('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const report = getReport(sessionId);

  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  res.json(report);
});

module.exports = router;

