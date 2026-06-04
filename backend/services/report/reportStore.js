const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '../../data/reports');

// Ensure directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

function saveReport(report) {
  const filePath = path.join(STORAGE_DIR, `${report.sessionId}.json`);
  const data = {
    ...report,
    savedAt: new Date().toISOString()
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getReport(sessionId) {
  const filePath = path.join(STORAGE_DIR, `${sessionId}.json`);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return null;
}

function getAllReports() {
  try {
    const files = fs.readdirSync(STORAGE_DIR);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const data = fs.readFileSync(path.join(STORAGE_DIR, file), 'utf8');
        return JSON.parse(data);
      })
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  } catch (error) {
    console.error('Error reading reports:', error);
    return [];
  }
}

module.exports = {
  saveReport,
  getReport,
  getAllReports
};

