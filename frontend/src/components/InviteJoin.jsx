import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyInviteToken } from '../services/recruiterApi';

const InviteJoin = () => {
  const { token } = useParams();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkInvite() {
      try {
        const data = await verifyInviteToken(token);
        setInvite(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    checkInvite();
  }, [token]);

  const handleStart = () => {
    // Logic to navigate to resume upload with interview type set
    // For now, we'll just go home and auto-select the role
    navigate('/', { state: { interviewType: invite.interviewType } });
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF3E6' }}>
      <h2>Verifying Invitation...</h2>
    </div>
  );

  if (error) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF3E6' }}>
      <div style={{ textAlign: 'center', background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#e63946' }}>Invalid Invitation</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#381932', color: '#fff', cursor: 'pointer' }}>Go Home</button>
      </div>
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF3E6', color: '#381932' }}>
      <div style={{ 
        background: '#fff', 
        padding: '50px', 
        borderRadius: '30px', 
        boxShadow: '0 20px 60px rgba(56, 25, 50, 0.1)',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '70px', 
          height: '70px', 
          background: '#381932', 
          color: '#fff', 
          borderRadius: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '2rem', 
          margin: '0 auto 30px' 
        }}>✨</div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '10px' }}>You're Invited!</h1>
        <p style={{ opacity: 0.7, marginBottom: '30px' }}>
          {invite.recruiter?.name} has invited you to a mock interview for the <strong>{invite.interviewType}</strong> role.
        </p>

        <div style={{ 
          background: '#f9f9f9', 
          padding: '20px', 
          borderRadius: '16px', 
          marginBottom: '40px',
          textAlign: 'left'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ opacity: 0.6, fontSize: '0.8rem', fontWeight: 700, display: 'block' }}>SCHEDULED FOR</span>
            <span style={{ fontWeight: 700 }}>{new Date(invite.scheduledDate).toLocaleString()}</span>
          </div>
          <div>
            <span style={{ opacity: 0.6, fontSize: '0.8rem', fontWeight: 700, display: 'block' }}>INTERVIEW TYPE</span>
            <span style={{ fontWeight: 700 }}>AI Behavioral & Technical</span>
          </div>
        </div>

        <button 
          onClick={handleStart}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '14px',
            background: '#381932',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(56, 25, 50, 0.2)'
          }}
        >
          Check In & Start
        </button>
      </div>
    </div>
  );
};

export default InviteJoin;
