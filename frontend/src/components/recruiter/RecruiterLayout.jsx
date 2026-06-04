import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../../styles/recruiter.css';

const RecruiterLayout = () => {
  return (
    <div className="recruiter-layout">
      <aside className="recruiter-sidebar">
        <div className="sidebar-logo">
           MockMate <span>AI</span>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/recruiter" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>
          <NavLink to="/recruiter/candidates" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            Candidates
          </NavLink>
          <NavLink to="/recruiter/compare" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">⚖️</span>
            Comparison
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <NavLink to="/" className="nav-item">
            <span className="nav-icon">🏠</span>
            Back to App
          </NavLink>
        </div>
      </aside>

      <main className="recruiter-main">
        <Outlet />
      </main>
    </div>
  );
};

export default RecruiterLayout;
