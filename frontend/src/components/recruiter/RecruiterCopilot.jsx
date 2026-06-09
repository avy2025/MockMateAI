import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCandidates, chatWithCopilot } from '../../services/recruiterApi';
import CopilotSuggestedPrompts from './CopilotSuggestedPrompts';

const RecruiterCopilot = () => {
  const [searchParams] = useSearchParams();
  const initialIds = searchParams.get('ids')?.split(',') || [];

  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState(initialIds);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! I am your AI Recruiter Copilot. Select one or more candidates, and I can help you summarize their performance, identify skill gaps, or compare them side-by-side." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    async function loadCandidates() {
      try {
        const data = await getCandidates();
        setCandidates(data);
      } catch (err) {
        console.error("Failed to load candidates", err);
      }
    }
    loadCandidates();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (customQuery = null) => {
    const query = customQuery || input;
    if (!query.trim() || selectedIds.length === 0) return;

    if (!customQuery) setInput('');
    
    const newUserMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    try {
      const history = messages.slice(1); // Skip initial greeting
      const result = await chatWithCopilot(selectedIds, query, history);
      setMessages(prev => [...prev, { role: 'model', content: result.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I encountered an error. Please try again or check the candidate selection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleCandidate = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length < 2) {
        setSelectedIds([...selectedIds, id]);
      } else {
        // Replace the oldest if we want to keep it to 2 for comparison
        setSelectedIds([selectedIds[1], id]);
      }
    }
  };

  const getCandidateName = (id) => {
    return candidates.find(c => c.sessionId === id)?.candidateName || id;
  };

  return (
    <div className="copilot-container" style={{ 
      display: 'grid', 
      gridTemplateColumns: '300px 1fr', 
      height: 'calc(100vh - 100px)', 
      gap: '20px',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      {/* Sidebar: Candidate Selector */}
      <aside className="content-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#381932' }}>Active Knowledge Context</h3>
        <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: 0 }}>Select candidates to chat about. I'll use their resumes, transcripts, and evaluation reports.</p>
        
        <div className="candidate-list" style={{ flex: 1, overflowY: 'auto' }}>
          {candidates.map(c => (
            <div 
              key={c.sessionId}
              onClick={() => toggleCandidate(c.sessionId)}
              style={{
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '8px',
                cursor: 'pointer',
                border: `2px solid ${selectedIds.includes(c.sessionId) ? '#381932' : 'transparent'}`,
                background: selectedIds.includes(c.sessionId) ? 'rgba(56, 25, 50, 0.05)' : '#fcfcfc',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: selectedIds.includes(c.sessionId) ? '#381932' : '#ddd'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.candidateName}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{c.appliedRole}</div>
              </div>
            </div>
          ))}
        </div>

        {selectedIds.length > 0 && (
          <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase' }}>Focusing On:</div>
            {selectedIds.map(id => (
              <div key={id} style={{ display: 'inline-block', background: '#381932', color: '#FFF3E6', padding: '3px 10px', borderRadius: '15px', fontSize: '0.75rem', marginRight: '5px', marginBottom: '5px' }}>
                {getCandidateName(id)}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <main className="content-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <header style={{ 
          padding: '20px', 
          borderBottom: '1px solid #eee', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(90deg, #381932, #5a2850)',
          color: '#FFF3E6'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>AI Recruiter Copilot</h2>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Executive Assistant • Evidence-Based Insights</div>
          </div>
          <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '20px' }}>
            {selectedIds.length === 2 ? '📊 Comparison Mode' : '👤 Single Analysis'}
          </div>
        </header>

        <div className="messages-container" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ 
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{ 
                background: m.role === 'user' ? '#381932' : '#f5f5f5',
                color: m.role === 'user' ? '#FFF3E6' : '#333',
                padding: '15px 20px',
                borderRadius: m.role === 'user' ? '20px 20px 2px 20px' : '20px 20px 20px 2px',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                whiteSpace: 'pre-wrap'
              }}>
                {m.content}
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '5px' }}>
                {m.role === 'user' ? 'You' : 'Copilot Intelligence'}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ alignSelf: 'flex-start', background: '#f5f5f5', padding: '12px 20px', borderRadius: '20px', display: 'flex', gap: '5px' }}>
              <div className="dot" /> <div className="dot" /> <div className="dot" />
              <style>{`.dot { width: 8px; height: 8px; background: #381932; borderRadius: 50%; animation: bounce 1.4s infinite ease-in-out both; } .dot:nth-child(1) { animation-delay: -0.32s; } .dot:nth-child(2) { animation-delay: -0.16s; } @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }`}</style>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <footer style={{ padding: '20px', borderTop: '1px solid #eee', background: '#fcfcfc' }}>
          {messages.length < 3 && (
            <CopilotSuggestedPrompts 
              mode={selectedIds.length > 1 ? 'compare' : 'single'} 
              onSelect={handleSendMessage} 
            />
          )}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input 
              type="text" 
              placeholder={selectedIds.length > 0 ? "Ask me anything about these candidates..." : "Select a candidate to start chatting..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={selectedIds.length === 0 || isTyping}
              style={{
                flex: 1,
                padding: '15px 20px',
                borderRadius: '12px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#381932'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <button 
              onClick={() => handleSendMessage()}
              disabled={selectedIds.length === 0 || !input.trim() || isTyping}
              style={{
                padding: '0 25px',
                background: '#381932',
                color: '#FFF3E6',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: (selectedIds.length === 0 || !input.trim() || isTyping) ? 0.5 : 1
              }}
            >
              Send
            </button>
          </div>
          <div style={{ fontSize: '0.7rem', textAlign: 'center', marginTop: '10px', opacity: 0.5 }}>
             AI responses are evidence-based. Neutral observations only.
          </div>
        </footer>
      </main>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default RecruiterCopilot;
