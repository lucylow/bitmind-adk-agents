# Quick Start Guide: DAO Governance Co-pilot

Get started with the advanced co-pilot features in 5 minutes.

## 🚀 Installation

```bash
cd src/adk-agents
npm install
```

## 📝 Basic Usage

### 1. Import the Co-pilot

```typescript
import { 
  initializeCoPilot,
  askCoPilot 
} from './copilot';
```

### 2. Initialize for Your User

```typescript
const copilot = await initializeCoPilot('your-user-id', {
  interests: ['treasury', 'defi', 'governance']
});
```

### 3. Ask Questions

```typescript
// Simple question
const response = await copilot.ask(
  "Should I vote FOR proposal #123?"
);

console.log(response.primaryResponse);
console.log(response.recommendations);
```

## 🎯 Common Use Cases

### Quick Proposal Summary

```typescript
const summary = await copilot.quickSummary('prop-123');
```

### Get Delegation Advice

```typescript
const advice = await copilot.shouldIDelegate('prop-456');

if (advice.shouldDelegate) {
  console.log('Recommended delegates:', advice.recommendedDelegates);
}
```

### Learn from Other DAOs

```typescript
const insights = await copilot.whatDoOtherDAOsDo(
  'Treasury diversification proposal',
  'uniswap'
);
```

### Check Your Progress

```typescript
const progress = await copilot.myProgress();
console.log('Your expertise level:', progress.expertiseLevel);
console.log('Total votes:', progress.totalVotes);
```

## 🧪 Run the Demo

```bash
# Full demo (all 10 scenarios)
npx ts-node src/adk-agents/demo/advanced-copilot-demo.ts

# Or with npm script (add to package.json)
npm run demo:copilot
```

## 📚 Available Features

### 1. Smart Summarization
```typescript
import { summarizeProposal } from './copilot';

const summary = await summarizeProposal(proposalData, {
  expertiseLevel: 'beginner',  // or 'intermediate', 'expert', 'technical'
  timeAvailable: 5             // minutes
});
```

### 2. Personalized Recommendations
```typescript
import { getPersonalizedGuidance } from './copilot';

const recommendation = await getPersonalizedGuidance(
  'user-id',
  proposalData,
  'quick'  // or 'detailed', 'delegation'
);
```

### 3. Governance Alerts
```typescript
import { setupUserMonitoring } from './copilot';

await setupUserMonitoring(
  'user-id',
  ['treasury', 'grants'],           // interests
  ['snapshot', 'tally', 'compound']  // platforms
);
```

### 4. Cross-DAO Analytics
```typescript
import { compareDAOs } from './copilot';

const comparison = await compareDAOs(
  ['uniswap', 'compound', 'aave'],
  'participation'  // or 'treasury', 'governance'
);
```

### 5. Delegation Advisor
```typescript
import { analyzeDelegate } from './copilot';

const performance = await analyzeDelegate('SP2X001...ABC');
console.log('Participation rate:', performance.participationRate);
console.log('Specializations:', performance.specializationAreas);
```

## 🎨 Interaction Modes

The co-pilot automatically adapts, but you can specify:

```typescript
// Quick mode (for urgent decisions)
await askCoPilot(
  "Quick recommendation needed!",
  'user-id',
  { mode: 'quick', timeConstraint: 5 }
);

// Learning mode (for education)
await askCoPilot(
  "Explain how governance works",
  'user-id',
  { mode: 'learning', expertiseLevel: 'beginner' }
);

// Analysis mode (standard)
await askCoPilot(
  "Analyze this proposal thoroughly",
  'user-id',
  { mode: 'analysis' }
);

// Strategy mode (long-term planning)
await askCoPilot(
  "Help me plan my governance strategy",
  'user-id',
  { mode: 'strategy' }
);
```

## 📊 Example Scenarios

### Scenario 1: New User Joins DAO

```typescript
// Initialize
const copilot = await initializeCoPilot('newbie-123', {
  interests: ['grants'],
  expertiseLevel: 'beginner'
});

// Ask question
const response = await copilot.ask(
  "I'm new to DAOs. How do I participate in governance?"
);

// Co-pilot automatically uses 'learning' mode
// Provides beginner-friendly explanations
console.log(response.mode); // 'learning'
console.log(response.nextSteps); // Clear action items
```

