import React, { useState } from 'react';
import Home from './components/Home';
import ResumeUpload from './components/ResumeUpload';
import InterviewRoom from './components/interview-room/InterviewRoom';
import { sendBehaviorReport } from './services/chatApi';

function App() {
  const [screen, setScreen] = useState('home'); // 'home' | 'resume' | 'interview'
  const [interviewType, setInterviewType] = useState(null);
  const [resumeFilename, setResumeFilename] = useState(null);
  const [resumeContext, setResumeContext] = useState(null);

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
  };

  const goBackToHome = () => {
    setScreen('home');
    setInterviewType(null);
    setResumeFilename(null);
    setResumeContext(null);
  };

  /**
   * Called by InterviewRoom when the session ends.
   * Receives the behavioral report snapshot and forwards it to the backend.
   * Navigation to home happens regardless of report success.
   */
  const handleEndInterview = (behaviorReport) => {
    if (behaviorReport && resumeContext?.sessionId) {
      sendBehaviorReport({
        sessionId: resumeContext.sessionId,
        report: behaviorReport,
      });
    }
    goHome();
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
    </div>
  );
}

export default App;
