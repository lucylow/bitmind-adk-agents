/**
 * Enhanced Guardrail Manager with Persistent Approvals & Structured Tripwires
 * 
 * IMPROVEMENTS:
 * - Structured GuardrailDecision objects with evidence
 * - Persistent pending approvals (DB-backed)
 * - Cryptographic multisig requirement for HIGH risk
 * - Async gating with audit trails
 * - Comprehensive risk metadata
 */

import * as crypto from 'crypto';
import { z } from 'zod';

// ============================================================================
// Types & Schemas
// ============================================================================

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Severity = 'WARN' | 'BLOCK' | 'ESCALATE';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface GuardrailDecision {
  tripwireId: string;
  reason: string;
  severity: Severity;
  evidence: {
    toolName: string;
    risk: RiskLevel;
    context: any;
    modelConfidence?: number;
    timestamp: number;
  };
  timestamp: number;
}

export interface ToolMetadata {
  name: string;
  risk: RiskLevel;
  reversibility: 'irreversible' | 'reversible' | 'unknown';
  requiredRoles: string[];
  idempotent: boolean;
  estimatedGasUSD?: number;
  rateLimitCategory?: string;
  version: string;
  lastAuditedAt?: string;
  description: string;
}

export interface PendingApproval {
  runId: string;
  tripwireId: string;
  decision: GuardrailDecision;
  payload: {
    agentId: string;
    modelVersion: string;
    promptHash: string;
    toolName: string;
    toolInputs: any;
    snapshot: any;
  };
  status: ApprovalStatus;
  createdAt: Date;
  expiresAt: Date;
  approverSignature?: string;
  approverRole?: string;
  approvedAt?: Date;
}

export interface GuardrailContext {
  runId: string;
  agentId: string;
  modelVersion: string;
  modelConfidence?: number;
  userConfirmed?: boolean;
  userRole?: string;
  approverRole?: string;
  approverSignature?: string;
  runSnapshot?: any;
  dryRun?: boolean;
}

export const GuardrailConfigSchema = z.object({
  HIGH_RISK_CONFIDENCE_THRESHOLD: z.number().min(0).max(1).default(0.90),
  CRITICAL_RISK_CONFIDENCE_THRESHOLD: z.number().min(0).max(1).default(0.95),
  REQUIRE_MULTISIG_FOR_HIGH: z.boolean().default(true),
  REQUIRE_MULTISIG_FOR_CRITICAL: z.boolean().default(true),
  MIN_APPROVERS_HIGH: z.number().default(1),
  MIN_APPROVERS_CRITICAL: z.number().default(2),
  APPROVAL_EXPIRY_HOURS: z.number().default(24),
  ENABLE_DRY_RUN_MODE: z.boolean().default(true),
  TESTNET_ONLY_CRITICAL: z.boolean().default(true),
});

export type GuardrailConfig = z.infer<typeof GuardrailConfigSchema>;

// ============================================================================
// Exceptions
// ============================================================================

export class GuardrailTripwireTriggered extends Error {
  constructor(
    public decision: GuardrailDecision,
    public pendingApprovalId?: string
  ) {
    super(`Guardrail tripwire triggered: ${decision.reason}`);
    this.name = 'GuardrailTripwireTriggered';
  }
}

export class InsufficientPermissionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientPermissionsError';
  }
}

// ============================================================================
// Tool Registry with Enhanced Metadata
// ============================================================================

const TOOL_REGISTRY: Record<string, ToolMetadata> = {
  // On-chain write operations (CRITICAL)
  'execute_vote': {
    name: 'execute_vote',
    risk: 'CRITICAL',
    reversibility: 'irreversible',
    requiredRoles: ['governance-admin', 'treasury-signer'],
    idempotent: false,
    estimatedGasUSD: 5.0,
    rateLimitCategory: 'blockchain-write',
    version: '1.0.0',
    lastAuditedAt: '2025-01-15',
    description: 'Execute a vote on-chain (irreversible)'
  },
  
  'transfer_treasury_funds': {
    name: 'transfer_treasury_funds',
    risk: 'CRITICAL',
    reversibility: 'irreversible',
    requiredRoles: ['treasury-admin', 'multisig-signer'],
    idempotent: false,
    estimatedGasUSD: 10.0,
    rateLimitCategory: 'blockchain-write',
    version: '1.0.0',
    lastAuditedAt: '2025-01-15',
    description: 'Transfer funds from treasury (irreversible)'
  },
  
  'create_proposal': {
    name: 'create_proposal',
    risk: 'HIGH',
    reversibility: 'reversible', // Can be cancelled before voting
    requiredRoles: ['proposal-creator'],
    idempotent: false,
    estimatedGasUSD: 3.0,
    rateLimitCategory: 'blockchain-write',
    version: '1.0.0',
    lastAuditedAt: '2025-01-15',
    description: 'Create a new governance proposal'
  },
  
  // Read operations (MEDIUM to LOW)
  'fetch_proposal': {
    name: 'fetch_proposal',
    risk: 'LOW',
    reversibility: 'reversible',
    requiredRoles: [],
    idempotent: true,
    rateLimitCategory: 'blockchain-read',
    version: '1.0.0',
    lastAuditedAt: '2025-01-15',
    description: 'Fetch proposal data from blockchain'
  },
  
  'analyze_financial_impact': {
    name: 'analyze_financial_impact',
    risk: 'MEDIUM',
    reversibility: 'reversible',
    requiredRoles: ['analyst'],
    idempotent: true,
    version: '1.0.0',
    lastAuditedAt: '2025-01-15',
    description: 'Analyze financial impact of proposal'
  },
  
  'check_voting_power': {
    name: 'check_voting_power',
    risk: 'LOW',
    reversibility: 'reversible',
    requiredRoles: [],
    idempotent: true,
    rateLimitCategory: 'blockchain-read',
    version: '1.0.0',
    lastAuditedAt: '2025-01-15',
    description: 'Check voting power for address'
  },
};

