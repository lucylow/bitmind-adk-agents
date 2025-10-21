# ATP Deployment Guide

Complete step-by-step guide to deploy BitMind with ATP integration.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Smart Contract Deployment](#smart-contract-deployment)
4. [Agent Configuration](#agent-configuration)
5. [Marketplace Registration](#marketplace-registration)
6. [Testing](#testing)
7. [Production Launch](#production-launch)

---

## Prerequisites

### Required Tools

```bash
# Node.js 18+
node --version

# npm or yarn
npm --version

# Hardhat (for smart contract deployment)
npm install --global hardhat

# Cast (optional, for CLI interactions)
# Install from https://book.getfoundry.sh/
```

### Required Accounts

- [ ] Fraxtal RPC access (https://rpc.frax.com)
- [ ] Wallet with FRX for gas fees (~0.5 FRX minimum)
- [ ] ATP API key (optional, for marketplace)
- [ ] Google/OpenAI/Anthropic API keys (for AI models)

### Get Test Funds

```bash
# Fraxtal testnet faucet (if available)
# Or bridge from mainnet: https://frax.com/bridge
```

---

## Environment Setup

### 1. Clone and Install

```bash
cd /Users/llow/Desktop/bitmind-adk-agents
npm install
```

### 2. Configure Environment

```bash
# Copy ATP environment template
cp env.atp.template .env

# Edit .env with your values
nano .env
```

### 3. Required Environment Variables

```bash
# Fraxtal Network
FRAXTAL_RPC_URL=https://rpc.frax.com
FRAXTAL_CHAIN_ID=252

# Deployer wallet (for contract deployment)
DEPLOYER_PRIVATE_KEY=0x...your_deployer_private_key

# Agent wallet (for autonomous operations)
AGENT_PRIVATE_KEY=0x...your_agent_private_key

# AI Models (at least one required)
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key

# ATP (optional for now)
ATP_API_KEY=your_atp_api_key_when_available
```

### 4. Verify Setup

```bash
# Check environment
npm run verify

# Test RPC connection
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $FRAXTAL_RPC_URL
```

---

## Smart Contract Deployment

### 1. Install Hardhat Dependencies

```bash
npm install --save-dev \
  hardhat \
  @nomiclabs/hardhat-ethers \
  @nomiclabs/hardhat-etherscan \
  @openzeppelin/contracts
```

### 2. Create Hardhat Config

Create `hardhat.config.js`:

```javascript
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

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
      url: process.env.FRAXTAL_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 252,
      gasPrice: "auto"
    }
  },
  etherscan: {
    apiKey: {
      fraxtal: process.env.FRAXTAL_EXPLORER_API_KEY || "placeholder"
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

### 3. Create Deployment Script

Create `scripts/deploy-atp.js`:

```javascript
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting BitMind ATP deployment to Fraxtal...\n");
  
  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "FRX\n");
  
  // Configuration
  const TOKEN_NAME = "BitMind DAO Governance Co-pilot";
  const TOKEN_SYMBOL = "BITMIND";
  const AGENT_WALLET = process.env.AGENT_WALLET_ADDRESS || deployer.address;
  
  // IQ Token on Fraxtal (update with actual address when available)
  const IQ_TOKEN = process.env.IQ_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
  
  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000"); // 1M tokens
  
  console.log("Deployment configuration:");
  console.log("  Token Name:", TOKEN_NAME);
  console.log("  Token Symbol:", TOKEN_SYMBOL);
  console.log("  Agent Wallet:", AGENT_WALLET);
  console.log("  IQ Token:", IQ_TOKEN);
  console.log("  Initial Supply:", ethers.utils.formatEther(INITIAL_SUPPLY), "tokens\n");
  
  // Deploy BitMindAgentToken
  console.log("Deploying BitMindAgentToken...");
  
  const BitMindAgentToken = await ethers.getContractFactory("BitMindAgentToken");
  const token = await BitMindAgentToken.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    AGENT_WALLET,
    IQ_TOKEN,
    INITIAL_SUPPLY,
    {
      gasLimit: 3000000
    }
  );
  
  await token.deployed();
  
  console.log("✅ BitMindAgentToken deployed to:", token.address);
  
  // Get initial state
  const totalSupply = await token.totalSupply();
  const agentWallet = await token.agentWallet();
  const capabilities = await token.getAllCapabilities();
  
  console.log("\nContract State:");
  console.log("  Total Supply:", ethers.utils.formatEther(totalSupply));
  console.log("  Agent Wallet:", agentWallet);
  console.log("  Capabilities:", capabilities[0].length);
  
  // Save deployment info
  const deploymentInfo = {
    network: "fraxtal",
    chainId: 252,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      BitMindAgentToken: {
        address: token.address,
        name: TOKEN_NAME,
        symbol: TOKEN_SYMBOL,
        agentWallet: agentWallet,
        initialSupply: ethers.utils.formatEther(INITIAL_SUPPLY)
      }
    }
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    'deployment-atp.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n✅ Deployment info saved to deployment-atp.json");
  
  // Verification command
  console.log("\n📝 To verify on Fraxscan, run:");
  console.log(`npx hardhat verify --network fraxtal ${token.address} "${TOKEN_NAME}" "${TOKEN_SYMBOL}" ${AGENT_WALLET} ${IQ_TOKEN} ${INITIAL_SUPPLY.toString()}`);
  
  // Update environment command
  console.log("\n📝 Update your .env file:");
  console.log(`BITMIND_TOKEN_ADDRESS=${token.address}`);
  console.log(`AGENT_WALLET_ADDRESS=${AGENT_WALLET}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 4. Deploy

```bash
# Compile contracts
npx hardhat compile

# Deploy to Fraxtal
npx hardhat run scripts/deploy-atp.js --network fraxtal

# Save the deployed address
# Update BITMIND_TOKEN_ADDRESS in .env
```

### 5. Verify on Fraxscan

```bash
# After deployment, verify source code
npx hardhat verify \
  --network fraxtal \
  <CONTRACT_ADDRESS> \
  "BitMind DAO Governance Co-pilot" \
  "BITMIND" \
  <AGENT_WALLET_ADDRESS> \
  <IQ_TOKEN_ADDRESS> \
  "1000000000000000000000000"
```

---

## Agent Configuration

### 1. Fund Agent Wallet

```bash
# Send FRX for gas to agent wallet
# Minimum 0.1 FRX recommended

# Check balance
cast balance <AGENT_WALLET_ADDRESS> --rpc-url $FRAXTAL_RPC_URL
```

### 2. Test Agent Wallet

```typescript
// test-agent-wallet.ts
import { AgentWallet } from './src/adk-agents/atp/agent-wallet';

async function test() {
  const wallet = new AgentWallet({
    privateKey: process.env.AGENT_PRIVATE_KEY!,
    rpcUrl: process.env.FRAXTAL_RPC_URL!,
    tokenAddress: process.env.BITMIND_TOKEN_ADDRESS!
  });
  
  console.log('Agent Wallet:', wallet.getAddress());
  console.log('Balance:', await wallet.getBalance(), 'FRX');
  console.log('Token Balance:', await wallet.getTokenBalance(), 'BITMIND');
  
  const capabilities = await wallet.getAllCapabilities();
  console.log('Capabilities:', capabilities);
}

test().catch(console.error);
```

```bash
# Run test
npx tsx test-agent-wallet.ts
```

### 3. Initialize Agent

```typescript
// initialize-agent.ts
import { PremiumAnalystATPAgent } from './src/adk-agents/agents/premium-analyst-atp.agent';
import { AgentWallet } from './src/adk-agents/atp/agent-wallet';

async function initialize() {
  const wallet = new AgentWallet({
    privateKey: process.env.AGENT_PRIVATE_KEY!,
    rpcUrl: process.env.FRAXTAL_RPC_URL!,
    tokenAddress: process.env.BITMIND_TOKEN_ADDRESS!
  });
  
  const agent = new PremiumAnalystATPAgent(wallet);
  
  console.log('✅ Agent initialized');
  console.log('Payment Address:', agent.getPaymentAddress());
  
  const status = await agent.getStatus();
  console.log('Agent Status:', JSON.stringify(status, null, 2));
}

initialize().catch(console.error);
```

---

## Marketplace Registration

### 1. Register on ATP Marketplace

```typescript
// register-marketplace.ts
import { registerBitMindAgent } from './src/adk-agents/atp/marketplace-integration';

async function register() {
  const agentWallet = process.env.AGENT_WALLET_ADDRESS!;
  
  console.log('Registering BitMind on ATP marketplace...');
  await registerBitMindAgent(agentWallet);
  console.log('✅ Registration complete');
}

register().catch(console.error);
```

```bash
# Run registration
npx tsx register-marketplace.ts
```

### 2. Configure Metrics Reporting

```typescript
// Enable automatic metrics reporting
import { ATPMarketplaceIntegration } from './src/adk-agents/atp/marketplace-integration';

const marketplace = new ATPMarketplaceIntegration(process.env.ATP_API_KEY);

// Report metrics every 15 minutes
const interval = marketplace.startMetricsReporting(
  tokenAddress,
  async () => ({
    totalRevenue: await getTotalRevenue(),
    activeUsers: await getActiveUsers(),
    analysisCount: await getAnalysisCount(),
    avgResponseTime: await getAvgResponseTime()
  }),
  15 // minutes
);
```

---

## Testing

### 1. Unit Tests

```bash
# Run TypeScript tests
npm run test

# Run ATP-specific tests
npm run test:atp
```

### 2. Integration Tests

Create `test-atp-integration.ts`:

```typescript
import { example9_CompleteWorkflow } from './src/adk-agents/examples/atp-integration-example';

async function testIntegration() {
  console.log('Running ATP integration tests...\n');
  
  try {
    await example9_CompleteWorkflow();
    console.log('\n✅ All integration tests passed!');
  } catch (error) {
    console.error('\n❌ Integration test failed:', error);
    process.exit(1);
  }
}

testIntegration();
```

```bash
# Run integration tests
npx tsx test-atp-integration.ts
```

### 3. Manual Testing Checklist

- [ ] Agent wallet has funds and can send transactions
- [ ] Token contract deployed and verified
- [ ] Agent can check capabilities
- [ ] Payment verification works
- [ ] Revenue deposit works
- [ ] Token holders can claim revenue
- [ ] Governance proposals can be created
- [ ] Marketplace registration successful

---

## Production Launch

### 1. Security Checklist

- [ ] Private keys secured (use hardware wallet/HSM in production)
- [ ] Smart contract audited (recommended for mainnet)
- [ ] Rate limiting configured
- [ ] Error handling implemented
- [ ] Monitoring and alerts set up
- [ ] Backup and recovery plan
- [ ] Gas price strategy defined

### 2. Launch Configuration

```bash
# Production environment
NODE_ENV=production
FRAXTAL_RPC_URL=https://rpc.frax.com
BITMIND_TOKEN_ADDRESS=<DEPLOYED_ADDRESS>
AGENT_PRIVATE_KEY=<SECURED_KEY>

# Monitoring
ATP_METRICS_ENABLED=true
REVENUE_TRACKING_ENABLED=true
GOVERNANCE_EVENTS_ENABLED=true

# Security
AGENT_MAX_TX_VALUE=1.0
AGENT_REQUIRE_APPROVAL_THRESHOLD=0.5
AGENT_RATE_LIMIT_ENABLED=true
```

### 3. Start Production Agent

```bash
# Start agent with PM2 for production
npm install -g pm2

pm2 start npm --name "bitmind-atp-agent" -- run atp:agent
pm2 save
pm2 startup
```

### 4. Monitoring

```bash
# View logs
pm2 logs bitmind-atp-agent

# Monitor status
pm2 monit

# Check metrics
npm run atp:metrics
```

---

## Post-Deployment

### 1. Announce Launch

- [ ] Update README with contract addresses
- [ ] Post on social media
- [ ] Submit to ATP marketplace
- [ ] Create demo video
- [ ] Update documentation

### 2. Community Building

- [ ] Distribute initial tokens
- [ ] Create token holder Discord/Telegram
- [ ] Set up governance forum
- [ ] Document roadmap

### 3. Continuous Improvement

- [ ] Monitor agent performance
- [ ] Collect user feedback
- [ ] Create governance proposals
- [ ] Add new capabilities
- [ ] Scale infrastructure

---

## Troubleshooting

### Deployment Fails

```bash
# Check gas price
cast gas-price --rpc-url $FRAXTAL_RPC_URL

# Check deployer balance
cast balance <DEPLOYER_ADDRESS> --rpc-url $FRAXTAL_RPC_URL

# Increase gas limit in deployment script
# gasLimit: 5000000
```

### Agent Can't Deposit Revenue

```bash
# Check agent wallet is set correctly in contract
cast call $BITMIND_TOKEN_ADDRESS "agentWallet()" --rpc-url $FRAXTAL_RPC_URL

# Verify agent has funds for gas
cast balance <AGENT_WALLET> --rpc-url $FRAXTAL_RPC_URL
```

### Marketplace Registration Fails

```bash
# ATP API may not be public yet
# Enable mock mode for testing
ATP_MOCK_MODE=true

# Or wait for official API launch
```

---

## Support

### Get Help

- **GitHub Issues**: https://github.com/yourusername/bitmind-adk-agents/issues
- **Discord**: [Your Discord Server]
- **Email**: [Your Email]

### Resources

- **Fraxtal Docs**: https://docs.frax.com
- **ATP Docs**: https://atp.iqai.com/docs
- **ADK-TS**: https://adk.iqai.com/docs
- **Hardhat**: https://hardhat.org/docs

---

**Ready to deploy? Start with Step 1! 🚀**

