# 🚀 Quick Setup Instructions

## Step 1: Create Your `.env.local` File

Copy `env.local.template` to `.env.local`:

```bash
# On Windows PowerShell:
Copy-Item env.local.template .env.local

# On Mac/Linux:
cp env.local.template .env.local
```

## Step 2: Add Missing Values

Open `.env.local` and update these values:

### Required:
1. **VITE_SUPABASE_URL** - Your Supabase project URL
2. **VITE_SUPABASE_ANON_KEY** - Your Supabase anon key
3. **VITE_TWILIO_PHONE_NUMBER** - Your Twilio phone number (e.g., +1234567890)

### All Other APIs are Already Configured! ✅
- ✅ Hiro API
- ✅ CoinMarketCap API
- ✅ Cohere API
- ✅ Pinata IPFS
- ✅ Twilio Account SID & Auth Token

## Step 3: Restart Dev Server

```bash
npm run dev
```

## Step 4: Test Your Setup

Visit these pages:
1. **API Showcase**: http://localhost:8080/api-showcase
2. **Real-time Monitor**: http://localhost:8080/realtime-monitor
3. **Supabase Test**: http://localhost:8080/supabase-test

---

## 📋 Quick Reference

See `API_KEYS_MAPPING.md` for the complete mapping between:
- Supabase backend variable names
- Frontend `.env.local` variable names
- Your actual API key values

---

**That's it!** Your BitMind app is ready to go! 🎉

