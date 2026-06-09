import React from 'react';

const CopilotSuggestedPrompts = ({ onSelect, mode = 'single' }) => {
  const singlePrompts = [
    "Summarize this candidate",
    "What are their key strengths?",
    "Identify any skill gaps for this role",
    "Is this candidate ready for a Frontend role?",
    "Verify resume claims against interview performance"
  ];

  const comparePrompts = [
    "Compare Candidate A and Candidate B",
    "Which candidate performed better in React?",
    "What are the main cultural differences?",
    "Who is more experienced in system design?",
    "Give me a side-by-side technical summary"
  ];

  const prompts = mode === 'compare' ? comparePrompts : singlePrompts;

  return (
    <div className="suggested-prompts" style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '10px', 
      marginTop: '15px' 
    }}>
      {prompts.map((prompt, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(prompt)}
          style={{
            background: 'rgba(56, 25, 50, 0.05)',
            border: '1px solid rgba(56, 25, 50, 0.1)',
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '0.85rem',
            color: '#381932',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: 500
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#381932';
            e.currentTarget.style.color = '#FFF3E6';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(56, 25, 50, 0.05)';
            e.currentTarget.style.color = '#381932';
          }}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
};

export default CopilotSuggestedPrompts;
