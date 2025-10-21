import { z } from 'zod';
import * as ethers from 'ethers';
import { createMCPServers } from '../mcp-servers';

/**
 * Enhanced DAO Tools with Real Web3 Integration
 * Uses MCP servers for blockchain data access and governance platform integration
 */

// Initialize MCP servers
const mcpServers = createMCPServers({});

export const ProposalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['PENDING', 'ACTIVE', 'CANCELED', 'DEFEATED', 'SUCCEEDED', 'QUEUED', 'EXPIRED', 'EXECUTED']),
  proposer: z.string(),
  startBlock: z.number(),
  endBlock: z.number(),
  forVotes: z.number(),
  againstVotes: z.number(),
  abstainVotes: z.number(),
  createdAt: z.number().optional(),
  executedAt: z.number().optional(),
});

export type Proposal = z.infer<typeof ProposalSchema>;

export const FinancialImpactSchema = z.object({
  proposalId: z.string(),
  estimatedCost: z.number(),
  treasuryImpact: z.number(),
  riskScore: z.number().min(0).max(1),
  affectedTokens: z.array(z.string()),
  projectedValue: z.number().optional(),
  breakdownByToken: z.array(
    z.object({
      token: z.string(),
      amount: z.number(),
      valueUSD: z.number(),
    })
  ).optional(),
});

export type FinancialImpact = z.infer<typeof FinancialImpactSchema>;

export const SecurityRiskSchema = z.object({
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  concerns: z.array(z.string()),
  securityScore: z.number().min(0).max(1),
  recommendations: z.array(z.string()),
});

export type SecurityRisk = z.infer<typeof SecurityRiskSchema>;

/**
 * Fetch proposal details from blockchain via MCP server
 */
export async function fetchProposal(
  proposalId: string,
  daoAddress: string
): Promise<Proposal> {
  try {
    // Fetch from blockchain data MCP server
    const proposalData = await mcpServers.blockchainData.getProposalData(proposalId);

    return {
      id: proposalData.id,
      title: proposalData.title,
      description: proposalData.description,
      status: proposalData.status as any,
      proposer: proposalData.proposer,
      startBlock: proposalData.startBlock,
      endBlock: proposalData.endBlock,
      forVotes: Number(ethers.formatEther(proposalData.forVotes)),
      againstVotes: Number(ethers.formatEther(proposalData.againstVotes)),
      abstainVotes: Number(ethers.formatEther(proposalData.abstainVotes)),
      createdAt: proposalData.createdAt,
      executedAt: proposalData.executedAt,
    };
  } catch (error) {
    console.error('Error fetching proposal:', error);
    throw error;
  }
}

/**
 * Fetch proposal from Snapshot
 */
export async function fetchSnapshotProposal(
  proposalId: string,
  space?: string
): Promise<Proposal> {
  try {
    const snapshotProposal = await mcpServers.governancePlatform.getSnapshotProposal(proposalId);

    if (!snapshotProposal) {
      throw new Error(`Snapshot proposal ${proposalId} not found`);
    }

    return {
      id: snapshotProposal.id,
      title: snapshotProposal.title,
      description: snapshotProposal.body,
      status: snapshotProposal.state.toUpperCase() as any,
      proposer: snapshotProposal.author,
      startBlock: snapshotProposal.start,
      endBlock: snapshotProposal.end,
      forVotes: snapshotProposal.scores[0] || 0,
      againstVotes: snapshotProposal.scores[1] || 0,
      abstainVotes: snapshotProposal.scores[2] || 0,
      createdAt: snapshotProposal.start,
    };
  } catch (error) {
    console.error('Error fetching Snapshot proposal:', error);
    throw error;
  }
}

/**
 * Analyze financial impact of a proposal
 */
