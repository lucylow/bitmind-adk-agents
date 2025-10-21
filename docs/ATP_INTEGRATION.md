# ATP Integration Guide

## Agent Tokenization Platform (ATP) Integration for BitMind

This guide explains how BitMind DAO Governance Co-pilot integrates with IQ AI's Agent Tokenization Platform (ATP), enabling tokenization, revenue sharing, and decentralized governance.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Smart Contracts](#smart-contracts)
5. [Agent Components](#agent-components)
6. [Revenue Model](#revenue-model)
7. [Governance](#governance)
8. [Deployment](#deployment)
9. [Usage Examples](#usage-examples)
10. [Hackathon Benefits](#hackathon-benefits)

---

## Overview

### What is ATP?

The Agent Tokenization Platform (ATP) by IQ AI enables AI agents to become tokenized assets that can:

- **Own crypto wallets** and manage assets autonomously
- **Earn revenue** from providing services
- **Distribute profits** to token holders
- **Unlock capabilities** based on market cap milestones
- **Participate in DeFi** and on-chain governance

### Why ATP for BitMind?

BitMind's DAO Governance Co-pilot becomes more powerful with ATP integration:

- ✅ **Sustainable Revenue Model**: Earn from premium governance analysis
- ✅ **Community Ownership**: Token holders govern the agent's future
- ✅ **Progressive Enhancement**: Features unlock as market cap grows
- ✅ **DeFAI Innovation**: Combine AI intelligence with decentralized finance
- ✅ **Hackathon Advantage**: Demonstrates production-ready Web3 integration

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     BitMind ATP System                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐         ┌──────────────────┐          │
│  │ User Requests  │────────▶│  Premium Agent   │          │
│  │  + Payment     │         │   (ATP-Enabled)  │          │
│  └────────────────┘         └─────────┬────────┘          │
│                                       │                     │
│                                       ▼                     │
│                             ┌──────────────────┐           │
│                             │  Agent Wallet    │           │
│                             │  (Autonomous)    │           │
│                             └─────────┬────────┘           │
│                                       │                     │
│                          Revenue      │  Capabilities       │
│                          Deposits     │  Check              │
│                                       │                     │
│                                       ▼                     │
│                       ┌───────────────────────────┐        │
│                       │  BitMindAgentToken.sol    │        │
│                       │  - Revenue Distribution   │        │
│                       │  - Capability Unlocking   │        │
│                       │  - Token Governance       │        │
│                       └───────────┬───────────────┘        │
│                                   │                         │
│                                   ▼                         │
│                       ┌───────────────────────┐            │
│                       │   Token Holders       │            │
│                       │   - Claim Revenue     │            │
│                       │   - Vote on Changes   │            │
│                       └───────────────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **BitMindAgentToken.sol**: ERC20 token with revenue distribution and capability unlocking
2. **AgentWallet**: TypeScript class managing agent's crypto assets and transactions
3. **PremiumAnalystATPAgent**: ATP-enabled agent providing paid governance analysis
4. **ATPMarketplaceIntegration**: Integration with ATP marketplace for discovery
5. **AgentGovernance**: Token-based governance for agent decisions

---

## Getting Started

### Prerequisites

```bash
# Node.js 18+ and npm/yarn
node --version  # v18+

# Install dependencies
npm install

# Install ethers for blockchain interaction
npm install ethers@^6.13.0
```

### Environment Setup

1. Copy the ATP environment template:

```bash
cp env.atp.template .env.atp
```

2. Configure your environment variables:

```bash
# Required
FRAXTAL_RPC_URL=https://rpc.frax.com
BITMIND_TOKEN_ADDRESS=0x...  # After deployment
AGENT_PRIVATE_KEY=0x...       # Agent wallet private key
IQ_TOKEN_ADDRESS=0x...        # IQ token on Fraxtal

# Optional
ATP_API_KEY=your_api_key
GOVERNANCE_CONTRACT_ADDRESS=0x...
```

3. Source the environment:

```bash
source .env.atp
# or add to your main .env file
```

---

## Smart Contracts

### BitMindAgentToken.sol

Location: `contracts/atp/BitMindAgentToken.sol`

**Features:**
- ERC20 token with OpenZeppelin standards
- Automatic revenue distribution to holders
- Market cap-based capability unlocking
- Agent wallet management

**Capability Milestones:**

| Market Cap | Capability | Description |
|------------|-----------|-------------|
| $10k | Premium Analysis | Deep financial and security analysis |
| $50k | Multi-DAO Support | Cross-DAO comparison and insights |
| $100k | Delegation Optimization | Optimal delegation strategies |
| $500k | Cross-Chain Governance | Multi-chain governance analysis |
| $1M | AI-Powered Predictions | Proposal outcome predictions |

### Deployment

See `contracts/atp/README.md` for detailed deployment instructions.

Quick deploy:

```bash
# Install Hardhat
npm install --save-dev hardhat @nomiclabs/hardhat-ethers

# Configure Fraxtal network in hardhat.config.js
# Then deploy
npx hardhat run scripts/deploy-atp.js --network fraxtal
```

---

## Agent Components

### 1. Agent Wallet (`src/adk-agents/atp/agent-wallet.ts`)

Manages the agent's autonomous crypto operations:

```typescript
import { AgentWallet } from './adk-agents/atp/agent-wallet';

const wallet = new AgentWallet({
  privateKey: process.env.AGENT_PRIVATE_KEY!,
  rpcUrl: process.env.FRAXTAL_RPC_URL!,
  tokenAddress: process.env.BITMIND_TOKEN_ADDRESS!
});

// Get wallet address
const address = wallet.getAddress();

// Check capabilities
const hasPremium = await wallet.hasCapability('Premium Analysis');

// Deposit revenue
await wallet.depositRevenue('0.08'); // 0.08 ETH
```

### 2. Premium Analyst Agent (`src/adk-agents/agents/premium-analyst-atp.agent.ts`)

ATP-enabled agent providing premium services:

```typescript
import { PremiumAnalystATPAgent } from './adk-agents/agents/premium-analyst-atp.agent';

const agent = new PremiumAnalystATPAgent(wallet);

// User requests premium analysis (with payment)
const result = await agent.run(
  'Analyze proposal prop-123 for UniswapDAO. Payment tx: 0x...',
  {
    proposalId: 'prop-123',
    daoAddress: '0xUniswap',
    userAddress: '0xUser',
    paymentTxHash: '0x...'
  }
);
```

### 3. Marketplace Integration (`src/adk-agents/atp/marketplace-integration.ts`)

Register and manage agent on ATP marketplace:

```typescript
import { ATPMarketplaceIntegration } from './adk-agents/atp/marketplace-integration';

const marketplace = new ATPMarketplaceIntegration(process.env.ATP_API_KEY);

// Register agent
await marketplace.registerAgent({
  name: 'BitMind DAO Governance Co-pilot',
  symbol: 'BITMIND',
  description: 'AI-powered DAO governance analysis',
  tokenAddress: process.env.BITMIND_TOKEN_ADDRESS!,
  capabilities: [...],
  pricing: {...}
});

// Update metrics
await marketplace.updateAgentMetrics(tokenAddress, {
  totalRevenue: '12.5',
  activeUsers: 47,
  analysisCount: 234
});
```

### 4. Agent Governance (`src/adk-agents/atp/agent-governance.ts`)

Token holders govern agent decisions:

```typescript
import { AgentGovernance, GovernanceProposalTemplates, VoteType } from './adk-agents/atp/agent-governance';

const governance = new AgentGovernance(
  governanceAddress,
  rpcUrl,
  privateKey
);

// Create proposal to update pricing
const proposal = GovernanceProposalTemplates.updatePricing(
  tokenAddress,
  '0.02', // basic
  '0.15', // premium
  '0.6'   // custom
);

const { proposalId } = await governance.createProposal(
  proposal.description,
  proposal.actions
);

// Vote
await governance.vote(proposalId, VoteType.For, 'Agree with new pricing');
```

---

## Revenue Model

### Fee Structure

| Service | Price | Revenue Share |
|---------|-------|---------------|
| Basic Analysis | 0.01 ETH | N/A (Free tier) |
| Premium Analysis | 0.1 ETH | 80% to holders |
| Custom Strategy | 0.5 ETH | 80% to holders |

### Revenue Flow

1. **User Pays**: User sends payment to agent wallet
2. **Agent Verifies**: Agent verifies payment on-chain
3. **Service Provided**: Agent performs premium analysis
4. **Revenue Deposit**: Agent deposits 80% to token contract
5. **Holders Claim**: Token holders claim their share

```typescript
// Agent earns 0.1 ETH from premium analysis
const earned = 0.1;
const revenueShare = earned * 0.8; // 80%

// Deposit to token holders
await wallet.depositRevenue(revenueShare.toString());

// Token holders claim
// (In token contract or via UI)
await tokenContract.claimRevenue();
```

### Revenue Tracking

```typescript
// Get total revenue
const totalRevenue = await wallet.getTotalRevenue();

// Get pending claimable for holder
const pending = await wallet.getPendingRevenue(holderAddress);

console.log(`Total Revenue: ${totalRevenue} ETH`);
console.log(`Pending for holder: ${pending} ETH`);
```

---

## Governance

### Token-Based Voting

Token holders vote on:
- Agent pricing changes
- Revenue share adjustments
- Feature prioritization
- Agent wallet updates
- Capability unlocking thresholds

### Proposal Creation

```typescript
// Template proposals
const pricingProposal = GovernanceProposalTemplates.updatePricing(
  tokenAddress, '0.02', '0.15', '0.6'
);

const walletProposal = GovernanceProposalTemplates.updateAgentWallet(
  tokenAddress, newWalletAddress
);

const revenueProposal = GovernanceProposalTemplates.updateRevenueShare(
  tokenAddress, 85 // 85% to holders
);

// Create on-chain
const { proposalId } = await governance.createProposal(
  pricingProposal.description,
  pricingProposal.actions
);
```

### Voting

```typescript
// Vote on proposal
await governance.vote(
  proposalId,
  VoteType.For,
  'Pricing aligns with market standards'
);

// Check proposal status
const proposal = await governance.getProposal(proposalId);
console.log(`For: ${proposal.forVotes}, Against: ${proposal.againstVotes}`);

// Execute if passed
if (proposal.state === ProposalState.Succeeded) {
  await governance.executeProposal(proposalId);
}
```

---

## Deployment

### Step-by-Step Deployment

#### 1. Deploy Smart Contracts

```bash
# Deploy BitMindAgentToken to Fraxtal
cd contracts/atp
npx hardhat run scripts/deploy-atp.js --network fraxtal

# Note the deployed address
# Update BITMIND_TOKEN_ADDRESS in .env.atp
```

#### 2. Configure Agent Wallet

```bash
# Generate new wallet or use existing
# Update AGENT_PRIVATE_KEY in .env.atp
# Fund wallet with ETH for gas
```

#### 3. Register on ATP Marketplace

```typescript
// Run registration script
npm run atp:register

// Or manually:
import { registerBitMindAgent } from './adk-agents/atp/marketplace-integration';
await registerBitMindAgent(agentWalletAddress);
```

#### 4. Start Agent

```bash
# Start ATP-enabled agent
npm run atp:agent

# Or run complete example
npm run atp:example
```

### Verification Checklist

- [ ] Smart contract deployed and verified on Fraxscan
- [ ] Agent wallet funded with gas (0.1 ETH minimum)
- [ ] Environment variables configured
- [ ] Agent registered on ATP marketplace
- [ ] Test payment and premium analysis working
- [ ] Revenue distribution verified
- [ ] Governance proposals tested

---

## Usage Examples

See `src/adk-agents/examples/atp-integration-example.ts` for complete examples.

### Quick Start

```typescript
import { example9_CompleteWorkflow } from './adk-agents/examples/atp-integration-example';

// Run complete ATP workflow
await example9_CompleteWorkflow();
```

### Individual Examples

```bash
# Initialize agent
npm run atp:example -- example1

# Premium analysis
npm run atp:example -- example2

# Check capabilities
npm run atp:example -- example3

# Complete workflow
npm run atp:example -- example9
```

---

## Hackathon Benefits

### Track 3: Advanced Web3 Integration

✅ **Smart Contract Integration**: Custom ERC20 with revenue distribution  
✅ **DeFi Operations**: Autonomous agent earning and distributing crypto  
✅ **On-Chain Governance**: Token-based decision making  
✅ **Multi-Chain Ready**: Fraxtal primary, expandable to other chains

### Innovation Points

1. **First DAO Governance Agent with ATP**: Novel combination of governance analysis and tokenization
2. **Progressive Feature Unlocking**: Market cap-based capability system
3. **Sustainable Economics**: Clear revenue model with community benefit
4. **Production Ready**: Complete implementation with deployment guides

### Demo Script

```typescript
// 1. Show agent wallet and capabilities
const status = await agent.getStatus();
console.log('Agent Capabilities:', status.capabilities);

// 2. Demonstrate premium analysis with payment
const result = await agent.run('Analyze proposal X with payment...');
console.log('Analysis Result:', result);

// 3. Show revenue distribution
const totalRevenue = await wallet.getTotalRevenue();
console.log('Total Revenue Shared:', totalRevenue);

// 4. Demonstrate governance
const proposal = await governance.createProposal(...);
console.log('Community can vote on agent changes');
```

---

## Resources

### Official ATP Documentation
- **Website**: https://iqai.com
- **Blog**: https://blog.iqai.com/what-is-agent-tokenization-platform/
- **Wiki**: https://iq.wiki/wiki/agent-tokenization-platform-atp
- **ADK-TS Docs**: https://adk.iqai.com/docs

### BitMind Documentation
- **Main README**: ../README.md
- **ADK Integration**: ../docs/ADK_AGENTS_QUICKSTART.md
- **Smart Contracts**: ../contracts/atp/README.md
- **Examples**: ../src/adk-agents/examples/

### Support
- **GitHub Issues**: https://github.com/yourusername/bitmind-adk-agents/issues
- **Discord**: [Your Discord]
- **Email**: [Your Email]

---

## Troubleshooting

### Common Issues

**1. "Missing required environment variables"**
```bash
# Ensure .env.atp is sourced
source .env.atp
# Or add to main .env
```

**2. "Agent wallet has insufficient funds"**
```bash
# Fund agent wallet with ETH on Fraxtal
# Check balance
cast balance $AGENT_WALLET_ADDRESS --rpc-url $FRAXTAL_RPC_URL
```

**3. "Payment verification failed"**
- Ensure transaction is confirmed on-chain
- Verify transaction sent to correct agent wallet address
- Check amount is correct (0.1 ETH for premium)

**4. "Capability not unlocked"**
- Check token market cap: `await wallet.getTokenBalance()`
- Verify thresholds in smart contract
- May need to deposit more revenue to trigger unlock check

### Debug Mode

```bash
# Enable debug logging
export DEBUG=bitmind:*

# Run with verbose output
npm run atp:example -- --verbose
```

---

## Next Steps

1. **Deploy to Mainnet**: Deploy contracts to Fraxtal mainnet
2. **Launch Token**: Distribute initial token supply
3. **Marketing**: Promote on ATP marketplace
4. **Community**: Build token holder community
5. **Iterate**: Add features based on governance votes

---

## License

MIT License - See LICENSE file for details.

---

**Built with ❤️ for ADK-TS Agents Hackathon 2025**

