
# Human-in-the-Loop (HITL) for DAO Governance

A comprehensive safety and control system that ensures users maintain full control while leveraging AI assistance for DAO governance.

## 🎯 Overview

The HITL system provides multiple layers of human oversight and safety checks for all governance actions, ensuring that AI recommendations are helpful but never autonomous beyond user-defined boundaries.

## 🏗️ Architecture

```
User Action Request
        ↓
    Safety Checks
        ↓
    Risk Assessment
        ↓
    Approval Required?
    ├─ No (Auto) → Execute
    └─ Yes (Review/Manual)
        ↓
    Request Human Approval
        ↓
    User Decision
    ├─ Approved → Execute
    └─ Rejected → Cancel
```

## 🔐 Core Components

### 1. Approval Levels

Three levels of human oversight:

- **AUTO**: AI can act independently for low-risk actions
- **REVIEW**: AI suggests, human approves before execution
- **MANUAL**: Human performs all steps manually

### 2. Risk Levels

Four risk categories for governance actions:

- **LOW**: Routine decisions, minimal impact
- **MEDIUM**: Moderate impact, requires consideration
- **HIGH**: Significant treasury or protocol impact
- **CRITICAL**: Protocol-changing, large financial, or security decisions

### 3. Action Types

Supported governance actions:

- `VOTE` - Vote on proposals
- `DELEGATE` - Delegate voting power
- `STAKE` - Stake tokens
- `WITHDRAW` - Withdraw funds
- `PROPOSE` - Create proposals
- `EXECUTE` - Execute approved proposals
- `CANCEL` - Cancel proposals

## 🚀 Quick Start

### Basic Usage

```typescript
import { createHITLWorkflow, ActionType, ApprovalLevel, RiskLevel } from './hitl';

// Create workflow for user
const workflow = createHITLWorkflow('user-123', {
  approvalLevel: ApprovalLevel.REVIEW,
  riskTolerance: RiskLevel.MEDIUM,
  requiredConfirmations: 1,
  timeoutMs: 300000, // 5 minutes
  fallbackAction: 'wait'
});

// Request approval for an action
const approvalId = await workflow.requestApproval(
  ActionType.VOTE,
  'Vote FOR on treasury proposal',
  {
    proposalId: 'PROP-123',
    vote: 'FOR',
    votingPower: '10000'
  },
  {
    reasoning: 'Proposal aligns with DAO strategy',
    risks: ['Market volatility could affect outcome'],
    benefits: ['Improved treasury management', 'Community endorsed'],
    alternatives: ['Vote AGAINST', 'Abstain', 'Delegate decision']
  }
);

// Check approval status
const status = await workflow.checkApproval(approvalId);

// User approves
if (status.status === 'pending') {
  await workflow.approve(approvalId, 'Reviewed and approved');
}
```

### Safety Checks

```typescript
import { performSafetyCheck, ActionType } from './hitl';

// Perform comprehensive safety check
const safetyResult = await performSafetyCheck(
  ActionType.WITHDRAW,
  {
    amount: '100000',
    recipient: '0x742d35Cc6634C0532925a3b8Dc9B0f7d5a6C6D5a'
  }
);

console.log('Safe to proceed:', safetyResult.passed);
console.log('Warnings:', safetyResult.warnings);
console.log('Blockers:', safetyResult.blockers);
console.log('Recommendations:', safetyResult.recommendations);
```

## 📋 Features

### 1. Multi-Level Approval System

```typescript
// Conservative user - manual everything
const conservativeConfig = {
  approvalLevel: ApprovalLevel.MANUAL,
  riskTolerance: RiskLevel.LOW,
  requiredConfirmations: 3
};

// Experienced user - auto for low-risk
const experiencedConfig = {
  approvalLevel: ApprovalLevel.AUTO,
  riskTolerance: RiskLevel.HIGH,
  autoApproveThreshold: 50000
};

// Balanced user - review medium+ risk
const balancedConfig = {
  approvalLevel: ApprovalLevel.REVIEW,
  riskTolerance: RiskLevel.MEDIUM,
  requiredConfirmations: 1
};
```

### 2. Comprehensive Safety Checks

- **Parameter Verification**: Double-check amounts, addresses, and required fields
- **Outcome Simulation**: Preview action consequences
- **Pattern Detection**: Identify unusual activity
- **Risk Assessment**: Multi-dimensional risk analysis
- **Confirmation Requests**: Explicit confirmations for sensitive actions

### 3. Risk Assessment

