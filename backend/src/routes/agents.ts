// backend/src/routes/agents.ts

import { Router } from 'express';
import { supabase } from '../services/supabase.js';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
router.use(verifyAuth);

// GET /api/agents
router.get('/', async (req: AuthenticatedRequest, res) => {
 try {
   const userId = req.user.id;

   const { data, error } = await supabase
     .from('agents')
     .select('*')
     .eq('user_id', userId)
     .order('created_at', { ascending: false });

   if (error) throw error;
   res.json({ agents: data });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

// POST /api/agents
router.post('/', async (req: AuthenticatedRequest, res) => {
 try {
   const userId = req.user.id;
   const { name, role, icon, personality, skills } = req.body;

   const { data, error } = await supabase
     .from('agents')
     .insert({
       user_id: userId,
       name,
       role,
       icon,
       personality,
       skill_ids: skills || []
     })
     .select()
     .single();

   if (error) throw error;
   res.json({ agent: data });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

// PUT /api/agents/:id
router.put('/:id', async (req: AuthenticatedRequest, res) => {
 try {
   const userId = req.user.id;
   const { id } = req.params;
   const { name, role, icon, personality, skills } = req.body;

   const { data, error } = await supabase
     .from('agents')
     .update({
       name,
       role,
       icon,
       personality,
       skill_ids: skills
     })
     .eq('id', id)
     .eq('user_id', userId)
     .select()
     .single();

   if (error) throw error;
   res.json({ agent: data });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

// DELETE /api/agents/:id
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
 try {
   const userId = req.user.id;
   const { id } = req.params;

   const { error } = await supabase
     .from('agents')
     .delete()
     .eq('id', id)
     .eq('user_id', userId);

   if (error) throw error;
   res.json({ message: 'Agent deleted' });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

export default router;
