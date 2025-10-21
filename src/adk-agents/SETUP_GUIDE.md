# DAO Governance Co-pilot - Setup Guide

Complete step-by-step guide to set up and run the BitMind DAO Governance Co-pilot.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm installed
- A **Gemini API key** (or OpenAI/Anthropic if preferred)
- An **Alchemy** or **Infura** account for blockchain RPC access (optional for mock data)
- **Git** installed
- Basic understanding of TypeScript and DAOs

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
cd /Users/llow/Desktop/bitmind-adk-agents
npm install
```

This will install:
- `@iqai/adk`: Core ADK-TS framework
- `ethers`: Blockchain interaction library
- `zod`: Schema validation
- `tsx`: TypeScript execution runtime
- Other supporting libraries

### Step 2: Set Up Environment Variables

```bash
# Copy the example environment file
cp src/adk-agents/.env.example src/adk-agents/.env

# Edit the .env file with your API keys
nano src/adk-agents/.env  # or use your preferred editor
```

**Minimum required configuration:**
```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### Step 3: Run the Demo

```bash
npm run adk:run
```

This will run the main agent with a sample governance analysis.

## 🔧 Detailed Setup

### 1. Get API Keys

#### Gemini API Key (Required)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add to your `.env` file:
   ```bash
   GEMINI_API_KEY=AIza...your_key_here
   ```

#### Alchemy API Key (Optional - for real blockchain data)

