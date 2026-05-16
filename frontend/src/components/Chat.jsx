import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ interviewType, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
            message: '', 
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
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          history: newMessages, 
          interviewType 
        }),
      });
      const data = await response.json();
      setMessages([...newMessages, { role: 'model', content: data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, { role: 'model', content: "Lost connection. Please check your server." }]);
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
          <div style={styles.status}><span style={styles.statusDot}></span> Live Session</div>
        </div>
        <div style={{width: '60px'}}></div> {/* Spacer for symmetry */}
      </header>

      <div style={styles.messageBox}>
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            style={{
              ...styles.messageWrapper,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              ...styles.bubble,
              ...(msg.role === 'user' ? styles.userBubble : styles.aiBubble)
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{...styles.messageWrapper, justifyContent: 'flex-start'}}>
            <div style={{...styles.bubble, ...styles.aiBubble, opacity: 0.7}}>
              Thinking...
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
  }
};

export default Chat;
