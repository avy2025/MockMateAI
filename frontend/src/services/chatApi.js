const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Helper to get headers with Auth token.
 */
function getHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...extra
  };
}

/**
 * Send a message in the interview chat.
 */
export async function sendChatMessage(payload) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Chat request failed');
  }

  return res.json();
}

/**
 * Post the behavioral session report to the backend.
 */
export async function sendBehaviorReport(payload) {
  try {
    await fetch(`${API_BASE}/api/behavior-report`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
  } catch {
    // Silent fail
  }
}

/**
 * Request the final aggregate intelligence report.
 */
export async function generateReport(payload) {
  const res = await fetch(`${API_BASE}/api/report/generate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Report generation failed');
  }

  return res.json();
}

/**
 * Fetch a previously generated report.
 */
export async function getReport(sessionId) {
  const res = await fetch(`${API_BASE}/api/report/${sessionId}`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    throw new Error('Failed to fetch report');
  }
  return res.json();
}

/**
 * Fetch supported roles.
 */
export async function getRoles() {
  const res = await fetch(`${API_BASE}/api/interview-plan/roles`);
  if (!res.ok) throw new Error('Failed to fetch roles');
  return res.json();
}

/**
 * Generate an interview plan.
 */
export async function generateInterviewPlan(payload) {
  const res = await fetch(`${API_BASE}/api/interview-plan/generate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to generate interview plan');
  return res.json();
}

/**
 * Upload interview recording.
 */
export async function uploadRecording(sessionId, blob) {
  const formData = new FormData();
  formData.append('recording', blob, `recording-${sessionId}.webm`);

  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/recordings/upload/${sessionId}`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Recording upload failed');
  }

  return res.json();
}

/**
 * Register User
 */
export async function register(payload) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Registration failed');
  }
  return res.json();
}

/**
 * Login User
 */
export async function login(payload) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }
  return res.json();
}
