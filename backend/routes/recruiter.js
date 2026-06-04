const express = require('express');
const router = express.Router();
const { getAllReports, getReport } = require('../services/report/reportStore');

/**
 * GET /api/recruiter/metrics
 * Returns aggregated statistics for the dashboard.
 */
router.get('/metrics', (req, res) => {
  try {
    const reports = getAllReports();
    
    const totalCandidates = new Set(reports.map(r => r.candidateName)).size;
    const completedInterviews = reports.length;
    
    let totalScore = 0;
    let readyCount = 0;
    let improvementCount = 0;

    reports.forEach(report => {
      const score = report.overallScore || 0;
      totalScore += score;
      if (score >= 80) readyCount++;
      else if (score < 60) improvementCount++;
    });

    const averagePerformanceScore = completedInterviews > 0 
      ? Math.round(totalScore / completedInterviews) 
      : 0;

    res.json({
      totalCandidates,
      completedInterviews,
      averagePerformanceScore,
      interviewReadyCandidates: readyCount,
      requiresImprovementCandidates: improvementCount
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/recruiter/candidates
 * Returns a list of all candidates with summary data.
 */
router.get('/candidates', (req, res) => {
  try {
    const reports = getAllReports();
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
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/recruiter/compare
 * Returns detailed reports for multiple candidates based on sessionId.
 */
router.get('/compare', (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ error: 'Candidate IDs (sessionIds) are required.' });
    }

    const sessionIds = ids.split(',');
    const comparisonData = sessionIds.map(id => getReport(id)).filter(Boolean);

    res.json(comparisonData);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
