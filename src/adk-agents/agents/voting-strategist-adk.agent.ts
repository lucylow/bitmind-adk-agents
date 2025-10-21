/**
 * ADK-TS Voting Strategist Agent
 * Generates personalized voting recommendations using AI and user history
 */

import { AgentBuilder } from '../core/agent-builder';
import { UserPreferenceMemory } from '../core/memory';
import {
  generateVotingRecommendationTool,
  getHistoricalVotingPatternsTool,
  getProposalVotingPowerTool,
  analyzeProposalSentimentTool,
} from '../tools/stacks-blockchain-tools';
import type { Agent } from '../core/agent-builder';

const VOTING_STRATEGIST_INSTRUCTIONS = `
You are an expert Voting Strategist Agent that provides personalized voting recommendations for DAO members.

Your responsibilities:
1. Analyze proposal details and implications
2. Review user's historical voting patterns and preferences
3. Calculate voting power and delegation effects
4. Assess community sentiment and momentum
5. Generate personalized recommendations with confidence scores

Recommendation Framework:
- User Alignment: Match proposal to user's historical preferences
- Risk-Reward Analysis: Evaluate potential outcomes
- Community Dynamics: Consider voting trends and large holder positions
- Strategic Timing: Assess when to vote for maximum impact

Recommendation Types:
- FOR: Strong alignment with user interests and DAO benefit
- AGAINST: Misalignment with user values or DAO risks
- ABSTAIN: Insufficient information or neutral impact

Confidence Levels:
- 0.9-1.0: Very high confidence, clear alignment
- 0.7-0.89: High confidence, strong indicators
- 0.5-0.69: Moderate confidence, mixed signals
- Below 0.5: Low confidence, requires human review

Always provide:
1. Clear recommendation (FOR/AGAINST/ABSTAIN)
2. Confidence score with explanation
3. Key reasoning points (3-5 bullets)
4. Alternative perspectives
5. Risk assessment
`;

export function createVotingStrategistAgent(): Agent {
  return AgentBuilder
    .create('voting-strategist-adk')
    .withName('VotingStrategistAgent')
    .withDescription('AI-powered agent that generates personalized voting recommendations based on user preferences and DAO dynamics')
    .withModel('gemini-2.5-flash')
    .withInstructions(VOTING_STRATEGIST_INSTRUCTIONS)
    .withTools([
      generateVotingRecommendationTool,
      getHistoricalVotingPatternsTool,
      getProposalVotingPowerTool,
      analyzeProposalSentimentTool,
    ])
    .withMemory({
      type: 'long-term',
      maxEntries: 1000, // Store more entries for user preferences
    })
    .withTemperature(0.5) // Balanced temperature for strategic thinking
    .withMaxTokens(4096)
    .build();
}

export const votingStrategistAgentADK = createVotingStrategistAgent();

// User preference memory for personalization
export const userPreferenceMemory = new UserPreferenceMemory({
  type: 'long-term',
  maxEntries: 10000,
});

// Helper function for generating recommendations
export async function generateRecommendation(
  proposalId: string,
  userAddress: string,
  proposalAnalysis: {
    financialImpact: any;
    securityRisk: any;
  }
) {
  const agent = votingStrategistAgentADK;
  
  // Retrieve user preferences
  const userPreferences = await userPreferenceMemory.getUserPreference(userAddress);
  const votingHistory = await userPreferenceMemory.getVotingHistory(userAddress);

  const prompt = `
Generate a personalized voting recommendation for proposal ${proposalId}.

User: ${userAddress}
User Preferences: ${JSON.stringify(userPreferences)}
Voting History: ${votingHistory.length} previous votes

Proposal Analysis:
- Financial Impact: ${JSON.stringify(proposalAnalysis.financialImpact)}
- Security Risk: ${JSON.stringify(proposalAnalysis.securityRisk)}

Provide:
1. Recommendation (FOR/AGAINST/ABSTAIN)
2. Confidence score (0-1)
3. Key reasoning (3-5 points)
4. Alternative perspectives
5. Risk assessment

Consider the user's historical patterns and stated preferences.
  `.trim();

  return agent.run(prompt, {
    proposalId,
    userAddress,
    userPreferences,
    proposalAnalysis,
  });
}

// Helper to update user preferences based on feedback
export async function updateUserPreferences(
  userAddress: string,
  feedback: {
    proposalId: string;
    actualVote: 'FOR' | 'AGAINST' | 'ABSTAIN';
    satisfactionScore: number; // 0-1
    feedbackNotes?: string;
  }
) {
  // Store voting history
  await userPreferenceMemory.storeVotingHistory(userAddress, {
    proposalId: feedback.proposalId,
    vote: feedback.actualVote,
    timestamp: Date.now(),
  });

  // Update preferences based on feedback
  const currentPreferences = await userPreferenceMemory.getUserPreference(userAddress);
  
  // Learning logic - adjust preferences based on satisfaction
  const updatedPreferences = {
    ...currentPreferences,
    lastFeedback: feedback,
    totalFeedbacks: ((currentPreferences.totalFeedbacks as number) || 0) + 1,
    averageSatisfaction: (
      (((currentPreferences.averageSatisfaction as number) || 0.5) * ((currentPreferences.totalFeedbacks as number) || 0) +
        feedback.satisfactionScore) /
      (((currentPreferences.totalFeedbacks as number) || 0) + 1)
    ),
  };

  await userPreferenceMemory.storeUserPreference(userAddress, updatedPreferences);

  return updatedPreferences;
}

// Example usage patterns
export const USAGE_EXAMPLES = {
  basicRecommendation: `
const recommendation = await generateRecommendation(
  'prop-001',
  'SP2X...USER',
  { financialImpact: {...}, securityRisk: {...} }
);
  `,
  
  withFeedback: `
// After user votes, update preferences
await updateUserPreferences('SP2X...USER', {
  proposalId: 'prop-001',
  actualVote: 'FOR',
  satisfactionScore: 0.9,
  feedbackNotes: 'Good recommendation!'
});
  `,
  
  batchRecommendations: `
// Generate recommendations for multiple proposals
const proposals = await getActiveProposals(daoAddress);
const recommendations = await Promise.all(
  proposals.map(p => generateRecommendation(p.id, userAddress, p.analysis))
);
  `,
};
