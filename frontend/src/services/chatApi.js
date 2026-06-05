const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Send a message in the interview chat.
 * @param {{ message: string, history: object[], interviewType: string, sessionId?: string }} payload
 */
export async function sendChatMessage(payload) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Chat request failed');
  }

  return res.json();
}

/**
 * Post the behavioral session report to the backend (fire-and-forget).
 * Never throws — failure is silent so it never blocks the interview end flow.
 * @param {{ sessionId?: string, report: object }} payload
 */
export async function sendBehaviorReport(payload) {
  try {
    await fetch(`${API_BASE}/api/behavior-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silently ignore — behavioral data is supplementary
  }
}

/**
 * Request the final aggregate intelligence report from the backend.
 * @param {{ sessionId: string, chatHistory: object[], behaviorReport: object, interviewType: string }} payload
 */
export async function generateReport(payload) {
  const res = await fetch(`${API_BASE}/api/report/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Report generation failed');
  }

  return res.json();
}

/**
 * Fetch a previously generated report by session ID.
 * @param {string} sessionId 
 */
export async function getReport(sessionId) {
  const res = await fetch(`${API_BASE}/api/report/${sessionId}`);
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
 * Generate an interview plan for a specific role and session.
 */
export async function generateInterviewPlan(payload) {
  const res = await fetch(`${API_BASE}/api/interview-plan/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to generate interview plan');
  return res.json();
}
