const crypto = require('crypto');

const SESSION_TTL_MS = 60 * 60 * 1000;
const sessions = new Map();

function pruneExpired() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}

/**
 * @param {object} data
 * @returns {string} sessionId
 */
function createResumeSession(data) {
  pruneExpired();
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, {
    ...data,
    createdAt: Date.now(),
  });
  return sessionId;
}

/**
 * @param {string} sessionId
 * @returns {object|null}
 */
function getResumeSession(sessionId) {
  pruneExpired();
  const session = sessions.get(sessionId);
  if (!session) return null;

  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

module.exports = {
  createResumeSession,
  getResumeSession,
};
