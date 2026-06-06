import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register({ name, email, password, role });
      if (user.role === 'recruiter') {
        navigate('/recruiter');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFF3E6',
      color: '#381932',
      padding: '40px 20px'
    }}>
      <div className="auth-card" style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(56, 25, 50, 0.1)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Join MockMate</h1>
          <p style={{ opacity: 0.7 }}>Create your account to get started</p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #ddd',
                outline: 'none',
                fontSize: '1rem'
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #ddd',
                outline: 'none',
                fontSize: '1rem'
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #ddd',
                outline: 'none',
                fontSize: '1rem'
              }}
            />
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600 }}>I am a...</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRole('candidate')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: role === 'candidate' ? '2px solid #381932' : '1px solid #ddd',
                  background: role === 'candidate' ? '#f5f3f5' : '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: role === 'recruiter' ? '2px solid #381932' : '1px solid #ddd',
                  background: role === 'recruiter' ? '#f5f3f5' : '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Recruiter
              </button>
            </div>
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              background: '#381932',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Create Account
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#381932', fontWeight: 700, textDecoration: 'none' }}>Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
