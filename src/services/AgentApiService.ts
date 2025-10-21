// src/services/AgentApiService.ts
import { io, Socket } from 'socket.io-client';

export interface AgentMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  agent?: string;
  timestamp: string;
  actions?: AgentAction[];
  confidence?: number;
}

export interface AgentAction {
  type: string;
  label: string;
  data: any;
}

export interface AgentResponse {
  success: boolean;
  data: any;
  cached?: boolean;
  timestamp: string;
  error?: string;
  details?: string;
}

export interface UserProfile {
  walletAddress: string;
  nickname?: string;
  preferences: {
    riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
    focusAreas: string[];
    votingStrategy: 'ACTIVE' | 'DELEGATE' | 'MIXED';
    notificationPreferences: {
      email: boolean;
      push: boolean;
      telegram: boolean;
    };
  };
  votingHistory: any[];
  stats: {
    totalVotes: number;
    totalAnalyses: number;
    totalChats: number;
  };
  createdAt?: string;
  lastActive?: string;
}

class AgentApiService {
  private socket: Socket | null = null;
  private baseUrl: string;
  private walletAddress: string | null = null;
  private eventHandlers: Map<string, Set<Function>> = new Map();

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  /**
   * Initialize WebSocket connection
   */
  async initializeSocket(walletAddress: string, signature: string, message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.walletAddress = walletAddress;

      // Close existing connection if any
      if (this.socket?.connected) {
        this.socket.disconnect();
      }

      this.socket = io(this.baseUrl, {
        auth: {
          walletAddress,
          signature,
          message
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket disconnected:', reason);
      });

      // Setup event forwarding
      this.socket.on('agent:response', (data) => this.emit('agent:response', data));
      this.socket.on('agent:typing', (data) => this.emit('agent:typing', data));
      this.socket.on('agent:error', (data) => this.emit('agent:error', data));
      this.socket.on('proposal:analysis:start', (data) => this.emit('proposal:analysis:start', data));
      this.socket.on('proposal:analysis:complete', (data) => this.emit('proposal:analysis:complete', data));
      this.socket.on('proposal:analysis:error', (data) => this.emit('proposal:analysis:error', data));
      this.socket.on('user:notification', (data) => this.emit('user:notification', data));
      this.socket.on('system:alert', (data) => this.emit('system:alert', data));
    });
  }

  /**
   * Event listener registration
   */
  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Event listener removal
   */
  off(event: string, handler: Function) {
    this.eventHandlers.get(event)?.delete(handler);
  }

  /**
   * Emit event to handlers
   */
  private emit(event: string, data: any) {
    this.eventHandlers.get(event)?.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Send message via WebSocket
   */
  sendMessage(message: string, context: any = {}) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    this.socket.emit('agent:message', {
      message,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Request proposal analysis via WebSocket
   */
  analyzeProposalWs(proposalId: string, daoAddress?: string) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    this.socket.emit('proposal:analyze', {
      proposalId,
      daoAddress
    });
  }

  /**
   * Subscribe to topics
   */
  subscribeToTopics(topics: string[]) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    this.socket.emit('user:subscribe', { topics });
  }

  /**
   * Unsubscribe from topics
   */
  unsubscribeFromTopics(topics: string[]) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    this.socket.emit('user:unsubscribe', { topics });
  }

  /**
   * HTTP API Methods
   */

  /**
   * Analyze a proposal
   */
  async analyzeProposal(proposalId: string, daoAddress?: string, force = false): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/api/agent/analyze-proposal`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ proposalId, daoAddress, force })
    });

    return this.handleResponse(response);
  }

  /**
   * Get voting recommendation
   */
  async getVotingRecommendation(proposalId: string): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/api/agent/voting-recommendation`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ proposalId })
    });

    return this.handleResponse(response);
  }

  /**
   * Chat with agent
   */
  async chat(message: string, context: any = {}): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/api/agent/chat`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ message, context })
    });

    return this.handleResponse(response);
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/api/agent/user/profile`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences: any): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/api/agent/user/preferences`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ preferences })
    });

    return this.handleResponse(response);
  }

  /**
   * Get user history
   */
  async getUserHistory(limit = 50, type?: string): Promise<AgentResponse> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (type) params.append('type', type);

    const response = await fetch(
      `${this.baseUrl}/api/agent/user/history?${params}`,
      { headers: this.getAuthHeaders() }
    );

    return this.handleResponse(response);
  }

  /**
   * Get recent proposals
   */
  async getRecentProposals(limit = 10): Promise<AgentResponse> {
    const params = new URLSearchParams({ limit: limit.toString() });
    const response = await fetch(
      `${this.baseUrl}/api/agent/proposals/recent?${params}`,
      { headers: this.getAuthHeaders() }
    );

    return this.handleResponse(response);
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }

  /**
   * Get auth headers for API requests
   */
  private getAuthHeaders(): HeadersInit {
    const walletAddress = localStorage.getItem('walletAddress');
    const signature = localStorage.getItem('signature');
    const authMessage = localStorage.getItem('authMessage');

    return {
      'Content-Type': 'application/json',
      'x-wallet-address': walletAddress || '',
      'x-signature': signature || '',
      'x-message': authMessage || ''
    };
  }

  /**
   * Handle API response
   */
  private async handleResponse(response: Response): Promise<AgentResponse> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.details || 'API request failed');
    }

    return response.json();
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Cleanup and disconnect
   */
  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.walletAddress = null;
    this.eventHandlers.clear();
  }
}

// Export singleton instance
export const agentApiService = new AgentApiService();

