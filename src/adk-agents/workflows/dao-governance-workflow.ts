/**
 * DAO Governance Workflow
 * Orchestrates multi-agent collaboration for comprehensive governance analysis
 */

import { Workflow } from '../core/workflow';
import { proposalAnalystAgentADK } from '../agents/proposal-analyst-adk.agent';
import { votingStrategistAgentADK, generateRecommendation } from '../agents/voting-strategist-adk.agent';
import { treasuryMonitorAgentADK, assessTreasuryHealth } from '../agents/treasury-monitor-adk.agent';
import { auditLogger } from '../audit/audit-schema';

export interface GovernanceWorkflowInput {
  proposalId: string;
  daoAddress: string;
  userAddress: string;
  userPreferences?: Record<string, unknown>;
}

export interface GovernanceWorkflowOutput {
  runId: string;
  status: 'COMPLETED' | 'AWAITING_APPROVAL' | 'FAILED';
  proposalAnalysis: any;
  treasuryStatus: any;
  votingRecommendation: any;
  explainability: {
    topReasons: string[];
    confidence: number;
    riskFactors: string[];
    alternativeViews: string[];
  };
  approvalRequired: boolean;
  approvalPayload?: any;
  timestamp: Date;
}

export class DAOGovernanceWorkflow extends Workflow {
  constructor() {
    super('dao-governance-workflow', 'DAO Governance Analysis Workflow');
  }

