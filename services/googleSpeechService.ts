// Minimal Google Cloud Speech helper (browser-side fetch wrapper)
// NOTE: For production, you should route requests through a server to keep the API key secret.

export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

export async function transcribeAudioBlob(audioBlob: Blob): Promise<string | null> {
  // Proxy through backend to avoid exposing API key in the browser
  const form = new FormData();
  form.append('audio', audioBlob, 'audio.webm');
  const res = await fetch('/api/speech/transcribe', { method: 'POST', body: form });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Speech transcribe proxy error: ${res.status} ${txt}`);
  }
  const data = await res.json();
  return data.transcript || null;
}

export async function synthesizeTextToAudioUrl(text: string): Promise<string> {
  // Request base64 audio from backend proxy and convert to object URL
  const res = await fetch('/api/speech/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Speech synthesize proxy error: ${res.status} ${txt}`);
  }
  const data = await res.json();
  const audioBase64 = data.audioContent;
  const bytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: 'audio/mp3' });
  return URL.createObjectURL(blob);
}
