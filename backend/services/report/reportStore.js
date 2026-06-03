const reports = new Map();

function saveReport(report) {
  reports.set(report.sessionId, {
    ...report,
    savedAt: new Date().toISOString()
  });
}

function getReport(sessionId) {
  return reports.get(sessionId) || null;
}

module.exports = {
  saveReport,
  getReport
};
