const express = require('express');
const router = express.Router();

/**
 * In-memory behavioral report store.
 * Keys: sessionId  →  value: report object
 *
 * Lightweight — no DB required. Data lives for the process lifetime.
 * Replace with a DB write here when persistence is needed.
 */
const reportStore = new Map();

/**
 * POST /api/behavior-report
 * Body: { sessionId, report: { eyeContactScore, attentionStatus, ... , sessionLog } }
 *
 * Stores the behavioral session report and returns an acknowledgement.
 */
router.post('/', (req, res) => {
  try {
    const { sessionId, report } = req.body;

    if (!report || typeof report !== 'object') {
      return res.status(400).json({ error: 'Invalid report payload.' });
    }

    const key = sessionId || `anon_${Date.now()}`;
    const stored = {
      ...report,
      receivedAt: new Date().toISOString(),
      sessionId: key,
    };

    reportStore.set(key, stored);

    console.log(
      `[BehaviorReport] Stored report for session "${key}" — ` +
      `eyeContactScore=${stored.eyeContactScore}, integrityScore=${stored.integrityScore ?? 'N/A'}, events=${stored.sessionLog?.length ?? 0}`
    );

    return res.json({ ok: true, sessionId: key });
  } catch (err) {
    console.error('[BehaviorReport] Error storing report:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * GET /api/behavior-report/:sessionId
 * Returns the stored report for a session (future use: summary screen).
 */
router.get('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const report = reportStore.get(sessionId);

  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  return res.json(report);
});

module.exports = router;
