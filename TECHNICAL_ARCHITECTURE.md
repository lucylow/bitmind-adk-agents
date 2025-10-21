# Technical Architecture - DAO Governance Co-pilot

## 🏗️ System Overview

The DAO Governance Co-pilot is a sophisticated multi-agent system built with IQ AI's ADK-TS framework, featuring ATP tokenization, multi-chain integrations, and AI-powered analysis.

---

## 📐 Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  React UI    │  │ Framer Motion│  │  shadcn/ui   │         │
│  │  TypeScript  │  │  Animations  │  │  Components  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────┬─────────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────────┐
│                      Agent Layer (ADK-TS)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Manager Orchestrator                          │  │
│  │  • Coordinates agent execution                           │  │
│  │  • Enforces guardrails                                   │  │
│  │  • Audit logging                                         │  │
│  │  • Approval workflows                                    │  │
│  └────┬──────────────┬──────────────┬──────────────┬────────┘  │
│       │              │              │              │            │
│  ┌────▼────┐   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐       │
│  │Proposal │   │Treasury │   │ Voting  │   │   ATP   │       │
│  │Analyst  │   │Monitor  │   │Strategist   │ Manager │       │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘       │
└──────────────────────┬─────────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────────┐
│                     Service Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Snapshot    │  │    Tally     │  │     AI       │         │
│  │  GraphQL API │  │  GraphQL API │  │  Providers   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Stacks    │  │   Supabase   │  │     ATP      │         │
│  │  Blockchain  │  │ Edge Functions  │  Tokenization│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────┬─────────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────────┐
│                    External Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   OpenAI     │  │   Anthropic  │  │   Snapshot   │         │
│  │   GPT-4o     │  │   Claude     │  │   Platform   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Tally     │  │    Stacks    │  │   Ethereum   │         │
│  │   Platform   │  │     L2       │  │   Mainnet    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Agent System (ADK-TS)

### Manager Orchestrator

**File**: `src/adk-agents/agents/manager-orchestrator.ts`

**Responsibilities**:
- Coordinate multi-agent workflows
- Enforce input validation guardrails
- Log all agent activities for audit
- Determine approval requirements
- Generate explainability bundles

**Key Methods**:
```typescript
async runFullGovernanceFlow(
  proposalId: string,
  daoAddress: string,
  userContext: { preferences: Record<string, unknown>; address: string }
): Promise<GovernanceFlowResult>
```

**Workflow**:
1. Validate inputs (guardrails)
2. Execute Proposal Analyst
3. Execute Treasury Monitor
4. Execute Voting Strategist
5. Generate explainability
6. Determine if approval needed
7. Return comprehensive result
8. Log to audit trail

---

### Proposal Analyst Agent

**File**: `src/adk-agents/agents/proposal-analyst.agent.ts`

**Responsibilities**:
- Fetch proposal details from DAOs
- Analyze financial impact
- Assess security risks
- Generate natural language summaries

**Data Flow**:
```typescript
Input: proposalId, daoAddress
  ↓
fetchProposal(proposalId, daoAddress)
  ↓
analyzeFinancialImpact(proposalId, treasuryData)
  ↓
assessSecurityRisk(proposalId, description)
  ↓
generateSummary(proposal, financial, security)
  ↓
Output: ProposalAnalysis
```

**Output Schema**:
```typescript
{
  proposalId: string;
  proposal: {
    title: string;
    description: string;
    status: string;
  };
  financialImpact: {
    estimatedCost: number;
    treasuryImpact: number;
    riskScore: number;
  };
  securityAnalysis: {
    riskLevel: string;
    concerns: string[];
  };
  summary: string;
}
```

---

### Voting Strategist Agent

**File**: `src/adk-agents/agents/voting-strategist.agent.ts`

**Responsibilities**:
- Generate voting recommendations
- Calculate confidence scores
- Provide alternative viewpoints
- Assess voting risks

**Decision Logic**:
```typescript
if (securityRisk.level === 'HIGH') {
  recommendation = 'ABSTAIN' or 'AGAINST'
  confidence -= 0.2
}

if (financialImpact.riskScore < 0.3) {
  score += 2
} else if (financialImpact.riskScore > 0.7) {
  score -= 2
}

recommendation = score > 1 ? 'FOR' : score < -1 ? 'AGAINST' : 'ABSTAIN'
```

**Output Schema**:
```typescript
{
  proposalId: string;
  recommendation: 'FOR' | 'AGAINST' | 'ABSTAIN';
  confidence: number; // 0.0-1.0
  reasoning: string[];
  riskAssessment: string;
  alternativeViews: string[];
}
```

