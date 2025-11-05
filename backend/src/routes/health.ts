import { Router } from 'express';
import { systemHealthService } from '../services/systemHealthService.js';

const router = Router();

/**
 * POST /api/health/log
 * Receives a health data point from the frontend and logs it.
 * Body: { type: 'error' | 'performance' | 'ux', payload: any }
 */
router.post('/log', (req, res) => {
  const { type, payload } = req.body;

  if (!type || !payload) {
    return res.status(400).json({ error: 'type and payload are required' });
  }

  if (!['error', 'performance', 'ux'].includes(type)) {
    return res.status(400).json({ error: 'Invalid data type' });
  }

  systemHealthService.logData(type, payload);

  res.status(202).json({ message: 'Data logged successfully' });
});

/**
 * GET /api/health/score
 * Returns the current OS Efficiency Score.
 */
router.get('/score', (req, res) => {
    res.json({ score: systemHealthService.getScore() });
});

export default router;
