import React from 'react';

function AIInterviewerPanel({ isActive = true }) {
  return (
    <section
      className={`interview-panel interview-panel--ai ${isActive ? 'interview-panel--active' : ''}`}
      aria-label="AI Interviewer"
    >
      <div className="interview-panel__video-area interview-panel__video-area--ai">
        <div className="ai-avatar" aria-hidden="true">
          <div className="ai-avatar__ring ai-avatar__ring--outer" />
          <div className="ai-avatar__ring ai-avatar__ring--inner" />
          <div className="ai-avatar__core">
            <svg viewBox="0 0 64 64" className="ai-avatar__icon">
              <circle cx="32" cy="24" r="10" fill="currentColor" opacity="0.9" />
              <path
                d="M14 52c4-12 36-12 40 0"
                fill="currentColor"
                opacity="0.85"
              />
              <rect x="22" y="38" width="20" height="8" rx="4" fill="currentColor" opacity="0.5" />
            </svg>
          </div>
        </div>
        <p className="interview-panel__placeholder-text">
          AI avatar video — coming soon
        </p>
      </div>
      <footer className="interview-panel__label">
        <span className="interview-panel__label-badge">AI</span>
        AI Interviewer
      </footer>
    </section>
  );
}

export default AIInterviewerPanel;
