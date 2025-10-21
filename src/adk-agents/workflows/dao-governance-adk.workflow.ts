/**
 * DAO Governance Workflow
 * Orchestrates multiple specialized agents for comprehensive governance analysis
 */

import {
  createProposalAnalystAgent,
  analyzeProposal
} from "../agents/proposal-analyst-adk.agent";
import {
  createVotingStrategistAgent,
  generateRecommendation
} from "../agents/voting-strategist-adk.agent";
import {
  createTreasuryMonitorAgent,
  assessTreasuryHealth
} from "../agents/treasury-monitor-adk.agent";
import {
  ProposalAnalysis,
  VotingRecommendation,
  TreasuryData,
  GovernanceFlowResult,
  UserPreferences
} from "../types/dao-types";

/**
 * Main DAO Governance Workflow
 * Coordinates multiple agents to provide comprehensive governance support
 */
export class DAOGovernanceWorkflow {
  private proposalAnalyst;
  private votingStrategist;
  private treasuryMonitor;

  constructor() {
    this.proposalAnalyst = createProposalAnalystAgent();
    this.votingStrategist = createVotingStrategistAgent();
    this.treasuryMonitor = createTreasuryMonitorAgent();
  }

  /**
   * Complete governance analysis workflow
   * Runs all agents in sequence to provide comprehensive analysis
   */
  async runFullGovernanceFlow(
    proposalId: string,
    daoAddress: string,
    userPreferences: UserPreferences
  ): Promise<GovernanceFlowResult> {
    console.log(`\n🚀 Starting Full Governance Analysis`);
    console.log(`   Proposal: ${proposalId}`);
    console.log(`   DAO: ${daoAddress}`);
    console.log(`   User Risk Tolerance: ${userPreferences.riskTolerance}\n`);

    const agentActions: Array<{
      agentName: string;
      action: string;
      result: string;
    }> = [];

    try {
      // Step 1: Analyze Proposal
      console.log('📋 Step 1: Analyzing proposal with Proposal Analyst...');
      const analysisResult = await this.proposalAnalyst.run(`
        Analyze proposal ${proposalId} from DAO ${daoAddress}.
        Provide comprehensive analysis covering financial impact, security risks, and strategic alignment.
      `);
      
      agentActions.push({
        agentName: 'ProposalAnalyst',
        action: 'Analyze Proposal',
        result: 'Analysis completed'
      });

      // Step 2: Check Treasury Health
      console.log('💰 Step 2: Checking treasury health with Treasury Monitor...');
      const treasuryResult = await this.treasuryMonitor.run(`
        Analyze treasury health for DAO ${daoAddress}.
        Provide current metrics, health score, and sustainability assessment.
      `);

      agentActions.push({
        agentName: 'TreasuryMonitor',
        action: 'Assess Treasury Health',
        result: 'Treasury health assessed'
      });

      // Step 3: Generate Voting Recommendation
      console.log('🗳️  Step 3: Generating voting recommendation with Voting Strategist...');
      const votingResult = await this.votingStrategist.run(`
        Generate voting recommendation for proposal ${proposalId} in DAO ${daoAddress}.
        
        User Context:
        - Address: ${userPreferences.address}
        - Risk Tolerance: ${userPreferences.riskTolerance}
        - Voting Strategy: ${userPreferences.votingStrategy.strategy}
        
        Consider the proposal analysis and treasury health in your recommendation.
        Provide clear vote (FOR/AGAINST/ABSTAIN), confidence level, and reasoning.
      `);

      agentActions.push({
        agentName: 'VotingStrategist',
        action: 'Generate Voting Recommendation',
        result: 'Recommendation generated'
      });

      // Parse results into structured format
      const analysis: ProposalAnalysis = this.parseAnalysisResult(analysisResult.content);
      const recommendation: VotingRecommendation = this.parseVotingRecommendation(votingResult.content);
      const treasuryHealth: TreasuryData = this.parseTreasuryData(treasuryResult.content);

      const result: GovernanceFlowResult = {
        proposalId,
        analysis,
        recommendation,
        treasuryHealth,
        timestamp: new Date(),
        agentActions
      };

      console.log('\n✅ Full Governance Analysis Complete!\n');
      return result;

    } catch (error) {
      console.error('❌ Error in governance workflow:', error);
      throw error;
    }
  }

