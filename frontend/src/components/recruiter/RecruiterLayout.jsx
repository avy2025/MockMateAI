import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/recruiter.css';

const RecruiterLayout = () => {
  const { user, logout } = useAuth();
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
          <NavLink to="/recruiter/scheduler" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📅</span>
            Scheduling
          </NavLink>
          <NavLink to="/recruiter/compare" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>

            <span className="nav-icon">⚖️</span>
            Comparison
          </NavLink>
          <NavLink to="/recruiter/copilot" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">✨</span>
            AI Copilot
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ padding: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600 }}>
            LOGGED IN AS: <br/>
            <span style={{ color: '#fff' }}>{user?.name || 'Recruiter'}</span>
          </div>
          <NavLink to="/" className="nav-item">
            <span className="nav-icon">🏠</span>
            Back to App
          </NavLink>
          <button 
            onClick={logout}
            className="nav-item" 
            style={{ 
              width: '100%', 
              textAlign: 'left', 
              background: 'none', 
              border: 'none', 
              color: '#ff4d4d',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="recruiter-main">
        <header className="no-print" style={{ 
          height: '60px', 
          background: '#fff', 
          borderBottom: '1px solid #eee', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          padding: '0 2rem'
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: '#381932', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {user?.name?.charAt(0) || 'R'}
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</span>
           </div>
        </header>
        <div style={{ padding: '2rem' }}>
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default RecruiterLayout;
