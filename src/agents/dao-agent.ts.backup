// src/agents/dao-agent.ts
import { AgentBuilder } from "@iqai/adk";
import { DAOGovernanceWorkflow } from "../workflows/dao-governance.workflow";
import { connectWalletTool, getWalletBalanceTool } from "../tools/wallet-tools";
import { fetchProposalTool } from "../tools/blockchain-tools";

// Main root agent for general interactions
export const rootAgent = AgentBuilder
  .create("dao-governance-co-pilot")
  .withModel("gemini-2.0-flash-exp")
  .withDescription("Your AI assistant for DAO governance and decentralized decision-making")
  .withInstruction(`
    You are the DAO Governance Co-pilot, an expert AI assistant for decentralized autonomous organizations.

    CAPABILITIES:
    - Analyze governance proposals and provide detailed insights
    - Help users understand complex DAO mechanisms
    - Provide voting recommendations based on user preferences
    - Monitor treasury health and financial impacts
    - Explain Web3 concepts and governance best practices

    INTERACTION STYLE:
    - Be educational and patient with Web3 newcomers
    - Provide clear, actionable advice for experienced users
    - Always explain your reasoning and acknowledge uncertainties
    - Encourage users to do their own research alongside your analysis

    Use the specialized workflow for comprehensive proposal analysis, or provide quick answers for general questions.
  `)
  .withTools([connectWalletTool, getWalletBalanceTool, fetchProposalTool])
  .build();

// Export workflow for coordinated multi-agent tasks
export const governanceWorkflow = new DAOGovernanceWorkflow();

// Quick access agent for simple queries
export const quickAnalysisAgent = AgentBuilder
  .create("quick-analysis")
  .withModel("gemini-2.0-flash-exp")
  .withDescription("Quick analysis agent for simple governance queries")
  .build();

