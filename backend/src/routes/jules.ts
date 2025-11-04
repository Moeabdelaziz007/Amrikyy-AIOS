/**
 * Jules Journal API Routes
 * Endpoints for Jules AI agent's memory and learning system
 */
import { Router } from 'express';
import { julesJournalService } from '../services/julesJournalService.js';

const router = Router();

/**
 * POST /api/jules/journal/add
 * Log a debug session to the journal
 */
router.post('/journal/add', async (req, res) => {
  try {
    const { issue, diagnosis, solution, confidence } = req.body;
    
    if (!issue || !solution || confidence === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: issue, solution, confidence' 
      });
    }
    
    await julesJournalService.logDebugSession({
      issue,
      diagnosis,
      solution,
      confidence,
      userId: (req as any).user?.id
    });
    
    res.json({ success: true, message: 'Debug session logged successfully' });
  } catch (error: any) {
    console.error('Error logging debug session:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/jules/journal/insight
 * Log a technical insight
 */
router.post('/journal/insight', async (req, res) => {
  try {
    const { category, insight, context } = req.body;
    
    if (!category || !insight) {
      return res.status(400).json({ 
        error: 'Missing required fields: category, insight' 
      });
    }
    
    await julesJournalService.logInsight({ category, insight, context });
    
    res.json({ success: true, message: 'Insight logged successfully' });
  } catch (error: any) {
    console.error('Error logging insight:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jules/journal/search
 * Search for similar past issues using semantic search
 */
router.get('/journal/search', async (req, res) => {
  try {
    const { q, limit } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const results = await julesJournalService.searchSimilarIssues(
      q,
      { limit: limit ? parseInt(limit as string) : 10 }
    );
    
    res.json(results);
  } catch (error: any) {
    console.error('Error searching journal:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jules/journal/list
 * List recent journal entries
 */
router.get('/journal/list', async (req, res) => {
  try {
    const { days, limit } = req.query;
    
    const entries = await julesJournalService.listRecent({
      days: days ? parseInt(days as string) : 7,
      limit: limit ? parseInt(limit as string) : 50
    });
    
    res.json(entries);
  } catch (error: any) {
    console.error('Error listing journal entries:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jules/journal/patterns
 * Get pattern analysis from journal entries
 */
router.get('/journal/patterns', async (req, res) => {
  try {
    const { timeframe } = req.query;
    
    const analysis = await julesJournalService.analyzePatterns(
      timeframe ? parseInt(timeframe as string) : 30
    );
    
    res.json(analysis);
  } catch (error: any) {
    console.error('Error analyzing patterns:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
