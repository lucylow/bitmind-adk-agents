// src/tools/dao-tools.ts
import { tool } from "@iqai/adk";
import { z } from "zod";
import { registerTool } from "../tool-registry";

// NOTE: Replace the "mock" implementations with real RPC / subgraph calls.

export const FetchProposalInput = z.object({
  proposalId: z.string(),
});
export type FetchProposalInput = z.infer<typeof FetchProposalInput>;

export const ProposalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  proposer: z.string(),
  startBlock: z.number().nullable(),
  endBlock: z.number().nullable(),
  metadataUri: z.string().nullable(),
});
export type Proposal = z.infer<typeof ProposalSchema>;

export const fetchProposalTool = tool({
  name: "fetch_proposal",
  description: "Fetch proposal details from the governance platform or IPFS (LOW RISK).",
  input: FetchProposalInput,
  execute: async ({ proposalId }) => {
    // TODO: Replace with The Graph / Snapshot / IPFS calls
    // Mocked example:
    const mock: Proposal = {
      id: proposalId,
      title: `Mock Title for ${proposalId}`,
      description: `Mock description for ${proposalId}. Contains actions and amounts.`,
      proposer: "0xMockProposer",
      startBlock: null,
      endBlock: null,
      metadataUri: null,
    };
    return mock;
  },
});
registerTool({ name: "fetch_proposal", risk: "LOW", description: "Read-only: get proposal details" });

/* -----------------------------
   Financial impact analyzer tool
   ----------------------------- */
export const AnalyzeFinancialImpactInput = z.object({
  proposal: z.any(),
});
export type AnalyzeFinancialImpactInput = z.infer<typeof AnalyzeFinancialImpactInput>;

export const FinancialImpactSchema = z.object({
  impactScore: z.number().min(0).max(1),
  summary: z.string(),
  estimatedUsdImpact: z.number().nullable(),
});
export type FinancialImpact = z.infer<typeof FinancialImpactSchema>;

export const analyzeFinancialImpactTool = tool({
  name: "analyze_financial_impact",
  description: "Assess the financial impact of a proposal on treasury (LOW/MED RISK).",
  input: AnalyzeFinancialImpactInput,
  execute: async ({ proposal }) => {
    // TODO: plug in real treasury simulation / models & The Graph
    // Quick heuristic mock:
    const impactScore = Math.random() * 0.8 + 0.1;
    const estimatedUsdImpact = Math.round((Math.random() * 5_000_000) * 100) / 100;
    const summary = `Estimated impact: ~$${estimatedUsdImpact.toLocaleString()}. Confidence ${Math.round(impactScore*100)}%.`;
    return { impactScore: Number(impactScore.toFixed(3)), summary, estimatedUsdImpact };
  },
});
registerTool({
  name: "analyze_financial_impact",
  risk: "MEDIUM",
  description: "Estimate treasury exposure and highlight key financial considerations",
});

/* -----------------------------
   Execute vote tool (HIGH RISK)
   ----------------------------- */
export const ExecuteVoteInput = z.object({
  proposalId: z.string(),
  support: z.boolean(),
  walletAddress: z.string().optional(),
  signerSignature: z.string().optional(), // for multisig flow
});
export type ExecuteVoteInput = z.infer<typeof ExecuteVoteInput>;

export const executeVoteTool = tool({
  name: "execute_vote",
  description: "Execute a vote on-chain (HIGH RISK). Requires guardrail checks and explicit human confirmation.",
  input: ExecuteVoteInput,
  execute: async ({ proposalId, support, walletAddress }) => {
    // TODO: Implement actual on-chain transaction via ethers / multisig
    // For demo: return a mock tx result
    const txHash = `0xMOCKTX${Math.floor(Math.random() * 1_000_000).toString(16)}`;
    return { success: true, txHash, network: "eth-mainnet-mock" };
  },
});
registerTool({
  name: "execute_vote",
  risk: "HIGH",
  description: "Cast an on-chain voting transaction (write).",
});

/* -----------------------------
   Utility: check voting power (LOW)
   ----------------------------- */
export const CheckVotingPowerInput = z.object({
  address: z.string(),
  snapshotBlock: z.number().optional(),
});
export const checkVotingPowerTool = tool({
  name: "check_voting_power",
  description: "Compute voting power for an address (LOW RISK).",
  input: CheckVotingPowerInput,
  execute: async ({ address }) => {
    // TODO: compute using snapshot / token balances / delegation
    const votingPower = Math.floor(Math.random() * 1000);
    return { address, votingPower };
  },
});
registerTool({ name: "check_voting_power", risk: "LOW", description: "Read-only: fetch voting power" });

export default {
  fetchProposalTool,
  analyzeFinancialImpactTool,
  executeVoteTool,
  checkVotingPowerTool,
};
