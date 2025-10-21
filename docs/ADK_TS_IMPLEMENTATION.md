# ADK-TS Implementation Guide

## 🎯 Official ADK-TS Framework Integration

This guide explains how the DAO Governance Co-pilot is built using the **official ADK-TS framework** with proper `AgentBuilder`, `tool()`, and `Workflow` patterns.

---

## 📁 Project Structure

```
src/adk-agents/
├── adk-tools/
│   └── dao-tools.ts              # ADK tools with tool() function
├── adk-agents/
│   ├── agent.ts                  # Root agent with AgentBuilder
│   ├── proposal-analyst.ts       # Specialized analyst agent
│   └── voting-strategist.ts      # Specialized strategist agent
├── adk-workflows/
│   └── governance.workflow.ts    # Workflow class for orchestration
├── adk-demo/
│   └── adk-test.ts              # Test script using ADK-TS
├── mcp-servers/                  # Custom MCP servers (backend)
│   ├── blockchain-data/
│   ├── governance-platforms/
│   └── risk-assessment/
└── tools/
    └── enhanced-dao-tools.ts     # Lower-level tools used by MCP
```

---

## 🔧 Implementation Details

### 1. Tools with `tool()` Function

**File**: `src/adk-agents/adk-tools/dao-tools.ts`

Tools are created using the official `tool()` function with Zod schemas:

```typescript
import { tool } from "@iqai/adk";
import { z } from "zod";

export const fetchProposalTool = tool({
  description: "Fetch DAO proposal details from blockchain",
  input: z.object({
    proposalId: z.string().describe("The proposal ID"),
    daoAddress: z.string().optional()
  }),
  execute: async ({ proposalId, daoAddress }) => {
    // Implementation using MCP servers
    const proposalData = await mcpServers.blockchainData.getProposalData(proposalId);
    return {
      id: proposalData.id,
      title: proposalData.title,
      // ... more fields
    };
  }
});
```

**Available Tools**:
- `fetchProposalTool` - Get proposal from blockchain
- `analyzeFinancialImpactTool` - Assess treasury impact
- `assessSecurityRiskTool` - Evaluate security risks
- `getTreasuryStatusTool` - Check treasury health
- `analyzeVotingPatternTool` - Review user's voting history
- `generateRecommendationTool` - Create personalized recommendation

### 2. Agents with `AgentBuilder`

**File**: `src/adk-agents/adk-agents/proposal-analyst.ts`

Agents are built using `AgentBuilder` with model, tools, and instructions:

```typescript
import { AgentBuilder } from "@iqai/adk";

export const createProposalAnalystAgent = () => {
  return AgentBuilder
    .withModel("gemini-2.5-flash") // or "gpt-4", "claude-3-5-sonnet"
    .withTools([
      fetchProposalTool,
      analyzeFinancialImpactTool,
      assessSecurityRiskTool,
      getTreasuryStatusTool
    ])
    .withInstruction(`
      You are a specialized DAO Proposal Analyst.
      
      Your responsibilities:
      - Fetch and analyze proposals
      - Assess financial impact
      - Evaluate security risks
      - Provide objective analysis
      
      Always structure your output with:
      - Executive Summary
      - Financial Impact Assessment
      - Security Risk Analysis
      - Key Considerations
    `)
    .build();
};
```

**Available Agents**:
- `rootAgent` - Main agent for direct interaction
- `createProposalAnalystAgent()` - Specialized proposal analysis
- `createVotingStrategistAgent()` - Personalized recommendations

### 3. Workflows with `Workflow` Class

**File**: `src/adk-agents/adk-workflows/governance.workflow.ts`

Multi-agent coordination using the `Workflow` class:

```typescript
import { Workflow } from "@iqai/adk";

export class DAOGovernanceWorkflow extends Workflow {
  private proposalAnalyst: any;
  private votingStrategist: any;

  constructor() {
    super();
    this.proposalAnalyst = createProposalAnalystAgent();
    this.votingStrategist = createVotingStrategistAgent();
  }

  async processProposal(input: {
    proposalId: string;
    daoAddress: string;
    userAddress: string;
  }) {
    // Step 1: Analyze proposal
    const analysis = await this.proposalAnalyst.run(`
      Analyze proposal ${input.proposalId} for DAO ${input.daoAddress}
    `);

    // Step 2: Generate recommendation
    const recommendation = await this.votingStrategist.run(`
      Based on this analysis: ${analysis.content}
      Generate recommendation for user ${input.userAddress}
    `);

    return { analysis, recommendation };
  }
}
```

---

## 🚀 Usage Examples

### Run ADK CLI Chat

```bash
# Install dependencies
npm install

# Run in terminal
adk run

# Or run web interface
adk web
```

### Use in Code

```typescript
import { analyzeProposal } from './src/adk-agents/adk-workflows/governance.workflow';

// Full analysis with multi-agent workflow
const result = await analyzeProposal({
  proposalId: 'proposal-123',
  daoAddress: '0xc0Da02939E1441F497fd74F78cE7Decb17B66529',
  userAddress: '0xYourAddress',
  userRiskTolerance: 'moderate'
});

console.log('Analysis:', result.analysis.content);
console.log('Recommendation:', result.recommendation.content);
```

### Direct Agent Interaction

```typescript
import { rootAgent } from './src/adk-agents/adk-agents/agent';

// Chat with root agent
const response = await rootAgent.run("Analyze proposal #123");
console.log(response.content);
```

