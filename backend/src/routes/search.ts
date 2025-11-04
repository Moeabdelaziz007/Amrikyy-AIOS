import { Router, Request, Response } from 'express';
import { googleSearchService } from '../services/googleSearchService.js';

const router = Router();

/**
* GET /api/search
* Perform a Google search
*
* Query params:
* - q: search query (required)
* - num: number of results (optional, default 10, max 10)
*/
router.get('/', async (req: Request, res: Response) => {
 try {
   const query = req.query.q as string;
   const num = parseInt(req.query.num as string) || 10;

   if (!query) {
     return res.status(400).json({
       error: 'Query parameter "q" is required'
     });
   }

   if (!googleSearchService.isConfigured()) {
     return res.status(503).json({
       error: 'Google Search API not configured. Please set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables.'
     });
   }

   const results = await googleSearchService.search(query, num);

   res.json({
     query,
     results: results.results,
     totalResults: results.totalResults,
     searchTime: results.searchTime
   });
 } catch (error: any) {
   console.error('Search error:', error.message);
   res.status(500).json({
     error: 'Search failed',
     message: error.message
   });
 }
});

/**
* GET /api/search/ai
* Perform a search with AI summarization
*
* Query params:
* - q: search query (required)
*/
router.get('/ai', async (req: Request, res: Response) => {
 try {
   const query = req.query.q as string;

   if (!query) {
     return res.status(400).json({
       error: 'Query parameter "q" is required'
     });
   }

   if (!googleSearchService.isConfigured()) {
     return res.status(503).json({
       error: 'Google Search API not configured'
     });
   }

   const result = await googleSearchService.searchWithAI(query, 5);

   res.json({
     query,
     answer: result.answer,
     sources: result.sources
   });
 } catch (error: any) {
   console.error('AI search error:', error.message);
   res.status(500).json({
     error: 'AI search failed',
     message: error.message
   });
 }
});

/**
* GET /api/search/health
* Check if search service is available
*/
router.get('/health', (req: Request, res: Response) => {
 const isConfigured = googleSearchService.isConfigured();

 res.json({
   status: isConfigured ? 'ok' : 'not_configured',
   configured: isConfigured,
   message: isConfigured
     ? 'Google Search API is configured and ready'
     : 'Google Search API not configured. Set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID.'
 });
});

export default router;