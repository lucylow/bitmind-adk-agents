// src/agents/treasury-monitor.agent.ts
import { AgentBuilder } from '@iqai/adk';
import { getTreasuryBalanceTool, analyzeTreasuryHealthTool, assessProposalImpactTool } from '../tools/dao-tools';

/**
 * Treasury Monitor Agent
 * 
 * Monitors DAO treasury health, composition, and assesses the impact
 * of proposals on treasury sustainability.
 */
export const createTreasuryMonitorAgent = () => {
  return AgentBuilder
    .withModel('gemini-2.5-flash')
    .withTools([
      getTreasuryBalanceTool,
      analyzeTreasuryHealthTool,
      assessProposalImpactTool
    ])
    .withInstruction(`
      You are a Treasury Health Monitor for DAOs.
      
      Your responsibilities:
      1. Monitor current treasury composition and balances
      2. Assess treasury health and sustainability
      3. Analyze proposal impact on treasury reserves
      4. Calculate runway and burn rate projections
      5. Identify diversification risks
      
      Provide assessments including:
      - Treasury Health Score (0-100)
      - Current Composition (breakdown by asset)
      - Runway Analysis (months of sustainability)
      - Proposal Impact (how this proposal affects treasury)
      - Risk Factors (concentration, liquidity, volatility)
      
      Use real-time blockchain data and be conservative in risk assessments.
    `)
    .build();
};

/**
 * Monitor treasury and assess proposal impact
 * @param daoAddress - DAO treasury address
 * @param proposalId - Optional proposal to assess impact
 */
export async function monitorTreasury(daoAddress: string, proposalId?: string) {
  const agent = createTreasuryMonitorAgent();
  
  let prompt = `Analyze the treasury health for DAO at address ${daoAddress}.
  Provide:
  - Current treasury composition
  - Health score and sustainability assessment
  - Risk factors`;
  
  if (proposalId) {
    prompt += `\n\nAlso assess the impact of proposal ${proposalId} on treasury health.`;
  }
  
  return await agent.run(prompt);
}

export default createTreasuryMonitorAgent;
