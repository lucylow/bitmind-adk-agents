/**
 * Safety & Confirmation Systems
 * Implements safety checks and confirmations for DAO governance actions
 */

import { AgentBuilder, BaseTool, Agent } from '../core/agent-builder';
import { z } from 'zod';
import {
  RiskLevel,
  ActionType,
  SafetyCheckResult,
  SafetyCheck,
  RiskFactor,
  RiskAssessment,
  scoreToRiskLevel,
  calculateRiskScore
} from './core-hierarchy';

/**
 * Tool: Verify parameters
 */
export const verifyParametersTool: BaseTool = {
  name: 'verify_parameters',
  description: 'Double-check critical parameters and confirm with user if uncertain',
  inputSchema: z.object({
    action: z.nativeEnum(ActionType),
    parameters: z.record(z.string(), z.any()),
    expectedOutcome: z.string(),
    riskFactors: z.array(z.string())
  }),
  execute: async ({ action, parameters, expectedOutcome, riskFactors }) => {
    const issues: string[] = [];
    const warnings: string[] = [];
    const checks: SafetyCheck[] = [];
    
    // Check for large amounts
    if (parameters.amount) {
      const amount = parseFloat(parameters.amount);
      checks.push({
        name: 'amount_verification',
        passed: !isNaN(amount) && amount > 0,
        severity: 'error',
        message: `Amount verification: ${amount}`
      });
      
      if (amount > 100000) {
        warnings.push('Large amount detected - verify this is intentional');
        checks.push({
          name: 'large_amount_warning',
          passed: true,
          severity: 'warning',
          message: `Amount ${amount} is significant - requires careful review`
        });
      }
    }
    
    // Check contract addresses
    if (parameters.contractAddress || parameters.delegate) {
      const address = parameters.contractAddress || parameters.delegate;
      const isValid = /^(0x)?[0-9a-fA-F]{40}$|^SP[0-9A-Z]+$/.test(address);
      
      checks.push({
        name: 'address_validation',
        passed: isValid,
        severity: isValid ? 'info' : 'error',
        message: isValid ? 'Address format valid' : 'Invalid address format'
      });
      
      if (!isValid) {
        issues.push(`Invalid address format: ${address}`);
      }
    }
    
    // Check risk factors
    if (riskFactors.length > 2) {
      warnings.push('Multiple risk factors identified - extra caution advised');
      checks.push({
        name: 'risk_factor_count',
        passed: true,
        severity: 'warning',
        message: `${riskFactors.length} risk factors detected`
      });
    }
    
    // Check for required fields
    const requiredFields = getRequiredFields(action);
    requiredFields.forEach(field => {
      const hasField = parameters[field] !== undefined && parameters[field] !== null;
      checks.push({
        name: `required_field_${field}`,
        passed: hasField,
        severity: hasField ? 'info' : 'error',
        message: hasField ? `${field} provided` : `Missing required field: ${field}`
      });
      
      if (!hasField) {
        issues.push(`Missing required parameter: ${field}`);
      }
    });
    
    const safeToProceed = issues.length === 0;
    const overallScore = checks.filter(c => c.passed).length / checks.length;
    
    return {
      safeToProceed,
      issues,
      warnings,
      checks,
      overallScore,
      confidence: safeToProceed ? 0.95 : 0.4,
      recommendations: safeToProceed
        ? ['Parameters appear valid', 'Proceed with action']
        : ['Resolve issues before proceeding', 'Consider verifying with user']
    };
  }
};

/**
 * Tool: Simulate outcome
 */
export const simulateOutcomeTool: BaseTool = {
  name: 'simulate_outcome',
  description: 'Simulate the outcome of an action before execution',
  inputSchema: z.object({
    action: z.nativeEnum(ActionType),
    currentState: z.any(),
    proposedAction: z.any()
  }),
  execute: async ({ action, currentState, proposedAction }) => {
    // Simulate different outcomes based on action type
    const simulation = await simulateGovernanceAction(action, proposedAction, currentState);
    
    return {
      mostLikely: simulation.primary,
      probability: simulation.confidence,
      alternatives: simulation.alternatives,
      successProbability: simulation.confidence,
      warningFlags: simulation.warnings,
      recommendedChecks: simulation.checks,
      estimatedDuration: simulation.duration,
      reversibility: simulation.reversible
    };
  }
};

