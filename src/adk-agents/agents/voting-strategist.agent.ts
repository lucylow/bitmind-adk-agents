import { z } from 'zod';
import { generateVotingRecommendation } from '../tools/dao-tools';
import { auditLogger } from '../audit/audit-schema';

export const VotingRecommendationSchema = z.object({
  proposalId: z.string(),
  recommendation: z.enum(['FOR', 'AGAINST', 'ABSTAIN']),
  confidence: z.number().min(0).max(1),
  reasoning: z.array(z.string()),
  riskAssessment: z.string(),
  alternativeViews: z.array(z.string()),
});

export type VotingRecommendation = z.infer<typeof VotingRecommendationSchema>;

export class VotingStrategistAgent {
  private agentId = 'voting-strategist-001';
  private agentName = 'VotingStrategist';

  async generateRecommendation(
    proposalId: string,
    analysis: {
      financialImpact: { proposalId: string; estimatedCost: number; treasuryImpact: number; riskScore: number; affectedTokens: string[]; };
      securityRisk: { riskLevel: string; concerns: string[] };
      userPreferences: Record<string, unknown>;
    }
  ): Promise<VotingRecommendation> {
    try {
      const baseRecommendation = await generateVotingRecommendation(
        proposalId,
        analysis
      );

      // Generate alternative views
      const alternativeViews = this.generateAlternativeViews(analysis);

      // Generate risk assessment
      const riskAssessment = this.assessVotingRisk(analysis);

      const recommendation: VotingRecommendation = {
        proposalId,
        recommendation: baseRecommendation.recommendation,
        confidence: baseRecommendation.confidence,
        reasoning: baseRecommendation.reasoning,
        riskAssessment,
        alternativeViews,
      };

      // Log the recommendation
      auditLogger.log({
        agentId: this.agentId,
        agentName: this.agentName,
        actionType: 'AGENT_RUN',
        inputs: { proposalId, analysis },
        outputs: recommendation,
        modelVersion: '1.0.0',
        confidence: recommendation.confidence,
        status: 'SUCCESS',
      });

      return recommendation;
    } catch (error) {
      auditLogger.log({
        agentId: this.agentId,
        agentName: this.agentName,
        actionType: 'AGENT_RUN',
        inputs: { proposalId },
        modelVersion: '1.0.0',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  private generateAlternativeViews(analysis: {
    financialImpact: { estimatedCost: number; treasuryImpact: number; riskScore: number };
    securityRisk: { riskLevel: string; concerns: string[] };
    userPreferences: Record<string, unknown>;
  }): string[] {
    const views: string[] = [];

    // Conservative view
    if (analysis.securityRisk.riskLevel === 'HIGH') {
      views.push(
        'Conservative view: Vote AGAINST due to high security risks'
      );
    }

    // Aggressive view
    if (analysis.financialImpact.treasuryImpact > 0) {
      views.push(
        'Aggressive view: Vote FOR to maximize treasury growth potential'
      );
    }

    // Balanced view
    views.push(
      'Balanced view: Consider the long-term strategic value beyond immediate financial metrics'
    );

    return views;
  }

  private assessVotingRisk(analysis: {
    financialImpact: { estimatedCost: number; treasuryImpact: number; riskScore: number };
    securityRisk: { riskLevel: string; concerns: string[] };
    userPreferences: Record<string, unknown>;
  }): string {
    const riskFactors: string[] = [];

    if (analysis.financialImpact.riskScore > 0.7) {
      riskFactors.push('High financial risk');
    }

    if (analysis.securityRisk.riskLevel === 'HIGH') {
      riskFactors.push('High security risk');
    }

    if (analysis.financialImpact.estimatedCost > 1000000) {
      riskFactors.push('Large financial commitment');
    }

    if (riskFactors.length === 0) {
      return 'Low overall risk';
    }

    return `Risk factors: ${riskFactors.join(', ')}`;
  }
}

export const votingStrategistAgent = new VotingStrategistAgent();

