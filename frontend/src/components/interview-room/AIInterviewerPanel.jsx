import React from 'react';

function AIInterviewerPanel({
  isActive = true,
  isSpeaking = false,
  currentQuestion = '',
  isLoading = false,
}) {
  return (
    <section
      className={`interview-panel interview-panel--ai ${isActive ? 'interview-panel--active' : ''}`}
      aria-label="AI Interviewer"
    >
      <div className="interview-panel__video-area interview-panel__video-area--ai" style={{ overflow: 'hidden' }}>
        {/* Synthetic AI Avatar Background */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
           <img src="/images/hero.png" alt="AI Agent" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        
        {/* Vitality Overlay */}
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: isSpeaking ? 'radial-gradient(circle, rgba(216, 185, 138, 0.1) 0%, transparent 70%)' : 'none',
          transition: 'all 0.5s ease'
        }} />

        {isSpeaking && (
          <div className="ai-speaking-badge" style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
            <span className="ai-speaking-badge__dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', marginRight: '8px' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Speaking</span>
          </div>
        )}

        {isLoading && !isSpeaking && (
          <div className="ai-speaking-badge" style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10, background: 'rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Processing Intent...</span>
          </div>
        )}
      </div>
      
      <footer className="interview-panel__label">
        <span className="interview-panel__label-text">INTEL-AGENT-OX1</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ width: '12px', height: '2px', background: isSpeaking ? 'var(--accent)' : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>
      </footer>
    </section>
  );
}

export default AIInterviewerPanel;
