// src/types/dao-types.ts
import { z } from "zod";

export const ProposalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  proposer: z.string(),
  startBlock: z.number(),
  endBlock: z.number(),
  forVotes: z.string(),
  againstVotes: z.string(),
  state: z.enum(['pending', 'active', 'canceled', 'defeated', 'succeeded', 'queued', 'expired', 'executed'])
});

export const VotingRecommendationSchema = z.object({
  recommendation: z.enum(['FOR', 'AGAINST', 'ABSTAIN']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  keyFactors: z.array(z.string()),
  estimatedImpact: z.string()
});

export const TreasuryAnalysisSchema = z.object({
  currentBalance: z.string(),
  proposalCost: z.string(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  sustainability: z.string()
});

export type DAOProposal = z.infer<typeof ProposalSchema>;
export type VotingRecommendation = z.infer<typeof VotingRecommendationSchema>;
export type TreasuryAnalysis = z.infer<typeof TreasuryAnalysisSchema>;

