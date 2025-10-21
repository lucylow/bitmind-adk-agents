# BitMind ADK-TS + AG-UI Integration Plan

## 🎯 Goal
Integrate CopilotKit (AG-UI protocol) with existing Vite + React + TypeScript + Supabase stack.

## 📊 Current vs Target Architecture

### Current (Working but Basic)
```
React Component → Direct Import → ADK Agent (TypeScript)
     ↓
State Management via useState
```

### Target (AG-UI Protocol)
```
React Component → CopilotKit Provider → API Endpoint → ADK Agent
     ↓                    ↓                    ↓
 useCoAgent Hook    Real-time Sync      AG-UI Protocol
```

## 🚀 Implementation Steps

### Step 1: Install CopilotKit Dependencies
```bash
npm install @copilotkit/react-core @copilotkit/react-ui
npm install @copilotkit/runtime
```

### Step 2: Create Backend API Endpoint (Vite Compatible)

Since Vite doesn't have built-in API routes like Next.js, we have two options:

#### Option A: Use Supabase Edge Function as Proxy
```typescript
// supabase/functions/copilotkit-agent/index.ts
import { serve } from 'https://deno.land/std@0.203.0/http/server.ts';
import { CopilotRuntime, HttpAgent } from 'npm:@copilotkit/runtime';

serve(async (req) => {
  const runtime = new CopilotRuntime();
  
  // Connect to your ADK-TS backend
  const agent = new HttpAgent({
    url: Deno.env.get('ADK_BACKEND_URL') || 'http://localhost:8000/',
  });

  return await runtime.handleRequest(req, agent);
});
```

#### Option B: Create Separate Express Backend
```typescript
// backend-proxy/server.ts
import express from 'express';
import { CopilotRuntime, HttpAgent } from '@copilotkit/runtime';

const app = express();
app.use(express.json());

app.post('/api/copilotkit', async (req, res) => {
  const runtime = new CopilotRuntime();
  const agent = new HttpAgent({
    url: process.env.ADK_BACKEND_URL || 'http://localhost:8000/',
  });
  
  // Forward request to ADK backend
  const response = await runtime.handleRequest(req, agent);
  res.json(response);
});

app.listen(3001, () => console.log('CopilotKit proxy running on :3001'));
```

### Step 3: Wrap Vite App with CopilotKit Provider

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { CopilotKit } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CopilotKit 
      url={import.meta.env.VITE_COPILOT_URL || 'http://localhost:3001/api/copilotkit'}
      publicApiKey={import.meta.env.VITE_COPILOT_API_KEY}
    >
      <App />
    </CopilotKit>
  </React.StrictMode>,
);
```

### Step 4: Update GovernanceCopilot.tsx to Use CopilotKit

```typescript
// src/pages/GovernanceCopilot.tsx
import { CopilotSidebar } from '@copilotkit/react-ui';
import { useCoAgent } from '@copilotkit/react-core';

interface DAOAgentState {
  proposals: Proposal[];
  currentAnalysis: ProposalAnalysis | null;
  treasuryHealth: TreasuryStatus | null;
}

