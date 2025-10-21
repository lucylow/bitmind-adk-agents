# 🚀 DAO Governance Co-pilot Backend API

Backend server for the DAO Governance Co-pilot, providing AI-powered proposal analysis and voting recommendations through ADK-TS agents.

## Features

- 🤖 **ADK-TS Integration** - Gemini 2.0 powered AI agents
- 🔌 **WebSocket Support** - Real-time bidirectional communication
- 🗄️ **MongoDB Persistence** - User profiles and analysis caching
- 🔐 **Wallet Authentication** - Cryptographic signature verification
- ⚡ **Rate Limiting** - Configurable request throttling
- 📊 **RESTful API** - 8 comprehensive endpoints
- 🛡️ **Security** - Helmet, CORS, JWT support
- 📈 **Performance** - Compression, caching, indexing

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key ([Get here](https://aistudio.google.com/apikey))

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit .env and add your API keys
nano .env
```

### Environment Configuration

Required variables in `.env`:

```bash
# Required
GOOGLE_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017/dao-copilot

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Security
JWT_SECRET=your_jwt_secret_here
```

### Start Server

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start

# Production with PM2
pm2 start dist/server.js --name dao-copilot-backend
```

Server will start at `http://localhost:3001`

## API Endpoints

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "agents": "initialized"
  }
}
```

### Agent Endpoints

All agent endpoints require authentication headers:
```
x-wallet-address: 0x...
x-signature: 0x...
x-message: "Sign this message to authenticate: [timestamp]"
```

#### Analyze Proposal

```bash
POST /api/agent/analyze-proposal
Content-Type: application/json

{
  "proposalId": "prop-123",
  "daoAddress": "0x...",
  "force": false
}
```

#### Get Voting Recommendation

```bash
POST /api/agent/voting-recommendation
Content-Type: application/json

{
  "proposalId": "prop-123"
}
```

#### Chat with Agent

```bash
POST /api/agent/chat
Content-Type: application/json

{
  "message": "Should we approve this treasury allocation?",
  "context": {}
}
```

#### Get User Profile

```bash
GET /api/agent/user/profile
```

#### Update Preferences

```bash
PUT /api/agent/user/preferences
Content-Type: application/json

{
  "preferences": {
    "riskTolerance": "MODERATE",
    "focusAreas": ["DEFI", "GOVERNANCE"],
    "votingStrategy": "ACTIVE"
  }
}
```

## WebSocket Events

Connect to WebSocket at `ws://localhost:3001`

### Client → Server Events

```javascript
// Send chat message
socket.emit('agent:message', {
  message: 'Analyze proposal #123',
  context: {}
});

// Request proposal analysis
socket.emit('proposal:analyze', {
  proposalId: 'prop-123',
  daoAddress: '0x...'
});

// Subscribe to topics
socket.emit('user:subscribe', {
  topics: ['proposals', 'alerts']
});
```

### Server → Client Events

```javascript
// Agent response
socket.on('agent:response', (data) => {
  console.log(data.content);
});

// Typing indicator
socket.on('agent:typing', (data) => {
  console.log('Agent is typing:', data.isTyping);
});

// Analysis complete
socket.on('proposal:analysis:complete', (data) => {
  console.log('Analysis:', data.analysis);
});

// Notifications
socket.on('user:notification', (notification) => {
  console.log('Notification:', notification);
});
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── env.ts              # Environment validation
│   ├── models/
│   │   ├── User.ts             # User data model
│   │   └── ProposalAnalysis.ts # Analysis cache model
│   ├── services/
│   │   └── AgentService.ts     # ADK-TS agent wrapper
│   ├── api/
│   │   └── routes/
│   │       └── agent.ts        # API route handlers
│   ├── middleware/
│   │   └── auth.ts             # Authentication middleware
│   ├── websocket/
│   │   └── socketHandler.ts    # WebSocket event handlers
│   └── server.ts               # Main application entry
├── package.json
├── tsconfig.json
├── env.example
└── README.md
```

