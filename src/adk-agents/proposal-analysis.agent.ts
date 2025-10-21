// src/adk-agents/proposal-analysis.agent.ts
import { AgentBuilder } from "@iqai/adk";
import { z } from "zod";
import { fetchProposalTool, analyzeFinancialImpactTool } from "../tools/dao-tools";
import { relevanceClassifierTool } from "../tools/guardrails";
import { guardrailManager } from "../guardrail-manager";

/**
 * Schema for ProposalAnalysis structured output
 */
export const ProposalAnalysisSchema = z.object({
  proposalId: z.string(),
  executiveSummary: z.string(),
  financials: z.object({
    treasuryPercent: z.number().nullable(),
    amountUSD: z.number().nullable(),
    assetTypes: z.array(z.string()).nullable(),
  }).nullable(),
  financialImpact: z.object({
    impactScore: z.number().min(0).max(1),
    summary: z.string(),
    estimatedUsdImpact: z.number().nullable(),
  }),
  securityRisks: z.array(z.string()),
  recommendation: z.enum(["FOR", "AGAINST", "ABSTAIN"]),
  confidence: z.number().min(0).max(1),
  missingFields: z.array(z.string()).optional(),
  metadata: z.object({
    modelUsed: z.string(),
    modelConfidence: z.number().optional(),
    timestamp: z.number(),
    agentVersion: z.string(),
  }),
});
export type ProposalAnalysis = z.infer<typeof ProposalAnalysisSchema>;

/**
 * Clear, numbered instructions (important for agent determinism).
 * The agent must return JSON conforming to ProposalAnalysisSchema.
 */
const INSTRUCTIONS = `
You are ProposalAnalystAgent. For the requested proposalId do the following EXACTLY and return JSON that conforms to ProposalAnalysisSchema.

1) Validate scope: call relevance_classifier on the proposal text. If not relevant return an ABSTAIN minimal JSON with confidence 0.
2) Fetch proposal: call fetch_proposal({proposalId}).
3) Extract financials: parse amounts, tokens, percent of treasury and populate 'financials'.
4) Run analyze_financial_impact on the proposal -> populate 'financialImpact'.
5) Run security checks (if available) and set 'securityRisks' array.
6) Synthesize 'executiveSummary' (3-4 sentences), a recommended action FOR|AGAINST|ABSTAIN, and a confidence [0,1].
7) If required data is missing, set recommendation to ABSTAIN and include 'missingFields' list.
8) Add metadata: modelUsed, timestamp, agentVersion.
Return only JSON (no extra commentary).
`;

/**
 * Build the agent
 */
export const createProposalAnalystAgent = () =>
  AgentBuilder.create("proposal-analyst")
    .withModel({ default: "gemini-2.5-flash", fallback: "gpt-4o-mini" })
    .withTools([relevanceClassifierTool, fetchProposalTool, analyzeFinancialImpactTool])
    .withInstruction(INSTRUCTIONS)
    // If ADK-TS supports output schema binding, connect it / otherwise validate programmatically
    .build();

/**
 * A helper runner that performs guardrail checks and then runs the agent.
 * Use this wrapper in orchestrator to ensure inputs are validated and sanitized.
 */
export async function runProposalAnalysis(agent: any, proposalId: string, ctx: any = {}) {
  // Run fetch to get proposal text for guardrail
  const proposal = await fetchProposalTool.execute({ proposalId });
  await guardrailManager.runInputChecks(proposal.title + "\n" + proposal.description, ctx);
  // run agent
  const res = await agent.run(`Analyze proposal ${proposalId}`);
  // The agent should return JSON - validate
  try {
    const parsed = ProposalAnalysisSchema.parse(res);
    return parsed;
  } catch (err) {
    // If validation fails, return safe abstain response
    return {
      proposalId,
      executiveSummary: "",
      financials: null,
      financialImpact: { impactScore: 0, summary: "parsing_failed", estimatedUsdImpact: null },
      securityRisks: [],
      recommendation: "ABSTAIN",
      confidence: 0,
      metadata: { modelUsed: "unknown", timestamp: Date.now(), agentVersion: "v0.0.0" },
    } as ProposalAnalysis;
  }
}

