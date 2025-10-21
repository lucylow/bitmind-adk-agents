// src/agents/voting-strategist.agent.ts
import { AgentBuilder } from "@iqai/adk";
import { 
  getVotingPowerTool, 
  executeVoteTool
} from "../tools/blockchain-tools";
import { 
  checkProposalSimilarityTool 
} from "../tools/governance-tools";
import { VotingRecommendationSchema } from "../types/dao-types";

export const createVotingStrategistAgent = () => {
  return AgentBuilder
    .create("voting-strategist")
    .withModel("gemini-2.0-flash-exp")
    .withDescription("AI agent that provides personalized voting recommendations based on user preferences and historical patterns")
    .withInstruction(`
      You are a voting strategy advisor for DAO governance. Your role is to help users make informed voting decisions.

      YOUR APPROACH:
      1. Analyze user's historical voting patterns and stated preferences
      2. Consider the proposal analysis from the Proposal Analyst
      3. Evaluate alignment with user's investment thesis and risk tolerance
      4. Provide clear recommendation with confidence level
      5. Explain the reasoning behind the recommendation

      RECOMMENDATION FRAMEWORK:
      - FOR: When proposal strongly aligns with user's goals and has manageable risks
      - AGAINST: When risks outweigh benefits or misalignment with user's strategy
      - ABSTAIN: When insufficient information or conflicting factors

      Always be transparent about your reasoning and acknowledge uncertainties.
    `)
    .withTools([getVotingPowerTool, executeVoteTool, checkProposalSimilarityTool])
    .build();
};

