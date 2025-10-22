# 🎯 BitMind Quick Reference Card

**One-page cheat sheet for everything you need to know**

---

## ⚡ Quick Commands

### Development
```bash
npm run adk:cli          # Interactive dev with hot reload
npm run adk:web          # Launch web UI (localhost:3000)
npm run dev              # Vite dev server
npm test                 # Run all tests
```

### Bots
```bash
npm run bots:start       # Start Discord + Telegram bots
npm run bot:discord      # Discord only
npm run bot:telegram     # Telegram only
```

### ATP & Payments
```bash
npm run atp:wallet       # Check agent wallet
npm run atp:capabilities # View unlocked features
npm run x402:test        # Test micropayments
```

### Safety & Audit
```bash
npm run guardrails:test  # Test guardrail system
npm run audit:check      # View recent audit events
npm run audit:merkle     # Compute Merkle root
npm run safety:demo      # Run complete safety demo
```

---

## 📊 Project Overview

| Component | Purpose | Status |
|-----------|---------|--------|
| **ATP Tokenization** | Agent as ERC20 token on Fraxtal | ✅ Complete |
| **x402 Micropayments** | Instant payments on Base | ✅ Complete |
| **Discord Bot** | DAO analysis via Discord | ✅ Complete |
| **Telegram Bot** | Mobile-friendly access | ✅ Complete |
| **MCP Server** | Claude Desktop integration | ✅ Complete |
| **Enhanced Guardrails** | Production safety | ✅ Complete |
| **Audit System** | Cryptographic trail | ✅ Complete |
| **CI/CD Pipeline** | Automated quality gates | ✅ Complete |

---

## 🏗️ Architecture (One Diagram)

```
User Input (Discord/Telegram/Web/API/MCP)
    ↓
Enhanced Guardrails (risk check + multisig + roles)
    ↓
[HIGH/CRITICAL?] → Pending Approval (DB) → Admin Approval
    ↓
Agent Execution (with structured output validation)
    ↓
Cryptographic Audit Log (SHA256 + Merkle tree)
    ↓
[Payment Required?] → ATP Token OR x402 Micropayment
    ↓
Results + Revenue Distribution
```

---

## 💰 Payment Options

| Method | Network | Speed | Use Case |
|--------|---------|-------|----------|
| **ATP Token** | Fraxtal | Stake once | Long-term governance |
| **x402 USDC** | Base | Instant | One-time premium |

**Both work together!**

---

## 🔒 Risk Levels

| Level | Threshold | Multisig | Example |
|-------|-----------|----------|---------|
| **LOW** | - | No | Read data |
| **MEDIUM** | 0.70 | No | Analysis |
| **HIGH** | 0.90 | Optional | Create proposal |
| **CRITICAL** | 0.95 | Required | Execute vote, Transfer funds |

---

## 📁 Key Files (Where to Look)

### ATP
- Smart Contract: `contracts/atp/BitMindAgentToken.sol`
- Agent Wallet: `src/adk-agents/atp/agent-wallet.ts`
- Premium Agent: `src/adk-agents/agents/premium-analyst-atp.agent.ts`

### Safety
- Guardrails: `src/guardrail-manager-enhanced.ts`
- Audit: `src/audit/audit-logger.ts`
- DB Schema: `prisma/schema-audit.prisma`
- API: `src/api/audit-routes.ts`

### Bots & Channels
- Discord: `src/adk-agents/bots/discord-bot.ts`
- Telegram: `src/adk-agents/bots/telegram-bot.ts`
- MCP: `src/adk-agents/mcp-servers/dao-governance-mcp.ts`
- x402: `src/adk-agents/tools/x402-payment.ts`

### Config
- ADK CLI: `adk.config.ts`
- Environment: `.env` (copy from `env.atp.template`)
- Database: `prisma/schema-audit.prisma`

---

## 🎬 2-Minute Demo Script

**0:00-0:30** | Multi-Channel
- Discord: `/analyze prop-123`
- Telegram: Same command
- Web UI: Chat interface
- MCP: Claude integration

**0:30-1:00** | Payments
- ATP: Show token contract, revenue sharing
- x402: Request premium → pay → verify → access

**1:00-1:30** | Safety
- Trigger HIGH-risk → see guardrail block
- Show audit trail with hashes
- Display Merkle root

**1:30-2:00** | Production
- Show CI/CD with evals
- Show approval workflow
- Show comprehensive docs

**Key Message**: *"The only DAO agent with ATP + x402 + 5 channels + production safety!"*

---

## 📊 By The Numbers

- **7,100+** lines of code
- **17,000+** words of documentation
- **80+** major features
- **5** access channels
- **2** payment systems
- **4** risk levels
- **8** API endpoints
- **7** MCP tools
- **8** bot commands (each platform)
- **0** TypeScript errors

---

## 🎯 Environment Variables (Minimum)

```bash
# Required
GOOGLE_API_KEY=your_key

# For ATP (optional)
FRAXTAL_RPC_URL=https://rpc.frax.com
BITMIND_TOKEN_ADDRESS=0x...
AGENT_PRIVATE_KEY=0x...

# For x402 (optional)
PAYMENT_NETWORK=base-sepolia
PAYMENT_RECEIVER_ADDRESS=0x...

# For Bots (optional)
DISCORD_BOT_TOKEN=your_token
TELEGRAM_BOT_TOKEN=your_token
```

---

## 🚀 Installation (3 Steps)

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Add GOOGLE_API_KEY

# 3. Run
npm run adk:cli
```

---

## 📚 Documentation Map

**Getting Started** → `ALL_ERRORS_FIXED.md`  
**Commands** → `COMMANDS_REFERENCE.md`  
**ATP Features** → `ATP_QUICKSTART.md`  
**Safety** → `SAFETY_IMPROVEMENTS_COMPLETE.md`  
**Complete Overview** → `COMPLETE_INTEGRATION_SUMMARY.md`  

---

## 🏆 Hackathon Checklist

- [x] Multi-agent collaboration ✅
- [x] Novel application (DAO governance) ✅
- [x] Web3 integration (ATP + x402) ✅
- [x] Production-ready safety ✅
- [x] Complete documentation ✅
- [x] CI/CD pipeline ✅
- [x] Zero errors ✅
- [ ] Deploy to testnet
- [ ] Record demo video
- [ ] Submit!

---

## 💬 Need Help?

1. **Commands?** → `COMMANDS_REFERENCE.md`
2. **Setup?** → `SETUP_FIXED.md`
3. **ATP?** → `ATP_QUICKSTART.md`
4. **Safety?** → `SAFETY_IMPROVEMENTS_COMPLETE.md`
5. **Everything?** → `COMPLETE_INTEGRATION_SUMMARY.md`

---

**Print this card and keep it handy! 📋**

**Ready to revolutionize DAO governance! 🚀**

