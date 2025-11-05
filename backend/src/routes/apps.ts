import { Router } from 'express';

const router = Router();

router.get('/user-apps', async (req, res) => {
  try {
    // Mock user apps - in real app, query database based on user
    const apps = [
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
      },
      {
        id: 'trip-planner',
        name: 'Trip Planner',
        icon: '✈️',
        color: 'from-green-500 to-teal-500',
        category: 'productivity',
        description: 'Smart travel planning'
      },
      {
        id: 'workflow-studio',
        name: 'Workflow Studio',
        icon: '⚡',
        color: 'from-yellow-500 to-orange-500',
        category: 'productivity',
        status: 'active',
        description: 'Automate your tasks'
      }
    ];

    res.json(apps);
  } catch (error) {
    console.error('Error fetching user apps:', error);
    res.status(500).json({ error: 'Failed to fetch apps' });
  }
});

export default router;
