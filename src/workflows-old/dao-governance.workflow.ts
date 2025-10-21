// src/workflows/dao-governance.workflow.ts
import { Workflow } from '@iqai/adk';
import { createProposalAnalystAgent } from '../agents/proposal-analyst.agent';
import { createVotingStrategistAgent } from '../agents/voting-strategist.agent';
import { createTreasuryMonitorAgent } from '../agents/treasury-monitor.agent';

/**
 * DAO Governance Workflow
 * 
 * Orchestrates multiple agents to provide comprehensive governance analysis
 * and voting recommendations for DAO members.
 */
export class DAOGovernanceWorkflow extends Workflow {
  
  /**
   * Process a DAO proposal through multi-agent analysis
   * @param proposalId - The proposal to analyze
   * @param daoAddress - The DAO contract address
   * @param userAddress - The user requesting analysis
   */
  async processProposal(
    proposalId: string, 
    daoAddress: string, 
    userAddress: string
  ): Promise<GovernanceAnalysisResult> {
    
    console.log(`[DAOGovernanceWorkflow] Processing proposal ${proposalId} for user ${userAddress}`);
    
    try {
      // Step 1: Initialize all agents
      const proposalAnalyst = createProposalAnalystAgent();
      const treasuryMonitor = createTreasuryMonitorAgent();
      const votingStrategist = createVotingStrategistAgent();
      
      // Step 2: Parallel execution - Analyze proposal and treasury
      console.log('[DAOGovernanceWorkflow] Running parallel analysis...');
      const [proposalAnalysis, treasuryHealth] = await Promise.all([
        proposalAnalyst.run(`
          Analyze DAO proposal ${proposalId} from DAO ${daoAddress}.
          Provide comprehensive analysis including:
          - Executive summary
          - Financial impact assessment
          - Security risk evaluation
          - Key stakeholder considerations
        `),
        treasuryMonitor.run(`
          Analyze treasury health for DAO ${daoAddress}.
          Assess impact of proposal ${proposalId} on treasury sustainability.
        `)
      ]);
      
      // Step 3: Generate personalized voting recommendation
      console.log('[DAOGovernanceWorkflow] Generating voting recommendation...');
      const votingRecommendation = await votingStrategist.run(`
        Based on the following analysis, generate a personalized voting recommendation for user ${userAddress}:
        
        Proposal Analysis:
        ${JSON.stringify(proposalAnalysis, null, 2)}
        
        Treasury Health:
        ${JSON.stringify(treasuryHealth, null, 2)}
        
        Consider the user's voting history and preferences in your recommendation.
        Provide clear reasoning, confidence level, and potential risks.
      `);
      
      // Step 4: Compile comprehensive result
      const result: GovernanceAnalysisResult = {
        proposalId,
        daoAddress,
        userAddress,
        timestamp: new Date().toISOString(),
        analysis: {
          proposal: proposalAnalysis,
          treasury: treasuryHealth,
          recommendation: votingRecommendation,
        },
        metadata: {
          processingTimeMs: Date.now(),
          agentsUsed: ['ProposalAnalyst', 'TreasuryMonitor', 'VotingStrategist'],
          confidence: this.extractConfidence(votingRecommendation),
        }
      };
      
      console.log('[DAOGovernanceWorkflow] Analysis complete');
      return result;
      
    } catch (error) {
      console.error('[DAOGovernanceWorkflow] Error:', error);
      throw new Error(`Governance workflow failed: ${error.message}`);
    }
  }
  
  /**
   * Monitor treasury health without specific proposal
   */
  async monitorTreasuryHealth(daoAddress: string): Promise<any> {
    const treasuryMonitor = createTreasuryMonitorAgent();
    
    return await treasuryMonitor.run(`
      Provide comprehensive treasury health assessment for DAO ${daoAddress}.
      Include:
      - Current composition and balances
      - Health score and sustainability metrics
      - Risk factors and recommendations
    `);
  }
  
  /**
   * Get voting recommendations for multiple proposals
   */
  async analyzeMultipleProposals(
    proposalIds: string[],
    daoAddress: string,
    userAddress: string
  ): Promise<GovernanceAnalysisResult[]> {
    
    console.log(`[DAOGovernanceWorkflow] Analyzing ${proposalIds.length} proposals...`);
    
    const results = await Promise.all(
      proposalIds.map(proposalId => 
        this.processProposal(proposalId, daoAddress, userAddress)
      )
    );
    
    return results;
  }
  
  /**
   * Extract confidence level from recommendation text
   */
  private extractConfidence(recommendation: any): number {
    // Simple extraction - in production, this would parse structured output
    if (typeof recommendation === 'object' && recommendation.confidence) {
      return recommendation.confidence;
    }
    
    const text = JSON.stringify(recommendation);
    const match = text.match(/confidence[:\s]+(\d+)/i);
    return match ? parseInt(match[1]) : 75; // default
  }
}

/**
 * Type definitions
 */
export interface GovernanceAnalysisResult {
  proposalId: string;
  daoAddress: string;
  userAddress: string;
  timestamp: string;
  analysis: {
    proposal: any;
    treasury: any;
    recommendation: any;
  };
  metadata: {
    processingTimeMs: number;
    agentsUsed: string[];
    confidence: number;
  };
}

/**
 * Factory function to create workflow instance
 */
export function createDAOGovernanceWorkflow(): DAOGovernanceWorkflow {
  return new DAOGovernanceWorkflow();
}

export default DAOGovernanceWorkflow;