export default function GovernanceCopilot() {
  // Replace direct agent calls with useCoAgent hook
  const { state, setState } = useCoAgent<DAOAgentState>({
    name: 'dao_governance_copilot',
    initialState: {
      proposals: [],
      currentAnalysis: null,
      treasuryHealth: null,
    },
  });

  return (
    <div className="flex h-screen">
      <div className="flex-1">
        {/* Your existing proposal cards */}
        {state.proposals.map(proposal => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
        
        {/* Display current analysis */}
        {state.currentAnalysis && (
          <AnalysisResults analysis={state.currentAnalysis} />
        )}
      </div>

      {/* Add CopilotKit Sidebar */}
      <CopilotSidebar
        title="BitMind AI Co-pilot 🧠"
        instructions={`
          You are an expert DAO governance assistant for BitMind. You can:
          - Analyze governance proposals for financial impact and risks
          - Provide personalized voting recommendations
          - Monitor treasury health in real-time
          - Explain complex governance concepts
          
          Current DAO: ${state.daoAddress}
        `}
        labels={{
          initial: "How can I assist with DAO governance today?",
          placeholder: "Ask about proposals, treasury, or governance...",
        }}
        defaultOpen={true}
        className="border-l border-gray-200"
      />
    </div>
  );
}
```

### Step 5: Create TypeScript ADK-TS Backend with AG-UI

Since your agents are in TypeScript (not Python), you need a TypeScript backend:

```typescript
// backend/src/api/adk-agent-server.ts
import express from 'express';
import { managerOrchestrator } from '../adk-agents/agents/manager-orchestrator';

const app = express();
app.use(express.json());

// AG-UI compatible endpoint
app.post('/api/adk', async (req, res) => {
  const { messages, state } = req.body;
  
  // Extract user intent from last message
  const lastMessage = messages[messages.length - 1];
  
  try {
    // Route to appropriate agent workflow
    if (lastMessage.content.includes('analyze proposal')) {
      const result = await managerOrchestrator.runFullGovernanceFlow(
        state.proposalId,
        state.daoAddress,
        { preferences: state.preferences }
      );
      
      res.json({
        messages: [{
          role: 'assistant',
          content: formatAnalysisResponse(result),
        }],
        state: {
          ...state,
          currentAnalysis: result,
        },
      });
    } else {
      // Handle other queries
      res.json({
        messages: [{
          role: 'assistant',
          content: 'I can help you analyze proposals. Just ask!',
        }],
        state,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(8000, () => console.log('ADK-TS Agent Server on :8000'));
```

## 🎨 Environment Variables

```env
# .env
# Frontend (Vite)
VITE_COPILOT_URL=http://localhost:3001/api/copilotkit
VITE_ADK_BACKEND_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Backend
ADK_BACKEND_URL=http://localhost:8000
GOOGLE_API_KEY=your_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## 📦 Project Structure (Updated)

```
bitmind-adk-agents/
├── src/                          # Vite frontend
│   ├── main.tsx                  # Wrapped with CopilotKit
│   ├── pages/
│   │   └── GovernanceCopilot.tsx # Uses useCoAgent hook
│   └── adk-agents/               # TypeScript agents (kept in frontend)
│
├── backend/                      # New: Express backend for AG-UI
│   ├── src/
│   │   ├── api/
│   │   │   └── adk-agent-server.ts
│   │   └── agents/               # Symlink or copy from src/adk-agents
│   └── package.json
│
├── backend-proxy/                # Optional: CopilotKit proxy
│   └── server.ts
│
└── supabase/                     # Existing
    └── functions/
```

## 🔄 Migration Path

### Phase 1: Keep Current Implementation (Working)
- ✅ Already done
- Direct agent calls work fine
- Good for initial demo

### Phase 2: Add CopilotKit (Better UX)
- Add CopilotSidebar for chat interface
- Keep direct calls, add chat as alternative
- Users can choose: buttons OR chat

### Phase 3: Full AG-UI Protocol (Production)
- Separate backend service
- WebSocket for real-time updates
- Multiple concurrent users
- Scalable architecture

## 🎯 Recommendation for Hackathon

**Go with Phase 2:**
1. Keep your current working implementation
2. Add CopilotSidebar for "wow factor"
3. Both interfaces work simultaneously
4. Show flexibility of your architecture

This gives you:
- ✅ Working demo (current)
- ✅ AI chat interface (impressive)
- ✅ Multiple interaction modes
- ✅ Easy to explain to judges

## 🚀 Quick Start Commands

```bash
# 1. Install CopilotKit
npm install @copilotkit/react-core @copilotkit/react-ui

# 2. Create proxy backend (in new terminal)
cd backend-proxy
npm init -y
npm install express @copilotkit/runtime cors
npm run dev

# 3. Update frontend (wrap with CopilotKit in main.tsx)

# 4. Run everything
npm run dev  # Frontend (Vite)
# Backend proxy runs on :3001
# ADK agents called directly or via proxy
```

## 📝 Next Steps

1. [ ] Install CopilotKit packages
2. [ ] Create proxy backend OR use Supabase Edge Function
3. [ ] Wrap main.tsx with CopilotKit provider
4. [ ] Add CopilotSidebar to GovernanceCopilot.tsx
5. [ ] Test chat interface
6. [ ] Deploy proxy to Railway/Render
7. [ ] Update environment variables

## 💡 Key Insight

**You don't need to choose between approaches!**

Your current direct integration works great. Adding CopilotKit gives you a chat interface **in addition to** your existing UI. This shows architectural flexibility and gives users options.

