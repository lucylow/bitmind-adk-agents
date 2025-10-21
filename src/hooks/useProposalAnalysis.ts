// src/hooks/useProposalAnalysis.ts
import { useState, useCallback } from 'react';
import { agentApiService, AgentResponse } from '../services/AgentApiService';
import { toast } from 'sonner';

export interface ProposalAnalysisState {
  data: any | null;
  loading: boolean;
  error: string | null;
  cached: boolean;
}

export interface UseProposalAnalysisReturn {
  analysis: ProposalAnalysisState;
  recommendation: ProposalAnalysisState;
  analyzeProposal: (proposalId: string, daoAddress?: string, force?: boolean) => Promise<void>;
  getRecommendation: (proposalId: string) => Promise<void>;
  clearAnalysis: () => void;
  clearRecommendation: () => void;
}

export function useProposalAnalysis(): UseProposalAnalysisReturn {
  const [analysis, setAnalysis] = useState<ProposalAnalysisState>({
    data: null,
    loading: false,
    error: null,
    cached: false
  });

  const [recommendation, setRecommendation] = useState<ProposalAnalysisState>({
    data: null,
    loading: false,
    error: null,
    cached: false
  });

  /**
   * Analyze a proposal
   */
  const analyzeProposal = useCallback(async (
    proposalId: string,
    daoAddress?: string,
    force = false
  ) => {
    setAnalysis(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response: AgentResponse = await agentApiService.analyzeProposal(
        proposalId,
        daoAddress,
        force
      );

      if (response.success) {
        setAnalysis({
          data: response.data,
          loading: false,
          error: null,
          cached: response.cached || false
        });

        if (response.cached) {
          toast.info('Using cached analysis');
        } else {
          toast.success('Proposal analysis complete');
        }
      } else {
        throw new Error(response.error || 'Failed to analyze proposal');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze proposal';
      setAnalysis({
        data: null,
        loading: false,
        error: errorMessage,
        cached: false
      });
      toast.error(errorMessage);
      console.error('Error analyzing proposal:', err);
    }
  }, []);

  /**
   * Get voting recommendation
   */
  const getRecommendation = useCallback(async (proposalId: string) => {
    setRecommendation(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response: AgentResponse = await agentApiService.getVotingRecommendation(proposalId);

      if (response.success) {
        setRecommendation({
          data: response.data,
          loading: false,
          error: null,
          cached: false
        });
        toast.success('Recommendation generated');
      } else {
        throw new Error(response.error || 'Failed to get recommendation');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recommendation';
      setRecommendation({
        data: null,
        loading: false,
        error: errorMessage,
        cached: false
      });
      toast.error(errorMessage);
      console.error('Error getting recommendation:', err);
    }
  }, []);

  /**
   * Clear analysis data
   */
  const clearAnalysis = useCallback(() => {
    setAnalysis({
      data: null,
      loading: false,
      error: null,
      cached: false
    });
  }, []);

  /**
   * Clear recommendation data
   */
  const clearRecommendation = useCallback(() => {
    setRecommendation({
      data: null,
      loading: false,
      error: null,
      cached: false
    });
  }, []);

  return {
    analysis,
    recommendation,
    analyzeProposal,
    getRecommendation,
    clearAnalysis,
    clearRecommendation
  };
}

