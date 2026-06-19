const request = require('supertest');
const app = require('../app');
const InterviewSession = require('../models/InterviewSession');
const Resume = require('../models/Resume');
const { createAuthenticatedUser } = require('./helpers');

// Mock the Gemini API globally for chat tests
jest.mock('@google/generative-ai', () => {
  const mockGenerateContent = jest.fn().mockResolvedValue({
    response: {
      text: () => JSON.stringify({
        reply: 'Tell me about a challenging project you worked on.',
        evaluation: {
          score: 8,
          strengths: ['Good communication', 'Technical depth'],
          weaknesses: ['Could provide more examples'],
          improvements: ['Use the STAR method'],
        },
      }),
    },
  });

  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
  };
});

describe('Chat / Interview Endpoints', () => {
  let token;
  let sessionId;

  beforeEach(async () => {
    const auth = await createAuthenticatedUser();
    token = auth.token;

    // Create a resume and session for the test
    const resume = await Resume.create({
      user: auth.user._id,
      fileUrl: 'https://test-bucket.s3.amazonaws.com/resumes/test.pdf',
      storageKey: 'resumes/test.pdf',
      fileType: 'application/pdf',
      insights: {
        personalInfo: { name: 'Test User' },
        skills: ['JavaScript', 'React', 'Node.js'],
        summary: 'Experienced full-stack developer',
      },
    });

    const session = await InterviewSession.create({
      user: auth.user._id,
      sessionId: 'test-session-123',
      candidateName: 'Test User',
      interviewType: 'Frontend Engineer',
      resume: resume._id,
    });

    sessionId = session.sessionId;
  });

  describe('POST /api/chat', () => {
    it('should start an interview and return AI response', async () => {
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: 'Hello, please start the interview.',
          history: [],
          interviewType: 'Frontend Engineer',
          sessionId,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.reply).toBeDefined();
      expect(res.body.evaluation).toBeDefined();
      expect(typeof res.body.reply).toBe('string');
    });

    it('should return evaluation scores in the response', async () => {
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: 'I built a React dashboard with real-time data visualization.',
          history: [
            { role: 'ai', content: 'Tell me about a project you worked on.' },
          ],
          interviewType: 'Frontend Engineer',
          sessionId,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.evaluation).toBeDefined();
      expect(res.body.evaluation.score).toBeGreaterThanOrEqual(0);
      expect(res.body.evaluation.score).toBeLessThanOrEqual(10);
      expect(Array.isArray(res.body.evaluation.strengths)).toBe(true);
    });

    it('should persist transcript to the interview session', async () => {
      await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: 'I have experience with microservices architecture.',
          history: [],
          interviewType: 'Backend Engineer',
          sessionId,
        });

      const updatedSession = await InterviewSession.findOne({ sessionId });
      expect(updatedSession.transcript.length).toBeGreaterThan(0);
    });

    it('should work without a sessionId (generic interview)', async () => {
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: 'I am good at problem solving.',
          history: [],
          interviewType: 'General',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.reply).toBeDefined();
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({
          message: 'Hello',
          history: [],
          interviewType: 'General',
        });

      expect(res.statusCode).toBe(401);
    });
  });
});
