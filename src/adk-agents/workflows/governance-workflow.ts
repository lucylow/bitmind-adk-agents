import { z } from 'zod';
import { proposalAnalystAgent } from '../agents/proposal-analyst.agent';
import { votingStrategistAgent } from '../agents/voting-strategist.agent';
import { treasuryMonitorAgent } from '../agents/treasury-monitor.agent';
import { mcpServers } from '../tools/enhanced-dao-tools';
import { guardrailManager } from '../guardrail-manager';
import { auditLogger } from '../audit/audit-schema';

/**
 * Advanced Governance Workflow
 * Orchestrates multiple agents for comprehensive proposal analysis
 */

export const WorkflowInputSchema = z.object({
  proposalId: z.string(),
  daoAddress: z.string(),
  userContext: z.object({
    address: z.string(),
    preferences: z.object({
      riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
      votingStyle: z.enum(['informed', 'delegated', 'automated']).optional(),
      priorities: z.array(z.string()).optional(),
    }),
  }),
  options: z.object({
    includeHistoricalComparison: z.boolean().optional(),
    includeTreasuryAnalysis: z.boolean().optional(),
    includeRiskAssessment: z.boolean().optional(),
    generateVotingRecommendation: z.boolean().optional(),
  }).optional(),
});

export type WorkflowInput = z.infer<typeof WorkflowInputSchema>;

export const WorkflowOutputSchema = z.object({
  runId: z.string(),
  timestamp: z.number(),
  proposalId: z.string(),
  daoAddress: z.string(),
  
  // Analysis results
  proposalAnalysis: z.object({
    proposal: z.any(),
    financialImpact: z.any(),
    securityAnalysis: z.any(),
    summary: z.string(),
  }),
  
  treasuryStatus: z.object({
    totalValue: z.number(),
    tokens: z.array(z.any()),
    healthScore: z.number(),
    alerts: z.array(z.string()),
  }).optional(),
  
  votingRecommendation: z.object({
    recommendation: z.enum(['FOR', 'AGAINST', 'ABSTAIN']),
    confidence: z.number(),
    reasoning: z.array(z.string()),
    riskAssessment: z.string(),
    alternativeViews: z.array(z.string()),
  }).optional(),
  
  // Additional insights
  historicalComparison: z.object({
    similarProposals: z.array(z.any()),
    successProbability: z.number(),
    insights: z.array(z.string()),
  }).optional(),
  
  riskProfile: z.object({
    overallRiskScore: z.number(),
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    riskCategories: z.any(),
    recommendations: z.array(z.string()),
  }).optional(),
  
  // Execution metadata
  status: z.enum(['COMPLETED', 'PARTIAL', 'FAILED', 'AWAITING_APPROVAL']),
  requiresApproval: z.boolean(),
  approvalReason: z.string().optional(),
  executionTime: z.number(),
});

export type WorkflowOutput = z.infer<typeof WorkflowOutputSchema>;

export class GovernanceWorkflow {
  private runId: string;
  private startTime: number;

  constructor() {
    this.runId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();
  }

