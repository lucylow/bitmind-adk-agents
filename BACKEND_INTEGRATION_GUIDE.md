# 🔌 Backend-Frontend Integration Guide

## Complete ADK-TS Backend for DAO Governance Co-pilot

This document describes the complete backend implementation that connects your ADK-TS agents to the React frontend with real-time WebSocket support and RESTful APIs.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│  (Components, Hooks, Services)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │   HTTP REST API         │   WebSocket
        │                         │
┌───────▼──────────────────────────▼──────────────────────────┐
│              Express + Socket.IO Server                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Routes    WebSocket Handler    Middleware      │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │            Agent Service Layer                      │   │
│  │  (Wraps ADK-TS agents with business logic)          │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │               ADK-TS Agents                         │   │
│  │  • Proposal Analyst                                 │   │
│  │  • Voting Strategist                                │   │
│  │  • Treasury Monitor                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴───────────────┐
        │                              │
┌───────▼────────┐          ┌─────────▼─────────┐
│    MongoDB     │          │    Blockchain     │
│  (User Data)   │          │   (Proposals)     │
└────────────────┘          └───────────────────┘
```

---

## 📦 What Was Delivered

### Backend Implementation (8 Files)

1. **Configuration**
   - `backend/src/config/env.ts` - Environment validation with Zod
   - `backend/.env.example` - Environment template

2. **Database Models**
   - `backend/src/models/User.ts` - User profile, preferences, voting history
   - `backend/src/models/ProposalAnalysis.ts` - Cached proposal analyses

3. **Services**
   - `backend/src/services/AgentService.ts` - ADK-TS agent wrapper with business logic

4. **API Layer**
   - `backend/src/api/routes/agent.ts` - REST API endpoints
   - `backend/src/middleware/auth.ts` - Wallet signature authentication

5. **Real-time Communication**
   - `backend/src/websocket/socketHandler.ts` - WebSocket event handlers

6. **Server**
   - `backend/src/server.ts` - Main Express server with graceful shutdown

7. **Configuration**
   - `backend/package.json` - Dependencies and scripts

### Frontend Integration (4 Files)

1. **API Service**
   - `src/services/AgentApiService.ts` - HTTP + WebSocket client

2. **React Hooks**
   - `src/hooks/useAgentChat.ts` - Real-time chat functionality
   - `src/hooks/useProposalAnalysis.ts` - Proposal analysis & recommendations
   - `src/hooks/useAgentProfile.ts` - User profile management

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add your API keys
nano .env

# Required:
# GOOGLE_API_KEY=your_gemini_key

# Start MongoDB (if running locally)
mongod

# Start development server
npm run dev
```

The backend will start on `http://localhost:3001`

### 2. Frontend Setup

```bash
# In project root
npm install

# Create/update .env.local
echo "VITE_API_URL=http://localhost:3001" >> .env.local

# Start frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## 🔑 Key Features

### 1. RESTful API Endpoints

#### **POST `/api/agent/analyze-proposal`**
Analyze a DAO proposal using AI agents

**Request:**
```json
{
  "proposalId": "prop-123",
  "daoAddress": "0x...",
  "force": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "Analysis content...",
    "agent": "proposal-analyst",
    "confidence": 0.85,
    "suggestedActions": [...]
  },
  "cached": false,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### **POST `/api/agent/voting-recommendation`**
Get personalized voting recommendation

#### **POST `/api/agent/chat`**
Chat with AI agent

#### **GET `/api/agent/user/profile`**
Get user profile and preferences

#### **PUT `/api/agent/user/preferences`**
Update user preferences

#### **GET `/api/agent/user/history`**
Get interaction history

### 2. WebSocket Events

#### **Client → Server**

- `agent:message` - Send chat message
- `proposal:analyze` - Request proposal analysis
- `user:subscribe` - Subscribe to topics
- `user:unsubscribe` - Unsubscribe from topics

#### **Server → Client**

- `agent:response` - Agent chat response
- `agent:typing` - Typing indicator
- `agent:error` - Error message
- `proposal:analysis:start` - Analysis started
- `proposal:analysis:complete` - Analysis complete
- `proposal:analysis:error` - Analysis failed
- `user:notification` - User-specific notification
- `system:alert` - System-wide alert

### 3. Authentication

Uses wallet signature verification:

**Headers Required:**
```
x-wallet-address: 0x...
x-signature: 0x...
x-message: "Sign this message to authenticate: [timestamp]"
```

**Frontend Example:**
```typescript
import { ethers } from 'ethers';

// Generate authentication message
const message = `Sign this message to authenticate: [${new Date().toISOString()}]`;

// Sign with wallet
const signer = await provider.getSigner();
const signature = await signer.signMessage(message);

// Store for API requests
localStorage.setItem('walletAddress', address);
localStorage.setItem('signature', signature);
localStorage.setItem('authMessage', message);
```

---

## 💡 Usage Examples

### Frontend Component Usage

#### 1. Agent Chat

```typescript
import { useAgentChat } from '@/hooks/useAgentChat';

function ChatComponent() {
  const { messages, sendMessage, isConnected, isTyping } = useAgentChat({
    walletAddress: '0x...',
    signature: 'your_signature',
    authMessage: 'your_message',
    autoConnect: true
  });

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.type}:</strong> {msg.content}
        </div>
      ))}
      
      {isTyping && <div>Agent is typing...</div>}
      
      <button onClick={() => sendMessage('Analyze proposal #123')}>
        Send
      </button>
    </div>
  );
}
```

