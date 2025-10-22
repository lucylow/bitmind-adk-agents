# AI Agents Landing Page - Integration Guide

## 🎯 Overview

This guide shows you how to integrate the new **AI Agents Landing Page** into your BitMind application. The component highlights your multi-agent architecture with an interactive demo.

---

## 📦 Component Created

**File**: `src/components/LandingPageAIAgents.tsx`

**Features**:
- ✅ Interactive multi-agent workflow demo
- ✅ Real-time agent status visualization
- ✅ Human-in-the-loop approval flow
- ✅ Explainability bundle display
- ✅ Live logs panel
- ✅ Responsive design (mobile-friendly)
- ✅ Framer Motion animations
- ✅ Tailwind CSS styling

---

## 🚀 Quick Integration (3 Steps)

### Step 1: Install Dependencies

```bash
npm install framer-motion lucide-react
```

**Already have them?** Check with:
```bash
npm list framer-motion lucide-react
```

### Step 2: Import in Your Router/App

**Option A: Replace existing landing page**

In `src/pages/Index.tsx` or `src/App.tsx`:

```typescript
// Replace this:
// import LandingPage from '@/components/LandingPage';

// With this:
import LandingPageAIAgents from '@/components/LandingPageAIAgents';

// Then use it:
export default function Index() {
  return <LandingPageAIAgents />;
}
```

**Option B: Add as a new route**

In your router config (e.g., `src/App.tsx`):

```typescript
import LandingPageAIAgents from '@/components/LandingPageAIAgents';

// Add route:
<Route path="/ai-agents" element={<LandingPageAIAgents />} />
```

**Option C: Add to existing landing page**

```typescript
import LandingPageAIAgents from '@/components/LandingPageAIAgents';

export default function Index() {
  return (
    <>
      {/* Your existing hero/header */}
      <Hero />
      
      {/* Insert AI Agents section */}
      <LandingPageAIAgents />
      
      {/* Rest of your landing page */}
      <Features />
      <Footer />
    </>
  );
}
```

### Step 3: Test It!

```bash
npm run dev
```

Navigate to your landing page and click **"Experience AI Agents in Action"** to see the interactive demo.

---

## 🎨 Customization

### Change Colors (Brand Alignment)

The component uses Tailwind classes. Update colors by searching and replacing:

**From Teal → Your Brand Color:**

```typescript
// In LandingPageAIAgents.tsx

// Replace:
"text-teal-300"          → "text-[your-color]-300"
"bg-teal-500"            → "bg-[your-color]-500"
"hover:bg-teal-400"      → "hover:bg-[your-color]-400"

// Example for purple:
"text-teal-300"          → "text-purple-300"
"bg-teal-500"            → "bg-purple-500"
"hover:bg-teal-400"      → "hover:bg-purple-400"
```

### Update Copy

Search for these text blocks and customize:

```typescript
// Main headline (line ~150)
BitMind: Your <span className="text-teal-300">AI-Powered Multi-Agent</span> Co-pilot

// Subheadline (line ~160)
Leverage intelligent AI agents that analyze proposals...

// Feature descriptions (line ~400+)
"Deep financial and security impact analysis..."
```

### Connect to Real API

Replace the `runDemo()` function with real API calls:

```typescript
async function runDemo() {
  setRunning(true);
  setRunId(`run-${Date.now()}`);
  
  try {
    // Call your manager orchestrator API
    const response = await fetch('/api/governance/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposalId: 'demo-001',
        userAddress: '0xUser...',
        preferences: { riskTolerance: 'medium' }
      })
    });
    
    const result = await response.json();
    
    // Update UI with real results
    setExplainBundle(result.explainability);
    setNeedsApproval(result.status === 'AWAITING_APPROVAL');
    
  } catch (error) {
    console.error('Demo failed:', error);
  } finally {
    setRunning(false);
  }
}
```

### Add Real Approval Flow

Replace `approveDemo()` with your human approval API:

```typescript
async function approveDemo() {
  setLoadingApprove(true);
  
  try {
    const response = await fetch('/api/human-approval/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        runId: runId,
        approverId: userAddress,
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      setApproved(true);
      setNeedsApproval(false);
      pushLog(`Approved! TX: ${result.txHash}`);
    } else {
      setApproved(false);
      pushLog(`Approval failed: ${result.error}`);
    }
  } catch (error) {
    setApproved(false);
    pushLog(`Error: ${error.message}`);
  } finally {
    setLoadingApprove(false);
  }
}
```

---

## 🎯 What the Demo Shows

### Interactive Workflow

1. **User clicks "Run Demo"**
2. **Three agents execute sequentially:**
   - ✅ Proposal Analyst (1.6s) - Extracts financials, flags risks
   - ✅ Treasury Monitor (1.2s) - Checks treasury health
   - ✅ Voting Strategist (1.4s) - Generates recommendation

3. **Explainability Bundle Generated:**
   - Top 3 reasons for recommendation
   - Confidence score (0-100%)
   - Similar past proposals
   - Risk flags

4. **Human-in-the-Loop Approval:**
   - If confidence < 90% → requires approval
   - User can **Approve** or **Reject**
   - Simulates RBAC + multisig checks

5. **Live Logs:**
   - Real-time activity feed
   - Shows agent progress
   - Approval decisions
   - Transaction results

---

## 🖼️ Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│  HERO SECTION                                           │
│  ┌──────────────┐  ┌────────────────────────────────┐  │
│  │  Headline    │  │  Interactive Demo Card         │  │
│  │  Subhead     │  │  ┌──────────┐  ┌──────────┐   │  │
│  │  CTAs        │  │  │ Agents   │  │ Manager  │   │  │
│  │  Badges      │  │  │ Status   │  │ Explain  │   │  │
│  └──────────────┘  │  └──────────┘  └──────────┘   │  │
│                    │  [Run Demo] [Reset]            │  │
│                    │  Logs: [...agent activity...]  │  │
│                    └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  FEATURES SECTION                                       │
│  "Powered by Advanced AI Agents"                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Proposal │  │ Treasury │  │  Voting  │             │
│  │ Analyst  │  │ Monitor  │  │Strategist│             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  [Why multi-agent?]  [Diagram]                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  CTA STRIP                                              │
│  "Ready to see agents in your DAO?"                     │
│  [Try Live Demo] [Contact Sales]                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Component Props (Future Enhancement)

Currently the component is self-contained. To make it configurable, you can add props:

```typescript
interface LandingPageAIAgentsProps {
  // API endpoints
  analyzeEndpoint?: string;
  approvalEndpoint?: string;
  
  // Branding
  brandColor?: string;
  logoUrl?: string;
  
  // Content
  headline?: string;
  subheadline?: string;
  
  // Demo config
  demoProposalId?: string;
  autoStart?: boolean;
}

export default function LandingPageAIAgents(props: LandingPageAIAgentsProps) {
  // Use props with defaults
  const {
    analyzeEndpoint = '/api/governance/analyze',
    brandColor = 'teal',
    headline = 'BitMind: Your AI-Powered Multi-Agent Co-pilot',
    // ...
  } = props;
  
  // ... rest of component
}
```

---

## 🔧 Troubleshooting

### Issue: "Module not found: framer-motion"

**Fix:**
```bash
npm install framer-motion
```

### Issue: "Module not found: lucide-react"

**Fix:**
```bash
npm install lucide-react
```

### Issue: Tailwind classes not working

**Check `tailwind.config.ts` includes:**
```typescript
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
```

### Issue: Animations not smooth

**Ensure no conflicting CSS transitions:**
```css
/* Remove global transitions that might conflict */
* {
  /* transition: all 0.3s; */ /* Remove this */
}
```

### Issue: Component too tall on mobile

**Adjust padding in `<section>` tags:**
```typescript
// Change from:
<section className="max-w-7xl mx-auto px-6 py-12">

// To:
<section className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-12">
```

