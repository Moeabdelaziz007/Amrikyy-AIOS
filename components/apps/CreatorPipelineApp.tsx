import React, { useState, useEffect, useRef } from 'react';

// --- Types ---
type PipelineStatus = 'idle' | 'starting' | 'processing' | 'ready' | 'uploading' | 'uploaded' | 'error';

interface JobDetails {
  status: PipelineStatus;
  videoJobId?: string;
  musicJob?: any;
  youtubeMeta?: any;
  videoStatus?: any;
  videoUrl?: string;
  youtubeUrl?: string;
  message?: string;
}

// --- Component ---
export default function CreatorPipelineApp() {
  const [idea, setIdea] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<PipelineStatus>('idle');
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const startPipeline = async () => {
    if (!idea.trim()) return setError('Please enter an idea for your video.');
    setError(null);
    setStatus('starting');
    setJobId(null);
    setJobDetails(null);

    try {
      const res = await fetch('/api/creator/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to start pipeline.');
      const data = await res.json();
      setJobId(data.jobId);
      setJobDetails(data.details);
      setStatus('processing');
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  };

  const checkStatus = async (currentJobId: string) => {
    try {
      const res = await fetch(`/api/creator/status/${currentJobId}`);
      if (!res.ok) throw new Error('Failed to get job status.');
      const data: JobDetails = await res.json();
      setJobDetails(data);

      if (data.status === 'ready') {
        setStatus('ready');
        if (pollingInterval.current) clearInterval(pollingInterval.current);
      } else if (data.status === 'error') {
        setError(data.message || 'An unknown error occurred during processing.');
        setStatus('error');
        if (pollingInterval.current) clearInterval(pollingInterval.current);
      }
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    }
  };

  const uploadToYouTube = async () => {
    if (!jobId) return;
    setStatus('uploading');
    try {
      const res = await fetch('/api/creator/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Upload failed.');
      const data = await res.json();
      setJobDetails(data.details);
      setStatus('uploaded');
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (status === 'processing' && jobId) {
      pollingInterval.current = setInterval(() => checkStatus(jobId), 5000); // Poll every 5 seconds
    } else if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [status, jobId]);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold">Automated Creator Pipeline</h1>
      <p className="text-sm text-gray-400">From a simple idea to a YouTube video, fully automated.</p>

      <div className="mt-6">
        <textarea
          placeholder="Enter a simple idea (e.g., 'a relaxing video about a rainy day')"
          value={idea}
          onChange={e => setIdea(e.target.value)}
          className="w-full p-3 rounded bg-black/20 border border-white/10 h-24"
          disabled={status !== 'idle' && status !== 'error'}
        />
        <button
          className="mt-2 px-6 py-3 font-bold rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          onClick={startPipeline}
          disabled={status !== 'idle' && status !== 'error'}
        >
          Start Creative Workflow
        </button>
      </div>

      {error && <p className="mt-4 text-red-400">Error: {error}</p>}

      {jobId && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Workflow Status</h2>
          <div className="mt-3 p-4 bg-black/20 rounded-lg border border-white/10">
            <p><strong>Job ID:</strong> {jobId}</p>
            <p><strong>Status:</strong> <span className={`font-bold ${status === 'ready' ? 'text-green-400' : 'text-yellow-400'}`}>{status.toUpperCase()}</span></p>
            
            {status === 'processing' && <p className="animate-pulse mt-2">Generating video... this may take a few minutes.</p>}
            
            {jobDetails?.youtubeMeta && (
              <div className="mt-4">
                <h3 className="font-semibold">Generated Details:</h3>
                <p className="text-sm"><strong>Title:</strong> {jobDetails.youtubeMeta.title}</p>
                <p className="text-sm"><strong>Description:</strong> {jobDetails.youtubeMeta.description}</p>
              </div>
            )}

            {status === 'ready' && (
              <button
                className="mt-4 px-6 py-3 font-bold rounded bg-green-600 hover:bg-green-700"
                onClick={uploadToYouTube}
              >
                Upload to YouTube
              </button>
            )}

            {status === 'uploaded' && jobDetails?.youtubeUrl && (
              <div className="mt-4">
                <p className="text-green-400 font-bold">Successfully uploaded!</p>
                <a href={jobDetails.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  View on YouTube: {jobDetails.youtubeUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
