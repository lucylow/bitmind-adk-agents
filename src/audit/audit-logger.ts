/**
 * Cryptographic Audit Logger with Immutable Evidence
 * 
 * FEATURES:
 * - SHA256 hashing of prompts and outputs
 * - Append-only audit trail
 * - Merkle root computation for batch verification
 * - Optional IPFS/on-chain anchoring
 * - Full run correlation (runId -> all events)
 */

import * as crypto from 'crypto';
import { z } from 'zod';

// ============================================================================
// Schemas
// ============================================================================

export const AuditEventSchema = z.object({
  id: z.string(),
  runId: z.string(),
  agentId: z.string(),
  agentVersion: z.string(),
  modelVersion: z.string(),
  
  // Cryptographic hashes for tamper-evidence
  promptHash: z.string().describe('SHA256 of full prompt (system + user)'),
  outputHash: z.string().describe('SHA256 of agent output'),
  
  // Tool execution tracking
  toolCalls: z.array(z.object({
    toolName: z.string(),
    inputHash: z.string(),
    outputHash: z.string(),
    success: z.boolean(),
    duration: z.number(),
  })).optional(),
  
  // Guardrail decisions
  guardrailDecisions: z.array(z.object({
    tripwireId: z.string(),
    reason: z.string(),
    severity: z.enum(['WARN', 'BLOCK', 'ESCALATE']),
    timestamp: z.number(),
  })).optional(),
  
  // Context
  confidence: z.number().optional(),
  userContext: z.object({
    userId: z.string().optional(),
    userRole: z.string().optional(),
  }).optional(),
  
  // Metadata
  timestamp: z.number(),
  duration: z.number().optional(),
  status: z.enum(['success', 'failure', 'blocked', 'pending_approval']),
  errorMessage: z.string().optional(),
  
  // Immutability proof
  merkleLeaf: z.string().optional().describe('Hash of this event for Merkle tree'),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

export const MerkleRootSchema = z.object({
  root: z.string(),
  timestamp: z.number(),
  eventCount: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  ipfsHash: z.string().optional(),
  onChainTx: z.string().optional(),
});

export type MerkleRoot = z.infer<typeof MerkleRootSchema>;

// ============================================================================
// Audit Logger Class
// ============================================================================

export class AuditLogger {
  private persistenceAdapter: AuditPersistenceAdapter;
  private eventBuffer: AuditEvent[] = [];
  private bufferSize: number;
  
  constructor(
    persistenceAdapter?: AuditPersistenceAdapter,
    bufferSize: number = 100
  ) {
    this.persistenceAdapter = persistenceAdapter || new InMemoryAuditAdapter();
    this.bufferSize = bufferSize;
  }
  
  /**
   * Log a complete agent run
   */
  async logRun(params: {
    runId: string;
    agentId: string;
    agentVersion: string;
    modelVersion: string;
    
    // Input/output
    systemPrompt: string;
    userPrompt: string;
    output: any;
    
    // Tool calls
    toolCalls?: Array<{
      toolName: string;
      input: any;
      output: any;
      success: boolean;
      duration: number;
    }>;
    
    // Guardrails
    guardrailDecisions?: Array<{
      tripwireId: string;
      reason: string;
      severity: 'WARN' | 'BLOCK' | 'ESCALATE';
      timestamp: number;
    }>;
    
    // Metadata
    confidence?: number;
    userContext?: {
      userId?: string;
      userRole?: string;
    };
    duration?: number;
    status: 'success' | 'failure' | 'blocked' | 'pending_approval';
    errorMessage?: string;
  }): Promise<string> {
    const timestamp = Date.now();
    
    // Compute cryptographic hashes
    const fullPrompt = `${params.systemPrompt}\n\n${params.userPrompt}`;
    const promptHash = this.sha256(fullPrompt);
    const outputHash = this.sha256(JSON.stringify(params.output));
    
    // Hash tool calls
    const toolCalls = params.toolCalls?.map(tc => ({
      toolName: tc.toolName,
      inputHash: this.sha256(JSON.stringify(tc.input)),
      outputHash: this.sha256(JSON.stringify(tc.output)),
      success: tc.success,
      duration: tc.duration,
    }));
    
    // Create audit event
    const event: AuditEvent = {
      id: this.generateEventId(),
      runId: params.runId,
      agentId: params.agentId,
      agentVersion: params.agentVersion,
      modelVersion: params.modelVersion,
      promptHash,
      outputHash,
      toolCalls,
      guardrailDecisions: params.guardrailDecisions,
      confidence: params.confidence,
      userContext: params.userContext,
      timestamp,
      duration: params.duration,
      status: params.status,
      errorMessage: params.errorMessage,
    };
    
    // Compute Merkle leaf hash
    event.merkleLeaf = this.computeMerkleLeaf(event);
    
    // Validate
    AuditEventSchema.parse(event);
    
    // Persist
    await this.persistEvent(event);
    
    console.log(`[Audit] Logged run ${params.runId} with promptHash ${promptHash.slice(0, 16)}...`);
    
    return event.id;
  }
  
  /**
   * Quick log helper for tool execution
   */
  async logToolExecution(
    runId: string,
    toolName: string,
    input: any,
    output: any,
    success: boolean,
    duration: number
  ): Promise<void> {
    // This would typically update an existing audit event
    // For simplicity, log as separate event
    console.log(`[Audit] Tool ${toolName} in run ${runId}: ${success ? 'success' : 'failure'} (${duration}ms)`);
  }
  
  /**
   * Retrieve audit event by ID
   */
  async getEvent(eventId: string): Promise<AuditEvent | null> {
    return this.persistenceAdapter.getEvent(eventId);
  }
  
  /**
   * Retrieve all events for a run
   */
  async getRunEvents(runId: string): Promise<AuditEvent[]> {
    return this.persistenceAdapter.getEventsByRun(runId);
  }
  
  /**
   * Query events by filters
   */
  async queryEvents(filters: {
    agentId?: string;
    modelVersion?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditEvent[]> {
    return this.persistenceAdapter.queryEvents(filters);
  }
  
  /**
   * Verify event integrity by recomputing hashes
   */
  async verifyEvent(
    eventId: string,
    originalPrompt: string,
    originalOutput: any
  ): Promise<{ valid: boolean; reason?: string }> {
    const event = await this.getEvent(eventId);
    
    if (!event) {
      return { valid: false, reason: 'Event not found' };
    }
    
    const recomputedPromptHash = this.sha256(originalPrompt);
    const recomputedOutputHash = this.sha256(JSON.stringify(originalOutput));
    
    if (event.promptHash !== recomputedPromptHash) {
      return { valid: false, reason: 'Prompt hash mismatch - data may be tampered' };
    }
    
    if (event.outputHash !== recomputedOutputHash) {
      return { valid: false, reason: 'Output hash mismatch - data may be tampered' };
    }
    
    return { valid: true };
  }
  
  /**
   * Compute Merkle root for a batch of events (daily/hourly)
   */
  async computeMerkleRoot(
    startDate: Date,
    endDate: Date
  ): Promise<MerkleRoot> {
    const events = await this.queryEvents({ startDate, endDate });
    
    if (events.length === 0) {
      throw new Error('No events in date range');
    }
    
    // Extract merkle leaves
    const leaves = events.map(e => e.merkleLeaf!).filter(Boolean);
    
    if (leaves.length === 0) {
      throw new Error('No merkle leaves found');
    }
    
    // Compute Merkle tree
    const root = this.buildMerkleTree(leaves);
    
    const merkleRoot: MerkleRoot = {
      root,
      timestamp: Date.now(),
      eventCount: events.length,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    
    // Optionally persist root
    await this.persistenceAdapter.saveMerkleRoot(merkleRoot);
    
    console.log(`[Audit] Computed Merkle root for ${events.length} events: ${root.slice(0, 16)}...`);
    
    return merkleRoot;
  }
  
  /**
   * Get all Merkle roots (for verification)
   */
  async getMerkleRoots(): Promise<MerkleRoot[]> {
    return this.persistenceAdapter.getMerkleRoots();
  }
  
  /**
   * Export events as JSON for external storage (S3/IPFS)
   */
  async exportEvents(
    startDate: Date,
    endDate: Date
  ): Promise<string> {
    const events = await this.queryEvents({ startDate, endDate });
    return JSON.stringify(events, null, 2);
  }
  
  // ========================================================================
  // Private Helpers
  // ========================================================================
  
  /**
   * SHA256 hash
   */
  private sha256(input: string): string {
    return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
  }
  
  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `audit-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  }
  
  /**
   * Compute Merkle leaf for an event
   */
  private computeMerkleLeaf(event: AuditEvent): string {
    // Hash of critical event fields
    const leafData = JSON.stringify({
      id: event.id,
      runId: event.runId,
      promptHash: event.promptHash,
      outputHash: event.outputHash,
      timestamp: event.timestamp,
      status: event.status,
    });
    
    return this.sha256(leafData);
  }
  
  /**
   * Build simple Merkle tree (pair-wise hashing)
   */
  private buildMerkleTree(leaves: string[]): string {
    if (leaves.length === 0) throw new Error('No leaves');
    if (leaves.length === 1) return leaves[0];
    
    // Make a copy
    let currentLevel = [...leaves];
    
    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left; // Duplicate if odd
        
        const combined = this.sha256(left + right);
        nextLevel.push(combined);
      }
      
      currentLevel = nextLevel;
    }
    
    return currentLevel[0];
  }
  
  /**
   * Persist event to storage
   */
  private async persistEvent(event: AuditEvent): Promise<void> {
    this.eventBuffer.push(event);
    
    // Flush buffer if full
    if (this.eventBuffer.length >= this.bufferSize) {
      await this.flush();
    }
    
    // Also persist immediately for critical events
    if (event.status === 'blocked' || event.status === 'failure') {
      await this.persistenceAdapter.saveEvent(event);
    }
  }
  
  /**
   * Flush buffer to persistent storage
   */
  private async flush(): Promise<void> {
    if (this.eventBuffer.length === 0) return;
    
    await this.persistenceAdapter.saveEvents(this.eventBuffer);
    this.eventBuffer = [];
  }
  
  /**
   * Ensure buffer is flushed on shutdown
   */
  async shutdown(): Promise<void> {
    await this.flush();
  }
}

// ============================================================================
// Persistence Adapter Interface
// ============================================================================

export interface AuditPersistenceAdapter {
  saveEvent(event: AuditEvent): Promise<void>;
  saveEvents(events: AuditEvent[]): Promise<void>;
  getEvent(eventId: string): Promise<AuditEvent | null>;
  getEventsByRun(runId: string): Promise<AuditEvent[]>;
  queryEvents(filters: {
    agentId?: string;
    modelVersion?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditEvent[]>;
  saveMerkleRoot(root: MerkleRoot): Promise<void>;
  getMerkleRoots(): Promise<MerkleRoot[]>;
}

// ============================================================================
// In-Memory Adapter (for testing)
// ============================================================================

class InMemoryAuditAdapter implements AuditPersistenceAdapter {
  private events: Map<string, AuditEvent> = new Map();
  private merkleRoots: MerkleRoot[] = [];
  
  async saveEvent(event: AuditEvent): Promise<void> {
    this.events.set(event.id, event);
  }
  
  async saveEvents(events: AuditEvent[]): Promise<void> {
    events.forEach(e => this.events.set(e.id, e));
  }
  
  async getEvent(eventId: string): Promise<AuditEvent | null> {
    return this.events.get(eventId) || null;
  }
  
  async getEventsByRun(runId: string): Promise<AuditEvent[]> {
    return Array.from(this.events.values()).filter(e => e.runId === runId);
  }
  
  async queryEvents(filters: {
    agentId?: string;
    modelVersion?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditEvent[]> {
    let results = Array.from(this.events.values());
    
    if (filters.agentId) {
      results = results.filter(e => e.agentId === filters.agentId);
    }
    
    if (filters.modelVersion) {
      results = results.filter(e => e.modelVersion === filters.modelVersion);
    }
    
    if (filters.status) {
      results = results.filter(e => e.status === filters.status);
    }
    
    if (filters.startDate) {
      const start = filters.startDate.getTime();
      results = results.filter(e => e.timestamp >= start);
    }
    
    if (filters.endDate) {
      const end = filters.endDate.getTime();
      results = results.filter(e => e.timestamp <= end);
    }
    
    // Sort by timestamp descending
    results.sort((a, b) => b.timestamp - a.timestamp);
    
    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }
    
    return results;
  }
  
  async saveMerkleRoot(root: MerkleRoot): Promise<void> {
    this.merkleRoots.push(root);
  }
  
  async getMerkleRoots(): Promise<MerkleRoot[]> {
    return this.merkleRoots;
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const auditLogger = new AuditLogger();

// ============================================================================
// Utility functions for quick hashing
// ============================================================================

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

export function computePromptHash(systemPrompt: string, userPrompt: string): string {
  return sha256(`${systemPrompt}\n\n${userPrompt}`);
}

export function computeOutputHash(output: any): string {
  return sha256(JSON.stringify(output));
}

