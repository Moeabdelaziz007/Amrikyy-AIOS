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

export default router;