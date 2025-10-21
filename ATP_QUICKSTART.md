# 🚀 ATP Integration Quick Start

**Get your BitMind agent tokenized and earning in 10 minutes!**

---

## ⚡ 5-Step Quick Start

### Step 1: Environment Setup (2 min)

```bash
# Copy environment template
cp env.atp.template .env

# Add these required variables to .env:
FRAXTAL_RPC_URL=https://rpc.frax.com
AGENT_PRIVATE_KEY=0x...your_private_key
GOOGLE_API_KEY=your_google_api_key

# You'll add token address after deployment
```

### Step 2: Install Dependencies (1 min)

```bash
npm install
```

### Step 3: Deploy Smart Contract (3 min)

```bash
# Install Hardhat
npm install --save-dev hardhat @nomiclabs/hardhat-ethers @openzeppelin/contracts

# Copy deployment script
mkdir -p scripts
cat > scripts/deploy-atp.js << 'EOF'
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  
  const BitMindAgentToken = await ethers.getContractFactory("BitMindAgentToken");
  const token = await BitMindAgentToken.deploy(
    "BitMind DAO Governance Co-pilot",
    "BITMIND",
    deployer.address, // Agent wallet
    "0x0000000000000000000000000000000000000000", // IQ token placeholder
    ethers.utils.parseEther("1000000")
  );
  
  await token.deployed();
  console.log("✅ Token deployed to:", token.address);
  console.log("\nAdd to .env:");
  console.log("BITMIND_TOKEN_ADDRESS=" + token.address);
}

main().catch(console.error);
EOF

# Deploy
npx hardhat run scripts/deploy-atp.js --network fraxtal

# Add BITMIND_TOKEN_ADDRESS to .env with the deployed address
```

### Step 4: Test Your Agent (2 min)

```bash
# Check agent wallet status
npm run atp:wallet

# View capabilities
npm run atp:capabilities

# Run complete example
npm run atp:example
```

### Step 5: Start Earning! (2 min)

```bash
# Start ATP-enabled agent
npm run atp:agent

# Your agent is now:
# ✅ Accepting payments
# ✅ Providing premium analysis
# ✅ Distributing revenue to token holders
# ✅ Unlocking features as market cap grows
```

---

## 📊 What You Get

### Immediate Benefits

✅ **Tokenized Agent**
- Your agent is now an ERC20 token
- Tradeable on DEXs
- Discoverable on ATP marketplace

✅ **Revenue Generation**
- Basic analysis: Free
- Premium analysis: 0.1 ETH
- Custom strategy: 0.5 ETH

✅ **Automatic Revenue Sharing**
- 80% to token holders
- 20% for operations
- Automatic distribution

✅ **Progressive Feature Unlocking**
- $10k: Premium Analysis
- $50k: Multi-DAO Support
- $100k: Delegation Optimization
- $500k: Cross-Chain Governance
- $1M: AI Predictions

---

## 💡 How It Works

### User Flow

```
1. User sends 0.1 ETH to agent wallet
   ↓
2. User requests premium analysis
   ↓
3. Agent verifies payment on-chain
   ↓
4. Agent provides comprehensive analysis
   ↓
5. Agent deposits 0.08 ETH to token contract
   ↓
6. Token holders claim their share
```

### Example Usage

```typescript
// User makes payment first
// Then requests analysis:

const agent = new PremiumAnalystATPAgent(wallet);

const result = await agent.run(
  'Analyze proposal prop-123 for UniswapDAO. Payment tx: 0xabc...',
  {
    proposalId: 'prop-123',
    paymentTxHash: '0xabc...'
  }
);

// Agent verifies payment, performs analysis, shares revenue
console.log(result.analysis);
console.log(`Revenue shared: ${result.revenueShared}`);
```

---

## 🎯 Available Commands

```bash
# Agent Operations
npm run atp:agent          # Start ATP-enabled agent
npm run atp:wallet         # Check agent wallet status
npm run atp:capabilities   # View unlocked capabilities

# Examples & Testing
npm run atp:example        # Run complete integration example

# Marketplace
npm run atp:register       # Register on ATP marketplace
```

---

## 📚 Documentation

### Essential Guides
- **[ATP Integration Guide](docs/ATP_INTEGRATION.md)** - Complete overview
- **[Deployment Guide](docs/ATP_DEPLOYMENT_GUIDE.md)** - Detailed deployment
- **[ATP README](docs/ATP_README.md)** - Feature documentation

### Code References
- **Smart Contract**: `contracts/atp/BitMindAgentToken.sol`
- **Agent Wallet**: `src/adk-agents/atp/agent-wallet.ts`
- **Premium Agent**: `src/adk-agents/agents/premium-analyst-atp.agent.ts`
- **Examples**: `src/adk-agents/examples/atp-integration-example.ts`

