const API_BASE_URL = 'http://localhost:5000/api/recruiter';

export const getMetrics = async () => {
  const response = await fetch(`${API_BASE_URL}/metrics`);
  if (!response.ok) throw new Error('Failed to fetch metrics');
  return response.json();
};

export const getCandidates = async () => {
  const response = await fetch(`${API_BASE_URL}/candidates`);
  if (!response.ok) throw new Error('Failed to fetch candidates');
  return response.json();
};

export const getCandidateDetail = async (sessionId) => {
  const response = await fetch(`http://localhost:5000/api/report/${sessionId}`);
  if (!response.ok) throw new Error('Failed to fetch candidate details');
  return response.json();
};

export const getComparison = async (sessionIds) => {
  const ids = sessionIds.join(',');
  const response = await fetch(`${API_BASE_URL}/compare?ids=${ids}`);
  if (!response.ok) throw new Error('Failed to fetch comparison data');
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
