import { test, expect } from '@playwright/test';

// Test synthesize (TTS) and transcribe (STT) flows via backend endpoints using mocks

test.describe('Speech proxy tests', () => {
  test('synthesize returns base64 audio', async ({ page }) => {
    await page.route('**/v1/text:synthesize**', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ audioContent: 'BASE64AUDIO' }) });
    });

    // Call synthesize endpoint directly from the page
    await page.goto('/');
    const res = await page.evaluate(async () => {
      const r = await fetch('/api/speech/synthesize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'Hello' }) });
      return { status: r.status, body: await r.json() };
    });

    expect(res.status).toBe(200);
    expect(res.body.audioContent).toBe('BASE64AUDIO');
  });

  test('transcribe returns transcript', async ({ page }) => {
    // Mock Google Speech recognize endpoint
    await page.route('**/v1/speech:recognize**', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: [{ alternatives: [{ transcript: 'Test transcript' }] }] }) });
    });

    await page.goto('/');
    // Upload a small blob using fetch to /api/speech/transcribe
    const res = await page.evaluate(async () => {
      const blob = new Blob(['dummy'], { type: 'audio/webm' });
      const fd = new FormData();
      fd.append('audio', blob, 'test.webm');
      const r = await fetch('/api/speech/transcribe', { method: 'POST', body: fd });
      return { status: r.status, body: await r.json() };
    });

    expect(res.status).toBe(200);
    expect(res.body.transcript).toContain('Test transcript');
  });

  test('synthesize fails with empty text', async ({ page }) => {
    await page.route('**/v1/text:synthesize**', route => {
      route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'Text cannot be empty' }) });
    });

    await page.goto('/');
    const res = await page.evaluate(async () => {
      const r = await fetch('/api/speech/synthesize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: '' }) });
      return { status: r.status, body: await r.json() };
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Text cannot be empty');
  });

  test('transcribe fails with invalid audio format', async ({ page }) => {
    await page.route('**/v1/speech:recognize**', route => {
      route.fulfill({ status: 415, contentType: 'application/json', body: JSON.stringify({ error: 'Unsupported audio format' }) });
    });

    await page.goto('/');
    const res = await page.evaluate(async () => {
      const blob = new Blob(['dummy'], { type: 'text/plain' }); // Invalid format
      const fd = new FormData();
      fd.append('audio', blob, 'test.txt');
      const r = await fetch('/api/speech/transcribe', { method: 'POST', body: fd });
      return { status: r.status, body: await r.json() };
    });

    expect(res.status).toBe(415);
    expect(res.body.error).toBe('Unsupported audio format');
  });

  test('transcribe fails with large audio file', async ({ page }) => {
    await page.route('**/v1/speech:recognize**', route => {
      route.fulfill({ status: 413, contentType: 'application/json', body: JSON.stringify({ error: 'File too large' }) });
    });

    await page.goto('/');
    const res = await page.evaluate(async () => {
      const largeBlob = new Blob([new Array(10 * 1024 * 1024).fill('a').join('')], { type: 'audio/webm' }); // 10MB file
      const fd = new FormData();
      fd.append('audio', largeBlob, 'large-test.webm');
      const r = await fetch('/api/speech/transcribe', { method: 'POST', body: fd });
      return { status: r.status, body: await r.json() };
    });

    expect(res.status).toBe(413);
    expect(res.body.error).toBe('File too large');
  });
});
