/**
 * ADK-TS Treasury Monitor Agent
 * Real-time monitoring and analysis of DAO treasury health
 */

import { AgentBuilder } from '../core/agent-builder';
import {
  getTreasuryBalanceTool,
  analyzeFinancialImpactTool,
  getGovernanceMetricsTool,
} from '../tools/stacks-blockchain-tools';
import type { Agent } from '../core/agent-builder';

const TREASURY_MONITOR_INSTRUCTIONS = `
You are an expert Treasury Monitor Agent specializing in DAO financial health and risk management.

Your responsibilities:
1. Monitor real-time treasury balance and composition
2. Track token diversification and liquidity
3. Detect anomalies and unusual patterns
4. Assess treasury health score
5. Generate alerts for risk conditions

Treasury Health Metrics:
- Diversification Score: Token variety and distribution
- Liquidity Ratio: Stablecoins vs volatile assets
- Runway Analysis: Operating expenses vs available funds
- Risk Exposure: Concentration in high-risk assets

Alert Triggers:
- Low stablecoin ratio (< 30%)
- High concentration in single asset (> 60%)
- Significant balance changes (> 20% in 24h)
- Low liquidity for upcoming obligations
- Unusual transaction patterns

Health Score Calculation:
- 0.9-1.0: Excellent - Well diversified, high liquidity
- 0.7-0.89: Good - Balanced portfolio, adequate reserves
- 0.5-0.69: Fair - Some concerns, attention needed
- 0.3-0.49: Poor - Significant risks, action required
- Below 0.3: Critical - Immediate intervention needed

Output Format:
- Current treasury status with key metrics
- Health score with breakdown
- Active alerts with severity levels
- Recommendations for improvement
- Trend analysis (improving/declining)
`;

export function createTreasuryMonitorAgent(): Agent {
  return AgentBuilder
    .create('treasury-monitor-adk')
    .withName('TreasuryMonitorAgent')
    .withDescription('AI-powered agent that monitors DAO treasury health and detects financial risks in real-time')
    .withModel('gemini-2.5-flash')
    .withInstructions(TREASURY_MONITOR_INSTRUCTIONS)
    .withTools([
      getTreasuryBalanceTool,
      analyzeFinancialImpactTool,
      getGovernanceMetricsTool,
    ])
    .withMemory({
      type: 'short-term',
      maxEntries: 500,
    })
    .withTemperature(0.2) // Very low temperature for consistent monitoring
    .withMaxTokens(4096)
    .build();
}

export const treasuryMonitorAgentADK = createTreasuryMonitorAgent();

// Treasury health assessment
export async function assessTreasuryHealth(daoAddress: string) {
  const agent = treasuryMonitorAgentADK;
  
  const prompt = `
Assess the current health of the DAO treasury at ${daoAddress}.

Provide a comprehensive health report including:
1. Total treasury value and token breakdown
2. Diversification score (0-1)
3. Liquidity ratio and stablecoin percentage
4. Health score (0-1) with detailed breakdown
5. Active alerts and concerns
6. Recommendations for improvement
7. Trend analysis

Use all available tools to gather real-time data.
  `.trim();

  return agent.run(prompt, { daoAddress });
}

// Continuous monitoring with alert generation
export class TreasuryMonitor {
  private agent: Agent;
  private monitoringInterval?: NodeJS.Timeout;
  private alertCallbacks: Array<(alert: TreasuryAlert) => void> = [];

  constructor() {
    this.agent = treasuryMonitorAgentADK;
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(daoAddress: string, intervalMs: number = 60000) {
    console.log(`[TREASURY MONITOR] Starting monitoring for ${daoAddress}`);
    
    this.monitoringInterval = setInterval(async () => {
      try {
        const health = await assessTreasuryHealth(daoAddress);
        await this.checkForAlerts(health);
      } catch (error) {
        console.error('[TREASURY MONITOR] Error:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      console.log('[TREASURY MONITOR] Monitoring stopped');
    }
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (alert: TreasuryAlert) => void) {
    this.alertCallbacks.push(callback);
  }

  /**
   * Check for alert conditions
   */
  private async checkForAlerts(healthData: any) {
    const alerts: TreasuryAlert[] = [];

    // Extract data from health assessment
    const healthScore = healthData.healthScore || 0;
    const stablecoinRatio = healthData.stablecoinRatio || 0;
    const diversificationScore = healthData.diversificationScore || 0;

    // Check alert conditions
    if (healthScore < 0.3) {
      alerts.push({
        severity: 'CRITICAL',
        type: 'LOW_HEALTH_SCORE',
        message: `Treasury health score critically low: ${healthScore.toFixed(2)}`,
        timestamp: Date.now(),
        data: healthData,
      });
    } else if (healthScore < 0.5) {
      alerts.push({
        severity: 'HIGH',
        type: 'LOW_HEALTH_SCORE',
        message: `Treasury health score below threshold: ${healthScore.toFixed(2)}`,
        timestamp: Date.now(),
        data: healthData,
      });
    }

    if (stablecoinRatio < 0.3) {
      alerts.push({
        severity: 'MEDIUM',
        type: 'LOW_STABLECOIN_RATIO',
        message: `Stablecoin ratio low: ${(stablecoinRatio * 100).toFixed(0)}%`,
        timestamp: Date.now(),
        data: healthData,
      });
    }

    if (diversificationScore < 0.3) {
      alerts.push({
        severity: 'MEDIUM',
        type: 'LOW_DIVERSIFICATION',
        message: `Low treasury diversification: ${diversificationScore.toFixed(2)}`,
        timestamp: Date.now(),
        data: healthData,
      });
    }

    // Trigger callbacks for each alert
    for (const alert of alerts) {
      this.alertCallbacks.forEach((callback) => callback(alert));
    }
  }
}

export interface TreasuryAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  message: string;
  timestamp: number;
  data: any;
}

// Create singleton monitor
export const treasuryMonitor = new TreasuryMonitor();

// Example usage patterns
export const USAGE_EXAMPLES = {
  oneTimeAssessment: `
const health = await assessTreasuryHealth('SP2X...DAO');
console.log('Treasury Health:', health);
  `,
  
  continuousMonitoring: `
// Start monitoring every minute
treasuryMonitor.startMonitoring('SP2X...DAO', 60000);

// Register alert handler
treasuryMonitor.onAlert((alert) => {
  console.log(\`[ALERT \${alert.severity}] \${alert.message}\`);
  // Send notification to Discord/Telegram
  notifyChannel(alert);
});

// Later, stop monitoring
treasuryMonitor.stopMonitoring();
  `,
  
  customAlerts: `
// Assess and check custom conditions
const health = await assessTreasuryHealth(daoAddress);
if (health.tokens.some(t => t.percentage > 60)) {
  console.warn('High concentration detected!');
}
  `,
};
