/**
 * @typedef {{ type: string, content: string }} ResumeChunk
 */

/**
 * @typedef {object} ResumeInsights
 * @property {string[]} topSkills
 * @property {string|null} strongestProject
 * @property {string[]} focusAreas
 * @property {string} [source]
 */

/**
 * @typedef {object} ResumeUploadResponse
 * @property {boolean} success
 * @property {string} [filename]
 * @property {string} [extractedText]
 * @property {string} [sessionId]
 * @property {ResumeChunk[]} [chunks]
 * @property {ResumeInsights} [insights]
 * @property {string} [message]
 */

/**
 * @typedef {object} ResumeContext
 * @property {string} sessionId
 * @property {string} filename
 * @property {string} extractedText
 * @property {ResumeChunk[]} chunks
 * @property {ResumeInsights} insights
 */

export {};
