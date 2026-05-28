import React from 'react';

function MicIcon({ muted }) {
  if (muted) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm7-3a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V19H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-1v-1.08A7 7 0 0 0 19 11ZM4.29 3.29a1 1 0 0 0-1.42 1.42l16 16a1 1 0 0 0 1.42-1.42l-16-16Z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm7-3a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V19H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-1v-1.08A7 7 0 0 0 19 11Z"
      />
    </svg>
  );
}

function CameraIcon({ off }) {
  if (off) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M4 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.17l-1.58 1.59a1 1 0 1 0 1.42 1.42l3.58-3.58a1 1 0 0 0 0-1.42L6.01 13.6A1 1 0 1 0 4.59 15l1.58-1.59H4V8h7.59l1.42-1.42a1 1 0 0 0-1.42-1.42L8.17 6H4Zm14.83 0-3.58 3.58a1 1 0 0 0 0 1.42l1.42 1.42L18 10.41V16h-2.17l1.58 1.59a1 1 0 1 1-1.42 1.42l-3.58-3.58a1 1 0 0 1 0-1.42l3.58-3.58a1 1 0 0 1 1.42 1.42L15.83 14H20V8h-1.17Z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.83l2.29 2.3a1 1 0 0 0 1.42-1.42l-3.58-3.58a1 1 0 0 0-1.42 0L16.83 8H18a2 2 0 0 0-2-2H4Zm14 10H6V8h12v8Z"
      />
    </svg>
  );
}

function ControlBar({ micOn, cameraOn, onToggleMic, onToggleCamera, onEndInterview }) {
  return (
    <footer className="control-bar" role="toolbar" aria-label="Interview controls">
      <div className="control-bar__group">
        <button
          type="button"
          className={`control-bar__btn ${!micOn ? 'control-bar__btn--off' : ''}`}
          onClick={onToggleMic}
          aria-pressed={!micOn}
          aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          <MicIcon muted={!micOn} />
          <span>{micOn ? 'Mute' : 'Unmute'}</span>
        </button>

        <button
          type="button"
          className={`control-bar__btn ${!cameraOn ? 'control-bar__btn--off' : ''}`}
          onClick={onToggleCamera}
          aria-pressed={!cameraOn}
          aria-label={cameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          <CameraIcon off={!cameraOn} />
          <span>{cameraOn ? 'Camera' : 'Camera off'}</span>
        </button>
      </div>

      <button
        type="button"
        className="control-bar__btn control-bar__btn--end"
        onClick={onEndInterview}
        aria-label="End interview and return home"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 12 12 0 0 1 12 2Zm-1 5v6h6a1 1 0 1 0 0-2h-4V7a1 1 0 1 0-2 0Z"
          />
        </svg>
        <span>End interview</span>
      </button>
    </footer>
  );
}

export default ControlBar;
