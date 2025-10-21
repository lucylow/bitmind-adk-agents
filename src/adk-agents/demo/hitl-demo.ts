/**
 * Human-in-the-Loop (HITL) Demo
 * Demonstrates comprehensive HITL features for DAO governance
 */

import {
  createHITLWorkflow,
  ActionType,
  RiskLevel,
  ApprovalLevel,
  performSafetyCheck,
  type HITLConfig
} from '../hitl';

/**
 * Demo user configurations
 */
const CAUTIOUS_USER_CONFIG: HITLConfig = {
  approvalLevel: ApprovalLevel.REVIEW,
  riskTolerance: RiskLevel.LOW,
  requiredConfirmations: 2,
  timeoutMs: 300000,
  fallbackAction: 'wait',
  autoApproveThreshold: 1000
};

const EXPERIENCED_USER_CONFIG: HITLConfig = {
  approvalLevel: ApprovalLevel.AUTO,
  riskTolerance: RiskLevel.HIGH,
  requiredConfirmations: 1,
  timeoutMs: 180000,
  fallbackAction: 'escalate',
  autoApproveThreshold: 50000
};

const CONSERVATIVE_USER_CONFIG: HITLConfig = {
  approvalLevel: ApprovalLevel.MANUAL,
  riskTolerance: RiskLevel.LOW,
  requiredConfirmations: 3,
  timeoutMs: 600000,
  fallbackAction: 'abort'
};

/**
 * Scenario 1: Low-Risk Routine Vote
 */
async function demoRoutineVote() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 SCENARIO 1: LOW-RISK ROUTINE VOTE');
  console.log('='.repeat(80));
  
  const workflow = createHITLWorkflow('experienced-user', EXPERIENCED_USER_CONFIG);
  
  // Perform safety check first
  const safetyCheck = await workflow.safetyCheck(
    ActionType.VOTE,
    {
      proposalId: 'PROP-2024-001',
      vote: 'FOR',
      votingPower: '5000',
      reasoning: 'Standard parameter adjustment proposal'
    }
  );
  
  console.log('\n🛡️  Safety Check Results:');
  console.log(`   Passed: ${safetyCheck.passed ? '✅ YES' : '❌ NO'}`);
  console.log(`   Overall Score: ${(safetyCheck.overallScore * 100).toFixed(0)}%`);
  console.log(`   Warnings: ${safetyCheck.warnings.length}`);
  console.log(`   Blockers: ${safetyCheck.blockers.length}`);
  
  if (safetyCheck.passed) {
    // Request approval
    const approvalId = await workflow.requestApproval(
      ActionType.VOTE,
      'Vote FOR on routine governance proposal',
      {
        proposalId: 'PROP-2024-001',
        vote: 'FOR',
        votingPower: '5000'
      },
      {
        reasoning: 'Standard parameter adjustment with community consensus',
        risks: ['Minimal - routine parameter change'],
        benefits: ['Improved protocol efficiency', 'Community endorsed'],
        alternatives: ['Vote AGAINST', 'Abstain']
      }
    );
    
    console.log(`\n📋 Approval requested: ${approvalId}`);
    
    // Simulate auto-approval for low-risk action
    setTimeout(async () => {
      await workflow.approve(approvalId, 'Auto-approved for experienced user with low risk');
      console.log('\n✅ Action auto-approved and executed');
    }, 1000);
  }
}

/**
 * Scenario 2: High-Risk Treasury Allocation
 */
async function demoTreasuryAllocation() {
  console.log('\n' + '='.repeat(80));
  console.log('💰 SCENARIO 2: HIGH-RISK TREASURY ALLOCATION');
  console.log('='.repeat(80));
  
  const workflow = createHITLWorkflow('cautious-user', CAUTIOUS_USER_CONFIG);
  
  // Check safety for large amount
  const safetyCheck = await performSafetyCheck(
    ActionType.WITHDRAW,
    {
      amount: '500000',
      protocol: 'New DeFi Protocol',
      recipient: '0x742d35Cc6634C0532925a3b8Dc9B0f7d5a6C6D5a'
    }
  );
  
  console.log('\n🛡️  Safety Check Results:');
  console.log(`   Passed: ${safetyCheck.passed ? '✅ YES' : '❌ NO'}`);
  safetyCheck.checks.forEach(check => {
    const emoji = check.passed ? '✅' : '❌';
    console.log(`   ${emoji} ${check.name}: ${check.message}`);
  });
  
  if (safetyCheck.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    safetyCheck.warnings.forEach(w => console.log(`   • ${w}`));
  }
  
  // Request approval with detailed information
  const approvalId = await workflow.requestApproval(
    ActionType.WITHDRAW,
    'Allocate $500K to new DeFi yield protocol',
    {
      amount: '500000',
      protocol: 'New DeFi Protocol',
      recipient: '0x742d35Cc6634C0532925a3b8Dc9B0f7d5a6C6D5a',
      expectedAPY: '12%'
    },
    {
      reasoning: 'Diversify treasury into high-yield opportunity',
      risks: [
        'Smart contract risk - protocol is relatively new',
        'Impermanent loss potential',
        'Protocol failure could result in total loss',
        'Large allocation (10% of treasury)'
      ],
      benefits: [
        'Higher yield potential (12% APY vs current 3%)',
        'Portfolio diversification',
        'Early adopter advantages',
        'Can withdraw if risks materialize'
      ],
      alternatives: [
        'Start with smaller test allocation ($50K)',
        'Wait for protocol security audit',
        'Split across multiple protocols',
        'Keep in current safe positions'
      ]
    }
  );
  
  console.log(`\n📋 Approval requested: ${approvalId}`);
  console.log('⏳ Awaiting human decision...');
  
  // Check status after delay
  setTimeout(async () => {
    const status = await workflow.checkApproval(approvalId);
    console.log(`\n📊 Approval Status: ${status.status}`);
    
    if (status.status === 'pending') {
      // Simulate user reviewing and making decision
      console.log('\n🤔 User reviewing proposal...');
      setTimeout(async () => {
        await workflow.approve(
          approvalId,
          'Approved after careful review. Will monitor closely and set stop-loss.'
        );
        console.log('\n✅ User approved with conditions');
      }, 2000);
    }
  }, 1500);
}

