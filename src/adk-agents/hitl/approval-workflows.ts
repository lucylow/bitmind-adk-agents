/**
 * Approval Workflows
 * Manages human approval workflows for DAO governance actions
 */

import { AgentBuilder, BaseTool, Agent } from '../core/agent-builder';
import { z } from 'zod';
import {
  ApprovalLevel,
  RiskLevel,
  ActionType,
  ApprovalStatus,
  HITLConfig,
  ApprovalRequest,
  DecisionContext,
  requiresApproval,
  DEFAULT_HITL_CONFIG
} from './core-hierarchy';

// In-memory storage for approval requests (use database in production)
const pendingApprovals = new Map<string, ApprovalRequest>();
const approvalHistory = new Map<string, ApprovalRequest[]>();

/**
 * Generate unique approval request ID
 */
function generateApprovalId(): string {
  return `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Tool: Check if approval is required
 */
export const checkApprovalRequiredTool: BaseTool = {
  name: 'check_approval_required',
  description: 'Determine if an action requires human approval based on risk and user preferences',
  inputSchema: z.object({
    actionType: z.nativeEnum(ActionType),
    riskLevel: z.nativeEnum(RiskLevel),
    amount: z.string().optional(),
    userConfig: z.any(),
    context: z.any().optional()
  }),
  execute: async ({ actionType, riskLevel, amount, userConfig, context }) => {
    const config: HITLConfig = userConfig || DEFAULT_HITL_CONFIG;
    
    let needsApproval = requiresApproval(actionType, riskLevel, config, context);
    let reason = "";
    let suggestedAction = "";
    
    // Determine reason
    if (riskLevel === RiskLevel.CRITICAL) {
      needsApproval = true;
      reason = "Critical risk action always requires human approval for safety";
      suggestedAction = "Review carefully before approving";
    } else if (config.approvalLevel === ApprovalLevel.MANUAL) {
      needsApproval = true;
      reason = "User prefers manual control for all governance actions";
      suggestedAction = "Proceed with manual review";
    } else if (config.approvalLevel === ApprovalLevel.AUTO && riskLevel === RiskLevel.LOW) {
      needsApproval = false;
      reason = "Low risk action can proceed automatically per user settings";
      suggestedAction = "Auto-approve and execute";
    } else if (config.approvalLevel === ApprovalLevel.REVIEW && riskLevel !== RiskLevel.LOW) {
      needsApproval = true;
      reason = `${riskLevel} risk action requires review based on user preferences`;
      suggestedAction = "Request user review and approval";
    }
    
    // Check amount threshold
    if (amount && config.autoApproveThreshold) {
      const numericAmount = parseFloat(amount);
      if (numericAmount > config.autoApproveThreshold) {
        needsApproval = true;
        reason += ` | Amount (${amount}) exceeds auto-approve threshold (${config.autoApproveThreshold})`;
      }
    }
    
    return {
      requiresApproval: needsApproval,
      reason,
      suggestedAction,
      approvalLevel: config.approvalLevel,
      riskLevel,
      estimatedTime: needsApproval ? "Waiting for human input (up to 5 min)" : "Immediate execution",
      confidence: 0.95
    };
  }
};

/**
 * Tool: Request human approval
 */
export const requestHumanApprovalTool: BaseTool = {
  name: 'request_human_approval',
  description: 'Present action to human for approval with clear options and explanations',
  inputSchema: z.object({
    userId: z.string(),
    action: z.nativeEnum(ActionType),
    actionDescription: z.string(),
    parameters: z.record(z.string(), z.any()),
    reasoning: z.string(),
    risks: z.array(z.string()),
    benefits: z.array(z.string()),
    alternatives: z.array(z.string()),
    urgency: z.enum(['low', 'medium', 'high', 'critical']),
    riskLevel: z.nativeEnum(RiskLevel),
    confidence: z.number().min(0).max(1).default(0.8),
    timeoutMs: z.number().default(300000)
  }),
  execute: async ({
    userId,
    action,
    actionDescription,
    parameters,
    reasoning,
    risks,
    benefits,
    alternatives,
    urgency,
    riskLevel,
    confidence,
    timeoutMs
  }) => {
    // Create approval request
    const approvalRequest: ApprovalRequest = {
      id: generateApprovalId(),
      userId,
      action,
      riskLevel,
      actionDescription,
      parameters,
      reasoning,
      risks,
      benefits,
      alternatives,
      urgency,
      estimatedImpact: estimateImpact(action, parameters),
      confidence,
      status: ApprovalStatus.PENDING,
      requestedAt: new Date(),
      expiresAt: new Date(Date.now() + timeoutMs)
    };
    
    // Store request
    pendingApprovals.set(approvalRequest.id, approvalRequest);
    
    // Add to user's history
    if (!approvalHistory.has(userId)) {
      approvalHistory.set(userId, []);
    }
    approvalHistory.get(userId)!.push(approvalRequest);
    
    // Format notification
    console.log('\n' + '='.repeat(70));
    console.log('🔔 APPROVAL REQUIRED'.padStart(45));
    console.log('='.repeat(70));
    console.log(`\n📋 Action: ${actionDescription}`);
    console.log(`⚠️  Risk Level: ${riskLevel.toUpperCase()}`);
    console.log(`⏰ Urgency: ${urgency.toUpperCase()}`);
    console.log(`🎯 AI Confidence: ${(confidence * 100).toFixed(0)}%`);
    console.log(`\n💡 Reasoning:\n   ${reasoning}`);
    
    if (risks.length > 0) {
      console.log(`\n⚠️  Risks:`);
      risks.forEach((risk: string) => console.log(`   • ${risk}`));
    }
    
    if (benefits.length > 0) {
      console.log(`\n✅ Benefits:`);
      benefits.forEach(benefit => console.log(`   • ${benefit}`));
    }
    
    if (alternatives.length > 0) {
      console.log(`\n🔄 Alternatives:`);
      alternatives.forEach((alt, i) => console.log(`   ${i + 1}. ${alt}`));
    }
    
    console.log(`\n📊 Parameters:`);
    Object.entries(parameters).forEach(([key, value]) => {
      console.log(`   ${key}: ${JSON.stringify(value)}`);
    });
    
    console.log(`\n⏱️  Timeout: ${timeoutMs / 1000} seconds`);
    console.log(`🆔 Request ID: ${approvalRequest.id}`);
    console.log('\n' + '='.repeat(70));
    console.log('Awaiting your decision: APPROVE or REJECT');
    console.log('='.repeat(70) + '\n');
    
    return {
      approvalRequestId: approvalRequest.id,
      status: 'pending',
      message: 'Approval request sent to user',
      expiresAt: approvalRequest.expiresAt.toISOString(),
      nextSteps: [
        'User reviews the request',
        'User approves or rejects',
        'System proceeds based on decision'
      ]
    };
  }
};

/**
 * Tool: Check approval status
 */
export const checkApprovalStatusTool: BaseTool = {
  name: 'check_approval_status',
  description: 'Check if a pending approval has been decided by human',
  inputSchema: z.object({
    approvalRequestId: z.string()
  }),
  execute: async ({ approvalRequestId }) => {
    const request = pendingApprovals.get(approvalRequestId);
    
    if (!request) {
      return {
        found: false,
        status: 'not_found',
        message: 'Approval request not found',
        decision: null
      };
    }
    
    // Check if expired
    if (request.status === ApprovalStatus.PENDING && new Date() > request.expiresAt) {
      request.status = ApprovalStatus.TIMEOUT;
      request.decidedAt = new Date();
      request.decisionBy = 'timeout';
      request.decisionReason = 'Request timed out waiting for user response';
    }
    
    return {
      found: true,
      status: request.status,
      decision: request.decision,
      reason: request.decisionReason,
      decidedAt: request.decidedAt?.toISOString(),
      decidedBy: request.decisionBy,
      isComplete: request.status !== ApprovalStatus.PENDING,
      timeRemaining: request.status === ApprovalStatus.PENDING
        ? Math.max(0, request.expiresAt.getTime() - Date.now())
        : 0
    };
  }
};

/**
 * Tool: Handle user decision
 */
export const handleUserDecisionTool: BaseTool = {
  name: 'handle_user_decision',
  description: 'Process user\'s approval or rejection decision',
  inputSchema: z.object({
    approvalRequestId: z.string(),
    decision: z.enum(['approved', 'rejected']),
    reason: z.string().optional(),
    userId: z.string()
  }),
  execute: async ({ approvalRequestId, decision, reason, userId }) => {
    const request = pendingApprovals.get(approvalRequestId);
    
    if (!request) {
      return {
        success: false,
        message: 'Approval request not found'
      };
    }
    
    // Verify user owns this request
    if (request.userId !== userId) {
      return {
        success: false,
        message: 'Unauthorized: User does not own this approval request'
      };
    }
    
    // Check if already decided
    if (request.status !== ApprovalStatus.PENDING) {
      return {
        success: false,
        message: `Request already ${request.status}`,
        currentStatus: request.status
      };
    }
    
    // Update request
    request.status = decision === 'approved' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
    request.decision = decision;
    request.decisionReason = reason || `User ${decision} the request`;
    request.decidedAt = new Date();
    request.decisionBy = 'user';
    
    console.log(`\n✅ Decision Recorded: ${decision.toUpperCase()}`);
    console.log(`Request ID: ${approvalRequestId}`);
    if (reason) console.log(`Reason: ${reason}`);
    console.log(`Time: ${request.decidedAt.toISOString()}\n`);
    
    return {
      success: true,
      decision,
      reason: request.decisionReason,
      decidedAt: request.decidedAt.toISOString(),
      nextStep: decision === 'approved' 
        ? 'Proceeding with approved action'
        : 'Action cancelled per user decision'
    };
  }
};

/**
 * Tool: Get approval history
 */
export const getApprovalHistoryTool: BaseTool = {
  name: 'get_approval_history',
  description: 'Retrieve user\'s approval history for analysis',
  inputSchema: z.object({
    userId: z.string(),
    limit: z.number().optional().default(10),
    status: z.nativeEnum(ApprovalStatus).optional()
  }),
  execute: async ({ userId, limit, status }) => {
    const history = approvalHistory.get(userId) || [];
    
    let filtered = history;
    if (status) {
      filtered = history.filter(req => req.status === status);
    }
    
    const limited = filtered.slice(-limit);
    
    // Calculate statistics
    const stats = {
      total: history.length,
      approved: history.filter(r => r.status === ApprovalStatus.APPROVED).length,
      rejected: history.filter(r => r.status === ApprovalStatus.REJECTED).length,
      timeout: history.filter(r => r.status === ApprovalStatus.TIMEOUT).length,
      pending: history.filter(r => r.status === ApprovalStatus.PENDING).length,
      averageResponseTime: calculateAverageResponseTime(history),
      approvalRate: history.length > 0
        ? history.filter(r => r.status === ApprovalStatus.APPROVED).length / history.length
        : 0
    };
    
    return {
      history: limited.map(req => ({
        id: req.id,
        action: req.action,
        status: req.status,
        decision: req.decision,
        riskLevel: req.riskLevel,
        requestedAt: req.requestedAt.toISOString(),
        decidedAt: req.decidedAt?.toISOString()
      })),
      stats,
      insights: generateHistoryInsights(stats)
    };
  }
};

// Helper functions

function estimateImpact(action: ActionType, parameters: Record<string, any>): string {
  switch (action) {
    case ActionType.VOTE:
      return `Vote on proposal with ${parameters.votingPower || 'available'} voting power`;
    case ActionType.DELEGATE:
      return `Delegate ${parameters.amount || 'tokens'} to ${parameters.delegate || 'address'}`;
    case ActionType.STAKE:
      return `Stake ${parameters.amount || 'amount'} tokens`;
    case ActionType.WITHDRAW:
      return `Withdraw ${parameters.amount || 'amount'} from ${parameters.protocol || 'protocol'}`;
    case ActionType.PROPOSE:
      return `Create new governance proposal`;
    case ActionType.EXECUTE:
      return `Execute approved proposal ${parameters.proposalId || ''}`;
    default:
      return 'Governance action';
  }
}

function calculateAverageResponseTime(history: ApprovalRequest[]): number {
  const decided = history.filter(r => r.decidedAt && r.decisionBy === 'user');
  
  if (decided.length === 0) return 0;
  
  const responseTimes = decided.map(r =>
    r.decidedAt!.getTime() - r.requestedAt.getTime()
  );
  
  const average = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  return Math.round(average / 1000); // Convert to seconds
}

function generateHistoryInsights(stats: any): string[] {
  const insights: string[] = [];
  
  if (stats.total === 0) {
    insights.push('No approval history yet');
    return insights;
  }
  
  if (stats.approvalRate > 0.8) {
    insights.push('High approval rate - you trust AI recommendations');
  } else if (stats.approvalRate < 0.5) {
    insights.push('Low approval rate - consider adjusting AI settings or risk tolerance');
  }
  
  if (stats.timeout > stats.total * 0.2) {
    insights.push('Multiple timeouts detected - consider longer timeout periods');
  }
  
  if (stats.averageResponseTime < 60) {
    insights.push('Quick response times - very engaged with governance');
  } else if (stats.averageResponseTime > 180) {
    insights.push('Slower response times - consider more automated approvals for routine actions');
  }
  
  if (stats.pending > 5) {
    insights.push('Multiple pending requests - review and clear backlog');
  }
  
  return insights;
}

/**
 * Create Approval Workflow Agent
 */
export function createApprovalWorkflowAgent(): Agent {
  return AgentBuilder
    .create('approval-workflow-manager')
    .withName('ApprovalWorkflowManager')
    .withDescription('Manages human approval workflows for DAO governance actions')
    .withModel('gemini-2.5-flash')
    .withInstruction(`
      You manage human approval workflows for DAO governance actions.
      
      WORKFLOW RULES:
      1. **Auto**: AI can execute immediately (low-risk, routine tasks)
      2. **Review**: AI suggests action, human must approve (medium-risk)
      3. **Manual**: Human must perform all steps (high/critical-risk)
      
      COMMUNICATION PRINCIPLES:
      - Always explain WHY approval is needed
      - Clearly present RISKS and BENEFITS
      - Provide ALTERNATIVES for consideration
      - Set appropriate URGENCY levels
      - Give clear NEXT STEPS
      
      SAFETY FIRST:
      - Critical actions always need approval
      - High-value transactions need approval
      - Protocol changes need approval
      - Respect user preferences
      - Default to safety when uncertain
      
      You are the gatekeeper ensuring users stay in control while benefiting from AI assistance.
    `)
    .withTools([
      checkApprovalRequiredTool,
      requestHumanApprovalTool,
      checkApprovalStatusTool,
      handleUserDecisionTool,
      getApprovalHistoryTool
    ])
    .withMemory({
      type: 'short-term',
      maxEntries: 50
    })
    .withTemperature(0.4) // Lower temperature for consistent, reliable approval logic
    .withMaxTokens(2048)
    .build();
}

/**
 * Export singleton instance
 */
export const approvalWorkflowAgent = createApprovalWorkflowAgent();

/**
 * Helper functions for external use
 */
export async function requestApproval(
  userId: string,
  action: ActionType,
  actionDescription: string,
  parameters: Record<string, any>,
  options: {
    reasoning: string;
    risks: string[];
    benefits: string[];
    alternatives?: string[];
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    riskLevel?: RiskLevel;
    confidence?: number;
  }
): Promise<string> {
  const result = await requestHumanApprovalTool.execute({
    userId,
    action,
    actionDescription,
    parameters,
    reasoning: options.reasoning,
    risks: options.risks,
    benefits: options.benefits,
    alternatives: options.alternatives || [],
    urgency: options.urgency || 'medium',
    riskLevel: options.riskLevel || RiskLevel.MEDIUM,
    confidence: options.confidence || 0.8,
    timeoutMs: 300000
  });
  
  return result.approvalRequestId;
}

export async function checkApproval(approvalRequestId: string): Promise<any> {
  return checkApprovalStatusTool.execute({ approvalRequestId });
}

export async function approveRequest(
  approvalRequestId: string,
  userId: string,
  reason?: string
): Promise<any> {
  return handleUserDecisionTool.execute({
    approvalRequestId,
    decision: 'approved',
    reason,
    userId
  });
}

export async function rejectRequest(
  approvalRequestId: string,
  userId: string,
  reason?: string
): Promise<any> {
  return handleUserDecisionTool.execute({
    approvalRequestId,
    decision: 'rejected',
    reason,
    userId
  });
}

/**
 * Export map for external access (for demo/testing)
 */
export { pendingApprovals, approvalHistory };

