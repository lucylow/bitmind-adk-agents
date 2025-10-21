# DAO Governance Co-pilot: Complete ADK-TS Implementation Guide

## 🎯 Overview

This is a complete implementation of a DAO Governance Co-pilot using ADK-TS (AI Development Kit for TypeScript). The system features a multi-agent architecture with specialized agents for proposal analysis, voting strategy, and treasury monitoring.

## 🏗️ Project Structure

```
src/
├── agents/
│   ├── proposal-analyst.agent.ts    # Deep proposal analysis
│   ├── voting-strategist.agent.ts   # Voting recommendations
│   ├── treasury-monitor.agent.ts    # Treasury health monitoring
│   └── dao-agent.ts                 # Main orchestrator agent
├── tools/
│   ├── blockchain-tools.ts          # Blockchain interaction tools
│   ├── governance-tools.ts          # Governance analysis tools
│   └── wallet-tools.ts              # Web3 wallet tools
├── workflows/
│   └── dao-governance.workflow.ts   # Multi-agent workflow
├── types/
│   └── dao-types.ts                 # TypeScript type definitions
└── dao-index.ts                     # Main entry point

demo/
└── demo-script.ts                   # Hackathon demo script
```

## 📋 Core Components

### 1. Type Definitions (`src/types/dao-types.ts`)

Defines the core data structures:
- **ProposalSchema**: DAO proposal structure with voting data
- **VotingRecommendationSchema**: AI-generated voting recommendations
- **TreasuryAnalysisSchema**: Treasury health assessments

### 2. Tools

#### Wallet Tools (`src/tools/wallet-tools.ts`)
- `connectWalletTool`: Connect to MetaMask/Web3 wallet
- `getWalletBalanceTool`: Retrieve wallet balance

#### Blockchain Tools (`src/tools/blockchain-tools.ts`)
- `fetchProposalTool`: Fetch proposal details from governance contracts
- `getVotingPowerTool`: Check user's voting power
- `executeVoteTool`: Submit votes on proposals

#### Governance Tools (`src/tools/governance-tools.ts`)
- `analyzeFinancialImpactTool`: Analyze treasury impact
- `checkProposalSimilarityTool`: Compare with historical proposals

### 3. Specialized Agents

#### Proposal Analyst Agent
- Deep analysis of DAO proposals
- Risk assessment and strategic alignment
- Financial impact evaluation
- Historical comparison

#### Voting Strategist Agent
- Personalized voting recommendations
- User preference analysis
- Confidence scoring
- Risk-reward evaluation

#### Treasury Monitor Agent
- Treasury health monitoring
- Financial sustainability assessment
- Risk level evaluation
- Liquidity analysis

### 4. Multi-Agent Workflow

The `DAOGovernanceWorkflow` orchestrates multiple agents in sequence:
1. **Proposal Analyst**: Analyzes proposal content
2. **Treasury Monitor**: Evaluates financial impact
3. **Voting Strategist**: Provides voting recommendation

## 🚀 Getting Started

### Prerequisites

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Configuration

Create a `.env` file:

```bash
# Required: Gemini API Key for ADK-TS
GOOGLE_API_KEY=your_gemini_api_key_here

# Optional: Other AI providers
# OPENAI_API_KEY=your_openai_key
# ANTHROPIC_API_KEY=your_anthropic_key

# Blockchain Configuration (optional for production)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id
```

### Running the Demo

```bash
# Run the main DAO demo
npm run dao:demo

# Run the hackathon demo script
npm run dao:demo-script

# Quick analysis only
npm run dao:quick
```

## 🎯 Usage Examples

### Example 1: Quick Proposal Analysis

```typescript
import { quickAnalysisAgent } from "./src/dao-index";

const result = await quickAnalysisAgent.run(
  "Analyze a treasury diversification proposal"
);
console.log(result.content);
```

### Example 2: Comprehensive Workflow

```typescript
import { governanceWorkflow } from "./src/dao-index";

const analysis = await governanceWorkflow.analyzeProposalAndVote(
  "prop-2024-001",
  { riskTolerance: "medium", focus: "treasury-management" }
);

console.log("Analysis:", analysis.analysis);
console.log("Wallet Connected:", analysis.walletConnected);
```

### Example 3: Interactive Session

```typescript
import { rootAgent } from "./src/dao-index";

const response = await rootAgent.run(
  "What factors should I consider when voting on DAO proposals?"
);

console.log(response.content);
```

## 🔧 Key Features

### 1. Multi-Agent Coordination
- Sequential agent execution for comprehensive analysis
- Specialized roles for different aspects of governance
- Coordinated decision-making process

### 2. Blockchain Integration
- Web3 wallet connectivity (MetaMask)
- Smart contract interaction capabilities
- Real-time blockchain data fetching

