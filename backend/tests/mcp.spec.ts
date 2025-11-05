import request from 'supertest';
import { app } from '../src/server';

describe('MCP Resolve Route', () => {
  it('POST /api/mcp/resolve should return mock docs for a library', async () => {
    const res = await request(app)
      .post('/api/mcp/resolve')
      .send({ libraryName: 'example-lib' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('libraryName', 'example-lib');
    expect(res.body).toHaveProperty('context7CompatibleLibraryID');
    expect(res.body.docs).toBeDefined();
    expect(res.body.docs.summary).toContain('mocked documentation');
  });

  it('POST /api/mcp/resolve without libraryName should return 400', async () => {
    const res = await request(app)
      .post('/api/mcp/resolve')
      .send({})
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
