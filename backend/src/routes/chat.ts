import { Router } from 'express';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { supabase } from '../services/supabase.js';

const router = Router();
router.use(verifyAuth);

/**
 * GET /api/chat/channels
 * Get all available chat channels
 */
router.get('/channels', async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('chat_channels')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ channels: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/channels
 * Create a new chat channel
 * 
 * Body:
 * {
 *   "name": "General",
 *   "description": "General discussion",
 *   "isPrivate": false
 * }
 */
router.post('/channels', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { name, description, isPrivate = false } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Channel name is required'
      });
    }

    const { data, error } = await supabase
      .from('chat_channels')
      .insert({
        name,
        description,
        is_private: isPrivate,
        created_by: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ channel: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/chat/channels/:channelId/messages
 * Get messages from a channel
 */
router.get('/channels/:channelId/messages', async (req: AuthenticatedRequest, res) => {
  try {
    const { channelId } = req.params;
    const { limit = 100, before } = req.query;

    let query = supabase
      .from('chat_messages')
      .select('*, user:users(id, name, email)')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Reverse to get chronological order
    res.json({ messages: (data || []).reverse() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/channels/:channelId/messages
 * Send a message to a channel
 * 
 * Body:
 * {
 *   "content": "Hello world!",
 *   "type": "text" | "image" | "file"
 * }
 */
router.post('/channels/:channelId/messages', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { channelId } = req.params;
    const { content, type = 'text', metadata } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Message content is required'
      });
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        channel_id: channelId,
        user_id: userId,
        content,
        type,
        metadata,
        created_at: new Date().toISOString()
      })
      .select('*, user:users(id, name, email)')
      .single();

    if (error) throw error;
    res.json({ message: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/chat/messages/:messageId
 * Delete a message
 */
router.delete('/messages/:messageId', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ message: 'Message deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/chat/direct-messages
 * Get direct message conversations
 */
router.get('/direct-messages', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('direct_messages')
      .select('*, recipient:users!recipient_id(id, name, email), sender:users!sender_id(id, name, email)')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ conversations: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/direct-messages
 * Send a direct message
 * 
 * Body:
 * {
 *   "recipientId": "uuid",
 *   "content": "Hello!"
 * }
 */
router.post('/direct-messages', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({
        error: 'Recipient ID and content are required'
      });
    }

    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: userId,
        recipient_id: recipientId,
        content,
        created_at: new Date().toISOString()
      })
      .select('*, recipient:users!recipient_id(id, name, email)')
      .single();

    if (error) throw error;
    res.json({ message: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/chat/online-users
 * Get list of currently online users
 */
router.get('/online-users', async (req: AuthenticatedRequest, res) => {
  try {
    // This would typically integrate with WebSocket presence tracking
    // For now, return users who have been active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('user_presence')
      .select('user_id, users(id, name, email)')
      .gte('last_seen', fiveMinutesAgo);

    if (error) throw error;
    res.json({ onlineUsers: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/presence
 * Update user's presence/online status
 */
router.post('/presence', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { status = 'online' } = req.body;

    const { data, error } = await supabase
      .from('user_presence')
      .upsert({
        user_id: userId,
        status,
        last_seen: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ presence: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
