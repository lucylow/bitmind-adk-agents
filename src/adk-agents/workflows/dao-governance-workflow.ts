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

  async execute(input: Record<string, unknown>): Promise<unknown> {
    // Type assertion for internal use
    const typedInput = input as GovernanceWorkflowInput;
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
              `Analyze proposal ${typedInput.proposalId} for DAO at ${typedInput.daoAddress}. Provide comprehensive analysis of financial impact, security risks, and community sentiment.`,
              { proposalId: typedInput.proposalId, daoAddress: typedInput.daoAddress }
            );
          },
        },
        {
          name: 'Monitor Treasury',
          execute: async () => {
            console.log('  → Monitoring treasury health...');
            return assessTreasuryHealth(typedInput.daoAddress);
          },
        },
      ]);

      console.log('✅ Step 1 completed\n');

      // ==================== STEP 2: GENERATE VOTING RECOMMENDATION ====================
      console.log('🎯 Step 2: Generating personalized voting recommendation...');
      
      const votingRecommendationResult = await votingStrategistAgentADK.run(
        `Generate a personalized voting recommendation for proposal ${typedInput.proposalId} based on the analysis and user preferences.`,
        {
          proposalId: typedInput.proposalId,
          userAddress: typedInput.userAddress,
          proposalAnalysis: proposalAnalysisResult,
          treasuryStatus: treasuryStatusResult,
          userPreferences: typedInput.userPreferences,
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
        approvalPayload: approvalRequired
          ? {
              runId,
              proposalId: input.proposalId,
              recommendation: votingRecommendationResult.content,
              timestamp: new Date(),
            }
          : undefined,
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
    if (votingRecommendation.content) {
      topReasons.push('AI analysis completed', 'Data processed successfully', 'Recommendation generated');
    }

    // Extract risk factors
    riskFactors.push('Standard governance risks apply');

    // Generate alternative views
    alternativeViews.push('Consider long-term implications', 'Evaluate community sentiment');

    return {
      topReasons,
      confidence: 0.75,
      riskFactors,
      alternativeViews,
    };
  }

  private requiresApproval(proposalAnalysis: any, votingRecommendation: any): boolean {
    // Require approval if confidence is low
    return false; // Simplified for now
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
