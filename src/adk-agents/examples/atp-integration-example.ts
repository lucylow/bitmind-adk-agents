/**
 * ATP Integration Example
 * 
 * Complete example showing how to integrate Agent Tokenization Platform
 * with BitMind DAO Governance Co-pilot
 */

import {
  AgentWallet,
  PremiumAnalystATPAgent,
  ATPMarketplaceIntegration,
  AgentGovernance,
  GovernanceProposalTemplates,
  VoteType
} from '../atp';

/**
 * Example 1: Initialize ATP-enabled agent
 */
export async function example1_InitializeAgent() {
  console.log('\n=== Example 1: Initialize ATP Agent ===\n');
  
  // Create agent wallet
  const wallet = new AgentWallet({
    privateKey: process.env.AGENT_PRIVATE_KEY!,
    rpcUrl: process.env.FRAXTAL_RPC_URL!,
    tokenAddress: process.env.BITMIND_TOKEN_ADDRESS!,
    network: 'fraxtal'
  });
  
  console.log('Agent Wallet Address:', wallet.getAddress());
  
  // Get wallet status
  const status = await wallet.getStatus();
  console.log('\nAgent Status:', JSON.stringify(status, null, 2));
  
  // Create ATP-enabled agent
  const agent = new PremiumAnalystATPAgent(wallet);
  
  console.log('\n✅ Agent initialized successfully!');
  console.log('Payment Address:', agent.getPaymentAddress());
  
  return { wallet, agent };
}

/**
 * Example 2: User requests premium analysis (with payment)
 */
export async function example2_PremiumAnalysis() {
  console.log('\n=== Example 2: Premium Analysis Request ===\n');
  
  const { agent } = await example1_InitializeAgent();
  
  // Simulate user making payment first (in real scenario, user sends ETH to agent wallet)
  const mockPaymentTx = '0x1234567890abcdef...'; // User's payment transaction hash
  
  // User requests premium analysis
  const result = await agent.run(
    `Analyze proposal "Treasury Diversification" (ID: prop-2024-01) for Uniswap DAO at 0xUniswapGovernance.
     I've paid 0.1 ETH for premium analysis. Transaction hash: ${mockPaymentTx}`,
    {
      proposalId: 'prop-2024-01',
      daoAddress: '0xUniswapGovernance',
      userAddress: '0xUserAddress',
      paymentTxHash: mockPaymentTx
    }
  );
  
  console.log('\nAnalysis Result:', JSON.stringify(result, null, 2));
  console.log('\n✅ Premium analysis completed!');
  
  return result;
}

/**
 * Example 3: Check unlocked capabilities
 */
export async function example3_CheckCapabilities() {
  console.log('\n=== Example 3: Check Capabilities ===\n');
  
  const { wallet } = await example1_InitializeAgent();
  
  // Get all capabilities
  const capabilities = await wallet.getAllCapabilities();
  
  console.log('Current Capabilities:\n');
  capabilities.forEach(cap => {
    console.log(`${cap.unlocked ? '✅' : '🔒'} ${cap.name}`);
    console.log(`   Required Market Cap: ${cap.requiredMarketCap} tokens`);
    if (cap.unlocked && cap.unlockedAt > 0) {
      console.log(`   Unlocked: ${new Date(cap.unlockedAt * 1000).toISOString()}`);
    }
    console.log('');
  });
  
  return capabilities;
}

/**
 * Example 4: Agent deposits revenue to token holders
 */
export async function example4_DepositRevenue() {
  console.log('\n=== Example 4: Deposit Revenue ===\n');
  
  const { wallet } = await example1_InitializeAgent();
  
  // Agent earned 0.1 ETH from premium analysis
  // Shares 80% (0.08 ETH) with token holders
  const earnedAmount = 0.1;
  const feeConfig = await wallet.getFeeConfig();
  const revenueShare = (earnedAmount * feeConfig.revenueSharePercentage) / 10000;
  
  console.log(`Earned: ${earnedAmount} ETH`);
  console.log(`Revenue Share: ${feeConfig.revenueSharePercentage / 100}%`);
  console.log(`Depositing: ${revenueShare} ETH to token holders`);
  
  try {
    const receipt = await wallet.depositRevenue(revenueShare.toString());
    console.log('\n✅ Revenue deposited successfully!');
    console.log('Transaction:', receipt.hash);
  } catch (error) {
    console.error('❌ Revenue deposit failed:', error);
  }
}

