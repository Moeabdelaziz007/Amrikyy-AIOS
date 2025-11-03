import { useState, useEffect, useCallback } from 'react';

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  patternType: string;
  frequency: number;
  confidence: number;
  timestamp: Date;
}

export interface Session {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  status: 'active' | 'completed' | 'paused';
  activities: Activity[];
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  duration: number;
}

export interface LearningLoopHook {
  insights: Insight[];
  patterns: Pattern[];
  sessions: Session[];
  loading: boolean;
  acknowledgeInsight: (id: string) => void;
  refresh: () => void;
  trackAppLaunch: (appId: string, appName: string) => void;
  trackActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
}

export function useLearningLoop(): LearningLoopHook {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for development
  useEffect(() => {
    setInsights([
      {
        id: '1',
        title: 'Productivity Peak Detected',
        description: 'You are most productive between 9-11 AM. Consider scheduling important tasks during this time.',
        type: 'productivity',
        priority: 'medium',
        timestamp: new Date()
      },
      {
        id: '2',
        title: 'Frequent App Switching',
        description: 'You switch between apps frequently. Consider using workspaces to group related tasks.',
        type: 'workflow',
        priority: 'low',
        timestamp: new Date()
      }
    ]);

    setPatterns([
      {
        id: '1',
        name: 'Morning Routine',
        description: 'Consistent pattern of checking email and calendar first thing in the morning',
        patternType: 'behavioral',
        frequency: 0.85,
        confidence: 0.92,
        timestamp: new Date()
      },
      {
        id: '2',
        name: 'Focus Sessions',
        description: 'Long uninterrupted work sessions typically occur in the afternoon',
        patternType: 'productivity',
        frequency: 0.67,
        confidence: 0.78,
        timestamp: new Date()
      }
    ]);

    setSessions([
      {
        id: '1',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        duration: 60 * 60 * 1000, // 1 hour
        status: 'completed',
        activities: [
          {
            id: '1',
            type: 'app_usage',
            description: 'Used Terminal for 30 minutes',
            timestamp: new Date(),
            duration: 30 * 60 * 1000
          }
        ]
      }
    ]);
  }, []);

  const acknowledgeInsight = useCallback((id: string) => {
    setInsights(prev => prev.filter(insight => insight.id !== id));
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const trackAppLaunch = useCallback((appId: string, appName: string) => {
    console.info('App launched:', appId, appName);
    // Implement tracking logic
  }, []);

  const trackActivity = useCallback((activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    console.info('Activity tracked:', newActivity);
    // Implement tracking logic
  }, []);

  return {
    insights,
    patterns,
    sessions,
    loading,
    acknowledgeInsight,
    refresh,
    trackAppLaunch,
    trackActivity
  };
}