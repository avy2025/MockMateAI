const InterviewReport = require('../../models/InterviewReport');
const InterviewSession = require('../../models/InterviewSession');

async function saveReport(reportData) {
  try {
    const session = await InterviewSession.findOne({ sessionId: reportData.sessionId });
    
    const report = await InterviewReport.findOneAndUpdate(
      { session: session ? session._id : null, candidateName: reportData.candidateName },
      {
        ...reportData,
        session: session ? session._id : null,
        savedAt: new Date()
      },
      { upsert: true, new: true }
    );

    if (session) {
      session.report = report._id;
      session.status = 'completed';
      session.completedAt = new Date();
      await session.save();
    }

    return report;
  } catch (error) {
    console.error('Error saving report to DB:', error);
    throw error;
  }
}

async function getReport(sessionId) {
  try {
    const session = await InterviewSession.findOne({ sessionId }).populate('report');
    return session ? session.report : await InterviewReport.findOne({ sessionId }); // Fallback for old data if needed
  } catch (error) {
    console.error('Error fetching report:', error);
    return null;
  }
}

async function getAllReports() {
  try {
    return await InterviewReport.find().sort({ savedAt: -1 });
  } catch (error) {
    console.error('Error fetching all reports:', error);
    return [];
  }
}

module.exports = {
  saveReport,
  getReport,
  getAllReports
};
