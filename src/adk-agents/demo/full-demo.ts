#!/usr/bin/env tsx

/**
 * DAO Governance Co-pilot - Full Demo Script
 * 
 * This demo showcases the complete DAO Governance Co-pilot system:
 * - Multi-agent analysis of DAO proposals
 * - Treasury monitoring and health assessment
 * - Risk assessment and voting recommendations
 * - Advanced workflow orchestration
 * 
 * Run with: npm run adk:demo
 */

import { GovernanceWorkflow, MultiDAOMonitoringWorkflow, BatchProposalAnalysisWorkflow } from '../workflows/governance-workflow';
import { auditLogger } from '../audit/audit-schema';

const DEMO_DAO_ADDRESS = '0xc0Da02939E1441F497fd74F78cE7Decb17B66529'; // Compound Governor
const DEMO_PROPOSAL_ID = 'proposal-demo-001';
const DEMO_USER_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

/**
 * Demo 1: Single Proposal Analysis
 */
async function demoSingleProposalAnalysis() {
  console.log('\n' + '='.repeat(80));
  console.log('DEMO 1: Single Proposal Analysis');
  console.log('='.repeat(80));

  const workflow = new GovernanceWorkflow();

  const result = await workflow.execute({
    proposalId: DEMO_PROPOSAL_ID,
    daoAddress: DEMO_DAO_ADDRESS,
    userContext: {
      address: DEMO_USER_ADDRESS,
      preferences: {
        riskTolerance: 'moderate',
        votingStyle: 'informed',
        priorities: ['security', 'financial-stability', 'long-term-growth'],
      },
    },
    options: {
      includeHistoricalComparison: true,
      includeTreasuryAnalysis: true,
      includeRiskAssessment: true,
      generateVotingRecommendation: true,
    },
  });

  console.log('\n📊 ANALYSIS RESULTS:');
  console.log('━'.repeat(80));
  
  console.log('\n1️⃣  PROPOSAL SUMMARY:');
  console.log(`   Title: ${result.proposalAnalysis.proposal.title}`);
  console.log(`   Status: ${result.proposalAnalysis.proposal.status}`);
  console.log(`   Proposer: ${result.proposalAnalysis.proposal.proposer.slice(0, 10)}...`);
  
  console.log('\n2️⃣  FINANCIAL IMPACT:');
  console.log(`   Estimated Cost: $${result.proposalAnalysis.financialImpact.estimatedCost.toLocaleString()}`);
  console.log(`   Treasury Impact: ${(result.proposalAnalysis.financialImpact.treasuryImpact * 100).toFixed(2)}%`);
  console.log(`   Risk Score: ${(result.proposalAnalysis.financialImpact.riskScore * 100).toFixed(1)}%`);
  
  console.log('\n3️⃣  SECURITY ANALYSIS:');
  console.log(`   Risk Level: ${result.proposalAnalysis.securityAnalysis.riskLevel}`);
  console.log(`   Concerns Found: ${result.proposalAnalysis.securityAnalysis.concerns.length}`);
  if (result.proposalAnalysis.securityAnalysis.concerns.length > 0) {
    result.proposalAnalysis.securityAnalysis.concerns.forEach((concern: string, i: number) => {
      console.log(`     ${i + 1}. ${concern}`);
    });
  }

  if (result.treasuryStatus) {
    console.log('\n4️⃣  TREASURY STATUS:');
    console.log(`   Total Value: $${result.treasuryStatus.totalValue.toLocaleString()}`);
    console.log(`   Health Score: ${(result.treasuryStatus.healthScore * 100).toFixed(1)}%`);
    console.log(`   Token Holdings:`);
    result.treasuryStatus.tokens.slice(0, 3).forEach((token: any) => {
      console.log(`     • ${token.symbol}: $${token.value.toLocaleString()} (${token.percentage.toFixed(1)}%)`);
    });
  }

  if (result.votingRecommendation) {
    console.log('\n5️⃣  VOTING RECOMMENDATION:');
    console.log(`   Recommendation: ${result.votingRecommendation.recommendation}`);
    console.log(`   Confidence: ${(result.votingRecommendation.confidence * 100).toFixed(1)}%`);
    console.log(`   Reasoning:`);
    result.votingRecommendation.reasoning.forEach((reason: string, i: number) => {
      console.log(`     ${i + 1}. ${reason}`);
    });
  }

  if (result.riskProfile) {
    console.log('\n6️⃣  RISK PROFILE:');
    console.log(`   Overall Risk: ${result.riskProfile.riskLevel} (${(result.riskProfile.overallRiskScore * 100).toFixed(1)}%)`);
    console.log(`   Recommendations:`);
    result.riskProfile.recommendations.slice(0, 3).forEach((rec: string, i: number) => {
      console.log(`     ${i + 1}. ${rec}`);
    });
  }

  if (result.historicalComparison) {
    console.log('\n7️⃣  HISTORICAL COMPARISON:');
    console.log(`   Similar Proposals Found: ${result.historicalComparison.similarProposals.length}`);
    console.log(`   Success Probability: ${(result.historicalComparison.successProbability * 100).toFixed(1)}%`);
  }

  console.log('\n' + '━'.repeat(80));
  console.log(`✨ Analysis completed in ${result.executionTime}ms`);
  
  if (result.requiresApproval) {
    console.log(`\n⚠️  HUMAN APPROVAL REQUIRED`);
    console.log(`   Reason: ${result.approvalReason}`);
  }

  return result;
}