export async function analyzeFinancialImpact(
  proposalId: string,
  treasuryData: { treasury: string }
): Promise<FinancialImpact> {
  try {
    // Get treasury balance
    const treasury = await mcpServers.blockchainData.getTreasuryBalance(treasuryData.treasury);

    // Get proposal details
    const proposal = await fetchProposal(proposalId, treasuryData.treasury);

    // Parse proposal description for financial keywords and amounts
    const description = proposal.description.toLowerCase();
    let estimatedCost = 0;
    let affectedTokens: string[] = [];
    let breakdownByToken: any[] = [];

    // Extract token amounts from description
    const amountRegex = /(\d+(?:,\d+)*(?:\.\d+)?)\s*(eth|usdc|usdt|dai|btc)/gi;
    const matchesArray = Array.from(description.matchAll(amountRegex));

    for (const match of matchesArray) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      const token = match[2].toUpperCase();

      if (!affectedTokens.includes(token)) {
        affectedTokens.push(token);
      }

      // Get token price from treasury data
      const treasuryToken = treasury.tokens.find((t) => t.symbol === token);
      const priceUSD = treasuryToken?.priceUSD || 0;
      const valueUSD = amount * priceUSD;

      estimatedCost += valueUSD;
      breakdownByToken.push({
        token,
        amount,
        valueUSD,
      });
    }

    // If no amounts found, estimate based on keywords
    if (estimatedCost === 0) {
      if (description.includes('million')) {
        estimatedCost = 1000000;
      } else if (description.includes('thousand')) {
        estimatedCost = 100000;
      } else {
        estimatedCost = 10000; // Default estimate
      }
    }

    // Calculate treasury impact as percentage
    const treasuryImpact = estimatedCost / treasury.totalValueUSD;

    // Calculate risk score
    let riskScore = 0;
    if (treasuryImpact > 0.2) riskScore += 0.4;
    else if (treasuryImpact > 0.1) riskScore += 0.25;
    else if (treasuryImpact > 0.05) riskScore += 0.15;

    if (estimatedCost > 1000000) riskScore += 0.3;
    else if (estimatedCost > 500000) riskScore += 0.2;

    if (affectedTokens.length > 2) riskScore += 0.1;

    return {
      proposalId,
      estimatedCost,
      treasuryImpact,
      riskScore: Math.min(riskScore, 1),
      affectedTokens: affectedTokens.length > 0 ? affectedTokens : ['ETH', 'USDC'],
      projectedValue: treasury.totalValueUSD - estimatedCost,
      breakdownByToken: breakdownByToken.length > 0 ? breakdownByToken : undefined,
    };
  } catch (error) {
    console.error('Error analyzing financial impact:', error);
    throw error;
  }
}

/**
 * Assess security risks of a proposal using Risk Assessment MCP
 */
export async function assessSecurityRisk(
  proposalId: string,
  proposalContent: string
): Promise<SecurityRisk> {
  try {
    // Use Risk Assessment MCP server
    const riskAssessment = await mcpServers.riskAssessment.assessProposalRisk({
      id: proposalId,
      title: 'Proposal Analysis',
      description: proposalContent,
    });

    return {
      riskLevel: riskAssessment.riskLevel,
      concerns: riskAssessment.riskCategories.security.factors,
      securityScore: riskAssessment.riskCategories.security.score,
      recommendations: riskAssessment.recommendations,
    };
  } catch (error) {
    console.error('Error assessing security risk:', error);
    
    // Fallback to basic analysis
    const concerns: string[] = [];
    let score = 0;

    if (proposalContent.toLowerCase().includes('mint')) {
      concerns.push('Proposal involves token minting - verify inflation impact');
      score += 0.3;
    }
    if (proposalContent.toLowerCase().includes('burn')) {
      concerns.push('Proposal involves token burning - verify liquidity impact');
      score += 0.2;
    }
    if (proposalContent.toLowerCase().includes('upgrade')) {
      concerns.push('Proposal involves contract upgrade - verify audit status');
      score += 0.4;
    }
    if (proposalContent.toLowerCase().includes('admin')) {
      concerns.push('Proposal modifies admin permissions - high security risk');
      score += 0.5;
    }

    const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' =
      score > 0.7 ? 'CRITICAL' : score > 0.5 ? 'HIGH' : score > 0.3 ? 'MEDIUM' : 'LOW';

    return {
      riskLevel,
      concerns,
      securityScore: score,
      recommendations: concerns.map((c) => `Review: ${c}`),
    };
  }
}

/**
 * Get treasury balance and composition
 */