/**
 * Tool: Detect unusual patterns
 */
export const detectUnusualPatternsTool: BaseTool = {
  name: 'detect_unusual_patterns',
  description: 'Detect unusual patterns that might indicate errors or attacks',
  inputSchema: z.object({
    action: z.nativeEnum(ActionType),
    historicalPatterns: z.array(z.any()),
    currentAction: z.any()
  }),
  execute: async ({ action, historicalPatterns, currentAction }) => {
    const patterns = analyzePatterns(historicalPatterns, currentAction);
    
    const anomalyThreshold = 0.7;
    const isUnusual = patterns.anomalyScore > anomalyThreshold;
    
    return {
      isUnusual,
      anomalyScore: patterns.anomalyScore,
      confidence: patterns.confidence,
      similarPastActions: patterns.similarActions,
      differences: patterns.differences,
      riskExplanation: patterns.riskExplanation,
      recommendation: patterns.recommendation,
      requiresReview: isUnusual
    };
  }
};

/**
 * Tool: Request confirmation
 */
export const requestConfirmationTool: BaseTool = {
  name: 'request_confirmation',
  description: 'Request explicit confirmation from user for sensitive actions',
  inputSchema: z.object({
    action: z.string(),
    confirmationType: z.enum(['final', 'parameter', 'risk_acknowledgment', 'unusual_activity']),
    message: z.string(),
    details: z.array(z.string()),
    severity: z.enum(['info', 'warning', 'critical']).default('warning')
  }),
  execute: async ({ action, confirmationType, message, details, severity }) => {
    const severityEmoji = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨'
    };
    
    console.log('\n' + '━'.repeat(70));
    console.log(`${severityEmoji[severity]} CONFIRMATION REQUIRED: ${action}`.padStart(45));
    console.log('━'.repeat(70));
    console.log(`\nType: ${confirmationType}`);
    console.log(`Severity: ${severity.toUpperCase()}`);
    console.log(`\n${message}`);
    console.log(`\nDetails:`);
    details.forEach((detail, i) => console.log(`  ${i + 1}. ${detail}`));
    console.log('\n' + '━'.repeat(70));
    console.log('Please confirm this action is correct and intentional.');
    console.log('━'.repeat(70) + '\n');
    
    return {
      confirmationRequested: true,
      type: confirmationType,
      severity,
      timestamp: new Date().toISOString(),
      nextStep: 'Awaiting user confirmation',
      timeoutMs: 120000 // 2 minutes for confirmations
    };
  }
};

/**
 * Tool: Assess comprehensive risk
 */
export const assessComprehensiveRiskTool: BaseTool = {
  name: 'assess_comprehensive_risk',
  description: 'Perform comprehensive risk assessment for governance action',
  inputSchema: z.object({
    action: z.nativeEnum(ActionType),
    parameters: z.record(z.string(), z.any()),
    context: z.any().optional()
  }),
  execute: async ({ action, parameters, context }) => {
    const riskFactors: RiskFactor[] = [];
    
    // Financial risk assessment
    if (parameters.amount) {
      const amount = parseFloat(parameters.amount);
      const financialRisk: RiskFactor = {
        category: 'financial',
        severity: amount > 100000 ? 'high' : amount > 10000 ? 'medium' : 'low',
        description: `Financial exposure of ${amount} tokens`,
        likelihood: 0.8,
        impact: amount > 100000 ? 0.9 : amount > 10000 ? 0.6 : 0.3,
        mitigation: 'Verify amount and recipient before proceeding'
      };
      riskFactors.push(financialRisk);
    }
    
    // Technical risk assessment
    if (action === ActionType.EXECUTE || action === ActionType.PROPOSE) {
      const technicalRisk: RiskFactor = {
        category: 'technical',
        severity: 'medium',
        description: 'Smart contract execution risk',
        likelihood: 0.3,
        impact: 0.8,
        mitigation: 'Audit smart contract and test on testnet first'
      };
      riskFactors.push(technicalRisk);
    }
    
    // Governance risk assessment
    if (action === ActionType.DELEGATE) {
      const governanceRisk: RiskFactor = {
        category: 'governance',
        severity: 'medium',
        description: 'Delegation changes voting power distribution',
        likelihood: 0.9,
        impact: 0.5,
        mitigation: 'Monitor delegate performance and retain ability to re-delegate'
      };
      riskFactors.push(governanceRisk);
    }
    
    // Security risk assessment
    if (parameters.contractAddress || parameters.delegate) {
      const securityRisk: RiskFactor = {
        category: 'security',
        severity: 'high',
        description: 'Interaction with external address',
        likelihood: 0.4,
        impact: 0.9,
        mitigation: 'Verify address is correct and belongs to trusted entity'
      };
      riskFactors.push(securityRisk);
    }
    
    // Calculate overall risk
    const riskScore = calculateRiskScore(riskFactors);
    const overallRisk = scoreToRiskLevel(riskScore);
    
    const assessment: RiskAssessment = {
      overallRisk,
      riskFactors,
      mitigations: riskFactors.map(rf => rf.mitigation || 'No specific mitigation'),
      requiresApproval: overallRisk !== RiskLevel.LOW,
      approvalReason: overallRisk !== RiskLevel.LOW
        ? `${overallRisk} risk level requires human approval`
        : 'Low risk, can proceed automatically',
      confidence: 0.85
    };
    
    return assessment;
  }
};

