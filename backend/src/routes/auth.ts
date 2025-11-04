import { Router } from "express";
import { supabase } from "../services/supabase.js";
import { verifyAuth, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

router.get("/profile", verifyAuth, async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", req.user.id)
    .single();
  if (error) return res.status(400).json({ error });
  res.json({ user: data });
});

router.put("/profile", verifyAuth, async (req: AuthenticatedRequest, res) => {
    try {
        const { display_name, avatar_url } = req.body;

        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: req.user.id,
                display_name,
                avatar_url,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ profile: data });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;
