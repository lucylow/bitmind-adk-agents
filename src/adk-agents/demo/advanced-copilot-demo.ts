/**
 * Advanced Co-pilot Demo
 * Comprehensive demonstration of all co-pilot features and capabilities
 */

import { coPilotManager, askCoPilot } from '../copilot/enhanced-copilot';
import { smartSummarizer, summarizeProposal } from '../features/smart-summarizer';
import { personalizationEngine, getPersonalizedGuidance } from '../features/personalization-engine';
import { governanceAlertSystem, setupUserMonitoring } from '../features/governance-alerts';
import { crossDAOAnalyst, compareDAOs } from '../features/cross-dao-analytics';
import { delegationAdvisor, analyzeDelegate } from '../features/delegation-advisor';

// Demo data
const DEMO_PROPOSAL = {
  id: 'prop-123',
  title: 'Treasury Diversification Strategy V2',
  category: 'treasury',
  description: 'Proposal to diversify 30% of treasury into stablecoins and ETH',
  requestedAmount: 15000000,
  treasurySize: 50000000,
  riskScore: 0.35,
  complexity: 'medium',
  votingDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
  lengthMinutes: 15
};

const DEMO_USER_BEGINNER = {
  userId: 'beginner-001',
  expertiseLevel: 'beginner',
  votingPower: 5000,
  votingHistory: []
};

const DEMO_USER_EXPERT = {
  userId: 'expert-001',
  expertiseLevel: 'expert',
  votingPower: 250000,
  votingHistory: Array(50).fill(null).map((_, i) => ({
    proposalId: `prop-${i}`,
    vote: 'FOR',
    confidence: 0.8,
    category: 'treasury'
  }))
};

/**
 * Scenario 1: New User Onboarding
 */
export async function demoNewUserOnboarding() {
  console.log('\n🆕 === SCENARIO 1: NEW USER ONBOARDING ===\n');
  
  const response = await askCoPilot(
    `I'm new to DAOs and just joined Uniswap governance. 
     There's a proposal about "fee mechanism changes" - can you explain what this means in simple terms?
     Also, how do I decide if I should vote or delegate?`,
    DEMO_USER_BEGINNER.userId,
    {
      expertiseLevel: 'beginner',
      mode: 'learning'
    }
  );
  
  console.log('📝 Co-pilot Response:');
  console.log('Mode:', response.mode);
  console.log('Response:', response.primaryResponse);
  console.log('\n💡 Key Insights:');
  response.insights.forEach(insight => console.log('  -', insight));
  console.log('\n✅ Recommendations:');
  response.recommendations.forEach(rec => console.log('  -', rec));
  console.log('\n📋 Next Steps:');
  response.nextSteps.forEach(step => console.log('  -', step));
  
  return response;
}

/**
 * Scenario 2: Time-Sensitive Decision
 */
export async function demoTimeSensitiveDecision() {
  console.log('\n⏰ === SCENARIO 2: TIME-SENSITIVE DECISION ===\n');
  
  const urgentProposal = {
    ...DEMO_PROPOSAL,
    votingDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
  };
  
  const response = await askCoPilot(
    `Voting ends in 2 hours on Proposal #123 about treasury diversification. 
     I have 10 minutes to decide. Give me the key points and your recommendation.
     I generally care about treasury safety and long-term sustainability.`,
    DEMO_USER_EXPERT.userId,
    {
      timeConstraint: 10,
      mode: 'quick',
      currentProposal: urgentProposal,
      userProfile: DEMO_USER_EXPERT
    }
  );
  
  console.log('⚡ Quick Analysis:');
  console.log('Mode:', response.mode);
  console.log('Response:', response.primaryResponse);
  console.log('\n🎯 Immediate Recommendations:');
  response.recommendations.forEach(rec => console.log('  -', rec));
  console.log('\n⏱️  Time Estimate:', response.metadata.routing?.timeEstimate, 'minutes');
  
  return response;
}

/**
 * Scenario 3: Strategic Planning
 */
export async function demoStrategicPlanning() {
  console.log('\n🎯 === SCENARIO 3: STRATEGIC PLANNING ===\n');
  
  const response = await coPilotManager.handleQuery(
    `I want to develop a consistent voting strategy for the next quarter.
     I'm interested in DeFi protocols and infrastructure projects.
     How should I approach delegation? What patterns should I look for in proposals?`,
    {
      userId: DEMO_USER_EXPERT.userId,
      mode: 'strategy',
      userProfile: DEMO_USER_EXPERT
    }
  );
  
  console.log('📊 Strategy Guidance:');
  console.log('Response:', response.primaryResponse);
  console.log('\n🔍 Strategic Insights:');
  response.insights.forEach(insight => console.log('  -', insight));
  console.log('\n🎲 Strategic Recommendations:');
  response.recommendations.forEach(rec => console.log('  -', rec));
  
  return response;
}

/**
 * Scenario 4: Cross-DAO Learning
 */
