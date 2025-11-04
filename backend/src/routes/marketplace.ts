// backend/src/routes/marketplace.ts
import { Router } from 'express';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';
import * as marketplaceService from '../services/marketplaceService.js';

const router = Router();
router.use(verifyAuth);

// GET /api/marketplace/store/agents
router.get('/store/agents', async (req, res) => {
    try {
        const agents = await marketplaceService.getStoreAgents();
        res.json({ agents });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/marketplace/listings
router.get('/listings', async (req, res) => {
    try {
        const listings = await marketplaceService.getMarketplaceListings();
        res.json({ listings });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/marketplace/listings
router.post('/listings', async (req: AuthenticatedRequest, res) => {
    try {
        const newListing = await marketplaceService.createListing(req.user.id, req.body);
        res.status(201).json(newListing);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/marketplace/purchase
router.post('/purchase', async (req: AuthenticatedRequest, res) => {
    try {
        const { listingId, amount } = req.body;
        const transaction = await marketplaceService.purchaseListing(req.user.id, listingId, amount);
        res.status(201).json(transaction);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
