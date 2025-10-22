# 🚀 AI Agents Landing Page - Quick Start

## ⚡ 60 Second Setup

### 1. Install Dependencies

```bash
npm install framer-motion lucide-react
```

### 2. Add to Your App

**Option A: New Route** (Recommended for testing)

Edit `src/App.tsx` or your router file:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AIAgentsDemo from './pages/AIAgentsDemo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Your existing routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* Add this new route */}
        <Route path="/ai-agents" element={<AIAgentsDemo />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Option B: Replace Main Landing Page**

Edit `src/pages/Index.tsx`:

```typescript
// Before:
// import LandingPage from '@/components/LandingPage';

// After:
import LandingPageAIAgents from '@/components/LandingPageAIAgents';

export default function Index() {
  return <LandingPageAIAgents />;
}
```

### 3. Test It!

```bash
npm run dev
```

Navigate to:
- **Option A**: `http://localhost:5173/ai-agents`
- **Option B**: `http://localhost:5173/`

---

## 🎮 Try the Demo

1. **Click "Experience AI Agents in Action"** (scrolls to demo)
2. **Click "Run Demo"** button
3. **Watch the agents execute:**
   - ✅ Proposal Analyst (1.6s)
   - ✅ Treasury Monitor (1.2s)
   - ✅ Voting Strategist (1.4s)
4. **See the explainability bundle** (reasons, confidence, risks)
5. **Click "Approve"** to simulate human-in-the-loop approval

---

## ✨ What You Get

### Interactive Features
- ✅ Live agent status visualization
- ✅ Real-time logs panel
- ✅ Human-in-the-loop approval flow
- ✅ Explainability with confidence scores
- ✅ Similar proposals display
- ✅ Risk highlighting

### Content Highlights
- ✅ "AI-Powered Multi-Agent" headline
- ✅ 3 specialist agent descriptions
- ✅ "Why multi-agent?" explanation
- ✅ Benefits list (24/7 monitoring, explainability, safeguards)
- ✅ Interactive workflow diagram
- ✅ CTAs: "Try Demo" + "Contact Sales"

---

## 🎨 Quick Customization

### Change Brand Color

In `src/components/LandingPageAIAgents.tsx`, search and replace:

```bash
# From teal to your color (e.g., purple):
"text-teal-300"     → "text-purple-300"
"bg-teal-500"       → "bg-purple-500"
"hover:bg-teal-400" → "hover:bg-purple-400"
```

### Update Headline

Line ~150:

```typescript
BitMind: Your <span className="text-teal-300">AI-Powered Multi-Agent</span> Co-pilot
```

Change to your preferred wording.

### Connect Real API

Replace `runDemo()` function (line ~90):

```typescript
async function runDemo() {
  setRunning(true);
  
  // Replace this mock with real API call:
  const response = await fetch('/api/governance/analyze', {
    method: 'POST',
    body: JSON.stringify({ proposalId: 'demo-001' })
  });
  
  const result = await response.json();
  setExplainBundle(result.explainability);
  setNeedsApproval(result.status === 'AWAITING_APPROVAL');
  
  setRunning(false);
}
```

---

## 📱 Mobile Testing

The component is fully responsive. Test on:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

Use Chrome DevTools → Toggle Device Toolbar (Cmd+Shift+M)

---

## 🐛 Troubleshooting

### "Cannot find module 'framer-motion'"

```bash
npm install framer-motion
```

### "Cannot find module 'lucide-react'"

```bash
npm install lucide-react
```

### Tailwind not working?

Check `tailwind.config.ts` includes:

```typescript
content: [
  "./src/**/*.{js,ts,jsx,tsx}",
],
```

### Demo not running smoothly?

Check browser console for errors. Common issues:
- Missing dependencies (install framer-motion + lucide-react)
- Conflicting CSS transitions (remove global transitions)

---

## 📊 What Judges/Users Will See

### First Impression (Hero Section)
> "BitMind: Your **AI-Powered Multi-Agent** Co-pilot for Trusted DAO Governance"

With badges:
- 🤖 Autonomous Agents
- 📊 Explainable Recommendations
- 🛡️ Guardrails & Approvals
- ⚡ MCP + On-Chain Access

### Interactive Demo (Right Side)
Live simulation showing:
1. Three agents executing in sequence
2. Real-time status updates (PENDING → RUNNING → DONE)
3. Agent outputs (financial analysis, treasury health, vote recommendation)
4. Manager explainability bundle (reasons + confidence)
5. Human approval flow (AWAITING → APPROVED/REJECTED)
6. Live logs feed

### Features Section
Three cards explaining:
- **Proposal Analyst**: Financial + security analysis
- **Treasury Monitor**: Real-time health alerts
- **Voting Strategist**: Personalized recommendations

Plus "Why multi-agent?" explanation

### Bottom CTA
"Ready to see agents in your DAO?"
- [Try Live Demo] → scrolls to demo
- [Contact Sales] → links to /contact

---

## 🎯 Next Steps

### For Demo/Hackathon:
1. ✅ Keep it as-is (works great out of the box)
2. Update headline/copy for your brand voice
3. Record a screen capture showing the demo
4. Add to your pitch deck

### For Production:
1. Connect to real API (`src/adk-agents/manager-orchestrator.agent.ts`)
2. Add authentication (wallet signature)
3. Replace mock proposal with actual DAO data
4. Wire up human approval API
5. Add analytics tracking

---

## 📚 More Documentation

- **Full Guide**: `AI_AGENTS_LANDING_PAGE_INTEGRATION.md`
- **Backend API**: `ADK_AGENTS_IMPLEMENTATION_GUIDE.md`
- **Component Code**: `src/components/LandingPageAIAgents.tsx`

---

## ✅ Checklist

- [ ] Installed framer-motion
- [ ] Installed lucide-react
- [ ] Added route to app
- [ ] Tested on localhost
- [ ] Clicked "Run Demo" button
- [ ] Watched agents execute
- [ ] Tried Approve/Reject flow
- [ ] Tested on mobile
- [ ] Updated headline (optional)
- [ ] Changed brand colors (optional)

---

**You're ready to showcase BitMind's AI agents! 🚀**

The landing page is production-ready and highlights your multi-agent architecture beautifully.