export async function demoCrossDAOLearning() {
  console.log('\n🌐 === SCENARIO 4: CROSS-DAO LEARNING ===\n');
  
  const response = await coPilotManager.compareWithOtherDAOs(
    'Treasury diversification with stablecoins and ETH allocation',
    'uniswap'
  );
  
  console.log('🔄 Cross-DAO Analysis:');
  console.log('Content:', response.content.substring(0, 400) + '...');
  console.log('\n📈 Comparative Insights:');
  console.log('  - Analyzed multiple DAOs with similar proposals');
  console.log('  - Identified best practices and common pitfalls');
  console.log('  - Generated context-specific recommendations');
  
  return response;
}

/**
 * Scenario 5: Alert System Demo
 */
export async function demoAlertSystem() {
  console.log('\n🔔 === SCENARIO 5: ALERT SYSTEM DEMO ===\n');
  
  await coPilotManager.setupMonitoring(
    DEMO_USER_EXPERT.userId,
    ['treasury', 'defi', 'infrastructure'],
    {
      alertFrequency: 'daily',
      channels: ['in-app', 'discord'],
      minPriority: 'medium'
    }
  );
  
  console.log('✅ Monitoring Setup Complete:');
  console.log('  - Interests: treasury, defi, infrastructure');
  console.log('  - Channels: in-app, discord');
  console.log('  - Frequency: daily digests');
  console.log('  - Priority: medium and above');
  console.log('\n🎯 What You\'ll Receive:');
  console.log('  - New proposals matching your interests');
  console.log('  - Voting deadline reminders');
  console.log('  - Governance trend alerts');
  console.log('  - Delegate performance updates');
}

/**
 * Scenario 6: Personalized Recommendation
 */
export async function demoPersonalizedRecommendation() {
  console.log('\n🎨 === SCENARIO 6: PERSONALIZED RECOMMENDATION ===\n');
  
  const response = await getPersonalizedGuidance(
    DEMO_USER_EXPERT.userId,
    DEMO_PROPOSAL,
    'quick'
  );
  
  console.log('👤 Personalized Analysis:');
  console.log('Content:', response.content.substring(0, 400) + '...');
  console.log('\n📊 Based On:');
  console.log('  - Your 50 previous votes in treasury category');
  console.log('  - 80% consistency in supporting treasury proposals');
  console.log('  - Moderate risk tolerance profile');
  console.log('  - High engagement level');
  
  return response;
}

/**
 * Scenario 7: Delegation Decision Support
 */
export async function demoDelegationSupport() {
  console.log('\n🤝 === SCENARIO 7: DELEGATION DECISION SUPPORT ===\n');
  
  const advice = await coPilotManager.getDelegationAdvice(
    DEMO_USER_BEGINNER.userId,
    DEMO_PROPOSAL.id,
    {
      votingPower: DEMO_USER_BEGINNER.votingPower,
      timeAvailable: 5,
      expertiseLevel: 'beginner'
    }
  );
  
  console.log('🔍 Delegation Analysis:');
  console.log('Content:', advice.content.substring(0, 400) + '...');
  console.log('\n💡 Recommendation:');
  console.log('  - Consider delegation for this proposal');
  console.log('  - Complexity level exceeds current expertise');
  console.log('  - Time constraint makes thorough analysis difficult');
  console.log('\n👥 Top Delegate Suggestions:');
  console.log('  1. DeFi Expert DAO - 95% participation, treasury specialization');
  console.log('  2. Protocol Architect - 91% participation, technical expertise');
  console.log('  3. Community Builder - 87% participation, balanced approach');
  
  return advice;
}

/**
 * Scenario 8: Learning Progress Tracking
 */
export async function demoLearningProgress() {
  console.log('\n📈 === SCENARIO 8: LEARNING PROGRESS TRACKING ===\n');
  
  const progress = await coPilotManager.getLearningProgress(DEMO_USER_EXPERT.userId);
  
  console.log('🎓 Your Governance Journey:');
  console.log('Content:', progress.content.substring(0, 400) + '...');
  console.log('\n📊 Key Metrics:');
  console.log('  - Total Votes: 50');
  console.log('  - Average Confidence: 80%');
  console.log('  - Consistency Score: 85%');
  console.log('  - Expertise Level: Expert → Technical (75% progress)');
  console.log('\n🌟 Achievements:');
  console.log('  ✓ Participated in 50+ governance decisions');
  console.log('  ✓ Maintained 80%+ voting consistency');
  console.log('  ✓ Active in multiple proposal categories');
  console.log('  ✓ High community engagement');
  
  return progress;
}

/**
 * Scenario 9: Comparative Delegate Analysis
 */
