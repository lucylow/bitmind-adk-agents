# ADK-TS Framework Integration Guide

## Overview

This guide explains how to integrate with the official ADK-TS (Agent Development Kit for TypeScript) framework. The current implementation uses TypeScript classes that can be easily adapted to use ADK-TS's AgentBuilder pattern when the official SDK is available.

## Current Implementation vs ADK-TS

### Current Architecture

```typescript
// Current: TypeScript classes with direct tool calls
export class ProposalAnalystAgent {
  async analyze(proposalId: string, daoAddress: string): Promise<ProposalAnalysis> {
    const proposal = await fetchProposal(proposalId, daoAddress);
    const financialImpact = await analyzeFinancialImpact(proposalId, { treasury: daoAddress });
    const securityAnalysis = await assessSecurityRisk(proposalId, proposal.description);
    return { proposal, financialImpact, securityAnalysis, summary };
  }
}
```

### ADK-TS AgentBuilder Pattern

```typescript
// Future: ADK-TS AgentBuilder with tools
import { AgentBuilder, tool } from '@iqai/adk-core';

const proposalAnalystAgent = await AgentBuilder
  .withModel('gemini-2.5-flash')
  .withTools({
    fetchProposal: tool({
      description: "Fetch DAO proposal details",
      input: z.object({ proposalId: z.string(), daoAddress: z.string() }),
      execute: async ({ proposalId, daoAddress }) => {
        // Implementation
      }
    }),
    analyzeFinancialImpact: tool({ /* ... */ }),
    assessSecurityRisk: tool({ /* ... */ })
  })
  .withInstructions(`
    You are a DAO Proposal Analyst. Analyze proposals for:
    - Financial impact on treasury
    - Security risks
    - Key considerations for voters
  `)
  .build();
```

## Migration Path to ADK-TS

### Step 1: Install ADK-TS (When Available)

```bash
npm install @iqai/adk-core @iqai/adk-cli
```

### Step 2: Convert Tools to ADK Tool Format

**Before (Current)**:
```typescript
export async function fetchProposal(
  proposalId: string,
  daoAddress: string
): Promise<Proposal> {
  // Implementation
}
```

**After (ADK-TS)**:
```typescript
import { tool } from '@iqai/adk-core';
import { z } from 'zod';

export const fetchProposalTool = tool({
  name: 'fetch_proposal',
  description: 'Fetch DAO proposal details from blockchain',
  input: z.object({
    proposalId: z.string().describe('The proposal ID to fetch'),
    daoAddress: z.string().describe('The DAO contract address'),
  }),
  output: ProposalSchema,
  execute: async ({ proposalId, daoAddress }) => {
    const proposal = await mcpServers.blockchainData.getProposalData(proposalId);
    return {
      id: proposal.id,
      title: proposal.title,
      description: proposal.description,
      // ... rest of mapping
    };
  },
  metadata: {
    riskLevel: 'LOW',
    requiresApproval: false,
  }
});
```

### Step 3: Convert Agents to AgentBuilder

**Before (Current)**:
```typescript
export class ProposalAnalystAgent {
  private agentId = 'proposal-analyst-001';
  
  async analyze(proposalId: string, daoAddress: string): Promise<ProposalAnalysis> {
    const proposal = await fetchProposal(proposalId, daoAddress);
    const financialImpact = await analyzeFinancialImpact(proposalId, { treasury: daoAddress });
    const securityAnalysis = await assessSecurityRisk(proposalId, proposal.description);
    return { /* ... */ };
  }
}
```

**After (ADK-TS)**:
```typescript
import { AgentBuilder, Toolset } from '@iqai/adk-core';

export async function createProposalAnalystAgent() {
  const tools: Toolset = {
    fetchProposal: fetchProposalTool,
    analyzeFinancialImpact: analyzeFinancialImpactTool,
    assessSecurityRisk: assessSecurityRiskTool,
  };

  return await AgentBuilder
    .withModel('gemini-2.5-flash') // or 'claude-3-sonnet', 'gpt-4', etc.
    .withTools(tools)
    .withInstructions(`
      You are a specialized DAO Proposal Analyst agent.
      
      Your responsibilities:
      1. Fetch proposal details using fetchProposal
      2. Analyze financial impact on DAO treasury using analyzeFinancialImpact
      3. Assess security risks using assessSecurityRisk
      4. Generate a comprehensive summary with key findings
      
      Always provide:
      - Clear financial impact assessment
      - Identified security concerns
      - Risk level classification
      - Actionable recommendations
      
      Be objective, thorough, and highlight both pros and cons.
    `)
    .withMetadata({
      agentId: 'proposal-analyst-001',
      version: '1.0.0',
      capabilities: ['proposal-analysis', 'financial-assessment', 'risk-evaluation']
    })
    .build();
}

// Usage
const agent = await createProposalAnalystAgent();
const result = await agent.run(`Analyze proposal ${proposalId} for DAO ${daoAddress}`);
```

