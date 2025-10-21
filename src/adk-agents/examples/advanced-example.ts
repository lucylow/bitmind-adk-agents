/**
 * Advanced Example: Multi-Proposal Batch Analysis
 * 
 * This example demonstrates advanced features:
 * - Batch processing multiple proposals
 * - Continuous treasury monitoring
 * - User feedback loop
 * - MCP server integration
 */

import { createDAOCopilot } from '../integration/dao-copilot-api';
import { updateUserPreferences } from '../agents/voting-strategist-adk.agent';
import { governanceDataMCPServer } from '../mcp/governance-data-server';

async function advancedExample() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           ADVANCED EXAMPLE: Batch Proposal Analysis          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Configuration
  const daoAddress = 'SP2X...YOUR_DAO';
  const userAddress = 'SP2X...YOUR_ADDRESS';

  // Step 1: Initialize with continuous monitoring
  console.log('📦 Initializing DAO Co-pilot with continuous monitoring...\n');
  
  const copilot = await createDAOCopilot({
    daoAddress,
    enableContinuousMonitoring: true,
    monitoringIntervalMs: 30000, // 30 seconds
    mcpServerPort: 3001,
  });

  // Step 2: Get active proposals
  console.log('📋 Fetching active proposals...\n');
  
  const activeProposals = await copilot.getActiveProposals();
  console.log(`Found ${activeProposals.length} active proposals\n`);

  // Step 3: Analyze all proposals in parallel
  console.log('🔄 Analyzing all proposals in parallel...\n');

  const analysisPromises = activeProposals.map((proposal: any) =>
    copilot.analyzeProposal({
      proposalId: proposal.id,
      userAddress,
      userPreferences: {
        riskTolerance: 'moderate',
        votingStyle: 'data-driven',
      },
    })
  );

  const analyses = await Promise.all(analysisPromises);
  console.log('✅ All analyses complete!\n');

  // Step 4: Process results
  console.log('═'.repeat(70));
  console.log('BATCH ANALYSIS RESULTS');
  console.log('═'.repeat(70) + '\n');

  const needsReview = analyses.filter((a) => a.approvalRequired);
  const highConfidence = analyses.filter(
    (a) => !a.approvalRequired && a.explainability.confidence > 0.8
  );

  console.log(`Total Analyzed: ${analyses.length}`);
  console.log(`Needs Review: ${needsReview.length}`);
  console.log(`High Confidence: ${highConfidence.length}\n`);

  // Display summary for each proposal
  analyses.forEach((analysis, index) => {
    console.log(`\nProposal ${index + 1}:`);
    console.log(`  Run ID: ${analysis.runId}`);
    console.log(`  Status: ${analysis.status}`);
    console.log(`  Confidence: ${(analysis.explainability.confidence * 100).toFixed(1)}%`);
    console.log(`  Approval Required: ${analysis.approvalRequired ? '⚠️  YES' : '✅ NO'}`);
    console.log(`  Top Reason: ${analysis.explainability.topReasons[0] || 'N/A'}`);
  });

  // Step 5: Simulate user feedback loop
  console.log('\n' + '═'.repeat(70));
  console.log('USER FEEDBACK SIMULATION');
  console.log('═'.repeat(70) + '\n');

  // Simulate user voting on first proposal
  const firstAnalysis = analyses[0];
  if (firstAnalysis) {
    console.log('Simulating user vote on first proposal...\n');

    await copilot.submitVotingFeedback(userAddress, {
      proposalId: activeProposals[0].id,
      actualVote: 'FOR',
      satisfactionScore: 0.9,
      feedbackNotes: 'Great recommendation! Aligned with my values.',
    });

    console.log('✅ Feedback recorded and preferences updated!\n');
  }

  // Step 6: Get governance statistics
  console.log('═'.repeat(70));
  console.log('GOVERNANCE STATISTICS');
  console.log('═'.repeat(70) + '\n');

  const stats30d = await copilot.getGovernanceStats('30d');
  console.log('30-Day Statistics:', stats30d);

  // Step 7: Get user voting history
  console.log('\n═'.repeat(70));
  console.log('USER VOTING HISTORY');
  console.log('═'.repeat(70) + '\n');

  const history = await copilot.getVoterHistory(userAddress, 10);
  console.log('Voting History:', history);

  // Step 8: Get audit logs
  console.log('\n═'.repeat(70));
  console.log('AUDIT LOGS (Last 5)');
  console.log('═'.repeat(70) + '\n');

  const auditLogs = copilot.getAuditLogs();
  auditLogs.slice(-5).forEach((log) => {
    console.log(
      `[${log.timestamp.toISOString()}] ${log.agentName}: ${log.actionType} (${log.status})`
    );
  });

  // Step 9: Demonstrate priority filtering
  console.log('\n' + '═'.repeat(70));
  console.log('PRIORITY PROPOSALS (Need Review)');
  console.log('═'.repeat(70) + '\n');

  if (needsReview.length > 0) {
    console.log('These proposals need human review:\n');
    needsReview.forEach((analysis, index) => {
      console.log(`${index + 1}. ${analysis.runId}`);
      console.log(`   Confidence: ${(analysis.explainability.confidence * 100).toFixed(1)}%`);
      console.log(`   Risk Factors: ${analysis.explainability.riskFactors.length}`);
      console.log('');
    });
  } else {
    console.log('✅ No proposals require review!\n');
  }

  // Step 10: Cleanup
  console.log('═'.repeat(70));
  console.log('CLEANUP');
  console.log('═'.repeat(70) + '\n');

  console.log('🛑 Stopping treasury monitoring...');
  console.log('🛑 Shutting down co-pilot...\n');
  
  await copilot.shutdown();

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║              ✨ ADVANCED EXAMPLE COMPLETED! ✨                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('Summary:');
  console.log(`  ✓ Analyzed ${analyses.length} proposals`);
  console.log(`  ✓ Identified ${needsReview.length} proposals needing review`);
  console.log(`  ✓ Recorded user feedback`);
  console.log(`  ✓ Monitored treasury health`);
  console.log(`  ✓ Generated audit trail\n`);
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  advancedExample().catch((error) => {
    console.error('❌ Error running advanced example:', error);
    process.exit(1);
  });
}

export { advancedExample };

