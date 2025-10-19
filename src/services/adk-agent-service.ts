/**
 * ADK Agent Service Integration
 * Provides access to ADK-TS agents from the frontend
 */

import { managerOrchestrator } from '../adk-agents/agents/manager-orchestrator';
import { proposalAnalystAgent } from '../adk-agents/agents/proposal-analyst.agent';
import { treasuryMonitorAgent } from '../adk-agents/agents/treasury-monitor.agent';
import { votingStrategistAgent } from '../adk-agents/agents/voting-strategist.agent';
import { auditLogger } from '../adk-agents/audit/audit-schema';

export interface GovernanceAnalysisRequest {
  proposalId: string;
  daoAddress: string;
  userPreferences?: Record<string, unknown>;
  userAddress?: string;
}

export interface GovernanceAnalysisResponse {
  success: boolean;
  data?: any;
  error?: string;
  runId?: string;
}

/**
 * Analyze a DAO proposal using the ADK agent system
 */
export async function analyzeProposal(
  request: GovernanceAnalysisRequest
): Promise<GovernanceAnalysisResponse> {
  try {
    const result = await managerOrchestrator.runFullGovernanceFlow(
      request.proposalId,
      request.daoAddress,
      {
        preferences: request.userPreferences || {},
        address: request.userAddress || '0x0',
      }
    );

    return {
      success: true,
      data: result,
      runId: result.runId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get audit logs for a specific agent or all agents
 */
export function getAuditLogs(agentId?: string) {
  if (agentId) {
    return auditLogger.getLogs({ agentId });
  }
  return auditLogger.getLogs();
}

/**
 * Get a specific audit log by ID
 */
export function getAuditLog(logId: string) {
  return auditLogger.getLog(logId);
}

/**
 * Analyze treasury health
 */
export async function analyzeTreasuryHealth(daoAddress: string) {
  try {
    const status = await treasuryMonitorAgent.monitor(daoAddress);
    return {
      success: true,
      data: status,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyze a proposal in detail
 */
export async function analyzeProposalDetails(proposalId: string, daoAddress: string) {
  try {
    const analysis = await proposalAnalystAgent.analyze(proposalId, daoAddress);
    return {
      success: true,
      data: analysis,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate voting recommendation
 */
export async function generateVotingRecommendation(
  proposalId: string,
  analysis: any
) {
  try {
    const recommendation = await votingStrategistAgent.generateRecommendation(
      proposalId,
      analysis
    );
    return {
      success: true,
      data: recommendation,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