### Step 4: Implement Workflows with ADK-TS

```typescript
import { Workflow, AgentOrchestrator } from '@iqai/adk-core';

export class GovernanceWorkflow extends Workflow {
  private proposalAnalyst: Agent;
  private votingStrategist: Agent;
  private treasuryMonitor: Agent;

  async initialize() {
    this.proposalAnalyst = await createProposalAnalystAgent();
    this.votingStrategist = await createVotingStrategistAgent();
    this.treasuryMonitor = await createTreasuryMonitorAgent();
  }

  async execute(input: WorkflowInput): Promise<WorkflowOutput> {
    // Step 1: Parallel agent execution
    const [proposalAnalysis, treasuryStatus] = await Promise.all([
      this.runAgent(this.proposalAnalyst, 
        `Analyze proposal ${input.proposalId} for DAO ${input.daoAddress}`
      ),
      this.runAgent(this.treasuryMonitor,
        `Monitor treasury health for DAO ${input.daoAddress}`
      ),
    ]);

    // Step 2: Sequential execution with context
    const votingRecommendation = await this.runAgent(
      this.votingStrategist,
      `Generate voting recommendation based on:
       Proposal Analysis: ${JSON.stringify(proposalAnalysis)}
       Treasury Status: ${JSON.stringify(treasuryStatus)}
       User Preferences: ${JSON.stringify(input.userContext.preferences)}`
    );

    return {
      proposalAnalysis,
      treasuryStatus,
      votingRecommendation,
      // ... rest of output
    };
  }
}
```

### Step 5: Integrate MCP Servers with ADK-TS

```typescript
import { MCPServer } from '@iqai/adk-mcp';

export class BlockchainDataMCPServer extends MCPServer {
  constructor(config: BlockchainDataConfig) {
    super({
      name: 'blockchain-data',
      version: '1.0.0',
      description: 'Blockchain data access via The Graph and ethers.js',
    });
    
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.graphqlEndpoint = config.graphqlEndpoint;
  }

  // Register resources
  async onInitialize() {
    this.registerResource({
      uri: 'blockchain://proposals',
      name: 'DAO Proposals',
      description: 'Access to DAO proposal data',
      mimeType: 'application/json',
    });

    this.registerResource({
      uri: 'blockchain://treasury',
      name: 'DAO Treasury',
      description: 'Treasury balance and composition',
      mimeType: 'application/json',
    });
  }

  // Handle resource requests
  async onResourceRequest(uri: string, params: any) {
    if (uri === 'blockchain://proposals') {
      return await this.getProposalData(params.proposalId);
    }
    if (uri === 'blockchain://treasury') {
      return await this.getTreasuryBalance(params.daoAddress);
    }
  }

  // Existing methods remain the same
  async getProposalData(proposalId: string): Promise<ProposalData> {
    // ... existing implementation
  }

  async getTreasuryBalance(daoAddress: string): Promise<TreasuryBalance> {
    // ... existing implementation
  }
}
```

## ADK-TS Tool Definitions

### Complete Tool Registry

