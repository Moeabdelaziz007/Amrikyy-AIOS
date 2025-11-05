import { useState, useEffect } from 'react';

interface App {
  id: string;
  name: string;
  icon: string;
  color: string;
  category?: string;
  suggested?: boolean;
  status?: string;
  new?: boolean;
  description?: string;
}

export const useApps = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await fetch('/api/apps/user-apps');
        const data = await response.json();
        setApps(data);
      } catch (error) {
        console.error('Failed to fetch apps:', error);
        // Fallback to default apps
        setApps([
          {
            id: 'video-creator',
            name: 'Video Creator',
            icon: '🎬',
            color: 'from-purple-500 to-pink-500',
            category: 'creative',
            new: true,
            description: 'AI-powered video generation'
          },
          {
            id: 'agent-forge',
            name: 'Agent Forge',
            icon: '🔧',
            color: 'from-cyan-500 to-blue-500',
            category: 'ai',
            new: true,
            description: 'Build custom AI agents'
          },
          {
            id: 'cognito',
            name: 'Cognito AI',
            icon: '🧠',
            color: 'from-blue-500 to-indigo-500',
            category: 'ai',
            status: 'active',
            description: 'Neural network assistant'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  return { apps, loading };
};
