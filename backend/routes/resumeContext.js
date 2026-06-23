const express = require('express');
const { getResumeSession } = require('../services/resumeSessionStore');
const { stripEmbeddingsFromChunks } = require('../services/resumeEmbeddings');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /api/resume-context/{sessionId}:
 *   get:
 *     summary: Retrieve processed resume context for a session
 *     tags: [Resume Uploads]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resume context data
 *       404:
 *         description: Session not found
 */
router.get('/:sessionId', async (req, res) => {
  try {
    const session = await getResumeSession(req.params.sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Resume session expired or not found. Please upload again.',
      });
    }

    res.json({
      success: true,
      sessionId: req.params.sessionId,
      filename: session.filename,
      chunks: session.chunks ? stripEmbeddingsFromChunks(session.chunks) : [],
      insights: session.insights,
      extractedText: session.extractedText,
    });
  } catch (error) {
    logger.error({ msg: 'Error fetching resume context', error, sessionId: req.params.sessionId });
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
