/**
 * Core HITL Hierarchy
 * Defines approval levels, risk levels, and configuration for human-in-the-loop governance
 */

import { z } from 'zod';

/**
 * Approval levels determine how much human oversight is required
 */
export enum ApprovalLevel {
  AUTO = "auto",       // AI can act independently for low-risk actions
  REVIEW = "review",   // AI suggests, human must approve before execution
  MANUAL = "manual"    // Human must perform all steps manually
}

/**
 * Risk levels categorize the potential impact of governance actions
 */
export enum RiskLevel {
  LOW = "low",         // Routine decisions, minimal impact
  MEDIUM = "medium",   // Moderate impact, requires consideration
  HIGH = "high",       // Significant treasury or protocol impact
  CRITICAL = "critical" // Protocol-changing, large financial, or security decisions
}

/**
 * Action types that can be performed in governance
 */
export enum ActionType {
  VOTE = "vote",
  DELEGATE = "delegate",
  STAKE = "stake",
  WITHDRAW = "withdraw",
  PROPOSE = "propose",
  EXECUTE = "execute",
  CANCEL = "cancel"
}

/**
 * Configuration for human-in-the-loop behavior
 */
export interface HITLConfig {
  // User's preferred approval level
  approvalLevel: ApprovalLevel;
  
  // User's risk tolerance
  riskTolerance: RiskLevel;
  
  // Number of confirmations required for critical actions
  requiredConfirmations: number;
  
  // Timeout for approval requests (milliseconds)
  timeoutMs: number;
  
  // What to do if user doesn't respond in time
  fallbackAction: 'wait' | 'abort' | 'escalate';
  
  // Auto-approve actions below this threshold
  autoApproveThreshold?: number; // e.g., votes with <1000 tokens
  
  // Notification preferences
  notifyOn?: ApprovalLevel[];
  
  // Delegation preferences for auto-mode
  trustedDelegates?: string[];
}

/**
 * Approval request status
 */
export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  TIMEOUT = "timeout",
  EXPIRED = "expired"
}

/**
 * Approval request structure
 */
export interface ApprovalRequest {
  id: string;
  userId: string;
  action: ActionType;
  riskLevel: RiskLevel;
  
  // Action details
  actionDescription: string;
  parameters: Record<string, any>;
  
  // Context for decision
  reasoning: string;
  risks: string[];
  benefits: string[];
  alternatives: string[];
  
  // Metadata
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: string;
  confidence: number; // AI confidence in recommendation
  
  // Status tracking
  status: ApprovalStatus;
  requestedAt: Date;
  expiresAt: Date;
  decidedAt?: Date;
  
  // Decision
  decision?: 'approved' | 'rejected';
  decisionReason?: string;
  decisionBy?: 'user' | 'timeout' | 'auto';
}

/**
 * Decision context for risk assessment
 */
export interface DecisionContext {
  // User context
  userId: string;
  userExpertise: 'beginner' | 'intermediate' | 'expert' | 'technical';
  userConfig: HITLConfig;
  
  // Historical context
  userVotingHistory?: any[];
  similarPastDecisions?: any[];
  
  // Current state
  currentProposal?: any;
  daoState?: any;
  treasuryState?: any;
  
  // Time constraints
  timeAvailable?: number; // minutes
  deadline?: Date;
}

/**
 * Risk assessment result
 */
export interface RiskAssessment {
  overallRisk: RiskLevel;
  riskFactors: RiskFactor[];
  mitigations: string[];
  requiresApproval: boolean;
  approvalReason: string;
  confidence: number;
}

/**
 * Individual risk factor
 */
export interface RiskFactor {
  category: 'financial' | 'technical' | 'governance' | 'security' | 'reputation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  likelihood: number; // 0-1
  impact: number; // 0-1
  mitigation?: string;
}

/**
 * Safety check result
 */
export interface SafetyCheckResult {
  passed: boolean;
  checks: SafetyCheck[];
  warnings: string[];
  blockers: string[];
  recommendations: string[];
  overallScore: number; // 0-1
}

/**
 * Individual safety check
 */
export interface SafetyCheck {
  name: string;
  passed: boolean;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: Record<string, any>;
}

/**
 * Default HITL configuration
 */
export const DEFAULT_HITL_CONFIG: HITLConfig = {
  approvalLevel: ApprovalLevel.REVIEW,
  riskTolerance: RiskLevel.MEDIUM,
  requiredConfirmations: 1,
  timeoutMs: 300000, // 5 minutes
  fallbackAction: 'wait',
  autoApproveThreshold: 1000,
  notifyOn: [ApprovalLevel.REVIEW, ApprovalLevel.MANUAL]
};