/**
 * Scenario 3: Complex Delegation Decision
 */
async function demoDelegationDecision() {
  console.log('\n' + '='.repeat(80));
  console.log('🤝 SCENARIO 3: COMPLEX DELEGATION DECISION');
  console.log('='.repeat(80));
  
  const workflow = createHITLWorkflow('beginner-user', {
    approvalLevel: ApprovalLevel.REVIEW,
    riskTolerance: RiskLevel.MEDIUM,
    requiredConfirmations: 1,
    timeoutMs: 300000,
    fallbackAction: 'wait'
  });
  
  const delegateAddress = '0x742d35Cc6634C0532925a3b8Dc9B0f7d5a6C6D5a';
  
  // Safety check for delegation
  const safetyCheck = await performSafetyCheck(
    ActionType.DELEGATE,
    {
      delegate: delegateAddress,
      amount: '25000',
      duration: '90days'
    }
  );
  
  console.log('\n🛡️  Safety Check Results:');
  console.log(`   Address validation: ${safetyCheck.checks.find(c => c.name === 'address_validation')?.passed ? '✅' : '❌'}`);
  console.log(`   Overall safety score: ${(safetyCheck.overallScore * 100).toFixed(0)}%`);
  
  const approvalId = await workflow.requestApproval(
    ActionType.DELEGATE,
    'Delegate 25,000 tokens to experienced community member',
    {
      delegate: delegateAddress,
      amount: '25000',
      duration: '90days'
    },
    {
      reasoning: 'Delegate to experienced governance participant with strong track record',
      risks: [
        'Delegate could vote against your interests',
        'Cannot directly vote during delegation period',
        'Delegate could become inactive',
        'Reversing delegation requires transaction'
      ],
      benefits: [
        'Leverage expert knowledge for complex proposals',
        'Maintain governance participation while learning',
        'Delegate has 95% participation rate',
        'Can monitor and re-delegate if needed'
      ],
      alternatives: [
        'Vote directly on all proposals',
        'Split delegation across multiple delegates',
        'Start with smaller delegation amount',
        'Wait until you gain more experience'
      ]
    }
  );
  
  console.log(`\n📋 Delegation approval requested: ${approvalId}`);
  console.log('💡 Tip: Review delegate voting history before approving');
}

/**
 * Scenario 4: Critical Protocol Upgrade
 */
async function demoProtocolUpgrade() {
  console.log('\n' + '='.repeat(80));
  console.log('🔧 SCENARIO 4: CRITICAL PROTOCOL UPGRADE');
  console.log('='.repeat(80));
  
  const workflow = createHITLWorkflow('conservative-user', CONSERVATIVE_USER_CONFIG);
  
  // Critical action always requires multiple confirmations
  const safetyCheck = await performSafetyCheck(
    ActionType.EXECUTE,
    {
      proposalId: 'UPGRADE-V2.1.0',
      contract: '0xProtocolMainContract',
      newVersion: 'v2.1.0',
      affectedContracts: ['Main', 'Treasury', 'Governance']
    }
  );
  
  console.log('\n🛡️  Critical Safety Analysis:');
  console.log(`   Risk Level: CRITICAL`);
  console.log(`   Reversibility: ${safetyCheck.checks.length > 0 ? 'IRREVERSIBLE' : 'Unknown'}`);
  console.log(`   Affected Components: 3 core contracts`);
  
  const approvalId = await workflow.requestApproval(
    ActionType.EXECUTE,
    'Execute protocol upgrade to v2.1.0',
    {
      proposalId: 'UPGRADE-V2.1.0',
      contract: '0xProtocolMainContract',
      newVersion: 'v2.1.0'
    },
    {
      reasoning: 'Critical security patches and performance improvements',
      risks: [
        '🚨 CRITICAL: Upgrade failure could lock all funds',
        '🚨 CRITICAL: Protocol downtime during upgrade',
        'HIGH: Potential bugs in new code',
        'MEDIUM: User confusion from UI changes'
      ],
      benefits: [
        'Patches 2 critical security vulnerabilities',
        '40% gas cost reduction',
        'New features for governance',
        'Audited by 3 security firms'
      ],
      alternatives: [
        'Deploy to testnet first for validation',
        'Gradual rollout with feature flags',
        'Wait for more community testing',
        'Implement emergency pause mechanism first'
      ]
    }
  );
  
  console.log(`\n📋 CRITICAL approval requested: ${approvalId}`);
  console.log('⚠️  This action requires multiple confirmations');
  console.log('🔒 Manual review REQUIRED');
}

