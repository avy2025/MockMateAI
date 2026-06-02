import React, { useState } from 'react';
import Home from './components/Home';
import ResumeUpload from './components/ResumeUpload';
import InterviewRoom from './components/interview-room/InterviewRoom';
import ReportDashboard from './components/ReportDashboard';
import { sendBehaviorReport, generateReport } from './services/chatApi';

function App() {
  const [screen, setScreen] = useState('home'); // 'home' | 'resume' | 'interview' | 'report'
  const [interviewType, setInterviewType] = useState(null);
  const [resumeFilename, setResumeFilename] = useState(null);
  const [resumeContext, setResumeContext] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const selectInterviewType = (type) => {
    setInterviewType(type);
    setResumeFilename(null);
    setResumeContext(null);
    setScreen('resume');
  };

  const handleResumeUploaded = (context) => {
    setResumeFilename(context.filename);
    setResumeContext(context);
    setScreen('interview');
  };

  const goHome = () => {
    setScreen('home');
    setInterviewType(null);
    setResumeFilename(null);
    setResumeContext(null);
    setFinalReport(null);
  };

  const goBackToHome = () => {
    setScreen('home');
    setInterviewType(null);
    setResumeFilename(null);
    setResumeContext(null);
  };

  /**
   * Called by InterviewRoom when the session ends.
   * Receives the behavioral report snapshot and chat history.
   * Logic:
   * 1. Send behavior report to store it (backend uses in-memory store).
   * 2. Request aggregate intelligence report from Gemini.
   * 3. Show the ReportDashboard.
   */
  const handleEndInterview = async (behaviorReport, chatHistory) => {
    setIsGeneratingReport(true);
    setScreen('report'); // Show loading state in report screen

    try {
      // 1. Fire-and-forget storing behavioral data
      if (behaviorReport && resumeContext?.sessionId) {
        sendBehaviorReport({
          sessionId: resumeContext.sessionId,
          report: behaviorReport,
        });
      }

      // 2. Generate the comprehensive AI report
      const report = await generateReport({
        sessionId: resumeContext?.sessionId,
        chatHistory,
        behaviorReport,
        interviewType
      });

      setFinalReport(report);
    } catch (error) {
      console.error('Failed to generate final report:', error);
      // Even if AI report fails, we might want to show what we have
      setFinalReport({
        error: "AI Report generation experienced a temporary issue. Please contact support.",
        candidateName: resumeContext?.insights?.personalInfo?.name || "Candidate",
        interviewDate: new Date().toISOString(),
        behavioralIndicators: behaviorReport,
        integritySummary: {
          integrityScore: behaviorReport?.integrityScore || 100,
          status: 'Review Recommended'
        }
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="App">
      {screen === 'home' && (
        <Home onStartInterview={selectInterviewType} />
      )}
      {screen === 'resume' && (
        <ResumeUpload
          interviewType={interviewType}
          onUploadSuccess={handleResumeUploaded}
          onBack={goBackToHome}
        />
      )}
      {screen === 'interview' && (
        <InterviewRoom
          interviewType={interviewType}
          resumeContext={resumeContext}
          onEndInterview={handleEndInterview}
        />
      )}
      {screen === 'report' && (
        isGeneratingReport ? (
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
              width: '50px', 
              height: '50px', 
              border: '5px solid rgba(56, 25, 50, 0.1)', 
              borderTop: '5px solid #381932', 
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <h2 style={{ fontWeight: 800 }}>Generating Intelligence Report...</h2>
            <p>Aggregating session metrics and AI assessments</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <ReportDashboard 
            report={finalReport} 
            onBack={goHome} 
          />
        )
      )}
    </div>
  );
}

export default App;
