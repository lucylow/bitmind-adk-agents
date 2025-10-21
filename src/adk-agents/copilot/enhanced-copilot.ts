/**
 * Enhanced DAO Governance Co-pilot
 * Orchestrates all advanced features into a unified intelligent assistant
 */

import { AgentBuilder, BaseTool, Agent } from '../core/agent-builder';
import { z } from 'zod';
import { createSmartSummarizerAgent } from '../features/smart-summarizer';
import { createPersonalizationEngineAgent } from '../features/personalization-engine';
import { createGovernanceAlertAgent } from '../features/governance-alerts';
import { crossDAOAnalytics } from '../features/cross-dao-analytics';
import { delegationAdvisor } from '../features/delegation-advisor';

// Co-pilot interaction modes
export type InteractionMode = 'quick' | 'analysis' | 'learning' | 'strategy';

export interface CoPilotContext {
  userId: string;
  mode?: InteractionMode;
  userProfile?: any;
  currentProposal?: any;
  timeConstraint?: number; // minutes
  expertiseLevel?: string;
}

export interface CoPilotResponse {
  mode: InteractionMode;
  primaryResponse: string;
  insights: string[];
  recommendations: string[];
  nextSteps: string[];
  metadata: Record<string, any>;
}

// Tool: Route to appropriate mode
export const routeUserScenarioTool: BaseTool = {
  name: 'route_user_scenario',
  description: 'Analyze user message and context to determine optimal response mode',
  inputSchema: z.object({
    message: z.string(),
    userHistory: z.any().optional(),
    currentProposals: z.array(z.any()).optional(),
    timeAvailable: z.number().optional().describe('Minutes available')
  }),
  execute: async ({ message, userHistory, currentProposals, timeAvailable }) => {
    const urgency = detectUrgency(message, currentProposals);
    const complexity = detectComplexity(message);
    const userExpertise = estimateExpertise(userHistory);
    const intent = detectUserIntent(message);
    
    const recommendedMode = selectOptimalMode(
      urgency,
      complexity,
      userExpertise,
      timeAvailable,
      intent
    );
    
    return {
      recommendedMode,
      urgency,
      complexity,
      userExpertise,
      intent,
      timeEstimate: estimateTimeRequired(complexity),
      suggestedActions: generateActionSuggestions(urgency, currentProposals),
      priority: determinePriority(urgency, complexity)
    };
  }
};

// Tool: Orchestrate multi-agent response
export const orchestrateResponseTool: BaseTool = {
  name: 'orchestrate_response',
  description: 'Coordinate multiple specialized agents to provide comprehensive response',
  inputSchema: z.object({
    query: z.string(),
    context: z.any(),
    requiredAgents: z.array(z.string()).describe('Which agents to consult')
  }),
  execute: async ({ query, context, requiredAgents }) => {
    const agentResponses: Record<string, any> = {};
    
    // Execute agents in parallel where possible
    const agentPromises: Promise<any>[] = [];
    
    if (requiredAgents.includes('summarizer')) {
      agentPromises.push(
        (async () => {
          const agent = createSmartSummarizerAgent();
          const response = await agent.run(query, context);
          agentResponses.summarizer = response;
        })()
      );
    }
    
    if (requiredAgents.includes('personalization')) {
      agentPromises.push(
        (async () => {
          const agent = createPersonalizationEngineAgent();
          const response = await agent.run(query, context);
          agentResponses.personalization = response;
        })()
      );
    }
    
    if (requiredAgents.includes('alerts')) {
      agentPromises.push(
        (async () => {
          const agent = createGovernanceAlertAgent();
          const response = await agent.run(query, context);
          agentResponses.alerts = response;
        })()
      );
    }
    
    if (requiredAgents.includes('crossDAO')) {
      agentPromises.push(
        (async () => {
          // TODO: Implement createCrossDAOAnalystAgent
          // const agent = createCrossDAOAnalystAgent();
          // const response = await agent.run(query, context);
          agentResponses.crossDAO = {
            content: 'Cross-DAO analysis not yet implemented',
            metadata: { tokensUsed: 0, model: 'placeholder', timestamp: Date.now() }
          };
        })()
      );
    }
    
    if (requiredAgents.includes('delegation')) {
      agentPromises.push(
        (async () => {
          // TODO: Implement createDelegationAdvisorAgent
          // const agent = createDelegationAdvisorAgent();
          // const response = await agent.run(query, context);
          agentResponses.delegation = {
            content: 'Delegation advisor not yet implemented',
            metadata: { tokensUsed: 0, model: 'placeholder', timestamp: Date.now() }
          };
        })()
      );
    }
    
    await Promise.all(agentPromises);
    
    // Synthesize responses
    const synthesis = synthesizeAgentResponses(agentResponses, context);
    
    return {
      agentResponses,
      synthesis,
      confidence: calculateOverallConfidence(agentResponses),
      completeness: assessResponseCompleteness(agentResponses, requiredAgents)
    };
  }
};

