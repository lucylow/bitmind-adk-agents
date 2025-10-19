import { managerOrchestrator } from './agents/manager-orchestrator';
import { auditLogger } from './audit/audit-schema';

/**
 * BitMind DAO Governance Co-pilot
 * Main entry point for the application
 */

async function main() {
  console.log('🚀 BitMind DAO Governance Co-pilot starting...\n');

  try {
    // Example: Run governance flow for a proposal
    const result = await managerOrchestrator.runFullGovernanceFlow(
      'proposal-mock-001',
      '0xDAOADDRESS',
      {
        preferences: {
          riskTolerance: 'medium',
          preferredVoteType: 'informed',
        },
        address: '0xUserAddress',
      }
    );

    console.log('\n✅ Governance Flow Result:');
    console.log(JSON.stringify(result, null, 2));

    // Display audit logs
    console.log('\n📋 Audit Logs:');
    const logs = auditLogger.getLogs();
    logs.forEach((log) => {
      console.log(
        `  - [${log.timestamp.toISOString()}] ${log.agentName}: ${log.actionType} (${log.status})`
      );
    });
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { managerOrchestrator, auditLogger };

