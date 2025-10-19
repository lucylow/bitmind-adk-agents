import { z } from 'zod';
import { getTreasuryBalance } from '../tools/dao-tools';
import { auditLogger } from '../audit/audit-schema';

export const TreasuryStatusSchema = z.object({
  daoAddress: z.string(),
  totalValue: z.number(),
  tokens: z.array(
    z.object({
      symbol: z.string(),
      balance: z.number(),
      value: z.number(),
      percentage: z.number(),
    })
  ),
  healthScore: z.number(),
  alerts: z.array(z.string()),
});

export type TreasuryStatus = z.infer<typeof TreasuryStatusSchema>;

export class TreasuryMonitorAgent {
  private agentId = 'treasury-monitor-001';
  private agentName = 'TreasuryMonitor';

  async monitor(daoAddress: string): Promise<TreasuryStatus> {
    try {
      const treasuryData = await getTreasuryBalance(daoAddress);

      // Calculate percentages and health score
      const tokens = treasuryData.tokens.map((token) => ({
        ...token,
        percentage: (token.value / treasuryData.totalValue) * 100,
      }));

      // Simple health score calculation
      const diversificationScore = Math.min(tokens.length / 5, 1); // Max 5 tokens
      const stablecoinRatio = tokens
        .filter((t) => t.symbol === 'USDC' || t.symbol === 'USDT')
        .reduce((sum, t) => sum + t.percentage, 0);
      const healthScore =
        diversificationScore * 0.4 + (stablecoinRatio / 100) * 0.6;

      // Generate alerts
      const alerts: string[] = [];
      if (stablecoinRatio < 30) {
        alerts.push('Low stablecoin ratio - consider increasing stable reserves');
      }
      if (tokens.length < 2) {
        alerts.push('Low diversification - consider diversifying holdings');
      }

      const status: TreasuryStatus = {
        daoAddress,
        totalValue: treasuryData.totalValue,
        tokens,
        healthScore,
        alerts,
      };

      // Log the monitoring
      auditLogger.log({
        agentId: this.agentId,
        agentName: this.agentName,
        actionType: 'AGENT_RUN',
        inputs: { daoAddress },
        outputs: status,
        modelVersion: '1.0.0',
        status: 'SUCCESS',
      });

      return status;
    } catch (error) {
      auditLogger.log({
        agentId: this.agentId,
        agentName: this.agentName,
        actionType: 'AGENT_RUN',
        inputs: { daoAddress },
        modelVersion: '1.0.0',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }
}

export const treasuryMonitorAgent = new TreasuryMonitorAgent();

