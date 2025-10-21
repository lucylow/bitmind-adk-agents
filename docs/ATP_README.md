# BitMind ATP Integration

## 🎯 Agent Tokenization Platform Integration

This directory contains the complete integration of BitMind DAO Governance Co-pilot with IQ AI's **Agent Tokenization Platform (ATP)**.

---

## 📋 What's Included

### Smart Contracts
- **BitMindAgentToken.sol** - ERC20 token with revenue distribution and capability unlocking
- Location: `contracts/atp/`

### Agent Components
- **AgentWallet** - Manages agent's crypto assets and autonomous transactions
- **PremiumAnalystATPAgent** - ATP-enabled premium governance analysis agent
- **ATPMarketplaceIntegration** - Integration with ATP marketplace for discovery
- **AgentGovernance** - Token-based governance for agent decisions

### Documentation
- **ATP_INTEGRATION.md** - Complete integration guide
- **ATP_DEPLOYMENT_GUIDE.md** - Step-by-step deployment instructions
- **contracts/atp/README.md** - Smart contract documentation

### Examples
- **atp-integration-example.ts** - Complete usage examples
- 9 different example scenarios covering all ATP features

---

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Copy environment template
cp env.atp.template .env

# Edit with your configuration
nano .env

# Required variables:
# FRAXTAL_RPC_URL=https://rpc.frax.com
# BITMIND_TOKEN_ADDRESS=0x...
# AGENT_PRIVATE_KEY=0x...
# GOOGLE_API_KEY=your_key
```

### 2. Deploy Smart Contract

```bash
# Install Hardhat
npm install --save-dev hardhat @nomiclabs/hardhat-ethers @openzeppelin/contracts

# Deploy to Fraxtal
npx hardhat run scripts/deploy-atp.js --network fraxtal

# Update .env with deployed address
```

### 3. Run ATP Agent

```bash
# Test agent wallet
npm run atp:wallet

# Check capabilities
npm run atp:capabilities

# Run complete example
npm run atp:example

# Start ATP-enabled agent
npm run atp:agent
```

---

## 💰 Revenue Model

### Fee Structure

| Service | Price | Token Holder Share |
|---------|-------|-------------------|
| Basic Analysis | Free | N/A |
| Premium Analysis | 0.1 ETH | 80% (0.08 ETH) |
| Custom Strategy | 0.5 ETH | 80% (0.4 ETH) |

### How It Works

1. **User Pays**: Send payment to agent wallet
2. **Agent Verifies**: On-chain payment verification
3. **Service Provided**: Premium governance analysis
4. **Revenue Distribution**: 80% automatically distributed to token holders
5. **Token Holders Claim**: Claim revenue from smart contract

---

## 🎯 Capability Unlocking

Features unlock as token market cap grows:

| Market Cap | Capability | Description |
|-----------|-----------|-------------|
| $10k | 🔓 Premium Analysis | Deep financial & security analysis |
| $50k | 🔓 Multi-DAO Support | Cross-DAO comparison & benchmarking |
| $100k | 🔓 Delegation Optimization | Optimal delegation strategies |
| $500k | 🔓 Cross-Chain Governance | Multi-chain governance analysis |
| $1M | 🔓 AI-Powered Predictions | Proposal outcome predictions |

Check current status:
```bash
npm run atp:capabilities
```

---

## 🏗️ Architecture

```
User Payment (0.1 ETH)
    ↓
Agent Wallet (receives & verifies)
    ↓
Premium Analysis Service
    ↓
Revenue Distribution (80% to holders)
    ↓
BitMindAgentToken Contract
    ↓
