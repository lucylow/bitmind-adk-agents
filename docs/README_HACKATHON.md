# BitMind DAO Governance Co-pilot

**ADK-TS Hackathon 2025 Submission**

A sophisticated multi-agent DAO governance co-pilot built with **ADK-TS** (Agent Development Kit for TypeScript) and integrated into the BitMind smart invoice platform.

## 🎯 Project Overview

BitMind is an AI-powered governance assistant that helps DAO members make informed voting decisions by:

- **Analyzing proposals** with financial impact assessment
- **Monitoring treasury health** and composition
- **Generating voting recommendations** with confidence scores
- **Enforcing security guardrails** for high-risk actions
- **Maintaining audit trails** for compliance

### Track: Web3/Blockchain Use Cases

This project demonstrates how ADK-TS agents can integrate with blockchain systems to solve real-world DAO governance challenges.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│         BitMind Frontend (React + Vite)                 │
│  - Lovable-compatible React components                  │
│  - Real-time governance analysis UI                     │
│  - Wallet integration (Stacks/Bitcoin)                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│      ADK-TS Agent System (src/adk-agents/)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Proposal    │  │  Treasury    │  │  Voting      │  │
│  │  Analyst     │  │  Monitor     │  │  Strategist  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                │                    │         │
│         └────────────────┼────────────────────┘         │
│                          ▼                              │
│              Manager Orchestrator                       │
│  - Coordinates agent execution                         │
│  - Synthesizes results                                 │
│  - Enforces guardrails                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│    Security & Audit Layer                               │
│  - Guardrail Manager (relevance, safety, PII)          │
│  - Tool Registry (risk-based gating)                    │
│  - Audit Logger (immutable logs)                        │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
bitmind-base/
├── src/
│   ├── adk-agents/                    # ADK-TS Agent System
│   │   ├── agents/
│   │   │   ├── proposal-analyst.agent.ts
│   │   │   ├── treasury-monitor.agent.ts
│   │   │   ├── voting-strategist.agent.ts
│   │   │   └── manager-orchestrator.ts
│   │   ├── tools/
│   │   │   ├── dao-tools.ts           # DAO operations
│   │   │   └── guardrails.ts          # Safety checks
│   │   ├── audit/
│   │   │   └── audit-schema.ts        # Audit logging
│   │   ├── tool-registry.ts           # Tool metadata
│   │   ├── guardrail-manager.ts       # Guardrail enforcement
│   │   └── index.ts                   # Main entry point
│   ├── services/
│   │   └── adk-agent-service.ts       # Frontend integration
│   ├── hooks/
│   │   └── useAdkAgent.ts             # React hook for agents
│   ├── components/
│   │   ├── AdkGovernanceAnalyzer.tsx  # UI component
│   │   └── ...                        # Other BitMind components
│   ├── pages/                         # Application pages
│   ├── App.tsx                        # Main app component
│   └── main.tsx                       # Entry point
├── dist/                              # Built output (Lovable-ready)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── lovable.config.js                  # Lovable deployment config
└── README.md                          # This file
```

## 🚀 Key Features

### 1. Multi-Agent Orchestration
- **ProposalAnalystAgent**: Analyzes proposals, financial impact, and security risks
- **TreasuryMonitorAgent**: Monitors DAO treasury health and composition
- **VotingStrategistAgent**: Generates voting recommendations with confidence scores
- **ManagerOrchestrator**: Coordinates all agents and synthesizes results

### 2. Security & Guardrails
- **Input Validation**: Relevance and safety checks on user queries
- **Tool Risk Gating**: Tools categorized as LOW/MEDIUM/HIGH risk
- **PII Sanitization**: Redacts sensitive data before logging
- **Confidence-Based Gating**: High-risk operations require high confidence
- **Human-in-Loop**: Explicit approval for high-risk actions

### 3. Audit & Compliance
- **Immutable Logs**: Every agent run, tool call, and approval is logged
- **Model Tracking**: Records model version for each operation
- **Compliance Ready**: Full audit trail for regulatory requirements

### 4. Frontend Integration
- **React Hooks**: `useAdkAgent` hook for easy component integration
- **Service Layer**: `adk-agent-service.ts` for clean API
- **Error Handling**: Comprehensive error handling and user feedback
- **Lovable Compatible**: Works seamlessly with Lovable deployment

## 🛠️ Technology Stack

### Core
- **ADK-TS** - Agent Development Kit for TypeScript
- **TypeScript** - Type-safe development
- **Node.js** - Runtime environment

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Blockchain
- **Stacks** - Bitcoin L2 integration
- **Ethers.js** - Blockchain interactions
- **The Graph** - Indexed blockchain data

### Validation & Logging
- **Zod** - Schema validation
- **TypeScript** - Type safety

## 📦 Installation & Setup

### Prerequisites
- Node.js v18+
- npm or pnpm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/bitmind.git
cd bitmind

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Lovable
npm run build
# Push to GitHub, Lovable will auto-deploy
```

