# BitMind Routing Guide

## User Flow

### 1. Landing Page (Entry Point)
**URLs**: `/` or `/landing`

**What users see:**
- Beautiful marketing landing page
- Features showcase
- Demo section
- "Launch App" button

**No wallet required** ✅

---

### 2. Launch App (Wallet Required)
**URL**: `/app`

**User clicks "Launch App" →**

#### If wallet is NOT connected:
Shows **wallet connection screen** with:
- Wallet connection button
- Supported wallets (Hiro, Leather, Xverse)
- "Back to Landing Page" button
- Security information

#### If wallet IS connected:
Shows **main app dashboard** with:
- All features unlocked
- Invoice management
- DeFi features
- Analytics

---

## Complete URL Structure

### Public Routes (No Wallet Required)

| URL | Page | Description |
|-----|------|-------------|
| `/` | LandingPage | **Entry point** - Marketing page |
| `/landing` | LandingPage | Alternative landing URL |
| `/help` | Help | Documentation & support |
| `/api-demo` | ApiDemo | API demonstration |
| `/api-showcase` | APIShowcase | API features showcase |
| `/supabase-test` | SupabaseTest | Database testing |
| `/realtime-monitor` | RealtimeMonitor | Real-time monitoring demo |

### Protected Routes (Wallet Required) 🔒

| URL | Page | Description |
|-----|------|-------------|
| `/app` | Index | **Main app dashboard** |
| `/dashboard` | Dashboard | Alternative dashboard |
| `/invoices` | InvoiceManager | Invoice management |
| `/create` | CreateInvoice | Create new invoice |
| `/demo` | Demo | Interactive demo |
| `/invoice/:id` | InvoiceDetails | Invoice details page |
| `/interactive-demo` | InteractiveDemo | Full demo experience |

### DeFi Features (Wallet Required) 🔒

| URL | Page | Description |
|-----|------|-------------|
| `/nft-marketplace` | NFTMarketplace | Invoice NFT trading |
| `/analytics` | Analytics | Analytics dashboard |
| `/yield-optimizer` | YieldOptimizerPage | Yield optimization |
| `/cross-chain-swap` | CrossChainSwapPage | Cross-chain swaps |
| `/treasury` | Treasury | DAO treasury management |
| `/invoice-editor` | InvoiceEditorPage | Advanced invoice editor |
| `/discord-notifications` | DiscordNotifications | Discord integration |

---

## User Journey Examples

### New User (First Time)

```
1. Visit https://bitmind.io
   ↓
2. See landing page with "Launch App" button
   ↓
3. Click "Launch App" → Navigate to /app
   ↓
4. See "Wallet Connection Required" screen
   ↓
5. Click "Connect Wallet" → Hiro Wallet popup
   ↓
6. Approve connection
   ↓
7. ✅ Access granted → See main app dashboard
```

### Returning User (Wallet Already Connected)

```
1. Visit https://bitmind.io
   ↓
2. Click "Launch App" → Navigate to /app
   ↓
3. ✅ Wallet auto-connects → See main app immediately
```

### User Without Wallet

```
1. Visit https://bitmind.io
   ↓
2. Click "Launch App" → Navigate to /app
   ↓
3. See "Wallet Connection Required" screen
   ↓
4. Click "Back to Landing Page"
   ↓
5. Explore landing page features & documentation
```

---

## Protected Route Behavior

All protected routes use the `<ProtectedRoute>` component which:

1. **Checks wallet connection status**
2. **If not connected:**
   - Shows wallet connection screen
   - Displays supported wallets
   - Provides "Back to Landing Page" option
3. **If connected:**
   - Renders the requested page
   - Full app functionality available

---

## Navigation Components

### LandingPage Navigation
- **Logo** → `/landing`
- **Features** → `#features` (scroll)
- **Demo** → `#demo` (scroll)
- **Dashboard** → `/app`
- **Help** → `/help`
- **GitHub** → External link
- **Launch App** → `/app` (main CTA)

### Main App Navigation (NavigationBar)
- Available after wallet connection
- Links to all protected routes
- Wallet address display
- Disconnect option

---

## Implementation Details

### App.tsx Routing

```typescript
<Routes>
  {/* Landing Page - Entry point */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/landing" element={<LandingPage />} />
  
  {/* Protected Main App */}
  <Route path="/app" element={<ProtectedRoute><Index /></ProtectedRoute>} />
  
  {/* Other protected routes... */}
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  // ... etc
</Routes>
```

### ProtectedRoute Logic

```typescript
const ProtectedRoute = ({ children }) => {
  const { isConnected } = useWalletStore();
  
  if (!isConnected) {
    return <WalletConnectionScreen />;
  }
  
  return <>{children}</>;
};
```

---

## Benefits of This Structure

✅ **Clear User Flow**: Landing → Connect Wallet → App  
✅ **Professional UX**: Marketing page first impression  
✅ **Security**: Wallet required for sensitive features  
✅ **SEO Friendly**: Public landing page for search engines  
✅ **Flexible**: Easy to add new routes  
✅ **User Choice**: Can explore landing page without wallet  

---

## Testing the Flow

### Manual Test Script

```bash
# 1. Start the app
npm run dev

# 2. Open browser
http://localhost:5173

# 3. Expected: See landing page ✓

# 4. Click "Launch App"
# Expected: Navigate to /app

# 5. Without wallet connected
# Expected: See "Wallet Connection Required" ✓

# 6. Click "Connect Wallet"
# Expected: Hiro Wallet popup

# 7. Connect wallet
# Expected: See main app dashboard ✓

# 8. Navigate to /landing
# Expected: See landing page again

# 9. Click "Launch App" with wallet connected
# Expected: Go directly to app (skip wallet screen) ✓
```

---

## Troubleshooting

### Issue: Can't access protected routes
**Solution**: Connect your wallet via Hiro/Leather/Xverse

### Issue: Wallet connection fails
**Solution**: 
1. Check wallet extension is installed
2. Ensure network is set to testnet/mainnet correctly
3. Try refreshing the page

### Issue: Redirected to landing when wallet is connected
**Solution**: 
1. Check `useWalletStore()` state
2. Verify wallet is actually connected in extension
3. Try disconnecting and reconnecting

---

## Future Improvements

### Potential Enhancements

1. **Remember last route**: After wallet connection, redirect to originally requested page
2. **Onboarding flow**: Multi-step wizard for first-time users
3. **Route permissions**: Different access levels for different wallets
4. **Deep linking**: Direct links to specific features with auto-wallet-prompt
5. **Analytics**: Track user journey through landing → app flow

---

## Summary

**Landing First Flow** ✅
- Professional marketing impression
- Clear call-to-action
- Wallet connection when ready
- Seamless transition to app

**URL Structure**:
- `/` or `/landing` → Marketing (public)
- `/app` → Main app (wallet required)
- All features protected by wallet authentication

This structure maximizes both user acquisition (public landing) and security (wallet-gated features).

---

**Last Updated**: October 15, 2025  
**Status**: ✅ Implemented and tested

