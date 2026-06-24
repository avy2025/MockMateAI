import React, { useState, useEffect } from 'react';
import { getRoles, generateInterviewPlan } from '../services/chatApi';
import { motion, AnimatePresence } from 'framer-motion';

const RoleSelection = ({ sessionId, onPlanGenerated, onBack }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleContinue = async () => {
    if (!selectedRoleId) return;
    setIsGenerating(true);
    try {
      const response = await generateInterviewPlan({ sessionId, roleId: selectedRoleId });
      onPlanGenerated(response.plan);
    } catch (error) {
      alert('Failed to generate interview plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--background-milk)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: '48px', height: '48px', border: '4px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
        <p className="display-text" style={{ marginTop: '24px' }}>Loading Protocols</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-milk)', padding: '120px 48px 48px' }}>
      <header className="nav-container">
        <button onClick={onBack} className="btn btn-ghost">← Back</button>
        <div className="display-text" style={{ fontSize: '1.5rem' }}>MOCKMATE AI</div>
        <button 
          onClick={handleContinue} 
          disabled={!selectedRoleId || isGenerating}
          className="btn btn-primary"
          style={{ borderRadius: '4px', opacity: isGenerating ? 0.7 : 1 }}
        >
          {isGenerating ? 'Configuring Session...' : 'Launch Session →'}
        </button>
      </header>

      <main className="container">
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span className="display-text" style={{ color: 'var(--accent)', fontSize: '0.9rem', display: 'block', marginBottom: '12px' }}>STEP 02 OF 02</span>
          <h1 className="display-text" style={{ fontSize: '4rem', marginBottom: '16px' }}>Target Your Purpose</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
            Select your target role. Our AI will calibrate its logic to match the specific demands of this position.
          </p>
          
          <div style={{ maxWidth: '600px', margin: '40px auto 0' }}>
            <input 
              type="text" 
              placeholder="Filter roles (e.g. Lead Engineer, Product...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-card"
              style={{ padding: '16px 24px', borderRadius: '12px', fontSize: '1.1rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {filteredRoles.map((role, index) => (
            <motion.div 
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedRoleId(role.id)}
              className="glass-card"
              style={{
                padding: '32px',
                cursor: 'pointer',
                border: selectedRoleId === role.id ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                transform: selectedRoleId === role.id ? 'translateY(-4px)' : 'none',
                boxShadow: selectedRoleId === role.id ? 'var(--glow-hover)' : 'var(--soft-glow)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 className="display-text" style={{ fontSize: '1.5rem', margin: 0 }}>{role.name}</h3>
                  {selectedRoleId === role.id && <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>SELECTED</span>}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.6' }}>{role.description}</p>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {role.focusAreas.slice(0, 3).map(area => (
                  <span key={area} style={{ backgroundColor: 'rgba(56, 25, 50, 0.05)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{area.toUpperCase()}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(255,243,230,0.9)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: '5rem', marginBottom: '32px' }}
            >
              🎯
            </motion.div>
            <h2 className="display-text" style={{ fontSize: '2.5rem' }}>Constructing Interview Matrix</h2>
            <p style={{ color: 'var(--text-muted)' }}>Calibrating behavioral checks and technical thresholds...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleSelection;
