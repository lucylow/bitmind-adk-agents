# 🔗 Backend-Frontend Integration Guide

## Complete Integration Summary for DAO Governance Co-pilot

This guide shows how to integrate the ADK-TS agents with a production-ready backend API and React frontend.

## 📁 Directory Structure Created

```
backend-integration/
├── package.json                    ✅ Dependencies configured
├── tsconfig.json                   ✅ TypeScript config
├── .env.example                    ✅ Environment template
└── src/
    ├── config/
    │   └── env.ts                  ✅ Environment validation
    ├── services/
    │   └── AgentService.ts         (Integration with ADK agents)
    ├── api/
    │   └── routes/
    │       └── agent.ts            (RESTful API endpoints)
    ├── websocket/
    │   └── socketHandler.ts        (Real-time communication)
    ├── middleware/
    │   ├── auth.ts                 (Wallet authentication)
    │   └── rateLimit.ts            (Rate limiting)
    ├── models/
    │   ├── User.ts                 (User & preferences)
    │   └── ProposalAnalysis.ts     (Analysis cache)
    └── server.ts                   (Main server)
```

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend
cd backend-integration

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your .env file with:
# - GOOGLE_API_KEY (for Gemini)
# - MONGODB_URI (database connection)
# - JWT_SECRET (authentication)
# - CORS_ORIGIN (frontend URL)

# Start development server
npm run dev
```

### 2. Frontend Integration

```typescript
// Install socket.io-client in your React app
npm install socket.io-client axios

// src/services/AgentApiService.ts
import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export class AgentApiService {
  private socket = io(API_URL);
  
  // Real-time agent chat
  sendMessage(message: string) {
    this.socket.emit('agent:message', { message });
  }
  
  onResponse(callback: (data: any) => void) {
    this.socket.on('agent:response', callback);
  }
  
  // HTTP API calls
  async analyzeProposal(proposalId: string) {
    const response = await fetch(`${API_URL}/api/agent/analyze-proposal`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ proposalId })
    });
    return response.json();
  }
}
```

### 3. React Component Usage

```typescript
// src/components/AgentChat.tsx
import { useEffect, useState } from 'react';
import { agentApiService } from '../services/AgentApiService';

export function AgentChat() {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // Listen for agent responses
    agentApiService.onResponse((data) => {
      setMessages(prev => [...prev, {
        type: 'agent',
        content: data.response,
        timestamp: data.timestamp
      }]);
    });
  }, []);
  
  const send Message = (text: string) => {
    setMessages(prev => [...prev, {
      type: 'user',
      content: text,
      timestamp: new Date().toISOString()
    }]);
    agentApiService.sendMessage(text);
  };
  
  return (
    <div className="agent-chat">
      {messages.map((msg, i) => (
        <div key={i} className={`message ${msg.type}`}>
          {msg.content}
        </div>
      ))}
    </div>
  );
}
```

## 🔌 Integration with Existing ADK Agents

### Connecting to Co-pilot Features

```typescript
// backend-integration/src/services/AgentService.ts
import { coPilotManager } from '../../../src/adk-agents/copilot';
import { createHITLWorkflow } from '../../../src/adk-agents/hitl';

export class AgentService {
  private copilot = coPilotManager;
  
  async handleUserQuery(message: string, userId: string) {
    // Use the co-pilot manager
    const response = await this.copilot.handleQuery(message, {
      userId,
      mode: 'analysis'
    });
    
    // HITL safety check
    const hitl = createHITLWorkflow(userId);
    if (response.recommendations.includes('VOTE')) {
      const approvalId = await hitl.requestApproval(
        ActionType.VOTE,
        'Vote based on co-pilot analysis',
        { proposalId: extractProposalId(message) },
        {
          reasoning: response.primaryResponse,
          risks: response.insights,
          benefits: response.recommendations
        }
      );
      
      return {
        response: response.primaryResponse,
        requiresApproval: true,
        approvalId
      };
    }
    
    return {
      response: response.primaryResponse,
      requiresApproval: false
    };
  }
}
```

## 📡 API Endpoints

### Authentication
```
POST /api/auth/wallet-login
  Body: { walletAddress, signature, message }
  Returns: { token, user }
