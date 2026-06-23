const express = require('express');
const router = express.Router();
const { getAllReports, getReport } = require('../services/report/reportStore');
const copilotService = require('../services/CopilotService');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Recruiter
 *   description: Recruiter dashboard and candidate insights
 */

/**
 * @swagger
 * /api/recruiter/copilot/chat:
 *   post:
 *     summary: Chat with AI Copilot about candidates
 *     tags: [Recruiter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionIds
 *               - query
 *             properties:
 *               sessionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               query:
 *                 type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Copilot response
 */
router.post('/copilot/chat', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { sessionIds, query, history } = req.body;
    
    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return res.status(400).json({ error: 'At least one candidate ID (sessionId) is required.' });
    }

    if (!query) {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const response = await copilotService.chat({
      sessionIds,
      query,
      history: history || []
    });

    res.json({ response });
  } catch (error) {
    logger.error({ msg: 'Copilot Route Error', error, query: req.body.query });
    res.status(500).json({ error: 'AI Copilot is currently unavailable.' });
  }
});

/**
 * @swagger
 * /api/recruiter/metrics:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Recruiter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated performance metrics
 */
router.get('/metrics', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const reports = await getAllReports();
    
    const totalCandidates = new Set(reports.map(r => r.candidateName)).size;
    const completedInterviews = reports.length;
    
    let totalScore = 0;
    let readyCount = 0;
    let improvementCount = 0;
    const skillCounts = {};

    reports.forEach(report => {
      const score = report.overallScore || 0;
      totalScore += score;
      if (score >= 80) readyCount++;
      else if (score < 60) improvementCount++;
      
      // Aggregate skills if available
      const skills = report.careerReadiness?.topSkills || [];
      skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    const averagePerformanceScore = completedInterviews > 0 
      ? Math.round(totalScore / completedInterviews) 
      : 0;

    // Sort skills by count
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count: Math.round((count / completedInterviews) * 100) }));

    res.json({
      totalCandidates,
      completedInterviews,
      averagePerformanceScore,
      interviewReadyCandidates: readyCount,
      requiresImprovementCandidates: improvementCount,
      topSkills: topSkills.length > 0 ? topSkills : [
        { skill: 'React', count: 92 },
        { skill: 'Communication', count: 85 },
        { skill: 'Problem Solving', count: 78 }
      ]
    });
  } catch (error) {
    logger.error({ msg: 'Error fetching metrics', error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


/**
 * @swagger
 * /api/recruiter/candidates:
 *   get:
 *     summary: Get list of all candidates
 *     tags: [Recruiter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of candidates with summary data
 */
router.get('/candidates', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const reports = await getAllReports();
    const candidateList = reports.map(r => ({
      sessionId: r.sessionId,
      candidateName: r.candidateName,
      appliedRole: r.interviewType || 'General',
      interviewDate: r.savedAt,
      overallScore: r.overallScore,
      technicalScore: r.technicalAssessment?.score || 0,
      communicationScore: r.communicationAssessment?.score || 0,
      integrityScore: r.integritySummary?.integrityScore || 0,
      status: r.overallScore >= 80 ? 'Ready' : (r.overallScore >= 60 ? 'Pending' : 'Needs Review')
    }));
    res.json(candidateList);
  } catch (error) {
    logger.error({ msg: 'Error fetching candidates', error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/recruiter/compare:
 *   get:
 *     summary: Compare candidate reports
 *     tags: [Recruiter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ids
 *         description: Comma-separated session IDs
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data for comparison
 */
router.get('/compare', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ error: 'Candidate IDs (sessionIds) are required.' });
    }

    const sessionIds = ids.split(',');
    const comparisonData = await Promise.all(
      sessionIds.map(id => getReport(id))
    );
    
    res.json(comparisonData.filter(Boolean));
  } catch (error) {
    logger.error({ msg: 'Error fetching comparison data', error, ids: req.query.ids });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
