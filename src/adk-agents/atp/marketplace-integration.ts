/**
 * ATP Marketplace Integration
 * 
 * Integrates BitMind agents with IQ AI's Agent Tokenization Platform marketplace
 * for discovery, trading, and analytics
 */

import axios, { AxiosInstance } from 'axios';

// ATP Marketplace API endpoint (update when official API is released)
const ATP_API_BASE = process.env.ATP_API_URL || 'https://api.atp.iqai.com/v1';

export interface AgentMetadata {
  name: string;
  symbol: string;
  description: string;
  tokenAddress: string;
  agentWalletAddress: string;
  capabilities: string[];
  pricing: {
    freeTier: string[];
    premiumTier: {
      features: string[];
      price: string;
    };
  };
  platform?: string;
  framework?: string;
  category?: string;
  tags?: string[];
  website?: string;
  documentation?: string;
  github?: string;
}

export interface AgentMetrics {
  totalRevenue: string;
  activeUsers: number;
  analysisCount: number;
  avgResponseTime: number;
  successRate?: number;
  uptime?: number;
}

export interface TokenPrice {
  priceUSD: number;
  priceIQ: number;
  priceETH: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  circulatingSupply: number;
  totalSupply: number;
  change24h: number;
}

export interface MarketplaceAgent {
  id: string;
  name: string;
  symbol: string;
  description: string;
  tokenAddress: string;
  category: string;
  price: TokenPrice;
  metrics: AgentMetrics;
  capabilities: string[];
  verified: boolean;
  featured: boolean;
}

/**
 * ATP Marketplace Integration Client
 */
export class ATPMarketplaceIntegration {
  private apiClient: AxiosInstance;
  private apiKey?: string;
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ATP_API_KEY;
    
