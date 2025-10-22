/**
 * Example: Proposal Analyst with Enhanced Guardrails & Audit Logging
 * 
 * Shows how to integrate:
 * - Enhanced guardrail manager
 * - Cryptographic audit logging
 * - Human-in-the-loop approvals
 * - Structured output validation with retries
 */

import { z } from 'zod';
import { AgentBuilder } from '../adk-agents/core/agent-builder';
import { 
  guardrailManager,
  GuardrailTripwireTriggered,
  type GuardrailContext 
} from '../guardrail-manager-enhanced';
import { 
  auditLogger,
  computePromptHash,
  computeOutputHash 
} from '../audit/audit-logger';

// ============================================================================
// Structured Output Schema with Versioning
// ============================================================================

export const ProposalAnalysisSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  proposalId: z.string(),
  
  recommendation: z.enum(['APPROVE', 'REJECT', 'ABSTAIN', 'NEEDS_MORE_INFO']),
  confidence: z.number().min(0).max(1),
  
  analysis: z.object({
    financialImpact: z.object({
      estimatedCost: z.number(),
      treasuryImpactPercent: z.number(),
      riskScore: z.number().min(0).max(1),
    }),
    
    securityRisks: z.array(z.object({
      risk: z.string(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      mitigation: z.string().optional(),
    })),
    
    communitySupport: z.object({
      sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED']),
      largeHolderSupport: z.boolean(),
      estimatedTurnout: z.number().min(0).max(1),
    }),
  }),
  
  reasoning: z.string(),
  warnings: z.array(z.string()).optional(),
  
  metadata: z.object({
    timestamp: z.number(),
    modelVersion: z.string(),
    analysisVersion: z.string(),
  }),
});

export type ProposalAnalysis = z.infer<typeof ProposalAnalysisSchema>;

// ============================================================================
// Agent with Guardrails & Audit
// ============================================================================

export class ProposalAnalystWithAudit {
  private agentId = 'proposal-analyst';
  private agentVersion = '2.0.0';
  private modelVersion = 'gemini-2.5-flash';
  