### 3. AI-Powered Analysis
- Natural language understanding of proposals
- Risk assessment and opportunity identification
- Personalized recommendations based on user preferences

### 4. Type Safety
- Full TypeScript implementation
- Zod schema validation
- Type-safe tool definitions

## 📊 Architecture Patterns

### Tool Definition Pattern

```typescript
import { tool } from "@iqai/adk";
import { z } from "zod";

export const myTool = tool({
  description: "What this tool does",
  input: z.object({
    param: z.string()
  }),
  execute: async ({ param }) => {
    // Implementation
    return result;
  }
});
```

### Agent Creation Pattern

```typescript
import { AgentBuilder } from "@iqai/adk";

export const createMyAgent = () => {
  return AgentBuilder
    .create("agent-name")
    .withModel("gemini-2.0-flash-exp")
    .withDescription("Agent description")
    .withInstruction(`System instructions...`)
    .withTools([tool1, tool2])
    .build();
};
```

### Workflow Pattern

```typescript
export class MyWorkflow {
  async executeWorkflow(input: string) {
    const agent1 = createAgent1();
    const agent2 = createAgent2();
    
    const workflow = AgentBuilder
      .create("orchestrator")
      .asSequential([agent1, agent2])
      .withInstruction(`Workflow instructions`)
      .build();
    
    return await workflow.run(input);
  }
}
```

## 🎓 Learning Resources

### ADK-TS Documentation
- [ADK-TS Official Docs](https://docs.iq.ai/adk)
- [Tool Creation Guide](https://docs.iq.ai/adk/tools)
- [Multi-Agent Workflows](https://docs.iq.ai/adk/workflows)

### Web3 Integration
- [Ethers.js Documentation](https://docs.ethers.org/)
- [MetaMask Integration](https://docs.metamask.io/)

## 🔍 Development Tips

### 1. Testing Agents

```bash
# Test individual agents
npm run adk:proposal-analyst
npm run adk:voting-strategist
npm run adk:treasury-monitor
```

### 2. Debugging

Enable verbose logging:
```typescript
const agent = AgentBuilder
  .create("my-agent")
  .withModel("gemini-2.0-flash-exp")
  .withDescription("Description")
  .build();

// The agent will log execution details
```

### 3. Custom Tools

Add custom tools to agents:
```typescript
import { tool } from "@iqai/adk";

const customTool = tool({
  description: "My custom tool",
  input: z.object({ /* ... */ }),
  execute: async (input) => { /* ... */ }
});

const agent = createAgent()
  .withTools([customTool])
  .build();
```

## 🚀 Deployment

### Production Considerations

1. **API Keys**: Use environment variables for all sensitive keys
2. **Rate Limiting**: Implement rate limiting for blockchain calls
3. **Error Handling**: Add comprehensive error handling
4. **Monitoring**: Set up logging and monitoring
5. **Testing**: Write unit tests for tools and agents

### Deployment Options

- **Vercel**: Deploy as Next.js application
- **AWS Lambda**: Serverless deployment
- **Docker**: Containerized deployment
- **Self-hosted**: Node.js server

## 📝 Best Practices

### 1. Agent Instructions
- Be specific and clear in agent instructions
- Define expected output format
- Include examples when helpful

### 2. Tool Design
- Keep tools focused on single responsibilities
- Validate inputs with Zod schemas
- Return structured, predictable outputs

### 3. Workflow Design
- Chain agents logically (analysis → decision → action)
- Pass context between agents
- Handle failures gracefully

### 4. Type Safety
- Use TypeScript for all code
- Define clear interfaces
- Validate runtime data with Zod

## 🎯 Hackathon Features

This implementation demonstrates:

✅ **Multi-agent coordination** with ADK-TS  
✅ **Blockchain tool integration** with Web3  
✅ **Specialized agent roles** for governance  
✅ **Real-world utility** for DAO operations  
✅ **Type-safe architecture** with TypeScript  
✅ **Comprehensive tooling** for analysis  
✅ **Production-ready patterns** and structure  

## 🤝 Contributing

This is a hackathon project demonstrating ADK-TS capabilities. To extend:

1. Add more specialized agents
2. Integrate additional blockchain networks
3. Enhance analysis algorithms
4. Add more governance tools
5. Improve UI/UX integration

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with [ADK-TS](https://iq.ai/adk) by IQ.AI
- Blockchain integration via [Ethers.js](https://ethers.org/)
- Type validation with [Zod](https://zod.dev/)

---

**For Hackathon Judges**: This implementation showcases advanced ADK-TS patterns including multi-agent workflows, blockchain tool integration, and real-world DAO governance utility. The modular architecture demonstrates production-ready code organization and best practices.

