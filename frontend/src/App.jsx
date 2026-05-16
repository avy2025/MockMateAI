import React, { useState } from 'react';
import Home from './components/Home';
import Chat from './components/Chat';

function App() {
  const [screen, setScreen] = useState('home'); // 'home' or 'chat'
  const [interviewType, setInterviewType] = useState(null);

  const startInterview = (type) => {
    setInterviewType(type);
    setScreen('chat');
  };

  const goHome = () => {
    setScreen('home');
    setInterviewType(null);
  };

  return (
    <div className="App">
      {screen === 'home' ? (
        <Home onStartInterview={startInterview} />
      ) : (
        <Chat interviewType={interviewType} onBack={goHome} />
      )}
    </div>
  );
}

export default App;
