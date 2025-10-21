# ATP Integration Module

This directory contains all components for Agent Tokenization Platform (ATP) integration.

## Structure

```
atp/
├── agent-wallet.ts              # Agent wallet management
├── marketplace-integration.ts   # ATP marketplace integration
├── agent-governance.ts          # Token-based governance
├── index.ts                     # Module exports
└── README.md                    # This file
```

## Components

### AgentWallet (`agent-wallet.ts`)

Manages the agent's autonomous crypto operations.

```typescript
import { AgentWallet } from './agent-wallet';

const wallet = new AgentWallet({
  privateKey: process.env.AGENT_PRIVATE_KEY!,
  rpcUrl: process.env.FRAXTAL_RPC_URL!,
  tokenAddress: process.env.BITMIND_TOKEN_ADDRESS!
});

// Operations
await wallet.depositRevenue('0.08');
const hasPremium = await wallet.hasCapability('Premium Analysis');
const status = await wallet.getStatus();
```

### ATPMarketplaceIntegration (`marketplace-integration.ts`)

Integration with ATP marketplace for agent discovery and analytics.

```typescript
import { ATPMarketplaceIntegration } from './marketplace-integration';

const marketplace = new ATPMarketplaceIntegration(apiKey);

// Register agent
await marketplace.registerAgent(metadata);

// Update metrics
await marketplace.updateAgentMetrics(tokenAddress, metrics);

// Search agents
const agents = await marketplace.searchAgents({ category: 'DAO Governance' });
```

### AgentGovernance (`agent-governance.ts`)

Token-based governance for agent decisions.

```typescript
import { AgentGovernance, GovernanceProposalTemplates } from './agent-governance';

const governance = new AgentGovernance(
  governanceAddress,
  rpcUrl,
  privateKey
);

// Create proposal
const proposal = GovernanceProposalTemplates.updatePricing(
  tokenAddress, '0.02', '0.15', '0.6'
);

const { proposalId } = await governance.createProposal(
  proposal.description,
  proposal.actions
);

// Vote
await governance.vote(proposalId, VoteType.For);
```

## Usage

### Import All ATP Components

```typescript
import {
  AgentWallet,
  PremiumAnalystATPAgent,
  ATPMarketplaceIntegration,
  AgentGovernance,
  GovernanceProposalTemplates,
  VoteType
} from './adk-agents/atp';
```

### Factory Functions

```typescript
// Create from environment variables
import { createAgentWalletFromEnv } from './agent-wallet';
import { createMarketplaceClient } from './marketplace-integration';
import { createGovernanceFromEnv } from './agent-governance';

const wallet = createAgentWalletFromEnv();
const marketplace = createMarketplaceClient();
const governance = createGovernanceFromEnv();
```

## Environment Variables

Required:
```bash
FRAXTAL_RPC_URL=https://rpc.frax.com
BITMIND_TOKEN_ADDRESS=0x...
AGENT_PRIVATE_KEY=0x...
```

Optional:
```bash
ATP_API_KEY=your_api_key
GOVERNANCE_CONTRACT_ADDRESS=0x...
```

## Examples

See `../examples/atp-integration-example.ts` for complete usage examples.

## Documentation

- **Integration Guide**: `../../docs/ATP_INTEGRATION.md`
- **Deployment Guide**: `../../docs/ATP_DEPLOYMENT_GUIDE.md`
- **Quick Start**: `../../ATP_QUICKSTART.md`

## Testing

```bash
# Test agent wallet
npm run atp:wallet

# Test capabilities
npm run atp:capabilities

# Run examples
npm run atp:example
```

## Support

For issues or questions:
1. Check documentation in `docs/` directory
2. Review examples in `examples/` directory
3. Open GitHub issue
4. Join community Discord

---

**Part of BitMind DAO Governance Co-pilot ATP Integration**

