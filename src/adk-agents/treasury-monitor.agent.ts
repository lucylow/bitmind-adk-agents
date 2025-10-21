// src/adk-agents/treasury-monitor.agent.ts
import { AgentBuilder } from "@iqai/adk";
import { z } from "zod";
import { analyzeFinancialImpactTool } from "../tools/dao-tools";

/**
 * Simple output schema for treasury assessment
 */
export const TreasuryAssessmentSchema = z.object({
  daoAddress: z.string(),
  totalTreasuryUsd: z.number().nullable(),
  exposures: z.array(z.object({ asset: z.string(), usdValue: z.number() })).nullable(),
  liquidityHealthScore: z.number().min(0).max(1),
  notes: z.string().nullable(),
  metadata: z.object({ timestamp: z.number(), agentVersion: z.string() }),
});
export type TreasuryAssessment = z.infer<typeof TreasuryAssessmentSchema>;

const INSTRUCTIONS = `
You are TreasuryMonitorAgent. For a DAO address, return a JSON matching TreasuryAssessmentSchema.
1) Query latest treasury balances (token balances + USD estimates).
2) Calculate liquidity health and concentration risk.
3) Return exposures and a human-readable 'notes' field.
`;

/**
 * Build the agent
 */
export const createTreasuryMonitorAgent = () =>
  AgentBuilder.create("treasury-monitor")
    .withModel("gpt-4o-mini")
    .withTools([analyzeFinancialImpactTool])
    .withInstruction(INSTRUCTIONS)
    .build();

/**
 * Example helper runner:
 */
export async function runTreasuryAssessment(agent: any, daoAddress: string, ctx: any = {}) {
  // TODO: replace with actual on-chain queries and The Graph
  const res = await agent.run(`Assess treasury for ${daoAddress}`);
  try {
    const parsed = TreasuryAssessmentSchema.parse(res);
    return parsed;
  } catch (err) {
    return {
      daoAddress,
      totalTreasuryUsd: null,
      exposures: null,
      liquidityHealthScore: 0,
      notes: "failed_to_parse",
      metadata: { timestamp: Date.now(), agentVersion: "v0.0.0" },
    } as TreasuryAssessment;
  }
}

