/**
 * BitMind DAO Governance Co-pilot
 * Main exports for easy importing
 */

// Type Definitions
export * from './types/dao-types';

// Tools
export * from './tools/dao-tools-adk';

// Agents
export {
  createProposalAnalystAgent,
  analyzeProposal
} from './agents/proposal-analyst-adk.agent';

export {
  createVotingStrategistAgent,
  generateRecommendation,
  updateUserPreferences,
  userPreferenceMemory
} from './agents/voting-strategist-adk.agent';

export {
  createTreasuryMonitorAgent,
  assessTreasuryHealth,
  treasuryMonitor,
  TreasuryMonitor
} from './agents/treasury-monitor-adk.agent';

// Workflow
export {
  DAOGovernanceWorkflow,
  daoGovernanceWorkflow
} from './workflows/dao-governance-adk.workflow';

// Main Agent & Utilities
export {
  createRootGovernanceAgent,
  runGovernanceAnalysis,
  runInteractiveCLI
} from './main-agent-adk';

// Default export
export { createRootGovernanceAgent as default } from './main-agent-adk';

