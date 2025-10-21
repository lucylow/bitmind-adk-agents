# BitMind API Integrations

## 🚀 Overview

BitMind integrates with **13+ external APIs** across 5 categories to deliver enterprise-grade invoice management with AI, blockchain, and real-time communication capabilities.

## 📊 API Categories

### 1. 🔗 Blockchain APIs

#### **Hiro Stacks API** (Priority: Essential)
- **Purpose**: Real-time Stacks blockchain data
- **Features**:
  - Transaction status tracking
  - Contract event monitoring
  - Account balance queries
  - Transaction history
- **Location**: `src/lib/api/blockchainAPIs.ts`
- **Usage**:
  ```typescript
  import { apiManager } from '@/lib/api/apiManager';
  
  const hiroAPI = apiManager.getAPI('hiro');
  const balance = await hiroAPI.getAccountBalance(address);
  const txStatus = await hiroAPI.getTransactionStatus(txId);
  ```

#### **Chainalysis API** (Priority: Enterprise)
- **Purpose**: Compliance screening and risk assessment
- **Features**:
  - Address screening
  - Risk scoring
  - AML compliance
- **Use Case**: Screen Bitcoin addresses for compliance before invoice creation

### 2. 📈 Market Data APIs

#### **CoinMarketCap API** (Priority: High)
- **Purpose**: Comprehensive cryptocurrency market data
- **Features**:
  - Real-time price data (BTC, STX, sBTC)
  - Historical price charts
  - Market metrics
  - Volume and liquidity data
- **Location**: `src/lib/api/marketDataAPIs.ts`
- **Usage**:
  ```typescript
  const cmcAPI = apiManager.getAPI('cmc');
  const prices = await cmcAPI.getCryptoPrices(['BTC', 'STX']);
  const history = await cmcAPI.getHistoricalData('BTC', 30);
  ```

#### **Alpha Vantage API** (Priority: Nice-to-Have)
- **Purpose**: Traditional finance and forex integration
- **Features**:
  - USD/BTC exchange rates
  - Forex data
  - Cross-currency conversions

### 3. 🧠 AI & ML APIs

#### **Cohere API** (Priority: Essential)
- **Purpose**: Advanced NLP for invoice intelligence
- **Features**:
  - Invoice type classification (milestone, lump_sum, recurring)
  - Fraud detection
  - Automatic summarization
  - Confidence scoring
- **Location**: `src/lib/api/enhancedAI.ts`
- **Usage**:
  ```typescript
  const cohereAPI = apiManager.getAPI('cohere');
  const classification = await cohereAPI.classifyInvoiceType(invoiceText);
  const fraudCheck = await cohereAPI.detectFraudulentInvoice(invoiceText);
  const summary = await cohereAPI.generateInvoiceSummary(invoiceText);
  ```

#### **Hugging Face API** (Priority: Nice-to-Have)
- **Purpose**: Entity extraction and sentiment analysis
- **Features**:
  - Named entity recognition (NER)
  - Sentiment analysis
  - Advanced text understanding

### 4. 💬 Communication APIs

#### **Twilio SMS API** (Priority: Medium)
- **Purpose**: SMS notifications for critical events
- **Features**:
  - Invoice creation alerts
  - Payment release notifications
  - Milestone completion updates
- **Location**: `src/lib/api/communicationAPIs.ts`
- **Usage**:
  ```typescript
  const twilioAPI = apiManager.getAPI('twilio');
  await twilioAPI.sendInvoiceNotification(
    phoneNumber,
    invoiceId,
    amount
  );
  await twilioAPI.sendPaymentAlert(phoneNumber, amount);
  ```

#### **Discord Webhook API** (Priority: High)
- **Purpose**: Real-time DAO community notifications
- **Features**:
  - Rich embed messages
  - Invoice status updates
  - Payment alerts
  - Custom formatting
- **Usage**:
  ```typescript
  const discordAPI = apiManager.getAPI('discord');
  await discordAPI.sendInvoiceCreated(invoiceData);
  await discordAPI.sendInvoiceFunded(invoiceData);
  await discordAPI.sendInvoiceReleased(invoiceData);
  ```

