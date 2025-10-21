# 🤖 DAO Governance Co-pilot

> **Intelligent Multi-Agent System for DAO Governance** - Built with ADK-TS for the IQ AI Hackathon

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![ADK-TS](https://img.shields.io/badge/ADK--TS-Compatible-green.svg)](#)

---

## 🎯 What is This?

The **DAO Governance Co-pilot** is an AI-powered assistant that helps DAO members make informed governance decisions. It analyzes proposals in seconds, assesses risks, monitors treasury health, and provides personalized voting recommendations.

### The Problem

- ⏱️ DAO proposals require hours of analysis
- 📊 Complex financial implications are hard to understand
- 🔒 Security risks are not obvious to non-technical members
- 📉 DAO participation rates are typically <10%

### Our Solution

A multi-agent AI system that:
- ✅ Analyzes proposals in 2-5 seconds
- ✅ Provides multi-dimensional risk assessment
- ✅ Generates personalized voting recommendations
- ✅ Monitors treasury health in real-time
- ✅ Maintains complete transparency via audit logs

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Installation & Demo

```bash
# 1. Install dependencies
npm install

# 2. Run the complete demo
npm run adk:demo
```

**That's it!** The demo will showcase:
- Single proposal analysis
- Multi-DAO treasury monitoring
- Batch proposal processing
- Complete audit trail

### Expected Output

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    DAO GOVERNANCE CO-PILOT DEMO                            ║
║                 Multi-Agent System Built with ADK-TS                       ║
╚════════════════════════════════════════════════════════════════════════════╝

🚀 Starting Governance Workflow workflow-1729517234...
   Proposal: proposal-demo-001
   DAO: 0xc0Da02939E1441F497fd74F78cE7Decb17B66529
   User: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

📊 ANALYSIS RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  PROPOSAL SUMMARY:
   Title: Proposal: Increase Development Fund Allocation
   Status: ACTIVE
   Proposer: 0x742d35Cc...

2️⃣  FINANCIAL IMPACT:
   Estimated Cost: $500,000
   Treasury Impact: 5.00%
   Risk Score: 35.0%

3️⃣  SECURITY ANALYSIS:
   Risk Level: MEDIUM
   Concerns Found: 1

5️⃣  VOTING RECOMMENDATION:
   Recommendation: FOR
   Confidence: 82.5%
   Reasoning:
     1. ✓ Low financial risk detected
     2. ✓ Minimal treasury impact (<5%)
     3. ✓ Low security risk

✨ Analysis completed in 2,347ms
```

---

## 📁 Project Structure

```
bitmind-adk-agents/
├── src/adk-agents/                          # Core DAO Co-pilot System
│   ├── agents/                             # 4 specialized AI agents
│   │   ├── proposal-analyst.agent.ts
│   │   ├── voting-strategist.agent.ts
│   │   ├── treasury-monitor.agent.ts
│   │   └── manager-orchestrator.ts
│   │
│   ├── mcp-servers/                        # 3 custom MCP servers
│   │   ├── blockchain-data/               # On-chain data access
│   │   ├── governance-platforms/          # Snapshot, Tally integration
│   │   └── risk-assessment/               # Multi-dimensional risk analysis
│   │
│   ├── tools/                              # Agent tools
│   │   ├── enhanced-dao-tools.ts          # Web3-integrated tools
│   │   └── guardrails.ts                  # Security guardrails
│   │
│   ├── workflows/                          # Multi-agent workflows
│   │   └── governance-workflow.ts         # Main orchestration
│   │
│   ├── demo/                               # Demo scripts
│   │   └── full-demo.ts                   # Complete system demo
│   │
│   └── README.md                          # Detailed documentation
│
├── DAO_COPILOT_IMPLEMENTATION.md           # Implementation summary
├── HACKATHON_SUBMISSION.md                 # Submission details
└── package.json                            # Dependencies
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DAO Governance Co-pilot                  │
├─────────────────────────────────────────────────────────────┤
│  🤖 Specialized AI Agents                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Proposal    │  │   Voting     │  │    Treasury      │  │
│  │  Analyst     │  │  Strategist  │  │    Monitor       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  📡 MCP Servers (Model Context Protocol)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Blockchain  │  │ Governance   │  │      Risk        │  │
│  │     Data     │  │  Platforms   │  │   Assessment     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  🔗 External Integrations                                   │
│  • The Graph (on-chain data)                                │
│  • Snapshot (off-chain voting)                              │
│  • Tally (governance analytics)                             │
│  • ethers.js (blockchain interaction)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🤖 Multi-Agent Intelligence

**4 Specialized Agents Working Together:**

1. **Proposal Analyst** - Analyzes proposals for financial & security impact
2. **Voting Strategist** - Generates personalized voting recommendations
3. **Treasury Monitor** - Tracks treasury health & alerts on risks
4. **Manager Orchestrator** - Coordinates multi-agent workflows

### 📡 Custom MCP Servers

**3 Model Context Protocol Servers:**

1. **Blockchain Data MCP** - Direct on-chain access via The Graph & ethers.js
2. **Governance Platforms MCP** - Snapshot & Tally integration
3. **Risk Assessment MCP** - Multi-dimensional risk analysis engine

### 🛡️ Security & Guardrails

- ✅ Input validation (relevance + safety classifiers)
- ✅ Confidence-based approval gates
- ✅ PII sanitization
- ✅ Complete audit trail
- ✅ High-risk operation approval system

### 📊 Comprehensive Analysis

**Multi-Dimensional Risk Assessment:**
- Financial risk (treasury impact, cost analysis)
- Security risk (smart contract vulnerabilities)
- Governance risk (parameter changes, centralization)
- Execution risk (complexity, dependencies)

### ⚡ Performance

- **Fast**: 2-5 seconds per proposal analysis
- **Parallel**: Multiple agents execute simultaneously
- **Scalable**: Batch process hundreds of proposals
- **Cached**: Intelligent caching for repeated queries

---

## 💻 Usage Examples

### Analyze a Single Proposal

```typescript
import { GovernanceWorkflow } from './src/adk-agents/workflows/governance-workflow';

const workflow = new GovernanceWorkflow();

const result = await workflow.execute({
  proposalId: 'prop-123',
  daoAddress: '0xc0Da02939E1441F497fd74F78cE7Decb17B66529',
  userContext: {
    address: '0xYourAddress',
    preferences: {
      riskTolerance: 'moderate',
      votingStyle: 'informed',
      priorities: ['security', 'financial-stability'],
    },
  },
  options: {
    includeHistoricalComparison: true,
    includeTreasuryAnalysis: true,
    includeRiskAssessment: true,
    generateVotingRecommendation: true,
  },
});

console.log('Recommendation:', result.votingRecommendation.recommendation);
console.log('Confidence:', result.votingRecommendation.confidence);
console.log('Risk Level:', result.riskProfile.riskLevel);
```

### Monitor Multiple DAOs

```typescript
import { MultiDAOMonitoringWorkflow } from './src/adk-agents/workflows/governance-workflow';

const monitor = new MultiDAOMonitoringWorkflow();

const results = await monitor.monitor([
  '0xCompoundDAO',
  '0xAaveDAO',
  '0xUniswapDAO',
]);

results.forEach(result => {
  console.log(`${result.daoAddress}: $${result.treasuryStatus.totalValue}`);
  console.log(`Health: ${result.treasuryStatus.healthScore * 100}%`);
  console.log(`Alerts: ${result.alerts.join(', ')}`);
});
```

### Use MCP Servers Directly

```typescript
import { mcpServers } from './src/adk-agents/tools/enhanced-dao-tools';

// Fetch from blockchain
const proposal = await mcpServers.blockchainData.getProposalData('prop-123');

// Get treasury data
const treasury = await mcpServers.blockchainData.getTreasuryBalance('0xDAO');

// Assess risks
const risk = await mcpServers.riskAssessment.assessProposalRisk({
  id: 'prop-123',
  title: 'Treasury Allocation',
  description: 'Allocate 500K for development',
});

// Query Snapshot
const proposals = await mcpServers.governancePlatform.getSnapshotProposals('compound.eth');
```

---

## 🎯 Supported DAOs

Works with any DAO using:
- ✅ OpenZeppelin Governor contracts
- ✅ Snapshot spaces
- ✅ Tally integration
- ✅ The Graph subgraphs

**Popular DAOs Supported:**
- Compound
- Aave
- Uniswap
- ENS
- Gitcoin
- MakerDAO
- And many more...

---

## 🔧 Configuration

### Environment Setup

```bash
# Copy template
cp env.adk.template .env.local

# Configure (optional for demo)
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
GRAPH_ENDPOINT=https://api.thegraph.com/subgraphs/name/...
SNAPSHOT_HUB=https://hub.snapshot.org/graphql
TALLY_API_KEY=your_key
```

The system works with mock data by default - no API keys needed for testing!

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| Proposal Analysis Time | 2-5 seconds |
| Multi-DAO Monitoring | 5-10 seconds |
| Batch Processing (10 proposals) | 10-15 seconds |
| Agents | 4 specialized |
| MCP Servers | 3 custom |
| Tools | 20+ Web3-integrated |
| Code Quality | 100% TypeScript |

---

## 🏆 Hackathon Submission

### Tracks

1. **✅ Agent Applications** - Multi-agent system with specialized roles
2. **✅ MCP Expansion** - 3 custom MCP servers for blockchain data
3. **✅ Web3/Blockchain** - Real DAO integration with live data

### Innovation Highlights

- **First Multi-Agent DAO Governance System**
- **MCP for Blockchain Data Access**
- **Multi-Dimensional Risk Framework**
- **Production-Ready Architecture**
- **Complete Transparency & Audit Trail**

### Documentation

- ✅ [Implementation Summary](./DAO_COPILOT_IMPLEMENTATION.md)
- ✅ [Hackathon Submission Details](./HACKATHON_SUBMISSION.md)
- ✅ [Detailed README](./src/adk-agents/README.md)
- ✅ [ADK-TS Integration Guide](./src/adk-agents/ADK_FRAMEWORK_INTEGRATION.md)

---

## 📚 Learn More

### Documentation Files

- **[Main README](./src/adk-agents/README.md)** - Complete technical documentation
- **[Implementation Summary](./DAO_COPILOT_IMPLEMENTATION.md)** - What was built
- **[Hackathon Submission](./HACKATHON_SUBMISSION.md)** - Submission details
- **[ADK Integration](./src/adk-agents/ADK_FRAMEWORK_INTEGRATION.md)** - Framework guide

### Quick Links

- 🚀 [Quick Start](#-quick-start)
- 📁 [Project Structure](#-project-structure)
- 💻 [Usage Examples](#-usage-examples)
- 🏗️ [Architecture](#️-architecture)
- ✨ [Key Features](#-key-features)

---

## 🤝 Contributing

This project was built for the IQ AI Hackathon. Contributions, issues, and feature requests are welcome!

### Development

```bash
# Install dependencies
npm install

# Run demo
npm run adk:demo

# Build
npm run build

# Test
npm test
```

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 🙏 Acknowledgments

Built with:
- [ADK-TS](https://github.com/iqai/adk-ts) - Agent Development Kit
- [ethers.js](https://ethers.org/) - Ethereum library
- [The Graph](https://thegraph.com/) - Blockchain indexing
- [Snapshot](https://snapshot.org/) - Off-chain voting
- [Tally](https://tally.xyz/) - Governance analytics

Special thanks to IQ AI for hosting this hackathon and pushing the boundaries of AI agent development.

---

## 📞 Contact

**Team**: BitMind  
**Built for**: IQ AI Hackathon 2025  
**GitHub**: [Repository](https://github.com/your-repo)  

---

<div align="center">

**Built with ❤️ by the BitMind Team**

[Documentation](./src/adk-agents/README.md) · [Demo](./src/adk-agents/demo/full-demo.ts) · [Report Issue](https://github.com/your-repo/issues)

</div>

