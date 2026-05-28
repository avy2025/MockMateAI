import React from 'react';

function InterviewHeader({ interviewType }) {
  return (
    <header className="interview-header">
      <div className="interview-header__brand">
        <div className="interview-header__logo" aria-hidden="true">
          <span className="interview-header__logo-mark">M</span>
        </div>
        <div>
          <h1 className="interview-header__title">MockMate AI</h1>
          {interviewType && (
            <p className="interview-header__type">{interviewType} Interview</p>
          )}
        </div>
      </div>
      <div className="interview-header__status">
        <span className="interview-header__status-dot" aria-hidden="true" />
        <span>AI Interview Session Active</span>
      </div>
    </header>
  );
}

export default InterviewHeader;
