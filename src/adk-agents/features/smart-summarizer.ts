/**
 * Smart Summarizer Feature
 * Provides intelligent, adaptive proposal summarization based on user expertise
 */

import { AgentBuilder, BaseTool, Agent } from '../core/agent-builder';
import { z } from 'zod';

// Tool: Detect user expertise level
export const detectUserExpertiseTool: BaseTool = {
  name: 'detect_user_expertise',
  description: 'Analyze user messages to determine their Web3 knowledge level',
  inputSchema: z.object({
    userMessage: z.string().describe('The user message to analyze'),
    conversationHistory: z.array(z.string()).optional().describe('Previous messages for context')
  }),
  execute: async ({ userMessage, conversationHistory }) => {
    const keywords = {
      beginner: ['what is', 'explain', 'simple', 'new to', 'how does', 'confused', 'don\'t understand'],
      intermediate: ['understand', 'familiar', 'know about', 'heard of'],
      expert: ['contract', 'gas', 'governance', 'delegate', 'quorum', 'snapshot', 'voting power'],
      technical: ['bytecode', 'opcode', 'EIP', 'upgradeable', 'proxy', 'timelock', 'multisig']
    };
    
    const lowerMessage = userMessage.toLowerCase();
    let level = 'intermediate';
    let confidence = 0.7;
    
    // Check for beginner indicators
    const beginnerMatches = keywords.beginner.filter(kw => lowerMessage.includes(kw)).length;
    if (beginnerMatches >= 2) {
      level = 'beginner';
      confidence = 0.85;
    }
    
    // Check for expert indicators
    const expertMatches = keywords.expert.filter(kw => lowerMessage.includes(kw)).length;
    if (expertMatches >= 3) {
      level = 'expert';
      confidence = 0.90;
    }
    
    // Check for technical indicators (overrides expert)
    const technicalMatches = keywords.technical.filter(kw => lowerMessage.includes(kw)).length;
    if (technicalMatches >= 2) {
      level = 'technical';
      confidence = 0.95;
    }
    
    // Factor in conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      confidence = Math.min(0.95, confidence + 0.05);
    }
    
    return {
      expertiseLevel: level,
      confidence,
      indicators: {
        beginnerSignals: beginnerMatches,
        expertSignals: expertMatches,
        technicalSignals: technicalMatches
      },
      recommendations: getSummaryRecommendations(level)
    };
  }
};

// Tool: Generate adaptive summary
export const generateAdaptiveSummaryTool: BaseTool = {
  name: 'generate_adaptive_summary',
  description: 'Generate a proposal summary tailored to the user\'s expertise level',
  inputSchema: z.object({
    proposalData: z.any().describe('The proposal data to summarize'),
    expertiseLevel: z.enum(['beginner', 'intermediate', 'expert', 'technical']).describe('User expertise level'),
    summaryType: z.enum(['tldr', 'standard', 'detailed', 'technical']).describe('Type of summary requested'),
    timeConstraint: z.number().optional().describe('Time available in minutes')
  }),
  execute: async ({ proposalData, expertiseLevel, summaryType, timeConstraint }) => {
    const summary = {
      level: expertiseLevel,
      type: summaryType,
      readTime: estimateReadTime(summaryType),
      sections: generateSummarySections(proposalData, expertiseLevel, summaryType)
    };
    
    if (timeConstraint && summary.readTime > timeConstraint) {
      summary.type = 'tldr';
      summary.readTime = 1;
      summary.sections = generateSummarySections(proposalData, expertiseLevel, 'tldr');
    }
    
    return summary;
  }
};

// Tool: Extract key voting factors
export const extractKeyVotingFactorsTool: BaseTool = {
  name: 'extract_key_voting_factors',
  description: 'Extract the most important factors that should influence voting decisions',
  inputSchema: z.object({
    proposalData: z.any().describe('The proposal data'),
    userPreferences: z.any().optional().describe('User voting preferences')
  }),
  execute: async ({ proposalData, userPreferences }) => {
    // Extract critical decision factors
    const factors = {
      financial: {
        cost: proposalData.requestedAmount || 0,
        treasuryImpact: calculateTreasuryImpact(proposalData),
        roi: estimateROI(proposalData)
      },
      risk: {
        level: assessRiskLevel(proposalData),
        factors: identifyRiskFactors(proposalData),
        mitigations: proposalData.riskMitigations || []
      },
      strategic: {
        alignment: assessStrategicAlignment(proposalData, userPreferences),
        impact: estimateStrategicImpact(proposalData),
        urgency: assessUrgency(proposalData)
      },
      community: {
        support: proposalData.communitySupport || 0.5,
        concerns: proposalData.communityConcerns || [],
        endorsements: proposalData.endorsements || []
      }
    };
    
    return {
      factors,
      topPriorities: rankFactors(factors),
      quickDecisionGuide: generateQuickGuide(factors)
    };
  }
};