export async function getTreasuryBalance(daoAddress: string): Promise<{
  totalValue: number;
  tokens: Array<{ symbol: string; balance: number; value: number }>;
}> {
  try {
    const treasuryData = await mcpServers.blockchainData.getTreasuryBalance(daoAddress);

    return {
      totalValue: treasuryData.totalValueUSD,
      tokens: treasuryData.tokens.map((token: any) => ({
        symbol: token.symbol,
        balance: Number(ethers.formatUnits(token.balance, token.decimals)),
        value: token.valueUSD,
      })),
    };
  } catch (error) {
    console.error('Error fetching treasury balance:', error);
    throw error;
  }
}

/**
 * Get voting power for an address
 */
export async function getVotingPower(
  address: string,
  blockNumber?: number
): Promise<{
  address: string;
  votingPower: number;
  delegatedVotes: number;
  tokenBalance: number;
}> {
  try {
    const votingPowerData = await mcpServers.blockchainData.getVotingPower(address, blockNumber);

    return {
      address: votingPowerData.address,
      votingPower: Number(ethers.formatEther(votingPowerData.votingPower)),
      delegatedVotes: Number(ethers.formatEther(votingPowerData.delegatedVotes)),
      tokenBalance: Number(ethers.formatEther(votingPowerData.tokenBalance)),
    };
  } catch (error) {
    console.error('Error fetching voting power:', error);
    throw error;
  }
}

/**
 * Get proposal votes and voting analysis
 */
export async function getProposalVotes(proposalId: string): Promise<{
  totalVotes: number;
  votes: Array<{
    voter: string;
    support: 'FOR' | 'AGAINST' | 'ABSTAIN';
    votes: number;
    reason?: string;
  }>;
  votingDistribution: {
    forPercentage: number;
    againstPercentage: number;
    abstainPercentage: number;
  };
}> {
  try {
    const votesData = await mcpServers.blockchainData.getProposalVotes(proposalId);

    const votes = votesData.votes.map((vote: any) => ({
      voter: vote.voter,
      support: vote.support,
      votes: Number(ethers.formatEther(vote.votes)),
      reason: vote.reason,
    }));

    const totalForVotes = votes.filter((v: any) => v.support === 'FOR').reduce((sum: number, v: any) => sum + v.votes, 0);
    const totalAgainstVotes = votes.filter((v: any) => v.support === 'AGAINST').reduce((sum: number, v: any) => sum + v.votes, 0);
    const totalAbstainVotes = votes.filter((v: any) => v.support === 'ABSTAIN').reduce((sum: number, v: any) => sum + v.votes, 0);
    const totalVotesPower = totalForVotes + totalAgainstVotes + totalAbstainVotes;

    return {
      totalVotes: votesData.totalVotes,
      votes,
      votingDistribution: {
        forPercentage: (totalForVotes / totalVotesPower) * 100,
        againstPercentage: (totalAgainstVotes / totalVotesPower) * 100,
        abstainPercentage: (totalAbstainVotes / totalVotesPower) * 100,
      },
    };
  } catch (error) {
    console.error('Error fetching proposal votes:', error);
    return {
      totalVotes: 0,
      votes: [],
      votingDistribution: {
        forPercentage: 0,
        againstPercentage: 0,
        abstainPercentage: 0,
      },
    };
  }
}

/**
 * Execute a vote on-chain (HIGH RISK - requires approval)
 */
export async function executeVote(
  proposalId: string,
  vote: 'FOR' | 'AGAINST' | 'ABSTAIN',
  voterAddress: string,
  reason?: string
): Promise<{ txHash: string; status: string }> {
  // This is a high-risk operation and should require approval
  console.warn('[HIGH RISK] Vote execution requested but not implemented for security');
  console.log(`Would execute vote ${vote} on proposal ${proposalId} from ${voterAddress}`);

  // In production, this would:
  // 1. Require user approval via guardrails
  // 2. Connect to user's wallet via WalletConnect
  // 3. Sign the transaction
  // 4. Submit to the DAO governance contract
  // 5. Return the transaction hash

  return {
    txHash: '0x' + 'pending'.repeat(16),
    status: 'SIMULATION_ONLY',
  };
}

/**
 * Generate voting recommendation based on analysis
 */