```typescript
import { assessComprehensiveRiskTool } from './hitl';

const riskAssessment = await assessComprehensiveRiskTool.execute({
  action: ActionType.DELEGATE,
  parameters: {
    delegate: '0x...',
    amount: '50000'
  }
});

console.log('Overall Risk:', riskAssessment.overallRisk);
console.log('Risk Factors:', riskAssessment.riskFactors);
console.log('Mitigations:', riskAssessment.mitigations);
```

### 4. Approval History & Analytics

```typescript
import { getApprovalHistoryTool } from './hitl';

const history = await getApprovalHistoryTool.execute({
  userId: 'user-123',
  limit: 10
});

console.log('Total approvals:', history.stats.total);
console.log('Approval rate:', history.stats.approvalRate);
console.log('Average response time:', history.stats.averageResponseTime);
console.log('Insights:', history.insights);
```

## 🎮 Demo Scenarios

### Scenario 1: Low-Risk Routine Vote

```bash
# Run specific scenario
npx ts-node src/adk-agents/demo/hitl-demo.ts scenario 1
```

- Low risk action
- Auto-approval for experienced users
- Quick execution

### Scenario 2: High-Risk Treasury Allocation

```bash
npx ts-node src/adk-agents/demo/hitl-demo.ts scenario 2
```

- High risk, large amount
- Multiple safety checks
- Detailed risk/benefit analysis
- Alternative suggestions

### Scenario 3: Delegation Decision

```bash
npx ts-node src/adk-agents/demo/hitl-demo.ts scenario 3
```

- Medium risk
- Delegate verification
- Reversibility considerations
- Learning support for beginners

### Scenario 4: Critical Protocol Upgrade

```bash
npx ts-node src/adk-agents/demo/hitl-demo.ts scenario 4
```

- Critical risk level
- Multiple confirmations required
- Irreversible action
- Maximum scrutiny

### Scenario 5: Unusual Activity Detection

```bash
npx ts-node src/adk-agents/demo/hitl-demo.ts scenario 5
```

- Pattern anomaly detection
- Security alert
- Extra verification required
- Potential compromise protection

### Run All Demos

```bash
npx ts-node src/adk-agents/demo/hitl-demo.ts
```

## 🔧 Configuration

### HITL Config

```typescript
interface HITLConfig {
  approvalLevel: ApprovalLevel;        // Auto/Review/Manual
  riskTolerance: RiskLevel;            // Low/Medium/High/Critical
  requiredConfirmations: number;        // 1-5
  timeoutMs: number;                    // Approval timeout
  fallbackAction: 'wait' | 'abort' | 'escalate';
  autoApproveThreshold?: number;        // Auto-approve below this amount
  notifyOn?: ApprovalLevel[];          // When to send notifications
  trustedDelegates?: string[];         // Pre-approved delegates
}
```

### Default Configuration

```typescript
const DEFAULT_HITL_CONFIG = {
  approvalLevel: ApprovalLevel.REVIEW,
  riskTolerance: RiskLevel.MEDIUM,
  requiredConfirmations: 1,
  timeoutMs: 300000, // 5 minutes
  fallbackAction: 'wait',
  autoApproveThreshold: 1000
};
```

## 🛡️ Safety Features

### Parameter Verification

- Amount validation
- Address format checking
- Required field validation
- Range checking
- Type validation

### Risk Analysis

- Financial risk (amount, treasury impact)
- Technical risk (smart contracts, execution)
- Governance risk (voting power, delegation)
- Security risk (addresses, interactions)
- Reputation risk (community impact)

### Pattern Detection

- Amount anomalies (deviation from historical average)
- Frequency anomalies (unusual activity patterns)
- Recipient anomalies (new or suspicious addresses)
- Timing anomalies (off-hours, rapid succession)

### Outcome Simulation

- Primary outcome prediction
- Alternative scenarios
- Success probability
- Warning flags
- Reversibility assessment

## 📊 Approval Workflow

```
1. Action Requested
        ↓
2. Safety Checks
   ├─ Parameter Verification
   ├─ Risk Assessment
   └─ Pattern Detection
        ↓
3. Approval Decision
   ├─ Auto: Execute immediately
   ├─ Review: Request approval
   └─ Manual: Full human control
        ↓
4. If Review/Manual:
   • Create approval request
   • Notify user
   • Wait for decision
        ↓
5. User Decision
   ├─ Approved → Execute
   ├─ Rejected → Cancel
   └─ Timeout → Fallback action
```

## 🎯 Use Cases

### For Beginners

