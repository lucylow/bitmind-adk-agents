// src/adk-agents/voting-strategist.agent.ts
import { AgentBuilder } from "@iqai/adk";
import { z } from "zod";
import { checkVotingPowerTool } from "../tools/dao-tools";

/**
 * Voting recommendation schema
 */
export const VotingRecommendationSchema = z.object({
  proposalId: z.string(),
  recommendation: z.enum(["FOR", "AGAINST", "ABSTAIN"]),
  confidence: z.number().min(0).max(1),
  reasoning: z.array(z.string()),
  recommendedAction: z.enum(["NO_ACTION", "VOTE_FOR", "VOTE_AGAINST", "REQUEST_HUMAN_REVIEW"]),
  metadata: z.object({ modelUsed: z.string(), timestamp: z.number(), agentVersion: z.string() }),
});
export type VotingRecommendation = z.infer<typeof VotingRecommendationSchema>;

const INSTRUCTIONS = `
You are VotingStrategistAgent.
Inputs: proposalAnalysis (structured), treasuryAssessment, userPreferences (json).
1) Evaluate alignment between proposalAnalysis and userPreferences.
2) Check user's voting power (call check_voting_power).
3) Produce recommendation FOR/AGAINST/ABSTAIN with confidence and 3 bullet reasons.
4) If risk/confidence indicate, set recommendedAction to REQUEST_HUMAN_REVIEW.
Return JSON matching VotingRecommendationSchema.
`;

/**
 * Build the agent
 */
export const createVotingStrategistAgent = () =>
  AgentBuilder.create("voting-strategist")
    .withModel({ default: "gemini-2.5-flash", fallback: "gpt-4o-mini" })
    .withTools([checkVotingPowerTool])
    .withInstruction(INSTRUCTIONS)
    .build();

/**
 * Helper runner - expects parsed proposalAnalysis & treasuryAssessment from orchestrator
 */
export async function runVotingRecommendation(agent: any, proposalId: string, context: any, ctx: any = {}) {
  // context contains: proposalAnalysis, treasuryAssessment, userPreferences, userAddress
  const votingPower = await checkVotingPowerTool.execute({ address: context.userAddress }, ctx);
  const prompt = `Given proposalAnalysis: ${JSON.stringify(context.proposalAnalysis)}, treasuryAssessment: ${JSON.stringify(
    context.treasuryAssessment
  )}, userPreferences: ${JSON.stringify(context.userPreferences)}, votingPower: ${JSON.stringify(votingPower)},
Return a VotingRecommendation JSON.`;
  const res = await agent.run(prompt);
  try {
    const parsed = VotingRecommendationSchema.parse(res);
    return parsed;
  } catch (err) {
    return {
      proposalId,
      recommendation: "ABSTAIN",
      confidence: 0,
      reasoning: ["failed_to_parse"],
      recommendedAction: "REQUEST_HUMAN_REVIEW",
      metadata: { modelUsed: "unknown", timestamp: Date.now(), agentVersion: "v0.0.0" },
    } as VotingRecommendation;
  }
}

