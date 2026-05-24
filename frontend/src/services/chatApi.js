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
