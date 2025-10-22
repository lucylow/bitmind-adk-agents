# 🎯 BitMind Commands Reference

Quick reference for all available commands and features.

---

## 📦 NPM Scripts

### Development & Testing

```bash
# Core ADK Commands
npm run adk:cli              # Interactive dev with hot reload
npm run adk:web              # Launch web UI (port 3000)
npm run adk:serve            # Run as API server (port 8000)

# Traditional Commands
npm run dev                  # Vite development server
npm run build                # Build for production
npm test                     # Run tests
```

### Agent Operations

```bash
# Individual Agents
npm run adk:proposal-analyst     # Run proposal analyst
npm run adk:voting-strategist    # Run voting strategist
npm run adk:treasury-monitor     # Run treasury monitor
npm run adk:workflow             # Run governance workflow

# Agent Testing
npm run adk:test                 # Test agents
npm run adk:demo                 # Run demo
npm run agents:check             # Type check agents
```

### ATP Integration

```bash
# ATP Agent
npm run atp:agent                # Start ATP-enabled premium agent
npm run atp:example              # Run ATP integration examples

# ATP Management
npm run atp:wallet               # Check agent wallet status
npm run atp:capabilities         # View unlocked capabilities
npm run atp:register             # Register on ATP marketplace
```

### Bots

```bash
# Start Bots
npm run bot:discord              # Start Discord bot
npm run bot:telegram             # Start Telegram bot
npm run bots:start               # Start both bots concurrently

# MCP Server
npm run mcp:server               # Start DAO governance MCP server
```

### x402 Payments

```bash
# Payment Testing
npm run x402:test                # Test x402 payment flow
```

---

## 🤖 Discord Bot Commands

### Free Commands

```
/help
    Show all available commands and features

/analyze <proposal-id>
    Get basic proposal analysis
    Example: /analyze prop-123

/vote <proposal-id>
    Get voting recommendation
    Example: /vote prop-456

/treasury <dao-address>
    Check DAO treasury health
    Example: /treasury 0x1234567890...

/status
    Check bot status and uptime
```

### Premium Commands (0.10 USDC via x402)

```
/analyze <proposal-id> --premium
    Deep analysis with risk modeling
    Example: /analyze prop-789 --premium
    
/delegate <dao-space>
    Get optimal delegation strategy
    Example: /delegate uniswap.eth
    
/verify <tx-hash>
    Verify payment and unlock premium access
    Example: /verify 0xabc123def456...
```

---

## 📱 Telegram Bot Commands

### Basic Commands

```
/start
    Welcome message and command overview

/help
    List all available commands

/status
    Check bot status
```

### Analysis Commands

```
/analyze <proposal-id>
    Basic proposal analysis (FREE)
    Example: /analyze prop-123

/premium <proposal-id>
    Premium analysis with x402 payment (0.10 USDC)
    Example: /premium prop-456

/vote <proposal-id>
    Get voting recommendation (FREE)
    Example: /vote prop-789

/treasury <dao-address>
    Treasury health analysis (FREE)
    Example: /treasury 0x1234567890...
```

### Premium Commands

```
/delegate <dao-space>
    Delegation optimization strategy (0.15 USDC)
    Example: /delegate gitcoindao.eth

/verify <tx-hash>
    Verify x402 payment
    Example: /verify 0xabc123...
```

---

## 🔌 MCP Server Tools

Available when running `npm run mcp:server` and configured in Claude Desktop:

### 1. fetch_snapshot_proposals
```json
{
  "space": "uniswap.eth",
  "state": "active",
  "limit": 10
}
```
Fetch active proposals from Snapshot.org

### 2. get_proposal_details
```json
{
  "proposalId": "0xabc123..."
}
```
Get detailed proposal information

### 3. get_voting_power
```json
{
  "address": "0x123...",
  "daoSpace": "uniswap.eth",
  "blockNumber": "latest"
}
```
Calculate voting power for an address

### 4. analyze_treasury
```json
{
  "daoAddress": "0x123...",
  "includeTokens": true,
  "includeNFTs": false
}
```
Analyze DAO treasury composition

### 5. get_delegation_info
```json
{
  "address": "0x123...",
  "daoSpace": "uniswap.eth"
}
```
Get delegation information

### 6. compare_proposals
```json
{
  "proposalId": "0xabc...",
  "searchSpaces": ["uniswap.eth", "gitcoindao.eth"]
}
```
Compare across DAOs

### 7. get_governance_metrics
```json
{
  "daoSpace": "uniswap.eth",
  "timeframe": "30d"
}
```
Get participation metrics

---

## 🌐 API Endpoints

When running `npm run adk:serve`:

### Health Check
```
GET http://localhost:8000/health
```

### List Agents
```
GET http://localhost:8000/api/agents
```

### Chat with Agent
```
POST http://localhost:8000/api/chat
{
  "agentId": "proposal-analyst",
  "message": "Analyze proposal prop-123",
  "sessionId": "user-session-123"
}
```

### List Tools
```
GET http://localhost:8000/api/tools
```

---

## 💳 x402 Payment Flow

### 1. Request Payment
Agent returns 402 response with payment details:
```json
{
  "status": 402,
  "payment": {
    "maxAmountRequired": "0.10",
    "asset": "0x833...913",
    "network": "base-sepolia",
    "payTo": "0xYourAgentWallet",
    "resource": "/api/premium/premium_analysis/prop-123"
  }
}
```

### 2. User Pays
User sends USDC transaction to payTo address

### 3. Verify Payment
```
Discord: /verify <tx-hash>
Telegram: /verify <tx-hash>
API: POST /api/verify-payment
```