---

## 🎬 Next Steps

### 1. **Production API Integration**

Replace mock demo with real endpoints:
- [ ] Connect to `src/adk-agents/manager-orchestrator.agent.ts`
- [ ] Wire up `src/api/human-approval.ts` endpoints
- [ ] Add authentication (JWT/wallet signature)
- [ ] Add error handling & retry logic

### 2. **Add Analytics**

Track user engagement:
```typescript
// In runDemo()
analytics.track('Demo Started', { proposalId });

// In approveDemo()
analytics.track('Approval Clicked', { runId, decision: 'approve' });
```

### 3. **A/B Testing**

Test different headlines/CTAs:
```typescript
import { useABTest } from '@/hooks/useABTest';

const variant = useABTest('landing-headline', {
  A: 'AI-Powered Multi-Agent Co-pilot',
  B: 'Autonomous AI Governance Assistant'
});
```

### 4. **SEO Optimization**

Add meta tags:
```typescript
import { Helmet } from 'react-helmet';

<Helmet>
  <title>BitMind - AI-Powered DAO Governance Agents</title>
  <meta name="description" content="Multi-agent AI system for DAO proposal analysis, treasury monitoring, and voting recommendations." />
</Helmet>
```

### 5. **Add Video Demo**

Replace SVG diagram with embedded video:
```typescript
<div className="aspect-video">
  <iframe
    src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
    className="w-full h-full rounded-lg"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  />
</div>
```

---

## 📈 Performance Tips

### Lazy Load

For large apps, lazy load the component:

```typescript
import { lazy, Suspense } from 'react';

const LandingPageAIAgents = lazy(() => import('@/components/LandingPageAIAgents'));

export default function Index() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LandingPageAIAgents />
    </Suspense>
  );
}
```

### Optimize Animations

Reduce motion for accessibility:

```typescript
// Add to component
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();

<motion.h1
  initial={shouldReduceMotion ? {} : { y: 20, opacity: 0 }}
  animate={shouldReduceMotion ? {} : { y: 0, opacity: 1 }}
>
```

---

## 🎨 Design System Integration

### Using Your Existing Components

Replace primitive elements with your design system:

```typescript
// Replace:
<button className="bg-teal-500...">Run Demo</button>

// With:
import { Button } from '@/components/ui/button';
<Button variant="primary" onClick={runDemo}>Run Demo</Button>
```

### Using Your Theme

If you have a theme system:

```typescript
import { useTheme } from '@/hooks/useTheme';

const { colors } = useTheme();

// Use theme colors instead of hardcoded:
<span style={{ color: colors.primary }}>AI-Powered Multi-Agent</span>
```

---

## ✅ Checklist

**Before Going Live:**

- [ ] Install dependencies (framer-motion, lucide-react)
- [ ] Import component in router/app
- [ ] Test on mobile devices
- [ ] Replace demo with real API calls
- [ ] Add authentication to approval flow
- [ ] Update copy for your brand voice
- [ ] Add analytics tracking
- [ ] Test accessibility (keyboard navigation, screen readers)
- [ ] Optimize images/assets
- [ ] Add error boundaries
- [ ] Test in production build

---

## 📞 Support

**Questions?**
- Check the component code comments
- See `ADK_AGENTS_IMPLEMENTATION_GUIDE.md` for backend API details
- Review `src/adk-agents/manager-orchestrator.agent.ts` for workflow logic

**Need Help?**
- Discord: `#bitmind-agents`
- GitHub Issues
- Email: `team@bitmind.io`

---

## 🎉 You're Ready!

Your AI Agents landing page is now live and showcasing BitMind's multi-agent architecture. Users can:

✅ See the three specialist agents in action  
✅ Watch real-time workflow orchestration  
✅ Experience human-in-the-loop approval  
✅ Understand explainability & confidence  
✅ View live logs of agent activity  

**Next:** Connect to your real APIs and let users analyze actual proposals! 🚀