## Architecture

```
Express Server + Socket.IO
        ↓
  Agent Service
        ↓
  ADK-TS Agents
   (Gemini 2.0)
        ↓
    MongoDB
```

### Three Specialized Agents

1. **Proposal Analyst** - Deep proposal analysis
2. **Voting Strategist** - Personalized recommendations
3. **Treasury Monitor** - Financial health assessment

## Development

### Run in Development Mode

```bash
npm run dev
```

Uses `nodemon` and `tsx` for hot reload.

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Testing

```bash
npm test
```

## Database Schema

### User Collection

```typescript
{
  walletAddress: string;      // Primary key
  preferences: {
    riskTolerance: string;
    focusAreas: string[];
    votingStrategy: string;
  };
  votingHistory: Array<{
    proposalId: string;
    vote: string;
    timestamp: Date;
  }>;
  conversations: Array<{
    message: string;
    response: string;
    agent: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  lastActive: Date;
}
```

### ProposalAnalysis Collection

```typescript
{
  proposalId: string;         // Index
  daoName: string;
  analysis: {
    summary: string;
    risks: Array<RiskFactor>;
    recommendations: string[];
    confidence: number;
  };
  timestamp: Date;
  expiresAt: Date;            // TTL index (7 days)
}
```

## Security

### Authentication

Uses wallet signature verification:

1. Client signs message with wallet
2. Server verifies signature matches wallet address
3. Message includes timestamp (5-minute expiry)

### Rate Limiting

- Default: 100 requests per 15 minutes
- Configurable via environment variables
- Per-user tracking

### CORS

- Configured allowed origins
- Credentials support for authenticated requests

## Performance

### Caching

- Proposal analyses cached for 24 hours
- MongoDB TTL indexes for auto-cleanup
- Reduces redundant AI agent calls

### Compression

- Gzip compression for all HTTP responses
- Reduces bandwidth usage by ~70%

### Database Optimization

- Indexed queries for common patterns
- Connection pooling
- Efficient query patterns

## Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

### Environment Variables (Production)

```bash
NODE_ENV=production
GOOGLE_API_KEY=<production_key>
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dao-copilot
REDIS_URL=redis://production-redis:6379
JWT_SECRET=<strong_random_secret>
CORS_ORIGIN=https://your-frontend-domain.com
```

### PM2 Process Manager

```bash
# Start
pm2 start dist/server.js --name dao-backend

# Monitor
pm2 monit

# Logs
pm2 logs dao-backend

# Restart
pm2 restart dao-backend
```

## Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3001/health
```

### Logs

Development logs to console with timestamps.

Production logs should be directed to a logging service:
- Winston for structured logging
- Sentry for error tracking
- DataDog for metrics

## Troubleshooting

### Server Won't Start

**MongoDB Connection Error:**
```bash
# Check if MongoDB is running
mongod --version
mongo

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://...
```

**Port Already in Use:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3002
```

### Agent Initialization Failed

**Missing API Key:**
```bash
# Verify in .env
echo $GOOGLE_API_KEY

# Should not be empty
```

**API Key Invalid:**
- Get new key from https://aistudio.google.com/apikey
- Ensure key has Gemini API access enabled

### WebSocket Connection Issues

**CORS Error:**
- Check CORS_ORIGIN in backend .env matches frontend URL
- Ensure Socket.IO CORS configuration is correct

**Authentication Failed:**
- Verify wallet signature is valid
- Check message timestamp (not expired)
- Ensure headers are correctly formatted

## API Rate Limits

| Endpoint | Rate Limit |
|----------|-----------|
| All endpoints | 100 req/15min |
| Analysis | 20 req/15min |
| Chat | 50 req/15min |

Configurable via:
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests and linting
5. Submit pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Check logs: `npm run dev` output
- Test endpoints with curl/Postman
- Verify MongoDB connection
- Check environment variables

---

**Built with ADK-TS by IQ.AI** 🚀
