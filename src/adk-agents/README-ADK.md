# BitMind DAO Governance Co-pilot

Built with the [IQ AI ADK-TS Framework](https://github.com/iqai/adk-ts)

## 🎯 Overview

The DAO Governance Co-pilot is an AI-powered assistant that helps DAO members make informed governance decisions through:

- **Proposal Analysis**: Comprehensive analysis of DAO proposals including financial impact, security risks, and strategic alignment
- **Treasury Monitoring**: Real-time tracking of DAO treasury health, diversification, and sustainability
- **Voting Recommendations**: Personalized voting recommendations based on user preferences and risk tolerance
- **Multi-Agent Architecture**: Specialized agents working together for comprehensive governance support

## 🏗️ Architecture

### Specialized Agents

1. **Proposal Analyst Agent** (`agents/proposal-analyst-adk.agent.ts`)
   - Analyzes proposals for financial impact and risks
   - Provides detailed assessments with structured recommendations
   - Uses: `fetchProposalTool`, `analyzeFinancialImpactTool`, `assessSecurityRiskTool`

2. **Voting Strategist Agent** (`agents/voting-strategist-adk.agent.ts`)
   - Generates personalized voting recommendations
   - Considers user preferences and risk tolerance
   - Advises on delegation and timing strategies
   - Uses: `getVotingPowerTool`, `getHistoricalProposalsTool`

3. **Treasury Monitor Agent** (`agents/treasury-monitor-adk.agent.ts`)
   - Monitors treasury health and composition
   - Calculates sustainability metrics (runway, burn rate)
   - Identifies concentration risks
   - Uses: `getTreasuryDataTool`, `getHistoricalProposalsTool`

### Workflows

**DAO Governance Workflow** (`workflows/dao-governance-adk.workflow.ts`)
- Orchestrates all three agents for comprehensive analysis
- Provides full governance flow: Analysis → Treasury Check → Voting Recommendation
- Supports quick analysis and proposal comparison

### Tools

**DAO Tools** (`tools/dao-tools-adk.ts`)
- `fetchProposalTool`: Fetch proposal details from blockchain
- `analyzeFinancialImpactTool`: Analyze financial implications
- `assessSecurityRiskTool`: Security and risk assessment
- `getTreasuryDataTool`: Fetch treasury data and metrics
- `executeVoteTool`: Execute votes (with user approval)
- `getVotingPowerTool`: Get user's voting power
- `getHistoricalProposalsTool`: Historical proposal analysis

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# The ADK framework requires these core dependencies:
# - @iqai/adk (core framework)
# - ethers (blockchain interaction)
# - axios (HTTP requests)
# - zod (schema validation)
```

### Configuration

1. **Set up environment variables** (`.env`):
```bash
# API Keys
GEMINI_API_KEY=your_gemini_api_key
ALCHEMY_API_KEY=your_alchemy_key  # For blockchain RPC

# Optional: The Graph API
THEGRAPH_API_KEY=your_graph_api_key
```

2. **Configure RPC endpoints** in `tools/dao-tools-adk.ts`

### Running the Agent

#### Option 1: ADK CLI (Recommended)

```bash
# Terminal interface
adk run

# Web interface
adk web
```

#### Option 2: Direct Execution

```typescript
import { runGovernanceAnalysis } from './src/adk-agents/main-agent-adk';

const result = await runGovernanceAnalysis(
  'proposal-123',
  '0xDAOAddress',
  {
    riskTolerance: 'MEDIUM',
    address: '0xYourAddress'
  }
);

console.log(result);
```

#### Option 3: Interactive CLI

```bash
npm run adk:cli
```

## 📖 Usage Examples

### Analyze a Proposal

```typescript
import { createProposalAnalystAgent } from './agents/proposal-analyst-adk.agent';

const analyst = createProposalAnalystAgent();
const result = await analyst.run(`
  Analyze proposal prop-123 from DAO 0xABC...
  Focus on financial impact and security risks.
`);

console.log(result.content);
```

### Get Voting Recommendation

```typescript
import { generateVotingRecommendation } from './agents/voting-strategist-adk.agent';

const recommendation = await generateVotingRecommendation(
  'prop-123',
  '0xDAOAddress',
  '0xUserAddress',
  { riskTolerance: 'LOW', strategy: 'CONSERVATIVE' }
);
```

### Check Treasury Health

```typescript
import { analyzeTreasuryHealth } from './agents/treasury-monitor-adk.agent';

const health = await analyzeTreasuryHealth('0xDAOAddress');
console.log(health.content);
```

### Full Governance Flow

```typescript
import { daoGovernanceWorkflow } from './workflows/dao-governance-adk.workflow';

const result = await daoGovernanceWorkflow.runFullGovernanceFlow(
  'prop-123',
  '0xDAOAddress',
  {
    riskTolerance: 'MEDIUM',
    votingStrategy: {
      strategy: 'BALANCED',
      delegateIfBelowThreshold: true,
      votingPowerThreshold: 0.01,
      autoVote: false,
      requiresApproval: true
    },
    address: '0xUserAddress',
    watchedDAOs: ['0xDAOAddress'],
    notificationPreferences: {
      newProposals: true,
      votingDeadlines: true,
      executionResults: true
    }
  }
);

console.log('Analysis:', result.analysis);
console.log('Recommendation:', result.recommendation);
console.log('Treasury Health:', result.treasuryHealth);
```

## 🧪 Testing

Test prompts to try:

1. **Basic Analysis**:
   - "Analyze proposal 123 for Uniswap DAO"
   - "What are the risks in proposal ABC?"

2. **Treasury Questions**:
   - "What's the treasury health for DAO 0x...?"
   - "How much runway does the DAO have?"

3. **Voting Decisions**:
   - "Should I vote for proposal 123?"
   - "Compare proposals A, B, and C"

4. **Educational**:
   - "Explain how delegation works"
   - "What is a governance attack?"

## 🔧 Customization

### Adding New Tools

```typescript
import { tool } from "@iqai/adk";
import { z } from "zod";

export const myCustomTool = tool({
  description: "Description of what the tool does",
  input: z.object({
    param: z.string().describe("Parameter description")
  }),
  execute: async ({ param }) => {
    // Implementation
    return result;
  }
});
```

### Creating Custom Agents

```typescript
import { AgentBuilder } from "@iqai/adk";

export const createCustomAgent = () => {
  return AgentBuilder
    .withModel("gemini-2.0-flash-exp")
    .withTools([myTool1, myTool2])
    .withInstructions("Agent instructions...")
    .build();
};
```

### Modifying Workflows

Edit `workflows/dao-governance-adk.workflow.ts` to:
- Add new analysis steps
- Change agent coordination logic
- Add caching or optimization
- Implement custom parsing logic

## 🔌 Integration with Blockchain

Currently uses mock data. To integrate with real blockchain:

1. **Add ethers.js providers**:
```typescript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
```

2. **Connect to governance contracts**:
```typescript
const governanceContract = new ethers.Contract(
  daoAddress,
  GOVERNANCE_ABI,
  provider
);

const proposal = await governanceContract.proposals(proposalId);
```

3. **Use The Graph for indexing**:
```typescript
const query = `{
  proposals(where: { dao: "${daoAddress}" }) {
    id
    title
    forVotes
    againstVotes
  }
}`;

const response = await axios.post(GRAPH_URL, { query });
```

## 📊 Type Definitions

See `types/dao-types.ts` for all type definitions:
- `DAOProposal`: Proposal data structure
- `ProposalAnalysis`: Analysis output format
- `VotingRecommendation`: Voting recommendation structure
- `TreasuryData`: Treasury health metrics
- `UserPreferences`: User configuration

## 🛡️ Security Considerations

- **Vote Execution**: Always requires explicit user approval
- **Private Keys**: Never handle or request private keys
- **Transaction Signing**: Use user's wallet for signing
- **Rate Limiting**: Implement rate limits for blockchain calls
- **Input Validation**: All inputs validated with Zod schemas

## 🚧 Roadmap

- [ ] Real blockchain integration with ethers.js
- [ ] The Graph integration for historical data
- [ ] MCP Server implementation for real-time data
- [ ] x402 protocol integration for monetization
- [ ] Multi-chain support (Ethereum, Polygon, Arbitrum)
- [ ] Advanced delegation strategies
- [ ] Proposal impact simulations
- [ ] Community sentiment analysis
- [ ] Automated notification system

## 📚 Resources

- [IQ AI ADK-TS Documentation](https://github.com/iqai/adk-ts)
- [ADK CLI Reference](https://github.com/iqai/adk-cli)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [The Graph Documentation](https://thegraph.com/docs/)

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional analysis tools
- More sophisticated risk models
- UI/UX for web interface
- Integration with more DAOs
- Documentation and tutorials

## 📄 License

MIT License - see LICENSE file for details

