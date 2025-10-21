/**
 * ATP Integration - Main Entry Point
 * Export all ATP-related modules
 */

export { AgentWallet, createAgentWalletFromEnv } from './agent-wallet';
export type { AgentWalletConfig, Capability, FeeConfig } from './agent-wallet';

export { PremiumAnalystATPAgent, createPremiumAnalystATPFromEnv, analyzePremiumProposal } from '../agents/premium-analyst-atp.agent';
export type { PremiumAnalysisResult } from '../agents/premium-analyst-atp.agent';

export {
  ATPMarketplaceIntegration,
  createMarketplaceClient,
  registerBitMindAgent
} from './marketplace-integration';
export type { AgentMetadata, AgentMetrics, TokenPrice, MarketplaceAgent } from './marketplace-integration';

export {
  AgentGovernance,
  GovernanceProposalTemplates,
  createGovernanceFromEnv,
  ProposalState,
  VoteType
} from './agent-governance';
export type { Proposal, GovernanceAction } from './agent-governance';

