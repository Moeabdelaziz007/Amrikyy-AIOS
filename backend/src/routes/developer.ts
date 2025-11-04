import { Router } from 'express';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { supabase } from '../services/supabase.js';
import * as crypto from 'crypto';

const router = Router();
router.use(verifyAuth);

/**
 * GET /api/developer/keys
 * Get all API keys for the authenticated user
 */
router.get('/keys', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, service, created_at, last_used, is_active')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ keys: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/developer/keys
 * Create a new API key
 * 
 * Body:
 * {
 *   "name": "My API Key",
 *   "service": "gemini" | "imagen" | "veo" | "custom"
 * }
 */
router.post('/keys', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { name, service = 'custom' } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'API key name is required'
      });
    }

    // Generate a secure API key
    const apiKey = `aios_${crypto.randomBytes(32).toString('hex')}`;
    const keyPrefix = apiKey.substring(0, 12) + '...';

    // Hash the key for storage
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        name,
        service,
        key_hash: hashedKey,
        key_prefix: keyPrefix,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select('id, name, key_prefix, service, created_at, is_active')
      .single();

    if (error) throw error;

    // Return the full key only once (on creation)
    res.json({ 
      key: data,
      apiKey, // Full key - shown only this once!
      warning: 'Save this API key securely. It will not be shown again.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/developer/keys/:id
 * Delete an API key
 */
router.delete('/keys/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ message: 'API key deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/developer/keys/:id
 * Update an API key (activate/deactivate)
 */
router.put('/keys/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, isActive } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data, error } = await supabase
      .from('api_keys')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select('id, name, key_prefix, service, created_at, is_active')
      .single();

    if (error) throw error;
    res.json({ key: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/developer/usage
 * Get API usage statistics
 */
router.get('/usage', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { period = '7d' } = req.query;

    // Calculate date range
    let startDate: Date;
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const { data, error } = await supabase
      .from('api_usage')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw error;

    // Aggregate usage by endpoint
    const usageByEndpoint: any = {};
    const usageByDate: any = {};
    let totalCalls = 0;

    (data || []).forEach((record: any) => {
      totalCalls++;
      
      // By endpoint
      if (!usageByEndpoint[record.endpoint]) {
        usageByEndpoint[record.endpoint] = 0;
      }
      usageByEndpoint[record.endpoint]++;

      // By date
      const date = new Date(record.timestamp).toISOString().split('T')[0];
      if (!usageByDate[date]) {
        usageByDate[date] = 0;
      }
      usageByDate[date]++;
    });

    res.json({
      period,
      totalCalls,
      usageByEndpoint,
      usageByDate,
      rawData: data
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/developer/services
 * Get status of all services
 */
router.get('/services', async (req: AuthenticatedRequest, res) => {
  try {
    const services = [
      { name: 'Gemini AI', status: 'operational', endpoint: '/api/ai/health' },
      { name: 'Agents', status: 'operational', endpoint: '/api/agents' },
      { name: 'Workflows', status: 'operational', endpoint: '/api/workflows' },
      { name: 'Knowledge Base', status: 'operational', endpoint: '/api/knowledge' },
      { name: 'Search', status: 'operational', endpoint: '/api/search' },
      { name: 'WebSocket', status: 'operational', endpoint: 'ws://' }
    ];

    res.json({ services });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/developer/quotas
 * Get API quotas and limits
 */
router.get('/quotas', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;

    // Get user's plan/tier
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('tier, ai_credits')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Define quotas based on tier
    const quotas = {
      Free: {
        apiCallsPerDay: 100,
        aiCredits: 50,
        storageGB: 1,
        customAgents: 3
      },
      Pro: {
        apiCallsPerDay: 1000,
        aiCredits: 500,
        storageGB: 10,
        customAgents: 20
      },
      Enterprise: {
        apiCallsPerDay: 10000,
        aiCredits: 5000,
        storageGB: 100,
        customAgents: -1 // unlimited
      }
    };

    const currentQuota = quotas[user.tier as keyof typeof quotas] || quotas.Free;

    // Get current usage
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('timestamp', today);

    res.json({
      tier: user.tier,
      quotas: currentQuota,
      currentUsage: {
        apiCallsToday: count || 0,
        aiCredits: user.ai_credits,
        percentUsed: {
          apiCalls: ((count || 0) / currentQuota.apiCallsPerDay) * 100,
          aiCredits: (user.ai_credits / currentQuota.aiCredits) * 100
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