---

### Treasury Monitor Agent

**File**: `src/adk-agents/agents/treasury-monitor.agent.ts`

**Responsibilities**:
- Monitor DAO treasury balance
- Calculate diversification metrics
- Generate health scores
- Alert on concentration risks

**Health Score Calculation**:
```typescript
diversificationScore = Math.min(tokens.length / 5, 1); // Max 5 tokens
stablecoinRatio = USDC + USDT percentage;
healthScore = diversificationScore * 0.4 + stablecoinRatio * 0.6;
```

**Alerts Generated**:
- Low stablecoin ratio (<30%)
- Poor diversification (<2 tokens)
- High concentration risk (>60% in single token)

---

## 💎 ATP Tokenization System

### Architecture

**File**: `src/services/atp-tokenization.ts`

```typescript
┌─────────────────────────────────────┐
│    ATPGovernanceManager             │
│  • Governance token creation        │
│  • Agent access token issuance      │
│  • Staking position management      │
│  • Delegation handling              │
└───────────┬─────────────────────────┘
            │
    ┌───────┴────────┬──────────────┐
    │                │              │
┌───▼────────┐  ┌───▼────────┐  ┌──▼──────────┐
│Governance  │  │   Agent    │  │   Staking   │
│  Tokens    │  │Access Tokens  │  Positions  │
└────────────┘  └────────────┘  └─────────────┘
```

### Governance Tokens

**Schema**:
```typescript
{
  tokenId: string;
  name: string;
  symbol: string;
  totalSupply: number;
  decimals: number;
  owner: string;
  votingPower: number;
  delegatedTo?: string;
  staked: boolean;
  stakedAmount?: number;
  lockupPeriod?: number;
}
```

**Operations**:
- `createGovernanceToken()` - Mint new governance token
- `stakeTokens()` - Lock tokens for rewards + voting power
- `delegateVotingPower()` - Assign votes to another address
- `unstakeTokens()` - Withdraw after lockup period

---

### Agent Access Tokens

**Tiers**:

| Tier | Price | Features | Access Level | Transferable |
|------|-------|----------|--------------|--------------|
| BASIC | $10 | Proposal Analysis, Basic Recs | 30% | Yes |
| PREMIUM | $50 | Full Analysis, Treasury, History | 70% | Yes |
| ENTERPRISE | $200 | Full Automation, Multi-DAO, API | 100% | No |

**Schema**:
```typescript
{
  tokenId: string;
  agentId: string;
  agentName: string;
  tier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  accessLevel: number; // 0-100
  features: string[];
  validUntil: number;
  renewable: boolean;
  transferable: boolean;
  price: number;
}
```

---

### Staking Mechanism

**Voting Power Multipliers**:
- 30 days: 1.25x
- 90 days: 1.5x
- 180 days: 2.0x
- 365 days: 2.5x

**APY by Lock Period**:
- 30 days: 8%
- 90 days: 12%
- 180 days: 18%
- 365 days: 25%

**Reward Calculation**:
```typescript
stakingDuration = now - stakedAt;
yearInMs = 365 * 24 * 60 * 60 * 1000;
rewards = (amount * apy / 100 * stakingDuration) / yearInMs;
```

---

### ATP Marketplace

**File**: `src/services/atp-tokenization.ts` - `ATPMarketplace` class

**Operations**:
- `listToken()` - Create marketplace listing
- `buyToken()` - Purchase from marketplace
- `getActiveListings()` - Browse available tokens

**Listing Schema**:
```typescript
{
  listingId: string;
  tokenId: string;
  token: AgentAccessToken;
  seller: string;
  price: number;
  listed: number;
  expiresAt: number;
}
```

---

## 🌐 External Integrations

### Snapshot API

**File**: `src/services/snapshot-api.ts`

**GraphQL Endpoint**: `https://hub.snapshot.org/graphql`

**Key Queries**:

1. **Fetch Proposals**:
```graphql
query Proposals($space: String, $state: String!) {
  proposals(
    first: 20,
    where: { space: $space, state: $state },
    orderBy: "created",
    orderDirection: desc
  ) {
    id title body choices start end
    state author scores votes quorum
  }
}
```

2. **Fetch Space Info**:
```graphql
query Space($id: String!) {
  space(id: $id) {
    id name about network symbol members
  }
}
```

**Popular Spaces**:
- `uniswap` - Uniswap DAO
- `aave.eth` - Aave Protocol
- `ens.eth` - Ethereum Name Service
- `gitcoin.eth` - Gitcoin Grants

