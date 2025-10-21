import { Workflow } from "@iqai/adk";
import { createProposalAnalystAgent } from "../adk-agents/proposal-analyst";
import { createVotingStrategistAgent } from "../adk-agents/voting-strategist";

/**
 * DAO Governance Workflow
 * Coordinates multiple specialized agents for comprehensive proposal analysis
 */
export class DAOGovernanceWorkflow extends Workflow {
  private proposalAnalyst: any;
  private votingStrategist: any;

  constructor() {
    super();
    this.proposalAnalyst = createProposalAnalystAgent();
    this.votingStrategist = createVotingStrategistAgent();
  }

  /**
   * Process a DAO proposal with full analysis and recommendation
   */
  async processProposal(input: {
    proposalId: string;
    daoAddress: string;
    userAddress: string;
    userRiskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  }) {
    const { proposalId, daoAddress, userAddress, userRiskTolerance = 'moderate' } = input;

    console.log('\n🚀 Starting DAO Governance Workflow');
    console.log(`   Proposal: ${proposalId}`);
    console.log(`   DAO: ${daoAddress}`);
    console.log(`   User: ${userAddress}\n`);

    try {
      // Step 1: Comprehensive Proposal Analysis
      console.log('📊 Step 1: Analyzing proposal...');
      const analysisPrompt = `
Please provide a comprehensive analysis of proposal ${proposalId} for DAO at address ${daoAddress}.

Use your tools to:
1. Fetch the proposal details
2. Analyze the financial impact on the treasury
3. Assess security risks
4. Check the treasury health status

Present your findings in a well-structured format with clear sections for:
- Executive Summary
- Financial Impact Assessment
- Security Risk Analysis
- Treasury Health Check
- Key Considerations

Be thorough but concise. Highlight critical issues prominently.
      `;

      const analysisResult = await this.proposalAnalyst.run(analysisPrompt);
      console.log('✅ Proposal analysis complete\n');

      // Step 2: Generate Personalized Recommendation
      console.log('🗳️  Step 2: Generating voting recommendation...');
      const recommendationPrompt = `
Based on the following proposal analysis, generate a personalized voting recommendation for user ${userAddress}.

User Risk Tolerance: ${userRiskTolerance}

Proposal Analysis:
${analysisResult.content}

Please:
1. Analyze the user's historical voting pattern
2. Generate a voting recommendation (FOR/AGAINST/ABSTAIN)
3. Provide clear reasoning
4. Show alternative perspectives
5. List key considerations before voting

Consider the user's risk tolerance (${userRiskTolerance}) in your recommendation.
      `;

      const recommendationResult = await this.votingStrategist.run(recommendationPrompt);
      console.log('✅ Voting recommendation complete\n');

      // Prepare final output
      const result = {
        proposalId,
        daoAddress,
        userAddress,
        timestamp: new Date().toISOString(),
        analysis: {
          content: analysisResult.content,
          agentId: 'proposal-analyst',
        },
        recommendation: {
          content: recommendationResult.content,
          agentId: 'voting-strategist',
        },
        workflow: {
          status: 'COMPLETED',
          executionTime: Date.now() - this.startTime,
          stepsCompleted: 2,
        }
      };

      console.log('✨ Workflow completed successfully!\n');
      return result;

    } catch (error) {
      console.error('❌ Workflow failed:', error);
      throw error;
    }
  }

  /**
   * Quick proposal summary (lightweight analysis)
   */
  async quickSummary(proposalId: string, daoAddress: string) {
    console.log(`\n📋 Quick Summary for Proposal ${proposalId}\n`);

    try {
      const prompt = `
Provide a quick summary of proposal ${proposalId} for DAO ${daoAddress}.

Focus on:
1. What the proposal is about (1-2 sentences)
2. Key financial numbers
3. Main risk level
4. Current voting status

Keep it brief and actionable.
      `;

      const result = await this.proposalAnalyst.run(prompt);
      console.log('✅ Quick summary ready\n');

      return {
        proposalId,
        summary: result.content,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Quick summary failed:', error);
      throw error;
    }
  }

  /**
   * Batch analyze multiple proposals
   */
  async batchAnalyze(proposals: Array<{ proposalId: string; daoAddress: string }>) {
    console.log(`\n📊 Batch Analyzing ${proposals.length} Proposals\n`);

    const results = await Promise.all(
      proposals.map(async ({ proposalId, daoAddress }) => {
        try {
          return await this.quickSummary(proposalId, daoAddress);
        } catch (error) {
          console.error(`Failed to analyze ${proposalId}:`, error);
          return {
            proposalId,
            error: 'Analysis failed',
            timestamp: new Date().toISOString(),
          };
        }
      })
    );

    console.log(`✅ Batch analysis complete: ${results.filter(r => !('error' in r)).length}/${proposals.length} successful\n`);

    return {
      totalProposals: proposals.length,
      successful: results.filter(r => !('error' in r)).length,
      failed: results.filter(r => 'error' in r).length,
      results,
      timestamp: new Date().toISOString(),
    };
  }

  private startTime = Date.now();
}

/**
 * Convenience function to create and run workflow
 */
export async function analyzeProposal(input: {
  proposalId: string;
  daoAddress: string;
  userAddress: string;
  userRiskTolerance?: 'conservative' | 'moderate' | 'aggressive';
}) {
  const workflow = new DAOGovernanceWorkflow();
  return await workflow.processProposal(input);
}

/**
 * Convenience function for quick summary
 */
export async function getQuickSummary(proposalId: string, daoAddress: string) {
  const workflow = new DAOGovernanceWorkflow();
  return await workflow.quickSummary(proposalId, daoAddress);
}