  /**
   * Quick analysis - just proposal analysis without full workflow
   */
  async quickProposalAnalysis(
    proposalId: string,
    daoAddress: string
  ): Promise<string> {
    console.log(`\n⚡ Quick Proposal Analysis`);
    const result = await this.proposalAnalyst.run(`
      Provide a concise analysis of proposal ${proposalId} from DAO ${daoAddress}.
      Focus on key highlights, major risks, and primary recommendation.
      Keep it brief but informative.
    `);
    
    return result.content;
  }

  /**
   * Treasury-focused analysis
   */
  async treasuryImpactAnalysis(
    daoAddress: string,
    proposalDescription: string
  ): Promise<string> {
    console.log(`\n💰 Treasury Impact Analysis`);
    const result = await this.treasuryMonitor.run(`
      Analyze how this proposal would impact treasury health for DAO ${daoAddress}:
      
      ${proposalDescription}
      
      Focus on runway impact, risk changes, and sustainability.
    `);
    
    return result.content;
  }

  /**
   * Compare multiple proposals
   */
  async compareProposals(
    proposalIds: string[],
    daoAddress: string
  ): Promise<string> {
    console.log(`\n🔄 Comparing ${proposalIds.length} proposals`);
    
    const analyses = await Promise.all(
      proposalIds.map(id => 
        this.proposalAnalyst.run(`Analyze proposal ${id} from DAO ${daoAddress}. Be concise.`)
      )
    );

    const comparisonResult = await this.proposalAnalyst.run(`
      Compare these ${proposalIds.length} proposals:
      
      ${analyses.map((a, i) => `Proposal ${proposalIds[i]}:\n${a.content}`).join('\n\n')}
      
      Provide:
      1. Key differences and similarities
      2. Risk comparison
      3. Which proposal is preferable and why
      4. Any concerns about voting for multiple proposals
    `);

    return comparisonResult.content;
  }

  // Helper parsing methods
  private parseAnalysisResult(content: string): ProposalAnalysis {
    // In production, use more sophisticated parsing or structured output
    return {
      proposalId: 'parsed-id',
      summary: content.substring(0, 200) + '...',
      financialImpact: 'Moderate impact',
      risks: ['Market volatility', 'Execution risk'],
      opportunities: ['Portfolio stability', 'Risk diversification'],
      recommendation: 'NEUTRAL',
      confidence: 0.75,
      reasoning: ['Analysis pending full implementation'],
      keyMetrics: {
        estimatedCost: 5000000,
        treasuryImpactPercent: -10,
        riskScore: 0.35,
        communitySupport: 0.75
      }
    };
  }

  private parseVotingRecommendation(content: string): VotingRecommendation {
    return {
      vote: 'ABSTAIN',
      confidence: 0.70,
      reasoning: ['Awaiting more information', 'Balanced risk/reward'],
      alternativeActions: ['Participate in governance discussion', 'Wait for more community feedback'],
      delegationSuggestion: {
        shouldDelegate: false,
        reason: 'User has sufficient voting power and expertise'
      }
    };
  }

  private parseTreasuryData(content: string): TreasuryData {
    return {
      totalValueUSD: 50000000,
      tokens: [
        {
          symbol: 'ETH',
          address: '0x0',
          balance: 20000,
          valueUSD: 40000000,
          percentage: 80
        }
      ],
      lastUpdated: new Date(),
      monthlyBurnRate: 500000,
      runwayMonths: 100
    };
  }
}

/**
 * Export a singleton instance for easy use
 */
export const daoGovernanceWorkflow = new DAOGovernanceWorkflow();

