/**
 * Personalization Engine Feature
 * Learns from user behavior and provides personalized recommendations
 */

import { AgentBuilder, BaseTool, Agent } from '../core/agent-builder';
import { z } from 'zod';

// User Profile Interface
export interface UserProfile {
  userId: string;
  expertiseLevel: 'beginner' | 'intermediate' | 'expert' | 'technical';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  focusAreas: string[];
  votingHistory: VotingRecord[];
  preferences: UserPreferences;
  learningProfile: LearningProfile;
}

export interface VotingRecord {
  proposalId: string;
  vote: 'FOR' | 'AGAINST' | 'ABSTAIN';
  confidence: number;
  timestamp: Date;
  category: string;
  outcome?: 'passed' | 'failed';
}

export interface UserPreferences {
  timePreference: 'quick' | 'balanced' | 'thorough';
  delegationPreference: 'never' | 'sometimes' | 'often';
  notificationFrequency: 'realtime' | 'daily' | 'weekly';
  focusCategories: string[];
  riskThreshold: number; // 0-1
}

export interface LearningProfile {
  consistencyScore: number; // 0-1
  engagementLevel: 'low' | 'medium' | 'high';
  learningVelocity: number; // How quickly user adapts
  votingPatterns: Record<string, number>; // Category -> tendency
}

// In-memory storage (replace with database in production)
const userProfiles = new Map<string, UserProfile>();

// Tool: Update voting pattern
export const updateVotingPatternTool: BaseTool = {
  name: 'update_voting_pattern',
  description: 'Update user\'s voting pattern based on recent activity',
  inputSchema: z.object({
    userId: z.string(),
    proposalId: z.string(),
    vote: z.enum(['FOR', 'AGAINST', 'ABSTAIN']),
    confidence: z.number().min(0).max(1),
    category: z.string(),
    timeSpent: z.number().optional().describe('Seconds spent analyzing')
  }),
  execute: async ({ userId, proposalId, vote, confidence, category, timeSpent }) => {
    const profile = getUserProfile(userId);
    
    // Add voting record
    const record: VotingRecord = {
      proposalId,
      vote,
      confidence,
      timestamp: new Date(),
      category
    };
    
    profile.votingHistory.push(record);
    
    // Update learning profile
    updateLearningProfile(profile, record, timeSpent);
    
    // Calculate new consistency score
    const newConsistencyScore = calculateConsistencyScore(profile.votingHistory);
    profile.learningProfile.consistencyScore = newConsistencyScore;
    
    // Update voting patterns by category
    updateCategoryPatterns(profile, category, vote);
    
    // Save profile
    userProfiles.set(userId, profile);
    
    return {
      patternUpdated: true,
      newConsistencyScore,
      totalVotes: profile.votingHistory.length,
      categoryTendency: profile.learningProfile.votingPatterns[category] || 0,
      learningPoints: identifyLearningPoints(record, profile)
    };
  }
};

// Tool: Get personalized recommendation
export const getPersonalizedRecommendationTool: BaseTool = {
  name: 'get_personalized_recommendation',
  description: 'Get recommendation tailored to user\'s historical preferences',
  inputSchema: z.object({
    userId: z.string(),
    proposal: z.any(),
    context: z.enum(['quick', 'detailed', 'delegation']).optional()
  }),
  execute: async ({ userId, proposal, context }) => {
    const profile = getUserProfile(userId);
    
    // Find similar past proposals
    const similarity = await findSimilarProposals(proposal, profile.votingHistory);
    
    // Analyze proposal for user
    const analysis = analyzeForUser(proposal, profile);
    
    // Generate context-specific tips
    const contextTips = getContextTips(context || 'balanced', profile);
    
    // Check if delegation might be appropriate
    const delegationAdvice = shouldConsiderDelegation(proposal, profile);
    
    return {
      personalized: true,
      baseRecommendation: analysis.recommendation,
      reasoning: analysis.reasoning,
      similarPastVotes: similarity.matches,
      confidenceBoost: similarity.confidence,
      contextTips,
      delegationAdvice,
      riskAlignment: analysis.riskAlignment,
      categoryMatch: profile.focusAreas.includes(proposal.category)
    };
  }
};

