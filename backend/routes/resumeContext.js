const express = require('express');
const { getResumeSession } = require('../services/resumeSessionStore');
const { stripEmbeddingsFromChunks } = require('../services/resumeEmbeddings');

const router = express.Router();

// GET /api/resume-context/:sessionId
router.get('/:sessionId', async (req, res) => {
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
});


module.exports = router;
