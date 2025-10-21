// src/guardrail-manager.ts
import { getToolMeta } from "./tool-registry";
import { relevanceClassifierTool, safetyClassifierTool, piiSanitizerTool } from "./tools/guardrails";

/**
 * Custom guardrail error class
 */
export class GuardrailTripwireTriggered extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GuardrailTripwireTriggered";
  }
}

/**
 * Central guardrail manager that runs input guards, tool gating,
 * and provides simple helper functions for agents to call before sensitive operations.
 */
export class GuardrailManager {
  async runInputChecks(text: string, ctx: any = {}) {
    const rel = await relevanceClassifierTool.execute({ text }, ctx);
    if (!rel.isRelevant) {
      throw new GuardrailTripwireTriggered("Input is not governance-relevant");
    }
    const safe = await safetyClassifierTool.execute({ text }, ctx);
    if (!safe.isSafe) {
      throw new GuardrailTripwireTriggered("Unsafe input detected: " + safe.reasons.join(", "));
    }
    return { ok: true, relevance: rel, safety: safe };
  }

  async sanitizeForStorage(text: string) {
    const r = await piiSanitizerTool.execute({ text });
    return r.redactedText;
  }

  async assertToolAllowed(toolName: string, ctx: any = {}) {
    const meta = getToolMeta(toolName);
    if (!meta) throw new Error(`Tool ${toolName} not registered`);
    // HIGH risk gating
    if (meta.risk === "HIGH") {
      // require humanConfirmed flag or explicit context override
      const confirmed = ctx?.userConfirmed ?? false;
      const confidence = ctx?.runConfidence ?? 0;
      if (!confirmed || confidence < 0.85) {
        throw new GuardrailTripwireTriggered(
          `Tool ${toolName} is HIGH risk; requires user confirmation and high confidence`
        );
      }
    }
    // For MEDIUM risk you could require an additional approval scope
    return true;
  }
}

export const guardrailManager = new GuardrailManager();