/**
 * Demo 2: Multi-DAO Treasury Monitoring
 */
async function demoMultiDAOMonitoring() {
  console.log('\n' + '='.repeat(80));
  console.log('DEMO 2: Multi-DAO Treasury Monitoring');
  console.log('='.repeat(80));

  const workflow = new MultiDAOMonitoringWorkflow();

  const daos = [
    '0xc0Da02939E1441F497fd74F78cE7Decb17B66529', // Compound
    '0xEC568fffba86c094cf06b22134B23074DFE2252c', // Aave
    '0x408ED6354d4973f66138C91495F2f2FCbd8724C3', // Uniswap
  ];

  const results = await workflow.monitor(daos);

  console.log('\n📊 MONITORING RESULTS:');
  console.log('━'.repeat(80));

  results.forEach((result, index) => {
    console.log(`\n${index + 1}️⃣  DAO: ${result.daoAddress.slice(0, 10)}...`);
    
    if (result.treasuryStatus) {
      console.log(`   Treasury: $${result.treasuryStatus.totalValue.toLocaleString()}`);
      console.log(`   Health: ${(result.treasuryStatus.healthScore * 100).toFixed(1)}%`);
      console.log(`   Active Proposals: ${result.activeProposals}`);
      
      if (result.alerts.length > 0) {
        console.log(`   🚨 Alerts:`);
        result.alerts.forEach((alert: string) => {
          console.log(`      • ${alert}`);
        });
      } else {
        console.log(`   ✅ No alerts`);
      }
    } else {
      console.log(`   ❌ Failed to fetch data`);
    }
  });

  console.log('\n' + '━'.repeat(80));

  return results;
}

/**
 * Demo 3: Batch Proposal Analysis
 */
async function demoBatchProposalAnalysis() {
  console.log('\n' + '='.repeat(80));
  console.log('DEMO 3: Batch Proposal Analysis');
  console.log('='.repeat(80));

  const workflow = new BatchProposalAnalysisWorkflow();

  const proposals = [
    { id: 'proposal-001', daoAddress: DEMO_DAO_ADDRESS },
    { id: 'proposal-002', daoAddress: DEMO_DAO_ADDRESS },
    { id: 'proposal-003', daoAddress: DEMO_DAO_ADDRESS },
  ];

  const results = await workflow.analyze(proposals);

  console.log('\n📊 BATCH ANALYSIS RESULTS:');
  console.log('━'.repeat(80));

  results.forEach((result, index) => {
    if (result) {
      console.log(`\n${index + 1}️⃣  Proposal: ${result.proposalId}`);
      console.log(`   Title: ${result.proposalAnalysis.proposal.title}`);
      console.log(`   Risk: ${result.proposalAnalysis.securityAnalysis.riskLevel}`);
      if (result.votingRecommendation) {
        console.log(`   Recommendation: ${result.votingRecommendation.recommendation} (${(result.votingRecommendation.confidence * 100).toFixed(1)}%)`);
      }
    }
  });

  console.log('\n' + '━'.repeat(80));

  return results;
}

/**
 * Demo 4: Agent Audit Trail
 */
async function demoAuditTrail() {
  console.log('\n' + '='.repeat(80));
  console.log('DEMO 4: Agent Audit Trail');
  console.log('='.repeat(80));

  const logs = auditLogger.getLogs();

  console.log(`\n📋 Total audit logs: ${logs.length}`);
  console.log('━'.repeat(80));

  // Group by agent
  const byAgent: Record<string, number> = {};
  logs.forEach((log) => {
    byAgent[log.agentName] = (byAgent[log.agentName] || 0) + 1;
  });

  console.log('\n📊 Logs by Agent:');
  Object.entries(byAgent).forEach(([agent, count]) => {
    console.log(`   ${agent}: ${count} operations`);
  });

  // Show recent logs
  console.log('\n📝 Recent Operations:');
  const recentLogs = logs.slice(-5);
  recentLogs.forEach((log, index) => {
    const time = log.timestamp.toLocaleTimeString();
    console.log(`   ${recentLogs.length - index}. [${time}] ${log.agentName} - ${log.actionType} (${log.status})`);
  });

  console.log('\n' + '━'.repeat(80));

  return logs;
}

/**
 * Main demo runner
 */
async function runDemo() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    DAO GOVERNANCE CO-PILOT DEMO                            ║');
  console.log('║                 Multi-Agent System Built with ADK-TS                       ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  try {
    // Run all demos
    await demoSingleProposalAnalysis();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Pause between demos

    await demoMultiDAOMonitoring();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await demoBatchProposalAnalysis();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await demoAuditTrail();

    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                         DEMO COMPLETED SUCCESSFULLY                        ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝');
    console.log('\n');

    console.log('🎯 KEY FEATURES DEMONSTRATED:');
    console.log('   ✓ Multi-agent proposal analysis');
    console.log('   ✓ Real-time treasury monitoring');
    console.log('   ✓ Comprehensive risk assessment');
    console.log('   ✓ Intelligent voting recommendations');
    console.log('   ✓ Historical proposal comparison');
    console.log('   ✓ Batch processing capabilities');
    console.log('   ✓ Complete audit trail logging');
    console.log('   ✓ Guardrail and approval system\n');

    console.log('🚀 NEXT STEPS:');
    console.log('   1. Customize user preferences in the workflow');
    console.log('   2. Connect to real DAO contracts');
    console.log('   3. Integrate with wallet for voting');
    console.log('   4. Deploy as a production service\n');

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo if executed directly
runDemo().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { runDemo };

