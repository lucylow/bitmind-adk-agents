# BitMind ATP Smart Contracts

This directory contains smart contracts for integrating BitMind DAO Governance Co-pilot with IQ AI's Agent Tokenization Platform (ATP).

## Overview

The ATP integration enables:
- **Agent Tokenization**: BitMind agents become tokenized assets
- **Revenue Sharing**: Token holders earn from agent operations
- **Capability Unlocking**: Features unlock based on market cap milestones
- **Decentralized Governance**: Token holders vote on agent decisions

## Contracts

### BitMindAgentToken.sol

Main ERC20 token contract for BitMind agents with ATP features.

**Key Features:**
- ERC20 token with revenue distribution
- Capability unlocking based on market cap thresholds
- Agent wallet management for autonomous operations
- Integration with IQ token pairing (ATP requirement)

**Capabilities & Market Cap Milestones:**
- **$10k**: Premium Analysis
- **$50k**: Multi-DAO Support
- **$100k**: Delegation Optimization
- **$500k**: Cross-Chain Governance
- **$1M**: AI-Powered Predictions

## Deployment

### Prerequisites

1. Install dependencies:
```bash
npm install --save-dev @openzeppelin/contracts hardhat @nomiclabs/hardhat-ethers
```

2. Set up Hardhat config for Fraxtal network

### Deploy to Fraxtal

1. Create deployment script (`scripts/deploy-atp.js`):

```javascript
const { ethers } = require("hardhat");

async function main() {
  // Configuration
  const TOKEN_NAME = "BitMind DAO Governance Co-pilot";
  const TOKEN_SYMBOL = "BITMIND";
  const AGENT_WALLET = "0x..."; // Your agent wallet address
  const IQ_TOKEN = "0x..."; // IQ token address on Fraxtal
  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1M tokens
  
  console.log("Deploying BitMindAgentToken...");
  
  const BitMindAgentToken = await ethers.getContractFactory("BitMindAgentToken");
  const token = await BitMindAgentToken.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    AGENT_WALLET,
    IQ_TOKEN,
    INITIAL_SUPPLY
  );
  
  await token.waitForDeployment();
  const address = await token.getAddress();
  
  console.log("BitMindAgentToken deployed to:", address);
  console.log("Agent Wallet:", AGENT_WALLET);
  console.log("Initial Supply:", ethers.formatEther(INITIAL_SUPPLY));
  
  // Verify on block explorer
  console.log("\nVerification command:");
  console.log(`npx hardhat verify --network fraxtal ${address} "${TOKEN_NAME}" "${TOKEN_SYMBOL}" ${AGENT_WALLET} ${IQ_TOKEN} ${INITIAL_SUPPLY}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

2. Deploy:
```bash
npx hardhat run scripts/deploy-atp.js --network fraxtal
```

3. Update `.env.atp` with deployed contract address

### Hardhat Configuration

Add Fraxtal network to `hardhat.config.js`:

```javascript
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    fraxtal: {
      url: process.env.FRAXTAL_RPC_URL || "https://rpc.frax.com",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 252
    }
  },
  etherscan: {
    apiKey: {
      fraxtal: process.env.FRAXTAL_EXPLORER_API_KEY || ""
    },
    customChains: [
      {
        network: "fraxtal",
        chainId: 252,
        urls: {
          apiURL: "https://api.fraxscan.com/api",
          browserURL: "https://fraxscan.com"
        }
      }
    ]
  }
};
```

## Usage

### Agent Deposits Revenue

After the agent earns fees from premium services:

```typescript
import { AgentWallet } from '../src/adk-agents/atp/agent-wallet';

const wallet = new AgentWallet({
  privateKey: process.env.AGENT_PRIVATE_KEY!,
  rpcUrl: process.env.FRAXTAL_RPC_URL!,
  tokenAddress: process.env.BITMIND_TOKEN_ADDRESS!
});

// Agent earned 0.1 ETH, shares 80% with token holders
const revenueShare = 0.08;
await wallet.depositRevenue(revenueShare.toString());
```

### Token Holders Claim Revenue

Token holders can claim their share:

```javascript
// Using ethers.js directly
const token = new ethers.Contract(tokenAddress, abi, signer);
await token.claimRevenue();
```

### Check Unlocked Capabilities

```typescript
const hasPremium = await wallet.hasCapability("Premium Analysis");
const hasMultiDAO = await wallet.hasCapability("Multi-DAO Support");

console.log("Premium Analysis:", hasPremium);
console.log("Multi-DAO Support:", hasMultiDAO);
```

### Update Agent Configuration

Token holders can vote on changes through governance:

```typescript
import { AgentGovernance, GovernanceProposalTemplates } from '../src/adk-agents/atp/agent-governance';

const governance = new AgentGovernance(
  governanceAddress,
  rpcUrl,
  privateKey
);

// Create proposal to update pricing
const proposal = GovernanceProposalTemplates.updatePricing(
  tokenAddress,
  "0.02", // basic fee
  "0.15", // premium fee
  "0.6"   // custom fee
);

const { proposalId } = await governance.createProposal(
  proposal.description,
  proposal.actions
);

console.log("Proposal created:", proposalId);
```

## Security Considerations

1. **Private Key Management**: Never commit private keys to version control
2. **Agent Wallet Security**: Use hardware wallet or secure key management for agent wallet
3. **Access Control**: Only agent wallet can deposit revenue
4. **Governance**: Token holders control critical parameters
5. **Audits**: Consider security audits before mainnet deployment

## Integration with ATP Marketplace

After deployment, register your agent on ATP marketplace:

```typescript
import { registerBitMindAgent } from '../src/adk-agents/atp/marketplace-integration';

await registerBitMindAgent(agentWalletAddress);
```

## Testing

Run tests before deployment:

```bash
npx hardhat test test/BitMindAgentToken.test.js
```

## Support & Resources

- **ATP Documentation**: https://atp.iqai.com/docs
- **IQ AI Website**: https://iqai.com
- **ADK-TS GitHub**: https://github.com/IQAIcom/adk-ts
- **BitMind Documentation**: See main README.md

## License

MIT License - See LICENSE file for details

