import { z } from 'zod';

/**
 * Risk Assessment MCP Server
 * Provides risk analysis for DAO proposals and treasury operations
 */

export interface RiskAssessmentConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  riskThresholds?: {
    low: number;
    medium: number;
    high: number;
  };
}

export const RiskAssessmentSchema = z.object({
  proposalId: z.string(),
  overallRiskScore: z.number().min(0).max(1),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  riskCategories: z.object({
    financial: z.object({
      score: z.number().min(0).max(1),
      factors: z.array(z.string()),
    }),
    security: z.object({
      score: z.number().min(0).max(1),
      factors: z.array(z.string()),
    }),
    governance: z.object({
      score: z.number().min(0).max(1),
      factors: z.array(z.string()),
    }),
    execution: z.object({
      score: z.number().min(0).max(1),
      factors: z.array(z.string()),
    }),
  }),
  recommendations: z.array(z.string()),
  mitigationStrategies: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  analysisTimestamp: z.number(),
});

export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;

export const TreasuryRiskSchema = z.object({
  daoAddress: z.string(),
  overallHealthScore: z.number().min(0).max(1),
  riskFactors: z.array(
    z.object({
      category: z.string(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      description: z.string(),
      impact: z.string(),
    })
  ),
  diversificationScore: z.number().min(0).max(1),
  liquidityScore: z.number().min(0).max(1),
  volatilityScore: z.number().min(0).max(1),
  recommendations: z.array(z.string()),
  alerts: z.array(z.string()),
  lastAssessed: z.number(),
});

export type TreasuryRisk = z.infer<typeof TreasuryRiskSchema>;

export class RiskAssessmentMCPServer {
  private config: RiskAssessmentConfig;
  private riskThresholds: { low: number; medium: number; high: number };

  constructor(config: RiskAssessmentConfig) {
    this.config = config;
    this.riskThresholds = config.riskThresholds || {
      low: 0.3,
      medium: 0.6,
      high: 0.8,
    };
  }

  /**
   * Assess risks for a DAO proposal
   */
  async assessProposalRisk(proposal: {
    id: string;
    title: string;
    description: string;
    financialImpact?: {
      estimatedCost: number;
      treasuryImpact: number;
      affectedTokens: string[];
    };
    executionActions?: Array<{
      target: string;
      value: string;
      signature: string;
      calldata: string;
    }>;
  }): Promise<RiskAssessment> {
    // Financial risk analysis
    const financialRisk = this.assessFinancialRisk(proposal);

    // Security risk analysis
    const securityRisk = this.assessSecurityRisk(proposal);

    // Governance risk analysis
    const governanceRisk = this.assessGovernanceRisk(proposal);

    // Execution risk analysis
    const executionRisk = this.assessExecutionRisk(proposal);

    // Calculate overall risk score
    const overallRiskScore =
      (financialRisk.score * 0.3 +
        securityRisk.score * 0.35 +
        governanceRisk.score * 0.2 +
        executionRisk.score * 0.15);

    const riskLevel = this.calculateRiskLevel(overallRiskScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      financialRisk,
      securityRisk,
      governanceRisk,
      executionRisk
    );

    // Generate mitigation strategies
    const mitigationStrategies = this.generateMitigationStrategies(
      riskLevel,
      financialRisk,
      securityRisk,
      governanceRisk,
      executionRisk
    );

    return RiskAssessmentSchema.parse({
      proposalId: proposal.id,
      overallRiskScore,
      riskLevel,
      riskCategories: {
        financial: financialRisk,
        security: securityRisk,
        governance: governanceRisk,
        execution: executionRisk,
      },
      recommendations,
      mitigationStrategies,
      confidence: 0.85,
      analysisTimestamp: Math.floor(Date.now() / 1000),
    });
  }

  /**
   * Assess treasury health and risks
   */
  async assessTreasuryRisk(treasury: {
    daoAddress: string;
    totalValueUSD: number;
    tokens: Array<{
      symbol: string;
      valueUSD: number;
      balance: string;
    }>;
  }): Promise<TreasuryRisk> {
    const riskFactors: TreasuryRisk['riskFactors'] = [];
    const recommendations: string[] = [];
    const alerts: string[] = [];

    // Calculate diversification
    const diversificationScore = this.calculateDiversification(treasury.tokens);
    if (diversificationScore < 0.5) {
      riskFactors.push({
        category: 'Diversification',
        severity: 'MEDIUM',
        description: 'Treasury is not well diversified',
        impact: 'High exposure to single asset volatility',
      });
      recommendations.push('Diversify treasury holdings across multiple assets');
    }

    // Calculate liquidity
    const liquidityScore = this.calculateLiquidity(treasury.tokens);
    if (liquidityScore < 0.6) {
      riskFactors.push({
        category: 'Liquidity',
        severity: 'HIGH',
        description: 'Low stablecoin reserves',
        impact: 'Limited ability to handle immediate obligations',
      });
      recommendations.push('Increase stablecoin reserves to at least 30% of treasury');
      alerts.push('⚠️ Low liquidity - consider increasing stable reserves');
    }

    // Calculate volatility exposure
    const volatilityScore = this.calculateVolatilityExposure(treasury.tokens);
    if (volatilityScore > 0.7) {
      riskFactors.push({
        category: 'Volatility',
        severity: 'MEDIUM',
        description: 'High exposure to volatile assets',
        impact: 'Treasury value subject to significant market fluctuations',
      });
      recommendations.push('Consider hedging strategies for volatile assets');
    }

    // Check for concentration risk
    const maxConcentration = Math.max(
      ...treasury.tokens.map((t) => t.valueUSD / treasury.totalValueUSD)
    );
    if (maxConcentration > 0.6) {
      riskFactors.push({
        category: 'Concentration',
        severity: 'HIGH',
        description: 'Single asset represents >60% of treasury',
        impact: 'Excessive exposure to single asset risk',
      });
      alerts.push('🚨 High concentration risk detected');
    }

    const overallHealthScore =
      (diversificationScore * 0.3 + liquidityScore * 0.4 + (1 - volatilityScore) * 0.3);

    return TreasuryRiskSchema.parse({
      daoAddress: treasury.daoAddress,
      overallHealthScore,
      riskFactors,
      diversificationScore,
      liquidityScore,
      volatilityScore,
      recommendations,
      alerts,
      lastAssessed: Math.floor(Date.now() / 1000),
    });
  }

  /**
   * Compare proposal against historical similar proposals
   */
  async compareWithHistoricalProposals(
    proposalId: string,
    historicalProposals: Array<{
      id: string;
      outcome: 'SUCCEEDED' | 'DEFEATED' | 'EXECUTED' | 'FAILED';
      riskScore: number;
    }>
  ): Promise<{
    similarProposals: Array<{
      id: string;
      similarity: number;
      outcome: string;
      riskScore: number;
    }>;
    successProbability: number;
    insights: string[];
  }> {
    // Simple mock implementation - in production would use ML embeddings
    const similarProposals = historicalProposals
      .map((p) => ({
        ...p,
        similarity: Math.random() * 0.5 + 0.5, // Mock similarity score
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    const successfulCount = similarProposals.filter(
      (p) => p.outcome === 'SUCCEEDED' || p.outcome === 'EXECUTED'
    ).length;

    const successProbability = successfulCount / similarProposals.length;

    const insights = [
      `${successfulCount}/${similarProposals.length} similar proposals succeeded`,
      `Average risk score of similar proposals: ${(
        similarProposals.reduce((sum, p) => sum + p.riskScore, 0) /
        similarProposals.length
      ).toFixed(2)}`,
    ];

    return {
      similarProposals,
      successProbability,
      insights,
    };
  }

  // Private analysis methods

  private assessFinancialRisk(proposal: any): {
    score: number;
    factors: string[];
  } {
    const factors: string[] = [];
    let score = 0;

    if (proposal.financialImpact) {
      const { estimatedCost, treasuryImpact } = proposal.financialImpact;

      if (estimatedCost > 1000000) {
        factors.push('Large financial commitment (>$1M)');
        score += 0.3;
      }

      if (Math.abs(treasuryImpact) > 0.15) {
        factors.push('Significant treasury impact (>15%)');
        score += 0.4;
      }

      if (estimatedCost > 0 && estimatedCost < 10000) {
        factors.push('Small transaction - minimal financial risk');
      }
    }

    // Check proposal content for financial keywords
    const description = proposal.description.toLowerCase();
    if (description.includes('mint') || description.includes('emission')) {
      factors.push('Token minting detected - potential inflation risk');
      score += 0.2;
    }

    if (description.includes('burn') || description.includes('buyback')) {
      factors.push('Token burn detected - verify liquidity impact');
      score += 0.1;
    }

    return { score: Math.min(score, 1), factors };
  }

  private assessSecurityRisk(proposal: any): {
    score: number;
    factors: string[];
  } {
    const factors: string[] = [];
    let score = 0;

    const description = proposal.description.toLowerCase();

    // Check for contract upgrades
    if (
      description.includes('upgrade') ||
      description.includes('proxy') ||
      description.includes('implementation')
    ) {
      factors.push('Contract upgrade detected - requires audit verification');
      score += 0.4;
    }

    // Check for permission changes
    if (
      description.includes('admin') ||
      description.includes('owner') ||
      description.includes('access control')
    ) {
      factors.push('Permission changes detected - verify security implications');
      score += 0.3;
    }

    // Check for external calls
    if (
      description.includes('external') ||
      description.includes('call') ||
      description.includes('delegate')
    ) {
      factors.push('External calls detected - potential reentrancy risk');
      score += 0.25;
    }

    // Check execution actions
    if (proposal.executionActions && proposal.executionActions.length > 0) {
      factors.push(`${proposal.executionActions.length} on-chain actions will be executed`);
      score += Math.min(proposal.executionActions.length * 0.1, 0.3);
    }

    return { score: Math.min(score, 1), factors };
  }

  private assessGovernanceRisk(proposal: any): {
    score: number;
    factors: string[];
  } {
    const factors: string[] = [];
    let score = 0;

    const description = proposal.description.toLowerCase();

    // Check for governance parameter changes
    if (
      description.includes('quorum') ||
      description.includes('threshold') ||
      description.includes('voting period')
    ) {
      factors.push('Governance parameter changes detected');
      score += 0.3;
    }

    // Check for rushed proposals
    if (description.includes('urgent') || description.includes('emergency')) {
      factors.push('Urgent/emergency proposal - may bypass normal review');
      score += 0.4;
    }

    // Check for centralization risks
    if (
      description.includes('multisig') ||
      description.includes('centralized') ||
      description.includes('single point')
    ) {
      factors.push('Potential centralization concerns');
      score += 0.2;
    }

    return { score: Math.min(score, 1), factors };
  }

  private assessExecutionRisk(proposal: any): {
    score: number;
    factors: string[];
  } {
    const factors: string[] = [];
    let score = 0;

    // Check for complex execution
    if (proposal.executionActions && proposal.executionActions.length > 3) {
      factors.push('Complex multi-step execution');
      score += 0.3;
    }

    // Check for timelock bypass
    const description = proposal.description.toLowerCase();
    if (description.includes('bypass') || description.includes('immediate')) {
      factors.push('May bypass standard timelock');
      score += 0.4;
    }

    // Check for dependencies
    if (description.includes('depend') || description.includes('prerequisite')) {
      factors.push('Has dependencies on other proposals or systems');
      score += 0.2;
    }

    return { score: Math.min(score, 1), factors };
  }

  private calculateRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < this.riskThresholds.low) return 'LOW';
    if (score < this.riskThresholds.medium) return 'MEDIUM';
    if (score < this.riskThresholds.high) return 'HIGH';
    return 'CRITICAL';
  }

  private generateRecommendations(...riskCategories: any[]): string[] {
    const recommendations: string[] = [];

    riskCategories.forEach((category) => {
      if (category.score > 0.6) {
        category.factors.forEach((factor: string) => {
          if (factor.includes('audit')) {
            recommendations.push('Request independent security audit before voting');
          }
          if (factor.includes('financial commitment')) {
            recommendations.push('Verify treasury can sustain proposed expenditure');
          }
          if (factor.includes('upgrade')) {
            recommendations.push('Review contract code changes thoroughly');
          }
        });
      }
    });

    return Array.from(new Set(recommendations));
  }

  private generateMitigationStrategies(...riskCategories: any[]): string[] {
    const strategies: string[] = [];

    const totalRisk = riskCategories.reduce((sum, cat) => sum + cat.score, 0) / riskCategories.length;

    if (totalRisk > 0.7) {
      strategies.push('Consider splitting proposal into smaller, lower-risk components');
      strategies.push('Implement gradual rollout with checkpoints');
      strategies.push('Require supermajority threshold for approval');
    }

    if (totalRisk > 0.5) {
      strategies.push('Extend voting period to allow thorough community review');
      strategies.push('Establish monitoring dashboard for post-execution tracking');
    }

    return strategies;
  }

  private calculateDiversification(tokens: any[]): number {
    if (tokens.length === 0) return 0;
    if (tokens.length === 1) return 0.2;
    if (tokens.length === 2) return 0.5;
    if (tokens.length === 3) return 0.7;
    return Math.min(0.9, 0.7 + (tokens.length - 3) * 0.05);
  }

  private calculateLiquidity(tokens: any[]): number {
    const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD'];
    const totalValue = tokens.reduce((sum, t) => sum + t.valueUSD, 0);
    const stableValue = tokens
      .filter((t) => stablecoins.includes(t.symbol))
      .reduce((sum, t) => sum + t.valueUSD, 0);

    return stableValue / totalValue;
  }

  private calculateVolatilityExposure(tokens: any[]): number {
    const volatileAssets = ['ETH', 'BTC', 'WETH', 'WBTC'];
    const totalValue = tokens.reduce((sum, t) => sum + t.valueUSD, 0);
    const volatileValue = tokens
      .filter((t) => volatileAssets.includes(t.symbol))
      .reduce((sum, t) => sum + t.valueUSD, 0);

    return volatileValue / totalValue;
  }
}

export default RiskAssessmentMCPServer;

