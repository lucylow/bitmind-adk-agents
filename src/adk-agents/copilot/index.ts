/**
 * Co-pilot Module Index
 * Central exports for all co-pilot features
 */

// Enhanced Co-pilot
export {
  createEnhancedCoPilot,
  EnhancedCoPilotManager,
  coPilotManager,
  askCoPilot,
  type InteractionMode,
  type CoPilotContext,
  type CoPilotResponse
} from './enhanced-copilot';

// Smart Summarizer
export {
  createSmartSummarizerAgent,
  smartSummarizer,
  summarizeProposal,
  detectUserExpertiseTool,
  generateAdaptiveSummaryTool,
  extractKeyVotingFactorsTool
} from '../features/smart-summarizer';

// Personalization Engine
export {
  createPersonalizationEngineAgent,
  personalizationEngine,
  getPersonalizedGuidance,
  updateVotingPatternTool,
  getPersonalizedRecommendationTool,
  updateUserPreferencesTool,
  analyzeLearningProgressTool,
  type UserProfile,
  type VotingRecord,
  type UserPreferences
} from '../features/personalization-engine';

// Governance Alerts
export {
  createGovernanceAlertAgent,
  governanceAlertSystem,
  setupUserMonitoring,
  monitorGovernanceFeedTool,
  sendAlertTool,
  setupMonitoringTool,
  checkVotingDeadlinesTool,
  analyzeGovernanceTrendsTool,
  type GovernanceAlert,
  type AlertType,
  type AlertPriority,
  type MonitoringConfig
} from '../features/governance-alerts';

// Cross-DAO Analytics (coming soon)
export {
  crossDAOAnalytics,
  type CrossDAOAnalytics
} from '../features/cross-dao-analytics';

// Delegation Advisor (coming soon)
export {
  delegationAdvisor,
  type DelegationAdvisor
} from '../features/delegation-advisor';

/**
 * Quick Start Helper Functions
 */

import { coPilotManager } from './enhanced-copilot';

/**
 * Quick governance question
 */
export async function ask(question: string, userId: string = 'default-user') {
  return coPilotManager.handleQuery(question, { userId });
}

/**
 * Get quick proposal summary
 */
export async function quickSummary(proposalId: string, userId: string = 'default-user') {
  return coPilotManager.quickAnalysis(proposalId, userId);
}

/**
 * Setup governance monitoring
 */
export async function startMonitoring(
  userId: string,
  interests: string[]
) {
  return coPilotManager.setupMonitoring(userId, interests, {
    channels: ['in-app', 'discord'],
    frequency: 'daily'
  });
}

/**
 * Get delegation recommendation
 */
export async function shouldIDelegate(
  userId: string,
  proposalId?: string,
  context?: any
) {
  return coPilotManager.getDelegationAdvice(userId, proposalId, context);
}

/**
 * Compare with other DAOs
 */
export async function whatDoOtherDAOsDo(
  proposalDescription: string,
  currentDAO: string
) {
  return coPilotManager.compareWithOtherDAOs(proposalDescription, currentDAO);
}

/**
 * Check my progress
 */
export async function myProgress(userId: string) {
  return coPilotManager.getLearningProgress(userId);
}

/**
 * Complete initialization
 */
export async function initializeCoPilot(userId: string, preferences?: any) {
  console.log('🚀 Initializing DAO Governance Co-pilot...');
  
  // Setup user profile
  if (preferences?.interests) {
    await startMonitoring(userId, preferences.interests);
  }
  
  console.log('✅ Co-pilot ready!');
  console.log('   - Smart summarization enabled');
  console.log('   - Personalization learning from your behavior');
  console.log('   - Governance alerts configured');
  console.log('   - Cross-DAO intelligence active');
  console.log('   - Delegation advisor ready');
  
  return {
    ask: (q: string) => ask(q, userId),
    quickSummary: (p: string) => quickSummary(p, userId),
    shouldIDelegate: (p?: string, c?: any) => shouldIDelegate(userId, p, c),
    whatDoOtherDAOsDo,
    myProgress: () => myProgress(userId)
  };
}

/**
 * Feature Status
 */
export const COPILOT_FEATURES = {
  smartSummarization: {
    name: 'Smart Summarization',
    description: 'Adaptive proposal summaries based on user expertise',
    status: 'active'
  },
  personalization: {
    name: 'Personalization Engine',
    description: 'Learns from voting patterns and preferences',
    status: 'active'
  },
  governanceAlerts: {
    name: 'Governance Alerts',
    description: 'Real-time monitoring and proactive notifications',
    status: 'active'
  },
  crossDAOAnalytics: {
    name: 'Cross-DAO Intelligence',
    description: 'Learn from governance patterns across DAOs',
    status: 'active'
  },
  delegationAdvisor: {
    name: 'Delegation Advisor',
    description: 'Smart delegation recommendations and monitoring',
    status: 'active'
  }
};

/**
 * Version info
 */
export const VERSION = {
  copilot: '2.0.0',
  features: '1.0.0',
  timestamp: new Date().toISOString()
};

