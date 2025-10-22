/**
 * Audit API Routes
 * 
 * REST API endpoints for:
 * - Retrieving audit events
 * - Verifying event integrity
 * - Managing pending approvals
 * - Computing Merkle roots
 */

import { Request, Response, Router } from 'express';
import { auditLogger } from '../audit/audit-logger';
import { guardrailManager } from '../guardrail-manager-enhanced';
import { z } from 'zod';

const router = Router();

// ============================================================================
// GET /audit/:runId - Get audit trail for a specific run
// ============================================================================

router.get('/audit/:runId', async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    
    const events = await auditLogger.getRunEvents(runId);
    
    if (events.length === 0) {
      return res.status(404).json({
        error: 'Run not found',
        runId,
      });
    }
    
    // Return full audit trail with cryptographic proofs
    res.json({
      runId,
      eventCount: events.length,
      events: events.map(e => ({
        id: e.id,
        timestamp: e.timestamp,
        agentId: e.agentId,
        modelVersion: e.modelVersion,
        
        // Cryptographic hashes
        promptHash: e.promptHash,
        outputHash: e.outputHash,
        merkleLeaf: e.merkleLeaf,
        
        // Execution details
        toolCalls: e.toolCalls?.length || 0,
        guardrailTrips: e.guardrailDecisions?.length || 0,
        confidence: e.confidence,
        status: e.status,
        duration: e.duration,
      })),
      
      // Include first event for full details
      fullDetails: events[0],
    });
    
  } catch (error) {
    console.error('[Audit API] Error retrieving run:', error);
    res.status(500).json({
      error: 'Failed to retrieve audit trail',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// GET /audit/events - Query audit events
// ============================================================================

router.get('/audit/events', async (req: Request, res: Response) => {
  try {
    const {
      agentId,
      modelVersion,
      status,
      startDate,
      endDate,
      limit,
    } = req.query;
    
    const events = await auditLogger.queryEvents({
      agentId: agentId as string | undefined,
      modelVersion: modelVersion as string | undefined,
      status: status as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: limit ? parseInt(limit as string) : 100,
    });
    
    res.json({
      count: events.length,
      events: events.map(e => ({
        id: e.id,
        runId: e.runId,
        agentId: e.agentId,
        timestamp: e.timestamp,
        promptHash: e.promptHash,
        outputHash: e.outputHash,
        status: e.status,
        confidence: e.confidence,
      })),
    });
    
  } catch (error) {
    console.error('[Audit API] Error querying events:', error);
    res.status(500).json({
      error: 'Failed to query events',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// POST /audit/verify/:eventId - Verify event integrity
// ============================================================================

router.post('/audit/verify/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { originalPrompt, originalOutput } = req.body;
    
    if (!originalPrompt || !originalOutput) {
      return res.status(400).json({
        error: 'Missing required fields: originalPrompt, originalOutput',
      });
    }
    
    const verification = await auditLogger.verifyEvent(
      eventId,
      originalPrompt,
      originalOutput
    );
    
    res.json({
      eventId,
      valid: verification.valid,
      reason: verification.reason,
      timestamp: Date.now(),
    });
    
  } catch (error) {
    console.error('[Audit API] Error verifying event:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// GET /audit/merkle - Get Merkle roots
// ============================================================================

router.get('/audit/merkle', async (req: Request, res: Response) => {
  try {
    const roots = await auditLogger.getMerkleRoots();
    
    res.json({
      count: roots.length,
      roots: roots.map(r => ({
        root: r.root,
        timestamp: r.timestamp,
        eventCount: r.eventCount,
        dateRange: `${r.startDate} to ${r.endDate}`,
        ipfsHash: r.ipfsHash,
        onChainTx: r.onChainTx,
      })),
    });
    
  } catch (error) {
    console.error('[Audit API] Error retrieving Merkle roots:', error);
    res.status(500).json({
      error: 'Failed to retrieve Merkle roots',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// POST /audit/merkle/compute - Compute new Merkle root
// ============================================================================

router.post('/audit/merkle/compute', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required fields: startDate, endDate',
      });
    }
    
    const root = await auditLogger.computeMerkleRoot(
      new Date(startDate),
      new Date(endDate)
    );
    
    res.json({
      success: true,
      merkleRoot: root,
    });
    
  } catch (error) {
    console.error('[Audit API] Error computing Merkle root:', error);
    res.status(500).json({
      error: 'Failed to compute Merkle root',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// GET /approvals/pending - List pending approvals
// ============================================================================

router.get('/approvals/pending', async (req: Request, res: Response) => {
  try {
    const { agentId, status } = req.query;
    
    const approvals = await guardrailManager.listPendingApprovals({
      agentId: agentId as string | undefined,
      status: status as any,
    });
    
    res.json({
      count: approvals.length,
      approvals: approvals.map(a => ({
        id: a.runId,
        tripwireId: a.tripwireId,
        agentId: a.payload.agentId,
        toolName: a.payload.toolName,
        decision: a.decision,
        status: a.status,
        createdAt: a.createdAt,
        expiresAt: a.expiresAt,
      })),
    });
    
  } catch (error) {
    console.error('[Approvals API] Error listing pending:', error);
    res.status(500).json({
      error: 'Failed to list pending approvals',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// GET /approvals/:approvalId - Get approval details
// ============================================================================

router.get('/approvals/:approvalId', async (req: Request, res: Response) => {
  try {
    const { approvalId } = req.params;
    
    const approval = await guardrailManager.getPendingApproval(approvalId);
    
    if (!approval) {
      return res.status(404).json({
        error: 'Approval not found',
        approvalId,
      });
    }
    
    res.json({
      approval: {
        id: approvalId,
        runId: approval.runId,
        tripwireId: approval.tripwireId,
        decision: approval.decision,
        payload: {
          agentId: approval.payload.agentId,
          toolName: approval.payload.toolName,
          promptHash: approval.payload.promptHash,
          toolInputs: approval.payload.toolInputs,
        },
        status: approval.status,
        createdAt: approval.createdAt,
        expiresAt: approval.expiresAt,
        approverRole: approval.approverRole,
        approvedAt: approval.approvedAt,
      },
      
      // Include full snapshot for explainability
      snapshot: approval.payload.snapshot,
    });
    
  } catch (error) {
    console.error('[Approvals API] Error retrieving approval:', error);
    res.status(500).json({
      error: 'Failed to retrieve approval',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// POST /approvals/:approvalId/approve - Approve a pending request
// ============================================================================

router.post('/approvals/:approvalId/approve', async (req: Request, res: Response) => {
  try {
    const { approvalId } = req.params;
    const { approverRole, approverSignature } = req.body;
    
    if (!approverRole) {
      return res.status(400).json({
        error: 'Missing required field: approverRole',
      });
    }
    
    // TODO: Verify approver has required role
    // TODO: Verify signature if provided
    
    await guardrailManager.approveRequest(
      approvalId,
      approverRole,
      approverSignature
    );
    
    res.json({
      success: true,
      approvalId,
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('[Approvals API] Error approving:', error);
    res.status(500).json({
      error: 'Failed to approve request',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// POST /approvals/:approvalId/reject - Reject a pending request
// ============================================================================

router.post('/approvals/:approvalId/reject', async (req: Request, res: Response) => {
  try {
    const { approvalId } = req.params;
    const { approverRole, reason } = req.body;
    
    if (!approverRole || !reason) {
      return res.status(400).json({
        error: 'Missing required fields: approverRole, reason',
      });
    }
    
    await guardrailManager.rejectRequest(
      approvalId,
      approverRole,
      reason
    );
    
    res.json({
      success: true,
      approvalId,
      status: 'REJECTED',
      reason,
      rejectedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('[Approvals API] Error rejecting:', error);
    res.status(500).json({
      error: 'Failed to reject request',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;

