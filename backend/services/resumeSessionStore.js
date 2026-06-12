const InterviewSession = require('../models/InterviewSession');
const Resume = require('../models/Resume');
const crypto = require('crypto');

// Map to store chunks in memory for active sessions (temporary since we don't have a vector DB yet)
const chunkCache = new Map();

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
    fileName: data.filename, // matched with caller, was data.fileName
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

  if (data.chunks) {
    chunkCache.set(sessionId, data.chunks);
  }

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
      createdAt: session.startedAt,
      chunks: chunkCache.get(session.sessionId) || [],
      interviewPlan: session.interviewPlan
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
