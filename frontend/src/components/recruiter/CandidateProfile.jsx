import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCandidateDetail, exportToJSON } from '../../services/recruiterApi';
import { 
  User, Mail, Phone, MapPin, 
  ChevronLeft, Download, Printer, 
  Award, Brain, MessageSquare, 
  ShieldCheck, Activity, Target, Zap
} from 'lucide-react';
import '../../styles/recruiter.css';

const CandidateProfile = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCandidateDetail(sessionId);
        setReport(data);
      } catch (error) {
        console.error('Failed to load candidate details:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [sessionId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!report) return <div className="error">Candidate not found.</div>;

  return (
    <div className="animate-fade-in candidate-profile-container">
      <header className="page-header no-print">
        <div className="page-title">
          <button onClick={() => navigate('/recruiter/candidates')} className="btn-back" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#381932', cursor: 'pointer', fontWeight: 600, padding: 0, marginBottom: '10px' }}>
            <ChevronLeft size={20} /> Back to Candidates
          </button>
          <h1>Candidate Profile</h1>
        </div>
        <div className="table-actions">
          <button className="btn-secondary" onClick={() => exportToJSON(report, `candidate_${sessionId}`)}>Download JSON</button>
          <button className="btn-primary" onClick={handlePrint}>Print / Export PDF</button>
        </div>
      </header>

      <div className="profile-grid">
        {/* Sidebar Info */}
        <div className="profile-sidebar">
          <div className="content-card profile-info-card">
            <div className="profile-avatar">
              {report.candidateName.split(' ').map(n => n[0]).join('')}
            </div>
            <h2 style={{ textAlign: 'center', marginTop: '1rem' }}>{report.candidateName}</h2>
            <p style={{ textAlign: 'center', color: 'var(--recruiter-text-light)' }}>{report.interviewType || 'General Candidate'}</p>
            
            <div className="info-list" style={{ marginTop: '2rem' }}>
              <div className="info-item">
                <Mail size={16} /> <span>{report.resumeInsights?.personalInfo?.email || 'N/A'}</span>
              </div>
              <div className="info-item">
                <Target size={16} /> <span>Applied: {report.interviewType}</span>
              </div>
              <div className="info-item">
                <Activity size={16} /> <span>Interviewed: {new Date(report.savedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="overall-score-display" style={{ marginTop: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--recruiter-text-light)' }}>OVERALL SCORE</div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--recruiter-primary)' }}>{report.overallScore}%</div>
              <div className={`status-chip ${report.overallScore >= 80 ? 'status-ready' : 'status-pending'}`} style={{ marginTop: '10px' }}>
                {report.overallAssessment?.readiness || 'Pending Review'}
              </div>
            </div>
          </div>

          <div className="content-card" style={{ marginTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}><Brain size={18} /> Skill Distribution</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {[
                { label: 'Technical', val: report.technicalAssessment?.score || 0 },
                { label: 'Communication', val: report.communicationAssessment?.score || 0 },
                { label: 'Integrity', val: report.integritySummary?.integrityScore || 0 }
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.8rem' }}>
                    <span>{s.label}</span>
                    <span>{s.val}%</span>
                  </div>
                  <div style={{ height: '4px', background: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${s.val}%`, height: '100%', background: 'var(--recruiter-primary)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Info */}
        <div className="profile-main-content">
          <section className="profile-section content-card">
            <h3 className="section-title"><User size={20} /> AI Recruiter Summary</h3>
            <p className="summary-text" style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#444' }}>
              {report.overallAssessment?.executiveSummary || report.candidateOverview}
            </p>
            <div className="ai-insight-pill" style={{ background: 'rgba(244, 162, 97, 0.1)', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #f4a261', marginTop: '1rem' }}>
               <strong style={{ display: 'block', marginBottom: '5px' }}>💡 Recruiter Insight:</strong>
               {report.overallAssessment?.overallReadinessAssessment || "This candidate demonstrates strong potential with specific areas for alignment and growth."}
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <section className="content-card">
              <h3 className="section-title"><Zap size={20} /> Technical Assessment</h3>
              <div className="assessment-box">
                <h5 style={{ color: '#27ae60' }}>Strengths</h5>
                <ul className="profile-list">
                  {report.technicalAssessment?.knowledgeStrengths?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
                <h5 style={{ color: '#c0392b', marginTop: '1rem' }}>Identified Gaps</h5>
                <ul className="profile-list">
                  {report.technicalAssessment?.knowledgeGaps?.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            </section>

            <section className="content-card">
              <h3 className="section-title"><MessageSquare size={20} /> Communication</h3>
              <div className="assessment-box">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                  <div className="comm-mini-card">
                    <label>Pace</label>
                    <div>{report.communicationAssessment?.speakingPace || 'Normal'}</div>
                  </div>
                  <div className="comm-mini-card">
                    <label>Structure</label>
                    <div>{report.communicationAssessment?.verbalStructure || 'Clear'}</div>
                  </div>
                </div>
                <p><strong>Quality of Explanations:</strong> {report.communicationAssessment?.explanationQuality}</p>
                <div className="insights-cloud" style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {report.communicationAssessment?.insights?.map((ins, i) => (
                    <span key={i} className="skill-chip" style={{ fontSize: '0.75rem', background: '#f0f0f0' }}>{ins}</span>
                  ))}
                </div>
              </div>
            </section>

            <section className="content-card">
              <h3 className="section-title"><ShieldCheck size={20} /> Integrity Summary</h3>
              <div className="integrity-status-header" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900 }}>{report.integritySummary?.integrityScore}%</div>
                <div className="status-chip status-ready">{report.integritySummary?.status}</div>
              </div>
              <ul className="profile-list" style={{ marginTop: '1rem' }}>
                {report.integritySummary?.observations?.slice(0, 3).map((obs, i) => <li key={i}>{obs}</li>)}
              </ul>
            </section>

            <section className="content-card">
              <h3 className="section-title"><Activity size={20} /> Behavioral Patterns</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                <div>
                   <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{report.behavioralObservations?.metrics?.eyeContact}%</div>
                   <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Eye Contact</div>
                </div>
                <div>
                   <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{report.behavioralObservations?.metrics?.attention}%</div>
                   <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Attention</div>
                </div>
                <div>
                   <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{report.behavioralObservations?.metrics?.engagement}%</div>
                   <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Engagement</div>
                </div>
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>{report.behavioralObservations?.executiveBehavioralSummary?.slice(0, 100)}...</p>
            </section>
          </div>
        </div>
      </div>

      <style>{`
        .candidate-profile-container {
          padding-bottom: 3rem;
        }
        .profile-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 2rem;
        }
        .profile-avatar {
          width: 80px;
          height: 80px;
          background: var(--recruiter-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 800;
          margin: 0 auto;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          font-size: 0.9rem;
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.5rem;
          font-weight: 800;
          font-size: 1.1rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .profile-list {
          padding-left: 20px;
          margin: 0;
          color: #555;
          font-size: 0.9rem;
        }
        .profile-list li {
          margin-bottom: 5px;
        }
        .comm-mini-card {
          background: #f9f9f9;
          padding: 8px;
          border-radius: 8px;
          text-align: center;
        }
        .comm-mini-card label {
          display: block;
          font-size: 0.7rem;
          opacity: 0.6;
          font-weight: 700;
          text-transform: uppercase;
        }
        .comm-mini-card div {
          font-weight: 700;
          font-size: 0.9rem;
        }
        @media print {
          .no-print { display: none; }
          .recruiter-sidebar { display: none; }
          .recruiter-main { margin-left: 0; padding: 0; }
          .profile-grid { display: block; }
          .content-card { box-shadow: none; border: 1px solid #eee; break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default CandidateProfile;
