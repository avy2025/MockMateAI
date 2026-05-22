const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Upload a resume file to the server.
 * @param {File} file - PDF or DOCX resume
 * @returns {Promise<{ success: boolean, filename?: string, message?: string }>}
 */
export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);

  const res = await fetch(`${API_BASE}/api/upload-resume`, {
    method: 'POST',
    body: formData,
  });

  return res.json();
}