### Quick Summary

```typescript
import { getQuickSummary } from './src/adk-agents/adk-workflows/governance.workflow';

const summary = await getQuickSummary('proposal-123', '0xDAOAddress');
console.log(summary.summary);
```

---

## 🔑 Environment Setup

Create a `.env` file:

```ini
# LLM API Keys (choose one or more)
GOOGLE_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Blockchain Configuration
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
GRAPH_ENDPOINT=https://api.thegraph.com/subgraphs/name/...

# Governance Platforms
SNAPSHOT_HUB=https://hub.snapshot.org/graphql
TALLY_API_KEY=your_tally_key
```

---

## 📊 Architecture Layers

```
┌─────────────────────────────────────────┐
│  ADK-TS Layer (Official Framework)     │
│  • AgentBuilder                         │
│  • tool() function                      │
│  • Workflow class                       │
├─────────────────────────────────────────┤
│  Agent Layer (Our Implementation)      │
│  • Proposal Analyst Agent               │
│  • Voting Strategist Agent              │
│  • Root Agent                           │
├─────────────────────────────────────────┤
│  Tool Layer (ADK Tools)                 │
│  • fetchProposalTool                    │
│  • analyzeFinancialImpactTool           │
│  • assessSecurityRiskTool               │
│  • etc.                                 │
├─────────────────────────────────────────┤
│  MCP Server Layer (Data Access)         │
│  • BlockchainDataMCPServer              │
│  • GovernancePlatformMCPServer          │
│  • RiskAssessmentMCPServer              │
├─────────────────────────────────────────┤
│  Integration Layer (Web3)               │
│  • ethers.js                            │
│  • The Graph queries                    │
│  • Snapshot/Tally APIs                  │
└─────────────────────────────────────────┘
```

---

## ✅ Verification

Test the ADK-TS implementation:

```bash
# Run test script
npm run adk:test

# Or directly
npx tsx src/adk-agents/adk-demo/adk-test.ts
```

Expected output:
- ✅ Full proposal analysis with multi-agent workflow
- ✅ Quick proposal summary
- ✅ Direct agent chat interaction
- ✅ Batch proposal analysis

---

## 🎯 Key Differences

### ADK-TS Implementation vs Custom Implementation

| Aspect | ADK-TS (New) | Custom (Old) |
|--------|-------------|--------------|
| **Agent Creation** | `AgentBuilder.withModel().withTools().build()` | Custom TypeScript classes |
| **Tools** | `tool()` function with Zod | Custom async functions |
| **Workflows** | `Workflow` class | Custom orchestration |
| **LLM Integration** | Built-in via ADK | Manual implementation |
| **CLI** | `adk run` / `adk web` | Custom scripts |

### What Stayed the Same

- ✅ MCP servers (blockchain-data, governance-platforms, risk-assessment)
- ✅ Low-level Web3 tools (enhanced-dao-tools.ts)
- ✅ Business logic and analysis algorithms
- ✅ Audit logging and guardrails

---

## 🚀 Deployment

### Development

```bash
# Terminal chat
adk run

# Web interface
adk web
```

### Production

```bash
# Build agents
npm run build

# Deploy as needed:
# - Docker container
# - Cloud function
# - API endpoint
```

---

## 📝 Best Practices

### Agent Instructions

✅ **DO**:
- Be specific about the agent's role
- Provide clear output format
- List available tools explicitly
- Include examples when helpful

❌ **DON'T**:
- Make instructions too long (>500 words)
- Be vague about responsibilities
- Forget to explain tool usage

### Tool Design

✅ **DO**:
- Use descriptive names
- Validate inputs with Zod
- Handle errors gracefully
- Return structured data

❌ **DON'T**:
- Create overlapping tools
- Return inconsistent formats
- Ignore error cases

### Workflow Patterns

✅ **DO**:
- Break complex tasks into steps
- Use specialized agents
- Log progress clearly
- Handle failures gracefully

❌ **DON'T**:
- Create circular dependencies
- Skip error handling
- Make workflows too deep

---

## 🎓 Learning Path

1. **Start Simple**: Use `rootAgent` directly
2. **Add Tools**: Create one custom tool
3. **Build Agent**: Make a specialized agent
4. **Create Workflow**: Coordinate multiple agents
5. **Deploy**: Use `adk run` or `adk web`

---

## 📚 Resources

- **ADK-TS Docs**: [Official Documentation](#)
- **This Implementation**: `/src/adk-agents/adk-agents/`
- **Tools**: `/src/adk-agents/adk-tools/`
- **Workflows**: `/src/adk-agents/adk-workflows/`
- **Test Script**: `/src/adk-agents/adk-demo/adk-test.ts`

---

## ✨ Summary

The DAO Governance Co-pilot now uses **official ADK-TS patterns**:

- ✅ **AgentBuilder** for creating agents
- ✅ **tool()** for defining tools with Zod
- ✅ **Workflow** class for multi-agent coordination
- ✅ **Real MCP servers** for blockchain data
- ✅ **Production-ready** architecture

**Ready for the IQ AI Hackathon!** 🚀

---

**Status**: ✅ **ADK-TS IMPLEMENTATION COMPLETE**  
**Framework Version**: ADK-TS (Official)  
**Last Updated**: October 21, 2025