// Tool: Update user preferences
export const updateUserPreferencesTool: BaseTool = {
  name: 'update_user_preferences',
  description: 'Update user preferences based on feedback or explicit settings',
  inputSchema: z.object({
    userId: z.string(),
    preferences: z.object({
      timePreference: z.enum(['quick', 'balanced', 'thorough']).optional(),
      delegationPreference: z.enum(['never', 'sometimes', 'often']).optional(),
      notificationFrequency: z.enum(['realtime', 'daily', 'weekly']).optional(),
      focusCategories: z.array(z.string()).optional(),
      riskThreshold: z.number().min(0).max(1).optional()
    })
  }),
  execute: async ({ userId, preferences }) => {
    const profile = getUserProfile(userId);
    
    // Update preferences
    Object.assign(profile.preferences, preferences);
    
    // Save profile
    userProfiles.set(userId, profile);
    
    return {
      updated: true,
      newPreferences: profile.preferences,
      message: 'Preferences updated successfully'
    };
  }
};

// Tool: Analyze learning progress
export const analyzeLearningProgressTool: BaseTool = {
  name: 'analyze_learning_progress',
  description: 'Analyze user\'s learning progress and engagement over time',
  inputSchema: z.object({
    userId: z.string(),
    timeframe: z.enum(['week', 'month', 'quarter', 'all']).optional()
  }),
  execute: async ({ userId, timeframe = 'month' }) => {
    const profile = getUserProfile(userId);
    
    // Filter votes by timeframe
    const filteredVotes = filterByTimeframe(profile.votingHistory, timeframe);
    
    // Calculate metrics
    const metrics = {
      totalVotes: filteredVotes.length,
      averageConfidence: calculateAverageConfidence(filteredVotes),
      categoryDistribution: getCategoryDistribution(filteredVotes),
      consistencyScore: profile.learningProfile.consistencyScore,
      engagementLevel: profile.learningProfile.engagementLevel,
      expertiseProgression: estimateExpertiseProgression(profile)
    };
    
    // Generate insights
    const insights = generateLearningInsights(metrics, profile);
    
    return {
      metrics,
      insights,
      recommendations: generateImprovementRecommendations(metrics, profile)
    };
  }
};

// Helper Functions

function getUserProfile(userId: string): UserProfile {
  if (!userProfiles.has(userId)) {
    // Create default profile
    const defaultProfile: UserProfile = {
      userId,
      expertiseLevel: 'intermediate',
      riskTolerance: 'moderate',
      focusAreas: [],
      votingHistory: [],
      preferences: {
        timePreference: 'balanced',
        delegationPreference: 'sometimes',
        notificationFrequency: 'daily',
        focusCategories: [],
        riskThreshold: 0.5
      },
      learningProfile: {
        consistencyScore: 0.5,
        engagementLevel: 'medium',
        learningVelocity: 0.5,
        votingPatterns: {}
      }
    };
    userProfiles.set(userId, defaultProfile);
  }
  
  return userProfiles.get(userId)!;
}

function calculateConsistencyScore(votingHistory: VotingRecord[]): number {
  if (votingHistory.length < 2) return 0.5;
  
  // Group by category
  const categoryVotes = new Map<string, VotingRecord[]>();
  votingHistory.forEach(record => {
    if (!categoryVotes.has(record.category)) {
      categoryVotes.set(record.category, []);
    }
    categoryVotes.get(record.category)!.push(record);
  });
  
  // Calculate consistency within each category
  let totalConsistency = 0;
  let categoryCount = 0;
  
  categoryVotes.forEach(votes => {
    if (votes.length < 2) return;
    
    const forVotes = votes.filter(v => v.vote === 'FOR').length;
    const againstVotes = votes.filter(v => v.vote === 'AGAINST').length;
    const abstainVotes = votes.filter(v => v.vote === 'ABSTAIN').length;
    
    const maxVoteType = Math.max(forVotes, againstVotes, abstainVotes);
    const consistency = maxVoteType / votes.length;
    
    totalConsistency += consistency;
    categoryCount++;
  });
  
  return categoryCount > 0 ? totalConsistency / categoryCount : 0.5;
}

