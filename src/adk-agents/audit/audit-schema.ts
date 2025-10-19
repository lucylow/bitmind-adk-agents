import { z } from 'zod';

export const AuditLogSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  agentId: z.string(),
  agentName: z.string(),
  actionType: z.enum(['TOOL_CALL', 'AGENT_RUN', 'APPROVAL', 'VOTE_EXECUTION']),
  toolName: z.string().optional(),
  inputs: z.record(z.string(), z.any()),
  outputs: z.record(z.string(), z.any()).optional(),
  modelVersion: z.string(),
  confidence: z.number().min(0).max(1).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['SUCCESS', 'FAILED', 'PENDING_APPROVAL']),
  approverAddress: z.string().optional(),
  approvalTimestamp: z.date().optional(),
  txHash: z.string().optional(),
  error: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

export class AuditLogger {
  private logs: AuditLog[] = [];

  log(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const auditLog: AuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.logs.push(auditLog);
    console.log(`[AUDIT] ${auditLog.id}: ${auditLog.actionType} - ${auditLog.agentName}`);

    return auditLog;
  }

  getLogs(filter?: { agentId?: string; actionType?: string }): AuditLog[] {
    if (!filter) return this.logs;

    return this.logs.filter((log) => {
      if (filter.agentId && log.agentId !== filter.agentId) return false;
      if (filter.actionType && log.actionType !== filter.actionType) return false;
      return true;
    });
  }

  getLog(id: string): AuditLog | undefined {
    return this.logs.find((log) => log.id === id);
  }
}

export const auditLogger = new AuditLogger();

