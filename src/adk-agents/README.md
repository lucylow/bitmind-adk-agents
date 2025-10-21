# DAO Governance Co-pilot

> A sophisticated multi-agent system built with ADK-TS that helps DAO members navigate governance by analyzing proposals, providing voting recommendations, and automating routine governance tasks.

## 🎯 Overview

The DAO Governance Co-pilot is an intelligent AI agent system that leverages the ADK-TS framework to provide comprehensive analysis and recommendations for DAO governance activities. It combines multiple specialized agents with custom MCP (Model Context Protocol) servers to deliver real-time insights on proposals, treasury health, and voting strategies.

### Key Features

- **🤖 Multi-Agent Architecture**: Specialized agents for proposal analysis, voting strategy, and treasury monitoring
- **🔗 Web3 Integration**: Direct blockchain integration via ethers.js and The Graph
- **📊 MCP Servers**: Custom Model Context Protocol servers for blockchain data, governance platforms, and risk assessment
- **⚡ Real-time Analysis**: Live data from Snapshot, Tally, and on-chain protocols
- **🛡️ Comprehensive Security**: Built-in guardrails, risk assessment, and approval workflows
- **📈 Historical Context**: Comparison with past proposals for informed decision-making
- **🎯 Personalized Recommendations**: Tailored to individual user risk tolerance and preferences
- **📝 Complete Audit Trail**: Full logging of all agent actions and decisions

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DAO Governance Co-pilot                  │
├─────────────────────────────────────────────────────────────┤
│  Core Agents                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Proposal    │  │ Voting      │  │ Treasury Monitoring │  │
│  │ Analyst     │  │ Strategist  │  │ Agent               │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  MCP Servers (Model Context Protocol)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Blockchain  │  │ Governance  │  │ Risk Assessment     │  │
│  │ Data MCP    │  │ Platform MCP│  │ MCP                 │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  External Integrations                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Snapshot    │  │ Tally       │  │ The Graph           │  │
│  │ API         │  │ API         │  │ Subgraphs           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
src/adk-agents/
├── agents/                          # Core AI agents
│   ├── proposal-analyst.agent.ts   # Analyzes proposals
│   ├── voting-strategist.agent.ts  # Generates voting recommendations
│   ├── treasury-monitor.agent.ts   # Monitors treasury health
│   └── manager-orchestrator.ts     # Coordinates agent workflows
│
├── mcp-servers/                     # Model Context Protocol servers
│   ├── blockchain-data/            # On-chain data access
│   │   └── server.ts
│   ├── governance-platforms/       # Snapshot, Tally integration
│   │   └── server.ts
│   ├── risk-assessment/            # Risk analysis engine
│   │   └── server.ts
│   └── index.ts
│
├── tools/                           # Agent tools
│   ├── dao-tools.ts                # Basic DAO operations
│   ├── enhanced-dao-tools.ts       # Web3-integrated tools
│   └── guardrails.ts               # Safety and validation
│
├── workflows/                       # Multi-agent workflows
│   └── governance-workflow.ts      # Main governance workflow
│
├── config/                          # Configuration
│   └── mcp-config.ts               # MCP server configuration
│
├── audit/                           # Audit logging
│   └── audit-schema.ts             # Audit trail schema
│
├── demo/                            # Demo scripts
│   └── full-demo.ts                # Complete system demo
│
├── tool-registry.ts                # Tool metadata registry
├── guardrail-manager.ts            # Guardrail coordination
└── index.ts                        # Main entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- TypeScript 5.x

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp env.adk.template .env.local
   # Edit .env.local with your API keys and configuration
   ```

3. **Run the demo**:
   ```bash
   npm run adk:demo
   ```

### Environment Configuration

Key environment variables:

```bash
# Blockchain RPC
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# The Graph
GRAPH_ENDPOINT=https://api.thegraph.com/subgraphs/name/graphprotocol/compound-governance

# Governance Platforms
SNAPSHOT_HUB=https://hub.snapshot.org/graphql
TALLY_API_KEY=your_tally_api_key

# AI/LLM (optional)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## 💻 Usage Examples

### Single Proposal Analysis

```typescript
import { GovernanceWorkflow } from './workflows/governance-workflow';

const workflow = new GovernanceWorkflow();

const result = await workflow.execute({
  proposalId: 'proposal-123',
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
```

### Multi-DAO Monitoring

```typescript
import { MultiDAOMonitoringWorkflow } from './workflows/governance-workflow';

const monitor = new MultiDAOMonitoringWorkflow();

const results = await monitor.monitor([
  '0xc0Da02939E1441F497fd74F78cE7Decb17B66529', // Compound
  '0xEC568fffba86c094cf06b22134B23074DFE2252c', // Aave
  '0x408ED6354d4973f66138C91495F2f2FCbd8724C3', // Uniswap
]);

results.forEach(result => {
  console.log(`DAO: ${result.daoAddress}`);
  console.log(`Treasury: $${result.treasuryStatus.totalValue.toLocaleString()}`);
  console.log(`Health: ${result.treasuryStatus.healthScore}`);
});
```

### Using MCP Servers Directly

```typescript
import { mcpServers } from './tools/enhanced-dao-tools';

// Fetch proposal data
const proposal = await mcpServers.blockchainData.getProposalData('proposal-123');

// Get treasury balance
const treasury = await mcpServers.blockchainData.getTreasuryBalance('0xDAOAddress');

// Assess risk
const risk = await mcpServers.riskAssessment.assessProposalRisk({
  id: 'proposal-123',
  title: 'Treasury Allocation',
  description: 'Proposal to allocate funds...',
});

// Fetch from Snapshot
const snapshotProposals = await mcpServers.governancePlatform.getSnapshotProposals('compound.eth');
```

