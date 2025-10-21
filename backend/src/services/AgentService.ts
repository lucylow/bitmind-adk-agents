// backend/src/services/AgentService.ts
import { AgentBuilder, tool } from '@iqai/adk';
import { z } from 'zod';
import { ethers } from 'ethers';
import { User } from '../models/User.js';
import { ProposalAnalysis } from '../models/ProposalAnalysis.js';
import { env } from '../config/env.js';

export interface AgentResponse {
  content: string;
  agent: string;
  confidence?: number;
  suggestedActions?: Array<{
    type: string;
    label: string;
    data: any;
  }>;
}

export class AgentService {
  private provider: ethers.JsonRpcProvider;
  private proposalAnalyst: any;
  private votingStrategist: any;
  private treasuryMonitor: any;
  private initialized: boolean = false;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(env.ETHEREUM_RPC_URL);
  }

  async initialize() {
    if (this.initialized) return;

    console.log('🤖 Initializing ADK-TS agents...');

    try {
      // Proposal Analyst Agent
      this.proposalAnalyst = AgentBuilder
        .create('proposal-analyst')
        .withModel('gemini-2.0-flash-exp')
        .withDescription('Specialized AI agent for deep analysis of DAO governance proposals')
        .withInstruction(`
          You are a senior DAO governance analyst with expertise in decentralized finance and treasury management.

          YOUR RESPONSIBILITIES:
          1. Analyze DAO proposals for financial implications, risks, and strategic alignment
          2. Provide comprehensive breakdowns of proposal mechanics and potential impacts
          3. Identify potential risks and suggest mitigations
          4. Compare with historical proposal patterns
          5. Maintain neutral, fact-based analysis without personal bias

          ANALYSIS FRAMEWORK:
          - Executive Summary: Brief overview of the proposal
          - Financial Impact: Treasury allocation and potential returns/risks
          - Risk Assessment: Technical, market, and execution risks
          - Strategic Alignment: How this fits with DAO's long-term goals
          - Voting Considerations: Key factors for members to consider

          Always structure your analysis clearly and provide actionable insights for DAO members.
        `)
        .build();

      // Voting Strategist Agent
      this.votingStrategist = AgentBuilder
        .create('voting-strategist')
        .withModel('gemini-2.0-flash-exp')
        .withDescription('AI agent that provides personalized voting recommendations')
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
        .build();

      // Treasury Monitor Agent
      this.treasuryMonitor = AgentBuilder
        .create('treasury-monitor')
        .withModel('gemini-2.0-flash-exp')
        .withDescription('AI agent that monitors DAO treasury health and financial impacts')
        .withInstruction(`
          You are a treasury management specialist focused on DAO financial health.

          YOUR RESPONSIBILITIES:
          1. Monitor treasury balances and composition
          2. Analyze financial impact of proposals on treasury sustainability
          3. Flag potential financial risks or opportunities
          4. Provide sustainability assessments for proposed allocations
          5. Track market conditions that may affect treasury value

          Always consider:
          - Liquidity requirements
          - Diversification levels
          - Yield generation opportunities
          - Market risk exposure
          - Long-term sustainability

          Provide clear, quantitative assessments of treasury health.
        `)
        .build();

      this.initialized = true;
      console.log('✅ ADK-TS agents initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize agents:', error);
      throw error;
    }
  }

  async analyzeProposal(proposalId: string, walletAddress?: string): Promise<AgentResponse> {
    await this.initialize();

    try {
      // Check cache first
      const cachedAnalysis = await ProposalAnalysis.findOne({
        proposalId,
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hours
      });

      if (cachedAnalysis) {
        console.log('📦 Returning cached analysis for', proposalId);
        return {
          content: JSON.stringify(cachedAnalysis.analysis),
          agent: 'proposal-analyst',
          confidence: cachedAnalysis.analysis.confidence
        };
      }

      // Get user preferences if wallet provided
      let userContext = '';
      if (walletAddress) {
        const user = await User.findOne({ walletAddress });
        if (user) {
          userContext = `
            User preferences:
            - Risk Tolerance: ${user.preferences.riskTolerance}
            - Focus Areas: ${user.preferences.focusAreas.join(', ')}
            - Voting Strategy: ${user.preferences.votingStrategy}
          `;
        }
      }

      console.log('🔍 Analyzing proposal:', proposalId);
      
      const analysis = await this.proposalAnalyst.run(`
        Analyze proposal ${proposalId} in detail.
        Focus on financial impact, risks, and strategic alignment.
        
        ${userContext}
        
        Provide a comprehensive analysis including:
        1. Executive Summary
        2. Financial Impact Assessment
        3. Risk Factors (categorized by severity)
        4. Strategic Alignment
        5. Key Recommendations
      `);

      // Store in database
      const analysisDoc = new ProposalAnalysis({
        proposalId,
        daoName: 'Unknown', // Would be fetched from blockchain
        analysis: {
          summary: analysis.content,
          financialImpact: 'Analyzed',
          risks: [],
          recommendations: [],
          confidence: 0.85
        },
        timestamp: new Date()
      });

      await analysisDoc.save();

      return {
        content: analysis.content,
        agent: 'proposal-analyst',
        confidence: 0.85,
        suggestedActions: this.extractActions(analysis.content)
      };
    } catch (error) {
      console.error('Error analyzing proposal:', error);
      throw error;
    }
  }

  async getPersonalizedRecommendation(
    proposalId: string, 
    walletAddress: string
  ): Promise<AgentResponse> {
    await this.initialize();

    try {
      const user = await User.findOne({ walletAddress });
      
      if (!user) {
        throw new Error('User not found. Please set up your preferences first.');
      }

      console.log('🎯 Generating personalized recommendation for', walletAddress);

      // Get recent voting history
      const recentVotes = user.votingHistory.slice(-10);
      const votingPattern = recentVotes.length > 0 
        ? `Recent voting pattern: ${recentVotes.map(v => v.vote).join(', ')}`
        : 'No voting history available';

      const recommendation = await this.votingStrategist.run(`
        Provide personalized voting recommendation for user ${walletAddress}
        regarding proposal ${proposalId}.
        
        User Profile:
        - Risk Tolerance: ${user.preferences.riskTolerance}
        - Focus Areas: ${user.preferences.focusAreas.join(', ')}
        - Voting Strategy: ${user.preferences.votingStrategy}
        - ${votingPattern}
        
        Consider:
        - User's risk tolerance and historical voting patterns
        - Proposal analysis and potential impacts
        - Alignment with user's focus areas
        - Long-term strategic value
        
        Provide:
        1. Clear recommendation (FOR/AGAINST/ABSTAIN)
        2. Confidence level (0-1)
        3. Detailed reasoning
        4. Key factors influencing the decision
        5. Alternative perspectives to consider
      `);

      return {
        content: recommendation.content,
        agent: 'voting-strategist',
        confidence: 0.80,
        suggestedActions: [
          {
            type: 'VOTE',
            label: 'Execute Vote',
            data: { proposalId }
          }
        ]
      };
    } catch (error) {
      console.error('Error getting recommendation:', error);
      throw error;
    }
  }

  async chatWithAgent(
    message: string, 
    context: any, 
    walletAddress: string
  ): Promise<AgentResponse> {
    await this.initialize();

    try {
      // Determine which agent to use based on message content
      let agent = this.proposalAnalyst;
      let agentName = 'proposal-analyst';

      if (message.toLowerCase().includes('vote') || message.toLowerCase().includes('recommend')) {
        agent = this.votingStrategist;
        agentName = 'voting-strategist';
      } else if (message.toLowerCase().includes('treasury') || message.toLowerCase().includes('financial')) {
        agent = this.treasuryMonitor;
        agentName = 'treasury-monitor';
      }

      console.log(`💬 Chat with ${agentName}:`, message.substring(0, 50) + '...');

      const response = await agent.run(`
        User message: ${message}
        Context: ${JSON.stringify(context)}
        User wallet: ${walletAddress}
        
        Provide a helpful, accurate response considering the user's context.
        Be conversational but informative.
      `);

      // Store conversation
      await User.findOneAndUpdate(
        { walletAddress },
        {
          $push: {
            conversations: {
              message,
              response: response.content,
              agent: agentName,
              timestamp: new Date()
            }
          },
          lastActive: new Date()
        },
        { upsert: true }
      );

      return {
        content: response.content,
        agent: agentName,
        suggestedActions: this.extractActions(response.content)
      };
    } catch (error) {
      console.error('Error in agent chat:', error);
      throw error;
    }
  }

  private extractActions(content: string): Array<{ type: string; label: string; data: any }> {
    const actions = [];
    
    if (content.toLowerCase().includes('analyze') || content.toLowerCase().includes('review')) {
      actions.push({
        type: 'ANALYZE_PROPOSAL',
        label: 'Analyze Proposal Details',
        data: { action: 'deep_analysis' }
      });
    }
    
    if (content.toLowerCase().includes('vote') || content.toLowerCase().includes('recommend')) {
      actions.push({
        type: 'GET_RECOMMENDATION',
        label: 'Get Voting Recommendation',
        data: { action: 'personalized_recommendation' }
      });
    }

    if (content.toLowerCase().includes('treasury') || content.toLowerCase().includes('financial')) {
      actions.push({
        type: 'CHECK_TREASURY',
        label: 'Check Treasury Health',
        data: { action: 'treasury_analysis' }
      });
    }

    return actions;
  }

  async shutdown() {
    console.log('🔌 Shutting down AgentService...');
    this.initialized = false;
  }
}

// Singleton instance
export const agentService = new AgentService();