function updateLearningProfile(
  profile: UserProfile,
  record: VotingRecord,
  timeSpent?: number
): void {
  // Update engagement level based on activity
  const recentVotes = profile.votingHistory.slice(-10);
  if (recentVotes.length >= 8) {
    profile.learningProfile.engagementLevel = 'high';
  } else if (recentVotes.length >= 4) {
    profile.learningProfile.engagementLevel = 'medium';
  } else {
    profile.learningProfile.engagementLevel = 'low';
  }
  
  // Update learning velocity based on confidence trends
  if (profile.votingHistory.length >= 5) {
    const recentConfidence = recentVotes.slice(-5).reduce((sum, v) => sum + v.confidence, 0) / 5;
    const olderConfidence = profile.votingHistory.slice(-10, -5).reduce((sum, v) => sum + v.confidence, 0) / 5;
    
    if (recentConfidence > olderConfidence) {
      profile.learningProfile.learningVelocity = Math.min(1, profile.learningProfile.learningVelocity + 0.1);
    }
  }
}

function updateCategoryPatterns(profile: UserProfile, category: string, vote: string): void {
  if (!profile.learningProfile.votingPatterns[category]) {
    profile.learningProfile.votingPatterns[category] = 0;
  }
  
  // Update tendency: FOR = +1, AGAINST = -1, ABSTAIN = 0
  const voteValue = vote === 'FOR' ? 1 : vote === 'AGAINST' ? -1 : 0;
  const currentPattern = profile.learningProfile.votingPatterns[category];
  
  // Weighted average (70% current, 30% new)
  profile.learningProfile.votingPatterns[category] = currentPattern * 0.7 + voteValue * 0.3;
}

function identifyLearningPoints(record: VotingRecord, profile: UserProfile): string[] {
  const points: string[] = [];
  
  if (record.confidence < 0.5) {
    points.push('Consider researching this category more to improve confidence');
  }
  
  if (profile.votingHistory.length >= 5) {
    const categoryVotes = profile.votingHistory.filter(v => v.category === record.category);
    if (categoryVotes.length === 1) {
      points.push(`First vote in ${record.category} category - great to explore new areas!`);
    }
  }
  
  if (profile.learningProfile.engagementLevel === 'high') {
    points.push('High engagement detected - you\'re becoming a power user!');
  }
  
  return points;
}

async function findSimilarProposals(
  proposal: any,
  votingHistory: VotingRecord[]
): Promise<{ matches: VotingRecord[], confidence: number }> {
  // Simple similarity matching based on category
  const matches = votingHistory.filter(record => 
    record.category === proposal.category
  ).slice(-5); // Last 5 similar votes
  
  const confidence = matches.length > 0 ? Math.min(1, matches.length / 5) : 0;
  
  return { matches, confidence };
}

function analyzeForUser(proposal: any, profile: UserProfile): {
  recommendation: string,
  reasoning: string[],
  riskAlignment: number
} {
  const reasoning: string[] = [];
  let recommendation = 'ABSTAIN';
  
  // Check category alignment
  if (profile.focusAreas.includes(proposal.category)) {
    reasoning.push(`Aligns with your focus area: ${proposal.category}`);
  }
  
  // Check risk alignment
  const proposalRisk = proposal.riskScore || 0.5;
  const riskAlignment = 1 - Math.abs(proposalRisk - getRiskThresholdValue(profile.riskTolerance));
  
  if (riskAlignment > 0.7) {
    reasoning.push(`Risk level matches your ${profile.riskTolerance} tolerance`);
  }
  
  // Check historical patterns
  const categoryPattern = profile.learningProfile.votingPatterns[proposal.category];
  if (categoryPattern !== undefined) {
    if (categoryPattern > 0.3) {
      recommendation = 'FOR';
      reasoning.push(`Your voting history suggests support for ${proposal.category} proposals`);
    } else if (categoryPattern < -0.3) {
      recommendation = 'AGAINST';
      reasoning.push(`Your voting history suggests caution with ${proposal.category} proposals`);
    }
  }
  
  return { recommendation, reasoning, riskAlignment };
}

