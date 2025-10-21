/**
 * Simple Example: Using DAO Governance Co-pilot
 * 
 * This example demonstrates the easiest way to use the ADK-TS agents
 * for DAO governance analysis.
 */

import { createDAOCopilot } from '../integration/dao-copilot-api';

async function simpleExample() {
  console.log('='.repeat(70));
  console.log('SIMPLE EXAMPLE: DAO Governance Analysis');
  console.log('='.repeat(70) + '\n');

  // Step 1: Initialize the DAO Co-pilot
  console.log('📦 Step 1: Initializing DAO Co-pilot...\n');
  
  const copilot = await createDAOCopilot({
    daoAddress: 'SP2X...YOUR_DAO',
    enableContinuousMonitoring: false, // Disable monitoring for this example
  });

  console.log('✅ Co-pilot initialized!\n');

  // Step 2: Analyze a proposal
  console.log('📊 Step 2: Analyzing a proposal...\n');

  const analysisResult = await copilot.analyzeProposal({
    proposalId: 'example-proposal-001',
    userAddress: 'SP2X...YOUR_ADDRESS',
    userPreferences: {
      riskTolerance: 'moderate',
      votingStyle: 'data-driven',
      focusAreas: ['treasury', 'security'],
    },
  });

  console.log('✅ Analysis complete!\n');

  // Step 3: Display results
  console.log('='.repeat(70));
  console.log('ANALYSIS RESULTS');
  console.log('='.repeat(70) + '\n');

  console.log(`Run ID: ${analysisResult.runId}`);
  console.log(`Status: ${analysisResult.status}`);
  console.log(`Approval Required: ${analysisResult.approvalRequired ? '⚠️  YES' : '✅ NO'}`);
  console.log(`Confidence: ${(analysisResult.explainability.confidence * 100).toFixed(1)}%\n`);

  console.log('📝 Top Reasons for Recommendation:');
  analysisResult.explainability.topReasons.forEach((reason: string, index: number) => {
    console.log(`  ${index + 1}. ${reason}`);
  });

  console.log('\n⚠️  Risk Factors:');
  if (analysisResult.explainability.riskFactors.length === 0) {
    console.log('  None identified');
  } else {
    analysisResult.explainability.riskFactors.forEach((risk: string, index: number) => {
      console.log(`  ${index + 1}. ${risk}`);
    });
  }

  console.log('\n🤔 Alternative Views:');
  analysisResult.explainability.alternativeViews.forEach((view: string, index: number) => {
    console.log(`  ${index + 1}. ${view}`);
  });

  // Step 4: Get treasury health (bonus)
  console.log('\n' + '='.repeat(70));
  console.log('TREASURY HEALTH CHECK');
  console.log('='.repeat(70) + '\n');

  const treasuryHealth = await copilot.getTreasuryHealth();
  console.log('Treasury Health:', treasuryHealth);

  // Step 5: Cleanup
  console.log('\n🛑 Shutting down...\n');
  await copilot.shutdown();

  console.log('='.repeat(70));
  console.log('✨ EXAMPLE COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(70) + '\n');
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  simpleExample().catch((error) => {
    console.error('❌ Error running example:', error);
    process.exit(1);
  });
}

export { simpleExample };

