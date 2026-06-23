const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateInterviewResponse } = require('../services/interviewService');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Generate an AI response for the interview chat
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - sessionId
 *             properties:
 *               message:
 *                 type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *               interviewType:
 *                 type: string
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI response generated
 */
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
    logger.error({ msg: 'Chat Error', error, sessionId: req.body.sessionId });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
