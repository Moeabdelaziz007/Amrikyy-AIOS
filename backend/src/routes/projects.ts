import { Router } from 'express';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { supabase } from '../services/supabase.js';

const router = Router();
router.use(verifyAuth);

/**
 * GET /api/projects
 * Get all projects for the authenticated user
 */
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ projects: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/projects
 * Create a new project
 * 
 * Body:
 * {
 *   "name": "My Project",
 *   "description": "Project description",
 *   "status": "Active",
 *   "earnings": 0
 * }
 */
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { name, description, status = 'Active', earnings = 0, tasks = [] } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Project name is required'
      });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name,
        description,
        status,
        earnings,
        tasks,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ project: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/projects/:id
 * Update a project
 */
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, status, earnings, tasks } = req.body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (earnings !== undefined) updateData.earnings = earnings;
    if (tasks !== undefined) updateData.tasks = tasks;

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ project: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects/:id
 * Get a specific project
 */
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    res.json({ project: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
