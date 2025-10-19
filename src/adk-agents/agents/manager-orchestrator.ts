import { z } from 'zod';
import { guardrailManager } from '../guardrail-manager';
import { proposalAnalystAgent } from './proposal-analyst.agent';
import { treasuryMonitorAgent } from './treasury-monitor.agent';
import { votingStrategistAgent } from './voting-strategist.agent';
import { auditLogger } from '../audit/audit-schema';

export const GovernanceFlowResultSchema = z.object({
  runId: z.string(),
  status: z.enum(['COMPLETED', 'AWAITING_APPROVAL', 'FAILED']),
  proposalAnalysis: z.object({
    proposalId: z.string(),
    proposal: z.object({
      title: z.string(),
      description: z.string(),
      status: z.string(),
    }),
    financialImpact: z.object({
      estimatedCost: z.number(),
      treasuryImpact: z.number(),
      riskScore: z.number(),
    }),
    securityAnalysis: z.object({
      riskLevel: z.string(),
      concerns: z.array(z.string()),
    }),
    summary: z.string(),
  }),
  treasuryStatus: z.object({
    totalValue: z.number(),
    tokens: z.array(z.object({
      symbol: z.string(),
      balance: z.number(),
      value: z.number(),
      percentage: z.number(),
    })),
    healthScore: z.number(),
    alerts: z.array(z.string()),
  }),
  votingRecommendation: z.object({
    recommendation: z.enum(['FOR', 'AGAINST', 'ABSTAIN']),
    confidence: z.number(),
    reasoning: z.array(z.string()),
    riskAssessment: z.string(),
    alternativeViews: z.array(z.string()),
  }),
  explainability: z.object({
    topReasons: z.array(z.string()),
    confidence: z.number(),
    similarProposals: z.array(z.string()),
  }),
  approvalRequired: z.boolean(),
  approvalPayload: z.any().optional(),
});

export type GovernanceFlowResult = z.infer<typeof GovernanceFlowResultSchema>;

export class ManagerOrchestrator {
  async runFullGovernanceFlow(
    proposalId: string,
    daoAddress: string,
    userContext: { preferences: Record<string, unknown>; address: string }
  ): Promise<GovernanceFlowResult> {
    const runId = `governance-flow-${Date.now()}`;

    try {
      // Step 1: Input validation
      const inputValidation = guardrailManager.runInputChecks(
        `Analyze proposal ${proposalId}`
      );

      if (!inputValidation.passed) {
        throw new Error(`Input validation failed: ${inputValidation.message}`);
      }

      // Step 2: Run ProposalAnalystAgent
      const proposalAnalysis = await proposalAnalystAgent.analyze(
        proposalId,
        daoAddress
      );

      // Step 3: Run TreasuryMonitorAgent
      const treasuryStatus = await treasuryMonitorAgent.monitor(daoAddress);

      // Step 4: Run VotingStrategistAgent
      const votingRecommendation = await votingStrategistAgent.generateRecommendation(
        proposalId,
        {
          financialImpact: {
            proposalId: proposalAnalysis.proposalId,
            estimatedCost: proposalAnalysis.financialImpact.estimatedCost,
            treasuryImpact: proposalAnalysis.financialImpact.treasuryImpact,
            riskScore: proposalAnalysis.financialImpact.riskScore,
            affectedTokens: [], // Placeholder, as this is not directly available from proposalAnalysis.financialImpact
          },
          securityRisk: proposalAnalysis.securityAnalysis,
          userPreferences: userContext.preferences,
        }
      );

      // Step 5: Generate explainability bundle
      const explainability = {
        topReasons: votingRecommendation.reasoning.slice(0, 3),
        confidence: votingRecommendation.confidence,
        similarProposals: [], // TODO: Implement similarity search
      };

      // Step 6: Determine if approval is required
      const requiresApproval =
        votingRecommendation.confidence < 0.9 ||
        proposalAnalysis.securityAnalysis.riskLevel === 'HIGH';

      const result: GovernanceFlowResult = {
        runId,
        status: requiresApproval ? 'AWAITING_APPROVAL' : 'COMPLETED',
        proposalAnalysis,
        treasuryStatus,
        votingRecommendation,
        explainability,
        approvalRequired: requiresApproval,
        approvalPayload: requiresApproval
          ? {
              runId,
              proposalId,
              recommendation: votingRecommendation.recommendation,
              confidence: votingRecommendation.confidence,
              requester: userContext.address,
            }
          : undefined,
      };

      // Log the full flow
      auditLogger.log({
        agentId: 'manager-orchestrator',
        agentName: 'ManagerOrchestrator',
        actionType: 'AGENT_RUN',
        inputs: { proposalId, daoAddress, userContext },
        outputs: result,
        modelVersion: '1.0.0',
        status: 'SUCCESS',
      });

      return result;
    } catch (error) {
      auditLogger.log({
        agentId: 'manager-orchestrator',
        agentName: 'ManagerOrchestrator',
        actionType: 'AGENT_RUN',
        inputs: { proposalId, daoAddress },
        modelVersion: '1.0.0',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }
}

export const managerOrchestrator = new ManagerOrchestrator();

