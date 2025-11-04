// backend/src/routes/auth.ts - Complete Implementation

import { Router } from 'express';
import { supabase } from '../services/supabase.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
 try {
   const { email, password, fullName } = req.body;

   const { data, error } = await supabase.auth.signUp({
     email,
     password,
     options: {
       data: { full_name: fullName }
     }
   });

   if (error) throw error;
   res.json({ user: data.user, session: data.session });
 } catch (error: any) {
   res.status(400).json({ error: error.message });
 }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
 try {
   const { email, password } = req.body;

   const { data, error } = await supabase.auth.signInWithPassword({
     email,
     password
   });

   if (error) throw error;
   res.json({ user: data.user, session: data.session });
 } catch (error: any) {
   res.status(400).json({ error: error.message });
 }
});

// POST /api/auth/signout
router.post('/signout', async (req, res) => {
 try {
   const { error } = await supabase.auth.signOut();
   if (error) throw error;
   res.json({ message: 'Signed out successfully' });
 } catch (error: any) {
   res.status(400).json({ error: error.message });
 }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
 try {
   const token = req.headers.authorization?.replace('Bearer ', '');
   if (!token) return res.status(401).json({ error: 'No token provided' });

   const { data: { user }, error } = await supabase.auth.getUser(token);
   if (error) throw error;

   res.json({ user });
 } catch (error: any) {
   res.status(401).json({ error: error.message });
 }
});

export default router;