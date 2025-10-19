import { z } from 'zod';
import {
  fetchProposal,
  analyzeFinancialImpact,
  assessSecurityRisk,
  Proposal,
  FinancialImpact,
} from '../tools/dao-tools';
import { auditLogger } from '../audit/audit-schema';

export const ProposalAnalysisSchema = z.object({
  proposalId: z.string(),
  proposal: z.object({
    title: z.string(),
    description: z.string(),
    status: z.string(),
  }),
  financialImpact: z.object({
    estimatedCost: z.number(),
    treasuryImpact: z.number(),
    riskScore: z.number(),
  }),
  securityAnalysis: z.object({
    riskLevel: z.string(),
    concerns: z.array(z.string()),
  }),
  summary: z.string(),
});

export type ProposalAnalysis = z.infer<typeof ProposalAnalysisSchema>;

export class ProposalAnalystAgent {
  private agentId = 'proposal-analyst-001';
  private agentName = 'ProposalAnalyst';

  async analyze(proposalId: string, daoAddress: string): Promise<ProposalAnalysis> {
    const runId = `run-${Date.now()}`;

    try {
      // Fetch proposal details
      const proposal = await fetchProposal(proposalId, daoAddress);

      // Analyze financial impact
      const financialImpact = await analyzeFinancialImpact(proposalId, {
        treasury: daoAddress,
      });

      // Assess security risks
      const securityAnalysis = await assessSecurityRisk(
        proposalId,
        proposal.description
      );

      // Generate summary
      const summary = this.generateSummary(
        proposal,
        financialImpact,
        securityAnalysis
      );

      const analysis: ProposalAnalysis = {
        proposalId,
        proposal: {
          title: proposal.title,
          description: proposal.description,
          status: proposal.status,
        },
        financialImpact: {
          estimatedCost: financialImpact.estimatedCost,
          treasuryImpact: financialImpact.treasuryImpact,
          riskScore: financialImpact.riskScore,
        },
        securityAnalysis: {
          riskLevel: securityAnalysis.riskLevel,
          concerns: securityAnalysis.concerns,
        },
        summary,
      };

      // Log the analysis
      auditLogger.log({
        agentId: this.agentId,
        agentName: this.agentName,
        actionType: 'AGENT_RUN',
        inputs: { proposalId, daoAddress },
        outputs: analysis,
        modelVersion: '1.0.0',
        status: 'SUCCESS',
      });

      return analysis;
    } catch (error) {
      auditLogger.log({
        agentId: this.agentId,
        agentName: this.agentName,
        actionType: 'AGENT_RUN',
        inputs: { proposalId, daoAddress },
        modelVersion: '1.0.0',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  private generateSummary(
    proposal: Proposal,
    financialImpact: FinancialImpact,
    securityAnalysis: { riskLevel: string; concerns: string[] }
  ): string {
    return `
Proposal: ${proposal.title}
Status: ${proposal.status}
Financial Impact: ${financialImpact.treasuryImpact > 0 ? '+' : ''}${(financialImpact.treasuryImpact * 100).toFixed(2)}% of treasury
Risk Score: ${(financialImpact.riskScore * 100).toFixed(0)}%
Security Risk Level: ${securityAnalysis.riskLevel}
Current Votes: FOR ${proposal.forVotes} | AGAINST ${proposal.againstVotes} | ABSTAIN ${proposal.abstainVotes}
    `.trim();
  }
}

export const proposalAnalystAgent = new ProposalAnalystAgent();