/**
 * Scenario 5: Unusual Activity Detection
 */
async function demoUnusualActivity() {
  console.log('\n' + '='.repeat(80));
  console.log('🚨 SCENARIO 5: UNUSUAL ACTIVITY DETECTION');
  console.log('='.repeat(80));
  
  const workflow = createHITLWorkflow('user-123', CAUTIOUS_USER_CONFIG);
  
  console.log('\n🔍 Simulating unusual pattern detection...');
  console.log('   Historical average: $10K per transaction');
  console.log('   Current request: $250K (25x above normal)');
  console.log('   Frequency: 5th transaction in 24 hours (unusual)');
  
  const approvalId = await workflow.requestApproval(
    ActionType.WITHDRAW,
    'Withdraw $250K to external address',
    {
      amount: '250000',
      recipient: '0xUnknownAddress...',
      frequency: 'high'
    },
    {
      reasoning: 'Large withdrawal request',
      risks: [
        '🚨 UNUSUAL: Amount 25x above historical average',
        '🚨 UNUSUAL: 5th transaction in 24 hours',
        '⚠️  WARNING: Recipient address not previously used',
        'HIGH: Pattern matches potential compromise'
      ],
      benefits: [
        'Access to funds when needed'
      ],
      alternatives: [
        'Verify this is not unauthorized access',
        'Contact DAO security team',
        'Implement 2FA before proceeding',
        'Split into smaller transactions'
      ]
    }
  );
  
  console.log(`\n🚨 SECURITY ALERT - Approval required: ${approvalId}`);
  console.log('⚠️  Unusual pattern detected - extra verification recommended');
  console.log('💡 If you did not initiate this action, REJECT immediately');
}

/**
 * Run all demo scenarios
 */
export async function runFullHITLDemo() {
  console.log('\n' + '█'.repeat(80));
  console.log(' '.repeat(20) + 'HUMAN-IN-THE-LOOP (HITL) DEMO');
  console.log(' '.repeat(15) + 'DAO Governance Safety & Control System');
  console.log('█'.repeat(80));
  
  try {
    await demoRoutineVote();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await demoTreasuryAllocation();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await demoDelegationDecision();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await demoProtocolUpgrade();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await demoUnusualActivity();
    
    // Summary
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('\n' + '█'.repeat(80));
    console.log(' '.repeat(30) + 'DEMO COMPLETE');
    console.log('█'.repeat(80));
    console.log('\n✅ Key HITL Features Demonstrated:');
    console.log('   • Multi-level approval system (Auto/Review/Manual)');
    console.log('   • Comprehensive safety checks');
    console.log('   • Risk-based approval requirements');
    console.log('   • Parameter verification');
    console.log('   • Unusual pattern detection');
    console.log('   • Multiple confirmation levels');
    console.log('   • Clear risk communication');
    console.log('   • Alternative suggestions');
    console.log('\n🎯 Value Delivered:');
    console.log('   • Users maintain full control');
    console.log('   • AI provides intelligent assistance');
    console.log('   • Safety checks prevent mistakes');
    console.log('   • Risk-appropriate oversight');
    console.log('   • Transparent decision-making');
    console.log('\n🏆 Hackathon Advantages:');
    console.log('   • Advanced HITL implementation');
    console.log('   • Production-ready safety systems');
    console.log('   • Real-world risk management');
    console.log('   • User-centric design');
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ Demo error:', error);
    throw error;
  }
}

/**
 * Run individual scenario
 */
export async function runScenario(scenarioNumber: number) {
  const scenarios = [
    demoRoutineVote,
    demoTreasuryAllocation,
    demoDelegationDecision,
    demoProtocolUpgrade,
    demoUnusualActivity
  ];
  
  if (scenarioNumber < 1 || scenarioNumber > scenarios.length) {
    throw new Error(`Invalid scenario number. Choose 1-${scenarios.length}`);
  }
  
  await scenarios[scenarioNumber - 1]();
}

// Run demo if executed directly
if (require.main === module) {
  runFullHITLDemo().catch(console.error);
}