// Helper functions

function getRequiredFields(action: ActionType): string[] {
  const fieldMap: Record<ActionType, string[]> = {
    [ActionType.VOTE]: ['proposalId', 'vote'],
    [ActionType.DELEGATE]: ['delegate', 'amount'],
    [ActionType.STAKE]: ['amount', 'protocol'],
    [ActionType.WITHDRAW]: ['amount'],
    [ActionType.PROPOSE]: ['title', 'description'],
    [ActionType.EXECUTE]: ['proposalId'],
    [ActionType.CANCEL]: ['proposalId']
  };
  
  return fieldMap[action] || [];
}

async function simulateGovernanceAction(
  action: ActionType,
  proposal: any,
  state: any
): Promise<any> {
  // Mock simulation - in production, this would use actual simulation logic
  const simulations: Record<ActionType, any> = {
    [ActionType.VOTE]: {
      primary: 'Vote will be recorded on-chain',
      alternatives: ['Abstain from voting', 'Delegate voting power'],
      confidence: 0.95,
      warnings: [],
      checks: ['Verify voting power is sufficient', 'Check proposal deadline'],
      duration: '~30 seconds',
      reversible: false
    },
    [ActionType.DELEGATE]: {
      primary: 'Voting power will be delegated to specified address',
      alternatives: ['Keep voting power', 'Split delegation across multiple delegates'],
      confidence: 0.85,
      warnings: ['Delegation is reversible but requires transaction'],
      checks: ['Verify delegate address', 'Review delegate voting history'],
      duration: '~1 minute',
      reversible: true
    },
    [ActionType.EXECUTE]: {
      primary: 'Approved proposal will be executed on-chain',
      alternatives: ['Wait for more validation', 'Cancel execution'],
      confidence: 0.75,
      warnings: ['Execution is irreversible', 'Ensure proposal has passed quorum'],
      checks: ['Verify proposal approval status', 'Check execution parameters'],
      duration: '~2-5 minutes',
      reversible: false
    }
  };
  
  return simulations[action] || {
    primary: 'Action will be executed',
    alternatives: [],
    confidence: 0.7,
    warnings: ['Simulated outcome'],
    checks: ['Verify parameters'],
    duration: 'Variable',
    reversible: false
  };
}