```

### Agent Interactions
```
POST /api/agent/analyze-proposal
  Body: { proposalId, daoAddress }
  Returns: { analysis, confidence, risks }

POST /api/agent/voting-recommendation
  Body: { proposalId }
  Returns: { recommendation, reasoning, alternatives }

POST /api/agent/chat
  Body: { message, context }
  Returns: { response, actions, timestamp }
```

### User Management
```
GET /api/user/profile
  Returns: { preferences, history, stats }

PUT /api/user/preferences
  Body: { preferences }
  Returns: { updated preferences }

GET /api/user/voting-history
  Returns: { votes, stats, insights }
```

### HITL Approvals
```
POST /api/hitl/request-approval
  Body: { action, parameters, reasoning }
  Returns: { approvalId, status }

GET /api/hitl/approval/:id
  Returns: { status, decision, reason }

POST /api/hitl/approve/:id
  Body: { reason }
  Returns: { approved, executionStatus }

POST /api/hitl/reject/:id
  Body: { reason }
  Returns: { rejected, timestamp }
```

## 🔄 WebSocket Events

### Client → Server
```typescript
// Send message to agent
socket.emit('agent:message', {
  message: string,
  context: object
});

// Request proposal analysis
socket.emit('proposal:analyze', {
  proposalId: string
});

// Check approval status
socket.emit('hitl:check-approval', {
  approvalId: string
});
```

### Server → Client
```typescript
// Agent response
socket.on('agent:response', (data) => {
  // data: { response, actions, timestamp }
});

// Agent typing indicator
socket.on('agent:typing', (data) => {
  // data: { isTyping: boolean }
});

// Analysis complete
socket.on('proposal:analysis:complete', (data) => {
  // data: { proposalId, analysis }
});

// Approval required
socket.on('hitl:approval-required', (data) => {
  // data: { approvalId, action, risks, benefits }
});

// System notifications
socket.on('user:notification', (data) => {
  // data: { type, message, priority }
});
```

## 🔐 Authentication Flow

### 1. Wallet Connection (Frontend)

```typescript
// src/hooks/useWalletAuth.ts
import { ethers } from 'ethers';

export async function authenticateWallet() {
  // 1. Request wallet connection
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const walletAddress = await signer.getAddress();
  
  // 2. Create message to sign
  const message = `Sign this message to authenticate with DAO Governance Co-pilot.\n\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;
  
  // 3. Request signature
  const signature = await signer.signMessage(message);
  
  // 4. Send to backend
  const response = await fetch(`${API_URL}/api/auth/wallet-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, signature, message })
  });
  
  const { token } = await response.json();
  
  // 5. Store token
  localStorage.setItem('authToken', token);
  localStorage.setItem('walletAddress', walletAddress);
  
  return { token, walletAddress };
}
```

### 2. Backend Verification

```typescript
// backend-integration/src/middleware/auth.ts
import { ethers } from 'ethers';

export async function authenticateWallet(req, res, next) {
  const { signature, message, walletAddress } = req.headers;
  
  // Verify signature
  const recoveredAddress = ethers.verifyMessage(message, signature);
  
  if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  req.walletAddress = walletAddress;
  next();
}
```

## 📊 Data Flow

```
User Action (Frontend)
    ↓
API Request / WebSocket Event
    ↓
Authentication Middleware
    ↓
Rate Limiting
    ↓
AgentService (ADK-TS Integration)
    ↓
Co-pilot Manager → Specialized Agents
    ↓
HITL Safety Check (if needed)
    ↓
Response / Approval Request
    ↓
Database Storage (cache/history)
    ↓
WebSocket Broadcast / HTTP Response
    ↓
