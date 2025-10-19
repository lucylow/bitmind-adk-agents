import { z } from 'zod';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ToolMetadata {
  name: string;
  description: string;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  schema: z.ZodSchema;
}

export const toolRegistry: Map<string, ToolMetadata> = new Map([
  [
    'fetch_proposal',
    {
      name: 'fetch_proposal',
      description: 'Fetch DAO proposal details from blockchain',
      riskLevel: 'LOW',
      requiresApproval: false,
      schema: z.object({
        proposalId: z.string(),
        daoAddress: z.string(),
      }),
    },
  ],
  [
    'analyze_financial_impact',
    {
      name: 'analyze_financial_impact',
      description: 'Analyze financial impact of a proposal on DAO treasury',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      schema: z.object({
        proposalId: z.string(),
        treasuryData: z.record(z.string(), z.any()),
      }),
    },
  ],
  [
    'execute_vote',
    {
      name: 'execute_vote',
      description: 'Execute a vote on-chain (HIGH RISK - requires approval)',
      riskLevel: 'HIGH',
      requiresApproval: true,
      schema: z.object({
        proposalId: z.string(),
        vote: z.enum(['FOR', 'AGAINST', 'ABSTAIN']),
        voterAddress: z.string(),
      }),
    },
  ],
  [
    'get_treasury_balance',
    {
      name: 'get_treasury_balance',
      description: 'Get current DAO treasury balance and composition',
      riskLevel: 'LOW',
      requiresApproval: false,
      schema: z.object({
        daoAddress: z.string(),
      }),
    },
  ],
  [
    'assess_security_risk',
    {
      name: 'assess_security_risk',
      description: 'Assess security risks of a proposal',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      schema: z.object({
        proposalId: z.string(),
        proposalContent: z.string(),
      }),
    },
  ],
]);

export function getToolMetadata(toolName: string): ToolMetadata | undefined {
  return toolRegistry.get(toolName);
}

export function isHighRiskTool(toolName: string): boolean {
  const metadata = getToolMetadata(toolName);
  return metadata?.riskLevel === 'HIGH' || false;
}

