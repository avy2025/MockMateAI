import React, { useState, useEffect } from 'react';
import { getRoles, generateInterviewPlan } from '../services/chatApi';

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

  const handleRoleSelect = (roleId) => {
    setSelectedRoleId(roleId);
  };

  const handleContinue = async () => {
    if (!selectedRoleId) return;
    
    setIsGenerating(true);
    try {
      const response = await generateInterviewPlan({ sessionId, roleId: selectedRoleId });
      onPlanGenerated(response.plan);
    } catch (error) {
      console.error('Failed to generate interview plan:', error);
      alert('Failed to generate interview plan. Please try again.');
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
      <div style={containerStyle}>
        <div className="spinner" style={spinnerStyle}></div>
        <p>Loading available roles...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Target Your Career</h1>
        <p style={subtitleStyle}>Select the role you're interviewing for to tailor the Experience.</p>
        
        <div style={searchContainerStyle}>
          <input 
            type="text" 
            placeholder="Search roles (e.g. Frontend, Data Analyst...)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>
      </header>

      <div style={gridStyle}>
        {filteredRoles.map(role => (
          <div 
            key={role.id} 
            onClick={() => handleRoleSelect(role.id)}
            style={{
              ...cardStyle,
              borderColor: selectedRoleId === role.id ? '#381932' : 'transparent',
              boxShadow: selectedRoleId === role.id ? '0 10px 30px rgba(56, 25, 50, 0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
              transform: selectedRoleId === role.id ? 'translateY(-5px)' : 'none'
            }}
          >
            <div style={cardHeaderStyle}>
              <h3 style={cardTitleStyle}>{role.name}</h3>
              {selectedRoleId === role.id && <span style={badgeStyle}>Selected</span>}
            </div>
            <p style={cardDescriptionStyle}>{role.description}</p>
            <div style={tagContainerStyle}>
              {role.focusAreas.slice(0, 3).map(area => (
                <span key={area} style={tagStyle}>{area}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer style={footerStyle}>
        <button onClick={onBack} style={backButtonStyle}>Back</button>
        <button 
          onClick={handleContinue} 
          disabled={!selectedRoleId || isGenerating}
          style={{
            ...continueButtonStyle,
            opacity: (!selectedRoleId || isGenerating) ? 0.6 : 1,
            cursor: (!selectedRoleId || isGenerating) ? 'not-allowed' : 'pointer'
          }}
        >
          {isGenerating ? 'Analyzing Requirements...' : 'Continue to Interview'}
        </button>
      </footer>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// Styles
const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '60px 20px',
  minHeight: '100vh',
  backgroundColor: '#FFF3E6',
  color: '#381932',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: '"Outfit", "Inter", sans-serif'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '50px'
};

const titleStyle = {
  fontSize: '3rem',
  fontWeight: 900,
  marginBottom: '10px',
  letterSpacing: '-1px'
};

const subtitleStyle = {
  fontSize: '1.2rem',
  opacity: 0.8,
  marginBottom: '30px'
};

const searchContainerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  position: 'relative'
};

const searchInputStyle = {
  width: '100%',
  padding: '16px 24px',
  borderRadius: '12px',
  border: '2px solid rgba(56, 25, 50, 0.1)',
  backgroundColor: '#fff',
  fontSize: '1.1rem',
  outline: 'none',
  transition: 'border-color 0.3s ease',
  color: '#381932'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '30px',
  marginBottom: '60px'
};

const cardStyle = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '24px',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  border: '3px solid transparent',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px'
};

const cardTitleStyle = {
  fontSize: '1.4rem',
  fontWeight: 800,
  margin: 0
};

const badgeStyle = {
  backgroundColor: '#381932',
  color: '#FFF3E6',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '0.8rem',
  fontWeight: 600
};

const cardDescriptionStyle = {
  fontSize: '1rem',
  lineHeight: '1.6',
  opacity: 0.8,
  marginBottom: '20px'
};

const tagContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px'
};

const tagStyle = {
  backgroundColor: '#f8f0ec',
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '0.85rem',
  color: '#381932',
  fontWeight: 500
};

const footerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  marginTop: 'auto',
  paddingTop: '40px'
};

const backButtonStyle = {
  padding: '16px 40px',
  borderRadius: '12px',
  border: '2px solid #381932',
  backgroundColor: 'transparent',
  color: '#381932',
  fontSize: '1.1rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.3s'
};

const continueButtonStyle = {
  padding: '18px 60px',
  borderRadius: '12px',
  border: 'none',
  backgroundColor: '#381932',
  color: '#FFF3E6',
  fontSize: '1.1rem',
  fontWeight: 700,
  boxShadow: '0 10px 20px rgba(56, 25, 50, 0.2)',
  transition: 'all 0.3s'
};

const spinnerStyle = {
  width: '50px',
  height: '50px',
  border: '5px solid rgba(56, 25, 50, 0.1)',
  borderTop: '5px solid #381932',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: '20px'
};

export default RoleSelection;
