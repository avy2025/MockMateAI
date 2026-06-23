const express = require('express');
const router = express.Router();
const { getResumeSession, updateResumeSession } = require('../services/resumeSessionStore');
const { generateInterviewPlan } = require('../services/interviewPlan');
const { SUPPORTED_ROLES } = require('../utils/roleConfigurations');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Interviews
 *   description: Interview preparation and execution
 */

/**
 * @swagger
 * /api/interview-plan/roles:
 *   get:
 *     summary: Get list of supported interview roles
 *     tags: [Interviews]
 *     responses:
 *       200:
 *         description: List of supported roles
 */
router.get('/roles', (req, res) => {
  res.json(SUPPORTED_ROLES);
});

/**
 * @swagger
 * /api/interview-plan/generate:
 *   post:
 *     summary: Generate an interview plan based on role and resume insights
 *     tags: [Interviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - roleId
 *             properties:
 *               sessionId:
 *                 type: string
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Interview plan generated successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Session not found
 */
router.post('/generate', async (req, res) => {
  const { sessionId, roleId } = req.body;

  if (!sessionId || !roleId) {
    return res.status(400).json({ error: 'Session ID and Role ID are required' });
  }

  const session = await getResumeSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    const plan = await generateInterviewPlan(roleId, session.insights);
    
    // Store the plan in the session for the chat logic to use
    await updateResumeSession(sessionId, { interviewPlan: plan, selectedRoleId: roleId });

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    logger.error({ msg: 'Plan generation route error', error, sessionId, roleId });
    res.status(500).json({ error: 'Failed to generate interview plan' });
  }
});

module.exports = router;
