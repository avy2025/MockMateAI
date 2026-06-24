import React from 'react';

function CandidatePanel({
  videoRef,
  cameraOn,
  status,
  error,
  onRetry,
  isListening = false,
}) {
  const showVideo = status === 'active' && cameraOn && !error;
  const isLoading = status === 'loading';

  return (
    <section
      className={`interview-panel interview-panel--candidate ${isListening ? 'interview-panel--listening' : ''}`}
      aria-label="Candidate"
    >
      <div className="interview-panel__video-area interview-panel__video-area--candidate">
        {isLoading && (
          <div className="interview-panel__overlay">
            <div className="interview-panel__spinner" aria-hidden="true" />
            <p className="display-text" style={{ fontSize: '0.8rem', marginTop: '12px' }}>CALIBRATING OPTICS...</p>
          </div>
        )}

        {error && (
          <div className="interview-panel__overlay interview-panel__overlay--error">
             <div style={{ fontSize: '2rem' }}>⚠️</div>
            <p>{error}</p>
            {onRetry && (
              <button type="button" className="btn btn-primary" onClick={onRetry} style={{ marginTop: '16px' }}>
                Retry Configuration
              </button>
            )}
          </div>
        )}

        {!cameraOn && status === 'active' && !error && (
          <div className="interview-panel__overlay">
             <div style={{ fontSize: '2rem', opacity: 0.5 }}>📵</div>
            <p className="display-text" style={{ fontSize: '0.8rem', marginTop: '12px', opacity: 0.5 }}>SENSOR OFFLINE</p>
          </div>
        )}

        <video
          ref={videoRef}
          className={`interview-panel__video ${showVideo ? 'interview-panel__video--visible' : ''}`}
          autoPlay
          playsInline
          muted
          aria-label="Your webcam preview"
        />

        {isListening && (
          <div className="candidate-listening-badge" style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6ee7a0', display: 'inline-block', marginRight: '8px', boxShadow: '0 0 10px #6ee7a0' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Voice Active</span>
          </div>
        )}
      </div>
      <footer className="interview-panel__label">
        <span className="interview-panel__label-text">YOUR FEED</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ width: '12px', height: '2px', background: 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>
      </footer>
    </section>
  );
}

export default CandidatePanel;
