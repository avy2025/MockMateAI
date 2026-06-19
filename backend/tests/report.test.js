const request = require('supertest');
const app = require('../app');
const InterviewSession = require('../models/InterviewSession');
const InterviewReport = require('../models/InterviewReport');
const Resume = require('../models/Resume');
const { createAuthenticatedUser } = require('./helpers');

// Mock Gemini for report generation
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({
              focusAreas: ['Technical Proficiency', 'Communication'],
              candidateOverview: 'Strong candidate with solid technical skills.',
              roleReadinessScore: 82,
              skillGapAnalysis: [
                { skill: 'React', status: 'Strong', comment: 'Excellent proficiency.' },
              ],
              recommendedLearningPath: [
                { topic: 'System Design', reason: 'Deepen architecture skills.', priority: 'Medium' },
              ],
              technicalPerformance: {
                knowledgeStrengths: ['React', 'Node.js'],
                knowledgeGaps: ['System Design'],
                problemSolvingAssessment: 'Systematic approach.',
                recommendedLearningAreas: ['Design Patterns'],
              },
              communicationAssessment: {
                responseClarity: 'High',
                verbalStructure: 'Well-organized',
                explanationQuality: 'Good',
              },
              communicationInsights: ['Articulate responses'],
              highlights: {
                strongestAnswers: ['Project architecture explanation'],
                bestTechnicalMoments: ['React optimization discussion'],
                notableHRResponses: ['Teamwork example'],
                keyStrengthsDemonstrated: ['Technical clarity'],
              },
              improvementPlan: {
                areasForImprovement: ['System design depth'],
                recommendedTopics: ['Distributed Systems'],
                communicationSuggestions: ['Use STAR method more'],
                interviewReadinessRecommendations: ['Practice whiteboard'],
              },
              executiveSummary: 'A strong candidate ready for junior to mid-level roles.',
              overallReadinessAssessment: 'Interview Ready.',
              skillDistribution: [
                { subject: 'Problem Solving', A: 85 },
                { subject: 'Comm. Clarity', A: 80 },
                { subject: 'Tech Depth', A: 78 },
                { subject: 'Behavioral', A: 82 },
                { subject: 'Experience', A: 75 },
              ],
            }),
          },
        }),
      }),
    })),
  };
});

describe('Report Endpoints', () => {
  let token;
  let sessionId;

  beforeEach(async () => {
    const auth = await createAuthenticatedUser();
    token = auth.token;
    sessionId = 'report-session-123';

    const resume = await Resume.create({
      user: auth.user._id,
      fileUrl: 'https://test-bucket.s3.amazonaws.com/resumes/test.pdf',
      storageKey: 'resumes/test.pdf',
      fileType: 'application/pdf',
      insights: {
        personalInfo: { name: 'Test Candidate' },
        skills: ['JavaScript', 'React'],
        summary: 'Full-stack developer',
      },
    });

    await InterviewSession.create({
      user: auth.user._id,
      sessionId,
      candidateName: 'Test Candidate',
      interviewType: 'Frontend Engineer',
      resume: resume._id,
    });
  });

  describe('POST /api/report/generate', () => {
    it('should generate a report for a valid session', async () => {
      const chatHistory = [
        {
          role: 'ai',
          content: 'Tell me about your experience with React.',
          evaluation: { score: 8, strengths: ['Clear'], weaknesses: [], improvements: [] },
        },
        {
          role: 'user',
          content: 'I built several production React apps.',
        },
      ];

      const res = await request(app)
        .post('/api/report/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          sessionId,
          chatHistory,
          behaviorReport: {
            eyeContactScore: 85,
            attentionScore: 90,
            integrityScore: 95,
          },
          interviewType: 'Frontend Engineer',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.sessionId).toBe(sessionId);
      expect(res.body.candidateName).toBe('Test Candidate');
      expect(res.body.overallAssessment).toBeDefined();
      expect(res.body.overallAssessment.score).toBeGreaterThan(0);
      expect(res.body.technicalPerformance).toBeDefined();
      expect(res.body.communicationAssessment).toBeDefined();
    });

    it('should reject without sessionId', async () => {
      const res = await request(app)
        .post('/api/report/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          chatHistory: [],
          interviewType: 'General',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Session ID');
    });

    it('should save the report to the database', async () => {
      await request(app)
        .post('/api/report/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          sessionId,
          chatHistory: [
            {
              role: 'ai',
              content: 'Question',
              evaluation: { score: 7, strengths: [], weaknesses: [], improvements: [] },
            },
          ],
          behaviorReport: {},
          interviewType: 'General',
        });

      const reports = await InterviewReport.find({});
      expect(reports.length).toBe(1);
      expect(reports[0].candidateName).toBe('Test Candidate');
    });
  });

  describe('GET /api/report/:sessionId', () => {
    it('should retrieve a previously generated report', async () => {
      // First generate a report
      await request(app)
        .post('/api/report/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          sessionId,
          chatHistory: [
            {
              role: 'ai',
              content: 'Question',
              evaluation: { score: 8, strengths: [], weaknesses: [], improvements: [] },
            },
          ],
          behaviorReport: {},
          interviewType: 'Frontend Engineer',
        });

      // Then retrieve it
      const res = await request(app).get(`/api/report/${sessionId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.candidateName).toBe('Test Candidate');
    });

    it('should return 404 for non-existent report', async () => {
      const res = await request(app).get('/api/report/non-existent-session');

      expect(res.statusCode).toBe(404);
    });
  });
});