function getRiskThresholdValue(tolerance: string): number {
  const values = {
    conservative: 0.3,
    moderate: 0.5,
    aggressive: 0.7
  };
  return values[tolerance as keyof typeof values] || 0.5;
}

function getContextTips(context: string, profile: UserProfile): string[] {
  const tips: string[] = [];
  
  if (context === 'quick') {
    tips.push('Focus on the executive summary and key metrics');
    tips.push('Check the risk level and treasury impact first');
    if (profile.votingHistory.length > 10) {
      tips.push('Based on your history, trust your instinct on this category');
    }
  } else if (context === 'detailed') {
    tips.push('Review the full proposal documentation');
    tips.push('Compare with similar past proposals');
    tips.push('Consider the long-term strategic implications');
  } else if (context === 'delegation') {
    tips.push('Review delegate alignment with your values');
    tips.push('Check delegate\'s track record in this category');
  }
  
  return tips;
}

function shouldConsiderDelegation(proposal: any, profile: UserProfile): {
  shouldDelegate: boolean,
  reason: string
} {
  // Check delegation preference
  if (profile.preferences.delegationPreference === 'never') {
    return { shouldDelegate: false, reason: 'User prefers to vote directly' };
  }
  
  // Check expertise level vs proposal complexity
  if (proposal.complexity === 'high' && profile.expertiseLevel === 'beginner') {
    return { 
      shouldDelegate: true, 
      reason: 'High complexity proposal may benefit from expert delegation' 
    };
  }
  
  // Check time preference
  if (profile.preferences.timePreference === 'quick' && proposal.lengthMinutes > 20) {
    return { 
      shouldDelegate: true, 
      reason: 'Proposal requires significant time to review properly' 
    };
  }
  
  return { shouldDelegate: false, reason: 'You have sufficient knowledge to vote directly' };
}

function filterByTimeframe(votingHistory: VotingRecord[], timeframe: string): VotingRecord[] {
  const now = new Date();
  const cutoffDate = new Date(now);
  
  switch (timeframe) {
    case 'week':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    default:
      return votingHistory;
  }
  
  return votingHistory.filter(record => new Date(record.timestamp) >= cutoffDate);
}

function calculateAverageConfidence(votes: VotingRecord[]): number {
  if (votes.length === 0) return 0;
  return votes.reduce((sum, v) => sum + v.confidence, 0) / votes.length;
}

function getCategoryDistribution(votes: VotingRecord[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  votes.forEach(vote => {
    distribution[vote.category] = (distribution[vote.category] || 0) + 1;
  });
  return distribution;
}

function estimateExpertiseProgression(profile: UserProfile): {
  current: string,
  nextLevel: string,
  progress: number
} {
  const levels = ['beginner', 'intermediate', 'expert', 'technical'];
  const currentIndex = levels.indexOf(profile.expertiseLevel);
  
  // Progress based on vote count, consistency, and confidence
  const voteProgress = Math.min(1, profile.votingHistory.length / 50);
  const consistencyProgress = profile.learningProfile.consistencyScore;
  const avgConfidence = calculateAverageConfidence(profile.votingHistory);
  
  const overallProgress = (voteProgress + consistencyProgress + avgConfidence) / 3;
  
  return {
    current: profile.expertiseLevel,
    nextLevel: currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 'technical',
    progress: overallProgress
  };
}

function generateLearningInsights(metrics: any, profile: UserProfile): string[] {
  const insights: string[] = [];
  
  if (metrics.averageConfidence < 0.5) {
    insights.push('💡 Your confidence is growing - keep learning about proposals before voting');
  } else if (metrics.averageConfidence > 0.8) {
    insights.push('🌟 High confidence levels - you\'re becoming a governance expert!');
  }
  
  if (metrics.consistencyScore > 0.7) {
    insights.push('🎯 Strong voting consistency - you have clear preferences');
  }
  
  if (metrics.engagementLevel === 'high') {
    insights.push('🚀 Excellent engagement! You\'re an active DAO member');
  }
  
  const topCategory = Object.entries(metrics.categoryDistribution)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0];
  
  if (topCategory) {
    insights.push(`📊 Most active in ${topCategory[0]} category`);
  }
  
  return insights;
}