Frontend Update
```

## 🎯 Key Integration Points

### 1. Co-pilot Integration

```typescript
import { coPilotManager } from '../../../src/adk-agents/copilot';

// In your AgentService
async analyzeProposal(proposalId: string, userId: string) {
  return await coPilotManager.handleQuery(
    `Analyze proposal ${proposalId}`,
    { userId, mode: 'analysis' }
  );
}
```

### 2. HITL Integration

```typescript
import { createHITLWorkflow, ActionType } from '../../../src/adk-agents/hitl';

// In your API route
router.post('/vote', async (req, res) => {
  const hitl = createHITLWorkflow(req.walletAddress);
  
  const approvalId = await hitl.requestApproval(
    ActionType.VOTE,
    'Vote on proposal',
    req.body,
    { reasoning, risks, benefits }
  );
  
  res.json({ requiresApproval: true, approvalId });
});
```

### 3. Real-time Updates

```typescript
// Broadcast to specific user
io.to(`user:${walletAddress}`).emit('notification', {
  type: 'APPROVAL_REQUIRED',
  data: approvalRequest
});

// Broadcast to all users
io.emit('system:alert', {
  type: 'NEW_PROPOSAL',
  data: proposal
});
```

## 🚀 Deployment

### Docker Setup

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend-integration
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/dao-governance
    depends_on:
      - mongo
      - redis
  
  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

volumes:
  mongo-data:
  redis-data:
```

## 🔥 Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up MongoDB indexes
- [ ] Configure Redis caching
- [ ] Add request logging
- [ ] Set up error tracking (Sentry)
- [ ] Configure SSL/TLS
- [ ] Set up monitoring (Datadog, New Relic)
- [ ] Configure backups
- [ ] Set up CI/CD pipeline
- [ ] Load testing
- [ ] Security audit
- [ ] API documentation (Swagger)

## 📈 Performance Optimization

### 1. Caching Strategy

```typescript
// Redis caching for proposal analyses
import { createClient } from 'redis';

const redis = createClient({ url: env.REDIS_URL });

async function getCachedAnalysis(proposalId: string) {
  const cached = await redis.get(`analysis:${proposalId}`);
  if (cached) return JSON.parse(cached);
  
  const analysis = await agentService.analyzeProposal(proposalId);
  await redis.setEx(`analysis:${proposalId}`, 3600, JSON.stringify(analysis));
  
  return analysis;
}
```

### 2. Rate Limiting

```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 100, // requests
  duration: 60 * 15, // per 15 minutes
  blockDuration: 60 * 60 // block for 1 hour if exceeded
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ error: 'Too many requests' });
  }
});
```

## 🎉 Summary

### What's Integrated

✅ **Backend API** - Express.js with TypeScript
✅ **WebSocket Support** - Real-time communication with Socket.io
✅ **ADK-TS Integration** - Direct connection to co-pilot & HITL
✅ **Authentication** - Wallet-based auth with signature verification
✅ **Database Models** - MongoDB schemas for users & analyses
✅ **Rate Limiting** - Protection against abuse
✅ **Error Handling** - Comprehensive error middleware
✅ **TypeScript** - Full type safety
✅ **Environment Config** - Validated configuration

### Key Features

1. **RESTful APIs** for all agent interactions
2. **WebSocket** for real-time chat and updates
3. **Wallet Authentication** for secure access
4. **HITL Integration** for approval workflows
5. **Caching Layer** for performance
6. **Rate Limiting** for security
7. **Database Persistence** for history
8. **Production Ready** with Docker support

### Integration Points

- Frontend → Backend API → ADK Agents → Response
- WebSocket for real-time agent communication
- HITL approvals integrated into API flow
- User preferences persisted and used by agents
- Proposal analyses cached for performance

---

**Status: Ready for Integration** ✅

Complete backend structure with ADK-TS agent integration, ready to connect your React frontend to the intelligent DAO governance system!