// Helper functions
function getSummaryRecommendations(level: string) {
  const recommendations = {
    beginner: {
      approach: 'Use simple language, explain terms, provide analogies',
      format: 'Bullet points with clear explanations',
      focus: 'What it means and why it matters'
    },
    intermediate: {
      approach: 'Balance technical details with accessibility',
      format: 'Structured sections with key insights',
      focus: 'Impact and implications'
    },
    expert: {
      approach: 'Technical depth with governance context',
      format: 'Comprehensive analysis with data',
      focus: 'Mechanics and strategic implications'
    },
    technical: {
      approach: 'Deep technical analysis with contract details',
      format: 'Technical specifications and risk analysis',
      focus: 'Implementation details and security'
    }
  };
  
  return recommendations[level as keyof typeof recommendations] || recommendations.intermediate;
}

function estimateReadTime(summaryType: string): number {
  const times = {
    tldr: 1,
    standard: 3,
    detailed: 7,
    technical: 12
  };
  return times[summaryType as keyof typeof times] || 3;
}

function generateSummarySections(proposalData: any, level: string, type: string) {
  const sections = [];
  
  // Always include overview
  sections.push({
    title: 'Overview',
    content: proposalData.description || 'Proposal summary',
    importance: 'high'
  });
  
  if (type !== 'tldr') {
    sections.push({
      title: 'Key Points',
      content: proposalData.keyPoints || ['Main objective', 'Expected outcome'],
      importance: 'high'
    });
    
    sections.push({
      title: 'Financial Impact',
      content: proposalData.financialImpact || 'Impact analysis pending',
      importance: 'medium'
    });
  }
  
  if (type === 'detailed' || type === 'technical') {
    sections.push({
      title: 'Risk Analysis',
      content: proposalData.risks || 'Risk assessment pending',
      importance: 'medium'
    });
    
    sections.push({
      title: 'Implementation Details',
      content: proposalData.implementation || 'Details pending',
      importance: level === 'technical' ? 'high' : 'low'
    });
  }
  
  return sections;
}

function calculateTreasuryImpact(proposalData: any): number {
  const requestedAmount = proposalData.requestedAmount || 0;
  const treasurySize = proposalData.treasurySize || 1000000;
  return (requestedAmount / treasurySize) * 100;
}

function estimateROI(proposalData: any): number {
  // Simple ROI estimation
  return proposalData.estimatedROI || 0;
}

function assessRiskLevel(proposalData: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const riskScore = proposalData.riskScore || 0.3;
  if (riskScore < 0.25) return 'LOW';
  if (riskScore < 0.5) return 'MEDIUM';
  if (riskScore < 0.75) return 'HIGH';
  return 'CRITICAL';
}

function identifyRiskFactors(proposalData: any): string[] {
  return proposalData.identifiedRisks || [
    'Market volatility',
    'Execution risk',
    'Smart contract risk'
  ];
}

function assessStrategicAlignment(proposalData: any, userPreferences: any): number {
  // Simple alignment score
  if (!userPreferences) return 0.5;
  
  let score = 0.5;
  if (proposalData.category === userPreferences.preferredCategory) {
    score += 0.3;
  }
  
  return Math.min(1, score);
}

function estimateStrategicImpact(proposalData: any): 'LOW' | 'MEDIUM' | 'HIGH' {
  const impact = proposalData.strategicImpact || 'MEDIUM';
  return impact;
}

