#!/usr/bin/env node
/**
 * Check Eval Agreement Threshold
 * 
 * Fails CI if eval agreement score is below threshold
 * Used by GitHub Actions to enforce model safety
 */

const fs = require('fs');
const path = require('path');

function main() {
  // Parse arguments
  const args = process.argv.slice(2);
  const thresholdArg = args.find(a => a.startsWith('--threshold'));
  const resultsArg = args.find(a => a.startsWith('--results'));
  
  if (!thresholdArg || !resultsArg) {
    console.error('Usage: node check-eval-threshold.js --threshold 0.70 --results eval-results.json');
    process.exit(1);
  }
  
  const threshold = parseFloat(thresholdArg.split('=')[1]);
  const resultsPath = resultsArg.split('=')[1];
  
  // Read results file
  if (!fs.existsSync(resultsPath)) {
    console.error(`❌ Results file not found: ${resultsPath}`);
    process.exit(1);
  }
  
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  
  // Check agreement score
  const agreement = results.agreement || 0;
  
  console.log('\n========================================');
  console.log('   Agent Evaluation Results');
  console.log('========================================\n');
  console.log(`Total Cases:       ${results.total}`);
  console.log(`Passed:            ${results.passed}`);
  console.log(`Failed:            ${results.failed}`);
  console.log(`Agreement Score:   ${(agreement * 100).toFixed(2)}%`);
  console.log(`Threshold:         ${(threshold * 100).toFixed(2)}%`);
  console.log('');
  
  if (agreement >= threshold) {
    console.log(`✅ PASS: Agreement (${(agreement * 100).toFixed(2)}%) >= Threshold (${(threshold * 100).toFixed(2)}%)`);
    console.log('========================================\n');
    process.exit(0);
  } else {
    console.error(`❌ FAIL: Agreement (${(agreement * 100).toFixed(2)}%) < Threshold (${(threshold * 100).toFixed(2)}%)`);
    console.error('\n⚠️  Model quality degradation detected!');
    console.error('    Review recent changes to:');
    console.error('    - Model versions');
    console.error('    - Prompts');
    console.error('    - Tool configurations');
    console.error('');
    console.error('    Failed cases:');
    
    if (results.failures && results.failures.length > 0) {
      results.failures.slice(0, 5).forEach((f, i) => {
        console.error(`    ${i + 1}. ${f.proposalId}: ${f.reason}`);
      });
      if (results.failures.length > 5) {
        console.error(`    ... and ${results.failures.length - 5} more`);
      }
    }
    
    console.error('========================================\n');
    process.exit(1);
  }
}

main();