// Helper Functions

function detectUrgency(message: string, currentProposals?: any[]): 'low' | 'medium' | 'high' {
  const urgentKeywords = ['urgent', 'asap', 'deadline', 'ends soon', 'quick', 'fast'];
  const messageLower = message.toLowerCase();
  
  if (urgentKeywords.some(keyword => messageLower.includes(keyword))) {
    return 'high';
  }
  
  if (currentProposals && currentProposals.some(p => {
    const hoursRemaining = (new Date(p.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursRemaining < 24;
  })) {
    return 'high';
  }
  
  if (messageLower.includes('soon') || messageLower.includes('today')) {
    return 'medium';
  }
  
  return 'low';
}

function detectComplexity(message: string): 'low' | 'medium' | 'high' {
  const technicalKeywords = [
    'contract', 'implementation', 'technical', 'security', 'audit',
    'mechanism', 'protocol', 'architecture', 'bytecode'
  ];
  
  const strategicKeywords = [
    'strategy', 'long-term', 'roadmap', 'vision', 'ecosystem',
    'partnership', 'collaboration', 'impact'
  ];
  
  const messageLower = message.toLowerCase();
  const technicalCount = technicalKeywords.filter(kw => messageLower.includes(kw)).length;
  const strategicCount = strategicKeywords.filter(kw => messageLower.includes(kw)).length;
  
  if (technicalCount >= 3 || strategicCount >= 3) return 'high';
  if (technicalCount >= 1 || strategicCount >= 1) return 'medium';
  return 'low';
}

function estimateExpertise(userHistory?: any): 'beginner' | 'intermediate' | 'expert' {
  if (!userHistory) return 'intermediate';
  
  const voteCount = userHistory.votes?.length || 0;
  const avgConfidence = userHistory.avgConfidence || 0.5;
  
  if (voteCount > 50 && avgConfidence > 0.8) return 'expert';
  if (voteCount > 20 && avgConfidence > 0.6) return 'intermediate';
  return 'beginner';
}

function detectUserIntent(message: string): string {
  const intentPatterns = {
    'learn': ['what is', 'explain', 'how does', 'teach me', 'understand'],
    'decide': ['should i', 'recommend', 'vote', 'decision', 'choose'],
    'analyze': ['analyze', 'assess', 'evaluate', 'review', 'compare'],
    'delegate': ['delegate', 'delegation', 'representative', 'trust'],
    'monitor': ['track', 'monitor', 'watch', 'alert', 'notify'],
    'strategy': ['strategy', 'plan', 'approach', 'long-term', 'optimize']
  };
  
  const messageLower = message.toLowerCase();
  
  for (const [intent, keywords] of Object.entries(intentPatterns)) {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      return intent;
    }
  }
  
  return 'general';
}

function selectOptimalMode(
  urgency: string,
  complexity: string,
  expertise: string,
  timeAvailable?: number,
  intent?: string
): InteractionMode {
  // Quick mode for urgent + time-constrained
  if (urgency === 'high' || (timeAvailable && timeAvailable < 10)) {
    return 'quick';
  }
  
  // Learning mode for beginners or learn intent
  if (expertise === 'beginner' || intent === 'learn') {
    return 'learning';
  }
  
  // Strategy mode for long-term planning
  if (intent === 'strategy' || complexity === 'high') {
    return 'strategy';
  }
  
  // Default to analysis mode
  return 'analysis';
}

function estimateTimeRequired(complexity: string): number {
  const estimates = {
    low: 2,
    medium: 5,
    high: 10
  };
  return estimates[complexity as keyof typeof estimates] || 5;
}

function generateActionSuggestions(urgency: string, currentProposals?: any[]): string[] {
  const suggestions: string[] = [];
  
  if (urgency === 'high') {
    suggestions.push('Review key points immediately');
    suggestions.push('Check voting deadline');
    suggestions.push('Consider quick decision framework');
  } else {
    suggestions.push('Review full proposal documentation');
    suggestions.push('Compare with similar past proposals');
    suggestions.push('Consult community discussion');
  }
  
  return suggestions;
}

function determinePriority(urgency: string, complexity: string): 'low' | 'medium' | 'high' | 'critical' {
  if (urgency === 'high' && complexity === 'high') return 'critical';
  if (urgency === 'high') return 'high';
  if (complexity === 'high') return 'medium';
  return 'low';
}

function synthesizeAgentResponses(
  agentResponses: Record<string, any>,
  context: any
): {
  summary: string,
  keyInsights: string[],
  recommendations: string[],
  confidence: number
} {
  const insights: string[] = [];
  const recommendations: string[] = [];
  
  // Extract insights from each agent
  Object.entries(agentResponses).forEach(([agent, response]) => {
    if (response && response.content) {
      // Parse key points from response
      const lines = response.content.split('\n').filter((l: string) => l.trim());
      insights.push(`[${agent}] ${lines[0]}`);
    }
  });
  
  // Generate unified recommendations
  recommendations.push('Based on multi-agent analysis, consider all perspectives');
  
  const summary = `Analyzed request using ${Object.keys(agentResponses).length} specialized agents. 
                   ${insights.length} key insights generated.`;
  
  return {
    summary: summary.trim(),
    keyInsights: insights,
    recommendations,
    confidence: 0.85
  };
}

function calculateOverallConfidence(agentResponses: Record<string, any>): number {
  // Simple average of agent confidences
  const confidences = Object.values(agentResponses).map(
    (r: any) => r.metadata?.confidence || 0.7
  );
  
  if (confidences.length === 0) return 0.7;
  
  return confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
}

function assessResponseCompleteness(
  agentResponses: Record<string, any>,
  requiredAgents: string[]
): number {
  const completed = requiredAgents.filter(agent => agentResponses[agent]).length;
  return completed / requiredAgents.length;
}

/**
 * Create Enhanced Co-pilot Agent
 */
export function createEnhancedCoPilot(): Agent {
  return AgentBuilder
    .create('enhanced-dao-copilot')
    .withName('EnhancedDAOCoPilot')
    .withDescription('Advanced DAO Governance Co-pilot with personalized intelligence and cross-DAO insights')
    .withModel('gemini-2.5-flash')
    .withInstruction(`
      You are the ultimate DAO Governance Co-pilot, combining multiple intelligent systems 
      to provide comprehensive governance assistance.

      INTELLIGENT FEATURES:
      🧠 **Adaptive Communication**: Tailor explanations to user expertise level
      📊 **Personalized Insights**: Learn from user's voting patterns and preferences
      🔔 **Proactive Alerts**: Monitor governance and send timely notifications
      🌐 **Cross-DAO Intelligence**: Learn from governance patterns across ecosystems
      🤝 **Delegation Strategy**: Smart delegation recommendations and monitoring

      INTERACTION MODES:
      1. **Quick Mode**: TL;DR summaries and immediate recommendations
         - For time-sensitive decisions (<10 min available)
         - High urgency situations (deadlines < 24 hrs)
         - Simple yes/no decisions
         
      2. **Analysis Mode**: Deep dives with comparative analysis
         - Standard governance participation
         - Moderate complexity proposals
         - Sufficient time for review
         
      3. **Learning Mode**: Educational content for newcomers
         - Beginners or those explicitly asking to learn
         - Complex concepts requiring explanation
         - Building governance expertise
         
      4. **Strategy Mode**: Long-term governance strategy planning
         - High complexity strategic decisions
         - Cross-DAO comparisons
         - Delegation optimization
         - Long-term participation planning

      ORCHESTRATION STRATEGY:
      - Analyze user intent and context first
      - Route to appropriate mode automatically
      - Engage relevant specialized agents
      - Synthesize multi-agent insights
      - Provide unified, actionable response
      - Track effectiveness for continuous improvement

      COMMUNICATION PRINCIPLES:
      - Match user's expertise and time constraints
      - Provide clear, actionable recommendations
      - Explain reasoning transparently
      - Respect user autonomy and preferences
      - Learn and adapt from every interaction

      ALWAYS:
      - Ask clarifying questions when context is unclear
      - Provide confidence levels for recommendations
      - Offer alternative perspectives
      - Highlight key decision factors
      - Suggest next steps

      You are not just an assistant - you're a trusted governance partner that grows with the user.
    `)
    .withTools([
      routeUserScenarioTool,
      orchestrateResponseTool
    ])
    .withMemory({
      type: 'long-term',
      maxEntries: 200
    })
    .withTemperature(0.7) // Balanced for adaptive interaction
    .withMaxTokens(8192) // Larger for comprehensive responses
    .build();
}

/**
 * Enhanced Co-pilot Manager Class
 * Provides high-level interface for co-pilot interactions
 */
export class EnhancedCoPilotManager {
  private coPilot: Agent;
  private specializedAgents: Map<string, Agent>;
  
  constructor() {
    this.coPilot = createEnhancedCoPilot();
    this.specializedAgents = new Map([
      ['summarizer', createSmartSummarizerAgent()],
      ['personalization', createPersonalizationEngineAgent()],
      ['alerts', createGovernanceAlertAgent()],
      // TODO: Implement these agents
      // ['crossDAO', createCrossDAOAnalystAgent()],
      // ['delegation', createDelegationAdvisorAgent()]
    ]);
  }

  /**
   * Main entry point for user queries
   */
  async handleQuery(
    message: string,
    context: CoPilotContext
  ): Promise<CoPilotResponse> {
    // Route to appropriate mode
    const routing = await routeUserScenarioTool.execute({
      message,
      userHistory: context.userProfile,
      currentProposals: context.currentProposal ? [context.currentProposal] : [],
      timeAvailable: context.timeConstraint
    });
    
    const mode = routing.recommendedMode as InteractionMode;
    
    // Determine which agents to engage
    const requiredAgents = this.selectRequiredAgents(mode, routing.intent);
    
    // Orchestrate multi-agent response
    const orchestration = await orchestrateResponseTool.execute({
      query: message,
      context,
      requiredAgents
    });
    
    // Format final response
    return this.formatResponse(
      mode,
      orchestration,
      routing,
      context
    );
  }

  /**
   * Quick analysis for time-sensitive decisions
   */
  async quickAnalysis(proposalId: string, userId: string): Promise<string> {
    const context: CoPilotContext = {
      userId,
      mode: 'quick',
      timeConstraint: 5
    };
    
    const result = await this.handleQuery(
      `Quick analysis of proposal ${proposalId}`,
      context
    );
    
    return result.primaryResponse;
  }

  /**
   * Setup personalized monitoring
   */
  async setupMonitoring(
    userId: string,
    interests: string[],
    preferences: any
  ): Promise<void> {
    const alertAgent = this.specializedAgents.get('alerts')!;
    
    await alertAgent.run(`
      Setup monitoring for user ${userId}:
      - Interests: ${interests.join(', ')}
      - Preferences: ${JSON.stringify(preferences)}
    `, { userId, interests, preferences });
  }

  /**
   * Get learning progress report
   */
  async getLearningProgress(userId: string): Promise<any> {
    const personalizationAgent = this.specializedAgents.get('personalization')!;
    
    const response = await personalizationAgent.run(
      `Generate learning progress report for user ${userId}`,
      { userId, action: 'analyze_progress' }
    );
    
    return response;
  }

  /**
   * Compare with other DAOs
   */
  async compareWithOtherDAOs(
    proposalDescription: string,
    currentDAO: string
  ): Promise<any> {
    const crossDAOAgent = this.specializedAgents.get('crossDAO')!;
    
    const response = await crossDAOAgent.run(`
      Find similar proposals in other DAOs and compare outcomes:
      Proposal: ${proposalDescription}
      Current DAO: ${currentDAO}
    `, { proposalDescription, currentDAO });
    
    return response;
  }

  /**
   * Get delegation recommendation
   */
  async getDelegationAdvice(
    userId: string,
    proposalId?: string,
    userContext?: any
  ): Promise<any> {
    const delegationAgent = this.specializedAgents.get('delegation')!;
    
    const response = await delegationAgent.run(`
      Should user ${userId} delegate for ${proposalId || 'general governance'}?
      Context: ${JSON.stringify(userContext || {})}
    `, { userId, proposalId, userContext });
    
    return response;
  }

  // Private helper methods

  private selectRequiredAgents(mode: InteractionMode, intent: string): string[] {
    const baseAgents = ['summarizer', 'personalization'];
    
    switch (mode) {
      case 'quick':
        return baseAgents;
        
      case 'analysis':
        return [...baseAgents, 'crossDAO'];
        
      case 'learning':
        return [...baseAgents, 'crossDAO'];
        
      case 'strategy':
        return ['summarizer', 'personalization', 'crossDAO', 'delegation', 'alerts'];
        
      default:
        return baseAgents;
    }
  }

  private formatResponse(
    mode: InteractionMode,
    orchestration: any,
    routing: any,
    context: CoPilotContext
  ): CoPilotResponse {
    const insights: string[] = [];
    const recommendations: string[] = [];
    const nextSteps: string[] = [];
    
    // Extract from synthesis
    if (orchestration.synthesis) {
      insights.push(...orchestration.synthesis.keyInsights);
      recommendations.push(...orchestration.synthesis.recommendations);
    }
    
    // Add mode-specific next steps
    nextSteps.push(...this.getModeSpecificNextSteps(mode, routing));
    
    return {
      mode,
      primaryResponse: orchestration.synthesis?.summary || 'Analysis complete',
      insights,
      recommendations,
      nextSteps,
      metadata: {
        confidence: orchestration.confidence,
        completeness: orchestration.completeness,
        routing,
        timestamp: new Date().toISOString()
      }
    };
  }

  private getModeSpecificNextSteps(mode: InteractionMode, routing: any): string[] {
    const steps: string[] = [];
    
    switch (mode) {
      case 'quick':
        steps.push('Make decision based on key factors');
        steps.push('Vote before deadline');
        break;
        
      case 'analysis':
        steps.push('Review detailed analysis');
        steps.push('Compare with similar proposals');
        steps.push('Participate in community discussion');
        break;
        
      case 'learning':
        steps.push('Read educational resources');
        steps.push('Ask follow-up questions');
        steps.push('Practice with low-stakes votes');
        break;
        
      case 'strategy':
        steps.push('Develop long-term governance strategy');
        steps.push('Set up monitoring and alerts');
        steps.push('Consider delegation optimization');
        break;
    }
    
    return steps;
  }
}

/**
 * Export singleton manager instance
 */
export const coPilotManager = new EnhancedCoPilotManager();

/**
 * Convenience function for quick access
 */
export async function askCoPilot(
  message: string,
  userId: string,
  context?: Partial<CoPilotContext>
): Promise<CoPilotResponse> {
  return coPilotManager.handleQuery(message, {
    userId,
    ...context
  });
}

/**
 * Usage Examples
 */
export const ENHANCED_COPILOT_EXAMPLES = {
  quickQuestion: `
    const response = await askCoPilot(
      "Should I vote FOR proposal #123?",
      "user123",
      { timeConstraint: 5, mode: 'quick' }
    );
  `,
  
  deepAnalysis: `
    const response = await coPilotManager.handleQuery(
      "Analyze the treasury diversification proposal and compare with other DAOs",
      { userId: "user123", mode: 'analysis' }
    );
  `,
  
  learningMode: `
    const response = await askCoPilot(
      "Explain how DAO voting works and what I should consider",
      "newbie123",
      { expertiseLevel: 'beginner', mode: 'learning' }
    );
  `,
  
  strategyPlanning: `
    const response = await coPilotManager.handleQuery(
      "Help me develop a governance participation strategy for the next quarter",
      { userId: "user123", mode: 'strategy' }
    );
  `
};

