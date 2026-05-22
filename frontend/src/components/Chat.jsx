import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ interviewType, resumeFilename, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Evaluation Card Component
  const EvaluationCard = ({ evaluation }) => {
    if (!evaluation) return null;
    return (
      <div className="evaluation-card scale-in" style={styles.evalCard}>
        <div style={styles.evalHeader}>
          <span className="score-badge">Score: {evaluation.score}/10</span>
          <h4 style={{margin: 0, color: '#381932'}}>Performance Feedback</h4>
        </div>
        
        <div style={styles.evalGrid}>
          <div style={styles.evalSection}>
            <strong style={styles.evalTitle}>⭐ Strengths</strong>
            <ul style={styles.evalList}>
              {evaluation.strengths?.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div style={styles.evalSection}>
            <strong style={styles.evalTitle}>🚩 Weaknesses</strong>
            <ul style={styles.evalList}>
              {evaluation.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        </div>
        
        <div style={{marginTop: '12px', borderTop: '1px solid rgba(56, 25, 50, 0.1)', paddingTop: '10px'}}>
          <strong style={styles.evalTitle}>💡 Improvements</strong>
          <p style={{fontSize: '0.9rem', marginTop: '5px'}}>{evaluation.improvements?.join(', ')}</p>
        </div>
      </div>
    );
  };

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Start interview with first AI message
  useEffect(() => {
    const startChat = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: 'Hello, please start the interview.', 
            history: [], 
            interviewType 
          }),
        });
        const data = await response.json();
        setMessages([{ role: 'model', content: data.reply }]);
      } catch (error) {
        console.error('Failed to start interview:', error);
        setMessages([{ role: 'model', content: "Sorry, I'm having trouble connecting. Is the backend server running?" }]);
      } finally {
        setIsLoading(false);
      }
    };
    startChat();
  }, [interviewType]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    const historyForBackend = [...messages, userMessage];
    setMessages(historyForBackend);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          history: historyForBackend, 
          interviewType 
        }),
      });
      const data = await response.json();
      
      // Update the user's message in state with the evaluation received from backend
      const updatedMessages = historyForBackend.map((msg, idx) => {
        if (idx === historyForBackend.length - 1) {
          return { ...msg, evaluation: data.evaluation };
        }
        return msg;
      });

      setMessages([...updatedMessages, { role: 'model', content: data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...historyForBackend, { role: 'model', content: "Lost connection. Please check your server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container fade-in" style={styles.container}>
      <header style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>← Back</button>
        <div style={styles.headerInfo}>
          <h2 style={styles.headerTitle}>{interviewType} Interview</h2>
          {resumeFilename && (
            <p style={styles.resumeHint}>Resume: {resumeFilename}</p>
          )}
          <div style={styles.status}><span style={styles.statusDot}></span> Live Session</div>
        </div>
        <div style={{width: '60px'}}></div>
      </header>

      <div style={styles.messageBox}>
        {messages.map((msg, idx) => (
          <React.Fragment key={idx}>
            <div 
              style={{
                ...styles.messageWrapper,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div 
                className={msg.role === 'user' ? 'slide-in-right' : 'slide-in-left'}
                style={{
                  ...styles.bubble,
                  ...(msg.role === 'user' ? styles.userBubble : styles.aiBubble)
                }}
              >
                {msg.content}
              </div>
            </div>
            {msg.role === 'user' && msg.evaluation && (
              <div style={{ padding: '0 20px', marginBottom: '10px' }}>
                <EvaluationCard evaluation={msg.evaluation} />
              </div>
            )}
          </React.Fragment>
        ))}
        {isLoading && (
          <div style={{...styles.messageWrapper, justifyContent: 'flex-start'}}>
            <div style={{...styles.bubble, ...styles.aiBubble, opacity: 0.7}}>
              <span className="typing-indicator">Interviewer is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={styles.inputArea}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer..."
          style={styles.input}
          disabled={isLoading}
        />
        <button type="submit" className="primary-btn" style={styles.sendBtn} disabled={isLoading}>
          Send
        </button>
        <button type="button" style={styles.micBtn} title="Voice integration coming soon">
          🎤
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFF3E6',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
  },
  header: {
    padding: '20px',
    backgroundColor: '#FFF3E6',
    borderBottom: '1px solid rgba(56, 25, 50, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  backBtn: {
    background: 'none',
    color: '#381932',
    fontSize: '1rem',
    fontWeight: '600',
    padding: '8px 12px',
  },
  headerInfo: {
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: '1.2rem',
    margin: 0,
    color: '#381932',
  },
  resumeHint: {
    fontSize: '0.75rem',
    color: '#8a7085',
    margin: '4px 0 0',
  },
  status: {
    fontSize: '0.8rem',
    color: '#28a745',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    marginTop: '4px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#28a745',
    borderRadius: '50%',
    display: 'inline-block',
  },
  messageBox: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
  },
  bubble: {
    maxWidth: '80%',
    padding: '14px 18px',
    borderRadius: '18px',
    lineHeight: '1.5',
    fontSize: '1rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    color: '#381932',
    borderBottomLeftRadius: '4px',
  },
  userBubble: {
    backgroundColor: '#381932',
    color: '#FFFFFF',
    borderBottomRightRadius: '4px',
  },
  inputArea: {
    padding: '20px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid rgba(56, 25, 50, 0.1)',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '14px 20px',
    borderRadius: '30px',
    border: '1px solid #E0E0E0',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  sendBtn: {
    borderRadius: '30px',
    padding: '12px 25px',
  },
  micBtn: {
    background: '#F0F0F0',
    fontSize: '1.2rem',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  evalCard: {
    padding: '20px',
    border: '1px solid rgba(56, 25, 50, 0.1)',
  },
  evalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '15px',
  },
  evalGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  evalSection: {
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '8px',
  },
  evalTitle: {
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#666',
    display: 'block',
    marginBottom: '5px',
  },
  evalList: {
    margin: 0,
    paddingLeft: '18px',
    fontSize: '0.85rem',
    lineHeight: '1.4',
  }
};

export default Chat;
