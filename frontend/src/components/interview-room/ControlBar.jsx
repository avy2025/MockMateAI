import React from 'react';

function ControlBar({
  isListening,
  cameraOn,
  onToggleVoice,
  onToggleCamera,
  onEndInterview,
  voiceDisabled = false,
}) {
  return (
    <footer className="control-bar" role="toolbar" aria-label="Interview controls">
      <div style={{ display: 'flex', gap: '20px' }}>
        <button
          type="button"
          className={`control-bar__btn ${isListening ? 'control-bar__btn--listening' : ''}`}
          onClick={onToggleVoice}
          disabled={voiceDisabled && !isListening}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? '🎤' : '🎙️'}
        </button>

        <button
          type="button"
          className="control-bar__btn"
          onClick={onToggleCamera}
          style={{ opacity: cameraOn ? 1 : 0.5 }}
          aria-label={cameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {cameraOn ? '🎥' : '📵'}
        </button>
      </div>

      <button
        type="button"
        className="control-bar__btn control-bar__btn--end"
        onClick={onEndInterview}
      >
        <span style={{ marginRight: '8px' }}>⏹️</span>
        TERMINATE SESSION
      </button>
    </footer>
  );
}

export default ControlBar;
