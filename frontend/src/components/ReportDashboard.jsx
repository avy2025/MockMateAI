import React, { useRef } from 'react';
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
  Zap
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
  PolarRadiusAxis 
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import '../styles/report-dashboard.css';

const ReportDashboard = ({ report, onBack }) => {
  const reportRef = useRef(null);

  if (!report) return <div>Loading report...</div>;

  const exportPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`MockMate_Report_${report.candidateName.replace(/\s+/g, '_')}.pdf`);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `report_${report.sessionId}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Chart Data Preparation
  const scoreData = [
    { name: 'Technical', score: report.technicalAssessment.technicalScore },
    { name: 'Communication', score: report.hrAssessment.communicationScore },
    { name: 'Integrity', score: report.integritySummary.integrityScore },
    { name: 'Overall', score: report.overallAssessment.overallScore },
  ];

  const radarData = [
    { subject: 'Clarity', A: report.hrAssessment.communicationScore, fullMark: 100 },
    { subject: 'Structure', A: report.overallAssessment.overallScore - 5, fullMark: 100 },
    { subject: 'Knowledge', A: report.technicalAssessment.technicalScore, fullMark: 100 },
    { subject: 'Soft Skills', A: report.hrAssessment.communicationScore + 5, fullMark: 100 },
    { subject: 'Retention', A: report.overallAssessment.overallScore, fullMark: 100 },
  ];

  const COLORS = ['#381932', '#BFE169', '#4D96FF', '#FF6B6B'];

  return (
    <div className="report-dashboard">
      <div className="report-container">
        
        {/* Header Section */}
        <header className="report-header">
          <div className="report-header__title">
            <span>MockMate AI Assessment</span>
            <h1>Final Intelligence Report</h1>
          </div>
          <div className="report-header__actions">
            <button className="btn-export btn-export--json" onClick={exportJSON}>
              <Share2 size={18} /> Export JSON
            </button>
            <button className="btn-export btn-export--pdf" onClick={exportPDF}>
              <Download size={18} /> Download PDF
            </button>
            <button className="btn-export btn-export--json" onClick={onBack}>
               New Interview
            </button>
          </div>
        </header>

        <div ref={reportRef} style={{ background: '#FFF3E6', padding: '20px', borderRadius: '20px' }}>
          
          {/* Executive Summary Cards */}
          <section className="stats-grid">
            <div className="stat-card">
              <span className="stat-card__label">Overall Proficiency</span>
              <span className="stat-card__value">{report.overallAssessment.overallScore}%</span>
              <span className="stat-card__sub" style={{ color: '#BFE169' }}>{report.overallAssessment.performanceBand}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Technical Score</span>
              <span className="stat-card__value">{report.technicalAssessment.technicalScore}</span>
              <span className="stat-card__sub">Assessment Level</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Comm. Rating</span>
              <span className="stat-card__value">{report.hrAssessment.communicationScore}</span>
              <span className="stat-card__sub">Soft Skills Maturity</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Integrity Status</span>
              <span className="stat-card__value">{report.integritySummary.integrityScore}%</span>
              <span className="stat-card__sub">{report.integritySummary.status}</span>
            </div>
          </section>

          {/* Section 1: Candidate Overview */}
          <section className="report-section">
            <div className="report-section__title">
              <User size={20} /> Candidate Overview
            </div>
            <div className="overview-grid">
              <div className="overview-info">
                <h3>{report.candidateName}</h3>
                <p className="date">Interview Date: {new Date(report.interviewDate).toLocaleDateString()} • {report.primaryFocus} Role</p>
                <div className="overview-summary">
                  <p>{report.resumeSummary}</p>
                </div>
              </div>
              <div>
                <h4 style={{ marginBottom: '10px' }}>Core Skills Identified</h4>
                <div className="skills-tags">
                  {report.keySkillsIdentified.slice(0, 10).map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Technical & HR Split */}
          <div className="assessment-grid">
            {/* Section 2: Technical Assessment */}
            <section className="report-section">
              <div className="report-section__title">
                <Target size={20} /> Technical assessment
              </div>
              <div className="assessment-score-teaser">Score: {report.technicalAssessment.technicalScore}/100</div>
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#8a7086' }}>Strongest technical areas</h4>
                <div className="points-list">
                  {report.technicalAssessment.strongestAreas.map((area, i) => (
                    <div key={i} className="point-item">
                      <CheckCircle2 size={16} className="point-icon" color="#BFE169" />
                      <span className="point-text">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#8a7086' }}>Knowledge gaps</h4>
                <div className="points-list">
                  {report.technicalAssessment.knowledgeGaps.map((gap, i) => (
                    <div key={i} className="point-item">
                      <AlertCircle size={16} className="point-icon" color="#FF6B6B" />
                      <span className="point-text">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 3: HR & Communication */}
            <section className="report-section">
              <div className="report-section__title">
                <Brain size={20} /> HR & communication
              </div>
              <div className="assessment-score-teaser">Score: {report.hrAssessment.communicationScore}/100</div>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#555' }}>
                {report.hrAssessment.overallInteraction}
              </p>
              <div className="metric-row">
                <span className="metric-label">Clarity</span>
                <span className="metric-value">{report.hrAssessment.clarity.split('.')[0]}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Professionalism</span>
                <span className="metric-value">{report.hrAssessment.professionalism.split('.')[0]}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Structured Thinking</span>
                <span className="metric-value">{report.hrAssessment.structuredThinking.split('.')[0]}</span>
              </div>
            </section>
          </div>

          {/* Visual Dashboard - Charts */}
          <section className="report-section">
            <div className="report-section__title">
              <TrendingUp size={20} /> Performance Analytics
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(56, 25, 50, 0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#381932', fontSize: 12, fontWeight: 500}} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip cursor={{fill: 'rgba(56, 25, 50, 0.02)'}} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={50}>
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(56, 25, 50, 0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: '#8a7086', fontSize: 11, fontWeight: 600}} />
                  <Radar name="Candidate" dataKey="A" stroke="#381932" fill="#381932" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Behavioral & Integrity */}
          <div className="assessment-grid">
            <section className="report-section">
              <div className="report-section__title">
                <Zap size={20} /> Behavioral Indicators
              </div>
              <div className="metrics-grid">
                <div>
                  <div className="metric-row">
                    <span className="metric-label">Eye Contact</span>
                    <span className="metric-value">{report.behavioralIndicators.eyeContact.toFixed(1)}%</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Attention</span>
                    <span className="metric-value">{report.behavioralIndicators.attention.toFixed(1)}%</span>
                  </div>
                </div>
                <div>
                  <div className="metric-row">
                    <span className="metric-label">Face Visibility</span>
                    <span className="metric-value">{report.behavioralIndicators.faceVisibility}%</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Speaking Pace</span>
                    <span className="metric-value">{report.behavioralIndicators.speakingPace}</span>
                  </div>
                </div>
              </div>
              <p style={{ marginTop: '15px', fontSize: '0.85rem', color: '#8a7086', fontStyle: 'italic' }}>
                Note: Indicators are observational only and do not constitute psychological evaluation.
              </p>
            </section>

            <section className="report-section">
              <div className="report-section__title">
                <ShieldCheck size={20} /> Integrity Verification
              </div>
              <div className="points-list">
                <div className="point-item">
                  <span className="point-text">Focus Loss Events: <strong>{report.integritySummary.focusLossEvents}</strong></span>
                </div>
                <div className="point-item">
                  <span className="point-text">Multiple Face Detection: <strong>{report.integritySummary.multipleFaceEvents}</strong></span>
                </div>
                <div className="point-item">
                  <span className="point-text">Camera Disruptions: <strong>{report.integritySummary.cameraInterruptions}</strong></span>
                </div>
                <div className="point-item">
                  <span className="point-text">Session Consistency: <strong>{report.integritySummary.integrityScore}%</strong></span>
                </div>
              </div>
              <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', background: report.integritySummary.integrityScore > 80 ? 'rgba(191, 225, 105, 0.1)' : 'rgba(255, 107, 107, 0.1)', fontSize: '0.9rem', fontWeight: 600, color: report.integritySummary.integrityScore > 80 ? '#381932' : '#FF6B6B', textAlign: 'center' }}>
                {report.integritySummary.status}
              </div>
            </section>
          </div>

          {/* Section 6: AI Interview Summary */}
          <section className="report-section">
            <div className="report-section__title">
              <Award size={20} /> AI Interview Summary
            </div>
            <div className="overview-grid">
              <div>
                <h4 style={{ marginBottom: '10px' }}>Candidate Strengths</h4>
                <div className="points-list">
                  {report.interviewSummary.strengths.map((str, i) => (
                    <div key={i} className="point-item">
                      <Zap size={16} className="point-icon" color="#BFE169" />
                      <span className="point-text">{str}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ marginBottom: '10px' }}>Notable Responses</h4>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  {report.interviewSummary.notableResponses.map((res, i) => (
                    <li key={i} style={{ marginBottom: '8px', fontSize: '0.95rem' }}>{res}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7: Final Assessment */}
          <section className="report-section" style={{ background: '#381932', color: 'white', border: 'none' }}>
            <div className="overall-assessment">
              <div className="overall-band">
                <div className="overall-band__label">Overall Rating</div>
                <div className="overall-band__score">{report.overallAssessment.overallScore}</div>
                <div className="overall-band__label" style={{ color: '#BFE169' }}>{report.overallAssessment.performanceBand}</div>
                <div className="readiness-badge">{report.overallAssessment.hiringReadiness}</div>
              </div>
              <div className="overall-details">
                <h3 style={{ color: 'white', marginTop: 0 }}>Recruiter Summary</h3>
                <p style={{ lineHeight: '1.6', fontSize: '1.1rem', opacity: 0.9 }}>
                  {report.overallAssessment.summary}
                </p>
                <div className="next-steps-card">
                  <h4 style={{ color: '#381932' }}>Suggested Next Steps</h4>
                  <p style={{ color: '#381932', margin: 0, opacity: 0.8 }}>{report.overallAssessment.suggestedNextSteps}</p>
                </div>
              </div>
            </div>
          </section>

          <footer style={{ marginTop: '40px', textAlign: 'center', color: '#8a7086', fontSize: '0.85rem' }}>
            Generated by MockMate AI Performance Intelligence Engine • Confidential Recruiter Asset
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;