## 🧩 Core Components

### Agents

1. **ProposalAnalystAgent**: Analyzes DAO proposals for financial impact, security risks, and key considerations
2. **VotingStrategistAgent**: Generates personalized voting recommendations based on user preferences and risk tolerance
3. **TreasuryMonitorAgent**: Monitors treasury health, diversification, and alerts on concerning patterns
4. **ManagerOrchestrator**: Coordinates multi-agent workflows and manages approval gates

### MCP Servers

1. **BlockchainDataMCPServer**: 
   - Fetches on-chain proposal data via The Graph
   - Retrieves real-time treasury balances
   - Calculates voting power

2. **GovernancePlatformMCPServer**:
   - Integrates with Snapshot for off-chain voting
   - Connects to Tally for governance data
   - Aggregates proposals across platforms

3. **RiskAssessmentMCPServer**:
   - Analyzes financial risks
   - Assesses security concerns
   - Compares with historical proposals
   - Generates risk scores and recommendations

### Workflows

- **GovernanceWorkflow**: Complete proposal analysis pipeline
- **MultiDAOMonitoringWorkflow**: Batch treasury monitoring
- **BatchProposalAnalysisWorkflow**: Parallel proposal processing

## 🛡️ Security & Guardrails

The system includes multiple layers of security:

1. **Input Validation**: Relevance and safety classifiers
2. **Confidence Gates**: Requires approval for low-confidence recommendations
3. **Risk Assessment**: Multi-dimensional risk scoring
4. **PII Sanitization**: Automatic redaction of sensitive data
5. **Audit Logging**: Complete trail of all agent actions
6. **Approval Workflow**: Human-in-the-loop for high-risk operations

Example approval trigger:
```typescript
// Approval required if:
// - Confidence < 70%
// - Risk level is HIGH or CRITICAL
// - Treasury impact > 15%
// - High security concerns
```

## 📊 Audit Trail

All agent operations are logged:

```typescript
import { auditLogger } from './audit/audit-schema';

// View all logs
const logs = auditLogger.getLogs();

// Filter by agent
const proposalLogs = auditLogger.getLogs({ agentId: 'proposal-analyst-001' });

// Get specific log
const log = auditLogger.getLog('audit-123456');
```

Audit log structure:
- Agent ID and name
- Action type (TOOL_CALL, AGENT_RUN, APPROVAL, VOTE_EXECUTION)
- Inputs and outputs
- Confidence scores
- Risk levels
- Status (SUCCESS, FAILED, PENDING_APPROVAL)
- Timestamps

## 🎯 Supported DAOs

The system supports any DAO with:
- OpenZeppelin Governor contracts
- Snapshot spaces
- Tally integration
- The Graph subgraphs

Popular DAOs:
- Compound
- Aave
- Uniswap
- ENS
- Gitcoin
- And many more...

## 🔧 Extending the System

### Adding a New Agent

```typescript
import { z } from 'zod';
import { auditLogger } from './audit/audit-schema';

export class CustomAgent {
  private agentId = 'custom-agent-001';
  private agentName = 'CustomAgent';

  async execute(input: any): Promise<any> {
    try {
      // Your agent logic here
      const result = await this.performAnalysis(input);

      // Log the operation
      auditLogger.log({
        agentId: this.agentId,
        agentName: this.agentName,
        actionType: 'AGENT_RUN',
        inputs: input,
        outputs: result,
        modelVersion: '1.0.0',
        status: 'SUCCESS',
      });

      return result;
    } catch (error) {
      auditLogger.log({
        agentId: this.agentId,
        agentName: this.agentName,
        actionType: 'AGENT_RUN',
        inputs: input,
        modelVersion: '1.0.0',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async performAnalysis(input: any) {
    // Implementation
  }
}
```

### Adding a New MCP Server

```typescript
export class CustomMCPServer {
  constructor(config: CustomConfig) {
    // Initialize
  }

  async fetchData(params: any): Promise<any> {
    // Fetch from external source
    // Apply caching and retry logic
    // Return structured data
  }
}
```

## 📈 Performance

- **Parallel Agent Execution**: Multiple agents run simultaneously for efficiency
- **MCP Caching**: Configurable caching layer (default 5 minutes TTL)
- **Batch Processing**: Analyze multiple proposals in parallel
- **Retry Logic**: Automatic retries with exponential backoff

Typical execution times:
- Single proposal analysis: 2-5 seconds
- Multi-DAO monitoring: 5-10 seconds
- Batch proposal analysis (10 proposals): 10-15 seconds

## 🤝 Contributing

We welcome contributions! Areas of interest:
- Additional governance platform integrations
- Enhanced risk assessment models
- ML-based proposal similarity
- Alternative LLM integrations
- Frontend UI components

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with:
- [ADK-TS](https://github.com/iqai/adk-ts) - Agent Development Kit
- [ethers.js](https://ethers.org/) - Ethereum library
- [The Graph](https://thegraph.com/) - Blockchain indexing
- [Snapshot](https://snapshot.org/) - Off-chain voting
- [Tally](https://tally.xyz/) - On-chain governance

## 📞 Support

- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: [View full docs](./docs/)
- Discord: [Join our community](#)

---

**Built with ❤️ by the BitMind Team for the IQ AI Hackathon**