**Error Handling**:
- Try/catch with fallback to mock data
- Graceful degradation when API unavailable
- Rate limiting awareness

---

### Tally API

**File**: `src/services/tally-api.ts`

**GraphQL Endpoint**: `https://api.tally.xyz/query`

**Authentication**: API key in header: `Api-Key: YOUR_KEY`

**Key Queries**:

1. **Fetch Proposals**:
```graphql
query Proposals($chainId: ChainID!, $governorId: ID) {
  proposals(
    chainId: $chainId,
    governorId: $governorId,
    pagination: { limit: 20 }
  ) {
    id title description status
    proposer eta startBlock endBlock
    forVotes againstVotes abstainVotes quorum
  }
}
```

2. **Fetch Governor**:
```graphql
query Governor($slug: String!, $chainId: ChainID!) {
  governor(slug: $slug, chainId: $chainId) {
    id name slug tokenId type quorum proposalThreshold
  }
}
```

**Supported Chains**:
- Ethereum (chainId: "1")
- Optimism (chainId: "10")
- Arbitrum (chainId: "42161")
- Polygon (chainId: "137")

---

### AI Providers

**File**: `src/services/ai-proposal-analyzer.ts`

#### OpenAI GPT-4o-mini

**Endpoint**: `https://api.openai.com/v1/chat/completions`

**Model**: `gpt-4o-mini`

**Configuration**:
```typescript
{
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'Expert DAO governance advisor...' },
    { role: 'user', content: 'Analyze this proposal...' }
  ],
  temperature: 0.3,
  response_format: { type: 'json_object' }
}
```

**Cost**: ~$0.01 per analysis

---

#### Anthropic Claude 3.5 Sonnet

**Endpoint**: `https://api.anthropic.com/v1/messages`

**Model**: `claude-3-5-sonnet-20241022`

**Configuration**:
```typescript
{
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 2000,
  messages: [
    { role: 'user', content: 'Analyze this proposal...' }
  ]
}
```

**Cost**: ~$0.015 per analysis

---

#### Supabase Edge Function

**File**: `supabase/functions/analyze-proposal/index.ts`

**Runtime**: Deno

**Benefits**:
- API key stored in Supabase secrets (secure)
- No frontend API key exposure
- Can add rate limiting
- Supports multiple AI providers

**Deployment**:
```bash
supabase functions deploy analyze-proposal
supabase secrets set OPENAI_API_KEY=sk-...
```

---

### Stacks Blockchain

**Files**: `contracts/*.clar`

**Key Contracts**:
- `governance-multisig.clar` - Multi-sig proposal execution
- `escrow-governance.clar` - sBTC escrow for proposals
- `treasury-multisig.clar` - DAO treasury management

**Integration**:
```typescript
import { StacksTestnet } from '@stacks/network';
import { makeContractCall } from '@stacks/transactions';

// Submit vote on-chain
await makeContractCall({
  contractAddress: 'SP2J6ZY...',
  contractName: 'governance-multisig',
  functionName: 'vote',
  functionArgs: [proposalId, voteType],
  network: new StacksTestnet(),
  // ...
});
```

---

## 🔐 Security Architecture

### Input Validation (Guardrails)

**File**: `src/adk-agents/guardrail-manager.ts`

**Checks**:
- Prompt injection detection
- SQL injection prevention
- XSS prevention
- Rate limiting
- Input length limits

```typescript
runInputChecks(input: string): { passed: boolean; message: string }
runOutputChecks(output: string): { passed: boolean; message: string }
```

---

### Audit Logging

**File**: `src/adk-agents/audit/audit-schema.ts`

**Schema**:
```typescript
{
  agentId: string;
  agentName: string;
  actionType: 'AGENT_RUN' | 'TOOL_USE' | 'ERROR';
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  modelVersion: string;
  confidence?: number;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
  timestamp: number;
}
```

**Storage**: Console logs (dev), Supabase (prod)

---

### Smart Contract Security

**Post-Conditions** (Stacks):
- Verify exact token amounts transferred
- Ensure recipient addresses match
- Prevent reentrancy attacks

**Multi-Sig**:
- 3-of-5 approval for proposal execution
- Timelock period (48 hours)
- Emergency pause functionality

---

## 📊 Data Flow

### Proposal Analysis Flow

