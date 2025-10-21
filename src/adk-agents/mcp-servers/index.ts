/**
 * MCP Servers Export
 * Centralized export for all MCP servers
 */

import { BlockchainDataMCPServer } from './blockchain-data/server';
import type { BlockchainDataConfig, ProposalData, VotingPower, TreasuryBalance } from './blockchain-data/server';

import { GovernancePlatformMCPServer } from './governance-platforms/server';
import type { GovernancePlatformConfig, SnapshotProposal, TallyProposal } from './governance-platforms/server';

import { RiskAssessmentMCPServer } from './risk-assessment/server';
import type { RiskAssessmentConfig, RiskAssessment, TreasuryRisk } from './risk-assessment/server';

export { BlockchainDataMCPServer, GovernancePlatformMCPServer, RiskAssessmentMCPServer };
export type { BlockchainDataConfig, ProposalData, VotingPower, TreasuryBalance };
export type { GovernancePlatformConfig, SnapshotProposal, TallyProposal };
export type { RiskAssessmentConfig, RiskAssessment, TreasuryRisk };

// Factory function to create all MCP servers
export function createMCPServers(config: {
  blockchain?: {
    rpcUrl: string;
    graphqlEndpoint: string;
    chainId: number;
  };
  governance?: {
    snapshotHub?: string;
    tallyApiKey?: string;
    tallyApiUrl?: string;
  };
  riskAssessment?: {
    openaiApiKey?: string;
    anthropicApiKey?: string;
    riskThresholds?: {
      low: number;
      medium: number;
      high: number;
    };
  };
}) {
  return {
    blockchainData: new BlockchainDataMCPServer(
      config.blockchain || {
        rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
        graphqlEndpoint: process.env.GRAPH_ENDPOINT || 'https://api.thegraph.com/subgraphs/name/graphprotocol/governance',
        chainId: 1,
      }
    ),
    governancePlatform: new GovernancePlatformMCPServer(
      config.governance || {
        snapshotHub: 'https://hub.snapshot.org/graphql',
        tallyApiKey: process.env.TALLY_API_KEY,
        tallyApiUrl: 'https://api.tally.xyz/query',
      }
    ),
    riskAssessment: new RiskAssessmentMCPServer(
      config.riskAssessment || {
        openaiApiKey: process.env.OPENAI_API_KEY,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        riskThresholds: {
          low: 0.3,
          medium: 0.6,
          high: 0.8,
        },
      }
    ),
  };
}

// Export default instance
export const mcpServers = createMCPServers({});

