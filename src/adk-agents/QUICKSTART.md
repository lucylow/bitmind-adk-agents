# ADK-TS Quick Start Guide

## 🚀 Getting Started in 5 Minutes

This guide will get you up and running with the BitMind DAO Governance Co-pilot ADK-TS agents.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Basic TypeScript knowledge

## Step 1: Installation

```bash
# Install dependencies
npm install

# Verify installation
npm run adk:test
```

## Step 2: Run the Demo

```bash
# Run the full demo
npm run adk:demo
```

You should see output like:

```
╔════════════════════════════════════════════════════════════════╗
║   BitMind DAO Governance Co-pilot - ADK-TS Implementation     ║
║   Multi-Agent System for Blockchain Governance                ║
╚════════════════════════════════════════════════════════════════╝

📦 Initializing DAO Co-pilot...
🚀 Starting Governance Data MCP Server on port 3001
✅ DAO Co-pilot System initialized

═══════════════════════════════════════════════════════════════
DEMO: Analyzing Proposal with Multi-Agent Workflow
═══════════════════════════════════════════════════════════════

🚀 Starting DAO Governance Workflow governance-1729508400000

📊 Step 1: Gathering proposal and treasury data in parallel...
  → Analyzing proposal...
  → Monitoring treasury health...
✅ Step 1 completed

🎯 Step 2: Generating personalized voting recommendation...
✅ Step 2 completed

📝 Step 3: Generating explainability report...
✅ Step 3 completed

🔒 Step 4: Checking approval requirements...
  Approval required: NO
✅ Step 4 completed

✨ Workflow governance-1729508400000 completed successfully!

✅ Governance Analysis Complete!

═══════════════════════════════════════════════════════════════
RESULTS SUMMARY
═══════════════════════════════════════════════════════════════
Run ID: governance-1729508400000
Status: COMPLETED
Approval Required: ✓ NO
Confidence: 75.0%

Top Reasons:
  1. Low financial risk
  2. Low security risk
  3. Strong community support

...
```

## Step 3: Your First Analysis

Create a new file `my-first-analysis.ts`:

```typescript
import { createDAOCopilot } from './src/adk-agents/integration/dao-copilot-api';

async function main() {
  // Initialize the co-pilot
  const copilot = await createDAOCopilot({
    daoAddress: 'SP2X...YOUR_DAO',
    enableContinuousMonitoring: false, // Disable for now
  });

  // Analyze a proposal
  const result = await copilot.analyzeProposal({
    proposalId: 'your-proposal-id',
    userAddress: 'SP2X...YOUR_ADDRESS',
    userPreferences: {
      riskTolerance: 'moderate',
    },
  });

  // Print results
  console.log('Recommendation:', result.votingRecommendation.output);
  console.log('Confidence:', result.explainability.confidence);
  console.log('Approval Required:', result.approvalRequired);

  await copilot.shutdown();
}

main();
```

Run it:

```bash
tsx my-first-analysis.ts
```

## Step 4: Individual Agent Usage

### Proposal Analyst Agent

```typescript
import { analyzeProposal } from './src/adk-agents/agents/proposal-analyst-adk.agent';

const analysis = await analyzeProposal('proposal-001', 'SP2X...DAO');
console.log(analysis);
```

Run:
```bash
npm run adk:proposal-analyst
```

### Voting Strategist Agent

```typescript
import { generateRecommendation } from './src/adk-agents/agents/voting-strategist-adk.agent';

const recommendation = await generateRecommendation(
  'proposal-001',
  'SP2X...USER',
  {
    financialImpact: { /* ... */ },
    securityRisk: { /* ... */ },
  }
);

console.log(recommendation);
```

Run:
```bash
npm run adk:voting-strategist
```

### Treasury Monitor Agent

```typescript
import { assessTreasuryHealth, treasuryMonitor } from './src/adk-agents/agents/treasury-monitor-adk.agent';

// One-time assessment
const health = await assessTreasuryHealth('SP2X...DAO');
console.log('Health Score:', health.healthScore);

// Continuous monitoring
treasuryMonitor.startMonitoring('SP2X...DAO', 60000);

treasuryMonitor.onAlert((alert) => {
  console.log(`🚨 ${alert.severity}: ${alert.message}`);
});
```

Run:
```bash
npm run adk:treasury-monitor
```

## Step 5: Using the Workflow

```typescript
import { runGovernanceAnalysis } from './src/adk-agents/workflows/dao-governance-workflow';

const result = await runGovernanceAnalysis(
  'proposal-001',      // Proposal ID
  'SP2X...DAO',        // DAO Address
  'SP2X...USER',       // User Address
  {                    // User Preferences
    riskTolerance: 'moderate',
    votingStyle: 'data-driven',
  }
);

console.log(result);
```