export async function demoCompareDelegates() {
  console.log('\n⚖️  === SCENARIO 9: COMPARATIVE DELEGATE ANALYSIS ===\n');
  
  console.log('Comparing 3 delegates:\n');
  
  const delegates = [
    { address: 'SP2X001...ABC', name: 'DeFi Expert DAO' },
    { address: 'SP2X002...DEF', name: 'Community Builder' },
    { address: 'SP2X003...GHI', name: 'Protocol Architect' }
  ];
  
  for (const delegate of delegates) {
    const analysis = await analyzeDelegate(delegate.address);
    console.log(`\n📊 ${delegate.name}:`);
    console.log('  Participation:', (analysis.participationRate * 100).toFixed(0) + '%');
    console.log('  Specializations:', analysis.specializationAreas.join(', '));
    console.log('  Communication:', (analysis.communicationQuality * 100).toFixed(0) + '%');
    console.log('  Recommendation:', analysis.recommendation);
  }
  
  console.log('\n💡 Summary:');
  console.log('  - All three delegates show strong performance');
  console.log('  - DeFi Expert DAO: Best for treasury proposals');
  console.log('  - Community Builder: Best for governance & grants');
  console.log('  - Protocol Architect: Best for technical proposals');
}

/**
 * Scenario 10: Multi-DAO Governance Comparison
 */
export async function demoMultiDAOComparison() {
  console.log('\n🔄 === SCENARIO 10: MULTI-DAO GOVERNANCE COMPARISON ===\n');
  
  const comparison = await compareDAOs(
    ['uniswap', 'compound', 'aave'],
    'participation'
  );
  
  console.log('📊 DAO Participation Comparison:');
  console.log('Content:', comparison.content.substring(0, 400) + '...');
  console.log('\n🏆 Key Findings:');
  console.log('  - Aave: 12% participation (highest)');
  console.log('  - Compound: 8% participation');
  console.log('  - Uniswap: 5% participation (lowest)');
  console.log('\n💡 Insights:');
  console.log('  - Hybrid governance models show better engagement');
  console.log('  - Active delegation programs increase participation');
  console.log('  - Regular community calls correlate with higher involvement');
  
  return comparison;
}

/**
 * Run all demo scenarios
 */
export async function runFullDemo() {
  console.log('🚀 ============================================');
  console.log('🚀  DAO GOVERNANCE CO-PILOT FULL DEMO');
  console.log('🚀 ============================================');
  console.log('Demonstrating advanced AI-powered governance assistance\n');
  
  try {
    await demoNewUserOnboarding();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await demoTimeSensitiveDecision();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await demoStrategicPlanning();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await demoCrossDAOLearning();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await demoAlertSystem();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await demoPersonalizedRecommendation();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await demoDelegationSupport();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await demoLearningProgress();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await demoCompareDelegates();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await demoMultiDAOComparison();
    
    console.log('\n\n✅ ============================================');
    console.log('✅  DEMO COMPLETE!');
    console.log('✅ ============================================');
    console.log('\nKey Features Demonstrated:');
    console.log('  ✓ Adaptive summarization for different expertise levels');
    console.log('  ✓ Time-sensitive quick decision support');
    console.log('  ✓ Strategic planning and long-term guidance');
    console.log('  ✓ Cross-DAO intelligence and best practices');
    console.log('  ✓ Proactive governance alerts');
    console.log('  ✓ Personalized recommendations');
    console.log('  ✓ Intelligent delegation advice');
    console.log('  ✓ Learning progress tracking');
    console.log('  ✓ Delegate performance comparison');
    console.log('  ✓ Multi-DAO governance analysis');
    console.log('\n🎉 This co-pilot transforms DAO governance from complex to accessible!');
    
  } catch (error) {
    console.error('❌ Demo error:', error);
    throw error;
  }
}

/**
 * Run individual scenario
 */
export async function runScenario(scenarioNumber: number) {
  const scenarios = [
    demoNewUserOnboarding,
    demoTimeSensitiveDecision,
    demoStrategicPlanning,
    demoCrossDAOLearning,
    demoAlertSystem,
    demoPersonalizedRecommendation,
    demoDelegationSupport,
    demoLearningProgress,
    demoCompareDelegates,
    demoMultiDAOComparison
  ];
  
  if (scenarioNumber < 1 || scenarioNumber > scenarios.length) {
    throw new Error(`Invalid scenario number. Choose 1-${scenarios.length}`);
  }
  
  await scenarios[scenarioNumber - 1]();
}

/**
 * Interactive demo mode
 */
export async function runInteractiveDemo() {
  console.log('🎮 INTERACTIVE DEMO MODE');
  console.log('========================\n');
  console.log('Available scenarios:');
  console.log('  1. New User Onboarding');
  console.log('  2. Time-Sensitive Decision');
  console.log('  3. Strategic Planning');
  console.log('  4. Cross-DAO Learning');
  console.log('  5. Alert System');
  console.log('  6. Personalized Recommendation');
  console.log('  7. Delegation Support');
  console.log('  8. Learning Progress');
  console.log('  9. Compare Delegates');
  console.log(' 10. Multi-DAO Comparison');
  console.log('\nRun: await runScenario(number)');
  console.log('Or run all: await runFullDemo()');
}

// Export for easy CLI usage
if (require.main === module) {
  runFullDemo().catch(console.error);
}

