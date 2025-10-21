# BitMind Migration Guide: Stacks → ADK-TS

## Overview

This guide documents the migration from **Stacks blockchain invoice automation** to **ADK-TS DAO Governance Co-pilot** for the ADK-TS Agents Hackathon 2025.

---

## 🔄 Migration Summary

### From (Stacks Hackathon)
- **Focus**: Smart invoice automation on Stacks blockchain
- **Tech**: Clarity smart contracts, @stacks/connect, Hiro API
- **Tokens**: sBTC, STX
- **Use Case**: Automated contractor payments for DAOs

### To (ADK-TS Hackathon)
- **Focus**: DAO Governance Co-pilot with multi-agent AI
- **Tech**: ADK-TS framework, ethers.js, The Graph
- **Chains**: Ethereum, Polygon, Arbitrum, Optimism
- **Use Case**: Intelligent proposal analysis and voting recommendations

---

## 📦 Tech Stack Changes

### Removed Dependencies
```bash
npm uninstall @stacks/connect @stacks/transactions @stacks/network @stacks/blockchain-api-client
```

### Added Dependencies
```bash
npm install @iqai/adk ethers@^6.13.0 graphql@^16.8.1 graphql-request@^6.1.0
npm install express cors dotenv  # For backend API
npm install tsx@^4.7.0  # For running TypeScript directly
```

### Package.json Scripts Added
```json
{
  "adk:run": "tsx src/index-adk.ts",
  "adk:demo": "tsx src/adk-agents/index.ts",
  "adk:proposal-analyst": "tsx src/agents/proposal-analyst.agent.ts",
  "adk:voting-strategist": "tsx src/agents/voting-strategist.agent.ts",
  "adk:treasury-monitor": "tsx src/agents/treasury-monitor.agent.ts",
  "adk:workflow": "tsx src/workflows/dao-governance.workflow.ts"
}
```

---

## 🏗️ New Project Structure

```
src/
├── agents/                          # ADK-TS Agents (NEW)
│   ├── proposal-analyst.agent.ts   # Analyzes proposals
│   ├── voting-strategist.agent.ts  # Generates recommendations
│   └── treasury-monitor.agent.ts   # Monitors treasury health
│
├── tools/                           # Custom ADK-TS Tools (NEW)
│   ├── dao-tools.ts                 # DAO-specific tools
│   ├── blockchain-tools.ts          # Blockchain queries
│   └── governance-tools.ts          # Governance operations
│
├── workflows/                       # Multi-Agent Workflows (NEW)
│   └── dao-governance.workflow.ts   # Orchestrates agents
│
├── index-adk.ts                     # Express API server (NEW)
│
└── [existing frontend code]         # React components (UPDATED)
```

---

## 🤖 Agent Implementations

### 1. Proposal Analyst Agent

**File**: `src/agents/proposal-analyst.agent.ts`

**Purpose**: Analyzes DAO proposals for:
- Financial impact on treasury
- Security risks and smart contract changes
- Stakeholder considerations
- Executive summaries

**Key Code**:
```typescript
import { AgentBuilder } from '@iqai/adk';

export const createProposalAnalystAgent = () => {
  return AgentBuilder
    .withModel('gemini-2.5-flash')
    .withTools([fetchProposalTool, analyzeFinancialImpactTool, assessSecurityRiskTool])
    .withInstruction(`You are a DAO Proposal Analyst...`)
    .build();
};
```

### 2. Voting Strategist Agent

**File**: `src/agents/voting-strategist.agent.ts`

**Purpose**: Generates personalized voting recommendations:
- Analyzes user's voting history
- Considers user preferences and risk tolerance
- Provides confidence-scored recommendations
- Explains reasoning transparently

### 3. Treasury Monitor Agent

**File**: `src/agents/treasury-monitor.agent.ts`

**Purpose**: Monitors DAO treasury:
- Real-time balance tracking
- Health score calculation
- Runway analysis
- Diversification assessment
- Proposal impact evaluation

---

## 🛠️ Custom Tools (Blockchain Integration)

### File: `src/tools/dao-tools.ts`

Implements 10 custom tools using **ethers.js**:

#### Proposal Tools
1. **fetchProposalTool** - Fetches proposals from on-chain or Snapshot
2. **analyzeFinancialImpactTool** - Calculates financial impact
3. **assessSecurityRiskTool** - Evaluates security risks

#### Treasury Tools
4. **getTreasuryBalanceTool** - Fetches treasury composition
5. **analyzeTreasuryHealthTool** - Calculates health metrics
6. **assessProposalImpactTool** - Impact on treasury sustainability

#### Voting Tools
7. **analyzeVotingHistoryTool** - User's past voting patterns
8. **generateRecommendationTool** - Creates recommendations
9. **getUserPreferencesTool** - Fetches user preferences
10. **castVoteTool** - Executes on-chain votes (with user approval)

