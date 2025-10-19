# 🔑 API Keys Mapping Guide

## Supabase Backend → Frontend Environment Variables

This document maps your Supabase backend secret names to the frontend `.env.local` variable names.

---

## ✅ **Correct Mapping**

### 1. **Hiro Stacks API** 🔥
| Supabase Backend | Frontend Variable | Your Value |
|------------------|-------------------|------------|
| `HIRO_KEY_BITMIND` | `VITE_HIRO_API_KEY` | `838b2c86380729ce15932b28e7004830` |

**Usage:** Real-time blockchain monitoring via WebSocket

---

### 2. **CoinMarketCap API** 📈
| Supabase Backend | Frontend Variable | Your Value |
|------------------|-------------------|------------|
| `COINMARKETCAP_API` | `VITE_COINMARKETCAP_API_KEY` | `c4dd8f6bfc794a64bd2ac35292575fdc` |

**Usage:** Enhanced cryptocurrency market data

---

### 3. **Cohere AI API** 🧠
| Supabase Backend | Frontend Variable | Your Value |
|------------------|-------------------|------------|
| `COHERE-Bitmind-production` | `VITE_COHERE_API_KEY` | `wXPn4lvSsndtltIQaF3upiZbrGiyIiShKN9uT8n1` |

**Usage:** Advanced AI classification and fraud detection

---

### 4. **Pinata IPFS API** ☁️
| Supabase Backend | Frontend Variable | Your Value |
|------------------|-------------------|------------|
| `Pinata-API-Secret` (API Key) | `VITE_PINATA_API_KEY` | `96405b9987dce548b5b8` |
| `Pinata-API-Secret` (API Secret) | `VITE_PINATA_SECRET_KEY` | `fdbc75a2e0f1cf21474eea653df773401eacc76cddaf2174ef7f603df00ba19b` |

**Note:** Pinata-JWT is not used by the frontend (only for server-side if needed)

**Usage:** Decentralized document storage for invoice evidence

---

### 5. **Twilio SMS API** 📱
| Supabase Backend | Frontend Variable | Your Value |
|------------------|-------------------|------------|
| `twilio-account-sid` | `VITE_TWILIO_ACCOUNT_SID` | `AC97e5b61a4de7a6a8d18ac807557f6ab8` |
| Auth Token | `VITE_TWILIO_AUTH_TOKEN` | `bb7038fcf702876199ceaab99c101295` |
| *(Not used in frontend)* | `VITE_TWILIO_PHONE_NUMBER` | Your Twilio phone number |

**Note:** 
- `twilio-api-sid` and `twilio-api-secret` are for API keys, not needed for frontend
- You need to add your Twilio phone number separately

**Usage:** SMS notifications for payment alerts

---

## 📝 **Your Complete `.env.local` File**

Create this file in your project root:

```bash
# ============================================
# BitMind - Production API Keys
# ============================================

# Supabase Database
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
VITE_TWILIO_PHONE_NUMBER=+1234567890

# Discord Webhook (if you have one)
# VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url

# ============================================
# Optional APIs (Not configured yet)
# ============================================

# VITE_OPENAI_API_KEY=sk-your-key
# VITE_ALPHA_VANTAGE_API_KEY=your-key
# VITE_HUGGINGFACE_API_KEY=your-key
# VITE_CHAINALYSIS_API_KEY=your-key
```

---

## 🔄 **Supabase Backend Variables (For Reference)**

These are already set in your Supabase backend:

```
✅ HIRO_KEY_BITMIND
✅ COINMARKETCAP_API
✅ COHERE-Bitmind-production
✅ Pinata-API-Secret (key)
✅ Pinata-API-Secret (secret)
✅ Pinata-JWT
✅ twilio-account-sid
✅ twilio-api-sid
✅ twilio-api-secret
```

---

## ⚠️ **Important Notes**

### **Frontend vs Backend**
- **Frontend (`.env.local`)**: Uses `VITE_` prefix, needed for browser-side code
- **Supabase Backend**: No prefix needed, used in Edge Functions

### **Twilio Configuration**
You provided API credentials, but the frontend typically uses:
- Account SID ✅ (you have this)
- Auth Token ✅ (you have this)
- Phone Number ❌ (you need to add your Twilio phone number)

### **Security Best Practices**
1. ✅ Never commit `.env.local` to git (already in `.gitignore`)
2. ✅ Use different keys for development vs production
3. ✅ Rotate keys periodically
4. ✅ Keep Supabase backend secrets separate from frontend

---

## 🧪 **Testing Your Configuration**

After creating `.env.local`, test each API:

### 1. Test Hiro API
Visit: `http://localhost:8080/realtime-monitor`
- Should show "🟢 Connected"

### 2. Test All APIs
Visit: `http://localhost:8080/api-showcase`
- Click "Test API" for each service
- Should see ✅ Success messages

### 3. Test Supabase
Visit: `http://localhost:8080/supabase-test`
- Should show connection successful

---

## 🚀 **Next Steps**

1. **Create `.env.local`** file with the content above
2. **Add Twilio phone number** to `VITE_TWILIO_PHONE_NUMBER`
3. **Restart dev server**: `npm run dev`
4. **Test APIs**: Visit `/api-showcase`
5. **Monitor real-time**: Visit `/realtime-monitor`

---

## 📞 **Missing Configuration**

You still need to add:

1. **Twilio Phone Number** - Your Twilio-assigned phone number (e.g., +1234567890)
2. **Discord Webhook** (Optional) - If you want Discord notifications
3. **OpenAI API Key** (Optional) - If you want to use OpenAI for parsing

---

## ✅ **Status**

- [x] Hiro API configured
- [x] CoinMarketCap API configured
- [x] Cohere API configured
- [x] Pinata IPFS configured
- [x] Twilio Account SID configured
- [x] Twilio Auth Token configured
- [ ] Twilio Phone Number needed
- [ ] Discord Webhook (optional)
- [ ] OpenAI API Key (optional)

---

**Ready to test!** 🎉

Create your `.env.local` file with the values above and restart your dev server.

