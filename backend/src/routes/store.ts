import { Router } from 'express';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { supabase } from '../services/supabase.js';

const router = Router();

/**
 * GET /api/store/agents
 * Get all available community agents from the store
 */
router.get('/agents', async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;

    let query = supabase
      .from('store_agents')
      .select('*')
      .eq('published', true)
      .order('rating', { ascending: false })
      .limit(Number(limit));

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json({ agents: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/store/agents/:id
 * Get a specific agent from the store
 */
router.get('/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('store_agents')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single();

    if (error) throw error;
    res.json({ agent: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/store/agents/:id/install
 * Install an agent from the store
 */
router.post('/agents/:id/install', verifyAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if already installed
    const { data: existing } = await supabase
      .from('user_installed_agents')
      .select('*')
      .eq('user_id', userId)
      .eq('store_agent_id', id)
      .single();

    if (existing) {
      return res.status(400).json({
        error: 'Agent already installed'
      });
    }

    // Get agent details
    const { data: agent, error: agentError } = await supabase
      .from('store_agents')
      .select('*')
      .eq('id', id)
      .single();

    if (agentError) throw agentError;

    // Record installation
    const { data, error } = await supabase
      .from('user_installed_agents')
      .insert({
        user_id: userId,
        store_agent_id: id,
        installed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Increment installation count
    await supabase.rpc('increment_agent_installs', { agent_id: id });

    res.json({ 
      message: 'Agent installed successfully',
      installation: data,
      agent
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/store/featured
 * Get featured agents
 */
router.get('/featured', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('store_agents')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('rating', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json({ agents: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/store/trending
 * Get trending agents
 */
router.get('/trending', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('store_agents')
      .select('*')
      .eq('published', true)
      .order('install_count', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json({ agents: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
