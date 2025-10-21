# ADK-TS Architecture Deep Dive

## Overview

This document provides a comprehensive technical overview of the ADK-TS agent system architecture for the BitMind DAO Governance Co-pilot.

## Core Components

### 1. Agent Builder Pattern

The Agent Builder uses a fluent API to construct AI agents with specific capabilities:

```typescript
// Architecture
AgentBuilder
  ├── Configuration
  │   ├── ID & Name
  │   ├── Model Selection (Gemini, Claude, GPT-4)
  │   ├── Instructions (System Prompt)
  │   ├── Tools (Function Calling)
  │   └── Memory (State Management)
  ├── Validation
  │   ├── Required Fields Check
  │   ├── Tool Compatibility
  │   └── Memory Configuration
  └── Build
      └── Agent Instance
```

**Key Design Decisions:**
- **Fluent API:** Enables readable, chainable configuration
- **Type Safety:** TypeScript ensures compile-time correctness
- **Model Agnostic:** Supports multiple LLM providers
- **Tool Integration:** First-class support for function calling

### 2. Tool System Architecture

```
Tool Definition
├── Name & Description (for LLM understanding)
├── Schema (Zod validation)
├── Execute Function (implementation)
├── Risk Level (LOW/MEDIUM/HIGH)
└── Approval Required (boolean)

Tool Execution Flow:
1. LLM selects tool based on description
2. Parameters validated against schema
3. Guardrails check (risk assessment)
4. Execute function called
5. Result returned to LLM
6. Audit log created
```

**Blockchain Integration Tools:**

| Tool | Risk Level | Purpose |
|------|-----------|---------|
| `fetch_proposal` | LOW | Read proposal data |
| `analyze_financial_impact` | MEDIUM | Calculate financial metrics |
| `assess_security_risk` | MEDIUM | Analyze security concerns |
| `get_treasury_balance` | LOW | Read treasury state |
| `execute_vote` | HIGH | Execute blockchain transaction |
| `generate_voting_recommendation` | MEDIUM | AI-powered recommendation |

### 3. Multi-Agent Workflow

```
DAOGovernanceWorkflow
├── Step 1: Parallel Data Gathering
│   ├── Proposal Analyst Agent
│   │   ├── Fetch proposal data
│   │   ├── Analyze financial impact
│   │   ├── Assess security risks
│   │   └── Analyze community sentiment
│   │
│   └── Treasury Monitor Agent
│       ├── Get treasury balance
│       ├── Calculate health metrics
│       └── Generate alerts
│
├── Step 2: Voting Recommendation
│   └── Voting Strategist Agent
│       ├── Review proposal analysis
│       ├── Check user preferences
│       ├── Review voting history
│       └── Generate recommendation
│
├── Step 3: Explainability Generation
│   ├── Extract top reasons
│   ├── Identify risk factors
│   └── Provide alternative views
│
└── Step 4: Approval Gate
    ├── Check confidence threshold
    ├── Assess risk levels
    └── Determine if approval needed
```

**Execution Patterns:**

1. **Sequential Execution:** Steps that depend on previous results
   ```typescript
   const results = await executeSteps([step1, step2, step3]);
   ```

2. **Parallel Execution:** Independent operations for performance
   ```typescript
   const [result1, result2] = await executeParallel([task1, task2]);
   ```

### 4. Memory System

```
Memory Architecture
├── InMemoryStorage (Base)
│   ├── Store(key, value)
│   ├── Retrieve(key)
│   ├── Clear()
│   └── Has(key)
│
├── UserPreferenceMemory (Extended)
│   ├── User Preferences
│   │   ├── Risk Tolerance
│   │   ├── Voting Style
│   │   └── Focus Areas
│   │
│   └── Voting History
│       ├── Past Votes
│       ├── Feedback Scores
│       └── Learning Data
│
└── Memory Config
    ├── Type: short-term | long-term | hybrid
    ├── Max Entries: Capacity limit
    └── Persist To: Storage backend
```

**Memory Patterns:**

- **Short-term Memory:** Current workflow context, expires after run
- **Long-term Memory:** User preferences, persists across sessions
- **Hybrid Memory:** Mix of ephemeral and persistent data

### 5. MCP Server Architecture

Model Context Protocol (MCP) provides real-time data access:

```
GovernanceDataMCPServer
├── Endpoints
│   ├── GET /proposals/:id/votes
│   ├── GET /delegates/:address/power
│   ├── GET /governance/:dao/stats
│   ├── GET /governance/:dao/proposals/active
│   ├── GET /governance/:dao/treasury
│   └── GET /voters/:address/history
│
├── Data Sources
│   ├── Stacks Blockchain (RPC)
│   ├── Smart Contracts (Read Calls)
│   ├── The Graph (Indexed Data)
│   └── Off-chain Database (Cached Data)
│
└── Features
    ├── Real-time Data
    ├── Caching Layer
    ├── Rate Limiting
    └── Error Handling
```

**MCP Benefits:**
- **Separation of Concerns:** Data access isolated from agent logic
- **Reusability:** Multiple agents can use same endpoints
- **Scalability:** Can be deployed as separate service
- **Testability:** Easy to mock for testing

