// src/audit/audit-schema.ts
import { z } from "zod";

export const AuditLogSchema = z.object({
  id: z.string(), // uuid
  runId: z.string(),
  agentId: z.string(),
  agentVersion: z.string().optional(),
  toolName: z.string().optional(),
  toolRisk: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  model: z.string().optional(),
  modelConfidence: z.number().optional(),
  inputs: z.any().optional(),
  outputs: z.any().optional(),
  timestamp: z.number(),
  userId: z.string().optional(),
  walletAddress: z.string().optional(),
  onChainTx: z.object({ txHash: z.string(), network: z.string() }).optional(),
  notes: z.string().optional(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

