# PowerShell script to create .env.local file with your API keys

$envContent = @"
# ============================================
# BitMind - Production API Keys
# ============================================

# Supabase Database (Add your credentials from Supabase dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Contract Configuration
VITE_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
VITE_NETWORK=testnet
VITE_ESCROW_CONTRACT=escrow-secure

# ============================================
# Blockchain APIs
# ============================================

# Hiro Stacks API - Real-time monitoring
VITE_HIRO_API_KEY=838b2c86380729ce15932b28e7004830

# ============================================
# Market Data APIs
# ============================================

# CoinMarketCap - Crypto prices
VITE_COINMARKETCAP_API_KEY=c4dd8f6bfc794a64bd2ac35292575fdc

# ============================================
# AI APIs
# ============================================

# Cohere - AI classification
VITE_COHERE_API_KEY=wXPn4lvSsndtltIQaF3upiZbrGiyIiShKN9uT8n1

# ============================================
# Storage APIs
# ============================================

# Pinata IPFS - Document storage
VITE_PINATA_API_KEY=96405b9987dce548b5b8
VITE_PINATA_SECRET_KEY=fdbc75a2e0f1cf21474eea653df773401eacc76cddaf2174ef7f603df00ba19b

# ============================================
# Communication APIs
# ============================================

# Twilio SMS - Notifications
VITE_TWILIO_ACCOUNT_SID=AC97e5b61a4de7a6a8d18ac807557f6ab8
VITE_TWILIO_AUTH_TOKEN=bb7038fcf702876199ceaab99c101295
VITE_TWILIO_PHONE_NUMBER=+15555555555

# Discord Webhook (optional)
# VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url

# ============================================
# Optional APIs
# ============================================

# VITE_OPENAI_API_KEY=sk-your-key
# VITE_ALPHA_VANTAGE_API_KEY=your-key
# VITE_HUGGINGFACE_API_KEY=your-key
# VITE_CHAINALYSIS_API_KEY=your-key
"@

# Create .env.local file
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8 -NoNewline

Write-Host "✅ .env.local file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Open .env.local and add your Supabase URL and Anon Key"
Write-Host "2. Update VITE_TWILIO_PHONE_NUMBER with your actual Twilio number"
Write-Host "3. Run: npm run dev"
Write-Host "4. Visit: http://localhost:8080/api-showcase to test APIs"
Write-Host ""
Write-Host "📚 See API_KEYS_MAPPING.md for complete details" -ForegroundColor Cyan

