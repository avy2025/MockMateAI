import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--background-milk)',
    }}>
      {/* Simple top bar */}
      <div style={{ padding: '20px 48px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--primary)', textDecoration: 'none', letterSpacing: '0.05em' }}>
          MOCKMATE AI
        </Link>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
      }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card" 
        style={{
          padding: '64px 48px',
          width: '100%',
          maxWidth: '520px',
          textAlign: 'center'
        }}
      >
        <div style={{ marginBottom: '40px' }}>
          <h1 className="display-text" style={{ fontSize: '3rem', marginBottom: '8px' }}>Join MockMate</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>The future of interview prep starts here</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'rgba(186, 26, 26, 0.1)',
              color: '#ba1a1a',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'var(--accent)' }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'var(--accent)' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'var(--accent)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
            />
          </div>
          
          <div style={{ marginBottom: '40px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'var(--accent)' }}>Choose Your Role</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`btn ${role === 'candidate' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, borderRadius: '4px' }}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`btn ${role === 'recruiter' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, borderRadius: '4px' }}
              >
                Recruiter
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '18px', fontSize: '1.1rem' }}
          >
            Create Account
          </button>
        </form>

        <div style={{ marginTop: '32px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Register;
