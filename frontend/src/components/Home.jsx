import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const FEATURES = [
  {
    icon: '🧠',
    title: 'AI-Powered Questions',
    desc: 'Gemini AI generates dynamic, role-specific interview questions tailored to your resume and target company.',
  },
  {
    icon: '📊',
    title: 'Behavioral Analytics',
    desc: 'Real-time facial and speech analysis tracks confidence, clarity, and engagement throughout the session.',
  },
  {
    icon: '📝',
    title: 'Detailed Reports',
    desc: 'Receive an in-depth performance breakdown with actionable feedback to sharpen your weaknesses.',
  },
  {
    icon: '🎯',
    title: 'Role-Specific Plans',
    desc: 'Customised interview blueprints for SDE, PM, Data Science, and dozens of other high-demand roles.',
  },
];

const Home = ({ onStartInterview }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--background-milk)' }}>
      {/* ── NAV ── */}
      <header className="nav-container">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--primary)', letterSpacing: '0.05em' }}>
          MOCKMATE AI
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              <span style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                Hi, {user.name?.split(' ')[0]}
              </span>
              {user.role === 'recruiter' && (
                <Link to="/recruiter" className="btn btn-ghost" style={{ fontSize: '0.9rem' }}>
                  Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '8px 20px' }}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ borderRadius: '4px', padding: '10px 22px' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '72px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 420px' }}>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                display: 'inline-block',
                background: 'rgba(216,185,138,0.2)',
                color: 'var(--accent-plum)',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '6px 16px',
                borderRadius: '99px',
                marginBottom: '28px',
              }}
            >
              AI Interview Simulator
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              style={{ fontSize: 'clamp(3rem, 5vw, 5.5rem)', lineHeight: '0.95', marginBottom: '28px' }}
            >
              Master Your{' '}
              <span style={{ color: 'var(--accent)' }}>Future</span>
              <br />
              With AI Intelligence
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
              style={{ fontSize: '1.15rem', color: 'var(--on-surface-variant)', marginBottom: '44px', maxWidth: '480px', lineHeight: '1.7' }}
            >
              The world's most sophisticated interview simulator. Practice with state-of-the-art AI
              designed to land you at top-tier companies.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}
            >
              <button
                className="btn btn-primary"
                style={{ padding: '18px 36px', fontSize: '1rem' }}
                onClick={() => onStartInterview('Technical')}
              >
                🖥 Start Tech Session
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '18px 36px', fontSize: '1rem', backgroundColor: 'white' }}
                onClick={() => onStartInterview('HR')}
              >
                🤝 Start HR Session
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              style={{ marginTop: '48px', display: 'flex', alignItems: 'center', gap: '14px' }}
            >
              <div style={{ display: 'flex' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-plum))',
                      border: '2.5px solid white',
                      marginLeft: i === 1 ? 0 : '-11px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                10,000+ candidates prepped this month
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ flex: '1 1 340px', position: 'relative', minHeight: '400px' }}
          >
            <div
              className="glass-card"
              style={{
                width: '100%', aspectRatio: '1', borderRadius: '32px',
                overflow: 'hidden', display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '20px',
              }}
            >
              <img
                src="/images/hero.png"
                alt="AI Interview Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;color:var(--accent-plum)">
                      <div style="font-size:5rem">🤖</div>
                      <p style="font-family:var(--font-display);font-size:1.4rem;color:var(--primary)">YOUR AI INTERVIEWER</p>
                    </div>`;
                }}
              />
            </div>

            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-card"
              style={{ position: 'absolute', top: '8%', right: '-6%', padding: '14px 22px', borderRadius: '14px', zIndex: 2 }}
            >
              <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>✨ AI Score: 98%</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="glass-card"
              style={{ position: 'absolute', bottom: '12%', left: '-8%', padding: '14px 22px', borderRadius: '14px', zIndex: 2 }}
            >
              <span style={{ color: 'var(--accent-plum)', fontWeight: 700, fontSize: '0.9rem' }}>📈 Behavioural Match</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ paddingTop: '80px', paddingBottom: '100px', background: 'rgba(255,255,255,0.5)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginBottom: '16px' }}>
              Everything You Need to{' '}
              <span style={{ color: 'var(--accent)' }}>Succeed</span>
            </h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem', maxWidth: '520px', margin: '0 auto' }}>
              A complete platform built for serious candidates who want more than generic prep.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{ padding: '40px 32px', borderRadius: '20px' }}
              >
                <div style={{ fontSize: '2.4rem', marginBottom: '20px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--primary)' }}>
                  {f.title}
                </h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', lineHeight: '1.6' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ paddingTop: '80px', paddingBottom: '100px' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-plum) 100%)',
              borderRadius: '32px',
              padding: 'clamp(48px, 6vw, 80px) clamp(32px, 6vw, 72px)',
              textAlign: 'center',
              color: 'white',
            }}
          >
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: 'white', marginBottom: '16px' }}>
              Ready to Ace Your Next Interview?
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.75)', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
              Join thousands of candidates who landed their dream jobs using MockMate AI.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn"
                style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '18px 40px', fontSize: '1rem', fontWeight: 700, borderRadius: '8px' }}
                onClick={() => onStartInterview('Technical')}
              >
                Start for Free
              </button>
              {!user && (
                <Link
                  to="/register"
                  className="btn"
                  style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.4)', color: 'white', padding: '18px 40px', fontSize: '1rem' }}
                >
                  Create Account
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '36px 48px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
            © 2026 MOCKMATE AI · All Rights Reserved
          </p>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link to="/recruiter" className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              Recruiter Portal 🔐
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
