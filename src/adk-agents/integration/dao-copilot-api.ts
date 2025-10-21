/**
 * DAO Co-pilot API
 * Main integration layer for the DAO Governance Co-pilot system
 */

import { runGovernanceAnalysis } from '../workflows/dao-governance-workflow';
import { generateRecommendation, updateUserPreferences } from '../agents/voting-strategist-adk.agent';
import { assessTreasuryHealth, treasuryMonitor } from '../agents/treasury-monitor-adk.agent';
import { governanceDataMCPServer } from '../mcp/governance-data-server';
import { auditLogger } from '../audit/audit-schema';
import type { GovernanceWorkflowOutput } from '../workflows/dao-governance-workflow';

export interface DAOCopilotConfig {
  daoAddress: string;
  enableContinuousMonitoring?: boolean;
  monitoringIntervalMs?: number;
  mcpServerPort?: number;
}

export interface AnalysisRequest {
  proposalId: string;
  userAddress: string;
  userPreferences?: Record<string, unknown>;
}

export interface VotingFeedback {
  proposalId: string;
  actualVote: 'FOR' | 'AGAINST' | 'ABSTAIN';
  satisfactionScore: number;
  feedbackNotes?: string;
}

/**
 * Main DAO Co-pilot API
 * Provides high-level interface to all agent capabilities
 */
export class DAOCopilotAPI {
  private config: DAOCopilotConfig;
  private initialized: boolean = false;

  constructor(config: DAOCopilotConfig) {
    this.config = config;
  }

  /**
   * Initialize the DAO Co-pilot system
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing DAO Co-pilot System...\n');

    // Start MCP server
    if (this.config.mcpServerPort) {
      await governanceDataMCPServer.start(this.config.mcpServerPort);
    }

    // Start continuous treasury monitoring if enabled
    if (this.config.enableContinuousMonitoring) {
      treasuryMonitor.startMonitoring(
        this.config.daoAddress,
        this.config.monitoringIntervalMs || 60000
      );

      // Register alert handler
      treasuryMonitor.onAlert((alert) => {
        console.log(`\n🚨 [TREASURY ALERT ${alert.severity}] ${alert.message}\n`);
        // TODO: Send notifications via Discord/Telegram
      });
    }

    this.initialized = true;
    console.log('✅ DAO Co-pilot System initialized\n');
  }

  /**
   * Analyze a proposal and generate voting recommendation
   */
  async analyzeProposal(request: AnalysisRequest): Promise<GovernanceWorkflowOutput> {
    this.ensureInitialized();

    console.log(`\n📋 Analyzing proposal ${request.proposalId}...`);

    const result = await runGovernanceAnalysis(
      request.proposalId,
      this.config.daoAddress,
      request.userAddress,
      request.userPreferences
    );

    auditLogger.log({
      agentId: 'dao-copilot-api',
      agentName: 'DAOCopilotAPI',
      actionType: 'AGENT_RUN',
      inputs: request as any,
      outputs: result as any,
      modelVersion: '1.0.0',
      status: 'SUCCESS',
    });

    return result;
  }

  /**
   * Get treasury health assessment
   */
  async getTreasuryHealth(): Promise<any> {
    this.ensureInitialized();

    console.log(`\n💰 Assessing treasury health for ${this.config.daoAddress}...`);
    return assessTreasuryHealth(this.config.daoAddress);
  }

  /**
   * Submit voting feedback to improve recommendations
   */
  async submitVotingFeedback(
    userAddress: string,
    feedback: VotingFeedback
  ): Promise<void> {
    this.ensureInitialized();

    console.log(`\n📝 Recording voting feedback for ${userAddress}...`);
    
    await updateUserPreferences(userAddress, feedback);

    auditLogger.log({
      agentId: 'dao-copilot-api',
      agentName: 'DAOCopilotAPI',
      actionType: 'AGENT_RUN',
      inputs: { userAddress, feedback } as any,
      modelVersion: '1.0.0',
      status: 'SUCCESS',
    });

    console.log('✅ Feedback recorded\n');
  }

  /**
   * Get governance statistics via MCP server
   */
  async getGovernanceStats(timeRange?: '7d' | '30d' | '90d' | 'all'): Promise<any> {
    this.ensureInitialized();

    return governanceDataMCPServer.handleRequest('getGovernanceStats', {
      daoAddress: this.config.daoAddress,
      timeRange: timeRange || 'all',
    });
  }

