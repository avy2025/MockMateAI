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
            <p>Starting camera…</p>
          </div>
        )}

        {error && (
          <div className="interview-panel__overlay interview-panel__overlay--error">
            <svg viewBox="0 0 24 24" className="interview-panel__error-icon" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 14h-2v-2h2v2Zm0-8h-2v6h2V8Z"
              />
            </svg>
            <p>{error}</p>
            {onRetry && (
              <button type="button" className="interview-panel__retry-btn" onClick={onRetry}>
                Try again
              </button>
            )}
          </div>
        )}

        {!cameraOn && status === 'active' && !error && (
          <div className="interview-panel__overlay">
            <svg viewBox="0 0 24 24" className="interview-panel__off-icon" aria-hidden="true">
              <path
                fill="currentColor"
                d="M17 10.5V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2.1l-1.3 1.3a1 1 0 1 0 1.4 1.4l3.6-3.6a1 1 0 0 0 0-1.4L7.2 10.4a1 1 0 1 0-1.4 1.4L7.1 13H5V8h10v2.5a1 1 0 1 0 2 0Zm4.3-1.8-6.4 6.4a1 1 0 0 1-1.4 0l-2.1-2.1a1 1 0 0 1 1.4-1.4l1.4 1.4 5.7-5.7a1 1 0 0 1 1.4 1.4Z"
              />
            </svg>
            <p>Camera is off</p>
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
          <div className="candidate-listening-badge" aria-hidden="true">
            <span className="candidate-listening-badge__dot" />
            Listening
          </div>
        )}
      </div>
      <footer className="interview-panel__label">
        <span className="interview-panel__label-badge interview-panel__label-badge--you">
          You
        </span>
        Candidate
      </footer>
    </section>
  );
}

export default CandidatePanel;