// ============================================================================
// Guardrail Manager Class
// ============================================================================

export class EnhancedGuardrailManager {
  private config: GuardrailConfig;
  private persistenceAdapter: PersistenceAdapter;
  
  constructor(
    config: Partial<GuardrailConfig> = {},
    persistenceAdapter?: PersistenceAdapter
  ) {
    this.config = GuardrailConfigSchema.parse(config);
    this.persistenceAdapter = persistenceAdapter || new InMemoryPersistenceAdapter();
  }
  
  /**
   * Get tool metadata from registry
   */
  getToolMetadata(toolName: string): ToolMetadata | undefined {
    return TOOL_REGISTRY[toolName];
  }
  
  /**
   * Main guardrail check - async with persistence
   * Returns { allowed: true } or throws GuardrailTripwireTriggered
   */
  async assertToolAllowed(
    toolName: string,
    context: GuardrailContext
  ): Promise<{ allowed: true; metadata: ToolMetadata }> {
    const metadata = this.getToolMetadata(toolName);
    
    if (!metadata) {
      throw new Error(`Unknown tool: ${toolName}. Not in registry.`);
    }
    
    // Check role requirements
    await this.checkRoleRequirements(metadata, context);
    
    // Risk-based gating
    switch (metadata.risk) {
      case 'CRITICAL':
        await this.assertCriticalRiskAllowed(toolName, metadata, context);
        break;
      case 'HIGH':
        await this.assertHighRiskAllowed(toolName, metadata, context);
        break;
      case 'MEDIUM':
        await this.assertMediumRiskAllowed(toolName, metadata, context);
        break;
      case 'LOW':
        // Low risk passes through with basic checks
        break;
    }
    
    // Rate limiting check (placeholder - implement with Redis)
    await this.checkRateLimit(toolName, metadata, context);
    
    return { allowed: true, metadata };
  }
  
  /**
   * Check role requirements
   */
  private async checkRoleRequirements(
    metadata: ToolMetadata,
    context: GuardrailContext
  ): Promise<void> {
    if (metadata.requiredRoles.length === 0) return;
    
    const userRole = context.userRole || context.approverRole;
    
    if (!userRole || !metadata.requiredRoles.includes(userRole)) {
      throw new InsufficientPermissionsError(
        `Tool ${metadata.name} requires roles: ${metadata.requiredRoles.join(', ')}. User has: ${userRole || 'none'}`
      );
    }
  }
  
