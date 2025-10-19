import { useState, useCallback } from 'react';

/**
 * Hook for integrating ADK agents with React components
 * Handles loading states, errors, and agent responses
 */

export interface UseAdkAgentOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAdkAgent(options?: UseAdkAgentOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const analyzeProposal = useCallback(
    async (proposalId: string, daoAddress: string, userPreferences?: any) => {
      setLoading(true);
      setError(null);

      try {
        // Dynamically import the service to avoid build issues
        const { analyzeProposal: analyzeProposalService } = await import(
          '../services/adk-agent-service'
        );

        const result = await analyzeProposalService({
          proposalId,
          daoAddress,
          userPreferences,
          userAddress: '0x0',
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to analyze proposal');
        }

        setData(result.data);
        options?.onSuccess?.(result.data);
        return result.data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const analyzeTreasury = useCallback(
    async (daoAddress: string) => {
      setLoading(true);
      setError(null);

      try {
        const { analyzeTreasuryHealth } = await import(
          '../services/adk-agent-service'
        );

        const result = await analyzeTreasuryHealth(daoAddress);

        if (!result.success) {
          throw new Error(result.error || 'Failed to analyze treasury');
        }

        setData(result.data);
        options?.onSuccess?.(result.data);
        return result.data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const getAuditLogs = useCallback(async (agentId?: string) => {
    try {
      const { getAuditLogs: getAuditLogsService } = await import(
        '../services/adk-agent-service'
      );

      return getAuditLogsService(agentId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  return {
    loading,
    error,
    data,
    analyzeProposal,
    analyzeTreasury,
    getAuditLogs,
  };
}

