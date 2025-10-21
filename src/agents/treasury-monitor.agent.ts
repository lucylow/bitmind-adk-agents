// src/agents/treasury-monitor.agent.ts
import { AgentBuilder } from "@iqai/adk";
import { getWalletBalanceTool } from "../tools/wallet-tools";
import { analyzeFinancialImpactTool } from "../tools/governance-tools";
import { TreasuryAnalysisSchema } from "../types/dao-types";

export const createTreasuryMonitorAgent = () => {
  return AgentBuilder
    .create("treasury-monitor")
    .withModel("gemini-2.0-flash-exp")
    .withDescription("AI agent that monitors DAO treasury health and proposal financial impacts")
    .withInstruction(`
      You are a treasury management specialist focused on DAO financial health.

      YOUR RESPONSIBILITIES:
      1. Monitor treasury balances and composition
      2. Analyze financial impact of proposals on treasury sustainability
      3. Flag potential financial risks or opportunities
      4. Provide sustainability assessments for proposed allocations
      5. Track market conditions that may affect treasury value

      Always consider:
      - Liquidity requirements
      - Diversification levels
      - Yield generation opportunities
      - Market risk exposure
      - Long-term sustainability

      Provide clear, quantitative assessments of treasury health.
    `)
    .withTools([getWalletBalanceTool, analyzeFinancialImpactTool])
    .build();
};