function assessUrgency(proposalData: any): 'LOW' | 'MEDIUM' | 'HIGH' {
  const votingDeadline = new Date(proposalData.votingDeadline || Date.now() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const hoursRemaining = (votingDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursRemaining < 24) return 'HIGH';
  if (hoursRemaining < 72) return 'MEDIUM';
  return 'LOW';
}

function rankFactors(factors: any): string[] {
  const rankings = [];
  
  if (factors.risk.level === 'HIGH' || factors.risk.level === 'CRITICAL') {
    rankings.push('Risk Level');
  }
  
  if (factors.financial.treasuryImpact > 10) {
    rankings.push('Treasury Impact');
  }
  
  if (factors.strategic.urgency === 'HIGH') {
    rankings.push('Urgency');
  }
  
  if (factors.community.support > 0.8) {
    rankings.push('Strong Community Support');
  } else if (factors.community.support < 0.3) {
    rankings.push('Low Community Support');
  }
  
  return rankings.length > 0 ? rankings : ['Financial Impact', 'Risk Assessment', 'Strategic Alignment'];
}

function generateQuickGuide(factors: any): string[] {
  const guide = [];
  
  guide.push(`💰 Cost: ${factors.financial.cost} (${factors.financial.treasuryImpact.toFixed(1)}% of treasury)`);
  guide.push(`⚠️  Risk: ${factors.risk.level}`);
  guide.push(`🎯 Strategic Impact: ${factors.strategic.impact}`);
  guide.push(`⏰ Urgency: ${factors.strategic.urgency}`);
  guide.push(`👥 Community Support: ${(factors.community.support * 100).toFixed(0)}%`);
  
  return guide;
}

/**
 * Create Smart Summarizer Agent
 */
export function createSmartSummarizerAgent(): Agent {
  return AgentBuilder
    .create('smart-summarizer')
    .withName('SmartSummarizer')
    .withDescription('Intelligent proposal summarization with adaptive communication')
    .withModel('gemini-2.5-flash')
    .withInstruction(`
      You are an expert at summarizing complex DAO proposals into digestible formats.
      
      ADAPTIVE SUMMARIZATION:
      - **For newcomers (beginner)**: Simple bullet points with basic explanations, avoid jargon
      - **For experts**: Technical deep dives with contract implications and governance mechanics
      - **For quick decisions (tldr)**: TL;DR format with key voting factors highlighted
      - **For deep analysis (detailed)**: Comprehensive breakdown with risk assessment and strategic context
      
      COMMUNICATION PRINCIPLES:
      1. Always match the user's expertise level
      2. Adjust detail based on time constraints
      3. Highlight the most important decision factors
      4. Use clear, accessible language unless technical depth is requested
      5. Provide context and analogies for complex concepts
      
      SUMMARY STRUCTURE:
      - Lead with the most critical information
      - Use visual hierarchy (emojis, formatting)
      - Include specific numbers and metrics
      - End with clear next steps or recommendations
      
      Always ask clarifying questions about the user's expertise level and time constraints if unclear.
    `)
    .withTools([
      detectUserExpertiseTool,
      generateAdaptiveSummaryTool,
      extractKeyVotingFactorsTool
    ])
    .withMemory({
      type: 'short-term',
      maxEntries: 50
    })
    .withTemperature(0.7) // Balanced for adaptive communication
    .withMaxTokens(4096)
    .build();
}

/**
 * Export singleton instance
 */
export const smartSummarizer = createSmartSummarizerAgent();

/**
 * Helper function for quick summarization
 */
export async function summarizeProposal(
  proposalData: any,
  userContext?: {
    expertiseLevel?: string;
    timeAvailable?: number;
    preferences?: any;
  }
) {
  const context = {
    proposalData,
    userExpertise: userContext?.expertiseLevel || 'intermediate',
    timeConstraint: userContext?.timeAvailable,
    preferences: userContext?.preferences
  };
  
  const prompt = `
    Summarize this proposal for a user with ${context.userExpertise} expertise level.
    ${context.timeConstraint ? `They have ${context.timeConstraint} minutes to review.` : ''}
    
    Proposal Data: ${JSON.stringify(proposalData, null, 2)}
    
    Provide an adaptive summary that matches their needs.
  `;
  
  return smartSummarizer.run(prompt, context);
}

/**
 * Usage Examples
 */
export const SMART_SUMMARIZER_EXAMPLES = {
  beginnerUser: `
    const result = await summarizeProposal(proposalData, {
      expertiseLevel: 'beginner',
      timeAvailable: 5
    });
  `,
  
  expertUser: `
    const result = await summarizeProposal(proposalData, {
      expertiseLevel: 'expert'
    });
  `,
  
  urgentDecision: `
    const result = await summarizeProposal(proposalData, {
      timeAvailable: 2, // 2 minutes - will generate TL;DR
      preferences: { focusOnRisk: true }
    });
  `
};

