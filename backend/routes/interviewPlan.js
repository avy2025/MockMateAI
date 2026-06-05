const express = require('express');
const router = express.Router();
const { getResumeSession, updateResumeSession } = require('../services/resumeSessionStore');
const { generateInterviewPlan } = require('../services/interviewPlan');
const { SUPPORTED_ROLES } = require('../utils/roleConfigurations');

// GET /api/interview-plan/roles
router.get('/roles', (req, res) => {
  res.json(SUPPORTED_ROLES);
});

// POST /api/interview-plan/generate
router.post('/generate', async (req, res) => {
  const { sessionId, roleId } = req.body;

  if (!sessionId || !roleId) {
    return res.status(400).json({ error: 'Session ID and Role ID are required' });
  }

  const session = getResumeSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    const plan = await generateInterviewPlan(roleId, session.insights);
    
    // Store the plan in the session for the chat logic to use
    updateResumeSession(sessionId, { interviewPlan: plan, selectedRoleId: roleId });

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Plan generation route error:', error);
    res.status(500).json({ error: 'Failed to generate interview plan' });
  }
});

module.exports = router;