Token Holders Claim Revenue
```

### Key Components

1. **BitMindAgentToken.sol**
   - ERC20 token with revenue distribution
   - Capability unlocking based on market cap
   - Agent wallet management

2. **AgentWallet (TypeScript)**
   - Manages agent's crypto operations
   - Deposits revenue to token holders
   - Checks unlocked capabilities
   - Executes autonomous transactions

3. **PremiumAnalystATPAgent**
   - Verifies user payments
   - Provides premium analysis
   - Distributes revenue automatically
   - Uses unlocked capabilities

4. **ATPMarketplaceIntegration**
   - Registers agent on ATP marketplace
   - Updates metrics and analytics
   - Manages agent discovery

5. **AgentGovernance**
   - Token holder voting
   - Proposal creation & execution
   - Agent parameter updates

---

## 📚 Documentation

### Getting Started
- **[ATP Integration Guide](./ATP_INTEGRATION.md)** - Complete integration overview
- **[Deployment Guide](./ATP_DEPLOYMENT_GUIDE.md)** - Step-by-step deployment
- **[Contract README](../contracts/atp/README.md)** - Smart contract docs

### Code Examples
- **[Integration Examples](../src/adk-agents/examples/atp-integration-example.ts)** - 9 complete examples

### Quick References
```bash
# View all ATP scripts
npm run | grep atp

# Available commands:
# npm run atp:agent          - Start ATP-enabled agent
# npm run atp:example        - Run integration examples
# npm run atp:wallet         - Check agent wallet status
# npm run atp:capabilities   - View unlocked capabilities
# npm run atp:register       - Register on ATP marketplace
```

---

## 🔧 Development

### Project Structure

```
bitmind-adk-agents/
├── contracts/atp/
│   ├── BitMindAgentToken.sol    # Main token contract
│   └── README.md                 # Contract documentation
├── src/adk-agents/atp/
│   ├── agent-wallet.ts           # Agent wallet management
│   ├── marketplace-integration.ts # ATP marketplace
│   ├── agent-governance.ts       # Governance system
│   └── index.ts                  # ATP exports
├── src/adk-agents/agents/
│   └── premium-analyst-atp.agent.ts # ATP-enabled agent
├── src/adk-agents/examples/
│   └── atp-integration-example.ts   # Usage examples
├── docs/
│   ├── ATP_INTEGRATION.md        # Integration guide
│   ├── ATP_DEPLOYMENT_GUIDE.md   # Deployment guide
│   └── ATP_README.md             # This file
├── scripts/
│   └── deploy-atp.js             # Deployment script
└── env.atp.template              # Environment template
```

### Testing

```bash
# Run all tests
npm test

# Run ATP-specific tests
npm run test:atp

# Run integration examples
npm run atp:example
```

### Debugging

```bash
# Enable debug mode
export DEBUG=bitmind:*

# Check agent status
npm run atp:wallet

# View capabilities
npm run atp:capabilities

# Test with mock data
ATP_MOCK_MODE=true npm run atp:example
```

---

## 🎓 Examples

### Example 1: Initialize Agent

```typescript
import { AgentWallet, PremiumAnalystATPAgent } from './adk-agents/atp';

const wallet = new AgentWallet({
  privateKey: process.env.AGENT_PRIVATE_KEY!,
  rpcUrl: process.env.FRAXTAL_RPC_URL!,
  tokenAddress: process.env.BITMIND_TOKEN_ADDRESS!
});

const agent = new PremiumAnalystATPAgent(wallet);
console.log('Payment Address:', agent.getPaymentAddress());
```

### Example 2: Premium Analysis Request

```typescript
// User pays 0.1 ETH to agent wallet first
const paymentTx = '0x123...';

const result = await agent.run(
  `Analyze proposal prop-456 for UniswapDAO. Payment: ${paymentTx}`,
  {
    proposalId: 'prop-456',
    daoAddress: '0xUniswap',
    userAddress: '0xUser',
    paymentTxHash: paymentTx
  }
);

console.log(result); // Premium analysis with all unlocked features
```

### Example 3: Token Holder Governance

```typescript
import { AgentGovernance, GovernanceProposalTemplates, VoteType } from './adk-agents/atp';

