// src/api/human-approval.ts
import express from "express";
import bodyParser from "body-parser";
import { executeVoteTool } from "../tools/dao-tools";
import { guardrailManager } from "../guardrail-manager";

/**
 * This is a minimal express router for human approval flow.
 * In real deployment, wire to DB for pending approvals, authentication, RBAC, and audit logging.
 */

const router = express.Router();
router.use(bodyParser.json());

// Mock in-memory store for pending items (replace with DB)
const pendingApprovals: Record<string, any> = {};

// Endpoint to create a pending approval (called by manager)
router.post("/pending", async (req, res) => {
  const { runId, toolName, inputs, requester } = req.body;
  if (!runId || !toolName || !inputs) return res.status(400).json({ error: "missing fields" });
  pendingApprovals[runId] = { runId, toolName, inputs, requester, createdAt: Date.now() };
  return res.json({ success: true, runId });
});

// List pending approvals
router.get("/pending", async (req, res) => {
  return res.json(Object.values(pendingApprovals));
});

// Approve now (authorized human)
router.post("/approve", async (req, res) => {
  const { runId, approverId } = req.body;
  const item = pendingApprovals[runId];
  if (!item) return res.status(404).json({ error: "not found" });

  // RBAC check TODO
  try {
    const ctx = { userConfirmed: true, runConfidence: 0.95 }; // context sent to guardrail
    await guardrailManager.assertToolAllowed(item.toolName, ctx);
    // call the tool
    const result = await executeVoteTool.execute(item.inputs, ctx);
    // delete pending
    delete pendingApprovals[runId];
    // record audit TODO
    return res.json({ success: true, result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
});

export default router;