### 4. Access Granted
24-hour access to premium features

---

## 🎨 Feature Pricing

| Feature | Price (USDC) | Access Duration |
|---------|--------------|-----------------|
| Basic Analysis | FREE | Always |
| Premium Analysis | 0.10 | 24 hours |
| Cross-DAO Comparison | 0.05 | 24 hours |
| Delegation Optimization | 0.15 | 24 hours |
| Custom Strategy | 0.25 | 24 hours |
| Risk Modeling | 0.20 | 24 hours |
| Predictive Analysis | 0.30 | 24 hours |

---

## 🔑 Environment Variables

### Required

```bash
# AI Models (at least one)
GOOGLE_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Bot Tokens (optional)
DISCORD_BOT_TOKEN=your_discord_token
TELEGRAM_BOT_TOKEN=your_telegram_token

# x402 Payments (optional)
PAYMENT_NETWORK=base-sepolia
USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
PAYMENT_RECEIVER_ADDRESS=0x...
PAYMENT_RECEIVER_PRIVATE_KEY=0x...

# RPC URLs
BASE_RPC_URL=https://sepolia.base.org
ETHEREUM_RPC_URL=https://eth.llamarpc.com
```

### ATP Integration (optional)

```bash
# Fraxtal Network
FRAXTAL_RPC_URL=https://rpc.frax.com
BITMIND_TOKEN_ADDRESS=0x...
AGENT_PRIVATE_KEY=0x...
IQ_TOKEN_ADDRESS=0x...
```

---

## 🚀 Quick Starts

### Developer Workflow

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your keys

# 3. Start development
npm run adk:cli
# Opens interactive dev mode with hot reload

# 4. Test in web UI
npm run adk:web
# Opens browser at http://localhost:3000
```

### Discord Bot

```bash
# 1. Create bot at https://discord.com/developers
# 2. Get token and add to .env
DISCORD_BOT_TOKEN=your_token

# 3. Invite bot to server
# https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot

# 4. Start bot
npm run bot:discord

# 5. Test commands
# /help
# /analyze prop-123
```

### Telegram Bot

```bash
# 1. Create bot with @BotFather
# 2. Get token and add to .env
TELEGRAM_BOT_TOKEN=your_token

# 3. Start bot
npm run bot:telegram

# 4. Test commands
# /start
# /analyze prop-123
```

### MCP Server (for Claude Desktop)

```bash
# 1. Start MCP server
npm run mcp:server

# 2. Configure Claude Desktop
# Add to ~/Library/Application Support/Claude/claude_desktop_config.json:
{
  "mcpServers": {
    "bitmind": {
      "command": "node",
      "args": ["/path/to/dist/mcp-servers/dao-governance-mcp.js"]
    }
  }
}

# 3. Restart Claude Desktop
# 4. Ask about DAO proposals!
```

---

## 🛠️ Troubleshooting

### Bot not responding?

```bash
# Check bot is running
npm run bot:discord
# or
npm run bot:telegram

# Check environment variables
echo $DISCORD_BOT_TOKEN
echo $TELEGRAM_BOT_TOKEN
```

### Payment verification failing?

```bash
# Check payment network
echo $PAYMENT_NETWORK  # Should be "base-sepolia"

# Check USDC address
echo $USDC_ADDRESS  # Should be Base USDC address

# Check transaction on explorer
# https://sepolia.basescan.org/tx/YOUR_TX_HASH
```

### ADK CLI not starting?

```bash
# Check Node version (need 18+)
node --version

# Reinstall dependencies
rm -rf node_modules
npm install

# Check TypeScript compilation
npm run build
```

### MCP server not connecting?

```bash
# Check server is running
npm run mcp:server
# Should see: "BitMind DAO Governance MCP server running"

# Check Claude Desktop config path
# Mac: ~/Library/Application Support/Claude/claude_desktop_config.json
# Windows: %APPDATA%\Claude\claude_desktop_config.json

# Check logs
tail -f ~/Library/Logs/Claude/mcp*.log
```

---

## 📚 Documentation Index

- **[CLI/x402/Bots Integration](./CLI_X402_MCP_BOTS_INTEGRATION.md)** - Complete guide
- **[ATP Integration](./ATP_INTEGRATION_SUMMARY.md)** - Token integration
- **[Quick Start](./ATP_QUICKSTART.md)** - Get started fast
- **[File Index](./ATP_FILE_INDEX.md)** - Find any file
- **[Commands Reference](./COMMANDS_REFERENCE.md)** - This file

---

## 🎯 Common Workflows

### Test a New Feature

```bash
# 1. Edit agent code
vim src/adk-agents/agents/proposal-analyst-adk.agent.ts

# 2. Hot reload automatically updates (if using adk:cli)
npm run adk:cli

# 3. Test in web UI
# Open http://localhost:3000

# 4. Test in bot
# /analyze prop-123 in Discord
```

### Deploy Premium Feature

```bash
# 1. Add feature to pricing
# Edit src/adk-agents/tools/x402-payment.ts

# 2. Update agent to use feature
# Edit agent file

# 3. Test payment flow
npm run x402:test

# 4. Deploy bots
npm run bots:start
```

### Add New DAO

```bash
# 1. Test Snapshot space
# https://snapshot.org/#/your-dao-space

# 2. Test in CLI
npm run adk:cli
# Ask: "Analyze proposals for your-dao-space"

# 3. Test in bot
# /analyze proposal-id
```

---

**Quick Reference Complete! 🎉**

*For detailed documentation, see the links above.*