/**
 * Risk thresholds for auto-approval
 */
export const RISK_THRESHOLDS = {
  [ApprovalLevel.AUTO]: {
    maxRisk: RiskLevel.LOW,
    maxAmount: 10000,
    requiresHistory: false
  },
  [ApprovalLevel.REVIEW]: {
    maxRisk: RiskLevel.HIGH,
    maxAmount: Infinity,
    requiresHistory: true
  },
  [ApprovalLevel.MANUAL]: {
    maxRisk: RiskLevel.CRITICAL,
    maxAmount: Infinity,
    requiresHistory: true
  }
};

/**
 * Action risk matrix
 * Maps actions to their inherent risk levels
 */
export const ACTION_RISK_MATRIX: Record<ActionType, RiskLevel> = {
  [ActionType.VOTE]: RiskLevel.LOW,
  [ActionType.DELEGATE]: RiskLevel.MEDIUM,
  [ActionType.STAKE]: RiskLevel.MEDIUM,
  [ActionType.WITHDRAW]: RiskLevel.HIGH,
  [ActionType.PROPOSE]: RiskLevel.MEDIUM,
  [ActionType.EXECUTE]: RiskLevel.HIGH,
  [ActionType.CANCEL]: RiskLevel.MEDIUM
};

/**
 * Helper function to determine if approval is required
 */
export function requiresApproval(
  action: ActionType,
  riskLevel: RiskLevel,
  config: HITLConfig,
  context?: DecisionContext
): boolean {
  // Critical risk always requires approval
  if (riskLevel === RiskLevel.CRITICAL) {
    return true;
  }
  
  // Manual mode always requires approval
  if (config.approvalLevel === ApprovalLevel.MANUAL) {
    return true;
  }
  
  // Auto mode: only approve if risk is below tolerance
  if (config.approvalLevel === ApprovalLevel.AUTO) {
    return riskLevel > config.riskTolerance;
  }
  
  // Review mode: approve if risk is not low
  if (config.approvalLevel === ApprovalLevel.REVIEW) {
    return riskLevel !== RiskLevel.LOW;
  }
  
  return true; // Default to requiring approval
}

/**
 * Helper function to calculate risk score
 */
export function calculateRiskScore(factors: RiskFactor[]): number {
  if (factors.length === 0) return 0;
  
  const scores = factors.map(factor => {
    const severityWeight = {
      low: 0.25,
      medium: 0.5,
      high: 0.75,
      critical: 1.0
    };
    
    return severityWeight[factor.severity] * factor.likelihood * factor.impact;
  });
  
  // Return weighted average
  return scores.reduce((sum, score) => sum + score, 0) / factors.length;
}

/**
 * Helper function to determine overall risk level from score
 */
export function scoreToRiskLevel(score: number): RiskLevel {
  if (score < 0.25) return RiskLevel.LOW;
  if (score < 0.5) return RiskLevel.MEDIUM;
  if (score < 0.75) return RiskLevel.HIGH;
  return RiskLevel.CRITICAL;
}

/**
 * Zod schemas for validation
 */
export const HITLConfigSchema = z.object({
  approvalLevel: z.nativeEnum(ApprovalLevel),
  riskTolerance: z.nativeEnum(RiskLevel),
  requiredConfirmations: z.number().min(1).max(5),
  timeoutMs: z.number().min(30000).max(3600000), // 30s to 1 hour
  fallbackAction: z.enum(['wait', 'abort', 'escalate']),
  autoApproveThreshold: z.number().optional(),
  notifyOn: z.array(z.nativeEnum(ApprovalLevel)).optional(),
  trustedDelegates: z.array(z.string()).optional()
});

export const ApprovalRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  action: z.nativeEnum(ActionType),
  riskLevel: z.nativeEnum(RiskLevel),
  actionDescription: z.string(),
  parameters: z.record(z.string(), z.any()),
  reasoning: z.string(),
  risks: z.array(z.string()),
  benefits: z.array(z.string()),
  alternatives: z.array(z.string()),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  estimatedImpact: z.string(),
  confidence: z.number().min(0).max(1),
  status: z.nativeEnum(ApprovalStatus),
  requestedAt: z.date(),
  expiresAt: z.date(),
  decidedAt: z.date().optional(),
  decision: z.enum(['approved', 'rejected']).optional(),
  decisionReason: z.string().optional(),
  decisionBy: z.enum(['user', 'timeout', 'auto']).optional()
});

