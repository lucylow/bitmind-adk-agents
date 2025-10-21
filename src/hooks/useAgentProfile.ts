// src/hooks/useAgentProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { agentApiService, UserProfile, AgentResponse } from '../services/AgentApiService';
import { toast } from 'sonner';

export interface UseAgentProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  updatePreferences: (preferences: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAgentProfile(walletAddress: string | null): UseAgentProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user profile
   */
  const loadProfile = useCallback(async () => {
    if (!walletAddress) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: AgentResponse = await agentApiService.getUserProfile();

      if (response.success) {
        setProfile(response.data);
      } else {
        throw new Error(response.error || 'Failed to load profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  /**
   * Update user preferences
   */
  const updatePreferences = useCallback(async (preferences: any) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: AgentResponse = await agentApiService.updateUserPreferences(preferences);

      if (response.success) {
        setProfile(prev => prev ? { ...prev, preferences: response.data } : null);
        toast.success('Preferences updated successfully');
      } else {
        throw new Error(response.error || 'Failed to update preferences');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error updating preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  /**
   * Refresh profile data
   */
  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  // Load profile on wallet change
  useEffect(() => {
    if (walletAddress) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [walletAddress, loadProfile]);

  return {
    profile,
    loading,
    error,
    loadProfile,
    updatePreferences,
    refreshProfile
  };
}

