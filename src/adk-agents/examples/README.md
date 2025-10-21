# ADK-TS Examples

This directory contains example code demonstrating various use cases of the DAO Governance Co-pilot.

## Available Examples

### 1. Simple Example (`simple-example.ts`)

The simplest way to get started with the ADK-TS agents.

**What it demonstrates:**
- Basic initialization
- Single proposal analysis
- Result interpretation
- Treasury health check
- Proper cleanup

**Run it:**
```bash
tsx src/adk-agents/examples/simple-example.ts
```

### 2. Advanced Example (`advanced-example.ts`)

Advanced features for production use cases.

**What it demonstrates:**
- Batch processing multiple proposals
- Continuous treasury monitoring
- User feedback loop
- MCP server integration
- Priority filtering
- Audit log inspection

**Run it:**
```bash
tsx src/adk-agents/examples/advanced-example.ts
```

## Creating Your Own Examples

### Template Structure

```typescript
import { createDAOCopilot } from '../integration/dao-copilot-api';

async function myExample() {
  // 1. Initialize
  const copilot = await createDAOCopilot({
    daoAddress: 'SP2X...DAO',
  });

  // 2. Use the APIs
  const result = await copilot.analyzeProposal({
    proposalId: 'prop-001',
    userAddress: 'SP2X...USER',
  });

  // 3. Process results
  console.log(result);

  // 4. Cleanup
  await copilot.shutdown();
}

myExample();
```

## Integration Examples

### React Component

```typescript
import { createDAOCopilot } from '@/adk-agents/integration/dao-copilot-api';

function ProposalCard({ proposalId, daoAddress, userAddress }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function analyze() {
      const copilot = await createDAOCopilot({ daoAddress });
      const result = await copilot.analyzeProposal({
        proposalId,
        userAddress,
      });
      setAnalysis(result);
      setLoading(false);
    }
    analyze();
  }, [proposalId]);

  if (loading) return <div>Loading analysis...</div>;

  return (
    <div>
      <h3>AI Recommendation</h3>
      <p>Vote: {analysis.votingRecommendation.recommendation}</p>
      <p>Confidence: {analysis.explainability.confidence * 100}%</p>
      <ul>
        {analysis.explainability.topReasons.map((reason, i) => (
          <li key={i}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Discord Bot

```typescript
import { Client } from 'discord.js';
import { createDAOCopilot } from '@/adk-agents/integration/dao-copilot-api';

const client = new Client({ /* ... */ });
const copilot = await createDAOCopilot({
  daoAddress: process.env.DAO_ADDRESS,
});

client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!analyze')) {
    const proposalId = message.content.split(' ')[1];
    
    const result = await copilot.analyzeProposal({
      proposalId,
      userAddress: message.author.id,
    });

    const embed = {
      title: 'AI Voting Recommendation',
      fields: [
        {
          name: 'Recommendation',
          value: result.votingRecommendation.recommendation,
        },
        {
          name: 'Confidence',
          value: `${(result.explainability.confidence * 100).toFixed(0)}%`,
        },
        {
          name: 'Top Reasons',
          value: result.explainability.topReasons.join('\n'),
        },
      ],
      color: result.approvalRequired ? 0xff0000 : 0x00ff00,
    };

    await message.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
```

### Automated Voting Bot

```typescript
import { createDAOCopilot } from '@/adk-agents/integration/dao-copilot-api';
import { executeVote } from '@/adk-agents/tools/dao-tools';

async function autoVoteBot() {
  const copilot = await createDAOCopilot({
    daoAddress: process.env.DAO_ADDRESS,
    enableContinuousMonitoring: true,
  });

  // Check for new proposals every 5 minutes
  setInterval(async () => {
    const proposals = await copilot.getActiveProposals();
    
    for (const proposal of proposals) {
      // Skip if already voted
      if (await hasVoted(proposal.id)) continue;

      const analysis = await copilot.analyzeProposal({
        proposalId: proposal.id,
        userAddress: BOT_ADDRESS,
      });

      // Auto-vote only with high confidence
      if (!analysis.approvalRequired && analysis.explainability.confidence > 0.9) {
        console.log(`✅ Auto-voting ${analysis.votingRecommendation.recommendation} on ${proposal.id}`);
        
        await executeVote(
          proposal.id,
          analysis.votingRecommendation.recommendation,
          BOT_ADDRESS
        );
      } else {
        console.log(`⚠️  Proposal ${proposal.id} requires manual review`);
        await notifyOwner(analysis);
      }
    }
  }, 5 * 60 * 1000);
}

autoVoteBot();
```

### CLI Tool

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { createDAOCopilot } from '@/adk-agents/integration/dao-copilot-api';

const program = new Command();

program
  .name('dao-copilot')
  .description('CLI tool for DAO governance analysis')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze a proposal')
  .requiredOption('-p, --proposal <id>', 'Proposal ID')
  .requiredOption('-d, --dao <address>', 'DAO address')
  .requiredOption('-u, --user <address>', 'User address')
  .action(async (options) => {
    const copilot = await createDAOCopilot({
      daoAddress: options.dao,
    });

    const result = await copilot.analyzeProposal({
      proposalId: options.proposal,
      userAddress: options.user,
    });

    console.log('Recommendation:', result.votingRecommendation.recommendation);
    console.log('Confidence:', result.explainability.confidence * 100, '%');
    console.log('\nReasons:');
    result.explainability.topReasons.forEach((r, i) => {
      console.log(`${i + 1}. ${r}`);
    });

    await copilot.shutdown();
  });

program
  .command('treasury')
  .description('Check treasury health')
  .requiredOption('-d, --dao <address>', 'DAO address')
  .action(async (options) => {
    const copilot = await createDAOCopilot({
      daoAddress: options.dao,
    });

    const health = await copilot.getTreasuryHealth();
    console.log('Treasury Health Score:', health.healthScore);
    console.log('Total Value:', health.totalValue);
    console.log('\nAlerts:');
    health.alerts.forEach((alert, i) => {
      console.log(`${i + 1}. ${alert}`);
    });

    await copilot.shutdown();
  });

program.parse();
```

## Best Practices

1. **Always initialize once** at the start of your application
2. **Reuse the copilot instance** for multiple requests
3. **Handle errors gracefully** with try-catch blocks
4. **Clean up resources** with `shutdown()` when done
5. **Use continuous monitoring** for production applications
6. **Implement feedback loops** to improve recommendations
7. **Monitor audit logs** for security and debugging

## Troubleshooting

### Issue: "Module not found"
- Make sure you're running from the project root
- Check that all dependencies are installed

### Issue: Slow performance
- Use parallel execution for batch processing
- Enable continuous monitoring instead of repeated initialization
- Consider caching frequently accessed data

### Issue: Memory leaks
- Always call `shutdown()` when done
- Disable continuous monitoring when not needed
- Configure memory limits appropriately

## Resources

- Main README: `/src/adk-agents/README.md`
- Quick Start: `/src/adk-agents/QUICKSTART.md`
- Architecture: `/src/adk-agents/ARCHITECTURE.md`

## Contributing

Have a cool example? Submit a PR!

1. Create your example in this directory
2. Add documentation in this README
3. Test it thoroughly
4. Submit a pull request

---

Happy coding! 🚀