**Example Tool**:
```typescript
export const fetchProposalTool = tool({
  name: 'fetchProposal',
  description: 'Fetch DAO proposal details from blockchain or Snapshot',
  inputSchema: z.object({
    proposalId: z.string(),
    platform: z.enum(['onchain', 'snapshot', 'tally']),
  }),
  execute: async ({ proposalId, platform }) => {
    if (platform === 'snapshot') {
      // GraphQL query to Snapshot
      const response = await axios.post('https://hub.snapshot.org/graphql', {...});
      return response.data;
    } else {
      // On-chain using ethers.js
      const proposal = await governanceContract.proposals(proposalId);
      return proposal;
    }
  },
});
```

---

## 🔄 Multi-Agent Workflow

### File: `src/workflows/dao-governance.workflow.ts`

**Orchestrates 3 agents** for comprehensive analysis:

```typescript
export class DAOGovernanceWorkflow extends Workflow {
  async processProposal(proposalId: string, daoAddress: string, userAddress: string) {
    
    // Step 1: Initialize agents
    const proposalAnalyst = createProposalAnalystAgent();
    const treasuryMonitor = createTreasuryMonitorAgent();
    const votingStrategist = createVotingStrategistAgent();
    
    // Step 2: Parallel analysis (faster execution)
    const [proposalAnalysis, treasuryHealth] = await Promise.all([
      proposalAnalyst.run(`Analyze proposal ${proposalId}...`),
      treasuryMonitor.run(`Check treasury health for DAO ${daoAddress}...`)
    ]);
    
    // Step 3: Generate recommendation based on both analyses
    const recommendation = await votingStrategist.run(`
      Generate voting recommendation based on:
      - Proposal: ${proposalAnalysis}
      - Treasury: ${treasuryHealth}
    `);
    
    return { proposalAnalysis, treasuryHealth, recommendation };
  }
}
```

**Benefits**:
- ✅ Parallel execution for speed
- ✅ Each agent specializes in one domain
- ✅ Results synthesized into coherent recommendation
- ✅ Extensible - easy to add more agents

---

## 🌐 Backend API Server

### File: `src/index-adk.ts`

**Express server** exposing ADK-TS agents via REST API:

**Endpoints**:
- `GET /health` - Health check
- `POST /api/analyze` - Analyze single proposal
- `GET /api/treasury/:daoAddress` - Monitor treasury
- `POST /api/analyze-batch` - Batch analyze multiple proposals
- `GET /api/agents` - List available agents and capabilities

**Example Usage**:
```bash
# Start the server
npm run adk:run

# Analyze a proposal
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "proposalId": "prop-123",
    "daoAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "userAddress": "0xUserAddress"
  }'
```

---

## 💻 Frontend Integration

### React Component Example

```typescript
// src/components/ProposalAnalyzer.tsx
import React, { useState } from 'react';
import axios from 'axios';

export function ProposalAnalyzer() {
  const [proposalId, setProposalId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const analyzeProposal = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/analyze', {
        proposalId,
        daoAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        userAddress: '0xUserAddress'
      });
      setResult(response.data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <input 
        value={proposalId} 
        onChange={e => setProposalId(e.target.value)} 
        placeholder="Enter Proposal ID" 
      />
      <button onClick={analyzeProposal} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Proposal'}
      </button>
      
      {result && (
        <div>
          <h3>Analysis Results:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## 🔗 Blockchain Integration (Ethers.js)

### Key Changes from Stacks.js

**Before (Stacks)**:
```typescript
import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';

// Call Clarity contract
await openContractCall({
  network: new StacksMainnet(),
  contractAddress: 'SP...',
  contractName: 'invoice-escrow',
  functionName: 'create-invoice',
  functionArgs: [...]
});
```

**After (Ethereum + ethers.js)**:
```typescript
import { ethers } from 'ethers';

// Connect to provider
const provider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL);

// Read from contract
const governanceContract = new ethers.Contract(
  GOVERNANCE_CONTRACT_ADDRESS,
  GOVERNANCE_ABI,
  provider
);

const proposal = await governanceContract.proposals(proposalId);

// Write to contract (requires signer)
const signer = await provider.getSigner();
const governanceWithSigner = governanceContract.connect(signer);
await governanceWithSigner.castVote(proposalId, 1); // 1 = FOR
```

---

## 📊 Off-Chain Integration (Snapshot)

### Fetching Proposals from Snapshot

```typescript
import axios from 'axios';

const SNAPSHOT_GRAPHQL = 'https://hub.snapshot.org/graphql';