1. Go to [Alchemy](https://www.alchemy.com/)
2. Sign up for a free account
3. Create a new app for Ethereum Mainnet
4. Copy the API key and add to your `.env`:
   ```bash
   ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY_HERE
   ```

#### The Graph API Key (Optional - for DAO data indexing)

1. Go to [The Graph Studio](https://thegraph.com/studio/)
2. Connect your wallet and create an API key
3. Add to your `.env`:
   ```bash
   THEGRAPH_API_KEY=your_graph_api_key_here
   ```

### 2. Install ADK CLI (Recommended)

The ADK CLI provides helpful development tools:

```bash
npm install -g @iqai/adk-cli
```

Then you can use:
```bash
# Terminal interface for your agent
adk run

# Web interface for your agent
adk web

# Validate your agent configuration
adk validate
```

### 3. Verify Installation

Run the test suite to ensure everything is working:

```bash
npm test
```

You should see output confirming:
- ✓ All dependencies installed
- ✓ TypeScript compiles successfully
- ✓ Environment variables loaded (at runtime)

## 🎮 Usage

### Running Different Components

#### Full Governance Analysis
```bash
npm run adk:run
```

Runs the complete multi-agent workflow:
1. Proposal Analyst analyzes the proposal
2. Treasury Monitor checks treasury health
3. Voting Strategist generates recommendation

#### Quick Demo
```bash
npm run adk:test
```

Runs the quick demo script with 5 different examples.

#### Interactive CLI
```bash
tsx src/adk-agents/main-agent-adk.ts
```

Runs the interactive command-line interface where you can chat with the agent.

### Using the Agents Programmatically

Create a new file `my-analysis.ts`:

```typescript
import { runGovernanceAnalysis } from './src/adk-agents/main-agent-adk';

async function analyzeMyProposal() {
  const result = await runGovernanceAnalysis(
    'prop-123',           // Your proposal ID
    '0xYourDAOAddress',   // Your DAO contract address
    {
      riskTolerance: 'MEDIUM',
      address: '0xYourAddress'
    }
  );

  console.log('Recommendation:', result.recommendation);
  console.log('Analysis:', result.analysis);
}

analyzeMyProposal();
```

Run it:
```bash
tsx my-analysis.ts
```

## 🔌 Integration with Real Blockchain Data

By default, the agents use mock data. To connect to real blockchain:

### Step 1: Update RPC Configuration

In `src/adk-agents/tools/dao-tools-adk.ts`, add:

```typescript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(
  process.env.ETHEREUM_RPC_URL
);
```

### Step 2: Implement Real Contract Calls

Replace mock implementations with real queries:

```typescript
export const fetchProposalTool = tool({
  // ... existing config
  execute: async ({ proposalId, daoAddress }) => {
    // Real implementation
    const governanceContract = new ethers.Contract(
      daoAddress,
      GOVERNANCE_ABI,  // Add your DAO's ABI
      provider
    );
    
    const proposalData = await governanceContract.proposals(proposalId);
    
    return {
      id: proposalId,
      title: proposalData.title,
      description: proposalData.description,
      // ... map other fields
    };
  }
});
```

### Step 3: Add Contract ABIs

Create `src/adk-agents/contracts/abis.ts`:

```typescript
export const GOVERNOR_BRAVO_ABI = [
  // Add your governance contract ABI
  "function proposals(uint256) view returns (...)",
  "function state(uint256) view returns (uint8)",
  // etc.
];
```

## 🧪 Testing with Different DAOs

The co-pilot works with any DAO that follows standard governance patterns.

### Test with Uniswap DAO:
```typescript
await runGovernanceAnalysis(
  '13',  // Proposal number
  '0x408ED6354d4973f66138C91495F2f2FCbd8724C3',  // Uniswap Governor
  { address: '0xYourAddress' }
);
```

### Test with Compound:
```typescript
await runGovernanceAnalysis(
  '123',
  '0xc0Da02939E1441F497fd74F78cE7Decb17B66529',  // Compound Governor Bravo
  { address: '0xYourAddress' }
);
```

## 📊 Configuration Options

### User Preferences

Customize how the agents analyze proposals:

```typescript
const userPreferences = {
  // Risk tolerance: How conservative should recommendations be?
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH',
  
  // Voting strategy
  votingStrategy: {
    strategy: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE',
    delegateIfBelowThreshold: true,
    votingPowerThreshold: 0.01,  // 1% minimum
    autoVote: false,
    requiresApproval: true
  },
  
  // Notification preferences
  notificationPreferences: {
    newProposals: true,
    votingDeadlines: true,
    executionResults: true
  },
  
  // DAOs to watch
  watchedDAOs: ['0xDAO1', '0xDAO2'],
  
  // Your wallet address
  address: '0xYourAddress'
};
```

### Agent Configuration

Modify agent behavior in `src/adk-agents/agents/`:

- Change the AI model: `.withModel("gpt-4")` or `.withModel("claude-3-opus")`
- Adjust instructions: Edit the `.withInstructions()` prompt
- Add/remove tools: Modify the `.withTools([])` array

## 🔒 Security Best Practices

1. **Never commit API keys**
   - Always use `.env` files
   - Add `.env` to `.gitignore`

2. **Vote execution requires approval**
   - Set `ENABLE_VOTE_EXECUTION=false` in production
   - Always set `REQUIRE_MANUAL_APPROVAL=true`

3. **Validate all inputs**
   - All tool inputs are validated with Zod schemas
   - Add additional validation as needed

4. **Rate limiting**
   - Configure `RATE_LIMIT_RPM` to avoid API throttling
   - Implement caching for blockchain queries

## 🐛 Troubleshooting

### "Module @iqai/adk not found"

The `@iqai/adk` package might not be publicly available yet. If this is the case:

1. Check if the package exists: `npm view @iqai/adk`
2. If not available, wait for the official release or use a local version
3. Alternative: Mock the ADK interfaces locally

### "GEMINI_API_KEY not set"

Ensure your `.env` file is in the correct location and properly formatted:
```bash
# Check if file exists
ls -la src/adk-agents/.env

# Verify contents
cat src/adk-agents/.env | grep GEMINI
```

### "Rate limit exceeded"

You're hitting API rate limits. Solutions:
- Increase `RATE_LIMIT_RPM` in `.env`
- Implement caching
- Use a paid API tier

### TypeScript Errors

Ensure all dependencies are installed:
```bash
npm install
npm run build
```

## 📚 Next Steps

1. **Explore the Code**: Read through the agents in `src/adk-agents/agents/`
2. **Customize Instructions**: Modify agent prompts for your use case
3. **Add New Tools**: Create custom tools in `src/adk-agents/tools/`
4. **Build a UI**: Create a web interface using the agents
5. **Deploy**: Deploy your co-pilot to production (see deployment guide)

## 🆘 Getting Help

- 📖 Read the [README-ADK.md](./README-ADK.md) for API documentation
- 💬 Check the [ADK-TS Documentation](https://github.com/iqai/adk-ts)
- 🐛 Report issues on GitHub
- 💡 Join the community Discord (link in main README)

## 📝 Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Gemini API key added
- [ ] Test run successful (`npm run adk:run`)
- [ ] Explored the demo examples
- [ ] Read the API documentation

Once you've completed this checklist, you're ready to start building with the DAO Governance Co-pilot! 🚀