/**
 * Example 5: Register agent on ATP marketplace
 */
export async function example5_RegisterMarketplace() {
  console.log('\n=== Example 5: Register on ATP Marketplace ===\n');
  
  const { wallet } = await example1_InitializeAgent();
  const marketplace = new ATPMarketplaceIntegration(process.env.ATP_API_KEY);
  
  const metadata = {
    name: 'BitMind DAO Governance Co-pilot',
    symbol: 'BITMIND',
    description: 'AI-powered DAO governance analysis with multi-agent collaboration',
    tokenAddress: process.env.BITMIND_TOKEN_ADDRESS!,
    agentWalletAddress: wallet.getAddress(),
    capabilities: [
      'Proposal Analysis',
      'Financial Impact Assessment',
      'Security Risk Evaluation',
      'Treasury Monitoring',
      'Voting Recommendations'
    ],
    pricing: {
      freeTier: ['Basic proposal summary', 'Vote distribution'],
      premiumTier: {
        features: ['Deep analysis', 'Cross-DAO comparison', 'AI predictions'],
        price: '0.1 ETH'
      }
    },
    category: 'DAO Governance',
    tags: ['governance', 'dao', 'defi', 'analysis']
  };
  
  try {
    const result = await marketplace.registerAgent(metadata);
    console.log('✅ Agent registered on ATP marketplace!');
    console.log('Agent ID:', result.agentId);
  } catch (error) {
    console.log('ℹ️  Marketplace registration:', error);
  }
}

/**
 * Example 6: Update marketplace metrics
 */
export async function example6_UpdateMetrics() {
  console.log('\n=== Example 6: Update Marketplace Metrics ===\n');
  
  const marketplace = new ATPMarketplaceIntegration(process.env.ATP_API_KEY);
  
  const metrics = {
    totalRevenue: '12.5',
    activeUsers: 47,
    analysisCount: 234,
    avgResponseTime: 2.1,
    successRate: 0.95,
    uptime: 0.998
  };
  
  try {
    await marketplace.updateAgentMetrics(
      process.env.BITMIND_TOKEN_ADDRESS!,
      metrics
    );
    console.log('✅ Metrics updated successfully!');
    console.log('Metrics:', JSON.stringify(metrics, null, 2));
  } catch (error) {
    console.log('ℹ️  Metrics update:', error);
  }
}

/**
 * Example 7: Token holder governance
 */
export async function example7_Governance() {
  console.log('\n=== Example 7: Token Holder Governance ===\n');
  
  const governance = new AgentGovernance(
    process.env.GOVERNANCE_CONTRACT_ADDRESS!,
    process.env.FRAXTAL_RPC_URL!,
    process.env.AGENT_PRIVATE_KEY // Token holder's key
  );
  
  // Get governance parameters
  const params = await governance.getGovernanceParams();
  console.log('Governance Parameters:');
  console.log('  Voting Period:', params.votingPeriod, 'blocks');
  console.log('  Voting Delay:', params.votingDelay, 'blocks');
  console.log('  Proposal Threshold:', params.proposalThreshold, 'tokens');
  
  // Create proposal to update pricing
  const proposal = GovernanceProposalTemplates.updatePricing(
    process.env.BITMIND_TOKEN_ADDRESS!,
    '0.02', // basic fee
    '0.15', // premium fee
    '0.6'   // custom fee
  );
  
  try {
    console.log('\nCreating proposal...');
    const { proposalId } = await governance.createProposal(
      proposal.description,
      proposal.actions
    );
    
    console.log('✅ Proposal created!');
    console.log('Proposal ID:', proposalId);
    
    // Vote on proposal
    console.log('\nVoting on proposal...');
    await governance.vote(proposalId, VoteType.For, 'Agree with updated pricing');
    
    console.log('✅ Vote cast successfully!');
    
  } catch (error) {
    console.error('❌ Governance action failed:', error);
  }
}