const governance = new AgentGovernance(
  governanceAddress,
  rpcUrl,
  privateKey
);

// Propose pricing update
const proposal = GovernanceProposalTemplates.updatePricing(
  tokenAddress,
  '0.02', '0.15', '0.6'
);

const { proposalId } = await governance.createProposal(
  proposal.description,
  proposal.actions
);

// Vote
await governance.vote(proposalId, VoteType.For);
```

See `src/adk-agents/examples/atp-integration-example.ts` for 9 complete examples!

---

## 🏆 Hackathon Benefits

### Track 3: Advanced Web3 Integration ✅

- ✅ **Smart Contract Integration**: Custom ERC20 with revenue mechanics
- ✅ **DeFi Operations**: Autonomous earning and distribution
- ✅ **On-Chain Governance**: Token-based decision making
- ✅ **Multi-Chain Ready**: Fraxtal primary, expandable

### Innovation Points

1. **First DAO Governance Agent with ATP** 🥇
   - Novel combination of governance analysis + tokenization
   
2. **Progressive Feature Unlocking** 🔓
   - Market cap-based capability system
   
3. **Sustainable Economics** 💰
   - Clear revenue model with community benefit
   
4. **Production Ready** 🚀
   - Complete implementation with deployment guides

---

## 🔗 Resources

### Official ATP Resources
- **IQ AI Website**: https://iqai.com
- **ATP Blog**: https://blog.iqai.com/what-is-agent-tokenization-platform/
- **ATP Wiki**: https://iq.wiki/wiki/agent-tokenization-platform-atp
- **ADK-TS Docs**: https://adk.iqai.com/docs

### BitMind Resources
- **Main README**: [../README.md](../README.md)
- **ADK Quickstart**: [./ADK_AGENTS_QUICKSTART.md](./ADK_AGENTS_QUICKSTART.md)
- **Integration Guide**: [./ATP_INTEGRATION.md](./ATP_INTEGRATION.md)
- **Deployment Guide**: [./ATP_DEPLOYMENT_GUIDE.md](./ATP_DEPLOYMENT_GUIDE.md)

### Blockchain Resources
- **Fraxtal Docs**: https://docs.frax.com
- **Fraxtal Explorer**: https://fraxscan.com
- **OpenZeppelin**: https://docs.openzeppelin.com

---

## 📞 Support

### Get Help
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/bitmind-adk-agents/issues)
- **Documentation**: Check guides in `docs/` directory
- **Examples**: Review `src/adk-agents/examples/atp-integration-example.ts`

### Common Issues

**Q: "Missing required environment variables"**
```bash
# Ensure environment is configured
cp env.atp.template .env
source .env
```

**Q: "Agent wallet has insufficient funds"**
```bash
# Fund agent wallet with FRX for gas
# Minimum 0.1 FRX recommended
```

**Q: "Payment verification failed"**
```bash
# Ensure transaction is confirmed
# Verify amount is correct (0.1 ETH)
# Check sent to correct agent address
```

---

## 🚀 Next Steps

1. ✅ **Deploy Smart Contract** - Deploy BitMindAgentToken to Fraxtal
2. ✅ **Configure Agent** - Set up agent wallet and environment
3. ✅ **Register Marketplace** - Register on ATP marketplace
4. ✅ **Launch Agent** - Start providing premium services
5. ✅ **Build Community** - Distribute tokens and engage holders
6. ✅ **Iterate** - Add features based on governance votes

---

## 📄 License

MIT License - See [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

- **IQ AI Team** - For creating the Agent Tokenization Platform
- **ADK-TS Framework** - For the powerful agent development kit
- **Fraxtal** - For the L2 blockchain infrastructure
- **OpenZeppelin** - For secure smart contract standards

---

**Built with ❤️ for ADK-TS Agents Hackathon 2025**

**Ready to tokenize your agent? Let's go! 🚀**

