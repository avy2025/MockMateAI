const request = require('supertest');
const app = require('../app');
const InterviewSession = require('../models/InterviewSession');
const InterviewReport = require('../models/InterviewReport');
const Resume = require('../models/Resume');
const { createRecruiterUser, createAuthenticatedUser } = require('./helpers');

// Mock Gemini for Copilot
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => 'Based on the candidate data, this person shows strong React skills.',
          },
        }),
      }),
    })),
  };
});

/**
 * Helper to seed a candidate with a session, resume, and report.
 */
async function seedCandidate(userId, overrides = {}) {
  const sessionId = overrides.sessionId || `session-${Date.now()}`;

  const resume = await Resume.create({
    user: userId,
    fileUrl: 'https://test-bucket.s3.amazonaws.com/resumes/test.pdf',
    storageKey: 'resumes/test.pdf',
    fileType: 'application/pdf',
    insights: {
      personalInfo: { name: overrides.candidateName || 'Candidate' },
      skills: overrides.skills || ['JavaScript'],
    },
  });

  const session = await InterviewSession.create({
    user: userId,
    sessionId,
    candidateName: overrides.candidateName || 'Candidate',
    interviewType: overrides.interviewType || 'General',
    resume: resume._id,
    status: 'completed',
  });

  const report = await InterviewReport.create({
    session: session._id,
    candidateName: overrides.candidateName || 'Candidate',
    overallScore: overrides.overallScore || 75,
    technicalAssessment: {
      score: overrides.techScore || 80,
      strengths: ['React'],
      weaknesses: ['System Design'],
    },
    communicationAssessment: {
      score: overrides.commScore || 70,
      fluency: 'Good',
      clarity: 'High',
    },
    integritySummary: {
      integrityScore: 95,
      status: 'Clean',
      incidents: [],
    },
    careerReadiness: {
      topSkills: overrides.skills || ['JavaScript'],
    },
    savedAt: new Date(),
  });

  session.report = report._id;
  await session.save();

  return { session, resume, report, sessionId };
}

describe('Recruiter Dashboard Endpoints', () => {
  let recruiterToken;
  let candidateToken;
  let candidateUserId;

  beforeEach(async () => {
    const recruiter = await createRecruiterUser();
    recruiterToken = recruiter.token;

    const candidate = await createAuthenticatedUser();
    candidateToken = candidate.token;
    candidateUserId = candidate.user._id;
  });

  describe('GET /api/recruiter/metrics', () => {
    it('should return aggregated metrics for recruiter', async () => {
      await seedCandidate(candidateUserId, {
        candidateName: 'Alice',
        overallScore: 85,
        sessionId: 'metrics-1',
      });
      await seedCandidate(candidateUserId, {
        candidateName: 'Bob',
        overallScore: 55,
        sessionId: 'metrics-2',
      });

      const res = await request(app)
        .get('/api/recruiter/metrics')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.totalCandidates).toBeGreaterThanOrEqual(2);
      expect(res.body.completedInterviews).toBeGreaterThanOrEqual(2);
      expect(res.body.averagePerformanceScore).toBeDefined();
      expect(typeof res.body.averagePerformanceScore).toBe('number');
    });

    it('should reject non-recruiter access', async () => {
      const res = await request(app)
        .get('/api/recruiter/metrics')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should reject unauthenticated access', async () => {
      const res = await request(app).get('/api/recruiter/metrics');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/recruiter/candidates', () => {
    it('should return a list of all candidates', async () => {
      await seedCandidate(candidateUserId, {
        candidateName: 'Charlie',
        overallScore: 90,
        sessionId: 'cand-1',
      });

      const res = await request(app)
        .get('/api/recruiter/candidates')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].candidateName).toBe('Charlie');
      expect(res.body[0].overallScore).toBe(90);
      expect(res.body[0].status).toBe('Ready');
    });

    it('should show correct status based on score', async () => {
      await seedCandidate(candidateUserId, {
        candidateName: 'Low Score',
        overallScore: 45,
        sessionId: 'cand-low',
      });
      await seedCandidate(candidateUserId, {
        candidateName: 'Mid Score',
        overallScore: 70,
        sessionId: 'cand-mid',
      });

      const res = await request(app)
        .get('/api/recruiter/candidates')
        .set('Authorization', `Bearer ${recruiterToken}`);

      const low = res.body.find((c) => c.candidateName === 'Low Score');
      const mid = res.body.find((c) => c.candidateName === 'Mid Score');

      expect(low.status).toBe('Needs Review');
      expect(mid.status).toBe('Pending');
    });
  });

  describe('GET /api/recruiter/compare', () => {
    it('should return comparison data for multiple candidates', async () => {
      const c1 = await seedCandidate(candidateUserId, {
        candidateName: 'Compare A',
        sessionId: 'comp-a',
      });
      const c2 = await seedCandidate(candidateUserId, {
        candidateName: 'Compare B',
        sessionId: 'comp-b',
      });

      const res = await request(app)
        .get(`/api/recruiter/compare?ids=${c1.sessionId},${c2.sessionId}`)
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('should return 400 without ids', async () => {
      const res = await request(app)
        .get('/api/recruiter/compare')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/recruiter/copilot/chat', () => {
    it('should return AI copilot response', async () => {
      const c1 = await seedCandidate(candidateUserId, {
        candidateName: 'Copilot Candidate',
        sessionId: 'copilot-1',
      });

      const res = await request(app)
        .post('/api/recruiter/copilot/chat')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          sessionIds: [c1.sessionId],
          query: 'How strong is this candidate in React?',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.response).toBeDefined();
    });

    it('should reject without sessionIds', async () => {
      const res = await request(app)
        .post('/api/recruiter/copilot/chat')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ query: 'Tell me about this candidate' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject without query', async () => {
      const res = await request(app)
        .post('/api/recruiter/copilot/chat')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ sessionIds: ['some-id'] });

      expect(res.statusCode).toBe(400);
    });
  });
});
