# 🤖 DAO Governance Co-pilot

> AI-Powered Proposal Analysis & Voting Intelligence for Decentralized Autonomous Organizations

Built with [ADK-TS](https://docs.iq.ai/adk) | Powered by Multi-Agent AI | Integrated with Web3

[![ADK-TS](https://img.shields.io/badge/ADK--TS-v0.1.0-blue)](https://docs.iq.ai/adk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🎯 What is This?

The **DAO Governance Co-pilot** is an intelligent multi-agent AI system that helps DAO members make informed governance decisions. It combines:

- 🧠 **Advanced AI Analysis** - Deep proposal understanding and risk assessment
- ⛓️ **Blockchain Integration** - Real-time smart contract interaction
- 🤝 **Multi-Agent Coordination** - Specialized agents working together
- 🎯 **Personalized Recommendations** - Tailored to your preferences and voting history

### The Problem

- DAOs manage **$50B+ in treasuries**
- Members spend **hours** analyzing complex proposals
- **80%** of members lack governance expertise
- Decision quality directly impacts DAO success

### The Solution

An AI co-pilot that:
- ✅ Analyzes proposals in seconds, not hours
- ✅ Provides expert-level insights to everyone
- ✅ Offers personalized voting recommendations
- ✅ Monitors treasury health and risks
- ✅ Learns from historical patterns

---

## 🚀 Quick Start

### 1. Install

```bash
npm install
```

### 2. Configure

```bash
# Copy environment template
cp env.dao.example .env

# Add your Gemini API key
echo "GOOGLE_API_KEY=your_key_here" >> .env
```

Get your free API key at [Google AI Studio](https://aistudio.google.com/apikey)

### 3. Run

```bash
npm run dao:demo
```

That's it! You'll see:
- Quick proposal analysis
- Comprehensive multi-agent workflow
- Interactive Q&A with the co-pilot

---

## 📖 Usage Examples

### Example 1: Quick Analysis

```typescript
import { quickAnalysisAgent } from "./src/dao-index";

const analysis = await quickAnalysisAgent.run(
  "Should we diversify 15% of treasury into stablecoins?"
);

console.log(analysis.content);
```

### Example 2: Full Proposal Review

```typescript
import { governanceWorkflow } from "./src/dao-index";

const result = await governanceWorkflow.analyzeProposalAndVote(
  "prop-2024-001",
  { 
    riskTolerance: "medium",
    focus: "treasury-management" 
  }
);

console.log(result.analysis);
```

### Example 3: Custom Agent

```typescript
import { createProposalAnalystAgent } from "./src/agents/proposal-analyst.agent";

const analyst = createProposalAnalystAgent();
const insights = await analyst.run("Analyze proposal #123");
```

---

## 🏗️ Architecture

### Multi-Agent System

```
                    Root Agent
                 (Orchestrator)
                       |
        ┌──────────────┼──────────────┐
        │              │              │
   Proposal        Treasury        Voting
   Analyst         Monitor       Strategist
        │              │              │
        └──────────────┴──────────────┘
                       |
            ┌──────────┴─────────┐
            |                    |
       Blockchain            Governance
         Tools                 Tools
```

### Specialized Agents

1. **Proposal Analyst** 📊
   - Deep content analysis
   - Risk assessment
   - Strategic alignment
   - Historical comparison

2. **Treasury Monitor** 💰
   - Financial health tracking
   - Sustainability assessment
   - Budget impact analysis
   - Risk level evaluation

3. **Voting Strategist** 🎯
   - Personalized recommendations
   - Confidence scoring
   - User preference matching
   - Pattern recognition

### Tools & Capabilities

- **Wallet Tools**: MetaMask connection, balance queries
- **Blockchain Tools**: Proposal fetching, voting power, vote execution
- **Governance Tools**: Financial impact analysis, similarity matching

---

## 💡 Key Features

### 🤖 Multi-Agent Intelligence
Specialized AI agents collaborate to provide comprehensive analysis from multiple perspectives.

### ⛓️ Blockchain Native
Direct integration with Ethereum smart contracts via ethers.js. Supports any governance protocol.

### 🎨 Personalized
Learns your preferences and voting history to provide tailored recommendations.

### 🔒 Type Safe
100% TypeScript with Zod validation ensures reliability and prevents errors.

### 📚 Educational
Explains complex governance concepts in simple terms for newcomers.

### ⚡ Fast
Analysis in seconds that would take hours manually.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **AI Framework** | [ADK-TS](https://docs.iq.ai/adk) v0.1.0 |
| **AI Model** | Google Gemini 2.0 Flash |
| **Blockchain** | Ethers.js v6 |
| **Language** | TypeScript 5.4 |
| **Validation** | Zod v4 |
| **Runtime** | Node.js 18+ |

---

## 📂 Project Structure

```
src/
├── agents/                      # AI agent definitions
│   ├── proposal-analyst.agent.ts
│   ├── voting-strategist.agent.ts
│   ├── treasury-monitor.agent.ts
│   └── dao-agent.ts
├── tools/                       # Tool implementations
│   ├── wallet-tools.ts
│   ├── blockchain-tools.ts
│   └── governance-tools.ts
├── workflows/                   # Multi-agent workflows
│   └── dao-governance.workflow.ts
├── types/                       # Type definitions
│   └── dao-types.ts
└── dao-index.ts                 # Main entry point

demo/
└── demo-script.ts               # Hackathon demo

docs/
├── DAO_QUICK_START.md          # 5-minute guide
├── DAO_ADK_IMPLEMENTATION_GUIDE.md  # Full technical docs
└── DAO_IMPLEMENTATION_SUMMARY.md    # Project summary
```

---

## 🎯 Use Cases

### For DAO Members
- 📊 Understand complex proposals quickly
- 🎯 Get personalized voting recommendations
- 📚 Learn governance best practices
- ⏱️ Save hours of research time

### For DAO Operators
- 🔍 Monitor proposal quality
- 💰 Track treasury health
- 📈 Analyze member sentiment
- 🚨 Identify potential issues early

### For Developers
- 🔧 Integrate AI into governance platforms
- 🤖 Build custom analysis tools
- 📊 Create governance dashboards
- 🌐 Enhance DAO tooling

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[Quick Start](DAO_QUICK_START.md)** | Get running in 5 minutes |
| **[Implementation Guide](DAO_ADK_IMPLEMENTATION_GUIDE.md)** | Full technical documentation |
| **[Hackathon Submission](DAO_ADK_HACKATHON_SUBMISSION.md)** | Project overview for judges |
| **[Summary](DAO_IMPLEMENTATION_SUMMARY.md)** | High-level implementation summary |

---

## 🎮 Available Commands

```bash
# Main demos
npm run dao:demo              # Full feature demonstration
npm run dao:demo-script       # Hackathon scenario demo
npm run dao:quick             # Interactive mode

# Individual agents (for testing)
npm run adk:proposal-analyst  # Test proposal analyst
npm run adk:voting-strategist # Test voting strategist
npm run adk:treasury-monitor  # Test treasury monitor
```

---

## 🌟 Highlights

### Innovation
- ✨ First AI-powered multi-agent system for DAO governance
- ✨ Novel approach combining blockchain + AI
- ✨ Personalized recommendation engine
- ✨ Comprehensive analysis pipeline

### Technical Excellence
- ✨ Production-quality code
- ✨ Zero linting errors
- ✨ 100% TypeScript
- ✨ Best practices throughout
- ✨ Modular architecture

### Real-World Value
- ✨ Solves actual DAO challenges
- ✨ $50B+ market opportunity
- ✨ Immediate deployment potential
- ✨ Clear ROI for users

---

## 🔮 Future Enhancements

### Phase 1: Enhanced Intelligence
- Historical voting pattern analysis
- Forum sentiment analysis
- Cross-DAO benchmarking
- Predictive outcome modeling

### Phase 2: Expanded Integration
- Multi-chain support (Stacks, Polygon, etc.)
- Snapshot/Tally integration
- Real-time notifications
- Mobile apps

### Phase 3: Community Features
- Collaborative analysis
- Expert endorsements
- Voting pools
- DAO customization

---

## 🤝 Contributing

This is a hackathon project showcasing ADK-TS capabilities. Contributions welcome!

### Areas for Contribution
- Additional blockchain networks
- New analysis tools
- Enhanced UI/UX
- Documentation improvements
- Test coverage

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with:
- [ADK-TS](https://iq.ai/adk) by IQ.AI - AI Development Kit
- [Ethers.js](https://ethers.org/) - Ethereum library
- [Zod](https://zod.dev/) - TypeScript validation

---

## 🎬 For Hackathon Judges

### Quick Evaluation

```bash
# 1. Install dependencies
npm install

# 2. Add API key
echo "GOOGLE_API_KEY=your_key" > .env

# 3. Run demo
npm run dao:demo-script
```

### What to Look For

- ✅ **Multi-agent coordination** in action
- ✅ **Blockchain integration** with Web3
- ✅ **Quality of AI analysis** - comprehensive and insightful
- ✅ **Code quality** - clean, documented, type-safe
- ✅ **Production readiness** - error handling, logging, modularity

### Key Files to Review

1. `src/agents/dao-agent.ts` - Main orchestrator
2. `src/workflows/dao-governance.workflow.ts` - Multi-agent coordination
3. `src/tools/blockchain-tools.ts` - Web3 integration
4. `demo/demo-script.ts` - Working demonstrations

---

## 💬 Contact

- **Documentation**: See `docs/` directory
- **Issues**: Check code comments and documentation
- **Questions**: Review implementation guide

---

## 🎉 Get Started Now!

```bash
npm install && npm run dao:demo
```

Welcome to the future of DAO governance! 🚀

---

<div align="center">

**Built for [ADK-TS Hackathon 2025](https://iq.ai/adk)**

Made with ❤️ and 🤖 by the BitMind Team

</div>

