// src/agents/proposal-analyst.agent.ts
import { AgentBuilder } from '@iqai/adk';
import { fetchProposalTool, analyzeFinancialImpactTool, assessSecurityRiskTool } from '../tools/dao-tools';

/**
 * Proposal Analyst Agent
 * 
 * Analyzes DAO proposals for financial impact, security risks, and provides
 * comprehensive summaries with executive insights.
 */
export const createProposalAnalystAgent = () => {
  return AgentBuilder
    .withModel('gemini-2.5-flash')  // Alternative: 'gpt-4', 'claude-3.5-sonnet'
    .withTools([
      fetchProposalTool,
      analyzeFinancialImpactTool,
      assessSecurityRiskTool
    ])
    .withInstruction(`
      You are a DAO Proposal Analyst specializing in comprehensive proposal evaluation.
      
      Your responsibilities:
      1. Analyze proposals for financial impact on treasury
      2. Assess security risks and smart contract implications
      3. Summarize key points in clear, actionable language
      4. Provide neutral, fact-based reports with:
         - Executive Summary
         - Financial Impact Assessment
         - Risk Analysis
         - Stakeholder Impact
      
      Always maintain objectivity and cite specific proposal details in your analysis.
      Use the provided tools to fetch real-time blockchain data and treasury information.
    `)
    .build();
};

/**
 * Run proposal analysis
 * @param proposalId - The ID of the proposal to analyze
 * @param daoAddress - The DAO contract address
 */
export async function analyzeProposal(proposalId: string, daoAddress: string) {
  const agent = createProposalAnalystAgent();
  
  const prompt = `Analyze DAO proposal ${proposalId} for DAO at address ${daoAddress}. 
  Provide a comprehensive analysis including:
  - Proposal summary
  - Financial impact on treasury
  - Security risk assessment
  - Recommended considerations for voters`;
  
  return await agent.run(prompt);
}

export default createProposalAnalystAgent;
