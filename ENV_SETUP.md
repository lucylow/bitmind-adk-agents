# BitMind API Configuration Guide

## Required Environment Variables

Copy these to your `.env.local` file and replace with your actual API keys:

```bash
# Existing APIs
VITE_OPENAI_API_KEY=sk-your-openai-key-here

# Supabase Database (See SUPABASE_SETUP_GUIDE.md for detailed setup)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Contract Configuration
VITE_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

# Blockchain APIs - Hiro Stacks (Essential for Real-time Monitoring)
VITE_HIRO_API_KEY=your-hiro-api-key-here
VITE_NETWORK=testnet
VITE_ESCROW_CONTRACT=escrow-secure
VITE_CHAINALYSIS_API_KEY=your-chainalysis-key-here

# Market Data APIs
VITE_COINMARKETCAP_API_KEY=your-coinmarketcap-key-here
VITE_ALPHA_VANTAGE_API_KEY=your-alphavantage-key-here

# Enhanced AI APIs
VITE_COHERE_API_KEY=your-cohere-key-here
VITE_HUGGINGFACE_API_KEY=your-huggingface-token-here

# Communication APIs
VITE_TWILIO_ACCOUNT_SID=your-twilio-account-sid
VITE_TWILIO_AUTH_TOKEN=your-twilio-auth-token
VITE_TWILIO_PHONE_NUMBER=+1234567890
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url

# Document & Storage APIs
VITE_PINATA_API_KEY=your-pinata-api-key
VITE_PINATA_SECRET_KEY=your-pinata-secret-key
```

## API Priority for Hackathon

### Essential (Tier 1)
1. **Hiro API** - Real-time Stacks blockchain data
2. **CoinMarketCap API** - Enhanced market data
3. **Cohere API** - Advanced AI classification

### High Impact (Tier 2)
4. **Pinata IPFS API** - Decentralized document storage
5. **Discord Webhook** - DAO community notifications

### Nice to Have (Tier 3)
6. **Twilio API** - SMS notifications
7. **Chainalysis API** - Compliance screening (enterprise)

## How to Get API Keys

### Hiro API ⭐ (Essential for Real-time Features)
- Visit: https://www.hiro.so/
- Sign up for free account at https://platform.hiro.so/
- Generate API key in dashboard
- **Features Enabled:**
  - Real-time WebSocket transaction monitoring
  - Contract event tracking
  - Mempool transaction subscriptions
  - Transaction history queries
- **Free Tier:** Generous limits for hackathon use

### CoinMarketCap
- Visit: https://coinmarketcap.com/api/
- Free tier: 10,000 calls/month
- Get API key from developer portal

### Cohere
- Visit: https://cohere.ai/
- Sign up for free trial
- Access API key in dashboard

### Pinata
- Visit: https://www.pinata.cloud/
- Free tier: 1GB storage
- Get API key and secret from account

### Discord Webhook
- Create webhook in Discord server settings
- Copy webhook URL

### Twilio (Optional)
- Visit: https://www.twilio.com/
- Free trial includes credits
- Get Account SID and Auth Token

