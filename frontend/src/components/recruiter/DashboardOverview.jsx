import React, { useState, useEffect } from 'react';
import { getMetrics } from '../../services/recruiterApi';

const DashboardOverview = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to load metrics:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading metrics...</div>;

  const stats = [
    { label: 'Total Candidates', value: metrics?.totalCandidates || 0, icon: 'Users', trend: '+12%', up: true },
    { label: 'Completed Interviews', value: metrics?.completedInterviews || 0, icon: 'Check', trend: '+5%', up: true },
    { label: 'Avg Performance', value: `${metrics?.averagePerformanceScore || 0}%`, icon: 'TrendingUp', trend: '+2%', up: true },
    { label: 'Interview Ready', value: metrics?.interviewReadyCandidates || 0, icon: 'Star', trend: 'High Priority', up: true },
    { label: 'Requires Attention', value: metrics?.requiresImprovementCandidates || 0, icon: 'Alert', trend: 'Needs Review', up: false },
  ];

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div className="page-title">
          <h1>Recruiter Dashboard</h1>
          <p>Welcome back! Here's an overview of your interview pipelines.</p>
        </div>
      </header>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value}</span>
            <div className={`stat-trend ${stat.up ? 'trend-up' : 'trend-down'}`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content-main" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="content-card">
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Recent Pipeline Performance</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '20px' }}>
             {/* Mock chart using DIVs */}
             {[65, 80, 45, 90, 70, 85, 60].map((h, i) => (
               <div key={i} style={{ 
                 flex: 1, 
                 background: i === 3 ? '#381932' : '#f4a261', 
                 height: `${h}%`, 
                 borderRadius: '8px 8px 0 0',
                 transition: 'all 0.5s ease',
                 position: 'relative'
               }}>
                 <span style={{ position: 'absolute', top: '-25px', width: '100%', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{h}%</span>
               </div>
             ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', marginTop: '10px' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d} style={{ fontSize: '0.8rem', opacity: 0.6 }}>{d}</span>)}
          </div>
        </div>

        <div className="content-card">
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Top Skills Demanded</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { skill: 'React', val: 92 },
              { skill: 'Communication', val: 85 },
              { skill: 'Problem Solving', val: 78 },
              { skill: 'Node.js', val: 70 }
            ].map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
                  <span>{s.skill}</span>
                  <span style={{ fontWeight: 700 }}>{s.val}%</span>
                </div>
                <div style={{ height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${s.val}%`, height: '100%', background: '#381932' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
