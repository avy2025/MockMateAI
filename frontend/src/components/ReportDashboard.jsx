import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Brain, 
  TrendingUp, 
  User, 
  Award, 
  Target,
  Zap,
  Printer,
  ChevronRight,
  Activity,
  Clock,
  Eye,
  MessageSquare,
  BarChart3,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  AreaChart,
  Area
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { getReport } from '../services/chatApi';
import '../styles/report-dashboard.css';

const ReportDashboard = ({ report: initialReport, onBack }) => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(!initialReport);

  useEffect(() => {
    if (!initialReport && sessionId && sessionId !== 'loading' && sessionId !== 'error') {
      getReport(sessionId)
        .then(data => {
          setReport(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching report:", err);
          setLoading(false);
        });
    }
  }, [sessionId, initialReport]);

  if (loading) return (
    <div className="report-loading" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#FFF3E6', color: '#381932' }}>
      <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid rgba(56, 25, 50, 0.1)', borderTop: '5px solid #381932', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ marginTop: '20px', fontWeight: 600 }}>Retrieving Assessment Data...</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!report) return (
    <div className="report-error" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#FFF3E6', color: '#381932' }}>
      <h2>Report Not Found</h2>
      <p>The requested interview session could not be located.</p>
      <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 25px', backgroundColor: '#381932', color: '#FFF3E6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Return Home</button>
    </div>
  );

  const exportPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFF3E6'
    });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`MockMate_Intelligence_Report_${report.candidateName.replace(/\s+/g, '_')}.pdf`);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `MockMate_Data_${report.sessionId}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const printReport = () => {
    window.print();
  };

  // Chart Data Preparation
  const radarData = report.charts?.skillDistribution?.length ? report.charts.skillDistribution : [
    { subject: 'Problem Solving', A: report.technicalPerformance.score },
    { subject: 'Clarity', A: report.communicationAssessment.score },
    { subject: 'Tech Depth', A: report.technicalPerformance.score - 5 },
    { subject: 'Behavioral', A: report.behavioralObservations.metrics.attention },
    { subject: 'Role Fit', A: report.roleAssessment?.roleReadinessScore || report.overallAssessment.score },
  ];

  const getColorByStatus = (status) => {
    switch (status.toLowerCase()) {
      case 'strong': return '#BFE169';
      case 'gap': return '#FF6B6B';
      case 'developing': return '#4D96FF';
      default: return '#8a7086';
    }
  };

  return (
    <div className="report-dashboard">
      <div className="report-container">
        
        {/* Header Section */}
        <header className="report-header no-print">
          <div className="report-header__title">
            <div className="badge">ENTERPRISE GRADE</div>
            <h1>Interview Intelligence</h1>
          </div>
          <div className="report-header__actions">
            <button className="btn-action" onClick={exportJSON} title="Download Raw Data">
              <Share2 size={18} /> JSON
            </button>
            <button className="btn-action" onClick={printReport} title="Print Report">
               <Printer size={18} /> Print
            </button>
            <button className="btn-action btn-primary" onClick={exportPDF}>
              <Download size={18} /> Export PDF
            </button>
            <button className="btn-home" onClick={onBack}>
               New Session <ChevronRight size={16} />
            </button>
          </div>
        </header>

        <div ref={reportRef} className="report-paper">
          
          {/* Executive Scorecards */}
          <section className="executive-summary-grid">
            <div className="main-score-card">
              <div className="score-label">Role Readiness</div>
              <div className="score-value">{report.roleAssessment?.roleReadinessScore || report.overallAssessment.score}<span>/100</span></div>
              <div className="score-band" style={{ color: '#BFE169' }}>{report.overallAssessment.performanceBand}</div>
              <div className="readiness-tag">{report.targetRole || 'General Role'} Readiness</div>
            </div>
            
            <div className="mini-score-cards">
              <div className="mini-card">
                <div className="mini-card__icon" style={{ background: 'rgba(77, 150, 255, 0.1)', color: '#4D96FF' }}>
                  <Target size={20} />
                </div>
                <div className="mini-card__data">
                  <div className="label">Technical</div>
                  <div className="value">{report.technicalPerformance.score}%</div>
                </div>
              </div>
              <div className="mini-card">
                <div className="mini-card__icon" style={{ background: 'rgba(191, 225, 105, 0.1)', color: '#381932' }}>
                  <MessageSquare size={20} />
                </div>
                <div className="mini-card__data">
                  <div className="label">Communication</div>
                  <div className="value">{report.communicationAssessment.score}%</div>
                </div>
              </div>
              <div className="mini-card">
                <div className="mini-card__icon" style={{ background: 'rgba(255, 107, 107, 0.1)', color: '#FF6B6B' }}>
                  <ShieldCheck size={20} />
                </div>
                <div className="mini-card__data">
                  <div className="label">Integrity</div>
                  <div className="value">{report.integritySummary.integrityScore}%</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 1 — CANDIDATE OVERVIEW */}
          <section className="report-page-section">
            <h2 className="section-title"><User size={20} /> Candidate Overview</h2>
            <div className="overview-container">
              <div className="candidate-profile">
                <h3>{report.candidateName}</h3>
                <div className="meta-tags">
                  <span className="meta-tag"><Target size={14} /> {report.targetRole || 'Not Specified'}</span>
                  <span className="meta-tag"><Clock size={14} /> {report.interviewDuration}</span>
                  <span className="meta-tag"><Activity size={14} /> {new Date(report.interviewDate).toLocaleDateString()}</span>
                </div>
                <div className="ai-summary-box">
                  <h4>AI Executive Summary</h4>
                  <p>{report.candidateOverview}</p>
                </div>
              </div>
              <div className="resume-context">
                <h4>Resume Insights</h4>
                <p className="resume-short">{report.resumeSummary}</p>
                <div className="skills-cloud">
                  {report.skillsDetected?.slice(0, 12).map((skill, i) => (
                    <span key={i} className="skill-chip">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* New Section: Role-Specific Assessment */}
          <section className="report-page-section">
            <h2 className="section-title"><Award size={20} /> {report.targetRole} Fit Analysis</h2>
            <div className="role-analysis-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
              <div className="skill-gap-analysis">
                <h4>Skill Gap Analysis</h4>
                <div className="gap-list" style={{ marginTop: '15px' }}>
                  {report.roleAssessment?.skillGapAnalysis?.map((item, i) => (
                    <div key={i} className="gap-item" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px 15px',
                      background: 'rgba(255,255,255,0.5)',
                      borderRadius: '10px',
                      marginBottom: '10px',
                      borderLeft: `4px solid ${getColorByStatus(item.status)}`
                    }}>
                      <div>
                        <strong>{item.skill}</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>{item.comment}</p>
                      </div>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        textTransform: 'uppercase',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: `${getColorByStatus(item.status)}22`,
                        color: getColorByStatus(item.status)
                      }}>{item.status}</span>
                    </div>
                  ))}
                  {(!report.roleAssessment?.skillGapAnalysis || report.roleAssessment.skillGapAnalysis.length === 0) && (
                    <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Comprehensive skill assessment for this role was not generated.</p>
                  )}
                </div>
              </div>

              <div className="learning-path">
                <h4>Recommended Learning Path</h4>
                <div className="path-list" style={{ marginTop: '15px' }}>
                  {report.roleAssessment?.recommendedLearningPath?.map((item, i) => (
                    <div key={i} className="path-item" style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <BookOpen size={14} color="#381932" />
                        <strong style={{ fontSize: '0.95rem' }}>{item.topic}</strong>
                        <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: 'auto' }}>{item.priority} Priority</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', margin: 0, opacity: 0.8 }}>{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="grid-split">
            {/* Section 2 — TECHNICAL PERFORMANCE */}
            <section className="report-page-section">
              <h2 className="section-title"><Brain size={20} /> Technical Performance</h2>
              <div className="performance-content">
                <div className="radar-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="rgba(56, 25, 50, 0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{fill: '#8a7086', fontSize: 11, fontWeight: 600}} />
                      <Radar name="Score" dataKey="A" stroke="#381932" fill="#381932" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="assessment-lists">
                  <div className="list-group">
                    <h5>Knowledge Strengths</h5>
                    <ul>
                      {report.technicalPerformance.knowledgeStrengths?.map((s, i) => <li key={i}><CheckCircle2 size={14} color="#BFE169" /> {s}</li>)}
                    </ul>
                  </div>
                  <div className="list-group">
                    <h5>Knowledge Gaps</h5>
                    <ul>
                      {report.technicalPerformance.knowledgeGaps?.map((g, i) => <li key={i}><AlertCircle size={14} color="#FF6B6B" /> {g}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="problem-solving-box">
                  <h5>Problem Solving Assessment</h5>
                  <p>{report.technicalPerformance.problemSolvingAssessment}</p>
                </div>
              </div>
            </section>

            {/* Section 3 — COMMUNICATION ASSESSMENT */}
            <section className="report-page-section">
              <h2 className="section-title"><MessageSquare size={20} /> Communication Assessment</h2>
              <div className="communication-metrics-grid">
                <div className="comm-metric">
                  <span className="label">Speaking Pace</span>
                  <span className="value">{report.communicationAssessment.speakingPace}</span>
                </div>
                <div className="comm-metric">
                  <span className="label">Avg Response</span>
                  <span className="value">{report.communicationAssessment.avgResponseLength}</span>
                </div>
              </div>
              <div className="analysis-box">
                <div className="analysis-item">
                  <strong>Clarity:</strong> {report.communicationAssessment.responseClarity}
                </div>
                <div className="analysis-item">
                  <strong>Structure:</strong> {report.communicationAssessment.verbalStructure}
                </div>
                <div className="analysis-item">
                  <strong>Quality:</strong> {report.communicationAssessment.explanationQuality}
                </div>
              </div>
              <div className="insights-list">
                <h5>Communication Insights</h5>
                {report.communicationAssessment.insights?.map((ins, i) => (
                  <div key={i} className="insight-pill">{ins}</div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid-split">
            {/* Section 4 — BEHAVIORAL OBSERVATIONS */}
            <section className="report-page-section">
              <h2 className="section-title"><Eye size={20} /> Behavioral Observations</h2>
              <div className="behavioral-dashboard">
                <div className="metric-circle-grid">
                  <div className="metric-circle">
                    <div className="circle-val">{report.behavioralObservations.metrics.eyeContact}%</div>
                    <div className="circle-lab">Eye Contact</div>
                  </div>
                  <div className="metric-circle">
                    <div className="circle-val">{report.behavioralObservations.metrics.faceVisibility}%</div>
                    <div className="circle-lab">Visibility</div>
                  </div>
                  <div className="metric-circle">
                    <div className="circle-val">{report.behavioralObservations.metrics.attention}%</div>
                    <div className="circle-lab">Attention</div>
                  </div>
                </div>
                <div className="behavioral-stats">
                  <div className="stat-row">
                    <span>Head Stability (Stable)</span>
                    <div className="progress-bar"><div className="fill" style={{ width: `${report.behavioralObservations.headMovement.stable}%` }}></div></div>
                  </div>
                  <div className="stat-row">
                    <span>Session Engagement</span>
                    <div className="progress-bar"><div className="fill" style={{ width: `${report.behavioralObservations.metrics.engagement}%` }}></div></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 — INTERVIEW INTEGRITY SUMMARY */}
            <section className="report-page-section">
              <h2 className="section-title"><ShieldCheck size={20} /> Integrity Monitoring</h2>
              <div className="integrity-box">
                <div className="integrity-status-header">
                  <div className="score">{report.integritySummary.integrityScore}/100</div>
                  <div className="status" style={{ background: report.integritySummary.integrityScore > 85 ? '#BFE169' : '#FF6B6B' }}>
                    {report.integritySummary.status}
                  </div>
                </div>
                <div className="integrity-events">
                  {report.integritySummary.observations.map((obs, i) => (
                    <div key={i} className="event-item">
                      <AlertCircle size={14} /> {obs}
                    </div>
                  ))}
                </div>
                <div className="integrity-stats-footer">
                   <span>Focus Loss: {report.integritySummary.stats.focusLossCount}</span>
                   <span>Window Switches: {report.integritySummary.stats.windowSwitchCount}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Section 6 — INTERVIEW HIGHLIGHTS */}
          <section className="report-page-section highlights-section">
            <h2 className="section-title"><Award size={20} /> Interview Highlights</h2>
            <div className="highlights-grid">
              <div className="highlight-card">
                <h5><Zap size={16} /> Strongest Answers</h5>
                <ul>
                  {report.highlights.strongestAnswers.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
              <div className="highlight-card">
                <h5><Activity size={16} /> Key Strengths</h5>
                <ul>
                  {report.highlights.keyStrengthsDemonstrated.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7 — IMPROVEMENT PLAN */}
          <section className="report-page-section improvement-section">
            <h2 className="section-title"><TrendingUp size={20} /> Strategic Improvement Plan</h2>
            <div className="improvement-grid">
              <div className="plan-column">
                <h5>Technical Growth</h5>
                {report.improvementPlan.recommendedTopics.map((t, i) => <div key={i} className="plan-item">{t}</div>)}
              </div>
              <div className="plan-column">
                <h5>Communication Tips</h5>
                {report.improvementPlan.communicationSuggestions.map((s, i) => <div key={i} className="plan-item">{s}</div>)}
              </div>
              <div className="plan-column">
                <h5>Next Steps</h5>
                <p>{report.improvementPlan.interviewReadinessRecommendations}</p>
              </div>
            </div>
          </section>

          {/* Section 8 — OVERALL ASSESSMENT */}
          <section className="overall-assessment-final">
             <div className="final-header">
               <div className="readiness-label">{report.overallAssessment.readiness}</div>
               <h2>Final Executive Assessment</h2>
             </div>
             <p className="exec-summary-text">{report.overallAssessment.executiveSummary}</p>
             <div className="readiness-assessment-box">
                <h4>Readiness Analysis</h4>
                <p>{report.overallAssessment.overallReadinessAssessment}</p>
             </div>
          </section>

          <footer className="report-footer">
            <p>Report ID: {report.sessionId} • Generated via MockMate AI Proprietary Evaluation Engine</p>
            <p>© 2024 MockMate AI. Confidential Professional Assessment.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;
