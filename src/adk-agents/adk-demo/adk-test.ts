#!/usr/bin/env tsx

/**
 * ADK-TS Implementation Test
 * 
 * This script demonstrates the DAO Governance Co-pilot using the official ADK-TS framework
 * with AgentBuilder, tool(), and Workflow classes.
 * 
 * Run with: npx tsx src/adk-agents/adk-demo/adk-test.ts
 * or: npm run adk:test
 */

import { DAOGovernanceWorkflow, analyzeProposal, getQuickSummary } from '../adk-workflows/governance.workflow';
import { rootAgent } from '../adk-agents/agent';

const DEMO_PROPOSAL_ID = 'proposal-001';
const DEMO_DAO_ADDRESS = '0xc0Da02939E1441F497fd74F78cE7Decb17B66529'; // Compound Governor
const DEMO_USER_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

/**
 * Demo 1: Full Proposal Analysis with Multi-Agent Workflow
 */
async function demoFullAnalysis() {
  console.log('\n' + '='.repeat(80));
  console.log('DEMO 1: Full Proposal Analysis (Multi-Agent Workflow)');
  console.log('='.repeat(80));

  try {
    const result = await analyzeProposal({
      proposalId: DEMO_PROPOSAL_ID,
      daoAddress: DEMO_DAO_ADDRESS,
      userAddress: DEMO_USER_ADDRESS,
      userRiskTolerance: 'moderate'
    });

    console.log('\n📊 WORKFLOW RESULT:');
    console.log('━'.repeat(80));
    console.log(`\nProposal: ${result.proposalId}`);
    console.log(`Status: ${result.workflow.status}`);
    console.log(`Execution Time: ${result.workflow.executionTime}ms`);
    console.log(`Steps Completed: ${result.workflow.stepsCompleted}`);
    
    console.log('\n📋 PROPOSAL ANALYSIS:');
    console.log(result.analysis.content);
    
    console.log('\n🗳️  VOTING RECOMMENDATION:');
    console.log(result.recommendation.content);
    
    console.log('\n' + '━'.repeat(80));
    return result;
  } catch (error) {
    console.error('\n❌ Full analysis demo failed:', error);
    throw error;
  }
}

/**
 * Demo 2: Quick Proposal Summary
 */
async function demoQuickSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('DEMO 2: Quick Proposal Summary');
  console.log('='.repeat(80));

  try {
    const result = await getQuickSummary(DEMO_PROPOSAL_ID, DEMO_DAO_ADDRESS);

    console.log('\n📋 QUICK SUMMARY:');
    console.log('━'.repeat(80));
    console.log(result.summary);
    console.log('\n' + '━'.repeat(80));
    
    return result;
  } catch (error) {
    console.error('\n❌ Quick summary demo failed:', error);
    throw error;
  }
}

/**
 * Demo 3: Direct Agent Interaction
 */
async function demoDirect AgentChat() {
  console.log('\n' + '='.repeat(80));
  console.log('DEMO 3: Direct Agent Chat');
  console.log('='.repeat(80));

  try {
    console.log('\n🤖 User: "What tools do you have?"');
    const response1 = await rootAgent.run("What tools do you have available to help with DAO governance?");
    console.log('\n💬 Agent:', response1.content);

    console.log('\n🤖 User: "Check treasury for Compound DAO"');
    const response2 = await rootAgent.run(`Check the treasury status for DAO at address ${DEMO_DAO_ADDRESS}`);
    console.log('\n💬 Agent:', response2.content);

    console.log('\n' + '━'.repeat(80));
    return { response1, response2 };
  } catch (error) {
    console.error('\n❌ Direct agent chat demo failed:', error);
    throw error;
  }
}

/**
 * Demo 4: Batch Proposal Analysis
 */
async function demoBatchAnalysis() {
  console.log('\n' + '='.repeat(80));
  console.log('DEMO 4: Batch Proposal Analysis');
  console.log('='.repeat(80));

  try {
    const workflow = new DAOGovernanceWorkflow();
    
    const proposals = [
      { proposalId: 'proposal-001', daoAddress: DEMO_DAO_ADDRESS },
      { proposalId: 'proposal-002', daoAddress: DEMO_DAO_ADDRESS },
      { proposalId: 'proposal-003', daoAddress: DEMO_DAO_ADDRESS },
    ];

    const result = await workflow.batchAnalyze(proposals);

    console.log('\n📊 BATCH ANALYSIS RESULTS:');
    console.log('━'.repeat(80));
    console.log(`Total Proposals: ${result.totalProposals}`);
    console.log(`Successful: ${result.successful}`);
    console.log(`Failed: ${result.failed}`);
    
    result.results.forEach((r, i) => {
      console.log(`\n${i + 1}. Proposal ${r.proposalId}:`);
      if ('error' in r) {
        console.log(`   ❌ Error: ${r.error}`);
      } else {
        console.log(`   ✅ Analyzed successfully`);
      }
    });

    console.log('\n' + '━'.repeat(80));
    return result;
  } catch (error) {
    console.error('\n❌ Batch analysis demo failed:', error);
    throw error;
  }
}

/**
 * Main Demo Runner
 */
async function runAllDemos() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║           DAO GOVERNANCE CO-PILOT - ADK-TS IMPLEMENTATION TEST            ║');
  console.log('║                    Using Official ADK-TS Framework                         ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n🎯 This demo showcases:');
  console.log('   • AgentBuilder with custom tools');
  console.log('   • Multi-agent workflows with Workflow class');
  console.log('   • Real MCP server integration');
  console.log('   • Web3 blockchain interactions');
  console.log('\n');

  const demos = [
    { name: 'Full Analysis', fn: demoFullAnalysis },
    { name: 'Quick Summary', fn: demoQuickSummary },
    { name: 'Direct Chat', fn: demoDirectAgentChat },
    { name: 'Batch Analysis', fn: demoBatchAnalysis },
  ];

  const results = [];

  for (const demo of demos) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Pause between demos
      const result = await demo.fn();
      results.push({ demo: demo.name, status: 'SUCCESS', result });
    } catch (error) {
      console.error(`\n❌ ${demo.name} failed:`, error);
      results.push({ demo: demo.name, status: 'FAILED', error });
    }
  }

  // Summary
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                           DEMO SUMMARY                                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  results.forEach((r, i) => {
    const status = r.status === 'SUCCESS' ? '✅' : '❌';
    console.log(`${i + 1}. ${status} ${r.demo}: ${r.status}`);
  });

  const successCount = results.filter(r => r.status === 'SUCCESS').length;
  console.log(`\n📊 Success Rate: ${successCount}/${results.length} (${((successCount/results.length) * 100).toFixed(0)}%)`);

  console.log('\n🎉 Key Features Demonstrated:');
  console.log('   ✓ AgentBuilder API with gemini-2.5-flash');
  console.log('   ✓ Custom tools with Zod schemas');
  console.log('   ✓ Multi-agent workflow coordination');
  console.log('   ✓ MCP server integration');
  console.log('   ✓ Blockchain data access via ethers.js');
  console.log('   ✓ Comprehensive proposal analysis');
  console.log('   ✓ Personalized voting recommendations');
  console.log('\n');

  console.log('🚀 Next Steps:');
  console.log('   1. Configure API keys in .env file');
  console.log('   2. Run: adk run (for CLI chat)');
  console.log('   3. Run: adk web (for web interface)');
  console.log('   4. Customize agents and tools for your DAO');
  console.log('\n');
}

// Run demos
runAllDemos().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

export { runAllDemos };

