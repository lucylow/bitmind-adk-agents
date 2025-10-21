/**
 * BitMind DAO Governance Co-pilot - ADK-TS Implementation
 * Main entry point and exports for the ADK-TS agent system
 */

// ==================== CORE EXPORTS ====================
export * from './core/types';
export { AgentBuilder, Agent } from './core/agent-builder';
export { InMemoryStorage, UserPreferenceMemory } from './core/memory';
export { tool, ToolFactory } from './core/tool-factory';
export { Workflow, SequentialWorkflow, ParallelWorkflow } from './core/workflow';

// ==================== AGENT EXPORTS ====================
export {
  proposalAnalystAgentADK,
  createProposalAnalystAgent,
  analyzeProposal,
} from './agents/proposal-analyst-adk.agent';

export {
  votingStrategistAgentADK,
  createVotingStrategistAgent,
  generateRecommendation,
  updateUserPreferences,
  userPreferenceMemory,
} from './agents/voting-strategist-adk.agent';

export {
  treasuryMonitorAgentADK,
  createTreasuryMonitorAgent,
  assessTreasuryHealth,
  treasuryMonitor,
  TreasuryMonitor,
} from './agents/treasury-monitor-adk.agent';

// ==================== LEGACY AGENTS ====================
export { proposalAnalystAgent } from './agents/proposal-analyst.agent';
export { votingStrategistAgent } from './agents/voting-strategist.agent';
export { treasuryMonitorAgent } from './agents/treasury-monitor.agent';
export { managerOrchestrator } from './agents/manager-orchestrator';

// ==================== WORKFLOW EXPORTS ====================
export {
  DAOGovernanceWorkflow,
  daoGovernanceWorkflow,
  runGovernanceAnalysis,
} from './workflows/dao-governance-workflow';
export type {
  GovernanceWorkflowInput,
  GovernanceWorkflowOutput,
} from './workflows/dao-governance-workflow';

// ==================== MCP SERVER EXPORTS ====================
export {
  GovernanceDataMCPServer,
  governanceDataMCPServer,
} from './mcp/governance-data-server';

// ==================== TOOLS EXPORTS ====================
export { stacksBlockchainTools } from './tools/stacks-blockchain-tools';
export * from './tools/dao-tools';

// ==================== INTEGRATION EXPORTS ====================
export {
  DAOCopilotAPI,
  createDAOCopilot,
} from './integration/dao-copilot-api';
export type {
  DAOCopilotConfig,
  AnalysisRequest,
  VotingFeedback,
} from './integration/dao-copilot-api';

// ==================== AUDIT & GUARDRAILS ====================
export { auditLogger, AuditLogger } from './audit/audit-schema';
export { guardrailManager } from './guardrail-manager';
export * from './tools/guardrails';
export { toolRegistry, getToolMetadata, isHighRiskTool } from './tool-registry';

// ==================== MAIN DEMO FUNCTION ====================

import { createDAOCopilot } from './integration/dao-copilot-api';
import { auditLogger } from './audit/audit-schema';

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   BitMind DAO Governance Co-pilot - ADK-TS Implementation     ║');
  console.log('║   Multi-Agent System for Blockchain Governance                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // ==================== INITIALIZE DAO CO-PILOT ====================
    console.log('📦 Initializing DAO Co-pilot...\n');
    
    const copilot = await createDAOCopilot({
      daoAddress: 'SP2X...DAO',
      enableContinuousMonitoring: true,
      monitoringIntervalMs: 60000,
      mcpServerPort: 3001,
    });

    // ==================== ANALYZE PROPOSAL ====================
    console.log('═'.repeat(70));
    console.log('DEMO: Analyzing Proposal with Multi-Agent Workflow');
    console.log('═'.repeat(70) + '\n');

    const analysis = await copilot.analyzeProposal({
      proposalId: 'proposal-mock-001',
      userAddress: 'SP2X...USER',
      userPreferences: {
        riskTolerance: 'medium',
        preferredVoteType: 'informed',
      },
    });

    console.log('\n✅ Governance Analysis Complete!\n');
    console.log('═'.repeat(70));
    console.log('RESULTS SUMMARY');
    console.log('═'.repeat(70));
    console.log(`Run ID: ${analysis.runId}`);
    console.log(`Status: ${analysis.status}`);
    console.log(`Approval Required: ${analysis.approvalRequired ? '⚠️  YES' : '✓ NO'}`);
    console.log(`Confidence: ${(analysis.explainability.confidence * 100).toFixed(1)}%`);
    console.log('\nTop Reasons:');
    analysis.explainability.topReasons.forEach((reason, i) => {
      console.log(`  ${i + 1}. ${reason}`);
    });

    // ==================== TREASURY HEALTH ====================
    console.log('\n' + '═'.repeat(70));
    console.log('TREASURY HEALTH ASSESSMENT');
    console.log('═'.repeat(70) + '\n');

    const treasury = await copilot.getTreasuryHealth();
    console.log('Treasury Health:', treasury);

    // ==================== GOVERNANCE STATS ====================
    console.log('\n' + '═'.repeat(70));
    console.log('GOVERNANCE STATISTICS');
    console.log('═'.repeat(70) + '\n');

    const stats = await copilot.getGovernanceStats('30d');
    console.log('Governance Stats:', stats);

    // ==================== AUDIT LOGS ====================
    console.log('\n' + '═'.repeat(70));
    console.log('AUDIT LOGS');
    console.log('═'.repeat(70) + '\n');

    const logs = auditLogger.getLogs();
    logs.slice(-5).forEach((log) => {
      console.log(
        `[${log.timestamp.toISOString()}] ${log.agentName}: ${log.actionType} (${log.status})`
      );
    });

    console.log('\n' + '═'.repeat(70));
    console.log('✨ DEMO COMPLETED SUCCESSFULLY');
    console.log('═'.repeat(70) + '\n');

    // Cleanup
    await copilot.shutdown();

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

