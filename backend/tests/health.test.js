const request = require('supertest');
const app = require('../app');

describe('Health Check', () => {
  it('GET /health should return ok status', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('MockMate AI Backend');
  });
});
