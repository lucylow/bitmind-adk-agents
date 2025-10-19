# Wallet-Gated Access Testing Guide

## Quick Test Instructions

### 🧪 Test 1: Initial Connection
1. Open the app in your browser
2. You should see a wallet connection prompt on the home page
3. Click **"Connect Wallet"** in the navigation bar
4. Your Stacks wallet extension should open
5. Approve the connection
6. ✅ You should see your wallet address displayed (e.g., `ST1PQH...PGZGM`)
7. ✅ The home page should now show "Try AI Demo" and "Create Invoice" buttons

### 🧪 Test 2: Protected Route Access
1. While **NOT connected**, try to visit: `http://localhost:8080/create`
2. ✅ You should see a beautiful "Wallet Connection Required" screen
3. ✅ The screen should show supported wallets (Hiro, Leather, Xverse)
4. Click **"Connect Wallet"** on that screen
5. Approve in your wallet extension
6. ✅ You should be automatically taken to the Create Invoice page

### 🧪 Test 3: Session Persistence
1. Connect your wallet
2. Navigate to `/dashboard` or `/demo`
3. Refresh the page (press F5)
4. ✅ Your wallet should still be connected
5. ✅ You should NOT need to reconnect
6. ✅ Your address should still be displayed in the nav bar

### 🧪 Test 4: Disconnect Flow
1. While connected, click **"Disconnect"** button
2. ✅ The button should change back to "Connect Wallet"
3. Try to navigate to `/create`
4. ✅ You should see the "Wallet Connection Required" screen

### 🧪 Test 5: Public Routes (No Wallet Needed)
1. Disconnect your wallet (if connected)
2. Navigate to these pages:
   - `/api-demo` ✅ Should load without requiring wallet
   - `/help` ✅ Should load without requiring wallet
   - `/api-showcase` ✅ Should load without requiring wallet
   - `/realtime-monitor` ✅ Should load without requiring wallet

### 🧪 Test 6: Multiple Tabs
1. Connect wallet in one tab
2. Open a new tab with the same app
3. ✅ The new tab should show you as connected
4. Disconnect in the first tab
5. Refresh the second tab
6. ✅ The second tab should show you as disconnected

## Visual Indicators

### When Connected ✅
- Green pulsing dot next to wallet icon
- Truncated address displayed: `ST1PQH...PGZGM`
- "Disconnect" button visible
- Access granted to all protected pages
- Home page shows action buttons

### When Not Connected ❌
- "Connect Wallet" button with gradient background
- Wallet connection prompt on home page
- Protected routes show gate screen
- No green indicator

## Browser Console Messages

When everything is working correctly, you should see these console messages:

```
✅ Found existing wallet session: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
✅ Wallet connected: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
👋 Disconnecting wallet
⚠️ Session expired, clearing wallet state
```

## Troubleshooting

### Issue: Wallet won't connect
**Solution:**
1. Make sure you have a Stacks wallet extension installed (Hiro, Leather, or Xverse)
2. Check that the extension is unlocked
3. Try refreshing the page
4. Clear browser cache and localStorage

### Issue: Session doesn't persist after refresh
**Solution:**
1. Check browser console for errors
2. Verify localStorage is not disabled
3. Check if "Block third-party cookies" is enabled (disable it)
4. Try in a different browser

### Issue: Protected routes accessible without wallet
**Solution:**
1. Check `src/App.tsx` - ensure routes are wrapped in `<ProtectedRoute>`
2. Verify `src/store/useWalletStore.ts` is imported correctly
3. Clear browser cache
4. Check for console errors

### Issue: "Checking..." button stays forever
**Solution:**
1. Check browser console for errors
2. Verify `@stacks/connect` is installed: `npm list @stacks/connect`
3. Try disconnecting wallet from extension settings and reconnecting
4. Reload the extension

## Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Open app (no wallet) | Shows connection prompt on home page |
| Click "Connect Wallet" | Wallet extension opens for approval |
| Approve connection | Address displayed, green indicator shown |
| Refresh page | Stays connected, no re-auth needed |
| Access `/create` (connected) | Page loads normally |
| Access `/create` (not connected) | Gate screen appears |
| Click "Disconnect" | Returns to disconnected state |
| Access `/api-demo` (any state) | Page loads (public route) |

## Development Server

Make sure your dev server is running:

```bash
npm run dev
# or
npm start
```

Default URL: `http://localhost:8080` or `http://localhost:5173`

## Additional Notes

- **Testnet**: The app uses Stacks testnet by default
- **Mainnet**: Wallet addresses starting with `SP` are mainnet
- **Testnet**: Wallet addresses starting with `ST` are testnet
- **Auto-detect**: The app automatically detects and uses the correct address

## Success Criteria ✅

All tests should pass with:
- ✅ Wallet connects successfully
- ✅ Session persists across refreshes
- ✅ Protected routes are gated
- ✅ Public routes remain accessible
- ✅ UI updates reflect connection state
- ✅ Disconnect works properly

If all tests pass, your wallet-gated access is **working correctly**! 🎉

