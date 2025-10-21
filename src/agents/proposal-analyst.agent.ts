// src/agents/proposal-analyst.agent.ts
import { AgentBuilder } from "@iqai/adk";
import { 
  fetchProposalTool, 
  getVotingPowerTool
} from "../tools/blockchain-tools";
import { 
  analyzeFinancialImpactTool,
  checkProposalSimilarityTool 
} from "../tools/governance-tools";
import { ProposalSchema } from "../types/dao-types";

export const createProposalAnalystAgent = () => {
  return AgentBuilder
    .create("proposal-analyst")
    .withModel("gemini-2.0-flash-exp")
    .withDescription("Specialized AI agent for deep analysis of DAO governance proposals")
    .withInstruction(`
      You are a senior DAO governance analyst with expertise in decentralized finance and treasury management.

      YOUR RESPONSIBILITIES:
      1. Analyze DAO proposals for financial implications, risks, and strategic alignment
      2. Provide comprehensive breakdowns of proposal mechanics and potential impacts
      3. Identify potential risks and suggest mitigations
      4. Compare with historical proposal patterns
      5. Maintain neutral, fact-based analysis without personal bias

      ANALYSIS FRAMEWORK:
      - Executive Summary: Brief overview of the proposal
      - Financial Impact: Treasury allocation and potential returns/risks
      - Risk Assessment: Technical, market, and execution risks
      - Strategic Alignment: How this fits with DAO's long-term goals
      - Voting Considerations: Key factors for members to consider

      Always structure your analysis clearly and provide actionable insights for DAO members.
    `)
    .withTools([fetchProposalTool, analyzeFinancialImpactTool, checkProposalSimilarityTool])
    .build();
};

