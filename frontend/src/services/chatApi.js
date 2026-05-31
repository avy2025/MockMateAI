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
