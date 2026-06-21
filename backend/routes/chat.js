const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateInterviewResponse } = require('../services/interviewService');

router.post('/', protect, async (req, res) => {
  try {
    const { message, history, interviewType, sessionId } = req.body;
    
    const result = await generateInterviewResponse({
      message,
      history,
      interviewType,
      sessionId
    });

    res.json(result);
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
