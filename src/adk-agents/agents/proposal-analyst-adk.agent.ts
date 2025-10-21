/**
 * ADK-TS Proposal Analyst Agent
 * Analyzes DAO proposals using AI and blockchain data
 */

import { AgentBuilder } from '../core/agent-builder';
import {
  fetchProposalTool,
  analyzeFinancialImpactTool,
  assessSecurityRiskTool,
  analyzeProposalSentimentTool,
  getGovernanceMetricsTool,
} from '../tools/stacks-blockchain-tools';
import type { Agent } from '../core/agent-builder';

const PROPOSAL_ANALYST_INSTRUCTIONS = `
You are an expert DAO Proposal Analyst Agent specializing in blockchain governance analysis.

Your responsibilities:
1. Fetch and analyze DAO proposal details from the Stacks blockchain
2. Evaluate financial impact on treasury and token holders
3. Assess security risks including smart contract vulnerabilities
4. Analyze community sentiment and voting patterns
5. Provide comprehensive risk assessment and recommendations

Analysis Framework:
- Financial Impact: Calculate cost, treasury impact %, risk score
- Security Analysis: Identify contract risks, upgrade concerns, token operations
- Community Sentiment: Analyze voting trends, large holder support
- Governance Metrics: Participation rates, historical patterns

Output Format:
- Clear, structured analysis with risk levels (LOW/MEDIUM/HIGH)
- Specific concerns with actionable recommendations
- Data-driven insights from blockchain state
- Balanced perspective considering multiple stakeholder views

Always prioritize:
- Accuracy over speed
- Transparency in reasoning
- Risk awareness and disclosure
- Stakeholder protection
`;

export function createProposalAnalystAgent(): Agent {
  return AgentBuilder
    .create('proposal-analyst-adk')
    .withName('ProposalAnalystAgent')
    .withDescription('AI-powered agent that analyzes DAO proposals for financial impact, security risks, and community sentiment')
    .withModel('gemini-2.5-flash')
    .withInstructions(PROPOSAL_ANALYST_INSTRUCTIONS)
    .withTools([
      fetchProposalTool,
      analyzeFinancialImpactTool,
      assessSecurityRiskTool,
      analyzeProposalSentimentTool,
      getGovernanceMetricsTool,
    ])
    .withMemory({
      type: 'short-term',
      maxEntries: 100,
    })
    .withTemperature(0.3) // Lower temperature for more consistent analysis
    .withMaxTokens(4096)
    .build();
}

export const proposalAnalystAgentADK = createProposalAnalystAgent();

// Helper function for quick analysis
export async function analyzeProposal(proposalId: string, daoAddress: string) {
  const agent = proposalAnalystAgentADK;
  
  const prompt = `
Analyze proposal ${proposalId} for DAO at ${daoAddress}.

Provide a comprehensive analysis including:
1. Proposal summary and objectives
2. Financial impact assessment
3. Security risk evaluation
4. Community sentiment analysis
5. Overall recommendation with confidence level

Use all available tools to gather data and provide detailed insights.
  `.trim();

  return agent.run(prompt, { proposalId, daoAddress });
}

// Example usage patterns
export const USAGE_EXAMPLES = {
  basicAnalysis: `analyzeProposal('prop-001', 'SP2X...ABC')`,
  
  withContext: `
const result = await proposalAnalystAgentADK.run(
  'Analyze the treasury allocation proposal for security risks',
  { proposalId: 'prop-001', daoAddress: 'SP2X...ABC', focus: 'security' }
);
  `,
  
  multiProposal: `
// Analyze multiple proposals in sequence
const proposals = ['prop-001', 'prop-002', 'prop-003'];
for (const id of proposals) {
  const analysis = await analyzeProposal(id, daoAddress);
  console.log(analysis);
}
  `,
};
