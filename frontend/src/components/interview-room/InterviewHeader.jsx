import React from 'react';

function InterviewHeader({ interviewType }) {
  return (
    <header className="interview-header">
      <div className="interview-header__brand" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="display-text" style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>MOCKMATE AI</div>
        {interviewType && (
          <div style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
            {interviewType.toUpperCase()} INTERVIEW
          </div>
        )}
      </div>
      <div className="interview-header__status" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6ee7a0', boxShadow: '0 0 10px #6ee7a0' }} />
        SESSION ENCRYPTED & ACTIVE
      </div>
    </header>
  );
}

export default InterviewHeader;
