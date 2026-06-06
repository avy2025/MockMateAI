const InterviewSession = require('../models/InterviewSession');
const Resume = require('../models/Resume');
const crypto = require('crypto');

/**
 * @param {object} data
 * @param {string} userId
 * @returns {string} sessionId
 */
async function createResumeSession(data, userId) {
  const sessionId = crypto.randomUUID();
  
  // Create Resume entry first if not exists
  const resume = await Resume.create({
    user: userId,
    fileName: data.fileName,
    filePath: data.filePath,
    insights: data.insights
  });

  const session = await InterviewSession.create({
    user: userId,
    sessionId,
    candidateName: data.insights?.personalInfo?.name || 'Candidate',
    interviewType: data.interviewType || 'General',
    resume: resume._id,
    startedAt: new Date()
  });

  return sessionId;
}

/**
 * @param {string} sessionId
 * @returns {object|null}
 */
async function getResumeSession(sessionId) {
  try {
    const session = await InterviewSession.findOne({ sessionId }).populate('resume');
    if (!session) return null;

    return {
      sessionId: session.sessionId,
      insights: session.resume?.insights,
      interviewType: session.interviewType,
      candidateName: session.candidateName,
      status: session.status,
      createdAt: session.startedAt
    };
  } catch (error) {
    console.error('Error getting resume session:', error);
    return null;
  }
}

/**
 * @param {string} sessionId
 * @param {object} updates
 */
async function updateResumeSession(sessionId, updates) {
  try {
    await InterviewSession.findOneAndUpdate({ sessionId }, updates);
    return true;
  } catch (error) {
    console.error('Error updating resume session:', error);
    return false;
  }
}

module.exports = {
  createResumeSession,
  getResumeSession,
  updateResumeSession,
};