### Environment Variables

Create a `.env.local` file:

```env
# LLM Providers
VITE_OPENAI_API_KEY=your_openai_key
VITE_GOOGLE_API_KEY=your_google_key

# Blockchain
VITE_ETH_RPC_URL=https://mainnet.infura.io/v3/your_key
VITE_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/...

# Stacks
VITE_STACKS_NETWORK=mainnet

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 💻 Usage Examples

### Using the ADK Agent Hook in Components

```typescript
import { useAdkAgent } from '../hooks/useAdkAgent';

function MyComponent() {
  const { loading, error, data, analyzeProposal } = useAdkAgent({
    onSuccess: (data) => console.log('Analysis complete:', data),
    onError: (error) => console.error('Analysis failed:', error),
  });

  const handleAnalyze = async () => {
    await analyzeProposal('proposal-123', '0xDAOAddress', {
      riskTolerance: 'medium',
    });
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Proposal'}
      </button>
      {error && <p>Error: {error.message}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

### Using the ADK Agent Service Directly

```typescript
import { analyzeProposal, getAuditLogs } from '../services/adk-agent-service';

// Analyze a proposal
const result = await analyzeProposal({
  proposalId: 'proposal-123',
  daoAddress: '0xDAOAddress',
  userPreferences: { riskTolerance: 'medium' },
  userAddress: '0xUserAddress',
});

if (result.success) {
  console.log('Analysis:', result.data);
  console.log('Run ID:', result.runId);
} else {
  console.error('Error:', result.error);
}

// Get audit logs
const logs = getAuditLogs('proposal-analyst-001');
console.log('Audit logs:', logs);
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📊 Evaluation Metrics

BitMind is designed to meet these hackathon evaluation criteria:

### Technical Implementation
- ✅ Multi-agent orchestration with ADK-TS
- ✅ Structured outputs with Zod schemas
- ✅ Comprehensive error handling
- ✅ Type-safe TypeScript throughout
- ✅ Production-ready build

### Real-World Use Case
- ✅ Solves genuine DAO governance problem
- ✅ Reduces decision-making friction
- ✅ Improves participation quality
- ✅ Scalable to any DAO

### Security & Best Practices
- ✅ Layered guardrails
- ✅ Immutable audit logs
- ✅ PII sanitization
- ✅ Risk-based tool gating
- ✅ Human-in-loop approvals

### Integration & Deployment
- ✅ Lovable-compatible frontend
- ✅ Clean API integration
- ✅ React hooks for easy use
- ✅ Production-ready build system
- ✅ Docker-ready (optional)

## 🎬 Demo

The project includes a demo component (`AdkGovernanceAnalyzer.tsx`) that showcases:

1. **Proposal Input** - Enter proposal ID and DAO address
2. **Real-time Analysis** - Watch agents analyze the proposal
3. **Results Display** - View analysis, recommendations, and treasury status
4. **Audit Trail** - Access complete audit logs

## 🔐 Security Considerations

### Production Deployment

1. **Environment Variables**: Never commit secrets
2. **API Keys**: Use Lovable's secret management
3. **Rate Limiting**: Implement rate limiting for agent calls
4. **Wallet Security**: Use hardware wallets for production DAOs
5. **Audit Logs**: Store in immutable storage (S3, blockchain)

### Best Practices

- Review guardrail thresholds for your DAO
- Test with testnet before mainnet deployment
- Monitor agent performance and accuracy
- Regularly audit logs for anomalies
- Update model versions based on performance

## 📚 Documentation

- **ADK-TS Docs**: https://adk.iqai.com/
- **Lovable Docs**: https://docs.lovable.dev/
- **Vite Guide**: https://vitejs.dev/guide/
- **React Docs**: https://react.dev/

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **IQ AI** - ADK-TS framework and support
- **Lovable** - Frontend deployment platform
- **Stacks Foundation** - Bitcoin L2 infrastructure
- **The Graph** - Indexed blockchain data

## 📞 Support & Contact

- **Discord**: https://discord.gg/UbQaZkznwr
- **GitHub Issues**: Report bugs and feature requests
- **Email**: support@bitmind.ai

---

**Ready to submit to the ADK-TS Hackathon 2025!** 🚀

Visit https://dorahacks.io/hackathon/adk-ts-hackathon-2025/detail to submit this project.