Run:
```bash
npm run adk:workflow
```

## Step 6: Using MCP Server

```typescript
import { governanceDataMCPServer } from './src/adk-agents/mcp/governance-data-server';

// Start the server
await governanceDataMCPServer.start(3001);

// Use endpoints
const votes = await governanceDataMCPServer.handleRequest(
  'getProposalVotes',
  { proposalId: 'proposal-001', daoAddress: 'SP2X...DAO' }
);

const stats = await governanceDataMCPServer.handleRequest(
  'getGovernanceStats',
  { daoAddress: 'SP2X...DAO', timeRange: '30d' }
);
```

Run:
```bash
npm run adk:mcp-server
```

## Common Use Cases

### 1. Dashboard Integration

```typescript
// In your React component
import { createDAOCopilot } from '@/adk-agents/integration/dao-copilot-api';

function GovernanceDashboard() {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    async function analyze() {
      const copilot = await createDAOCopilot({ daoAddress });
      const result = await copilot.analyzeProposal({
        proposalId,
        userAddress,
      });
      setAnalysis(result);
    }
    analyze();
  }, [proposalId]);

  return (
    <div>
      <h2>Recommendation: {analysis?.votingRecommendation.recommendation}</h2>
      <p>Confidence: {analysis?.explainability.confidence * 100}%</p>
    </div>
  );
}
```

### 2. Discord Bot

```typescript
import { Client, GatewayIntentBits } from 'discord.js';
import { createDAOCopilot } from '@/adk-agents/integration/dao-copilot-api';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const copilot = await createDAOCopilot({ daoAddress: 'SP2X...DAO' });

client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!analyze')) {
    const proposalId = message.content.split(' ')[1];
    
    const result = await copilot.analyzeProposal({
      proposalId,
      userAddress: message.author.id,
    });

    message.reply(`
      **Recommendation:** ${result.votingRecommendation.recommendation}
      **Confidence:** ${(result.explainability.confidence * 100).toFixed(0)}%
      **Reasoning:**
      ${result.explainability.topReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}
    `);
  }
});

client.login('YOUR_BOT_TOKEN');
```

### 3. Automated Voting

```typescript
import { createDAOCopilot } from '@/adk-agents/integration/dao-copilot-api';
import { executeVote } from '@/adk-agents/tools/dao-tools';

const copilot = await createDAOCopilot({ daoAddress });
const activeProposals = await copilot.getActiveProposals();

for (const proposal of activeProposals) {
  const analysis = await copilot.analyzeProposal({
    proposalId: proposal.id,
    userAddress: botAddress,
  });

  // Auto-vote only with high confidence
  if (!analysis.approvalRequired && analysis.explainability.confidence > 0.9) {
    await executeVote(
      proposal.id,
      analysis.votingRecommendation.recommendation,
      botAddress
    );
    console.log(`✅ Voted ${analysis.votingRecommendation.recommendation} on ${proposal.id}`);
  } else {
    console.log(`⚠️  Proposal ${proposal.id} requires human review`);
  }
}
```

## Troubleshooting

### Issue: Module not found

**Solution:** Make sure you've installed dependencies:
```bash
npm install
```

### Issue: TypeScript errors

**Solution:** Ensure TypeScript is configured correctly:
```bash
npx tsc --noEmit
```

### Issue: Agent not responding

**Solution:** Check if the MCP server is running:
```bash
npm run adk:mcp-server
```

### Issue: Memory/performance issues

**Solution:** Adjust memory limits in agent configuration:
```typescript
.withMemory({ type: 'short-term', maxEntries: 50 })
```

## Next Steps

1. Read the full [README.md](./README.md) for comprehensive documentation
2. Check out the [ARCHITECTURE.md](./ARCHITECTURE.md) for technical deep dive
3. Explore example integrations in the `examples/` directory
4. Join our Discord community for support

## Resources

- **Documentation:** `/src/adk-agents/README.md`
- **Architecture:** `/src/adk-agents/ARCHITECTURE.md`
- **Examples:** Look for `USAGE_EXAMPLES` in each agent file
- **API Reference:** See exports in `/src/adk-agents/index.ts`

## Available Scripts

```bash
# Run full demo
npm run adk:demo

# Run individual agents
npm run adk:proposal-analyst
npm run adk:voting-strategist
npm run adk:treasury-monitor

# Run workflow
npm run adk:workflow

# Start MCP server
npm run adk:mcp-server

# Run tests
npm run test
```

## Support

- **GitHub Issues:** [Report bugs or request features](https://github.com/yourusername/bitmind-adk-agents/issues)
- **Discord:** Join our community server
- **Email:** support@bitmind.xyz

---

**Happy Building! 🚀**

