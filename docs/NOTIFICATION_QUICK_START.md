# 🚀 BitMind Notification System - Quick Start

Get BitMind's external API notifications up and running in 5 minutes!

## ⚡ Quick Setup (5 Steps)

### 1️⃣ Deploy Database Migration

```bash
# Apply the notification tables migration
supabase db push

# Or if running locally
supabase db reset
```

### 2️⃣ Deploy Edge Functions

```bash
# Make the deploy script executable (Unix/Mac)
chmod +x scripts/deploy-edge-functions.sh

# Run the deployment script
./scripts/deploy-edge-functions.sh

# Or deploy manually
supabase functions deploy send-discord-notification
supabase functions deploy send-twilio-sms
```

### 3️⃣ Configure Twilio (Optional - For SMS)

Get your Twilio credentials from https://console.twilio.com

```bash
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=your-auth-token
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
```

### 4️⃣ Update Frontend Environment

Ensure your `.env.local` has:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5️⃣ Configure in App

1. Open BitMind app
2. Navigate to Settings → Notifications
3. Configure your notification channels:
   - **Discord**: Paste your webhook URL
   - **SMS**: Enter your phone number (with country code)
4. Test each integration
5. Save settings

## 🎯 Testing

### Test Discord

```typescript
import { NotificationService } from '@/lib/notificationService'

await NotificationService.sendDiscordNotification(
  '123',
  'invoice_created',
  {
    amount: '0.5 sBTC',
    payee: 'SP2X...',
    status: 'created'
  },
  'https://discord.com/api/webhooks/your-webhook'
)
```

### Test Twilio SMS

```typescript
import { NotificationService } from '@/lib/notificationService'

await NotificationService.sendTwilioSMS(
  '123',
  'invoice_funded',
  '0.5 sBTC',
  '+1234567890'
)
```

### Test Invoice Lifecycle

```typescript
import { onInvoiceCreated } from '@/lib/invoiceLifecycle'

await onInvoiceCreated({
  invoiceId: '123',
  amount: '0.5 sBTC',
  payee: 'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173',
  status: 'created',
  txId: '0x123abc...'
})
```

## 📱 Using in Your Code

### Integrate with Invoice Creation

```typescript
// In your invoice creation function
import { onInvoiceCreated } from '@/lib/invoiceLifecycle'

async function createInvoice(data) {
  // ... create invoice on blockchain
  const txId = await contractCall(...)
  
  // Send notifications automatically
  await onInvoiceCreated({
    invoiceId: data.id,
    amount: `${data.amount} sBTC`,
    payee: data.payee,
    payer: data.payer,
    status: 'created',
    txId: txId
  })
}
```

### Show Notification History

```typescript
import { useInvoiceNotifications } from '@/hooks/useInvoiceNotifications'

function InvoiceDetail({ invoiceId }) {
  const { notifications, loading } = useInvoiceNotifications(invoiceId)
  
  return (
    <div>
      {notifications.map(notif => (
        <NotificationCard key={notif.id} notification={notif} />
      ))}
    </div>
  )
}
```

## 🎨 Add Notification Settings to UI

Add the NotificationSettings component to your settings page:

```typescript
import { NotificationSettings } from '@/components/NotificationSettings'

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <NotificationSettings />
    </div>
  )
}
```

## 🔍 Debugging

### Check Edge Function Logs

```bash
# View Discord function logs
supabase functions logs send-discord-notification

# View Twilio function logs
supabase functions logs send-twilio-sms

# Follow logs in real-time
supabase functions logs send-discord-notification --follow
```

### Check Database Records

```sql
-- View recent notifications
SELECT * FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;

-- View failed notifications
SELECT * FROM notifications 
WHERE status = 'failed' 
ORDER BY created_at DESC;

-- View notification stats
SELECT * FROM notification_stats;
```

### Common Issues

**Discord webhook fails:**
- Verify webhook URL format
- Check webhook still exists in Discord
- View logs: `supabase functions logs send-discord-notification`

**SMS not sending:**
- Verify Twilio credentials are set
- Check phone number format (+country_code)
- Verify Twilio account has credits
- For trial accounts, verify recipient is verified

**Notifications not in database:**
- Check user is authenticated
- Verify RLS policies allow inserts
- Check Supabase logs in dashboard

## 📚 Learn More

- **Full Documentation**: See `EXTERNAL_API_INTEGRATION_GUIDE.md`
- **API Reference**: See code comments in `src/lib/notificationService.ts`
- **Database Schema**: See `supabase/migrations/20241015_api_integrations.sql`
- **Type Definitions**: See `src/lib/supabase-types.ts`

## 🎉 What's Next?

1. **Customize Messages**: Edit event descriptions in Edge Functions
2. **Add Email**: Create `send-email-notification` function
3. **Add Webhooks**: Support custom webhooks for integrations
4. **Analytics**: Track notification delivery rates

## 💡 Pro Tips

- Use the test buttons in NotificationSettings to verify setup
- Monitor notification stats to track delivery success
- Retry failed notifications from the UI
- Set up notification preferences per event type
- Use quiet hours to avoid nighttime notifications

---

**Need help?** Check the full guide in `EXTERNAL_API_INTEGRATION_GUIDE.md`

