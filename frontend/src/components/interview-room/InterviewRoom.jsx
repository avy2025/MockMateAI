import React from 'react';
import { useWebcam } from '../../hooks/useWebcam';
import InterviewHeader from './InterviewHeader';
import AIInterviewerPanel from './AIInterviewerPanel';
import CandidatePanel from './CandidatePanel';
import ControlBar from './ControlBar';
import '../../styles/interview-room.css';

function InterviewRoom({ interviewType, onEndInterview }) {
  const {
    videoRef,
    status,
    error,
    cameraOn,
    micOn,
    toggleCamera,
    toggleMic,
    startStream,
    endSession,
  } = useWebcam({ autoStart: true });

  const handleEndInterview = () => {
    endSession();
    onEndInterview();
  };

  return (
    <div className="interview-room">
      <InterviewHeader interviewType={interviewType} />

      <main className="interview-room__stage">
        <AIInterviewerPanel isActive />
        <CandidatePanel
          videoRef={videoRef}
          cameraOn={cameraOn}
          status={status}
          error={error}
          onRetry={startStream}
        />
      </main>

      <ControlBar
        micOn={micOn}
        cameraOn={cameraOn}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onEndInterview={handleEndInterview}
      />
    </div>
  );
}

export default InterviewRoom;
