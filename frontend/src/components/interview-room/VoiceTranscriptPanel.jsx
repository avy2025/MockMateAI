import React from 'react';

function VoiceTranscriptPanel({
  isListening,
  isSpeaking,
  isProcessing,
  displayTranscript,
  currentQuestion,
  error,
  isSupported,
}) {
  const getStatusLabel = () => {
    if (!isSupported) return 'Voice unavailable';
    if (isSpeaking) return 'AI speaking…';
    if (isProcessing) return 'Processing answer…';
    if (isListening) return 'Listening…';
    return 'Ready to listen';
  };

  const getStatusClass = () => {
    if (!isSupported) return 'voice-status--error';
    if (isSpeaking) return 'voice-status--speaking';
    if (isProcessing) return 'voice-status--processing';
    if (isListening) return 'voice-status--listening';
    return 'voice-status--idle';
  };

  return (
    <aside className="voice-panel" aria-label="Voice conversation">
      <div className="voice-panel__header">
        <div className={`voice-status ${getStatusClass()}`}>
          <span className="voice-status__dot" aria-hidden="true" />
          <span className="voice-status__label">{getStatusLabel()}</span>
        </div>

        {isListening && (
          <div className="voice-listening-indicator" aria-hidden="true">
            <span className="voice-listening-indicator__bar" />
            <span className="voice-listening-indicator__bar" />
            <span className="voice-listening-indicator__bar" />
            <span className="voice-listening-indicator__bar" />
            <span className="voice-listening-indicator__bar" />
          </div>
        )}
      </div>

      {currentQuestion && (
        <div className="voice-panel__question">
          <span className="voice-panel__question-label">Current question</span>
          <p className="voice-panel__question-text">{currentQuestion}</p>
        </div>
      )}

      <div className="voice-panel__transcript">
        <span className="voice-panel__transcript-label">Your response</span>
        <div
          className={`voice-panel__transcript-box ${isListening ? 'voice-panel__transcript-box--live' : ''}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {displayTranscript ? (
            <p className="voice-panel__transcript-text">{displayTranscript}</p>
          ) : (
            <p className="voice-panel__transcript-placeholder">
              {isListening
                ? 'Speak your answer — pauses are detected automatically'
                : 'Click the mic button to start speaking'}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="voice-panel__error" role="alert">
          {error}
        </div>
      )}
    </aside>
  );
}

export default VoiceTranscriptPanel;
