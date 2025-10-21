/**
 * BitMind DAO Governance Co-pilot - ADK Implementation
 * Main exports for the ADK-TS agent system
 */

// ==================== TYPE DEFINITIONS ====================
export * from './types/dao-types';

// ==================== CORE MODULES ====================
export { AgentBuilder } from './core/agent-builder';
export type { Agent, AgentResponse, BaseTool, MemoryConfig } from './core/agent-builder';

export { Memory, UserPreferenceMemory } from './core/memory';
export type { 
  MemoryEntry, 
  MemoryOptions, 
  UserPreference, 
  VotingHistoryEntry 
} from './core/memory';

// ==================== TOOLS ====================
export { 
  fetchProposalTool,
  analyzeFinancialImpactTool,
  assessSecurityRiskTool,
  analyzeProposalSentimentTool,
  getGovernanceMetricsTool,
  generateVotingRecommendationTool,
  getHistoricalVotingPatternsTool,
  getProposalVotingPowerTool,
  getTreasuryBalanceTool,
  stacksBlockchainTools
} from './tools/stacks-blockchain-tools';

// ==================== AGENTS ====================

// Proposal Analyst Agent
export {
  createProposalAnalystAgent,
  proposalAnalystAgentADK,
  analyzeProposal,
  USAGE_EXAMPLES as PROPOSAL_ANALYST_EXAMPLES
} from './agents/proposal-analyst-adk.agent';

// Voting Strategist Agent
export {
  createVotingStrategistAgent,
  votingStrategistAgentADK,
  generateRecommendation,
  updateUserPreferences,
  userPreferenceMemory,
  USAGE_EXAMPLES as VOTING_STRATEGIST_EXAMPLES
} from './agents/voting-strategist-adk.agent';

// Treasury Monitor Agent
export {
  createTreasuryMonitorAgent,
  treasuryMonitorAgentADK,
  assessTreasuryHealth,
  treasuryMonitor,
  TreasuryMonitor,
  USAGE_EXAMPLES as TREASURY_MONITOR_EXAMPLES
} from './agents/treasury-monitor-adk.agent';

export type { TreasuryAlert } from './agents/treasury-monitor-adk.agent';

// ==================== WORKFLOW ====================
export {
  DAOGovernanceWorkflow,
  daoGovernanceWorkflow
} from './workflows/dao-governance-adk.workflow';

// ==================== MAIN AGENT ====================
export {
  createRootGovernanceAgent,
  runGovernanceAnalysis,
  runInteractiveCLI
} from './main-agent-adk';

// ==================== DEFAULT EXPORT ====================
export { createRootGovernanceAgent as default } from './main-agent-adk';

// ==================== CONVENIENCE RE-EXPORTS ====================

/**
 * Quick access to all agents
 */
export const Agents = {
  ProposalAnalyst: 'proposal-analyst-adk',
  VotingStrategist: 'voting-strategist-adk',
  TreasuryMonitor: 'treasury-monitor-adk',
  Root: 'root-governance-agent'
} as const;

/**
 * Quick access to all tools
 */
export const Tools = {
  FetchProposal: 'fetchProposal',
  AnalyzeFinancialImpact: 'analyzeFinancialImpact',
  AssessSecurityRisk: 'assessSecurityRisk',
  AnalyzeProposalSentiment: 'analyzeProposalSentiment',
  GetGovernanceMetrics: 'getGovernanceMetrics',
  GenerateVotingRecommendation: 'generateVotingRecommendation',
  GetHistoricalVotingPatterns: 'getHistoricalVotingPatterns',
  GetProposalVotingPower: 'getProposalVotingPower',
  GetTreasuryBalance: 'getTreasuryBalance'
} as const;