```typescript
// src/adk-agents/tools/adk-tools.ts
import { tool } from '@iqai/adk-core';
import { z } from 'zod';
import { mcpServers } from './enhanced-dao-tools';

export const daoTools = {
  // Proposal Tools
  fetchProposal: tool({
    name: 'fetch_proposal',
    description: 'Fetch DAO proposal details from blockchain or governance platform',
    input: z.object({
      proposalId: z.string(),
      daoAddress: z.string(),
      platform: z.enum(['onchain', 'snapshot', 'tally']).optional(),
    }),
    execute: async ({ proposalId, daoAddress, platform = 'onchain' }) => {
      if (platform === 'snapshot') {
        return await fetchSnapshotProposal(proposalId);
      }
      return await fetchProposal(proposalId, daoAddress);
    },
    metadata: { riskLevel: 'LOW' },
  }),

  analyzeFinancialImpact: tool({
    name: 'analyze_financial_impact',
    description: 'Analyze the financial impact of a proposal on DAO treasury',
    input: z.object({
      proposalId: z.string(),
      treasuryAddress: z.string(),
    }),
    execute: async ({ proposalId, treasuryAddress }) => {
      return await analyzeFinancialImpact(proposalId, { treasury: treasuryAddress });
    },
    metadata: { riskLevel: 'LOW' },
  }),

  assessSecurityRisk: tool({
    name: 'assess_security_risk',
    description: 'Assess security risks in a proposal',
    input: z.object({
      proposalId: z.string(),
      proposalContent: z.string(),
    }),
    execute: async ({ proposalId, proposalContent }) => {
      return await assessSecurityRisk(proposalId, proposalContent);
    },
    metadata: { riskLevel: 'LOW' },
  }),

  getTreasuryBalance: tool({
    name: 'get_treasury_balance',
    description: 'Get current DAO treasury balance and token composition',
    input: z.object({
      daoAddress: z.string(),
    }),
    execute: async ({ daoAddress }) => {
      return await getTreasuryBalance(daoAddress);
    },
    metadata: { riskLevel: 'LOW' },
  }),

  getVotingPower: tool({
    name: 'get_voting_power',
    description: 'Get voting power for an address',
    input: z.object({
      address: z.string(),
      blockNumber: z.number().optional(),
    }),
    execute: async ({ address, blockNumber }) => {
      return await getVotingPower(address, blockNumber);
    },
    metadata: { riskLevel: 'LOW' },
  }),

  executeVote: tool({
    name: 'execute_vote',
    description: 'Execute a vote on a DAO proposal (HIGH RISK - requires approval)',
    input: z.object({
      proposalId: z.string(),
      vote: z.enum(['FOR', 'AGAINST', 'ABSTAIN']),
      voterAddress: z.string(),
      reason: z.string().optional(),
    }),
    execute: async ({ proposalId, vote, voterAddress, reason }) => {
      return await executeVote(proposalId, vote, voterAddress, reason);
    },
    metadata: { 
      riskLevel: 'HIGH',
      requiresApproval: true,
    },
  }),

  compareWithHistory: tool({
    name: 'compare_with_history',
    description: 'Compare proposal with historical similar proposals',
    input: z.object({
      proposalId: z.string(),
      limit: z.number().default(5),
    }),
    execute: async ({ proposalId, limit }) => {
      const historical = await getHistoricalProposals('', limit);
      return await compareWithHistory(proposalId, historical);
    },
    metadata: { riskLevel: 'LOW' },
  }),
};
```

## Agent Instructions Best Practices

### Writing Effective Agent Instructions

```typescript
const instructions = `
You are a ${AGENT_NAME} specialized in ${DOMAIN}.

## Core Responsibilities
1. ${Responsibility 1}
2. ${Responsibility 2}
3. ${Responsibility 3}

## Available Tools
- tool_name_1: Brief description of when to use
- tool_name_2: Brief description of when to use

## Decision Framework
When analyzing ${SUBJECT}:
1. First, gather all relevant data using ${TOOLS}
2. Then, assess ${CRITERIA}
3. Finally, provide ${OUTPUT_FORMAT}

## Output Format
Always structure your response as:
{
  "analysis": "Detailed analysis",
  "recommendation": "Clear recommendation",
  "confidence": 0.0-1.0,
  "reasoning": ["Reason 1", "Reason 2"]
}

## Constraints
- Never ${FORBIDDEN_ACTION}
- Always ${REQUIRED_ACTION}
- Prioritize ${PRIORITY}

## Edge Cases
- If ${CONDITION}, then ${ACTION}
- Handle errors gracefully by ${ERROR_HANDLING}
`;
```

### Example: Proposal Analyst Instructions

```typescript
const proposalAnalystInstructions = `
You are a DAO Proposal Analyst Agent specialized in analyzing governance proposals.

## Core Responsibilities
1. Fetch and parse proposal details
2. Analyze financial impact on DAO treasury
3. Identify security risks and vulnerabilities
4. Generate comprehensive summary for voters

## Available Tools
- fetch_proposal: Retrieve proposal from blockchain or governance platform
- analyze_financial_impact: Calculate cost and treasury impact
- assess_security_risk: Evaluate security concerns
- get_treasury_balance: Check current DAO treasury status

