import { useState, useEffect } from 'react';

interface SystemStats {
  cpu: number;
  memory: number;
  activeAgents: number;
}

export const useSystemStats = () => {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0,
    memory: 0,
    activeAgents: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/system');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch system stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return stats;
};