function analyzePatterns(historical: any[], current: any): any {
  if (historical.length === 0) {
    return {
      anomalyScore: 0,
      confidence: 0.5,
      similarActions: [],
      differences: ['No historical data for comparison'],
      riskExplanation: 'First action of this type',
      recommendation: 'Proceed with caution - no historical baseline'
    };
  }
  
  // Find similar actions
  const similar = historical.filter(h =>
    h.type === current.type &&
    Math.abs(parseFloat(h.amount || 0) - parseFloat(current.amount || 0)) < 10000
  );
  
  // Calculate anomaly score
  let anomalyScore = 0;
  const differences: string[] = [];
  
  // Check amount deviation
  if (current.amount) {
    const avgAmount = historical.reduce((sum, h) => sum + parseFloat(h.amount || 0), 0) / historical.length;
    const currentAmount = parseFloat(current.amount);
    const deviation = Math.abs(currentAmount - avgAmount) / avgAmount;
    
    if (deviation > 2) {
      anomalyScore += 0.5;
      differences.push(`Amount is ${(deviation * 100).toFixed(0)}% different from average`);
    }
  }
  
  // Check frequency
  const recentActions = historical.filter(h => {
    const hoursSince = (Date.now() - new Date(h.timestamp || 0).getTime()) / (1000 * 60 * 60);
    return hoursSince < 24;
  });
  
  if (recentActions.length > 5) {
    anomalyScore += 0.3;
    differences.push('High frequency of actions in last 24 hours');
  }
  
  return {
    anomalyScore: Math.min(1, anomalyScore),
    confidence: 0.75,
    similarActions: similar.slice(0, 5),
    differences,
    riskExplanation: anomalyScore > 0.5
      ? 'Action deviates significantly from historical patterns'
      : 'Action follows typical patterns',
    recommendation: anomalyScore > 0.5
      ? 'Recommend additional verification due to unusual pattern'
      : 'Pattern appears normal, standard verification sufficient'
  };
}

/**
 * Create Safety System Agent
 */
export function createSafetySystemAgent(): Agent {
  return AgentBuilder
    .create('safety-system')
    .withName('SafetySystem')
    .withDescription('Implements safety checks and confirmations for DAO governance actions')
    .withModel('gemini-2.5-flash')
    .withInstruction(`
      You implement safety checks and confirmations for DAO governance actions.
      
      SAFETY PROTOCOLS:
      1. **Double-check** critical parameters before execution
      2. **Simulate** outcomes to predict consequences
      3. **Detect** unusual patterns that might indicate errors or attacks
      4. **Confirm** explicitly for sensitive or irreversible actions
      5. **Assess** comprehensive risks across multiple dimensions
      
      SAFETY PRINCIPLES:
      - Safety over speed - never rush critical decisions
      - Transparency - clearly explain all risks
      - Defense in depth - multiple layers of verification
      - Fail safe - default to requiring approval when uncertain
      - User empowerment - give users information to make informed choices
      
      RISK CATEGORIES:
      - Financial: Treasury impact, token amounts
      - Technical: Smart contract risks, execution failures
      - Governance: Voting power, delegation, proposals
      - Security: Address verification, attack vectors
      - Reputation: Community impact, DAO standing
      
      You are the safety net that protects users and the DAO from costly mistakes.
    `)
    .withTools([
      verifyParametersTool,
      simulateOutcomeTool,
      detectUnusualPatternsTool,
      requestConfirmationTool,
      assessComprehensiveRiskTool
    ])
    .withMemory({
      type: 'short-term',
      maxEntries: 100
    })
    .withTemperature(0.3) // Very low for consistent safety checks
    .withMaxTokens(2048)
    .build();
}

/**
 * Export singleton instance
 */
export const safetySystemAgent = createSafetySystemAgent();

/**
 * Helper functions for external use
 */
export async function performSafetyCheck(
  action: ActionType,
  parameters: Record<string, any>,
  context?: any
): Promise<SafetyCheckResult> {
  // Verify parameters
  const paramCheck = await verifyParametersTool.execute({
    action,
    parameters,
    expectedOutcome: 'Safe execution',
    riskFactors: []
  });
  
  // Assess risks
  const riskAssessment = await assessComprehensiveRiskTool.execute({
    action,
    parameters,
    context
  });
  
  // Combine results
  const result: SafetyCheckResult = {
    passed: paramCheck.safeToProceed && riskAssessment.overallRisk !== RiskLevel.CRITICAL,
    checks: paramCheck.checks,
    warnings: [
      ...paramCheck.warnings,
      ...riskAssessment.riskFactors.map(rf => rf.description)
    ],
    blockers: paramCheck.issues,
    recommendations: [
      ...paramCheck.recommendations,
      ...riskAssessment.mitigations
    ],
    overallScore: paramCheck.overallScore * (1 - riskAssessment.confidence * 0.2)
  };
  
  return result;
}

export { RiskLevel, ActionType, SafetyCheckResult };

