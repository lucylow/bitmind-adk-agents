# 🔗 Stacks Blockchain Integration Guide

## Overview

This guide covers the complete blockchain integration for your DAO Governance Co-pilot using **Stacks blockchain** and **smart contracts**.

## 📁 File Structure

```
src/adk-agents/blockchain/
├── stacks-wallet-connector.ts      # Wallet connection (Hiro, Xverse, etc.)
├── stacks-contract-caller.ts       # Smart contract interactions
└── BLOCKCHAIN_INTEGRATION_GUIDE.md # This guide

src/adk-agents/tools/
└── blockchain-integration-tools.ts  # ADK-TS tools for agents

contracts/
└── dao-governance.clar              # DAO governance smart contract

src/components/
└── DAOProposalCard.tsx             # React UI component
```

---

## 🔌 1. Wallet Connection

### Connect to User's Stacks Wallet

```typescript
import { walletConnector } from '@/adk-agents/blockchain/stacks-wallet-connector';

// Connect wallet
async function connect() {
  const connection = await walletConnector.connectWallet();
  console.log('Connected:', connection.address);
  // Output: Connected: SP2X...ABC123
}

// Check connection
const isConnected = walletConnector.isConnected();

// Get address
const address = walletConnector.getUserAddress();

// Disconnect
await walletConnector.disconnectWallet();
```

### Supported Wallets

- **Hiro Wallet** (Browser extension)
- **Xverse** (Browser + Mobile)
- **Leather** (formerly Hiro Web Wallet)

---

## 📜 2. Smart Contract Deployment

### Deploy the Smart Contract

```bash
# Using Clarinet
clarinet check contracts/dao-governance.clar
clarinet deploy --testnet

# Or using Hiro Platform
# Upload contract to: https://platform.hiro.so/
```

### Contract Functions

#### Read-Only Functions
- `get-proposal(uint)` - Get proposal details
- `get-voting-power-of(principal)` - Get voting power
- `has-voted(uint, principal)` - Check if voted
- `get-proposal-state(uint)` - Get proposal state
- `get-proposal-count()` - Get total proposals

#### Public Functions
- `propose(...)` - Create new proposal
- `cast-vote(uint, uint)` - Cast vote
- `cast-vote-with-reason(uint, uint, string)` - Cast vote with reason
- `execute(uint)` - Execute proposal
- `cancel(uint)` - Cancel proposal

---

## 🔧 3. Contract Interaction

### Initialize Contract Caller

```typescript
import { StacksContractCaller } from '@/adk-agents/blockchain/stacks-contract-caller';

const contract = new StacksContractCaller(
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Your contract address
  'dao-governance',                               // Contract name
  new StacksTestnet()                             // Network
);
```

### Cast a Vote

```typescript
const result = await contract.castVote({
  proposalId: 1,
  support: 'for', // 'for' | 'against' | 'abstain'
  reason: 'I support this proposal because...',
});

console.log('Transaction ID:', result.txId);
// Output: Transaction ID: 0xabc123...
```

### Create a Proposal

```typescript
const result = await contract.createProposal(
  'Treasury Allocation',
  'Allocate 100,000 STX for development',
  [
    {
      target: 'ST1X...TREASURY',
      functionName: 'transfer',
      functionArgs: ['100000', 'ST2X...RECIPIENT'],
    },
  ]
);

console.log('Proposal ID:', result.proposalId);
// Output: Proposal ID: 5
```

### Get Proposal Data

```typescript
const proposal = await contract.getProposal(1);
console.log(proposal);
/* Output:
{
  id: 1,
  title: 'Treasury Allocation for Development',
  proposer: 'SP2X...ABC',
  forVotes: 15000,
  againstVotes: 3000,
  abstainVotes: 500,
  executed: false
}
*/
```

---

## 🤖 4. ADK-TS Agent Integration

### Add Blockchain Tools to Your Agent

```typescript
import { AgentBuilder } from '@/adk-agents/core/agent-builder';
import { blockchainIntegrationTools } from '@/adk-agents/tools/blockchain-integration-tools';

const governanceAgent = AgentBuilder
  .create('governance-agent')
  .withName('GovernanceAgent')
  .withModel('gemini-2.5-flash')
  .withInstructions('You are a DAO governance assistant...')
  .withTools(blockchainIntegrationTools) // Add blockchain tools!
  .build();
```

