# 🚀 Quick Start: Adding CopilotKit to BitMind

## Current Status ✅
Your ADK-TS agents and UI are **already working perfectly**! This guide shows how to **add** CopilotKit as an additional interface (you can keep both).

## Option 1: Express Proxy (Simplest)

### Step 1: Install Dependencies
```bash
# Install CopilotKit in main project
npm install @copilotkit/react-core @copilotkit/react-ui

# Setup proxy server
cd backend-proxy
npm install
```

### Step 2: Start Proxy Server
```bash
cd backend-proxy
npm run dev
```
Runs on `http://localhost:3001`

### Step 3: Update .env
```env
VITE_COPILOT_URL=http://localhost:3001/api/copilotkit
ADK_BACKEND_URL=http://localhost:8000
```

### Step 4: Wrap Your App
Replace `src/main.tsx` with the example:
```bash
cp src/main-with-copilotkit.tsx.example src/main.tsx
```

Or manually add:
```tsx
import { CopilotKit } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css';

<CopilotKit url={import.meta.env.VITE_COPILOT_URL}>
  <App />
</CopilotKit>
```

### Step 5: Add Sidebar to Your Page
In `src/pages/GovernanceCopilot.tsx`, add:
```tsx
import { CopilotSidebar } from '@copilotkit/react-ui';

return (
  <div className="flex">
    <div className="flex-1">{/* your existing content */}</div>
    <CopilotSidebar
      title="BitMind AI Co-pilot"
      instructions="You help with DAO governance..."
      defaultOpen={false}
    />
  </div>
);
```

### Step 6: Run Everything
```bash
# Terminal 1: Proxy
cd backend-proxy && npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3 (optional): ADK Backend
cd backend && npm run dev
```

## Option 2: Supabase Edge Function (No Express)

### Step 1: Deploy Edge Function
```bash
supabase functions deploy copilotkit-agent
```

### Step 2: Update .env
```env
VITE_COPILOT_URL=https://your-project.supabase.co/functions/v1/copilotkit-agent
```

### Step 3: Same as Option 1, Steps 4-5

## Testing

1. Open `http://localhost:5173/governance`
2. Click "AI Analyze" (existing button) - should work as before
3. Click chat icon on right side (CopilotSidebar) - NEW feature
4. Type: "Analyze proposal prop-001"
5. Watch agent respond in chat

## What You Get

**Before (Current):**
- ✅ Direct agent calls via buttons
- ✅ Beautiful card-based UI
- ✅ Instant results display

**After (With CopilotKit):**
- ✅ All of the above PLUS
- ✅ Conversational AI chat interface
- ✅ Natural language queries
- ✅ Streaming responses
- ✅ Real-time state sync between UI and chat

## Demo Flow for Judges

1. "Here's our DAO Governance dashboard with 4 active proposals"
2. "I can analyze them with this button" (click AI Analyze)
3. "Or ask the AI assistant in natural language" (open sidebar)
4. Type: "Which proposal has the lowest risk?"
5. Agent responds with analysis
6. "Both interfaces use the same ADK-TS multi-agent system"

## Troubleshooting

### "CopilotKit not connecting"
- Check proxy is running: `curl http://localhost:3001/health`
- Check .env has correct VITE_COPILOT_URL
- Look at browser console for errors

### "Agent not responding in chat"
- Check backend URL in proxy server
- Look at proxy logs in terminal
- Verify ADK backend is running (if needed)

### "Sidebar not showing"
- Make sure you imported CopilotKit styles
- Check that CopilotKit provider wraps App
- Verify CopilotSidebar is in component tree

## Next Steps

1. [ ] Get basic chat working
2. [ ] Customize agent instructions for your DAO
3. [ ] Add custom tool renderers (optional)
4. [ ] Deploy proxy to Railway/Render
5. [ ] Record demo video showing both interfaces

## Notes

- You can keep BOTH interfaces (buttons + chat)
- Chat is optional enhancement, not required
- Current implementation already demonstrates ADK-TS well
- CopilotKit adds "wow factor" for judges

