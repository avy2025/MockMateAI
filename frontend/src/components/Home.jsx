import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = ({ onStartInterview }) => {
  return (
    <div className="home-wrapper" style={{ flex: 1, backgroundColor: 'var(--background-milk)' }}>
      <header className="nav-container">
        <div className="logo" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--primary)' }}>
          MOCKMATE AI
        </div>
        <div className="nav-links">
          <Link to="/login" className="btn btn-ghost">Login</Link>
          <Link to="/register" className="btn btn-primary" style={{ borderRadius: '4px' }}>Get Started</Link>
        </div>
      </header>

      <main className="container section-padding" style={{ display: 'flex', alignItems: 'center', minHeight: 'calc(100vh - 80px)', gap: '64px' }}>
        <div className="hero-content" style={{ flex: 1 }}>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ fontSize: '5rem', lineHeight: '0.9', marginBottom: '24px' }}
          >
            Master Your <span style={{ color: 'var(--accent)' }}>Future</span> <br />
            With AI Intelligence
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '500px' }}
          >
            The world's most sophisticated interview simulator. Practice with state-of-the-art AI designed to land you at top-tier companies.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            style={{ display: 'flex', gap: '16px' }}
          >
            <button 
              className="btn btn-primary" 
              style={{ padding: '20px 40px', fontSize: '1.1rem' }}
              onClick={() => onStartInterview('Technical')}
            >
              Start Tech Session
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '20px 40px', fontSize: '1.1rem', backgroundColor: 'white' }}
              onClick={() => onStartInterview('HR')}
            >
              Start HR Session
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            style={{ marginTop: '48px', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <div style={{ display: 'flex' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: `var(--accent)`, border: '2px solid white', 
                  marginLeft: i === 1 ? 0 : '-10px' 
                }} />
              ))}
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Joined by 10,000+ candidates this month
            </span>
          </motion.div>
        </div>

        <motion.div 
          className="hero-image"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ flex: 1, position: 'relative' }}
        >
          <div className="glass-card" style={{ 
            width: '100%', aspectRatio: '1', borderRadius: '24px', 
            overflow: 'hidden', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', padding: '20px' 
          }}>
            <img 
              src="/images/hero.png" 
              alt="AI Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} 
            />
          </div>
          
          {/* Floating elements for dynamic feel */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="glass-card" 
            style={{ 
              position: 'absolute', top: '10%', right: '-5%', 
              padding: '16px 24px', borderRadius: '12px', zIndex: 2 
            }}
          >
            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>AI Score: 98%</span>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="glass-card" 
            style={{ 
              position: 'absolute', bottom: '15%', left: '-10%', 
              padding: '16px 24px', borderRadius: '12px', zIndex: 2 
            }}
          >
            <span style={{ color: 'var(--accent-plum)', fontWeight: 'bold' }}>Behavioral Match</span>
          </motion.div>
        </motion.div>
      </main>

      <footer className="container" style={{ padding: '40px 48px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>© 2026 MOCKMATE AI. ALL RIGHTS RESERVED.</p>
        <Link to="/recruiter" className="btn btn-ghost" style={{ fontSize: '0.875rem' }}>
          RECRUITER PORTAL 🔐
        </Link>
      </footer>
    </div>
  );
};

export default Home;