  /**
   * Analyze proposal with full guardrails and audit trail
   */
  async analyzeProposal(
    proposalId: string,
    daoAddress: string,
    options: {
      userId?: string;
      userRole?: string;
      userConfirmed?: boolean;
      dryRun?: boolean;
    } = {}
  ): Promise<{
    analysis?: ProposalAnalysis;
    status: 'success' | 'pending_approval' | 'blocked' | 'error';
    runId: string;
    approvalId?: string;
    auditId?: string;
    error?: string;
  }> {
    const runId = this.generateRunId();
    const startTime = Date.now();
    
    console.log(`[ProposalAnalyst] Starting analysis for ${proposalId}, runId: ${runId}`);
    
    try {
      // Step 1: Check guardrails for tool usage
      const guardrailContext: GuardrailContext = {
        runId,
        agentId: this.agentId,
        modelVersion: this.modelVersion,
        userRole: options.userRole,
        userConfirmed: options.userConfirmed,
        dryRun: options.dryRun,
        runSnapshot: {
          proposalId,
          daoAddress,
          timestamp: Date.now(),
        },
      };
      
      // Check if we can fetch proposal (LOW risk)
      await guardrailManager.assertToolAllowed('fetch_proposal', guardrailContext);
      
      // Step 2: Fetch proposal data
      const proposalData = await this.fetchProposal(proposalId, daoAddress);
      
      // Step 3: Run AI analysis
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(proposalData);
      
      let rawOutput = await this.callModel(systemPrompt, userPrompt);
      
      // Step 4: Parse and validate with retries
      const analysis = await this.parseWithRetry(rawOutput, systemPrompt, userPrompt);
      
      // Step 5: Check guardrails for recommendation action
      if (analysis.recommendation !== 'ABSTAIN' && analysis.recommendation !== 'NEEDS_MORE_INFO') {
        guardrailContext.modelConfidence = analysis.confidence;
        
        // Higher risk if we're recommending action
        try {
          await guardrailManager.assertToolAllowed('analyze_financial_impact', guardrailContext);
        } catch (error) {
          if (error instanceof GuardrailTripwireTriggered) {
            // Guardrail blocked - return pending status
            console.log(`[ProposalAnalyst] Guardrail triggered: ${error.decision.reason}`);
            
            // Log audit event as blocked
            const auditId = await auditLogger.logRun({
              runId,
              agentId: this.agentId,
              agentVersion: this.agentVersion,
              modelVersion: this.modelVersion,
              systemPrompt,
              userPrompt,
              output: analysis,
              confidence: analysis.confidence,
              userContext: {
                userId: options.userId,
                userRole: options.userRole,
              },
              duration: Date.now() - startTime,
              status: 'pending_approval',
              guardrailDecisions: [{
                tripwireId: error.decision.tripwireId,
                reason: error.decision.reason,
                severity: error.decision.severity,
                timestamp: error.decision.timestamp,
              }],
            });
            
            return {
              status: 'pending_approval',
              runId,
              approvalId: error.pendingApprovalId,
              auditId,
            };
          }
          throw error;
        }
      }
      
      // Step 6: Success - log audit event
      const auditId = await auditLogger.logRun({
        runId,
        agentId: this.agentId,
        agentVersion: this.agentVersion,
        modelVersion: this.modelVersion,
        systemPrompt,
        userPrompt,
        output: analysis,
        confidence: analysis.confidence,
        userContext: {
          userId: options.userId,
          userRole: options.userRole,
        },
        duration: Date.now() - startTime,
        status: 'success',
      });
      
      console.log(`[ProposalAnalyst] Analysis complete, auditId: ${auditId}`);
      
      return {
        analysis,
        status: 'success',
        runId,
        auditId,
      };
      
    } catch (error) {
      console.error(`[ProposalAnalyst] Error:`, error);
      
      // Log failed run
      const auditId = await auditLogger.logRun({
        runId,
        agentId: this.agentId,
        agentVersion: this.agentVersion,
        modelVersion: this.modelVersion,
        systemPrompt: '',
        userPrompt: '',
        output: {},
        userContext: {
          userId: options.userId,
          userRole: options.userRole,
        },
        duration: Date.now() - startTime,
        status: 'failure',
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      
      return {
        status: 'error',
        runId,
        auditId,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
  
  /**
   * Parse output with retry logic
   */
  private async parseWithRetry(
    rawOutput: string,
    systemPrompt: string,
    userPrompt: string,
    maxRetries: number = 2
  ): Promise<ProposalAnalysis> {
    let parsed = ProposalAnalysisSchema.safeParse(JSON.parse(rawOutput));
    
    if (parsed.success) {
      return parsed.data;
    }
    
    // Retry with stricter parsing prompt
    for (let i = 0; i < maxRetries; i++) {
      console.warn(`[ProposalAnalyst] Parse failed, retry ${i + 1}/${maxRetries}`);
      
      const fixPrompt = `
The previous output was invalid. Return ONLY valid JSON matching this exact schema:

${JSON.stringify(ProposalAnalysisSchema.shape, null, 2)}

Original output that failed:
${rawOutput}

Please fix and return ONLY the JSON, no other text.
      `.trim();
      
      rawOutput = await this.callModel(systemPrompt, fixPrompt);
      
      try {
        parsed = ProposalAnalysisSchema.safeParse(JSON.parse(rawOutput));
        if (parsed.success) {
          console.log(`[ProposalAnalyst] Parse succeeded on retry ${i + 1}`);
          return parsed.data;
        }
      } catch (e) {
        console.warn(`[ProposalAnalyst] JSON parse error on retry ${i + 1}`);
      }
    }
    
    // All retries failed - return safe abstain
    console.error(`[ProposalAnalyst] All parse attempts failed, returning ABSTAIN`);
    
    return this.safeAbstain();
  }
  
  /**
   * Safe abstain response when parsing fails
   */
  private safeAbstain(): ProposalAnalysis {
    return {
      schemaVersion: '1.0.0',
      proposalId: 'unknown',
      recommendation: 'ABSTAIN',
      confidence: 0,
      analysis: {
        financialImpact: {
          estimatedCost: 0,
          treasuryImpactPercent: 0,
          riskScore: 1,
        },
        securityRisks: [],
        communitySupport: {
          sentiment: 'NEUTRAL',
          largeHolderSupport: false,
          estimatedTurnout: 0,
        },
      },
      reasoning: 'Unable to parse agent output. Recommending abstain for safety.',
      warnings: ['Output validation failed after retries'],
      metadata: {
        timestamp: Date.now(),
        modelVersion: this.modelVersion,
        analysisVersion: this.agentVersion,
      },
    };
  }
  
  private buildSystemPrompt(): string {
    return `You are a DAO proposal analyst. Analyze proposals and provide structured recommendations.`;
  }
  
  private buildUserPrompt(proposalData: any): string {
    return `Analyze this proposal: ${JSON.stringify(proposalData)}`;
  }
  
  private async callModel(systemPrompt: string, userPrompt: string): Promise<string> {
    // Simplified - use actual ADK model call
    return JSON.stringify({
      schemaVersion: '1.0.0',
      proposalId: 'prop-123',
      recommendation: 'APPROVE',
      confidence: 0.85,
      analysis: {
        financialImpact: {
          estimatedCost: 100000,
          treasuryImpactPercent: 5,
          riskScore: 0.3,
        },
        securityRisks: [],
        communitySupport: {
          sentiment: 'POSITIVE',
          largeHolderSupport: true,
          estimatedTurnout: 0.45,
        },
      },
      reasoning: 'Proposal has strong community support and reasonable financial impact.',
      metadata: {
        timestamp: Date.now(),
        modelVersion: this.modelVersion,
        analysisVersion: this.agentVersion,
      },
    });
  }
  
  private async fetchProposal(proposalId: string, daoAddress: string): Promise<any> {
    // Simplified - use actual blockchain fetch
    return { id: proposalId, dao: daoAddress, title: 'Example Proposal' };
  }
  
  private generateRunId(): string {
    return `run-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

// ============================================================================
// Usage Example
// ============================================================================

export async function exampleUsage() {
  const analyst = new ProposalAnalystWithAudit();
  
  // Example 1: Basic analysis (as regular user)
  const result1 = await analyst.analyzeProposal('prop-123', '0xDAO...', {
    userId: 'user-456',
    userRole: 'member',
    userConfirmed: false,
  });
  
  if (result1.status === 'success') {
    console.log('Analysis:', result1.analysis);
    console.log('Audit ID:', result1.auditId);
  } else if (result1.status === 'pending_approval') {
    console.log('Waiting for approval:', result1.approvalId);
  }
  
  // Example 2: Analysis with admin role and confirmation
  const result2 = await analyst.analyzeProposal('prop-456', '0xDAO...', {
    userId: 'admin-789',
    userRole: 'governance-admin',
    userConfirmed: true,
  });
  
  console.log('Admin result:', result2);
}