/**
 * Example 8: Monitor agent events
 */
export async function example8_MonitorEvents() {
  console.log('\n=== Example 8: Monitor Agent Events ===\n');
  
  const { wallet } = await example1_InitializeAgent();
  
  console.log('Setting up event listeners...\n');
  
  // Listen for capability unlocks
  wallet.onCapabilityUnlocked((name, marketCap, timestamp) => {
    console.log(`🎉 Capability Unlocked: ${name}`);
    console.log(`   Market Cap: ${marketCap}`);
    console.log(`   Time: ${new Date(timestamp * 1000).toISOString()}\n`);
  });
  
  // Listen for revenue deposits
  wallet.onRevenueDeposited((amount, revenuePerToken) => {
    console.log(`💰 Revenue Deposited: ${amount} ETH`);
    console.log(`   Revenue per Token: ${revenuePerToken}\n`);
  });
  
  console.log('✅ Event listeners active!');
  console.log('Listening for agent events...\n');
  
  // Keep process running to receive events
  // In production, this would be part of your main agent loop
}

/**
 * Example 9: Complete workflow
 */
export async function example9_CompleteWorkflow() {
  console.log('\n=== Example 9: Complete ATP Workflow ===\n');
  
  try {
    // Step 1: Initialize agent
    console.log('Step 1: Initialize agent...');
    const { wallet, agent } = await example1_InitializeAgent();
    
    // Step 2: Register on marketplace
    console.log('\nStep 2: Register on ATP marketplace...');
    await example5_RegisterMarketplace();
    
    // Step 3: Check capabilities
    console.log('\nStep 3: Check current capabilities...');
    await example3_CheckCapabilities();
    
    // Step 4: Provide premium service
    console.log('\nStep 4: Process premium analysis request...');
    const analysisResult = await example2_PremiumAnalysis();
    
    // Step 5: Deposit revenue
    console.log('\nStep 5: Deposit revenue to token holders...');
    await example4_DepositRevenue();
    
    // Step 6: Update metrics
    console.log('\nStep 6: Update marketplace metrics...');
    await example6_UpdateMetrics();
    
    console.log('\n✅ Complete workflow executed successfully!');
    
  } catch (error) {
    console.error('\n❌ Workflow error:', error);
  }
}

/**
 * Main function - runs all examples
 */
async function main() {
  console.log('==============================================');
  console.log('   BitMind ATP Integration Examples');
  console.log('==============================================');
  
  // Check environment variables
  const requiredEnvVars = [
    'AGENT_PRIVATE_KEY',
    'FRAXTAL_RPC_URL',
    'BITMIND_TOKEN_ADDRESS'
  ];
  
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.error('\nPlease check env.atp.template and configure your environment.\n');
    process.exit(1);
  }
  
  // Run examples
  const examples = [
    { name: 'Initialize Agent', fn: example1_InitializeAgent },
    { name: 'Premium Analysis', fn: example2_PremiumAnalysis },
    { name: 'Check Capabilities', fn: example3_CheckCapabilities },
    { name: 'Deposit Revenue', fn: example4_DepositRevenue },
    { name: 'Register Marketplace', fn: example5_RegisterMarketplace },
    { name: 'Update Metrics', fn: example6_UpdateMetrics },
    { name: 'Governance', fn: example7_Governance },
  ];
  
  // Run complete workflow
  await example9_CompleteWorkflow();
  
  console.log('\n==============================================');
  console.log('   All Examples Completed!');
  console.log('==============================================\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

// Export examples for use in other modules
export {
  example1_InitializeAgent,
  example2_PremiumAnalysis,
  example3_CheckCapabilities,
  example4_DepositRevenue,
  example5_RegisterMarketplace,
  example6_UpdateMetrics,
  example7_Governance,
  example8_MonitorEvents,
  example9_CompleteWorkflow
};

