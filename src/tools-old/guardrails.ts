// src/tools/guardrails.ts
import { tool } from "@iqai/adk";
import { z } from "zod";

/**
 * Small/fast relevance classifier (LOW RISK)
 * - Use a very small model or deterministic heuristics for speed.
 */
export const relevanceClassifierTool = tool({
  name: "relevance_classifier",
  description: "Classify whether a text is relevant to DAO governance.",
  input: z.object({ text: z.string() }),
  execute: async ({ text }) => {
    // Simple heuristic + placeholder model usage
    const lower = text.toLowerCase();
    const keywords = ["proposal", "treasury", "vote", "snapshot", "dao", "governance", "delegate"];
    const score = keywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0) / keywords.length;
    return { isRelevant: score >= 0.15, confidence: Number(score.toFixed(2)) };
  },
});

/**
 * Safety classifier: detect attempt to leak system instruction or jailbreak
 */
export const safetyClassifierTool = tool({
  name: "safety_classifier",
  description: "Detect prompt injection or jailbreak attempts.",
  input: z.object({ text: z.string() }),
  execute: async ({ text }) => {
    // Pattern-based checks + placeholder LLM check
    const patterns = [/ignore all previous instructions/i, /my instructions are/i, /system prompt/i];
    const matches = patterns.filter((r) => r.test(text));
    return { isSafe: matches.length === 0, reasons: matches };
  },
});

/**
 * PII sanitizer — a basic regex-based redactor; replace with NER for production.
 */
export const piiSanitizerTool = tool({
  name: "pii_sanitizer",
  description: "Redact common PII patterns (cc numbers, SSN) from text.",
  input: z.object({ text: z.string() }),
  execute: async ({ text }) => {
    const redacted = text
      .replace(/\b\d{12,19}\b/g, "[REDACTED-CARD]")
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED-SSN]")
      .replace(/\b0x[a-fA-F0-9]{40}\b/g, "[REDACTED-ADDRESS]");
    return { redactedText: redacted };
  },
});

export default { relevanceClassifierTool, safetyClassifierTool, piiSanitizerTool };

