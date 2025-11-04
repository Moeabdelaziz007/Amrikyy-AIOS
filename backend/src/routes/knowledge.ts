import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { supabase } from '../services/supabase.js';

const router = Router();

// User profile endpoints (examples)
router.get('/user/profile', async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({ profile: data });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/user/profile', async (req: AuthenticatedRequest, res) => {
  try {
    const { display_name, avatar_url } = req.body;

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: req.user.id,
        display_name,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ profile: data });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