---

## 🎓 Example Scenarios

### Scenario 1: Basic Free Analysis

```bash
# User requests free analysis
curl -X POST http://localhost:3000/api/analyze \
  -d '{"proposalId": "prop-123", "tier": "basic"}'

# Agent provides basic summary for free
```

### Scenario 2: Premium Analysis

```typescript
// User pays 0.1 ETH first
const tx = await signer.sendTransaction({
  to: agentWalletAddress,
  value: ethers.utils.parseEther("0.1")
});

await tx.wait();

// User requests premium analysis
const result = await agent.run(
  `Analyze proposal prop-456. Payment: ${tx.hash}`,
  { proposalId: 'prop-456', paymentTxHash: tx.hash }
);

// Get comprehensive analysis with all unlocked features
```

### Scenario 3: Token Holder Claims Revenue

```typescript
// Token holder claims their share
const token = new ethers.Contract(tokenAddress, abi, signer);
await token.claimRevenue();

console.log("Revenue claimed!");
```

### Scenario 4: Governance Proposal

```typescript
// Token holder proposes pricing update
const governance = new AgentGovernance(govAddress, rpc, privateKey);

const proposal = GovernanceProposalTemplates.updatePricing(
  tokenAddress,
  "0.02", "0.15", "0.6"
);

await governance.createProposal(
  proposal.description,
  proposal.actions
);

// Community votes on the change
```

---

## 🔧 Troubleshooting

### "Missing environment variables"

```bash
# Ensure .env is configured
cat .env | grep -E "FRAXTAL_RPC_URL|AGENT_PRIVATE_KEY|BITMIND_TOKEN_ADDRESS"

# If missing, copy template and fill in
cp env.atp.template .env
nano .env
```

### "Agent wallet insufficient funds"

```bash
# Check balance
npx hardhat console --network fraxtal
> const balance = await ethers.provider.getBalance("YOUR_AGENT_ADDRESS")
> console.log(ethers.utils.formatEther(balance))

# Fund with at least 0.1 FRX
```

### "Payment verification failed"

- Ensure transaction is confirmed (wait for block confirmation)
- Verify correct agent address
- Check payment amount (0.1 ETH for premium)

### "Capability not unlocked"

```bash
# Check token market cap
npm run atp:capabilities

# Market cap must reach threshold:
# $10k for Premium Analysis
# $50k for Multi-DAO Support
# etc.
```

---

## 🎉 Success Checklist

After completing Quick Start, you should have:

- [ ] Smart contract deployed to Fraxtal
- [ ] Agent wallet configured and funded
- [ ] Environment variables set
- [ ] Agent running and accepting requests
- [ ] Successfully tested premium analysis
- [ ] Revenue distribution working
- [ ] Registered on ATP marketplace (optional)

---

## 🏆 Hackathon Demo Script

### 1-Minute Demo

```typescript
// Show agent status
const status = await agent.getStatus();
console.log("Agent Address:", status.address);
console.log("Unlocked Capabilities:", status.capabilities);

// Demonstrate premium analysis
const result = await agent.run("Analyze proposal with payment...");
console.log("Analysis:", result.analysis);
console.log("Revenue Shared:", result.revenueShared);

// Show governance
console.log("Token holders vote on agent changes!");
```

### 3-Minute Demo

1. **Show Smart Contract** (30s)
   - Display on Fraxscan
   - Show revenue distribution function
   - Highlight capability unlocking

2. **Run Agent** (90s)
   - Start agent
   - Show payment verification
   - Display premium analysis
   - Show revenue deposit transaction

3. **Demonstrate Governance** (60s)
   - Create proposal
   - Cast vote
   - Show community control

---

## 🔗 Resources

- **IQ AI**: https://iqai.com
- **ATP Docs**: https://iq.wiki/wiki/agent-tokenization-platform-atp
- **Fraxtal**: https://docs.frax.com
- **ADK-TS**: https://adk.iqai.com/docs

---

## 🚀 Next Steps

1. **Deploy**: Get your token live on Fraxtal
2. **Launch**: Start providing premium services
3. **Market**: Register on ATP marketplace
4. **Grow**: Build token holder community
5. **Iterate**: Add features via governance

---

## 💬 Need Help?

- **Documentation**: Check `docs/` directory
- **Examples**: See `src/adk-agents/examples/`
- **GitHub**: Open an issue
- **Community**: Join Discord

---

**Ready to revolutionize DAO governance with ATP? Let's go! 🚀**

---

*Built for ADK-TS Agents Hackathon 2025*

