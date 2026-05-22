import React from 'react';

const Home = ({ onStartInterview }) => {
  return (
    <div className="home-container fade-in" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>MockMate AI</h1>
        <p style={styles.subtitle}>Your Personal Interview Coach</p>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Ready to practice?</h2>
          <p style={styles.cardText}>
            Choose an interview type, then upload your resume before the session begins.
          </p>
          
          <div style={styles.buttonGroup}>
            <button 
              className="primary-btn" 
              onClick={() => onStartInterview('HR')}
              style={styles.button}
            >
              Start HR Interview
            </button>
            
            <button 
              className="primary-btn" 
              onClick={() => onStartInterview('Technical')}
              style={styles.button}
            >
              Start Technical Interview
            </button>
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <p>© 2026 MockMate AI. Practice makes perfect.</p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    textAlign: 'center',
  },
  header: {
    marginBottom: '40px',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: '700',
    color: '#381932',
    letterSpacing: '-1px',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    fontWeight: '400',
  },
  main: {
    width: '100%',
    maxWidth: '500px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(56, 25, 50, 0.1)',
  },
  cardTitle: {
    fontSize: '1.8rem',
    marginBottom: '15px',
    color: '#381932',
  },
  cardText: {
    color: '#666',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  button: {
    width: '100%',
    fontSize: '1.1rem',
    padding: '16px',
    borderRadius: '14px',
  },
  footer: {
    marginTop: '60px',
    fontSize: '0.9rem',
    color: '#999',
  }
};

export default Home;
