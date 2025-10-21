# BitMind Navigation Guide

## Navigation Structure Overview

BitMind has **two navigation systems** that work together seamlessly:

1. **Landing Page Navigation** - For visitors (public, no wallet)
2. **Main App Navigation** - For users inside the app (wallet required)

---

## 1. Landing Page Navigation

**When**: Shown on `/` and `/landing` routes only  
**Who**: All visitors (no wallet required)

### Desktop Menu

| Link | Destination | Action |
|------|-------------|--------|
| **Logo** | `/` | Refresh landing page |
| **Features** | `#features` | Scroll to features section |
| **Demo** | `#demo` | Scroll to demo section |
| **Dashboard** | `/app` | Navigate to main app |
| **Help** | `/help` | Open help documentation |
| **GitHub** | External | Open GitHub repository |
| **Launch App** (CTA) | `/app` | **Main action** - Enter the app |

### Mobile Menu

- Hamburger icon opens menu
- Same links as desktop
- Full-width buttons for better mobile UX
- Auto-closes on link click

---

## 2. Main App Navigation (NavigationBar)

**When**: Shown on all app routes **except** `/` and `/landing`  
**Who**: Users in the app (wallet required for most features)

### Navigation Structure

#### **Main Links** (Always visible)
| Link | Route | Icon | Description |
|------|-------|------|-------------|
| **Logo** | `/app` | BitMindAI | Return to app home |
| **Home** | `/app` | 🏠 | Main dashboard |
| **Dashboard** | `/dashboard` | 📊 | Metrics overview |
| **Invoices** | `/invoices` | 📄 | Manage invoices |
| **Analytics** | `/analytics` | 📈 | Performance data |

#### **Demos Dropdown**
| Link | Route | Badge | Description |
|------|-------|-------|-------------|
| **AI Demo** | `/demo` | New | AI invoice parsing |
| **API Demo** | `/api-demo` | - | Live API integration |

**DeFi Features** (in dropdown)
| Link | Route | Description |
|------|-------|-------------|
| **NFT Marketplace** | `/nft-marketplace` | Trade invoice NFTs |
| **Cross-Chain Swap** | `/cross-chain-swap` | Multi-chain swaps |
| **Treasury** | `/treasury` | Multisig treasury |
| **Yield Optimizer** | `/yield-optimizer` | Optimize yields |

#### **Action Buttons** (Right side)
| Link | Route | Icon | Description |
|------|-------|------|-------------|
| **Create Invoice** | `/create` | ➕ | New invoice |
| **Help** | `/help` | ❓ | Documentation |
| **Back to Landing** | `/landing` | 🏠 | Return to landing page |
| **Wallet Connect** | - | 👛 | Connect/disconnect wallet |

---

## Navigation Flow Diagrams

### New User Journey

```
Landing Page (/)
    ↓
Click "Launch App"
    ↓
Navigate to /app
    ↓
[No Wallet Connected]
    ↓
Show "Wallet Connection Required" screen
    ↓
User clicks "Connect Wallet"
    ↓
Hiro/Leather/Xverse popup
    ↓
User approves
    ↓
✅ Access granted → Main App Dashboard
```

### Returning User Journey

```
Landing Page (/)
    ↓
Click "Launch App"
    ↓
Navigate to /app
    ↓
[Wallet Already Connected]
    ↓
✅ Direct access → Main App Dashboard
```

### App Navigation Flow

```
Main App (/app)
    ↓
NavigationBar appears
    ↓
User navigates:
    - Home → /app
    - Dashboard → /dashboard
    - Invoices → /invoices
    - Demos → /demo, /api-demo
    - DeFi Features → /nft-marketplace, /treasury, etc.
    - Create → /create
    - Help → /help
    - Back to Landing → /landing
    ↓
On /landing → NavigationBar hides, Landing nav shows
```

---

## Smart Navigation Features

### 1. **Context-Aware Navbar**
```typescript
// NavigationBar only shows when NOT on landing page
const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

if (isLandingPage) {
  return null; // Hide navbar
}
```

### 2. **Active Link Highlighting**
- Current page is highlighted in blue
- Uses path matching: `/app` highlights when on `/app` or `/app/*`

### 3. **Protected Routes**
All app routes (except `/help`) require wallet connection:
- User tries to access `/create` without wallet
- Redirected to wallet connection screen
- After connection, granted access

### 4. **Dropdown Menus**
Desktop: Hover to open  
Mobile: Sections with headers

### 5. **Mobile-Optimized**
- Hamburger menu for mobile
- Organized sections:
  - Main Navigation
  - Demos
  - DeFi Features
  - Actions
  - Quick Links (back to landing)
  - Wallet Connect

---

## URL Reference

### Public Routes (No Wallet)
| URL | Page | Navigation Shows |
|-----|------|------------------|
| `/` | LandingPage | Landing nav |
| `/landing` | LandingPage | Landing nav |
| `/help` | Help | App nav |

