// backend/src/services/marketplaceService.ts
import { supabase } from './supabase.js';

export const getStoreAgents = async () => {
    const { data, error } = await supabase.from('store_agents').select('*');
    if (error) throw error;
    return data;
};

export const getMarketplaceListings = async () => {
    const { data, error } = await supabase.from('marketplace_listings').select('*');
    if (error) throw error;
    return data;
};

export const createListing = async (sellerId: string, listingData: any) => {
    const { data, error } = await supabase
        .from('marketplace_listings')
        .insert({ seller_id: sellerId, ...listingData })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const purchaseListing = async (buyerId: string, listingId: string, amount: number) => {
    const { data, error } = await supabase
        .from('marketplace_transactions')
        .insert({ buyer_id: buyerId, listing_id: listingId, amount })
        .select()
        .single();
    if (error) throw error;
    return data;
};
