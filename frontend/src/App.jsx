import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Home from './components/Home';
import ResumeUpload from './components/ResumeUpload';
import InterviewRoom from './components/interview-room/InterviewRoom';
import ReportDashboard from './components/ReportDashboard';
import { sendBehaviorReport, generateReport } from './services/chatApi';

function MainApp() {
  const navigate = useNavigate();
  const [interviewType, setInterviewType] = useState(null);
  const [resumeContext, setResumeContext] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const selectInterviewType = (type) => {
    setInterviewType(type);
    setResumeContext(null);
    navigate('/resume');
  };

  const handleResumeUploaded = (context) => {
    setResumeContext(context);
    navigate('/interview');
  };

  const goHome = () => {
    setInterviewType(null);
    setResumeContext(null);
    setFinalReport(null);
    navigate('/');
  };

  const handleEndInterview = async (behaviorReport, chatHistory) => {
    setIsGeneratingReport(true);
    navigate(`/report/loading`);

    try {
      if (behaviorReport && resumeContext?.sessionId) {
        sendBehaviorReport({
          sessionId: resumeContext.sessionId,
          report: behaviorReport,
        });
      }

      const report = await generateReport({
        sessionId: resumeContext?.sessionId,
        chatHistory,
        behaviorReport,
        interviewType
      });

      setFinalReport(report);
      navigate(`/report/${resumeContext.sessionId}`);
    } catch (error) {
      console.error('Failed to generate final report:', error);
      const fallbackReport = {
        error: "AI Report generation experienced a temporary issue.",
        candidateName: resumeContext?.insights?.personalInfo?.name || "Candidate",
        interviewDate: new Date().toISOString(),
        behavioralIndicators: behaviorReport,
        integritySummary: {
          integrityScore: behaviorReport?.integrityScore || 100,
          status: 'Review Recommended'
        }
      };
      setFinalReport(fallbackReport);
      navigate(`/report/error`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Home onStartInterview={selectInterviewType} />} />
      <Route path="/resume" element={
        <ResumeUpload
          interviewType={interviewType}
          onUploadSuccess={handleResumeUploaded}
          onBack={() => navigate('/')}
        />
      } />
      <Route path="/interview" element={
        <InterviewRoom
          interviewType={interviewType}
          resumeContext={resumeContext}
          onEndInterview={handleEndInterview}
        />
      } />
      <Route path="/report/loading" element={<LoadingScreen />} />
      <Route path="/report/:sessionId" element={<ReportDashboard report={finalReport} onBack={goHome} />} />
    </Routes>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen" style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#FFF3E6',
      color: '#381932',
      gap: '20px'
    }}>
      <div className="spinner" style={{ 
        width: '60px', 
        height: '60px', 
        border: '6px solid rgba(56, 25, 50, 0.1)', 
        borderTop: '6px solid #381932', 
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <h2 style={{ fontWeight: 800, fontSize: '2rem' }}>Generating Intelligence Report...</h2>
      <p style={{ opacity: 0.8 }}>Aggregating session metrics and AI assessments</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <MainApp />
      </div>
    </Router>
  );
}

export default App;