## Analysis Framework
For each proposal:
1. Fetch proposal details using fetch_proposal
2. Analyze financial aspects:
   - Estimated cost
   - Treasury impact percentage
   - Affected tokens
3. Assess security using assess_security_risk:
   - Smart contract changes
   - Permission modifications
   - External dependencies
4. Compare with treasury health using get_treasury_balance
5. Generate risk score (0.0 = no risk, 1.0 = critical risk)

## Risk Scoring
Calculate overall risk based on:
- Financial risk: 30% weight
- Security risk: 35% weight
- Governance risk: 20% weight
- Execution risk: 15% weight

## Output Format
{
  "proposalId": "string",
  "proposal": {
    "title": "string",
    "description": "string",
    "status": "string"
  },
  "financialImpact": {
    "estimatedCost": number,
    "treasuryImpact": number,
    "riskScore": number
  },
  "securityAnalysis": {
    "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "concerns": ["concern1", "concern2"]
  },
  "summary": "string"
}

## Constraints
- Never recommend voting without completing full analysis
- Always highlight CRITICAL security risks prominently
- Prioritize factual analysis over opinions
- If data is incomplete, clearly state limitations

## Edge Cases
- If proposal data is unavailable, return clear error with retry guidance
- If treasury impact >20%, flag for additional human review
- If security risks are HIGH or CRITICAL, require approval before proceeding
`;
```

## Testing ADK-TS Integration

```typescript
// test/adk-integration.test.ts
import { describe, it, expect } from 'vitest';
import { createProposalAnalystAgent } from '../src/adk-agents/agents/proposal-analyst-adk';

describe('ADK-TS Agent Integration', () => {
  it('should create proposal analyst agent', async () => {
    const agent = await createProposalAnalystAgent();
    expect(agent).toBeDefined();
    expect(agent.run).toBeDefined();
  });

  it('should analyze proposal', async () => {
    const agent = await createProposalAnalystAgent();
    const result = await agent.run(
      'Analyze proposal proposal-001 for DAO 0xDAO'
    );
    
    expect(result).toHaveProperty('proposalId');
    expect(result).toHaveProperty('financialImpact');
    expect(result).toHaveProperty('securityAnalysis');
  });

  it('should handle errors gracefully', async () => {
    const agent = await createProposalAnalystAgent();
    await expect(
      agent.run('Analyze invalid proposal')
    ).rejects.toThrow();
  });
});
```

## Deployment Considerations

### Environment Setup

```typescript
// config/adk-config.ts
export const adkConfig = {
  model: {
    provider: process.env.ADK_MODEL_PROVIDER || 'gemini',
    name: process.env.ADK_MODEL_NAME || 'gemini-2.5-flash',
    apiKey: process.env.ADK_API_KEY,
  },
  
  agents: {
    proposalAnalyst: {
      enabled: true,
      retries: 3,
      timeout: 30000,
    },
    votingStrategist: {
      enabled: true,
      retries: 3,
      timeout: 20000,
    },
    treasuryMonitor: {
      enabled: true,
      retries: 2,
      timeout: 15000,
    },
  },
  
  mcp: {
    servers: {
      blockchainData: {
        enabled: true,
        cacheEnabled: true,
        cacheTTL: 300,
      },
      governancePlatform: {
        enabled: true,
        cacheEnabled: true,
        cacheTTL: 600,
      },
      riskAssessment: {
        enabled: true,
        cacheEnabled: false,
      },
    },
  },
};
```

## Migration Checklist

- [ ] Install ADK-TS SDK
- [ ] Convert tools to ADK tool format
- [ ] Update agent classes to use AgentBuilder
- [ ] Implement workflow patterns with ADK Workflow class
- [ ] Register MCP servers with ADK MCP protocol
- [ ] Update agent instructions for optimal LLM performance
- [ ] Add comprehensive error handling
- [ ] Implement retry logic with exponential backoff
- [ ] Add caching layer for expensive operations
- [ ] Update tests for ADK integration
- [ ] Update documentation with ADK examples
- [ ] Configure deployment environment
- [ ] Set up monitoring and observability
- [ ] Perform integration testing
- [ ] Deploy to production

## Resources

- [ADK-TS Documentation](#) (when available)
- [ADK-TS GitHub Repository](#)
- [ADK-TS Examples](#)
- [MCP Protocol Specification](#)

---

**Note**: This guide is based on the expected ADK-TS patterns. Update as needed when official SDK documentation becomes available.