## Data Flow

### Complete Analysis Flow

```
User Request
    ↓
DAOCopilotAPI.analyzeProposal()
    ↓
DAOGovernanceWorkflow.execute()
    ↓
┌─────────────────┬─────────────────┐
│ ProposalAnalyst │ TreasuryMonitor │ (Parallel)
│     Agent       │      Agent      │
└────────┬────────┴────────┬────────┘
         │                 │
         ├─────────────────┤
         ↓                 ↓
    [Proposal Data]  [Treasury Data]
         │                 │
         └────────┬────────┘
                  ↓
         VotingStrategist Agent
                  ↓
         [Recommendation]
                  ↓
         Explainability Layer
                  ↓
         Approval Gate Check
                  ↓
         Return Result
```

## Security Architecture

### Guardrail System

```
Input → Guardrails → Agent → Guardrails → Output
         ↓                       ↓
    [Validation]            [Validation]
         ↓                       ↓
    [Safety Check]          [Audit Log]
         ↓                       ↓
    [Relevance]             [PII Sanitization]
```

**Guardrail Types:**

1. **Input Guardrails**
   - Relevance Classifier (filters non-governance queries)
   - Safety Classifier (detects prompt injection)
   - PII Sanitizer (redacts sensitive data)

2. **Tool Guardrails**
   - Risk Assessment (LOW/MEDIUM/HIGH)
   - Approval Requirements (for HIGH risk)
   - Confidence Thresholds (varying by risk level)

3. **Output Guardrails**
   - Schema Validation (Zod)
   - Sanitization (remove sensitive data)
   - Audit Logging (full traceability)

### Approval Flow

```
Tool Call Request
    ↓
Risk Assessment
    ↓
Is HIGH Risk? ──No──→ Execute Tool
    ↓ Yes
Confidence > 0.9? ──Yes──→ Execute Tool
    ↓ No
User Confirmed? ──Yes──→ Execute Tool
    ↓ No
Request Approval
    ↓
Approval Granted? ──Yes──→ Execute Tool
    ↓ No
Reject Request
```

## Scalability Considerations

### Horizontal Scaling

```
Load Balancer
    ↓
┌────────┬────────┬────────┐
│ API    │ API    │ API    │ (Multiple Instances)
│ Server │ Server │ Server │
└────────┴────────┴────────┘
    ↓        ↓        ↓
┌────────────────────────┐
│   Shared Services      │
│  ┌──────────────────┐  │
│  │ MCP Server       │  │
│  │ Memory Store     │  │
│  │ Audit Database   │  │
│  └──────────────────┘  │
└────────────────────────┘
```

### Performance Optimization

1. **Caching Strategy**
   - Proposal data: 5 minutes TTL
   - Treasury data: 1 minute TTL
   - User preferences: Persistent

2. **Parallel Execution**
   - Independent agent calls run concurrently
   - Reduces latency by 60%

3. **Memory Management**
   - LRU eviction for short-term memory
   - Lazy loading for long-term memory

## Integration Patterns

### Pattern 1: Direct Agent Usage

```typescript
import { proposalAnalystAgentADK } from './agents';

const result = await proposalAnalystAgentADK.run(
  'Analyze proposal prop-001',
  { proposalId: 'prop-001', daoAddress: 'SP...' }
);
```

### Pattern 2: Workflow Orchestration

```typescript
import { runGovernanceAnalysis } from './workflows';

const result = await runGovernanceAnalysis(
  proposalId,
  daoAddress,
  userAddress,
  preferences
);
```

### Pattern 3: High-Level API

```typescript
import { createDAOCopilot } from './integration';

const copilot = await createDAOCopilot({ daoAddress });
const result = await copilot.analyzeProposal(request);
```

## Extensibility

### Adding New Agents

1. Create agent file in `agents/`
2. Use AgentBuilder pattern
3. Define tools needed
4. Export agent instance
5. Update workflow if needed

### Adding New Tools

1. Define tool schema (Zod)
2. Implement execute function
3. Set risk level
4. Register in tool registry
5. Add to agent tools array

### Adding New Workflows

1. Extend Workflow class
2. Implement execute method
3. Use executeSteps or executeParallel
4. Add error handling
5. Export workflow instance

## Testing Strategy

### Unit Tests
- Individual tool execution
- Agent configuration
- Memory operations
- Guardrail checks

### Integration Tests
- Multi-agent workflows
- MCP server endpoints
- End-to-end analysis flow
- Error scenarios

### Performance Tests
- Load testing (100+ concurrent requests)
- Latency benchmarks
- Memory profiling
- Cache hit rates

## Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run start
```

### Docker
```bash
docker build -t dao-copilot .
docker run -p 3000:3000 dao-copilot
```

## Monitoring & Observability

### Metrics
- Request latency (p50, p95, p99)
- Agent execution time
- Tool call success rate
- Cache hit rate
- Error rate by type

### Logging
- Structured JSON logs
- Audit trail for all actions
- User interaction tracking
- Performance metrics

### Alerts
- High error rate (> 5%)
- Slow response time (> 5s)
- Treasury health critical
- System resource usage

---

**Last Updated:** October 2025
**Version:** 1.0.0