### Scenario 2: Urgent Vote Decision

```typescript
// Time-sensitive query
const response = await askCoPilot(
  "Voting ends in 2 hours. Should I vote FOR treasury proposal?",
  'expert-456',
  { timeConstraint: 10 }
);

// Co-pilot automatically uses 'quick' mode
// Provides immediate recommendation
console.log(response.mode); // 'quick'
console.log(response.recommendations); // [Clear vote recommendation]
```

### Scenario 3: Strategic Planning

```typescript
// Long-term planning
const response = await askCoPilot(
  "Help me develop a governance strategy for next quarter",
  'expert-456',
  { mode: 'strategy' }
);

// Co-pilot engages all specialized agents
// Provides comprehensive strategy
console.log(response.insights); // Strategic analysis
console.log(response.recommendations); // Long-term approach
```

## 🔧 Configuration

### Set User Preferences

```typescript
import { updateUserPreferencesTool } from './copilot';

await updateUserPreferencesTool.execute({
  userId: 'user-123',
  preferences: {
    timePreference: 'quick',           // or 'balanced', 'thorough'
    delegationPreference: 'sometimes',  // or 'never', 'often'
    notificationFrequency: 'daily',     // or 'realtime', 'weekly'
    focusCategories: ['treasury', 'defi'],
    riskThreshold: 0.5                  // 0 (conservative) to 1 (aggressive)
  }
});
```

### Setup Monitoring

```typescript
import { setupMonitoringTool } from './copilot';

await setupMonitoringTool.execute({
  userId: 'user-123',
  config: {
    platforms: ['snapshot', 'tally'],
    interests: ['treasury', 'grants'],
    alertTypes: ['proposal_match', 'voting_reminder'],
    channels: ['in-app', 'discord'],
    monitoringInterval: 15  // minutes
  }
});
```

## 🎯 Advanced Usage

### Track Voting Behavior

```typescript
import { updateVotingPatternTool } from './copilot';

// After each vote
await updateVotingPatternTool.execute({
  userId: 'user-123',
  proposalId: 'prop-456',
  vote: 'FOR',
  confidence: 0.85,
  category: 'treasury',
  timeSpent: 420  // seconds
});

// Co-pilot learns from this!
```

### Find Aligned Delegates

```typescript
import { findAlignedDelegatesTool } from './copilot';

const matches = await findAlignedDelegatesTool.execute({
  userVotingHistory: myPastVotes,
  requiredAreas: ['defi', 'treasury'],
  minParticipation: 85  // %
});

console.log('Top matches:', matches.topMatches);
```

### Learn from Similar Proposals

```typescript
import { learnFromSimilarProposalsTool } from './copilot';

const lessons = await learnFromSimilarProposalsTool.execute({
  proposalDescription: 'Treasury diversification with stablecoins',
  currentDAO: 'uniswap',
  lookbackMonths: 12
});

console.log('Similar proposals found:', lessons.similarProposalsFound);
console.log('Success rate:', lessons.successRate);
console.log('Key lessons:', lessons.lessons);
```

## 🐛 Troubleshooting

### "Agent not responding"
Make sure you've initialized the co-pilot:
```typescript
const copilot = await initializeCoPilot('user-id');
```

### "Tools not working"
Tools return mock data by default. To connect to real services:
1. Set up API keys in environment variables
2. Implement actual API integrations in tool execute functions

### "Memory not persisting"
Current implementation uses in-memory storage. For production:
1. Connect to database (Supabase, PostgreSQL)
2. Update storage functions in each feature file

## 📚 Next Steps

1. **Run the demo** to see all features in action
2. **Read the full README** in `copilot/README.md`
3. **Explore individual features** in `features/` directory
4. **Check the examples** in each feature file
5. **Integrate into your app** using the provided exports

## 🎉 You're Ready!

```typescript
// That's it! You're ready to use the co-pilot
const copilot = await initializeCoPilot('my-user-id');
const response = await copilot.ask("How can I improve my governance participation?");
console.log(response);
```

## 🤝 Need Help?

- Check `copilot/README.md` for detailed documentation
- Run demos to see examples: `npm run demo:copilot`
- Review code examples in feature files
- Look at type definitions for available options

---

**Happy Governing! 🚀**

