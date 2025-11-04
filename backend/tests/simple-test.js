import assert from 'assert';
import http from 'http';

const port = process.env.PORT || 5000;

const req = http.request(`http://localhost:${port}/health`, (res) => {
  assert.strictEqual(res.statusCode, 200);
  console.log('Health check passed!');
  process.exit(0);
});

req.on('error', (e) => {
  console.error(`Health check failed: ${e.message}`);
  process.exit(1);
});

req.end();