### Available Blockchain Tools for Agents

| Tool Name | Description | Risk Level |
|-----------|-------------|------------|
| `connect_wallet` | Connect user's Stacks wallet | LOW |
| `get_wallet_connection` | Get current connection status | LOW |
| `disconnect_wallet` | Disconnect wallet | LOW |
| `cast_vote_on_chain` | Cast vote on proposal | **HIGH** |
| `create_proposal_on_chain` | Create new proposal | **HIGH** |
| `execute_proposal` | Execute passed proposal | **HIGH** |
| `get_proposal_on_chain` | Read proposal data | LOW |
| `get_voting_power_on_chain` | Get voting power | LOW |
| `check_has_voted` | Check vote status | LOW |

### Agent with Blockchain Capabilities

```typescript
// Agent can now:
// 1. Connect wallets
// 2. Read on-chain data
// 3. Execute transactions (with approval)

const response = await governanceAgent.run(
  'Connect my wallet and show my voting power for proposal 1',
  { userId: 'user123' }
);
```

---

## 🎨 5. React Frontend Integration

### Basic Proposal Card

```tsx
import { DAOProposalCard } from '@/components/DAOProposalCard';

function ProposalPage() {
  return (
    <div className="container mx-auto py-8">
      <DAOProposalCard 
        proposalId="1"
        daoAddress="SP2X...DAO"
      />
    </div>
  );
}
```

### Features Included

- ✅ AI-powered recommendation with confidence score
- ✅ One-click wallet connection
- ✅ Vote FOR / AGAINST / ABSTAIN buttons
- ✅ Real-time transaction tracking
- ✅ Risk factor display
- ✅ Alternative perspectives

---

## 🔐 6. Security Considerations

### HIGH Risk Operations

Operations that modify blockchain state require special handling:

```typescript
// These require user approval in production
- cast_vote_on_chain
- create_proposal_on_chain
- execute_proposal

// ADK-TS guardrails will:
1. Check confidence score (must be > 0.9 for auto-execution)
2. Require explicit user confirmation
3. Log all actions in audit trail
4. Display transaction preview before execution
```

### Implementation

```typescript
import { guardrailManager } from '@/adk-agents/guardrail-manager';

// Before HIGH risk operation
const check = guardrailManager.assertToolAllowed(
  'cast_vote_on_chain',
  {
    userConfirmed: true,
    confidence: 0.95,
  }
);

if (!check.passed) {
  // Request user approval
  await requestUserApproval(check);
}
```

---

## 📊 7. Complete Example: AI-Powered Voting

```typescript
import { createDAOCopilot } from '@/adk-agents/integration/dao-copilot-api';
import { daoGovernanceContract } from '@/adk-agents/blockchain/stacks-contract-caller';
import { walletConnector } from '@/adk-agents/blockchain/stacks-wallet-connector';

async function aiPoweredVote(proposalId: string) {
  // Step 1: Connect wallet
  const connection = await walletConnector.connectWallet();
  console.log('✅ Wallet connected:', connection.address);

  // Step 2: Initialize AI co-pilot
  const copilot = await createDAOCopilot({
    daoAddress: 'SP2X...DAO',
  });

  // Step 3: Get AI analysis
  const analysis = await copilot.analyzeProposal({
    proposalId,
    userAddress: connection.address,
    userPreferences: {
      riskTolerance: 'moderate',
      votingStyle: 'data-driven',
    },
  });

  console.log('📊 AI Recommendation:', analysis.votingRecommendation);
  console.log('🎯 Confidence:', analysis.explainability.confidence);

  // Step 4: Check if approval required
  if (analysis.approvalRequired) {
    console.log('⚠️  Human review required');
    return;
  }

  // Step 5: Cast vote on-chain
  const voteResult = await daoGovernanceContract.castVote({
    proposalId: parseInt(proposalId),
    support: analysis.votingRecommendation.recommendation.toLowerCase(),
    reason: `AI-powered vote (Confidence: ${analysis.explainability.confidence})`,
  });

  console.log('✅ Vote cast! TX:', voteResult.txId);

  // Step 6: Submit feedback for learning
  await copilot.submitVotingFeedback(connection.address, {
    proposalId,
    actualVote: analysis.votingRecommendation.recommendation,
    satisfactionScore: 0.9,
  });

  await copilot.shutdown();
}
```