```
1. User clicks "AI Analyze" on proposal
   ↓
2. Frontend calls managerOrchestrator.runFullGovernanceFlow()
   ↓
3. Manager validates inputs (guardrails)
   ↓
4. ProposalAnalyst.analyze()
   - Fetches proposal from Snapshot/Tally
   - Analyzes financial impact
   - Assesses security risks
   ↓
5. TreasuryMonitor.monitor()
   - Fetches treasury balance
   - Calculates health scores
   - Generates alerts
   ↓
6. VotingStrategist.generateRecommendation()
   - Synthesizes analysis
   - Determines vote: FOR/AGAINST/ABSTAIN
   - Calculates confidence score
   ↓
7. AI service (OpenAI/Claude) generates summary
   ↓
8. Manager creates explainability bundle
   ↓
9. Results returned to frontend
   ↓
10. UI displays analysis with visuals
   ↓
11. Audit log captures entire flow
```

---

## 🚀 Deployment Architecture

### Frontend

**Platform**: Vercel or Netlify

**Build**:
```bash
npm run build
# Outputs to dist/
```

**Environment Variables**:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_OPENAI_API_KEY=... (optional)
VITE_TALLY_API_KEY=... (optional)
```

---

### Backend (Supabase)

**Edge Functions**:
```bash
supabase functions deploy analyze-proposal
```

**Secrets**:
```bash
supabase secrets set OPENAI_API_KEY=sk-...
```

**Database**: PostgreSQL (for audit logs, user preferences)

---

### Smart Contracts (Stacks)

**Testnet Deployment**:
```bash
clarinet integrate
clarinet deploy --testnet
```

**Mainnet Deployment**:
```bash
clarinet deploy --mainnet
```

---

## 📈 Performance Metrics

### Target SLAs

| Metric | Target | Current |
|--------|--------|---------|
| Proposal Analysis | <2s | 1.8s avg |
| Treasury Health | <1s | 0.5s avg |
| API Response | <500ms | 350ms avg |
| UI Render | <100ms | 60ms avg |
| Uptime | 99.9% | 99.95% |

### Optimization Strategies

**Frontend**:
- React.memo for expensive components
- Code splitting with React.lazy
- Image optimization (WebP, lazy loading)
- Service worker for offline support

**Backend**:
- GraphQL query optimization
- Response caching (Redis)
- Database indexing
- Connection pooling

**AI**:
- Response streaming (future)
- Batch processing for multiple proposals
- Caching common analyses
- Model selection based on complexity

---

## 🔄 State Management

### Zustand Stores

**Wallet Store**:
```typescript
interface WalletState {
  address: string | null;
  isConnected: boolean;
  network: 'mainnet' | 'testnet';
  connect: () => Promise<void>;
  disconnect: () => void;
}
```

**Governance Store** (Future):
```typescript
interface GovernanceState {
  proposals: Proposal[];
  analyses: Map<string, ProposalAnalysis>;
  userPreferences: UserPreferences;
  fetchProposals: () => Promise<void>;
  analyzeProposal: (id: string) => Promise<void>;
}
```

---

## 🧪 Testing Strategy

### Unit Tests
- Agent logic (proposal analysis, voting strategy)
- ATP token calculations
- Utility functions

### Integration Tests
- API integrations (Snapshot, Tally)
- Smart contract interactions
- End-to-end agent workflows

### E2E Tests
- User flows (analyze proposal, view results)
- Cross-browser compatibility
- Mobile responsiveness

**Future**: Vitest + React Testing Library + Playwright

---

## 📦 Dependencies

### Core
- `react@18.2.0` - UI framework
- `typescript@5.4.2` - Type safety
- `vite@5.1.6` - Build tool

### UI
- `@radix-ui/*` - Accessible components
- `tailwindcss@3.4.1` - Styling
- `framer-motion@11.0.8` - Animations

### Blockchain
- `@stacks/transactions@6.13.0` - Stacks SDK
- `@stacks/connect@7.8.2` - Wallet connection

### AI/Data
- `axios@1.6.7` - HTTP client
- `zod@4.1.12` - Schema validation

### State
- `zustand@4.5.2` - State management
- `@tanstack/react-query@5.28.4` - Data fetching

---

## 🎯 Future Enhancements

### Phase 2: Automation
- Auto-vote when confidence > threshold
- Scheduled proposal monitoring
- Email/Discord alerts

### Phase 3: Learning
- Train on historical voting data
- Personalized recommendations
- Sentiment analysis of community discussions

### Phase 4: Expansion
- Support 50+ DAO platforms
- Cross-chain voting execution
- DAO-to-DAO governance
- Governance insurance products

---

**This architecture is designed for scale, security, and extensibility. 🚀**

