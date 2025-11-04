import { Router } from 'express';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { gmailService } from '../services/gmailService.js';
import { supabase } from '../services/supabase.js';

const router = Router();
router.use(verifyAuth);

// GET /api/gmail/auth-url
router.get('/auth-url', (req: AuthenticatedRequest, res) => {
 const authUrl = gmailService.getAuthUrl(req.user.id);
 res.json({ authUrl });
});

// POST /api/gmail/callback
router.post('/callback', async (req: AuthenticatedRequest, res) => {
 try {
   const { code } = req.body;
   const tokens = await gmailService.getTokens(code);

   // Store tokens in user_integrations table
   await supabase
     .from('user_integrations')
     .upsert({
       user_id: req.user.id,
       service: 'gmail',
       access_token: tokens.access_token,
       refresh_token: tokens.refresh_token,
       expires_at: new Date(Date.now() + (tokens.expiry_date || 3600000))
     });

   res.json({ message: 'Gmail connected successfully' });
 } catch (error: any) {
   res.status(400).json({ error: error.message });
 }
});

// POST /api/gmail/send
router.post('/send', async (req: AuthenticatedRequest, res) => {
 try {
   const { to, subject, body } = req.body;

   // Get user's Gmail token
   const { data } = await supabase
     .from('user_integrations')
     .select('access_token')
     .eq('user_id', req.user.id)
     .eq('service', 'gmail')
     .single();

   if (!data) {
     return res.status(401).json({ error: 'Gmail not connected' });
   }

   await gmailService.sendEmail(data.access_token, to, subject, body);
   res.json({ message: 'Email sent successfully' });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

// GET /api/gmail/emails
router.get('/emails', async (req: AuthenticatedRequest, res) => {
 try {
   const { data } = await supabase
     .from('user_integrations')
     .select('access_token')
     .eq('user_id', req.user.id)
     .eq('service', 'gmail')
     .single();

   if (!data) {
     return res.status(401).json({ error: 'Gmail not connected' });
   }

   const emails = await gmailService.listEmails(data.access_token);
   res.json({ emails });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

export default router;