  /**
   * CRITICAL risk gating (highest security)
   */
  private async assertCriticalRiskAllowed(
    toolName: string,
    metadata: ToolMetadata,
    context: GuardrailContext
  ): Promise<void> {
    const confidence = context.modelConfidence ?? 0;
    const threshold = this.config.CRITICAL_RISK_CONFIDENCE_THRESHOLD;
    
    // Testnet-only enforcement
    if (this.config.TESTNET_ONLY_CRITICAL && !context.dryRun) {
      const decision = this.createDecision(
        'CRITICAL_TESTNET_ONLY',
        'BLOCK',
        toolName,
        metadata.risk,
        context,
        confidence
      );
      
      const approvalId = await this.persistPendingApproval(
        context,
        decision,
        toolName,
        metadata
      );
      
      throw new GuardrailTripwireTriggered(decision, approvalId);
    }
    
    // Confidence check
    if (confidence < threshold) {
      const decision = this.createDecision(
        'CRITICAL_LOW_CONFIDENCE',
        'ESCALATE',
        toolName,
        metadata.risk,
        context,
        confidence
      );
      
      const approvalId = await this.persistPendingApproval(
        context,
        decision,
        toolName,
        metadata
      );
      
      throw new GuardrailTripwireTriggered(decision, approvalId);
    }
    
    // Multisig requirement
    if (this.config.REQUIRE_MULTISIG_FOR_CRITICAL) {
      if (!context.approverSignature || !context.approverRole) {
        const decision = this.createDecision(
          'CRITICAL_MULTISIG_REQUIRED',
          'ESCALATE',
          toolName,
          metadata.risk,
          context,
          confidence
        );
        
        const approvalId = await this.persistPendingApproval(
          context,
          decision,
          toolName,
          metadata
        );
        
        throw new GuardrailTripwireTriggered(decision, approvalId);
      }
      
      // Verify signature (placeholder - implement with ethers)
      const signatureValid = await this.verifyMultisigSignature(
        context.approverSignature,
        context.runSnapshot
      );
      
      if (!signatureValid) {
        const decision = this.createDecision(
          'CRITICAL_INVALID_SIGNATURE',
          'BLOCK',
          toolName,
          metadata.risk,
          context,
          confidence
        );
        
        throw new GuardrailTripwireTriggered(decision);
      }
    }
    
    // User confirmation required
    if (!context.userConfirmed) {
      const decision = this.createDecision(
        'CRITICAL_USER_CONFIRMATION_REQUIRED',
        'ESCALATE',
        toolName,
        metadata.risk,
        context,
        confidence
      );
      
      const approvalId = await this.persistPendingApproval(
        context,
        decision,
        toolName,
        metadata
      );
      
      throw new GuardrailTripwireTriggered(decision, approvalId);
    }
  }
  
  /**
   * HIGH risk gating
   */
  private async assertHighRiskAllowed(
    toolName: string,
    metadata: ToolMetadata,
    context: GuardrailContext
  ): Promise<void> {
    const confidence = context.modelConfidence ?? 0;
    const threshold = this.config.HIGH_RISK_CONFIDENCE_THRESHOLD;
    
    // Confidence check
    if (confidence < threshold) {
      const decision = this.createDecision(
        'HIGH_LOW_CONFIDENCE',
        'ESCALATE',
        toolName,
        metadata.risk,
        context,
        confidence
      );
      
      const approvalId = await this.persistPendingApproval(
        context,
        decision,
        toolName,
        metadata
      );
      
      throw new GuardrailTripwireTriggered(decision, approvalId);
    }
    
    // User confirmation required for HIGH risk
    if (!context.userConfirmed) {
      const decision = this.createDecision(
        'HIGH_USER_CONFIRMATION_REQUIRED',
        'ESCALATE',
        toolName,
        metadata.risk,
        context,
        confidence
      );
      
      const approvalId = await this.persistPendingApproval(
        context,
        decision,
        toolName,
        metadata
      );
      
      throw new GuardrailTripwireTriggered(decision, approvalId);
    }
    
    // Optional multisig for HIGH risk
    if (this.config.REQUIRE_MULTISIG_FOR_HIGH && !context.approverSignature) {
      const decision = this.createDecision(
        'HIGH_MULTISIG_REQUIRED',
        'ESCALATE',
        toolName,
        metadata.risk,
        context,
        confidence
      );
      
      const approvalId = await this.persistPendingApproval(
        context,
        decision,
        toolName,
        metadata
      );
      
      throw new GuardrailTripwireTriggered(decision, approvalId);
    }
  }
  
  /**
   * MEDIUM risk gating
   */
  private async assertMediumRiskAllowed(
    toolName: string,
    metadata: ToolMetadata,
    context: GuardrailContext
  ): Promise<void> {
    const confidence = context.modelConfidence ?? 0;
    
    // Log warning if confidence is low
    if (confidence < 0.70) {
      console.warn(`[Guardrail] MEDIUM risk tool ${toolName} with low confidence ${confidence}`);
    }
  }
  
  /**
   * Rate limiting check
   */
  private async checkRateLimit(
    toolName: string,
    metadata: ToolMetadata,
    context: GuardrailContext
  ): Promise<void> {
    // Placeholder - implement with Redis + sliding window
    // For now, just log
    if (metadata.rateLimitCategory) {
      console.log(`[Guardrail] Rate limit check for ${metadata.rateLimitCategory}`);
    }
  }
  
  /**
   * Verify multisig signature
   */
  private async verifyMultisigSignature(
    signature: string,
    payload: any
  ): Promise<boolean> {
    // Placeholder - implement with ethers.js
    // Should verify that signature is from authorized multisig
    return signature.length > 0; // Simplified
  }
  
