/**
 * Quick Start Demo
 * Demonstrates basic usage of the DAO Governance Co-pilot
 */

import { runGovernanceAnalysis, createRootGovernanceAgent } from '../main-agent-adk';
import { daoGovernanceWorkflow } from '../workflows/dao-governance-adk.workflow';
import { analyzeProposal } from '../agents/proposal-analyst-adk.agent';

/**
 * Example 1: Full Governance Analysis
 */
async function example1_FullGovernanceAnalysis() {
  console.log('\n' + '='.repeat(70));
  console.log('Example 1: Full Governance Analysis');
  console.log('='.repeat(70) + '\n');

  try {
    const result = await runGovernanceAnalysis(
      'proposal-001',
      '0xDAOAddress123',
      {
        riskTolerance: 'MEDIUM',
        address: '0xUserAddress456',
        votingStrategy: {
          strategy: 'BALANCED',
          delegateIfBelowThreshold: false,
          votingPowerThreshold: 0.01,
          autoVote: false,
          requiresApproval: true
        }
      }
    );

    console.log('✅ Analysis Complete!\n');
    console.log('Proposal ID:', result.proposalId);
    console.log('Recommendation:', result.recommendation.vote);
    console.log('Confidence:', (result.recommendation.confidence * 100).toFixed(0) + '%');
    console.log('\nAgent Actions:');
    result.agentActions.forEach((action, idx) => {
      console.log(`  ${idx + 1}. ${action.agentName}: ${action.action}`);
    });
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example 2: Quick Proposal Analysis
 */
async function example2_QuickProposalAnalysis() {
  console.log('\n' + '='.repeat(70));
  console.log('Example 2: Quick Proposal Analysis');
  console.log('='.repeat(70) + '\n');

  try {
    const analysis = await daoGovernanceWorkflow.quickProposalAnalysis(
      'proposal-002',
      '0xDAOAddress123'
    );

    console.log('✅ Quick Analysis:\n');
    console.log(analysis);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example 3: Interactive Agent Query
 */
async function example3_InteractiveQuery() {
  console.log('\n' + '='.repeat(70));
  console.log('Example 3: Interactive Agent Query');
  console.log('='.repeat(70) + '\n');

  try {
    const agent = createRootGovernanceAgent();
    
    const query = "What should I consider when evaluating a DAO treasury diversification proposal?";
    console.log(`Query: ${query}\n`);
    
    const response = await agent.run(query);
    
    console.log('✅ Agent Response:\n');
    console.log(response.content);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example 4: Treasury Impact Analysis
 */
async function example4_TreasuryImpact() {
  console.log('\n' + '='.repeat(70));
  console.log('Example 4: Treasury Impact Analysis');
  console.log('='.repeat(70) + '\n');

  try {
    const analysis = await daoGovernanceWorkflow.treasuryImpactAnalysis(
      '0xDAOAddress123',
      'Proposal to allocate 10% of treasury to USDC stablecoins for operational expenses'
    );

    console.log('✅ Treasury Impact Analysis:\n');
    console.log(analysis);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example 5: Compare Multiple Proposals
 */
async function example5_CompareProposals() {
  console.log('\n' + '='.repeat(70));
  console.log('Example 5: Compare Multiple Proposals');
  console.log('='.repeat(70) + '\n');

  try {
    const comparison = await daoGovernanceWorkflow.compareProposals(
      ['proposal-001', 'proposal-002', 'proposal-003'],
      '0xDAOAddress123'
    );

    console.log('✅ Proposal Comparison:\n');
    console.log(comparison);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Main Demo Runner
 */
async function runDemo() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║        BitMind DAO Governance Co-pilot - Quick Start Demo           ║
║        Built with IQ AI ADK-TS Framework                            ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
  `);

  // Run examples sequentially
  await example1_FullGovernanceAnalysis();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause

  await example2_QuickProposalAnalysis();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await example3_InteractiveQuery();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await example4_TreasuryImpact();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await example5_CompareProposals();

  console.log('\n' + '='.repeat(70));
  console.log('Demo Complete! 🎉');
  console.log('='.repeat(70));
  console.log('\nNext Steps:');
  console.log('  1. Run individual examples: npm run adk:run');
  console.log('  2. Modify user preferences in the examples');
  console.log('  3. Test with your own DAO addresses and proposals');
  console.log('  4. Integrate real blockchain data (see README-ADK.md)');
  console.log('  5. Build a UI on top of these agents\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
}

export { runDemo };

