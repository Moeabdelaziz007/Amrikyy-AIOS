import { Router } from 'express';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { calendarService } from '../services/calendarService.js';
import { supabase } from '../services/supabase.js';

const router = Router();
router.use(verifyAuth);

// POST /api/calendar/events
router.post('/events', async (req: AuthenticatedRequest, res) => {
 try {
   const { summary, description, startTime, endTime, attendees } = req.body;

   const { data } = await supabase
     .from('user_integrations')
     .select('access_token')
     .eq('user_id', req.user.id)
     .eq('service', 'google')
     .single();

   if (!data) {
     return res.status(401).json({ error: 'Google Calendar not connected' });
   }

   const event = await calendarService.createEvent(
     data.access_token,
     summary,
     description,
     startTime,
     endTime,
     attendees
   );

   res.json({ event });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

// GET /api/calendar/events
router.get('/events', async (req: AuthenticatedRequest, res) => {
 try {
   const { data } = await supabase
     .from('user_integrations')
     .select('access_token')
     .eq('user_id', req.user.id)
     .eq('service', 'google')
     .single();

   if (!data) {
     return res.status(401).json({ error: 'Google Calendar not connected' });
   }

   const events = await calendarService.listEvents(data.access_token);
   res.json({ events });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

// DELETE /api/calendar/events/:id
router.delete('/events/:id', async (req: AuthenticatedRequest, res) => {
 try {
   const { data } = await supabase
     .from('user_integrations')
     .select('access_token')
     .eq('user_id', req.user.id)
     .eq('service', 'google')
     .single();

   if (!data) {
     return res.status(401).json({ error: 'Google Calendar not connected' });
   }

   await calendarService.deleteEvent(data.access_token, req.params.id);
   res.json({ message: 'Event deleted' });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

// GET /api/calendar/auth-url
router.get('/auth-url', (req: AuthenticatedRequest, res) => {
  const authUrl = calendarService.getAuthUrl(req.user.id);
  res.json({ authUrl });
});

// POST /api/calendar/callback
router.post('/callback', async (req: AuthenticatedRequest, res) => {
  try {
    const { code } = req.body;
    const tokens = await calendarService.getTokens(code);

    await supabase
      .from('user_integrations')
      .upsert({
        user_id: req.user.id,
        service: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + (tokens.expiry_date || 3600000))
      });

    res.json({ message: 'Google Calendar connected successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/calendar/status
router.get('/status', async (req: AuthenticatedRequest, res) => {
  try {
    const { data } = await supabase
      .from('user_integrations')
      .select('access_token')
      .eq('user_id', req.user.id)
      .eq('service', 'google')
      .single();

    if (data) {
      res.json({ connected: true, email: 'user@example.com' }); // Placeholder
    } else {
      res.json({ connected: false });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/calendar/disconnect
router.post('/disconnect', async (req: AuthenticatedRequest, res) => {
  try {
    await supabase
      .from('user_integrations')
      .delete()
      .eq('user_id', req.user.id)
      .eq('service', 'google');

    res.json({ message: 'Google Calendar disconnected successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;