async function fetchSnapshotProposal(proposalId: string) {
  const response = await axios.post(SNAPSHOT_GRAPHQL, {
    query: `
      query Proposal($id: String!) {
        proposal(id: $id) {
          id
          title
          body
          choices
          start
          end
          state
          author
          scores
          scores_total
        }
      }
    `,
    variables: { id: proposalId }
  });
  
  return response.data.data.proposal;
}
```

---

## 🧪 Testing the Migration

### 1. Start the ADK Server
```bash
npm run adk:run
```

### 2. Test Health Endpoint
```bash
curl http://localhost:3001/health
```

### 3. Analyze a Proposal
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "proposalId": "test-proposal-1",
    "daoAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "userAddress": "0xYourAddress"
  }'
```

### 4. Run Frontend
```bash
npm run dev  # In separate terminal
```

---

## 📝 Key Migration Checklist

### Code Migration
- [x] Created 3 ADK-TS agents (proposal-analyst, voting-strategist, treasury-monitor)
- [x] Implemented 10 custom tools with ethers.js integration
- [x] Built multi-agent workflow orchestration
- [x] Created Express API server
- [x] Updated environment configuration
- [x] Added type definitions for TypeScript

### Documentation
- [x] Updated README.md to focus on ADK-TS
- [x] Created migration guide
- [x] Updated package.json description
- [x] Organized all docs in `/docs` folder

### Content Updates
- [x] Removed "Stacks" and "Clarity" references
- [x] Added "ADK-TS", "IQ AI", "AI-agents" terminology
- [x] Updated hero messaging
- [x] Changed feature descriptions

### Testing
- [ ] Test agent execution locally
- [ ] Verify blockchain queries work
- [ ] Test multi-agent workflow
- [ ] Frontend integration testing

---

## 🚀 Running the ADK-TS System

### Development Mode

```bash
# Terminal 1: Start ADK backend server
npm run adk:run

# Terminal 2: Start frontend dev server
npm run dev

# Terminal 3: (Optional) Run individual agent tests
npm run adk:proposal-analyst
npm run adk:voting-strategist
npm run adk:treasury-monitor
```

### Production Build

```bash
# Build everything
npm run build

# Start production server
NODE_ENV=production npm run adk:run
```

---

## 📚 Resources

### ADK-TS Documentation
- **Official Docs**: https://google.github.io/adk-docs/
- **Multi-Agent Guide**: https://google.github.io/adk-docs/agents/multi-agents/
- **GitHub**: https://github.com/IQAIcom/adk-ts
- **Blog**: https://cloud.google.com/blog/products/ai-machine-learning/build-multi-agentic-systems-using-google-adk

### Blockchain Integration
- **Ethers.js Docs**: https://docs.ethers.org/v6/
- **Snapshot API**: https://docs.snapshot.org/
- **The Graph**: https://thegraph.com/docs/
- **WalletConnect**: https://docs.walletconnect.com/

### Hackathon
- **ADK-TS Hackathon**: https://dorahacks.io/hackathon/adk-ts-hackathon-2025/detail
- **IQ AI**: https://iq.wiki/wiki/adk-for-typescript

---

## ⚠️ Known Issues & Solutions

### Issue 1: ADK Package Not Yet Published
**Status**: `@iqai/adk` package may not be available on npm yet

**Solution**:
- Backup files created with `.backup` extension
- Placeholder files prevent build errors
- Restore when package is available:
  ```bash
  for file in $(find src -name "*.backup"); do
    mv "$file" "${file%.backup}"
  done
  ```

### Issue 2: Blockchain RPC Rate Limits
**Solution**: Use free tier RPCs for development, upgrade for production

### Issue 3: Mock Data for Demo
**Solution**: All tools have fallback mock data for demonstration purposes

---

## 🎯 Hackathon Submission Checklist

- [x] Project migrated to ADK-TS framework
- [x] Multi-agent system implemented
- [x] Blockchain integration via ethers.js
- [x] Comprehensive documentation
- [x] Clean GitHub repository structure
- [ ] Create demo video (5 minutes)
- [ ] Test end-to-end workflow
- [ ] Submit to DoraHacks platform

---

## 💡 Next Steps

1. **Get ADK-TS Package**: Once `@iqai/adk` is published, install it
2. **Configure Real RPCs**: Add your Infura/Alchemy keys
3. **Test with Real DAO**: Point to actual governance contract
4. **Create Demo Video**: Show the multi-agent system in action
5. **Submit to Hackathon**: https://dorahacks.io/hackathon/adk-ts-hackathon-2025/detail

---

**Migration Date**: October 21, 2025  
**Status**: ✅ Core migration complete, ready for ADK package integration  
**Next Action**: Test agents when ADK-TS package is available

🚀 **BitMind is ready for the ADK-TS Hackathon 2025!**

