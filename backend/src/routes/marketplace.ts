import { Router } from 'express';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { supabase } from '../services/supabase.js';

const router = Router();
router.use(verifyAuth);

/**
 * GET /api/marketplace/listings
 * Get all marketplace listings
 */
router.get('/listings', async (req: AuthenticatedRequest, res) => {
  try {
    const { category, search, minPrice, maxPrice, limit = 50 } = req.query;

    let query = supabase
      .from('marketplace_listings')
      .select('*, seller:users(id, name, email)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (minPrice) {
      query = query.gte('price', Number(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', Number(maxPrice));
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json({ listings: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/marketplace/listings
 * Create a new marketplace listing
 * 
 * Body:
 * {
 *   "title": "My Agent",
 *   "description": "Agent description",
 *   "price": 100,
 *   "category": "Productivity",
 *   "itemType": "agent" | "workflow",
 *   "itemData": {...}
 * }
 */
router.post('/listings', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { title, description, price, category, itemType, itemData } = req.body;

    if (!title || !price || !category || !itemType) {
      return res.status(400).json({
        error: 'Title, price, category, and itemType are required'
      });
    }

    const { data, error } = await supabase
      .from('marketplace_listings')
      .insert({
        seller_id: userId,
        title,
        description,
        price,
        category,
        item_type: itemType,
        item_data: itemData,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ listing: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/marketplace/listings/:id
 * Get a specific listing
 */
router.get('/listings/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*, seller:users(id, name, email)')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json({ listing: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/marketplace/purchase
 * Purchase an item from the marketplace
 * 
 * Body:
 * {
 *   "listingId": "uuid"
 * }
 */
router.post('/purchase', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({
        error: 'Listing ID is required'
      });
    }

    // Get listing details
    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('id', listingId)
      .eq('status', 'active')
      .single();

    if (listingError) throw listingError;

    if (listing.seller_id === userId) {
      return res.status(400).json({
        error: 'Cannot purchase your own listing'
      });
    }

    // Check buyer's balance
    const { data: buyer, error: buyerError } = await supabase
      .from('users')
      .select('ai_credits')
      .eq('id', userId)
      .single();

    if (buyerError) throw buyerError;

    if (buyer.ai_credits < listing.price) {
      return res.status(400).json({
        error: 'Insufficient AI Credits'
      });
    }

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('marketplace_transactions')
      .insert({
        buyer_id: userId,
        seller_id: listing.seller_id,
        listing_id: listingId,
        amount: listing.price,
        status: 'completed',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Update balances
    await supabase.rpc('transfer_credits', {
      from_user: userId,
      to_user: listing.seller_id,
      amount: listing.price
    });

    res.json({
      message: 'Purchase completed successfully',
      transaction
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/marketplace/my-listings
 * Get user's own listings
 */
router.get('/my-listings', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ listings: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/marketplace/my-purchases
 * Get user's purchase history
 */
router.get('/my-purchases', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('marketplace_transactions')
      .select('*, listing:marketplace_listings(*)')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ purchases: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/marketplace/listings/:id
 * Update a listing
 */
router.put('/listings/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, price, status } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from('marketplace_listings')
      .update(updateData)
      .eq('id', id)
      .eq('seller_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ listing: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
