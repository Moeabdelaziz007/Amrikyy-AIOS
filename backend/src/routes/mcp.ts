import { Router } from 'express';
import { resolveLibraryId } from '../mcp/resolveService.js';

const router = Router();

// POST /api/mcp/resolve
router.post('/resolve', async (req, res) => {
  try {
    const { libraryName } = req.body || {};
    if (!libraryName) return res.status(400).json({ error: 'libraryName is required' });
    const result = await resolveLibraryId(libraryName);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

export default router;