  async execute(input: GovernanceWorkflowInput): Promise<GovernanceWorkflowOutput> {
    const runId = `governance-${Date.now()}`;
    console.log(`\n🚀 Starting DAO Governance Workflow ${runId}\n`);

    try {
      // ==================== STEP 1: PARALLEL DATA GATHERING ====================
      console.log('📊 Step 1: Gathering proposal and treasury data in parallel...');
      
      const [proposalAnalysisResult, treasuryStatusResult] = await this.executeParallel([
        {
          name: 'Analyze Proposal',
          execute: async () => {
            console.log('  → Analyzing proposal...');
            return proposalAnalystAgentADK.run(
              `Analyze proposal ${input.proposalId} for DAO at ${input.daoAddress}. Provide comprehensive analysis of financial impact, security risks, and community sentiment.`,
              { proposalId: input.proposalId, daoAddress: input.daoAddress }
            );
          },
        },
        {
          name: 'Monitor Treasury',
          execute: async () => {
            console.log('  → Monitoring treasury health...');
            return assessTreasuryHealth(input.daoAddress);
          },
        },
      ]);

      console.log('✅ Step 1 completed\n');

      // ==================== STEP 2: GENERATE VOTING RECOMMENDATION ====================
      console.log('🎯 Step 2: Generating personalized voting recommendation...');
      
      const votingRecommendationResult = await votingStrategistAgentADK.run(
        `Generate a personalized voting recommendation for proposal ${input.proposalId} based on the analysis and user preferences.`,
        {
          proposalId: input.proposalId,
          userAddress: input.userAddress,
          proposalAnalysis: proposalAnalysisResult,
          treasuryStatus: treasuryStatusResult,
          userPreferences: input.userPreferences,
        }
      );

      console.log('✅ Step 2 completed\n');

      // ==================== STEP 3: GENERATE EXPLAINABILITY ====================
      console.log('📝 Step 3: Generating explainability report...');
      
      const explainability = this.generateExplainability(
        proposalAnalysisResult,
        votingRecommendationResult,
        treasuryStatusResult
      );

      console.log('✅ Step 3 completed\n');

      // ==================== STEP 4: DETERMINE APPROVAL REQUIREMENTS ====================
      console.log('🔒 Step 4: Checking approval requirements...');
      
      const approvalRequired = this.requiresApproval(
        proposalAnalysisResult,
        votingRecommendationResult
      );

      console.log(`  Approval required: ${approvalRequired ? 'YES' : 'NO'}`);
      console.log('✅ Step 4 completed\n');

      // ==================== CONSTRUCT RESULT ====================
      const result: GovernanceWorkflowOutput = {
        runId,
        status: approvalRequired ? 'AWAITING_APPROVAL' : 'COMPLETED',
        proposalAnalysis: proposalAnalysisResult,
        treasuryStatus: treasuryStatusResult,
        votingRecommendation: votingRecommendationResult,
        explainability,
        approvalRequired,
        approvalPayload: approvalRequired ? {
          runId,
          proposalId: input.proposalId,
          userAddress: input.userAddress,
          recommendation: votingRecommendationResult.output,
          timestamp: new Date(),
        } : undefined,
        timestamp: new Date(),
      };

      // Log successful completion
      auditLogger.log({
        agentId: this.workflowId,
        agentName: this.workflowName,
        actionType: 'AGENT_RUN',
        inputs: input as any,
        outputs: result as any,
        modelVersion: '1.0.0',
        status: 'SUCCESS',
      });

      console.log(`✨ Workflow ${runId} completed successfully!\n`);
      return result;

    } catch (error) {
      console.error(`❌ Workflow ${runId} failed:`, error);
      
      auditLogger.log({
        agentId: this.workflowId,
        agentName: this.workflowName,
        actionType: 'AGENT_RUN',
        inputs: input as any,
        modelVersion: '1.0.0',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  private generateExplainability(
    proposalAnalysis: any,
    votingRecommendation: any,
    treasuryStatus: any
  ) {
    const topReasons: string[] = [];
    const riskFactors: string[] = [];
    const alternativeViews: string[] = [];

    // Extract reasoning from voting recommendation
    if (votingRecommendation.output?.reasoning) {
      topReasons.push(...(votingRecommendation.output.reasoning.slice(0, 3) as string[]));
    }

    // Extract risk factors
    if (proposalAnalysis.output?.securityAnalysis?.concerns) {
      riskFactors.push(...(proposalAnalysis.output.securityAnalysis.concerns as string[]));
    }

    // Generate alternative views
    if (votingRecommendation.output?.alternativeViews) {
      alternativeViews.push(...(votingRecommendation.output.alternativeViews as string[]));
    }

    return {
      topReasons,
      confidence: votingRecommendation.output?.confidence || 0.5,
      riskFactors,
      alternativeViews,
    };
  }

  private requiresApproval(proposalAnalysis: any, votingRecommendation: any): boolean {
    // Require approval if:
    // 1. Low confidence recommendation (< 0.9)
    // 2. High security risk
    // 3. High financial risk

    const confidence = votingRecommendation.output?.confidence || 0;
    const securityRisk = proposalAnalysis.output?.securityAnalysis?.riskLevel || 'LOW';
    const financialRisk = proposalAnalysis.output?.financialImpact?.riskScore || 0;

    return (
      confidence < 0.9 ||
      securityRisk === 'HIGH' ||
      financialRisk > 0.7
    );
  }
}

// Create singleton workflow instance
export const daoGovernanceWorkflow = new DAOGovernanceWorkflow();

// Convenience function for running the workflow
export async function runGovernanceAnalysis(
  proposalId: string,
  daoAddress: string,
  userAddress: string,
  userPreferences?: Record<string, unknown>
): Promise<GovernanceWorkflowOutput> {
  return daoGovernanceWorkflow.execute({
    proposalId,
    daoAddress,
    userAddress,
    userPreferences,
  });
}

// Example usage
export const WORKFLOW_EXAMPLES = {
  basic: `
import { runGovernanceAnalysis } from './workflows/dao-governance-workflow';

const result = await runGovernanceAnalysis(
  'prop-001',
  'SP2X...DAO',
  'SP2X...USER'
);

console.log('Recommendation:', result.votingRecommendation);
console.log('Approval Required:', result.approvalRequired);
  `,
  
  withPreferences: `
const result = await runGovernanceAnalysis(
  'prop-001',
  'SP2X...DAO',
  'SP2X...USER',
  {
    riskTolerance: 'conservative',
    focusAreas: ['treasury', 'security'],
    votingStyle: 'data-driven'
  }
);
  `,
  
  batchProcessing: `
// Process multiple proposals in parallel
const proposals = ['prop-001', 'prop-002', 'prop-003'];
const results = await Promise.all(
  proposals.map(id => 
    runGovernanceAnalysis(id, daoAddress, userAddress)
  )
);

// Filter high-priority items
const needsReview = results.filter(r => r.approvalRequired);
  `,
};

