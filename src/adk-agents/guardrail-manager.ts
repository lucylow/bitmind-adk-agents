import {
  relevanceClassifier,
  safetyClassifier,
  piiSanitizer,
  assessConfidenceGate,
  GuardrailCheckResult,
} from './tools/guardrails';
import { getToolMetadata, isHighRiskTool } from './tool-registry';

export interface GuardrailContext {
  userConfirmed?: boolean;
  confidence?: number;
  approvalId?: string;
}

export interface GuardrailCheckResponse {
  passed: boolean;
  checks: {
    relevance: GuardrailCheckResult;
    safety: GuardrailCheckResult;
    riskGate?: GuardrailCheckResult;
  };
  requiresApproval: boolean;
  message: string;
}

export class GuardrailManager {
  /**
   * Run all input checks on user query
   */
  runInputChecks(input: string): GuardrailCheckResponse {
    const relevance = relevanceClassifier(input);
    const safety = safetyClassifier(input);

    const passed = relevance.passed && safety.passed;

    return {
      passed,
      checks: { relevance, safety },
      requiresApproval: false,
      message: passed
        ? 'Input passed all checks'
        : `Input failed checks: ${[relevance.reason, safety.reason].filter(Boolean).join('; ')}`,
    };
  }

  /**
   * Assert tool is allowed based on risk level and context
   */
  assertToolAllowed(
    toolName: string,
    context: GuardrailContext
  ): GuardrailCheckResponse {
    const toolMetadata = getToolMetadata(toolName);

    if (!toolMetadata) {
      return {
        passed: false,
        checks: { relevance: { passed: false } as GuardrailCheckResult, safety: { passed: false } as GuardrailCheckResult },
        requiresApproval: false,
        message: `Tool ${toolName} not found in registry`,
      };
    }

    const isHighRisk = isHighRiskTool(toolName);

    if (isHighRisk) {
      const confidenceGate = assessConfidenceGate(
        context.confidence || 0,
        'HIGH'
      );

      const passed =
        context.userConfirmed === true &&
        (confidenceGate.passed || context.approvalId !== undefined);

      return {
        passed,
        checks: { relevance: { passed: true } as GuardrailCheckResult, safety: { passed: true } as GuardrailCheckResult },
        requiresApproval: !passed,
        message: passed
          ? `High-risk tool ${toolName} approved`
          : `High-risk tool ${toolName} requires approval`,
      };
    }

    return {
      passed: true,
      checks: { relevance: { passed: true } as GuardrailCheckResult, safety: { passed: true } as GuardrailCheckResult },
      requiresApproval: false,
      message: `Tool ${toolName} allowed`,
    };
  }

  /**
   * Sanitize output before storage
   */
  sanitizeOutput(output: string): string {
    return piiSanitizer(output);
  }

  /**
   * Trip a guardrail and log for review
   */
  tripGuardrail(
    reason: string,
    context: Record<string, unknown>
  ): { tripId: string; requiresApproval: boolean } {
    const tripId = `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.warn(`[GUARDRAIL TRIP] ${tripId}: ${reason}`, context);

    return {
      tripId,
      requiresApproval: true,
    };
  }
}

export const guardrailManager = new GuardrailManager();