function generateImprovementRecommendations(metrics: any, profile: UserProfile): string[] {
  const recommendations: string[] = [];
  
  if (metrics.totalVotes < 5) {
    recommendations.push('Vote on more proposals to build your governance profile');
  }
  
  const categoryCount = Object.keys(metrics.categoryDistribution).length;
  if (categoryCount < 3) {
    recommendations.push('Explore proposals in different categories to broaden expertise');
  }
  
  if (metrics.averageConfidence < 0.6) {
    recommendations.push('Spend more time researching proposals to increase confidence');
  }
  
  return recommendations;
}

/**
 * Create Personalization Engine Agent
 */
export function createPersonalizationEngineAgent(): Agent {
  return AgentBuilder
    .create('personalization-engine')
    .withName('PersonalizationEngine')
    .withDescription('Learns from user behavior and provides personalized governance recommendations')
    .withModel('gemini-2.5-flash')
    .withInstruction(`
      You manage user preferences and voting patterns to provide personalized recommendations.
      
      TRACKING DIMENSIONS:
      1. **Risk Tolerance**: Conservative → Moderate → Aggressive
      2. **Focus Areas**: Categories user cares most about (DeFi, Infrastructure, Grants, Governance)
      3. **Voting History**: Pattern analysis and consistency over time
      4. **Time Preference**: Quick decisions vs deep analysis vs thorough research
      5. **Delegation Preferences**: When to delegate vs vote directly
      6. **Learning Progress**: Expertise growth and engagement evolution
      
      PERSONALIZATION APPROACH:
      - Learn continuously from every interaction
      - Adapt recommendations based on historical patterns
      - Respect user preferences and constraints
      - Provide insights on learning progress
      - Suggest optimizations based on behavior
      
      PRIVACY & ETHICS:
      - User data stays private and secure
      - Transparent about what we track and why
      - Users can modify or delete their data anytime
      - Personalization enhances, never manipulates
      
      Always provide context for why a recommendation is personalized to build trust.
    `)
    .withTools([
      updateVotingPatternTool,
      getPersonalizedRecommendationTool,
      updateUserPreferencesTool,
      analyzeLearningProgressTool
    ])
    .withMemory({
      type: 'long-term',
      maxEntries: 200
    })
    .withTemperature(0.5) // Balanced for consistency and personalization
    .withMaxTokens(4096)
    .build();
}

/**
 * Export singleton instance
 */
export const personalizationEngine = createPersonalizationEngineAgent();

/**
 * Helper function to get personalized recommendation
 */
export async function getPersonalizedGuidance(
  userId: string,
  proposal: any,
  context?: 'quick' | 'detailed' | 'delegation'
) {
  const prompt = `
    Generate a personalized recommendation for user ${userId} on this proposal:
    
    ${JSON.stringify(proposal, null, 2)}
    
    Context: ${context || 'balanced analysis'}
    
    Provide personalized insights based on their history and preferences.
  `;
  
  return personalizationEngine.run(prompt, { userId, proposal, context });
}

/**
 * Usage Examples
 */
export const PERSONALIZATION_EXAMPLES = {
  trackVote: `
    await updateVotingPatternTool.execute({
      userId: 'user123',
      proposalId: 'prop-456',
      vote: 'FOR',
      confidence: 0.85,
      category: 'treasury',
      timeSpent: 420 // 7 minutes
    });
  `,
  
  getRecommendation: `
    const recommendation = await getPersonalizedGuidance(
      'user123',
      proposalData,
      'quick'
    );
  `,
  
  analyzeLearning: `
    const progress = await analyzeLearningProgressTool.execute({
      userId: 'user123',
      timeframe: 'month'
    });
  `
};