  /**
   * Get active proposals
   */
  async getActiveProposals(): Promise<any> {
    this.ensureInitialized();

    return governanceDataMCPServer.handleRequest('getActiveProposals', {
      daoAddress: this.config.daoAddress,
    });
  }

  /**
   * Get voting history for a user
   */
  async getVoterHistory(userAddress: string, limit?: number): Promise<any> {
    this.ensureInitialized();

    return governanceDataMCPServer.handleRequest('getVoterHistory', {
      address: userAddress,
      limit: limit || 10,
    });
  }

  /**
   * Get audit logs
   */
  getAuditLogs(filter?: { agentId?: string; actionType?: string }) {
    return auditLogger.getLogs(filter);
  }

  /**
   * Shutdown the DAO Co-pilot system
   */
  async shutdown(): Promise<void> {
    console.log('\n🛑 Shutting down DAO Co-pilot System...');

    // Stop treasury monitoring
    treasuryMonitor.stopMonitoring();

    console.log('✅ DAO Co-pilot System shut down\n');
    this.initialized = false;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('DAO Co-pilot not initialized. Call initialize() first.');
    }
  }
}

/**
 * Factory function to create and initialize DAO Co-pilot
 */
export async function createDAOCopilot(config: DAOCopilotConfig): Promise<DAOCopilotAPI> {
  const copilot = new DAOCopilotAPI(config);
  await copilot.initialize();
  return copilot;
}

// Example usage
export const API_EXAMPLES = {
  quickStart: `
import { createDAOCopilot } from './integration/dao-copilot-api';

// Initialize the co-pilot
const copilot = await createDAOCopilot({
  daoAddress: 'SP2X...DAO',
  enableContinuousMonitoring: true,
  monitoringIntervalMs: 60000,
  mcpServerPort: 3001,
});

// Analyze a proposal
const analysis = await copilot.analyzeProposal({
  proposalId: 'prop-001',
  userAddress: 'SP2X...USER',
  userPreferences: {
    riskTolerance: 'conservative',
  },
});

console.log('Recommendation:', analysis.votingRecommendation);
console.log('Requires Approval:', analysis.approvalRequired);

// Get treasury health
const treasury = await copilot.getTreasuryHealth();
console.log('Treasury Health Score:', treasury.healthScore);

// Submit feedback after voting
await copilot.submitVotingFeedback('SP2X...USER', {
  proposalId: 'prop-001',
  actualVote: 'FOR',
  satisfactionScore: 0.9,
  feedbackNotes: 'Great recommendation!',
});

// Shutdown when done
await copilot.shutdown();
  `,
  
  dashboardIntegration: `
// React component example
import { useEffect, useState } from 'react';
import { createDAOCopilot } from './integration/dao-copilot-api';

function GovernanceDashboard({ daoAddress, userAddress }) {
  const [copilot, setCopilot] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [treasury, setTreasury] = useState(null);

  useEffect(() => {
    async function init() {
      const cp = await createDAOCopilot({
        daoAddress,
        enableContinuousMonitoring: true,
      });
      setCopilot(cp);

      // Fetch data
      const activeProposals = await cp.getActiveProposals();
      const treasuryHealth = await cp.getTreasuryHealth();
      
      setProposals(activeProposals);
      setTreasury(treasuryHealth);
    }
    
    init();
    
    return () => {
      copilot?.shutdown();
    };
  }, [daoAddress]);

  return (
    <div>
      <h1>DAO Governance Dashboard</h1>
      {/* Render proposals and treasury data */}
    </div>
  );
}
  `,
  
  batchProcessing: `
// Process multiple proposals for a user
const copilot = await createDAOCopilot({ daoAddress });

const activeProposals = await copilot.getActiveProposals();

const analyses = await Promise.all(
  activeProposals.map(proposal =>
    copilot.analyzeProposal({
      proposalId: proposal.id,
      userAddress: userAddress,
    })
  )
);

// Filter proposals that need user review
const needsReview = analyses.filter(a => a.approvalRequired);
console.log(\`\${needsReview.length} proposals need your review\`);
  `,
};

