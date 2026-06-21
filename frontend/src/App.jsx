import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
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
      background: '#FFF3E6',
      color: '#381932',
      gap: '20px'
    }}>
      <div className="spinner" style={{ 
        width: '60px', 
        height: '60px', 
        border: '6px solid rgba(56, 25, 50, 0.1)', 
        borderTop: '6px solid #381932', 
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <h2 style={{ fontWeight: 800, fontSize: '2rem' }}>Generating Intelligence Report...</h2>
      <p style={{ opacity: 0.8 }}>Aggregating session metrics and AI assessments</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
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
