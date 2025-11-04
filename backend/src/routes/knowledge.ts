// backend/src/routes/knowledge.ts

import { Router } from 'express';
import { supabase } from '../services/supabase.js';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(verifyAuth);

// GET /api/knowledge - List user's knowledge entries
router.get('/', async (req: AuthenticatedRequest, res) => {
 try {
   const userId = req.user.id;

   const { data, error } = await supabase
     .from('knowledge_base')
     .select('*')
     .eq('user_id', userId)
     .order('created_at', { ascending: false });

   if (error) throw error;
   res.json({ entries: data });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

// POST /api/knowledge - Create entry
router.post('/', async (req: AuthenticatedRequest, res) => {
 try {
   const userId = req.user.id;
   const { title, content, tags } = req.body;

   const { data, error } = await supabase
     .from('knowledge_base')
     .insert({
       user_id: userId,
       title,
       content,
       tags: tags || []
     })
     .select()
     .single();

   if (error) throw error;
   res.json({ entry: data });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

// PUT /api/knowledge/:id - Update entry
router.put('/:id', async (req: AuthenticatedRequest, res) => {
 try {
   const userId = req.user.id;
   const { id } = req.params;
   const { title, content, tags } = req.body;

   const { data, error } = await supabase
     .from('knowledge_base')
     .update({ title, content, tags })
     .eq('id', id)
     .eq('user_id', userId)
     .select()
     .single();

   if (error) throw error;
   res.json({ entry: data });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

// DELETE /api/knowledge/:id
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
 try {
   const userId = req.user.id;
   const { id } = req.params;

   const { error } = await supabase
     .from('knowledge_base')
     .delete()
     .eq('id', id)
     .eq('user_id', userId);

   if (error) throw error;
   res.json({ message: 'Deleted successfully' });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

// GET /api/knowledge/search - Search entries
router.get('/search', async (req: AuthenticatedRequest, res) => {
 try {
   const userId = req.user.id;
   const { q } = req.query;

   const { data, error } = await supabase
     .from('knowledge_base')
     .select('*')
     .eq('user_id', userId)
     .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
     .order('created_at', { ascending: false });

   if (error) throw error;
   res.json({ entries: data });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

export default router;