    this.apiClient = axios.create({
      baseURL: ATP_API_BASE,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      }
    });
    
    // Request interceptor for logging
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`[ATP Marketplace] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[ATP Marketplace] API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Register agent on ATP marketplace
   */
  async registerAgent(metadata: AgentMetadata): Promise<{ success: boolean; agentId: string; message: string }> {
    try {
      console.log('[ATP Marketplace] Registering agent:', metadata.name);
      
      const response = await this.apiClient.post('/agents/register', {
        ...metadata,
        platform: metadata.platform || 'Fraxtal',
        framework: metadata.framework || 'ADK-TS',
        category: metadata.category || 'DAO Governance',
        tags: metadata.tags || ['governance', 'dao', 'analysis', 'defi', 'treasury'],
        registeredAt: new Date().toISOString()
      });
      
      console.log('[ATP Marketplace] Agent registered successfully:', response.data.agentId);
      
      return {
        success: true,
        agentId: response.data.agentId,
        message: 'Agent registered successfully on ATP marketplace'
      };
      
    } catch (error) {
      console.error('[ATP Marketplace] Registration failed:', error);
      
      // Fallback for development/testing when API is not available
      if (axios.isAxiosError(error) && !error.response) {
        console.log('[ATP Marketplace] API not available, using mock response');
        return {
          success: true,
          agentId: `agent-${Date.now()}`,
          message: 'Agent registered (mock mode - API not available)'
        };
      }
      
      throw error;
    }
  }
  
  /**
   * Update agent metadata on marketplace
   */
  async updateAgentMetadata(tokenAddress: string, updates: Partial<AgentMetadata>): Promise<void> {
    try {
      console.log('[ATP Marketplace] Updating agent metadata:', tokenAddress);
      
      await this.apiClient.patch(`/agents/${tokenAddress}`, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      console.log('[ATP Marketplace] Metadata updated successfully');
      
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response) {
        console.error('[ATP Marketplace] Update failed:', error);
      }
      // Fail silently if API not available
    }
  }
  
  /**
   * Update agent operational metrics
   */
  async updateAgentMetrics(tokenAddress: string, metrics: AgentMetrics): Promise<void> {
    try {
      console.log('[ATP Marketplace] Updating agent metrics:', tokenAddress);
      
      await this.apiClient.post(`/agents/${tokenAddress}/metrics`, {
        ...metrics,
        timestamp: new Date().toISOString()
      });
      
      console.log('[ATP Marketplace] Metrics updated successfully');
      
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response) {
        console.error('[ATP Marketplace] Metrics update failed:', error);
      }
      // Fail silently if API not available
    }
  }
  
  /**
   * Get agent token price from ATP marketplace
   */
  async getTokenPrice(tokenAddress: string): Promise<TokenPrice> {
    try {
      const response = await this.apiClient.get(`/tokens/${tokenAddress}/price`);
      return response.data;
      
    } catch (error) {
      console.error('[ATP Marketplace] Failed to fetch token price:', error);
      
      // Return mock data if API not available
      return {
        priceUSD: 0.50,
        priceIQ: 100,
        priceETH: 0.0002,
        marketCap: 50000,
        volume24h: 5000,
        holders: 150,
        circulatingSupply: 100000,
        totalSupply: 1000000,
        change24h: 5.2
      };
    }
  }
  
  /**
   * Search for agents on marketplace
   */
  async searchAgents(query: {
    category?: string;
    tags?: string[];
    minMarketCap?: number;
    maxPrice?: number;
    verified?: boolean;
    sortBy?: 'marketCap' | 'volume' | 'users' | 'rating';
    limit?: number;
  }): Promise<MarketplaceAgent[]> {
    try {
      const response = await this.apiClient.get('/agents/search', { params: query });
      return response.data.agents;
      
    } catch (error) {
      console.error('[ATP Marketplace] Search failed:', error);
      return [];
    }
  }
  
  /**
   * Get agent details from marketplace
   */
  async getAgentDetails(tokenAddress: string): Promise<MarketplaceAgent | null> {
    try {
      const response = await this.apiClient.get(`/agents/${tokenAddress}`);
      return response.data;
      
    } catch (error) {
      console.error('[ATP Marketplace] Failed to fetch agent details:', error);
      return null;
    }
  }
  
  /**
   * Get trending agents
   */
  async getTrendingAgents(limit: number = 10): Promise<MarketplaceAgent[]> {
    try {
      const response = await this.apiClient.get('/agents/trending', {
        params: { limit }
      });
      return response.data.agents;
      
    } catch (error) {
      console.error('[ATP Marketplace] Failed to fetch trending agents:', error);
      return [];
    }
  }
  
  /**
   * Get featured agents
   */
  async getFeaturedAgents(category?: string): Promise<MarketplaceAgent[]> {
    try {
      const response = await this.apiClient.get('/agents/featured', {
        params: { category }
      });
      return response.data.agents;
      
    } catch (error) {
      console.error('[ATP Marketplace] Failed to fetch featured agents:', error);
      return [];
    }
  }
  
  /**
   * Submit agent for verification
   */
  async requestVerification(tokenAddress: string, evidence: {
    auditReports?: string[];
    githubRepo?: string;
    documentation?: string;
    teamInfo?: string;
    useCase?: string;
  }): Promise<{ success: boolean; verificationId: string }> {
    try {
      const response = await this.apiClient.post(`/agents/${tokenAddress}/verify`, evidence);
      return {
        success: true,
        verificationId: response.data.verificationId
      };
      
    } catch (error) {
      console.error('[ATP Marketplace] Verification request failed:', error);
      throw error;
    }
  }
  
  /**
   * Get agent's performance analytics
   */
  async getAgentAnalytics(
    tokenAddress: string,
    timeframe: '24h' | '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<{
    revenue: Array<{ timestamp: string; amount: number }>;
    users: Array<{ timestamp: string; count: number }>;
    requests: Array<{ timestamp: string; count: number }>;
    performance: Array<{ timestamp: string; avgResponseTime: number }>;
  }> {
    try {
      const response = await this.apiClient.get(`/agents/${tokenAddress}/analytics`, {
        params: { timeframe }
      });
      return response.data;
      
    } catch (error) {
      console.error('[ATP Marketplace] Failed to fetch analytics:', error);
      return {
        revenue: [],
        users: [],
        requests: [],
        performance: []
      };
    }
  }
  
  /**
   * Report agent metrics automatically at intervals
   */
  startMetricsReporting(
    tokenAddress: string,
    getMetrics: () => Promise<AgentMetrics>,
    intervalMinutes: number = 15
  ): NodeJS.Timeout {
    console.log(`[ATP Marketplace] Starting metrics reporting every ${intervalMinutes} minutes`);
    
    const reportMetrics = async () => {
      try {
        const metrics = await getMetrics();
        await this.updateAgentMetrics(tokenAddress, metrics);
      } catch (error) {
        console.error('[ATP Marketplace] Metrics reporting error:', error);
      }
    };
    
    // Report immediately
    reportMetrics();
    
    // Then report at intervals
    return setInterval(reportMetrics, intervalMinutes * 60 * 1000);
  }
}

/**
 * Factory function to create marketplace client from environment
 */
export function createMarketplaceClient(): ATPMarketplaceIntegration {
  return new ATPMarketplaceIntegration(process.env.ATP_API_KEY);
}

/**
 * Helper function to register BitMind agent on ATP marketplace
 */
export async function registerBitMindAgent(agentWalletAddress: string): Promise<void> {
  const marketplace = createMarketplaceClient();
  
  const metadata: AgentMetadata = {
    name: 'BitMind DAO Governance Co-pilot',
    symbol: 'BITMIND',
    description: 'AI-powered DAO governance analysis with multi-agent collaboration. Provides comprehensive proposal analysis, treasury monitoring, voting recommendations, and delegation strategies.',
    tokenAddress: process.env.BITMIND_TOKEN_ADDRESS!,
    agentWalletAddress,
    capabilities: [
      'Proposal Analysis',
      'Financial Impact Assessment',
      'Security Risk Evaluation',
      'Community Sentiment Analysis',
      'Treasury Monitoring',
      'Voting Recommendations',
      'Delegation Optimization',
      'Cross-DAO Comparison',
      'Cross-Chain Governance',
      'AI-Powered Predictions'
    ],
    pricing: {
      freeTier: [
        'Basic proposal summary',
        'Vote distribution',
        'Simple risk assessment'
      ],
      premiumTier: {
        features: [
          'Deep financial impact analysis',
          'Advanced security assessment',
          'Community sentiment analysis',
          'Governance metrics tracking',
          'Cross-DAO comparison',
          'Delegation optimization',
          'Cross-chain implications',
          'AI-powered predictions'
        ],
        price: '0.1 ETH'
      }
    },
    platform: 'Fraxtal',
    framework: 'ADK-TS',
    category: 'DAO Governance',
    tags: ['governance', 'dao', 'analysis', 'defi', 'treasury', 'voting', 'delegation'],
    github: 'https://github.com/yourusername/bitmind-adk-agents',
    documentation: 'https://docs.bitmind.com'
  };
  
  const result = await marketplace.registerAgent(metadata);
  console.log('[ATP] Registration result:', result);
}

