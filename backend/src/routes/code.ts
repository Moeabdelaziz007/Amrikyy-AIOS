import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// Define the project's root directory for security purposes
const PROJECT_ROOT = path.resolve(process.cwd());

/**
 * POST /api/code/read
 * Securely reads the content of a specific file within the project.
 * Body: { filePath: string }
 */
router.post('/read', async (req, res, next) => {
  const { filePath } = req.body;

  if (!filePath) {
    return res.status(400).json({ error: 'filePath is required' });
  }

  try {
    // Security Check 1: Resolve the absolute path
    const absolutePath = path.resolve(PROJECT_ROOT, filePath);

    // Security Check 2: Ensure the resolved path is still within the project root
    if (!absolutePath.startsWith(PROJECT_ROOT)) {
      return res.status(403).json({ error: 'Access denied: Path is outside of the project scope.' });
    }

    // Security Check 3: Prevent reading from sensitive directories
    const forbiddenDirs = ['node_modules', '.git', 'dist', 'build'];
    if (forbiddenDirs.some(dir => absolutePath.includes(path.join(PROJECT_ROOT, dir)))) {
        return res.status(403).json({ error: 'Access denied: Cannot read from sensitive or build directories.' });
    }

    const content = await fs.readFile(absolutePath, 'utf-8');
    res.json({ filePath, content });

  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: `File not found: ${filePath}` });
    }
    // Forward other errors to the global error handler
    next(error);
  }
});

export default router;
