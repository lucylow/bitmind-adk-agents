# CopilotKit Proxy Server

This Express server acts as a bridge between your Vite frontend and ADK-TS backend, implementing the AG-UI protocol via CopilotKit.

## Why Do We Need This?

Vite (unlike Next.js) doesn't have built-in API routes. This proxy server provides the `/api/copilotkit` endpoint that CopilotKit expects.

## Architecture

```
Vite Frontend (React)
    ↓
CopilotKit Components
    ↓
http://localhost:3001/api/copilotkit (THIS PROXY)
    ↓
http://localhost:8000/api/adk (Your ADK-TS Backend)
    ↓
Multi-Agent System
```

## Setup

```bash
cd backend-proxy
npm install
npm run dev
```

Server runs on `http://localhost:3001`

## Environment Variables

Create `.env` in this directory:

```env
PORT=3001
ADK_BACKEND_URL=http://localhost:8000
```

## Testing

```bash
# Health check
curl http://localhost:3001/health

# Test CopilotKit endpoint
curl -X POST http://localhost:3001/api/copilotkit \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "state": {}
  }'
```

## Deployment

Deploy to Railway, Render, or any Node.js hosting:

```bash
# Railway
railway up

# Render
# Create new Web Service, connect this folder
```

Make sure to update `VITE_COPILOT_URL` in your frontend `.env` to the deployed URL.

