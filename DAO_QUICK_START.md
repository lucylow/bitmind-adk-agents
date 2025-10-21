# DAO Governance Co-pilot - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will get you up and running with the DAO Governance Co-pilot powered by ADK-TS.

## Prerequisites

- Node.js 18+ installed
- Google Gemini API key (get it at https://aistudio.google.com/apikey)
- MetaMask wallet (optional, for blockchain features)

## Step 1: Environment Setup

Create a `.env` file in the project root:

```bash
# Required: Gemini API Key
GOOGLE_API_KEY=your_gemini_api_key_here

# Optional: Blockchain RPC (for production)
# ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `@iqai/adk` - AI Development Kit
- `ethers` - Web3/blockchain interaction
- `zod` - Type validation
- `dotenv` - Environment configuration

## Step 3: Run Your First Demo

### Option A: Full Demo

```bash
npm run dao:demo
```

This runs a complete demonstration showing:
1. Quick proposal analysis
2. Comprehensive multi-agent workflow
3. Interactive session with the co-pilot

### Option B: Hackathon Demo Script

```bash
npm run dao:demo-script
```

This runs three scenarios:
1. **Educational**: Learn about DAO governance
2. **Analysis**: Deep proposal analysis
3. **Strategy**: Voting recommendations

### Option C: Interactive Mode

```bash
npm run dao:quick
```

Start an interactive session with the DAO co-pilot.

## Step 4: Understanding the Output

### Quick Analysis Example

```
🚀 DAO Governance Co-pilot Initialized

1. Quick Proposal Analysis:
[AI Response explaining treasury diversification proposals...]
```

### Comprehensive Analysis Example

```
2. Comprehensive Proposal Analysis:
Wallet Connected: false
Analysis Complete: 2024-01-15T10:30:00.000Z
Proposal ID: prop-2024-001

Full Analysis:
[Detailed multi-agent analysis including:
 - Proposal breakdown
 - Financial impact
 - Risk assessment
 - Voting recommendation]
```

## Step 5: Customize for Your DAO

### 1. Connect to Real Governance Contracts

Edit `src/tools/blockchain-tools.ts`:

```typescript
const GOVERNANCE_ABI = [
  // Add your governance contract ABI
];

export const fetchProposalTool = tool({
  description: "Fetch DAO proposal details",
  input: z.object({
    proposalId: z.string(),
    contractAddress: z.string().default("YOUR_CONTRACT_ADDRESS")
  }),
  execute: async ({ proposalId, contractAddress }) => {
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const contract = new ethers.Contract(contractAddress, GOVERNANCE_ABI, provider);
    
    // Fetch real proposal data
    const proposal = await contract.proposals(proposalId);
    
    return {
      id: proposalId,
      // Map contract data to ProposalSchema
    };
  }
});
```

### 2. Add Custom Analysis Tools

Create `src/tools/custom-analysis.ts`:

```typescript
import { tool } from "@iqai/adk";
import { z } from "zod";

export const myCustomTool = tool({
  description: "My custom analysis tool",
  input: z.object({
    data: z.string()
  }),
  execute: async ({ data }) => {
    // Your custom logic
    return { result: "analysis" };
  }
});
```

Then add to your agents:

```typescript
import { myCustomTool } from "../tools/custom-analysis";

export const createProposalAnalystAgent = () => {
  return AgentBuilder
    .create("proposal-analyst")
    .withTools([fetchProposalTool, myCustomTool]) // Add here
    .build();
};
```

### 3. Customize Agent Instructions

Edit agent files to match your DAO's needs:

```typescript
// src/agents/proposal-analyst.agent.ts
export const createProposalAnalystAgent = () => {
  return AgentBuilder
    .create("proposal-analyst")
    .withInstruction(`
      You are a governance analyst for [YOUR DAO NAME].
      
      Focus areas:
      - [Your DAO's priorities]
      - [Your risk tolerance]
      - [Your governance principles]
      
      Analysis framework:
      - [Your custom framework]
    `)
    .build();
};
```

## 🎯 Usage Patterns

### Pattern 1: Quick Question

```typescript
import { quickAnalysisAgent } from "./src/dao-index";

const answer = await quickAnalysisAgent.run(
  "Should we diversify into stablecoins?"
);
console.log(answer.content);
```

### Pattern 2: Full Proposal Analysis

```typescript
import { governanceWorkflow } from "./src/dao-index";

const analysis = await governanceWorkflow.analyzeProposalAndVote(
  "prop-123",
  { 
    riskTolerance: "low",
    focus: "treasury-growth",
    votingHistory: userVotingData 
  }
);
```

### Pattern 3: Custom Workflow

```typescript
import { createProposalAnalystAgent } from "./src/agents/proposal-analyst.agent";
import { createTreasuryMonitorAgent } from "./src/agents/treasury-monitor.agent";

const analyst = createProposalAnalystAgent();
const treasury = createTreasuryMonitorAgent();

// Run analysis
const proposalAnalysis = await analyst.run("Analyze proposal prop-456");

// Check treasury impact
const treasuryImpact = await treasury.run(
  `Assess treasury impact: ${proposalAnalysis.content}`
);
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dao:demo` | Full demo with all features |
| `npm run dao:demo-script` | Hackathon demo scenarios |
| `npm run dao:quick` | Quick interactive mode |
| `npm run adk:proposal-analyst` | Test proposal analyst only |
| `npm run adk:voting-strategist` | Test voting strategist only |
| `npm run adk:treasury-monitor` | Test treasury monitor only |

## 🐛 Troubleshooting

### Issue: "API key not found"

**Solution**: Make sure you have `GOOGLE_API_KEY` in your `.env` file.

```bash
echo "GOOGLE_API_KEY=your_key_here" > .env
```

### Issue: "Wallet not connected"

**Solution**: This is expected if you don't have MetaMask. The system will continue with analysis-only mode.

### Issue: "Module not found"

**Solution**: Run `npm install` to ensure all dependencies are installed.

### Issue: TypeScript errors

**Solution**: Ensure TypeScript is installed:
```bash
npm install -D typescript
```

## 📚 Next Steps

1. **Read the full guide**: See `DAO_ADK_IMPLEMENTATION_GUIDE.md` for detailed documentation
2. **Explore agents**: Check individual agent files in `src/agents/`
3. **Add tools**: Create custom tools in `src/tools/`
4. **Customize workflows**: Modify `src/workflows/dao-governance.workflow.ts`
5. **Integrate UI**: Connect agents to your frontend application

## 🎓 Learning Resources

### ADK-TS
- [Official Documentation](https://docs.iq.ai/adk)
- [GitHub Repository](https://github.com/iq-ai/adk)

### Web3 Integration
- [Ethers.js Docs](https://docs.ethers.org/)
- [MetaMask Integration](https://docs.metamask.io/)

### TypeScript & Zod
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)

## 💡 Pro Tips

1. **Start Small**: Test individual agents before running full workflows
2. **Mock Data First**: Use mock data to develop quickly, then connect real contracts
3. **Log Everything**: Add console.logs to understand agent behavior
4. **Iterate Instructions**: Refine agent instructions based on output quality
5. **Test Edge Cases**: Try unusual proposals to ensure robust analysis

## 🤝 Need Help?

- **Documentation**: `DAO_ADK_IMPLEMENTATION_GUIDE.md`
- **Example Code**: Check `demo/demo-script.ts`
- **ADK-TS Support**: https://docs.iq.ai/support

## ✅ Verification Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Demo runs successfully
- [ ] Agents provide quality outputs
- [ ] Custom tools integrated (if any)
- [ ] Blockchain connections tested
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] User preferences system tested
- [ ] Voting execution tested

---

**You're all set!** Start with `npm run dao:demo` and explore the power of AI-driven DAO governance. 🚀

