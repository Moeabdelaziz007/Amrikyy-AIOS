import { Router } from 'express';
import { supabase } from '../services/supabaseClient.js';

const router = Router();

router.post('/preferences', async (req, res) => {
  try {
    const { theme, layout } = req.body;
    const userId = req.user?.id || 'default-user'; // In real app, get from auth

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        theme,
        layout,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

router.get('/preferences', async (req, res) => {
  try {
    const userId = req.user?.id || 'default-user';

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json(data || { theme: 'quantum', layout: 'default' });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

export default router;
