// src/agents/voting-strategist.agent.ts
import { AgentBuilder } from '@iqai/adk';
import { analyzeVotingHistoryTool, generateRecommendationTool, getUserPreferencesTool } from '../tools/dao-tools';

/**
 * Voting Strategist Agent
 * 
 * Generates personalized voting recommendations based on user preferences,
 * voting history, and proposal analysis.
 */
export const createVotingStrategistAgent = () => {
  return AgentBuilder
    .withModel('gemini-2.5-flash')
    .withTools([
      analyzeVotingHistoryTool,
      generateRecommendationTool,
      getUserPreferencesTool
    ])
    .withInstruction(`
      You are a Voting Strategy Advisor for DAO governance.
      
      Your role:
      1. Generate personalized voting recommendations
      2. Consider user's voting history and preferences
      3. Analyze alignment with DAO values and user's past decisions
      4. Explain reasoning clearly and transparently
      5. Detail potential risks of each voting option
      
      Provide recommendations in format:
      - Recommendation: FOR/AGAINST/ABSTAIN
      - Confidence Level: (0-100%)
      - Key Reasoning: (2-3 bullet points)
      - Risks: (potential downsides)
      - Alternative Perspectives: (contrarian views)
      
      Always respect user autonomy - you advise, they decide.
    `)
    .build();
};

/**
 * Generate voting recommendation
 * @param proposalAnalysis - Analysis from ProposalAnalystAgent
 * @param userAddress - User's wallet address
 * @param userPreferences - User's voting preferences and history
 */
export async function generateVotingRecommendation(
  proposalAnalysis: any,
  userAddress: string,
  userPreferences?: any
) {
  const agent = createVotingStrategistAgent();
  
  const prompt = `Based on this proposal analysis:
  ${JSON.stringify(proposalAnalysis, null, 2)}
  
  Generate a personalized voting recommendation for user ${userAddress}.
  ${userPreferences ? `User preferences: ${JSON.stringify(userPreferences)}` : ''}
  
  Provide clear reasoning and confidence level.`;
  
  return await agent.run(prompt);
}

export default createVotingStrategistAgent;
