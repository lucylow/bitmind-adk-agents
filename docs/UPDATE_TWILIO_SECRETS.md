# 🔄 Update Twilio Secrets in Supabase

## New Credentials Created
- **twilio2-sid** - New Twilio Account SID
- **twilio2-secret** - New Twilio Auth Token

---

## Method 1: Update via Supabase CLI (Recommended)

### Step 1: Set the new secrets in Supabase

```bash
# Navigate to your project directory
cd C:\Users\lowlu\OneDrive\OTHER\Desktop\bitmind

# Set the new Twilio Account SID
npx supabase secrets set twilio2-sid="YOUR_NEW_ACCOUNT_SID_HERE"

# Set the new Twilio Auth Token
npx supabase secrets set twilio2-secret="YOUR_NEW_AUTH_TOKEN_HERE"
```

### Step 2: Verify the secrets were set

```bash
# List all secrets (values will be hidden)
npx supabase secrets list
```

### Step 3: If you need to unset the old exposed credentials

```bash
# Remove old credentials (if they exist with different names)
npx supabase secrets unset twilio-account-sid
npx supabase secrets unset VITE_TWILIO_AUTH_TOKEN
```

---

## Method 2: Update via Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - URL: https://app.supabase.com/project/wlvuswftjdpnqlyrzquz/settings/vault

2. **Navigate to Settings → Vault/Secrets**

3. **Add/Update the secrets:**
   - Click "New Secret"
   - Name: `twilio2-sid`
   - Value: [Your new Twilio Account SID]
   - Click "Add Secret"
   
   - Click "New Secret" again
   - Name: `twilio2-secret`
   - Value: [Your new Twilio Auth Token]
   - Click "Add Secret"

4. **Delete old exposed credentials** (if they exist)

---

## Method 3: Update Environment Variables Locally

If you're using the credentials in your frontend (not recommended for production), update your `.env.local`:

```bash
# Edit .env.local file
VITE_TWILIO_ACCOUNT_SID=your-new-account-sid-here
VITE_TWILIO_AUTH_TOKEN=your-new-auth-token-here
VITE_TWILIO_PHONE_NUMBER=+1234567890
```

---

## For Supabase Edge Functions

If your Supabase Edge Functions use Twilio, you'll need to reference the new secret names:

### Example Edge Function Code:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  try {
    // Get secrets from Supabase
    const twilioSid = Deno.env.get('twilio2-sid')
    const twilioSecret = Deno.env.get('twilio2-secret')
    
    if (!twilioSid || !twilioSecret) {
      throw new Error('Twilio credentials not found')
    }
    
    // Use the credentials
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioSid}:${twilioSecret}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: '+1234567890',
          From: '+1234567890', // Your Twilio number
          Body: 'Test message from BitMind'
        })
      }
    )
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

---

## Security Best Practices

✅ **Do:**
- Store credentials in Supabase Vault/Secrets
- Use environment variables for local development
- Rotate credentials regularly
- Use different credentials for dev/staging/production

❌ **Don't:**
- Commit credentials to Git
- Expose credentials in client-side code
- Use the same credentials across all environments
- Share credentials in plain text

---

## Verification Steps

### Test Twilio Connection:

```bash
# You can test if the credentials work using curl:
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/YOUR_NEW_SID/Messages.json" \
  --data-urlencode "To=+1234567890" \
  --data-urlencode "From=YOUR_TWILIO_NUMBER" \
  --data-urlencode "Body=Test from BitMind" \
  -u "YOUR_NEW_SID:YOUR_NEW_AUTH_TOKEN"
```

### Check Supabase Logs:

After updating, check if your Edge Functions can access the secrets:

```bash
npx supabase functions logs --project-ref wlvuswftjdpnqlyrzquz
```

---

## Quick Command Reference

```bash
# Set secret
npx supabase secrets set SECRET_NAME="value"

# List secrets
npx supabase secrets list

# Unset secret
npx supabase secrets unset SECRET_NAME

# Deploy function with new secrets
npx supabase functions deploy function-name

# Test function locally with secrets
npx supabase functions serve --env-file .env.local
```

---

## Need Help?

If you encounter issues:
1. Verify your Supabase CLI is logged in: `npx supabase login`
2. Check project is linked: `npx supabase link --project-ref wlvuswftjdpnqlyrzquz`
3. Ensure you have project permissions
4. Check Supabase status: https://status.supabase.com/

---

## Updated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")



