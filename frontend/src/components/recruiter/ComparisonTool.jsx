import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getComparison } from '../../services/recruiterApi';
import { ChevronLeft, Award, Brain, MessageSquare, ShieldCheck, Zap } from 'lucide-react';

const ComparisonTool = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = searchParams.get('ids');
    if (ids) {
      async function fetchData() {
        try {
          const data = await getComparison(ids);
          setCandidates(data);
        } catch (error) {
          console.error('Failed to load comparison data:', error);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) return <div className="loading">Loading comparison...</div>;

  if (candidates.length === 0) {
    return (
      <div className="content-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>No Candidates Selected</h2>
        <p>Go back to the candidates list and select multiple candidates to compare.</p>
        <button className="btn-primary" onClick={() => navigate('/recruiter/candidates')}>Go to Candidates</button>
      </div>
    );
  }

  const metrics = [
    { label: 'Overall Score', key: 'overallScore', icon: <Zap size={18} /> },
    { label: 'Technical depth', key: 'technicalAssessment', subKey: 'score', icon: <Brain size={18} /> },
    { label: 'Communication', key: 'communicationAssessment', subKey: 'score', icon: <MessageSquare size={18} /> },
    { label: 'Integrity', key: 'integritySummary', subKey: 'integrityScore', icon: <ShieldCheck size={18} /> },
  ];

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div className="page-title">
          <button onClick={() => navigate('/recruiter/candidates')} className="btn-back" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#381932', cursor: 'pointer', fontWeight: 600, padding: 0, marginBottom: '10px' }}>
            <ChevronLeft size={20} /> Back to Candidates
          </button>
          <h1>Candidate Comparison</h1>
        </div>
      </header>

      <div className="comparison-grid">
        {candidates.map((c, idx) => (
          <div key={idx} className="compare-card">
            <div className="compare-header">
              <h3>{c.candidateName}</h3>
              <p style={{ opacity: 0.8, fontSize: '0.8rem', margin: '5px 0 0 0' }}>{c.interviewType}</p>
            </div>
            <div className="compare-body">
              {metrics.map((m, midx) => {
                const val = m.subKey ? c[m.key]?.[m.subKey] : c[m.key];
                return (
                  <div key={midx} className="compare-row">
                    <div className="compare-label">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {m.icon} {m.label}
                      </span>
                      <span>{val}%</span>
                    </div>
                    <div className="compare-bar-container">
                      <div className="compare-bar" style={{ width: `${val}%` }}></div>
                    </div>
                  </div>
                );
              })}

              <div style={{ marginTop: '2rem' }}>
                <h5 style={{ marginBottom: '10px', fontSize: '0.9rem' }}>Key Strengths</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {c.technicalAssessment?.knowledgeStrengths?.slice(0, 3).map((s, i) => (
                    <span key={i} className="skill-chip" style={{ fontSize: '0.7rem', background: '#f0f0f0' }}>{s}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h5 style={{ marginBottom: '10px', fontSize: '0.9rem' }}>Executive Summary</h5>
                <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>
                  {c.overallAssessment?.executiveSummary?.slice(0, 150)}...
                </p>
              </div>

              <button 
                className="btn-secondary" 
                style={{ width: '100%', marginTop: '2rem' }}
                onClick={() => navigate(`/recruiter/candidate/${c.sessionId}`)}
              >
                Full Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonTool;
