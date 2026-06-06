const express = require('express');
const router = express.Router();

/**
 * In-memory behavioral report store.
 * Keys: sessionId  →  value: report object
 *
 * Lightweight — no DB required. Data lives for the process lifetime.
 * Replace with a DB write here when persistence is needed.
 */
const InterviewSession = require('../models/InterviewSession');

/**
 * POST /api/behavior-report
 * Body: { sessionId, report: { eyeContactScore, attentionStatus, ... , sessionLog } }
 */
router.post('/', async (req, res) => {
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

    console.log(
      `[BehaviorReport] Stored report for session "${sessionId}" — ` +
      `eyeContactScore=${report.eyeContactScore}, integrityScore=${report.integrityScore ?? 'N/A'}, events=${report.sessionLog?.length ?? 0}`
    );

    return res.json({ ok: true, sessionId });
  } catch (err) {
    console.error('[BehaviorReport] Error storing report:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * GET /api/behavior-report/:sessionId
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
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


module.exports = router;
