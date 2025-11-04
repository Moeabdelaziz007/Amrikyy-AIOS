// @ts-nocheck
/**
 * User Profile Hook
 * React hook for managing user profile data
 */

import { useState, useEffect, useCallback } from 'react';
// import { firestoreService } from '@auraos/firebase/services/firestore.service';
// import type { UserProfile, UserPreferences } from '@auraos/firebase/types/user';

export function useUserProfile(user: any = null) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // const unsubscribe = firestoreService.user.subscribe(user.uid, (profileData) => {
    //   setProfile(profileData);
    //   setLoading(false);
    // });

    // return () => unsubscribe();
  }, [user]);

  // Update preferences
  const updatePreferences = useCallback(async (preferences: any) => {
    if (!user) return;

    try {
      // await firestoreService.user.updatePreferences(user.uid, preferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    }
  }, [user]);

  // Update profile
  const updateProfile = useCallback(async (data: any) => {
    if (!user) return;

    try {
      // await firestoreService.user.update(user.uid, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  }, [user]);

  // Track app usage
  const trackAppUsage = useCallback(async (appId: string) => {
    if (!user) return;

    try {
      // await firestoreService.user.trackAppUsage(user.uid, appId);
    } catch (err) {
      // logger.error('Failed to track app usage:', err);
    }
  }, [user]);

  return {
    profile,
    loading,
    error,
    updatePreferences,
    updateProfile,
    trackAppUsage,
  };
}