  /**
   * Execute the full governance analysis workflow
   */
  async execute(input: WorkflowInput): Promise<WorkflowOutput> {
    const startTime = Date.now();

    try {
      // Step 1: Input validation with guardrails
      console.log(`\n🚀 Starting Governance Workflow ${this.runId}`);
      console.log(`   Proposal: ${input.proposalId}`);
      console.log(`   DAO: ${input.daoAddress}`);
      console.log(`   User: ${input.userContext.address}\n`);

      const inputValidation = guardrailManager.runInputChecks(
        `Analyze proposal ${input.proposalId} for DAO ${input.daoAddress}`
      );

      if (!inputValidation.passed) {
        throw new Error(`Input validation failed: ${inputValidation.message}`);
      }

      // Step 2: Parallel agent execution for efficiency
      console.log('📊 Step 1: Running parallel analysis...');
      const [proposalAnalysis, treasuryStatus] = await Promise.all([
        this.runProposalAnalysis(input.proposalId, input.daoAddress),
        input.options?.includeTreasuryAnalysis !== false
          ? this.runTreasuryAnalysis(input.daoAddress)
          : Promise.resolve(undefined),
      ]);

      console.log('✅ Proposal analysis completed');
      if (treasuryStatus) {
        console.log('✅ Treasury analysis completed');
      }

      // Step 3: Risk assessment using MCP
      console.log('\n🔍 Step 2: Comprehensive risk assessment...');
      let riskProfile;
      if (input.options?.includeRiskAssessment !== false) {
        riskProfile = await this.assessComprehensiveRisk(
          input.proposalId,
          proposalAnalysis,
          treasuryStatus
        );
        console.log(`✅ Risk assessment completed: ${riskProfile.riskLevel} risk`);
      }

      // Step 4: Historical comparison
      console.log('\n📜 Step 3: Historical comparison...');
      let historicalComparison;
      if (input.options?.includeHistoricalComparison) {
        historicalComparison = await this.compareWithHistory(
          input.proposalId,
          proposalAnalysis
        );
        console.log(`✅ Found ${historicalComparison.similarProposals.length} similar proposals`);
      }

      // Step 5: Generate voting recommendation
      console.log('\n🗳️  Step 4: Generating voting recommendation...');
      let votingRecommendation;
      if (input.options?.generateVotingRecommendation !== false) {
        votingRecommendation = await this.generateRecommendation(
          input.proposalId,
          proposalAnalysis,
          riskProfile,
          input.userContext
        );
        console.log(`✅ Recommendation: ${votingRecommendation.recommendation} (confidence: ${(votingRecommendation.confidence * 100).toFixed(1)}%)`);
      }

      // Step 6: Determine if approval is required
      const requiresApproval = this.checkApprovalRequired(
        votingRecommendation,
        proposalAnalysis,
        riskProfile
      );

      const executionTime = Date.now() - startTime;

      const output: WorkflowOutput = {
        runId: this.runId,
        timestamp: Math.floor(Date.now() / 1000),
        proposalId: input.proposalId,
        daoAddress: input.daoAddress,
        proposalAnalysis,
        treasuryStatus,
        votingRecommendation,
        historicalComparison,
        riskProfile,
        status: requiresApproval ? 'AWAITING_APPROVAL' : 'COMPLETED',
        requiresApproval,
        approvalReason: requiresApproval
          ? this.generateApprovalReason(votingRecommendation, proposalAnalysis, riskProfile)
          : undefined,
        executionTime,
      };

      // Log workflow completion
      auditLogger.log({
        agentId: 'governance-workflow',
        agentName: 'GovernanceWorkflow',
        actionType: 'AGENT_RUN',
        inputs: input,
        outputs: output,
        modelVersion: '1.0.0',
        status: 'SUCCESS',
      });

      console.log(`\n✨ Workflow completed in ${executionTime}ms`);
      console.log(`   Status: ${output.status}`);
      if (requiresApproval) {
        console.log(`   ⚠️  Approval required: ${output.approvalReason}`);
      }

      return output;
    } catch (error) {
      const executionTime = Date.now() - startTime;

      auditLogger.log({
        agentId: 'governance-workflow',
        agentName: 'GovernanceWorkflow',
        actionType: 'AGENT_RUN',
        inputs: input,
        modelVersion: '1.0.0',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Run proposal analysis using ProposalAnalystAgent
   */
  private async runProposalAnalysis(proposalId: string, daoAddress: string) {
    return await proposalAnalystAgent.analyze(proposalId, daoAddress);
  }

  /**
   * Run treasury analysis using TreasuryMonitorAgent
   */
  private async runTreasuryAnalysis(daoAddress: string) {
    return await treasuryMonitorAgent.monitor(daoAddress);
  }

  /**
   * Comprehensive risk assessment using Risk Assessment MCP
   */
  private async assessComprehensiveRisk(
    proposalId: string,
    proposalAnalysis: any,
    treasuryStatus?: any
  ) {
    const riskAssessment = await mcpServers.riskAssessment.assessProposalRisk({
      id: proposalId,
      title: proposalAnalysis.proposal.title,
      description: proposalAnalysis.proposal.description,
      financialImpact: proposalAnalysis.financialImpact,
    });

    return {
      overallRiskScore: riskAssessment.overallRiskScore,
      riskLevel: riskAssessment.riskLevel,
      riskCategories: riskAssessment.riskCategories,
      recommendations: riskAssessment.recommendations,
      mitigationStrategies: riskAssessment.mitigationStrategies,
    };
  }

  /**
   * Compare with historical proposals
   */
  private async compareWithHistory(proposalId: string, proposalAnalysis: any) {
    // Mock historical proposals for demo
    const historicalProposals = [
      {
        id: 'prop-001',
        outcome: 'SUCCEEDED' as const,
        riskScore: 0.35,
      },
      {
        id: 'prop-002',
        outcome: 'DEFEATED' as const,
        riskScore: 0.72,
      },
      {
        id: 'prop-003',
        outcome: 'EXECUTED' as const,
        riskScore: 0.28,
      },
    ];

    const result = await mcpServers.riskAssessment.compareWithHistoricalProposals(
      proposalId,
      historicalProposals
    );

    return result;
  }

  /**
   * Generate voting recommendation
   */
  private async generateRecommendation(
    proposalId: string,
    proposalAnalysis: any,
    riskProfile: any,
    userContext: WorkflowInput['userContext']
  ) {
    return await votingStrategistAgent.generateRecommendation(proposalId, {
      financialImpact: {
        proposalId: proposalAnalysis.proposalId,
        estimatedCost: proposalAnalysis.financialImpact.estimatedCost,
        treasuryImpact: proposalAnalysis.financialImpact.treasuryImpact,
        riskScore: proposalAnalysis.financialImpact.riskScore,
        affectedTokens: proposalAnalysis.financialImpact.affectedTokens || [],
      },
      securityRisk: proposalAnalysis.securityAnalysis,
      userPreferences: userContext.preferences,
    });
  }

  /**
   * Check if approval is required
   */
  private checkApprovalRequired(
    votingRecommendation: any,
    proposalAnalysis: any,
    riskProfile: any
  ): boolean {
    // Approval required if:
    // 1. Low confidence recommendation
    if (votingRecommendation && votingRecommendation.confidence < 0.7) {
      return true;
    }

    // 2. High risk proposal
    if (riskProfile && (riskProfile.riskLevel === 'HIGH' || riskProfile.riskLevel === 'CRITICAL')) {
      return true;
    }

    // 3. High security risk
    if (proposalAnalysis.securityAnalysis.riskLevel === 'HIGH') {
      return true;
    }

    // 4. Large financial impact
    if (proposalAnalysis.financialImpact.treasuryImpact > 0.15) {
      return true;
    }

    return false;
  }

  /**
   * Generate approval reason
   */
  private generateApprovalReason(
    votingRecommendation: any,
    proposalAnalysis: any,
    riskProfile: any
  ): string {
    const reasons: string[] = [];

    if (votingRecommendation && votingRecommendation.confidence < 0.7) {
      reasons.push(`Low confidence (${(votingRecommendation.confidence * 100).toFixed(1)}%)`);
    }

    if (riskProfile && (riskProfile.riskLevel === 'HIGH' || riskProfile.riskLevel === 'CRITICAL')) {
      reasons.push(`${riskProfile.riskLevel} risk level`);
    }

    if (proposalAnalysis.securityAnalysis.riskLevel === 'HIGH') {
      reasons.push('High security risk');
    }

    if (proposalAnalysis.financialImpact.treasuryImpact > 0.15) {
      reasons.push(`Significant treasury impact (${(proposalAnalysis.financialImpact.treasuryImpact * 100).toFixed(1)}%)`);
    }

    return reasons.join(', ');
  }
}

/**
 * Convenience function to run governance workflow
 */
export async function runGovernanceWorkflow(input: WorkflowInput): Promise<WorkflowOutput> {
  const workflow = new GovernanceWorkflow();
  return await workflow.execute(input);
}

/**
 * Multi-DAO monitoring workflow
 */
export class MultiDAOMonitoringWorkflow {
  async monitor(daoAddresses: string[]): Promise<Array<{
    daoAddress: string;
    treasuryStatus: any;
    activeProposals: number;
    alerts: string[];
  }>> {
    console.log(`\n🔍 Monitoring ${daoAddresses.length} DAOs...`);

    const results = await Promise.all(
      daoAddresses.map(async (daoAddress) => {
        try {
          const treasuryStatus = await treasuryMonitorAgent.monitor(daoAddress);

          // In production, fetch active proposals count from blockchain
          const activeProposals = 0;

          return {
            daoAddress,
            treasuryStatus,
            activeProposals,
            alerts: treasuryStatus.alerts,
          };
        } catch (error) {
          console.error(`Error monitoring DAO ${daoAddress}:`, error);
          return {
            daoAddress,
            treasuryStatus: null,
            activeProposals: 0,
            alerts: ['Failed to fetch DAO data'],
          };
        }
      })
    );

    console.log(`✅ Monitoring completed for ${results.length} DAOs`);

    return results;
  }
}

/**
 * Batch proposal analysis workflow
 */
export class BatchProposalAnalysisWorkflow {
  async analyze(proposals: Array<{ id: string; daoAddress: string }>) {
    console.log(`\n📊 Analyzing ${proposals.length} proposals in batch...`);

    const results = await Promise.all(
      proposals.map(async ({ id, daoAddress }) => {
        try {
          const workflow = new GovernanceWorkflow();
          return await workflow.execute({
            proposalId: id,
            daoAddress,
            userContext: {
              address: '0x0',
              preferences: {},
            },
            options: {
              includeHistoricalComparison: false,
              includeTreasuryAnalysis: false,
            },
          });
        } catch (error) {
          console.error(`Error analyzing proposal ${id}:`, error);
          return null;
        }
      })
    );

    const successful = results.filter((r) => r !== null);
    console.log(`✅ Successfully analyzed ${successful.length}/${proposals.length} proposals`);

    return successful;
  }
}