#### 2. Proposal Analysis

```typescript
import { useProposalAnalysis } from '@/hooks/useProposalAnalysis';

function ProposalPage({ proposalId }) {
  const { analysis, analyzeProposal, getRecommendation } = useProposalAnalysis();

  const handleAnalyze = async () => {
    await analyzeProposal(proposalId);
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={analysis.loading}>
        {analysis.loading ? 'Analyzing...' : 'Analyze Proposal'}
      </button>
      
      {analysis.data && (
        <div>
          <h3>Analysis:</h3>
          <pre>{JSON.stringify(analysis.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

#### 3. User Profile

```typescript
import { useAgentProfile } from '@/hooks/useAgentProfile';

function ProfileSettings({ walletAddress }) {
  const { profile, updatePreferences, loading } = useAgentProfile(walletAddress);

  const handleUpdate = async () => {
    await updatePreferences({
      riskTolerance: 'MODERATE',
      focusAreas: ['DEFI', 'GOVERNANCE'],
      votingStrategy: 'ACTIVE'
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Profile</h2>
      <p>Risk Tolerance: {profile?.preferences.riskTolerance}</p>
      <button onClick={handleUpdate}>Update Preferences</button>
    </div>
  );
}
```

---

## 🗄️ Database Schema

### User Model

```typescript
{
  walletAddress: string;
  nickname?: string;
  email?: string;
  preferences: {
    riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
    focusAreas: string[];
    votingStrategy: 'ACTIVE' | 'DELEGATE' | 'MIXED';
    notificationPreferences: {
      email: boolean;
      push: boolean;
      telegram: boolean;
    };
  };
  votingHistory: Array<{
    proposalId: string;
    vote: string;
    timestamp: Date;
    confidence?: number;
    reasoning?: string;
  }>;
  conversations: Array<{
    message: string;
    response: string;
    agent: string;
    timestamp: Date;
  }>;
  delegateAddress?: string;
  createdAt: Date;
  lastActive: Date;
}
```

### Proposal Analysis Model

```typescript
{
  proposalId: string;
  daoName: string;
  analysis: {
    summary: string;
    financialImpact: string;
    risks: Array<{
      type: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      description: string;
    }>;
    recommendations: string[];
    confidence: number;
  };
  timestamp: Date;
  expiresAt: Date; // TTL index - auto-delete after 7 days
}
```

---

## 🔒 Security Features

1. **Wallet Signature Authentication**
   - Cryptographic verification of user identity
   - Message expiration (5 minutes)
   - No passwords required

2. **Rate Limiting**
   - Configurable request limits
   - Per-user tracking
   - Automatic cleanup

3. **CORS Protection**
   - Configurable origins
   - Credential support

4. **Input Validation**
   - Zod schema validation
   - Type-safe APIs

5. **Secure Headers**
   - Helmet middleware
   - CSP in production

---

## 📊 Performance Optimizations

1. **Caching**
   - Proposal analyses cached for 24 hours
   - MongoDB TTL indexes for auto-cleanup

2. **Compression**
   - Gzip compression for HTTP responses

3. **WebSocket**
   - Real-time communication without polling
   - Automatic reconnection

4. **Database Indexing**
   - Optimized queries for common patterns
   - Compound indexes on frequently queried fields

---

## 🐛 Debugging

### Check Backend Health

```bash
curl http://localhost:3001/health
```

### Test WebSocket Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    walletAddress: '0x...',
    signature: '0x...',
    message: 'auth message'
  }
});

socket.on('connect', () => console.log('Connected!'));
socket.on('connect_error', (err) => console.error('Error:', err));
```

### Enable Debug Logging

```bash
# Backend
DEBUG=* npm run dev

# Frontend
localStorage.setItem('debug', '*');
```

---

## 🚢 Deployment

### Backend Deployment (Docker)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/dist ./dist

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

### Environment Variables (Production)

```bash
NODE_ENV=production
GOOGLE_API_KEY=<production_key>
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dao-copilot
JWT_SECRET=<strong_random_secret>
CORS_ORIGIN=https://your-frontend-domain.com
```

---

## 📚 API Documentation

Complete API documentation is generated from the code. Key endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/agent/analyze-proposal` | POST | Analyze proposal |
| `/api/agent/voting-recommendation` | POST | Get recommendation |
| `/api/agent/chat` | POST | Chat with agent |
| `/api/agent/user/profile` | GET | Get user profile |
| `/api/agent/user/preferences` | PUT | Update preferences |
| `/api/agent/user/history` | GET | Get history |
| `/api/agent/proposals/recent` | GET | Get recent proposals |

---

## 🎓 Next Steps

1. **Customize Agents**: Modify agent instructions in `AgentService.ts`
2. **Add Tools**: Create new tools for agents
3. **Extend API**: Add new endpoints in `routes/agent.ts`
4. **Add Features**: Implement notification system, voting automation, etc.
5. **Scale**: Add Redis caching, load balancing, horizontal scaling

---

## 🤝 Support

For issues or questions:
1. Check backend logs: `npm run dev` output
2. Test API endpoints with curl/Postman
3. Verify MongoDB connection
4. Check WebSocket connection in browser DevTools

---

**Your backend is now fully integrated with ADK-TS agents and ready for production deployment!** 🚀

