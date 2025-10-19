import { z } from 'zod';

export interface GuardrailCheckResult {
  passed: boolean;
  reason?: string;
  requiresApproval?: boolean;
}

/**
 * Relevance classifier - filters out non-governance queries
 */
export function relevanceClassifier(input: string): GuardrailCheckResult {
  const governanceKeywords = [
    'proposal',
    'vote',
    'governance',
    'dao',
    'treasury',
    'fund',
    'allocation',
    'strategy',
    'risk',
  ];

  const isRelevant = governanceKeywords.some((keyword) =>
    input.toLowerCase().includes(keyword)
  );

  return {
    passed: isRelevant,
    reason: isRelevant ? undefined : 'Query not related to DAO governance',
  };
}

/**
 * Safety classifier - detects prompt injections and jailbreak patterns
 */
export function safetyClassifier(input: string): GuardrailCheckResult {
  const dangerousPatterns = [
    /ignore previous instructions/i,
    /system prompt/i,
    /bypass security/i,
    /override guardrails/i,
    /execute arbitrary code/i,
  ];

  const isSafe = !dangerousPatterns.some((pattern) => pattern.test(input));

  return {
    passed: isSafe,
    reason: isSafe ? undefined : 'Input contains potentially dangerous patterns',
  };
}

/**
 * PII sanitizer - redacts sensitive values before storing
 */
export function piiSanitizer(input: string): string {
  let sanitized = input;

  // Redact private keys
  sanitized = sanitized.replace(/0x[a-fA-F0-9]{64}/g, '0x[REDACTED_KEY]');

  // Redact wallet addresses (simplified)
  sanitized = sanitized.replace(/0x[a-fA-F0-9]{40}/g, '0x[REDACTED_ADDRESS]');

  // Redact API keys
  sanitized = sanitized.replace(
    /(?:api[_-]?key|apikey|secret|password)\s*[:=]\s*[^\s]+/gi,
    '[REDACTED_SECRET]'
  );

  return sanitized;
}

/**
 * Confidence-based risk gating
 */
export function assessConfidenceGate(
  confidence: number,
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
): GuardrailCheckResult {
  const thresholds = {
    LOW: 0.5,
    MEDIUM: 0.75,
    HIGH: 0.9,
  };

  const threshold = thresholds[riskLevel];
  const passed = confidence >= threshold;

  return {
    passed,
    reason: passed
      ? undefined
      : `Confidence ${confidence} below threshold ${threshold} for ${riskLevel} risk operation`,
    requiresApproval: !passed,
  };
}

/**
 * Output validation using Zod schemas
 */
export function validateOutput<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { valid: boolean; data?: T; error?: string } {
  try {
    const validated = schema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof z.ZodError ? error.message : 'Validation failed',
    };
  }
}

