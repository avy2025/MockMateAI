import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Home from './components/Home';
import ResumeUpload from './components/ResumeUpload';
import RoleSelection from './components/RoleSelection';
import InterviewRoom from './components/interview-room/InterviewRoom';
import ReportDashboard from './components/ReportDashboard';
import { sendBehaviorReport, generateReport } from './services/chatApi';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import InviteJoin from './components/InviteJoin';


// Recruiter Components
import RecruiterLayout from './components/recruiter/RecruiterLayout';
import DashboardOverview from './components/recruiter/DashboardOverview';
import CandidateManagement from './components/recruiter/CandidateManagement';
import CandidateProfile from './components/recruiter/CandidateProfile';
import ComparisonTool from './components/recruiter/ComparisonTool';
import RecruiterCopilot from './components/recruiter/RecruiterCopilot';
import Scheduler from './components/recruiter/Scheduler';



function MainApp() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [interviewType, setInterviewType] = useState(null);
  const [resumeContext, setResumeContext] = useState(null);
  const [interviewPlan, setInterviewPlan] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const selectInterviewType = (type) => {
    setInterviewType(type);
    setResumeContext(null);
    setInterviewPlan(null);
    navigate('/resume');
  };

  const handleResumeUploaded = (context) => {
    setResumeContext(context);
    navigate('/role-selection');
  };

  const handlePlanGenerated = (plan) => {
    setInterviewPlan(plan);
    navigate('/interview');
  };

  const goHome = () => {
    setInterviewType(null);
    setResumeContext(null);
    setInterviewPlan(null);
    setFinalReport(null);
    navigate('/');
  };

  const handleEndInterview = async (behaviorReport, chatHistory) => {
    setIsGeneratingReport(true);
    navigate(`/report/loading`);

    try {
      if (behaviorReport && resumeContext?.sessionId) {
        sendBehaviorReport({
          sessionId: resumeContext.sessionId,
          report: behaviorReport,
        });
      }

      const report = await generateReport({
        sessionId: resumeContext?.sessionId,
        chatHistory,
        behaviorReport,
        interviewType
      });

      setFinalReport(report);
      navigate(`/report/${resumeContext.sessionId}`);
    } catch (error) {
      console.error('Failed to generate final report:', error);
      const fallbackReport = {
        error: "AI Report generation experienced a temporary issue.",
        candidateName: resumeContext?.insights?.personalInfo?.name || "Candidate",
        interviewDate: new Date().toISOString(),
        behavioralIndicators: behaviorReport,
        integritySummary: {
          integrityScore: behaviorReport?.integrityScore || 100,
          status: 'Review Recommended'
        }
      };
      setFinalReport(fallbackReport);
      navigate(`/report/error`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/invite/:token" element={<InviteJoin />} />
      
      {/* Protected Candidate Routes */}
      <Route element={<ProtectedRoute allowedRoles={['candidate', 'admin']} />}>
        <Route path="/" element={<Home onStartInterview={selectInterviewType} />} />
        <Route path="/resume" element={
          <ResumeUpload
            interviewType={interviewType}
            onUploadSuccess={handleResumeUploaded}
            onBack={() => navigate('/')}
          />
        } />
        <Route path="/role-selection" element={
          <RoleSelection
            sessionId={resumeContext?.sessionId}
            onPlanGenerated={handlePlanGenerated}
            onBack={() => navigate('/resume')}
          />
        } />
        <Route path="/interview" element={
          <InterviewRoom
            interviewType={interviewType}
            resumeContext={resumeContext}
            interviewPlan={interviewPlan}
            onEndInterview={handleEndInterview}
          />
        } />
        <Route path="/report/loading" element={<LoadingScreen />} />
        <Route path="/report/:sessionId" element={<ReportDashboard report={finalReport} onBack={goHome} />} />
      </Route>

      {/* Protected Recruiter Routes */}
      <Route element={<ProtectedRoute allowedRoles={['recruiter', 'admin']} />}>
        <Route path="/recruiter" element={<RecruiterLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="candidates" element={<CandidateManagement />} />
          <Route path="candidate/:sessionId" element={<CandidateProfile />} />
          <Route path="scheduler" element={<Scheduler />} />
          <Route path="compare" element={<ComparisonTool />} />
          <Route path="copilot" element={<RecruiterCopilot />} />
        </Route>
      </Route>

    </Routes>
  );
}


function LoadingScreen() {
  return (
    <div className="loading-screen" style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--background-milk)',
      color: 'var(--primary)',
      gap: '32px'
    }}>
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} 
        style={{ 
          width: '80px', 
          height: '80px', 
          border: '8px solid rgba(56, 25, 50, 0.05)', 
          borderTop: '8px solid var(--primary)', 
          borderRadius: '50%'
        }} 
      />
      <div style={{ textAlign: 'center' }}>
        <h2 className="display-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Refining Intelligence</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Aggregating behavioral signals and session metrics...</p>
      </div>
    </div>
  );
}
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <MainApp />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