---

## 🚀 8. Deployment Checklist

### Testnet Deployment

- [ ] Deploy smart contract to testnet
- [ ] Update contract address in `stacks-contract-caller.ts`
- [ ] Test wallet connection
- [ ] Test vote casting
- [ ] Test proposal creation
- [ ] Verify transactions on explorer

### Mainnet Deployment

- [ ] Audit smart contract
- [ ] Deploy to mainnet
- [ ] Update contract address to mainnet
- [ ] Switch network to `StacksMainnet()`
- [ ] Test with small amounts first
- [ ] Enable monitoring and alerts

---

## 📝 9. Smart Contract Parameters

### Adjust These Based on Your DAO

```clarity
;; In dao-governance.clar

(define-constant VOTING-PERIOD u144)       ;; ~1 day (adjust as needed)
(define-constant QUORUM-THRESHOLD u10000)  ;; Min votes for validity
(define-constant PROPOSAL-THRESHOLD u1000) ;; Min tokens to propose
```

### Recommended Settings

| DAO Size | Voting Period | Quorum | Proposal Threshold |
|----------|---------------|--------|-------------------|
| Small (< 100 members) | 1 day (144 blocks) | 100 votes | 10 tokens |
| Medium (100-1000) | 3 days (432 blocks) | 1,000 votes | 100 tokens |
| Large (1000+) | 7 days (1008 blocks) | 10,000 votes | 1,000 tokens |

---

## 🔍 10. Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { walletConnector } from './stacks-wallet-connector';

describe('Wallet Connector', () => {
  it('should connect wallet', async () => {
    const connection = await walletConnector.connectWallet();
    expect(connection.isConnected).toBe(true);
    expect(connection.address).toMatch(/^SP[A-Z0-9]+$/);
  });
});
```

### Integration Tests

```typescript
describe('Vote Casting', () => {
  it('should cast vote on-chain', async () => {
    await walletConnector.connectWallet();
    
    const result = await daoGovernanceContract.castVote({
      proposalId: 1,
      support: 'for',
    });

    expect(result.txId).toBeDefined();
    expect(result.status).toBe('PENDING');
  });
});
```

---

## 🆘 11. Troubleshooting

### Issue: Wallet Not Connecting

**Solution:**
```typescript
// Check if wallet extension is installed
if (typeof window.ethereum === 'undefined') {
  alert('Please install Hiro Wallet or Xverse');
}
```

### Issue: Transaction Failing

**Solution:**
```typescript
// Check user has enough tokens
const votingPower = await contract.getVotingPower(userAddress);
if (votingPower < PROPOSAL_THRESHOLD) {
  throw new Error('Insufficient voting power');
}
```

### Issue: Contract Not Found

**Solution:**
```typescript
// Verify contract address and network
console.log('Contract:', contractAddress);
console.log('Network:', network.isMainnet() ? 'mainnet' : 'testnet');
```

---

## 📚 12. Resources

- **Stacks Docs:** https://docs.stacks.co/
- **Clarity Docs:** https://book.clarity-lang.org/
- **Stacks Connect:** https://github.com/hirosystems/connect
- **Explorer (Testnet):** https://explorer.stacks.co/?chain=testnet
- **Clarinet:** https://github.com/hirosystems/clarinet

---

## 🎯 Summary

You now have:

✅ **Stacks wallet connection** - Connect Hiro, Xverse, Leather  
✅ **Smart contract** - Full DAO governance logic  
✅ **Contract interaction layer** - TypeScript SDK  
✅ **ADK-TS tools** - AI agents can use blockchain  
✅ **React UI** - Beautiful proposal cards  
✅ **Security guardrails** - Safe HIGH risk operations  
✅ **Complete examples** - Working code snippets  

**Your AI agents can now interact with the Stacks blockchain!** 🎉

