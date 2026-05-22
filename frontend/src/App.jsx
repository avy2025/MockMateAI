import React, { useState } from 'react';
import Home from './components/Home';
import ResumeUpload from './components/ResumeUpload';
import Chat from './components/Chat';

function App() {
  const [screen, setScreen] = useState('home'); // 'home' | 'resume' | 'chat'
  const [interviewType, setInterviewType] = useState(null);
  const [resumeFilename, setResumeFilename] = useState(null);

  const selectInterviewType = (type) => {
    setInterviewType(type);
    setResumeFilename(null);
    setScreen('resume');
  };

  const handleResumeUploaded = (filename) => {
    setResumeFilename(filename);
    setScreen('chat');
  };

  const goHome = () => {
    setScreen('home');
    setInterviewType(null);
    setResumeFilename(null);
  };

  const goBackToHome = () => {
    setScreen('home');
    setInterviewType(null);
    setResumeFilename(null);
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
      {screen === 'chat' && (
        <Chat
          interviewType={interviewType}
          resumeFilename={resumeFilename}
          onBack={goHome}
        />
      )}
    </div>
  );
}

export default App;
