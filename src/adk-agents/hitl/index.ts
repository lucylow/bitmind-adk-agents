/**
 * Human-in-the-Loop (HITL) Module
 * Central exports for all HITL functionality
 */

// Core hierarchy exports
export {
  ApprovalLevel,
  RiskLevel,
  ActionType,
  ApprovalStatus,
  DEFAULT_HITL_CONFIG,
  ACTION_RISK_MATRIX,
  requiresApproval,
  calculateRiskScore,
  scoreToRiskLevel,
  type HITLConfig,
  type ApprovalRequest,
  type DecisionContext,
  type RiskAssessment,
  type SafetyCheckResult,
  type RiskFactor,
  type SafetyCheck
} from './core-hierarchy';

// Approval workflow exports
export {
  createApprovalWorkflowAgent,
  approvalWorkflowAgent,
  checkApprovalRequiredTool,
  requestHumanApprovalTool,
  checkApprovalStatusTool,
  handleUserDecisionTool,
  getApprovalHistoryTool,
  requestApproval,
  checkApproval,
  approveRequest,
  rejectRequest,
  pendingApprovals,
  approvalHistory
} from './approval-workflows';

// Safety system exports
export {
  createSafetySystemAgent,
  safetySystemAgent,
  verifyParametersTool,
  simulateOutcomeTool,
  detectUnusualPatternsTool,
  requestConfirmationTool,
  assessComprehensiveRiskTool,
  performSafetyCheck
} from './safety-systems';

/**
 * Quick-start HITL interface
 */
import { requestApproval, checkApproval, approveRequest, rejectRequest } from './approval-workflows';
import { performSafetyCheck } from './safety-systems';
import { ActionType, RiskLevel, ApprovalLevel, DEFAULT_HITL_CONFIG, type HITLConfig } from './core-hierarchy';

/**
 * Simple HITL workflow for common use cases
 */
export class HITLWorkflow {
  constructor(private userId: string, private config: HITLConfig = DEFAULT_HITL_CONFIG) {}
  
  /**
   * Request approval for an action
   */
  async requestApproval(
    action: ActionType,
    description: string,
    parameters: Record<string, any>,
    options: {
      reasoning: string;
      risks: string[];
      benefits: string[];
      alternatives?: string[];
    }
  ): Promise<string> {
    return requestApproval(
      this.userId,
      action,
      description,
      parameters,
      options
    );
  }
  
  /**
   * Check if an approval has been decided
   */
  async checkApproval(approvalId: string): Promise<any> {
    return checkApproval(approvalId);
  }
  
  /**
   * Approve an action
   */
  async approve(approvalId: string, reason?: string): Promise<any> {
    return approveRequest(approvalId, this.userId, reason);
  }
  
  /**
   * Reject an action
   */
  async reject(approvalId: string, reason?: string): Promise<any> {
    return rejectRequest(approvalId, this.userId, reason);
  }
  
  /**
   * Perform safety check on action
   */
  async safetyCheck(
    action: ActionType,
    parameters: Record<string, any>
  ): Promise<any> {
    return performSafetyCheck(action, parameters, { userId: this.userId });
  }
}

/**
 * Create a new HITL workflow for a user
 */
export function createHITLWorkflow(userId: string, config?: HITLConfig): HITLWorkflow {
  return new HITLWorkflow(userId, config);
}

/**
 * Feature status
 */
export const HITL_FEATURES = {
  approvalWorkflows: {
    name: 'Approval Workflows',
    description: 'Multi-level approval system with auto/review/manual modes',
    status: 'active'
  },
  safetyChecks: {
    name: 'Safety Checks',
    description: 'Comprehensive parameter and risk verification',
    status: 'active'
  },
  riskAssessment: {
    name: 'Risk Assessment',
    description: 'Multi-dimensional risk analysis',
    status: 'active'
  },
  patternDetection: {
    name: 'Pattern Detection',
    description: 'Unusual activity and anomaly detection',
    status: 'active'
  },
  outcomeSimulation: {
    name: 'Outcome Simulation',
    description: 'Preview action consequences before execution',
    status: 'active'
  }
};

/**
 * Version info
 */
export const HITL_VERSION = {
  version: '1.0.0',
  features: Object.keys(HITL_FEATURES).length,
  timestamp: new Date().toISOString()
};

