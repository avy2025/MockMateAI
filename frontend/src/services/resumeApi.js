const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

import axios from 'axios';

/**
 * Helper to get headers with Auth token.
 */
function getHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...extra
  };
}

/**
 * Upload a resume file to the server.
 * @param {File} file - PDF or DOCX resume
 * @param {Function} onProgress - Callback for upload percentage
 * @returns {Promise<import('../types/resume').ResumeUploadResponse>}
 */
export async function uploadResume(file, onProgress) {
  const formData = new FormData();
  formData.append('resume', file);

  try {
    const res = await axios.post(`${API_BASE}/api/upload-resume`, formData, {
      headers: getHeaders({ 'Content-Type': 'multipart/form-data' }),
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percentCompleted);
      }
    });
    return res.data;
  } catch (err) {
    if (err.response && err.response.data) {
      return err.response.data; // Return the backend error structure {success: false, message: ...}
    }
    throw err;
  }
}

/**
 * Fetch stored resume context by session id.
 * @param {string} sessionId
 */
export async function getResumeContext(sessionId) {
  const res = await fetch(`${API_BASE}/api/resume-context/${sessionId}`);
  return res.json();
}
