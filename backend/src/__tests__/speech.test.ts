import request from 'supertest';
import { app } from '../server.js';

describe('Speech routes', () => {
  it('POST /api/speech/synthesize without text returns 400', async () => {
    const res = await request(app).post('/api/speech/synthesize').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

