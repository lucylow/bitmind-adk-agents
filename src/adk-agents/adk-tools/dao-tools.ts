import { tool } from "@iqai/adk";
import { z } from "zod";
import { mcpServers } from '../tools/enhanced-dao-tools';
import * as ethers from 'ethers';

/**
 * DAO Tools for ADK-TS Agents
 * These tools are designed to be used with the ADK-TS AgentBuilder
 */

/**
 * Tool: Fetch Proposal
 * Retrieves DAO proposal details from blockchain or governance platforms
 */
export const fetchProposalTool = tool({
  description: "Fetch DAO proposal details from the blockchain or governance platform (Snapshot/Tally)",
  input: z.object({
    proposalId: z.string().describe("The proposal ID to fetch"),
    daoAddress: z.string().optional().describe("The DAO contract address (optional for Snapshot)"),
    platform: z.enum(['onchain', 'snapshot', 'tally']).optional().describe("Platform to fetch from (default: onchain)")
  }),
  execute: async ({ proposalId, daoAddress, platform = 'onchain' }) => {
    try {
      const proposalData = await mcpServers.blockchainData.getProposalData(proposalId);
      
      return {
        id: proposalData.id,
        proposalId: proposalData.proposalId,
        title: proposalData.title,
        description: proposalData.description,
        proposer: proposalData.proposer,
        status: proposalData.status,
        startBlock: proposalData.startBlock,
        endBlock: proposalData.endBlock,
        forVotes: Number(ethers.formatEther(proposalData.forVotes)),
        againstVotes: Number(ethers.formatEther(proposalData.againstVotes)),
        abstainVotes: Number(ethers.formatEther(proposalData.abstainVotes)),
        createdAt: proposalData.createdAt,
      };
    } catch (error) {
      console.error('Error fetching proposal:', error);
      throw new Error(`Failed to fetch proposal ${proposalId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

/**
 * Tool: Analyze Financial Impact
 * Analyzes the financial impact of a proposal on the DAO treasury
 */
export const analyzeFinancialImpactTool = tool({
  description: "Analyze the financial impact of a DAO proposal on the treasury, including cost estimates and risk assessment",
  input: z.object({
    proposalId: z.string().describe("The proposal ID to analyze"),
    proposalDescription: z.string().describe("The proposal description text"),
    treasuryAddress: z.string().describe("The DAO treasury address")
  }),
  execute: async ({ proposalId, proposalDescription, treasuryAddress }) => {
    try {
      // Get treasury data
      const treasury = await mcpServers.blockchainData.getTreasuryBalance(treasuryAddress);
      
      // Parse proposal for financial information
      const description = proposalDescription.toLowerCase();
      let estimatedCost = 0;
      const affectedTokens: string[] = [];
      
      // Extract token amounts
      const amountRegex = /(\d+(?:,\d+)*(?:\.\d+)?)\s*(eth|usdc|usdt|dai)/gi;
      const matches = Array.from(description.matchAll(amountRegex));
      
      for (const match of matches) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        const token = match[2].toUpperCase();
        
        if (!affectedTokens.includes(token)) {
          affectedTokens.push(token);
        }
        
        const treasuryToken = treasury.tokens.find((t: any) => t.symbol === token);
        if (treasuryToken) {
          estimatedCost += amount * treasuryToken.priceUSD;
        }
      }
      
      // Default estimate if no amounts found
      if (estimatedCost === 0) {
        if (description.includes('million')) estimatedCost = 1000000;
        else if (description.includes('thousand')) estimatedCost = 100000;
        else estimatedCost = 50000;
      }
      
      const treasuryImpact = estimatedCost / treasury.totalValueUSD;
      
      // Risk scoring
      let riskScore = 0;
      if (treasuryImpact > 0.2) riskScore += 0.4;
      else if (treasuryImpact > 0.1) riskScore += 0.25;
      else if (treasuryImpact > 0.05) riskScore += 0.15;
      
      if (estimatedCost > 1000000) riskScore += 0.3;
      else if (estimatedCost > 500000) riskScore += 0.2;
      
      return {
        proposalId,
        estimatedCost,
        treasuryImpact: treasuryImpact * 100, // as percentage
        riskScore: Math.min(riskScore, 1) * 100, // as percentage
        affectedTokens: affectedTokens.length > 0 ? affectedTokens : ['ETH', 'USDC'],
        treasuryTotalValue: treasury.totalValueUSD,
        summary: `Estimated cost: $${estimatedCost.toLocaleString()}. Treasury impact: ${(treasuryImpact * 100).toFixed(2)}%. Risk score: ${(Math.min(riskScore, 1) * 100).toFixed(0)}%`
      };
    } catch (error) {
      console.error('Error analyzing financial impact:', error);
      throw new Error(`Failed to analyze financial impact: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

/**
 * Tool: Assess Security Risk
 * Evaluates security risks in a proposal using the Risk Assessment MCP
 */
export const assessSecurityRiskTool = tool({
  description: "Assess security risks in a DAO proposal, including smart contract changes, permission modifications, and potential vulnerabilities",
  input: z.object({
    proposalId: z.string().describe("The proposal ID to assess"),
    proposalContent: z.string().describe("The full proposal content/description")
  }),
  execute: async ({ proposalId, proposalContent }) => {
    try {
      const riskAssessment = await mcpServers.riskAssessment.assessProposalRisk({
        id: proposalId,
        title: 'Security Risk Assessment',
        description: proposalContent,
      });
      
      return {
        proposalId,
        overallRiskLevel: riskAssessment.riskLevel,
        overallRiskScore: (riskAssessment.overallRiskScore * 100).toFixed(1) + '%',
        securityConcerns: riskAssessment.riskCategories.security.factors,
        securityScore: (riskAssessment.riskCategories.security.score * 100).toFixed(0) + '%',
        governanceRisks: riskAssessment.riskCategories.governance.factors,
        executionRisks: riskAssessment.riskCategories.execution.factors,
        recommendations: riskAssessment.recommendations,
        mitigationStrategies: riskAssessment.mitigationStrategies,
        summary: `Risk Level: ${riskAssessment.riskLevel}. Security Score: ${(riskAssessment.riskCategories.security.score * 100).toFixed(0)}%. ${riskAssessment.riskCategories.security.factors.length} concerns identified.`
      };
    } catch (error) {
      console.error('Error assessing security risk:', error);
      throw new Error(`Failed to assess security risk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

/**
 * Tool: Get Treasury Status
 * Retrieves current treasury balance and health metrics
 */
export const getTreasuryStatusTool = tool({
  description: "Get the current DAO treasury balance, token composition, and health metrics",
  input: z.object({
    daoAddress: z.string().describe("The DAO treasury address to check")
  }),
  execute: async ({ daoAddress }) => {
    try {
      const treasury = await mcpServers.blockchainData.getTreasuryBalance(daoAddress);
      const treasuryRisk = await mcpServers.riskAssessment.assessTreasuryRisk({
        daoAddress,
        totalValueUSD: treasury.totalValueUSD,
        tokens: treasury.tokens.map((t: any) => ({
          symbol: t.symbol,
          valueUSD: t.valueUSD,
          balance: t.balance
        }))
      });
      
      return {
        daoAddress,
        totalValue: treasury.totalValueUSD,
        tokens: treasury.tokens.map((t: any) => ({
          symbol: t.symbol,
          balance: Number(ethers.formatUnits(t.balance, t.decimals)).toFixed(2),
          valueUSD: t.valueUSD,
          percentage: ((t.valueUSD / treasury.totalValueUSD) * 100).toFixed(2) + '%'
        })),
        healthScore: (treasuryRisk.overallHealthScore * 100).toFixed(1) + '%',
        diversificationScore: (treasuryRisk.diversificationScore * 100).toFixed(1) + '%',
        liquidityScore: (treasuryRisk.liquidityScore * 100).toFixed(1) + '%',
        alerts: treasuryRisk.alerts,
        recommendations: treasuryRisk.recommendations,
        summary: `Treasury Value: $${treasury.totalValueUSD.toLocaleString()}. Health Score: ${(treasuryRisk.overallHealthScore * 100).toFixed(1)}%. ${treasuryRisk.alerts.length} alerts.`
      };
    } catch (error) {
      console.error('Error getting treasury status:', error);
      throw new Error(`Failed to get treasury status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

/**
 * Tool: Analyze Voting Pattern
 * Analyzes a user's historical voting patterns
 */
export const analyzeVotingPatternTool = tool({
  description: "Analyze a user's historical voting patterns and preferences to inform recommendations",
  input: z.object({
    userAddress: z.string().describe("The user's wallet address"),
    daoAddress: z.string().describe("The DAO address to analyze votes for")
  }),
  execute: async ({ userAddress, daoAddress }) => {
    try {
      // Get voting power
      const votingPower = await mcpServers.blockchainData.getVotingPower(userAddress);
      
      // Mock historical voting data (in production, fetch from blockchain)
      const historicalVotes = {
        totalVotes: 12,
        forVotes: 8,
        againstVotes: 3,
        abstainVotes: 1,
        averageParticipation: 0.75,
        preferredCategories: ['Treasury Management', 'Protocol Upgrades']
      };
      
      return {
        userAddress,
        votingPower: Number(ethers.formatEther(votingPower.votingPower)).toFixed(2),
        tokenBalance: Number(ethers.formatEther(votingPower.tokenBalance)).toFixed(2),
        historicalVotes,
        votingStyle: historicalVotes.forVotes > historicalVotes.againstVotes ? 'Generally supportive' : 'Generally cautious',
        participationRate: (historicalVotes.averageParticipation * 100).toFixed(1) + '%',
        summary: `User has voted ${historicalVotes.totalVotes} times with ${((historicalVotes.forVotes / historicalVotes.totalVotes) * 100).toFixed(0)}% FOR votes. Voting power: ${Number(ethers.formatEther(votingPower.votingPower)).toFixed(2)} tokens.`
      };
    } catch (error) {
      console.error('Error analyzing voting pattern:', error);
      throw new Error(`Failed to analyze voting pattern: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

/**
 * Tool: Generate Voting Recommendation
 * Generates a personalized voting recommendation based on analysis
 */
export const generateRecommendationTool = tool({
  description: "Generate a personalized voting recommendation based on proposal analysis, risk assessment, and user preferences",
  input: z.object({
    proposalId: z.string().describe("The proposal ID"),
    financialAnalysis: z.any().describe("Financial impact analysis results"),
    securityAnalysis: z.any().describe("Security risk assessment results"),
    userVotingPattern: z.any().describe("User's voting pattern analysis"),
    userRiskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional().describe("User's risk tolerance")
  }),
  execute: async ({ proposalId, financialAnalysis, securityAnalysis, userVotingPattern, userRiskTolerance = 'moderate' }) => {
    const reasoning: string[] = [];
    let score = 0;
    
    // Financial analysis
    if (financialAnalysis.riskScore < 30) {
      reasoning.push('✓ Low financial risk detected');
      score += 2;
    } else if (financialAnalysis.riskScore > 70) {
      reasoning.push('✗ High financial risk detected');
      score -= 2;
    } else {
      reasoning.push('~ Moderate financial risk');
    }
    
    // Treasury impact
    if (financialAnalysis.treasuryImpact < 5) {
      reasoning.push('✓ Minimal treasury impact (<5%)');
      score += 1;
    } else if (financialAnalysis.treasuryImpact > 15) {
      reasoning.push('✗ Significant treasury impact (>15%)');
      score -= 1;
    }
    
    // Security analysis
    if (securityAnalysis.overallRiskLevel === 'LOW') {
      reasoning.push('✓ Low security risk');
      score += 1;
    } else if (securityAnalysis.overallRiskLevel === 'HIGH' || securityAnalysis.overallRiskLevel === 'CRITICAL') {
      reasoning.push('✗ High security concerns identified');
      score -= 2;
    } else {
      reasoning.push('~ Moderate security concerns');
    }
    
    // Security concerns
    if (securityAnalysis.securityConcerns && securityAnalysis.securityConcerns.length > 0) {
      reasoning.push(`⚠ ${securityAnalysis.securityConcerns.length} security concerns to review`);
    }
    
    // User risk tolerance adjustment
    if (userRiskTolerance === 'conservative' && financialAnalysis.riskScore > 50) {
      score -= 1;
      reasoning.push('⚠ Risk exceeds conservative profile');
    } else if (userRiskTolerance === 'aggressive' && financialAnalysis.riskScore < 30) {
      score += 0.5;
      reasoning.push('✓ Aligns with aggressive risk profile');
    }
    
    // User voting pattern alignment
    if (userVotingPattern.votingStyle === 'Generally supportive') {
      reasoning.push('ℹ User historically votes FOR proposals');
    } else {
      reasoning.push('ℹ User historically votes cautiously');
    }
    
    // Determine recommendation
    const recommendation = score > 1 ? 'FOR' : score < -1 ? 'AGAINST' : 'ABSTAIN';
    const confidence = Math.min(95, 50 + Math.abs(score) * 15);
    
    return {
      proposalId,
      recommendation,
      confidence: confidence.toFixed(1) + '%',
      reasoning,
      alternativeViews: [
        'Conservative view: ' + (securityAnalysis.overallRiskLevel === 'HIGH' ? 'Vote AGAINST due to security risks' : 'Exercise caution'),
        'Aggressive view: ' + (financialAnalysis.treasuryImpact > 0 ? 'Vote FOR to support growth' : 'Evaluate upside potential'),
        'Balanced view: Consider long-term strategic value beyond immediate metrics'
      ],
      keyConsiderations: [
        ...securityAnalysis.recommendations.slice(0, 2),
        `Financial impact: $${financialAnalysis.estimatedCost.toLocaleString()}`,
        `Treasury health: Review treasury diversification`
      ],
      summary: `Recommendation: ${recommendation} with ${confidence.toFixed(1)}% confidence. ${reasoning.length} factors considered.`
    };
  }
});

/**
 * Export all tools as an array for easy agent registration
 */
export const daoGovernanceTools = [
  fetchProposalTool,
  analyzeFinancialImpactTool,
  assessSecurityRiskTool,
  getTreasuryStatusTool,
  analyzeVotingPatternTool,
  generateRecommendationTool
];

