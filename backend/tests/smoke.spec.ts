import request from 'supertest';
import app from '../src/server';

describe('API Smoke Tests', () => {
  it('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/agents should return array (mocked auth)', async () => {
    // Mock authentication middleware if needed
    // For now, assume test env allows unauthenticated or test user
    const res = await request(app).get('/api/agents');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/agents should create agent (mocked auth)', async () => {
    const agentData = {
      name: 'SmokeTestAgent',
      role: 'smoke-tester',
      icon: '🧪',
      skillIDs: ['test'],
    };
    const res = await request(app)
      .post('/api/agents')
      .send(agentData)
      .set('Content-Type', 'application/json');
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('SmokeTestAgent');
  });
});