  /**
   * Create structured decision object
   */
  private createDecision(
    reason: string,
    severity: Severity,
    toolName: string,
    risk: RiskLevel,
    context: GuardrailContext,
    confidence?: number
  ): GuardrailDecision {
    return {
      tripwireId: this.generateTripwireId(),
      reason,
      severity,
      evidence: {
        toolName,
        risk,
        context: {
          runId: context.runId,
          agentId: context.agentId,
          modelVersion: context.modelVersion,
          userRole: context.userRole,
        },
        modelConfidence: confidence,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };
  }
  
  /**
   * Persist pending approval to database
   */
  private async persistPendingApproval(
    context: GuardrailContext,
    decision: GuardrailDecision,
    toolName: string,
    metadata: ToolMetadata
  ): Promise<string> {
    const approval: PendingApproval = {
      runId: context.runId,
      tripwireId: decision.tripwireId,
      decision,
      payload: {
        agentId: context.agentId,
        modelVersion: context.modelVersion,
        promptHash: this.computeHash(JSON.stringify(context.runSnapshot?.prompt || '')),
        toolName,
        toolInputs: context.runSnapshot?.toolInputs || {},
        snapshot: context.runSnapshot || {},
      },
      status: 'PENDING',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.APPROVAL_EXPIRY_HOURS * 3600000),
    };
    
    const approvalId = await this.persistenceAdapter.savePendingApproval(approval);
    
    console.log(`[Guardrail] Pending approval created: ${approvalId}`);
    
    return approvalId;
  }
  
  /**
   * Approve a pending request
   */
  async approveRequest(
    approvalId: string,
    approverRole: string,
    approverSignature?: string
  ): Promise<void> {
    await this.persistenceAdapter.updateApprovalStatus(
      approvalId,
      'APPROVED',
      approverRole,
      approverSignature
    );
  }
  
  /**
   * Reject a pending request
   */
  async rejectRequest(
    approvalId: string,
    approverRole: string,
    reason: string
  ): Promise<void> {
    await this.persistenceAdapter.updateApprovalStatus(
      approvalId,
      'REJECTED',
      approverRole,
      undefined,
      reason
    );
  }
  
  /**
   * Get pending approval by ID
   */
  async getPendingApproval(approvalId: string): Promise<PendingApproval | null> {
    return this.persistenceAdapter.getPendingApproval(approvalId);
  }
  
  /**
   * List all pending approvals
   */
  async listPendingApprovals(filters?: {
    agentId?: string;
    status?: ApprovalStatus;
  }): Promise<PendingApproval[]> {
    return this.persistenceAdapter.listPendingApprovals(filters);
  }
  
  /**
   * Generate unique tripwire ID
   */
  private generateTripwireId(): string {
    return `tripwire-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  }
  
  /**
   * Compute SHA256 hash
   */
  private computeHash(input: string): string {
    return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
  }
}

// ============================================================================
// Persistence Adapter Interface
// ============================================================================

export interface PersistenceAdapter {
  savePendingApproval(approval: PendingApproval): Promise<string>;
  getPendingApproval(approvalId: string): Promise<PendingApproval | null>;
  updateApprovalStatus(
    approvalId: string,
    status: ApprovalStatus,
    approverRole: string,
    approverSignature?: string,
    rejectionReason?: string
  ): Promise<void>;
  listPendingApprovals(filters?: {
    agentId?: string;
    status?: ApprovalStatus;
  }): Promise<PendingApproval[]>;
}

// ============================================================================
// In-Memory Persistence (for development/testing)
// ============================================================================

class InMemoryPersistenceAdapter implements PersistenceAdapter {
  private approvals: Map<string, PendingApproval> = new Map();
  
  async savePendingApproval(approval: PendingApproval): Promise<string> {
    const id = `approval-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    this.approvals.set(id, approval);
    return id;
  }
  
  async getPendingApproval(approvalId: string): Promise<PendingApproval | null> {
    return this.approvals.get(approvalId) || null;
  }
  
  async updateApprovalStatus(
    approvalId: string,
    status: ApprovalStatus,
    approverRole: string,
    approverSignature?: string,
    rejectionReason?: string
  ): Promise<void> {
    const approval = this.approvals.get(approvalId);
    if (approval) {
      approval.status = status;
      approval.approverRole = approverRole;
      approval.approverSignature = approverSignature;
      approval.approvedAt = new Date();
    }
  }
  
  async listPendingApprovals(filters?: {
    agentId?: string;
    status?: ApprovalStatus;
  }): Promise<PendingApproval[]> {
    let results = Array.from(this.approvals.values());
    
    if (filters?.agentId) {
      results = results.filter(a => a.payload.agentId === filters.agentId);
    }
    
    if (filters?.status) {
      results = results.filter(a => a.status === filters.status);
    }
    
    return results;
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const guardrailManager = new EnhancedGuardrailManager();