```typescript
// Conservative settings for safety
const beginnerWorkflow = createHITLWorkflow('beginner', {
  approvalLevel: ApprovalLevel.REVIEW,
  riskTolerance: RiskLevel.LOW,
  requiredConfirmations: 2,
  timeoutMs: 600000 // 10 minutes
});
```

### For Experienced Users

```typescript
// Balanced automation with oversight
const experiencedWorkflow = createHITLWorkflow('expert', {
  approvalLevel: ApprovalLevel.AUTO,
  riskTolerance: RiskLevel.HIGH,
  autoApproveThreshold: 50000
});
```

### For DAOs

```typescript
// Multi-sig style approvals
const daoWorkflow = createHITLWorkflow('dao-treasury', {
  approvalLevel: ApprovalLevel.MANUAL,
  requiredConfirmations: 3,
  fallbackAction: 'escalate'
});
```

## 📈 Benefits

### Safety & Control

- ✅ Users maintain full control
- ✅ Multiple safety layers
- ✅ Risk-appropriate oversight
- ✅ Configurable guardrails
- ✅ Transparent decision-making

### User Experience

- ✅ Clear risk communication
- ✅ Alternative suggestions
- ✅ Confidence calibration
- ✅ Learning support
- ✅ Flexible automation levels

### Technical Excellence

- ✅ Production-ready
- ✅ Comprehensive testing
- ✅ Well-documented
- ✅ Type-safe
- ✅ Extensible architecture

## 🚀 Integration

### With Co-pilot

```typescript
import { coPilotManager } from '../copilot';
import { createHITLWorkflow } from '../hitl';

// Create HITL workflow
const hitl = createHITLWorkflow('user-123');

// Co-pilot suggests action
const recommendation = await coPilotManager.handleQuery(
  "Should I vote FOR proposal #123?",
  { userId: 'user-123' }
);

// HITL manages approval
if (recommendation.recommendations.includes('Vote FOR')) {
  const approvalId = await hitl.requestApproval(
    ActionType.VOTE,
    'Vote FOR based on co-pilot recommendation',
    { proposalId: '123', vote: 'FOR' },
    {
      reasoning: recommendation.primaryResponse,
      risks: recommendation.insights.filter(i => i.includes('risk')),
      benefits: recommendation.insights.filter(i => i.includes('benefit')),
      alternatives: ['Vote AGAINST', 'Abstain', 'Request more analysis']
    }
  );
}
```

## 🏆 Hackathon Value

### Innovation

- Advanced HITL implementation
- Multi-level approval system
- Comprehensive safety checks
- Pattern detection & anomaly analysis
- Risk-based automation

### Production Quality

- Type-safe TypeScript
- Comprehensive testing
- Clear documentation
- Real-world scenarios
- Extensible architecture

### Real Impact

- Prevents costly mistakes
- Builds user trust
- Enables safe automation
- Protects DAO treasuries
- Empowers users

## 📚 API Reference

### Core Functions

- `createHITLWorkflow(userId, config)` - Create workflow instance
- `requestApproval(action, description, parameters, options)` - Request approval
- `checkApproval(approvalId)` - Check approval status
- `approveRequest(approvalId, userId, reason)` - Approve action
- `rejectRequest(approvalId, userId, reason)` - Reject action
- `performSafetyCheck(action, parameters, context)` - Run safety checks

### Tools

- `checkApprovalRequiredTool` - Determine if approval needed
- `requestHumanApprovalTool` - Request approval from user
- `checkApprovalStatusTool` - Check approval status
- `handleUserDecisionTool` - Process user decision
- `getApprovalHistoryTool` - Retrieve approval history
- `verifyParametersTool` - Verify action parameters
- `simulateOutcomeTool` - Simulate action outcomes
- `detectUnusualPatternsTool` - Detect anomalies
- `requestConfirmationTool` - Request explicit confirmation
- `assessComprehensiveRiskTool` - Comprehensive risk assessment

## 🔮 Future Enhancements

- [ ] Machine learning for pattern detection
- [ ] Multi-sig integration
- [ ] Hardware wallet support
- [ ] Biometric confirmation
- [ ] Social recovery mechanisms
- [ ] Time-locked approvals
- [ ] Conditional execution
- [ ] Automated compliance checks

## 🤝 Contributing

The HITL system is designed to be extensible. To add new safety checks or approval mechanisms:

1. Create new tools in appropriate files
2. Add to agent tool arrays
3. Update types and interfaces
4. Add tests and documentation
5. Create demo scenarios

## 📄 License

MIT License - see LICENSE file for details

---

**Built with safety and user control as top priorities** 🛡️

*Ensuring AI assistance never compromises user autonomy in DAO governance*