export async function generateVotingRecommendation(
  proposalId: string,
  analysis: {
    financialImpact: FinancialImpact;
    securityRisk: SecurityRisk;
    userPreferences: Record<string, unknown>;
  }
): Promise<{
  recommendation: 'FOR' | 'AGAINST' | 'ABSTAIN';
  confidence: number;
  reasoning: string[];
}> {
  const reasoning: string[] = [];
  let score = 0;

  // Financial analysis
  if (analysis.financialImpact.riskScore < 0.3) {
    reasoning.push('✓ Low financial risk detected');
    score += 2;
  } else if (analysis.financialImpact.riskScore > 0.7) {
    reasoning.push('✗ High financial risk detected');
    score -= 2;
  } else {
    reasoning.push('~ Moderate financial risk');
  }

  // Treasury impact analysis
  if (analysis.financialImpact.treasuryImpact < 0.05) {
    reasoning.push('✓ Minimal treasury impact (<5%)');
    score += 1;
  } else if (analysis.financialImpact.treasuryImpact > 0.15) {
    reasoning.push('✗ Significant treasury impact (>15%)');
    score -= 1;
  }

  // Security analysis
  if (analysis.securityRisk.riskLevel === 'LOW') {
    reasoning.push('✓ Low security risk');
    score += 1;
  } else if (analysis.securityRisk.riskLevel === 'HIGH' || analysis.securityRisk.riskLevel === 'CRITICAL') {
    reasoning.push('✗ High security concerns identified');
    score -= 2;
  } else {
    reasoning.push('~ Moderate security concerns');
  }

  // Add specific concerns
  if (analysis.securityRisk.concerns.length > 0) {
    reasoning.push(`⚠ ${analysis.securityRisk.concerns.length} security concerns identified`);
  }

  // User preferences (simple implementation)
  const riskTolerance = (analysis.userPreferences.riskTolerance as string) || 'medium';
  if (riskTolerance === 'conservative' && analysis.financialImpact.riskScore > 0.5) {
    score -= 1;
    reasoning.push('⚠ Risk exceeds conservative profile');
  } else if (riskTolerance === 'aggressive' && analysis.financialImpact.riskScore < 0.3) {
    score += 0.5;
    reasoning.push('✓ Aligns with aggressive risk profile');
  }

  // Determine recommendation
  const recommendation: 'FOR' | 'AGAINST' | 'ABSTAIN' =
    score > 1 ? 'FOR' : score < -1 ? 'AGAINST' : 'ABSTAIN';

  // Calculate confidence
  const confidence = Math.min(0.95, 0.5 + Math.abs(score) * 0.15);

  return {
    recommendation,
    confidence,
    reasoning,
  };
}

/**
 * Get historical proposal data for comparison
 */
export async function getHistoricalProposals(
  daoAddress: string,
  limit: number = 10
): Promise<Proposal[]> {
  try {
    // This would fetch from The Graph or governance platform
    // For now, return empty array
    console.log(`Fetching ${limit} historical proposals for DAO ${daoAddress}`);
    return [];
  } catch (error) {
    console.error('Error fetching historical proposals:', error);
    return [];
  }
}

/**
 * Compare proposal against similar historical proposals
 */
export async function compareWithHistory(
  proposalId: string,
  historicalProposals: Proposal[]
): Promise<{
  similarProposals: Array<{
    id: string;
    similarity: number;
    outcome: string;
  }>;
  insights: string[];
}> {
  try {
    // Simple keyword-based similarity (in production, use ML embeddings)
    const currentProposal = await fetchProposal(proposalId, '');
    const currentWords = new Set(
      currentProposal.description.toLowerCase().split(/\s+/)
    );

    const similarProposals = historicalProposals
      .map((p) => {
        const proposalWords = new Set(p.description.toLowerCase().split(/\s+/));
        const intersection = new Set(
          Array.from(currentWords).filter((word) => proposalWords.has(word))
        );
        const similarity = intersection.size / Math.max(currentWords.size, proposalWords.size);

        return {
          id: p.id,
          similarity,
          outcome: p.status,
        };
      })
      .filter((p) => p.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    const insights = [
      `Found ${similarProposals.length} similar historical proposals`,
      `Average similarity: ${(
        similarProposals.reduce((sum, p) => sum + p.similarity, 0) /
        similarProposals.length
      ).toFixed(2)}`,
    ];

    return {
      similarProposals,
      insights,
    };
  } catch (error) {
    console.error('Error comparing with history:', error);
    return {
      similarProposals: [],
      insights: ['Unable to fetch historical comparison'],
    };
  }
}

// Export MCP servers for direct use
export { mcpServers };