### Protected Routes (Wallet Required)
| URL | Page | Navigation Shows |
|-----|------|------------------|
| `/app` | Main Dashboard | App nav |
| `/dashboard` | Dashboard | App nav |
| `/invoices` | Invoice Manager | App nav |
| `/create` | Create Invoice | App nav |
| `/demo` | AI Demo | App nav |
| `/invoice/:id` | Invoice Details | App nav |
| `/nft-marketplace` | NFT Marketplace | App nav |
| `/analytics` | Analytics | App nav |
| `/yield-optimizer` | Yield Optimizer | App nav |
| `/cross-chain-swap` | Cross-Chain Swap | App nav |
| `/treasury` | Treasury | App nav |
| `/invoice-editor` | Invoice Editor | App nav |
| `/discord-notifications` | Discord Integration | App nav |

### API/Demo Routes (Public)
| URL | Page | Navigation Shows |
|-----|------|------------------|
| `/api-demo` | API Demo | App nav |
| `/api-showcase` | API Showcase | App nav |
| `/supabase-test` | Supabase Test | App nav |
| `/realtime-monitor` | Realtime Monitor | App nav |

---

## Navigation Best Practices

### ✅ DO:
1. **Use "Launch App" from landing page** - Primary CTA
2. **Check wallet connection** before accessing features
3. **Use breadcrumbs** for deep navigation (coming soon)
4. **Use "Back to Landing"** to return to marketing page

### ❌ DON'T:
1. Don't use browser back button for navigation (use menu links)
2. Don't expect navbar on landing page (it's hidden)
3. Don't bookmark protected routes if wallet not connected

---

## Mobile Navigation

### Landing Page (Mobile)
```
[☰] BitMind [GitHub] [Launch App]
    ↓ (tap hamburger)
Features
Demo
Dashboard
Help
[GitHub Button]
[Launch App Button]
```

### App Navigation (Mobile)
```
BitMindAI [👛 Connect] [☰]
    ↓ (tap hamburger)
━━ MAIN ━━
Home
Dashboard
Invoices
Analytics

━━ DEMOS ━━
AI Demo [New]
API Demo

━━ DEFI FEATURES ━━
NFT Marketplace
Cross-Chain Swap
Treasury
Yield Optimizer

━━ ACTIONS ━━
Create Invoice
Help

━━ QUICK LINKS ━━
Back to Landing Page

[Wallet Connect Button]
```

---

## User Scenarios

### Scenario 1: First-Time Visitor
**Goal**: Learn about BitMind and try it

1. Land on `/` (landing page)
2. Read features and demo sections
3. Click "Launch App"
4. See wallet connection prompt
5. Connect Hiro Wallet
6. Access granted → explore app

### Scenario 2: Returning User
**Goal**: Create a new invoice

1. Visit `/` (landing page)
2. Click "Launch App" → auto-connects wallet
3. Click "Create Invoice" in navbar
4. Fill form and deploy contract
5. View invoice in "Invoices" page

### Scenario 3: App User Wants Marketing Info
**Goal**: See landing page again

1. Currently in app (`/app`)
2. Look for "Back to Landing" link (top right, home icon)
3. Click → return to `/landing`
4. Landing page navigation shows

### Scenario 4: Mobile User Navigation
**Goal**: Access DeFi features on mobile

1. In app, tap hamburger menu
2. Scroll to "DeFi Features" section
3. Tap "Yield Optimizer"
4. Access yield optimization page

---

## Visual Indicators

### Active Link Styles
```
Active: Blue background (bg-blue-50), blue text (text-blue-600)
Hover: Gray background (bg-gray-50), dark text (text-gray-900)
Default: Gray text (text-gray-700)
```

### Badge Indicators
- **"New"** badge on AI Demo (green badge)
- Future: "Beta", "Pro", "Soon" badges

### Wallet Connection Status
- Disconnected: Orange "Connect Wallet" button
- Connected: Shows wallet address (truncated)
- Click address → Dropdown with "Disconnect" option

---

## Keyboard Navigation

### Desktop Shortcuts (Future Enhancement)
- `Ctrl+K` - Open command palette
- `H` - Go to home
- `C` - Create invoice
- `I` - View invoices
- `?` - Open help

---

## Troubleshooting

### Issue: "Navigation bar disappeared"
**Solution**: You're on the landing page. This is intentional. Landing page has its own navigation.

### Issue: "Can't access page - wallet prompt shows"
**Solution**: That page requires wallet connection. Click "Connect Wallet" or go "Back to Landing Page"

### Issue: "Mobile menu won't close"
**Solution**: Click any menu item (it auto-closes) or tap outside the menu

### Issue: "Lost - don't know where I am"
**Solution**: 
- Click logo → Go to main app home
- Click "Back to Landing" (home icon, top right) → Go to landing page

---

## Summary

**Navigation is context-aware and user-centric:**

✅ **Landing page** has its own clean navigation  
✅ **Main app** has comprehensive navbar with dropdown menus  
✅ **Easy to switch** between marketing (landing) and app  
✅ **Mobile-optimized** with organized sections  
✅ **Wallet-aware** - protects routes that need authentication  
✅ **Active highlighting** - always know where you are  

---

**Last Updated**: October 15, 2025  
**Status**: ✅ Fully implemented and tested

