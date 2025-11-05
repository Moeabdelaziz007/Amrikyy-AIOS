import React, { useState } from 'react';

export default function CreatorPipelineApp() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('idle');
  const [result, setResult] = useState<any>(null);

  const compose = async () => {
    setStatus('processing');
    try {
      const res = await fetch('/api/creator/compose', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description }) });
      const data = await res.json();
      setResult(data);
      setStatus('done');
    } catch (e: any) {
      setStatus('error');
      setResult({ error: e.message });
    }
  };

  const uploadToYouTube = async () => {
    if (!result) return alert('No content generated yet');
    setStatus('uploading');
    try {
      const res = await fetch('/api/youtube/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ youtubeMeta: result.youtubeMeta, videoUrl: result.music?.audioUrl || 'https://example.com/video.mp4' }) });
      const data = await res.json();
      alert('Upload draft created: ' + data.uploadId);
      setStatus('uploaded');
    } catch (e: any) {
      setStatus('error');
      setResult({ error: e.message });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Creator Pipeline</h1>
      <p className="text-sm text-muted">Create a video package using NanoBanana/Veo/Music and prepare YouTube upload.</p>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="p-2 rounded bg-black/20" />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="p-2 rounded bg-black/20 h-32" />
        <div className="flex gap-3">
          <button className="button" onClick={compose}>Compose</button>
          <button className="button" onClick={uploadToYouTube}>Upload Draft to YouTube</button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold">Status: {status}</h2>
        <pre className="mt-2 bg-white/5 p-3 rounded max-h-64 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  );
}
