const API_BASE_URL = 'http://localhost:5000/api';

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

export const getMetrics = async () => {
  const response = await fetch(`${API_BASE_URL}/recruiter/metrics`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch metrics');
  return response.json();
};

export const getCandidates = async () => {
  const response = await fetch(`${API_BASE_URL}/recruiter/candidates`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch candidates');
  return response.json();
};

export const getCandidateDetail = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/report/${sessionId}`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch candidate details');
  return response.json();
};

export const getComparison = async (sessionIds) => {
  const ids = sessionIds.join(',');
  const response = await fetch(`${API_BASE_URL}/recruiter/compare?ids=${ids}`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch comparison data');
  return response.json();
};

export const chatWithCopilot = async (sessionIds, query, history = []) => {
  const response = await fetch(`${API_BASE_URL}/recruiter/copilot/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ sessionIds, query, history })
  });
  if (!response.ok) throw new Error('Copilot interaction failed');
  return response.json();
};

// Scheduling API
export const getSchedules = async () => {
  const response = await fetch(`${API_BASE_URL}/schedule`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch schedules');
  return response.json();
};

export const createSchedule = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/schedule`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Failed to create schedule');
  return response.json();
};

export const verifyInviteToken = async (token) => {
  const response = await fetch(`${API_BASE_URL}/schedule/invite/${token}`);
  if (!response.ok) throw new Error('Invalid or expired invitation');
  return response.json();
};

export const exportToCSV = (data, filename) => {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => `"${value}"`).join(',')
  ).join('\n');
  
  const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data, filename) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const link = document.createElement("a");
  link.setAttribute("href", jsonString);
  link.setAttribute("download", `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