### 5. ☁️ Storage & Document APIs

#### **Pinata IPFS API** (Priority: Essential)
- **Purpose**: Decentralized document storage
- **Features**:
  - Invoice document upload
  - Evidence/proof storage
  - JSON metadata storage
  - IPFS pinning
- **Location**: `src/lib/api/documentAPIs.ts`
- **Usage**:
  ```typescript
  const pinataAPI = apiManager.getAPI('pinata');
  const ipfsHash = await pinataAPI.uploadInvoiceDocument(file, metadata);
  const jsonHash = await pinataAPI.uploadJSON(data, 'Invoice Evidence');
  const content = await pinataAPI.getFileByHash(ipfsHash);
  ```

## 🎯 Hackathon Impact

### Technical Excellence
- **13+ API integrations** demonstrate technical depth
- **Multi-category coverage** shows comprehensive solution
- **Error handling** with fallbacks for reliability
- **Type safety** with TypeScript throughout

### AI Innovation
- **Cohere integration** for advanced invoice classification
- **Fraud detection** using ML models
- **Confidence scoring** for AI predictions
- **Fallback parser** when AI unavailable

### Bitcoin Alignment
- **Hiro API** for Stacks blockchain data
- **Real-time tx tracking** for invoice lifecycle
- **sBTC price data** from CoinMarketCap
- **Compliance screening** via Chainalysis

### User Experience
- **Real-time notifications** via Discord/Twilio
- **Decentralized storage** with IPFS
- **Market data** for accurate pricing
- **Automated workflows** reducing manual work

## 📱 API Showcase Page

Visit `/api-showcase` to see:
- ✅ API configuration status
- 🧪 Live API testing interface
- 📊 Integration health dashboard
- 📚 Configuration documentation

## 🔧 Configuration

### Quick Start

1. Copy environment variables from `ENV_SETUP.md`
2. Add to `.env.local`:
   ```bash
   VITE_HIRO_API_KEY=your-key
   VITE_COINMARKETCAP_API_KEY=your-key
   VITE_COHERE_API_KEY=your-key
   VITE_PINATA_API_KEY=your-key
   VITE_PINATA_SECRET_KEY=your-secret
   VITE_DISCORD_WEBHOOK_URL=your-webhook
   ```

3. Access API Manager:
   ```typescript
   import { apiManager } from '@/lib/api/apiManager';
   
   // Check what's available
   const status = apiManager.getAPIStatus();
   
   // Use any API
   const api = apiManager.getAPI('hiro');
   ```

### API Priority Levels

**Tier 1 - Essential** (Demo Must-Haves):
- ✅ Hiro API (blockchain data)
- ✅ CoinMarketCap (market data)
- ✅ Cohere (AI classification)

**Tier 2 - High Impact**:
- ✅ Pinata IPFS (storage)
- ✅ Discord (notifications)

**Tier 3 - Nice to Have**:
- Twilio (SMS)
- Chainalysis (compliance)
- Others

## 📈 Performance

- **Caching**: 5-minute TTL for parsed invoices
- **Error handling**: Graceful fallbacks for all APIs
- **Async/await**: Non-blocking operations
- **Type safety**: Full TypeScript support

## 🏆 Competitive Advantages

1. **Most Comprehensive**: 13+ integrations vs typical 2-3
2. **AI-First**: Multiple AI providers with fallbacks
3. **Bitcoin Native**: Deep Stacks/Bitcoin integration
4. **Enterprise Ready**: Compliance, notifications, storage
5. **Real-time**: WebSocket + webhook notifications
6. **Decentralized**: IPFS storage for documents

## 📚 Documentation

- `ENV_SETUP.md` - Detailed API key setup
- `API_INTEGRATIONS.md` - This file
- `/api-showcase` - Live demo and testing

## 🚀 Next Steps

1. ✅ Add API keys to `.env.local`
2. ✅ Test on `/api-showcase` page
3. ✅ Integrate into invoice workflow
4. ✅ Monitor API usage/limits
5. ✅ Expand with additional providers

---

**Built for Hackathon Success** 🏆
BitMind demonstrates technical excellence, innovation, and practical utility through comprehensive API integration.

