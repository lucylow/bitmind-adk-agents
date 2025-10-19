# External API Integration Guide for BitMind

Complete guide for integrating Discord, Twilio, and other external APIs with BitMind's invoice system using Supabase as the backend.

## 🎯 Overview

This integration provides:
- ✅ **Real-time notifications** across multiple channels (Discord, SMS)
- ✅ **Secure API key storage** (server-side via Supabase Edge Functions)
- ✅ **User-configurable settings** for notification preferences
- ✅ **Audit trail** of all notifications and invoice events
- ✅ **Retry mechanism** for failed notifications
- ✅ **Type-safe implementation** with TypeScript

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Setup](#database-setup)
3. [Supabase Edge Functions](#supabase-edge-functions)
4. [Frontend Integration](#frontend-integration)
5. [Environment Configuration](#environment-configuration)
6. [Deployment](#deployment)
7. [Testing](#testing)
8. [Usage Examples](#usage-examples)

## 🏗️ Architecture Overview

```
┌─────────────────┐
│  BitMind App    │
│   (Frontend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Supabase     │
│  Edge Functions │  ← API Keys stored securely here
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│Discord │ │Twilio  │
│  API   │ │  API   │
└────────┘ └────────┘
```

## 🗄️ Database Setup

### Step 1: Run Migration

The database schema has been created in `supabase/migrations/20241015_api_integrations.sql`

To apply the migration:

```bash
# If using Supabase CLI locally
supabase db reset

# Or push to remote Supabase project
supabase db push
```

### Step 2: Verify Tables

Three tables will be created:

1. **notifications** - Tracks all outbound notifications
   - Stores notification status (pending, sent, failed)
   - Records recipient information
   - Includes error messages for debugging

2. **api_integrations** - Stores user API configurations
   - Discord webhook URLs
   - Twilio phone numbers
   - Service-specific settings

3. **invoice_events** - Audit trail of invoice lifecycle events
   - Links to blockchain transactions
   - Stores event metadata
   - Enables event history queries

## ⚡ Supabase Edge Functions

### Discord Notification Function

**Location:** `supabase/functions/send-discord-notification/index.ts`

**Features:**
- Rich Discord embeds with invoice details
- Color-coded by event type
- Transaction links to Stacks Explorer
- Error handling and retry logic

### Twilio SMS Function

**Location:** `supabase/functions/send-twilio-sms/index.ts`

**Features:**
- Concise SMS messages (SMS length optimized)
- Phone number validation
- Delivery tracking via Twilio SID
- Failed notification logging

## 🎨 Frontend Integration

### Key Components

1. **NotificationSettings.tsx** - User configuration UI
   - Located: `src/components/NotificationSettings.tsx`
   - Enables/disables notification channels
   - Test notification functionality
   - Real-time statistics display

2. **notificationService.ts** - Core service layer
   - Located: `src/lib/notificationService.ts`
   - Handles API calls to Edge Functions
   - Manages notification history
   - Retry failed notifications

3. **invoiceLifecycle.ts** - Event orchestration
   - Located: `src/lib/invoiceLifecycle.ts`
   - Triggers notifications on invoice events
   - Logs events to database
   - Convenience functions for each event type

### React Hooks

**useInvoiceNotifications** - Real-time notifications for specific invoice
```typescript
import { useInvoiceNotifications } from '@/hooks/useInvoiceNotifications'

function InvoiceDetail({ invoiceId }) {
  const { notifications, loading } = useInvoiceNotifications(invoiceId)
  // notifications automatically update in real-time
}
```

**useUserNotifications** - All notifications for current user
```typescript
import { useUserNotifications } from '@/hooks/useInvoiceNotifications'

function NotificationCenter() {
  const { notifications, loading } = useUserNotifications()
  // Shows last 50 notifications with real-time updates
}
```

**useNotificationStats** - Notification statistics
```typescript
import { useNotificationStats } from '@/hooks/useInvoiceNotifications'

function Dashboard() {
  const { stats, loading } = useNotificationStats()
  // Shows sent/failed counts by channel
}
```

## 🔧 Environment Configuration

### Frontend Environment Variables

Create/update `.env.local`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Edge Function Secrets

Set via Supabase Dashboard or CLI:

```bash
# Using Supabase CLI
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=your-auth-token
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
```

Or via Supabase Dashboard:
1. Go to Project Settings → Edge Functions
2. Click "Secrets"
3. Add the following secrets:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

## 🚀 Deployment

### Deploy Edge Functions

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy Discord notification function
supabase functions deploy send-discord-notification

# Deploy Twilio SMS function
supabase functions deploy send-twilio-sms

# Verify deployment
supabase functions list
```

### Set Environment Secrets

```bash
# Set Twilio credentials
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=your-auth-token  
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890

# Verify secrets (values will be hidden)
supabase secrets list
```

## 🧪 Testing

### Test Discord Integration

1. Get a Discord webhook URL:
   - Open your Discord server
   - Go to Server Settings → Integrations → Webhooks
   - Click "New Webhook"
   - Copy the webhook URL

2. In BitMind:
   - Navigate to Settings → Notifications
   - Enable Discord notifications
   - Paste your webhook URL
   - Click "Send Test Notification"
   - Check your Discord channel for the test message

### Test Twilio Integration

1. Get Twilio credentials:
   - Sign up at https://twilio.com
   - Get your Account SID and Auth Token from dashboard
   - Get a Twilio phone number

2. Configure in Supabase:
   ```bash
   supabase secrets set TWILIO_ACCOUNT_SID=your-sid
   supabase secrets set TWILIO_AUTH_TOKEN=your-token
   supabase secrets set TWILIO_PHONE_NUMBER=your-twilio-number
   ```

3. In BitMind:
   - Navigate to Settings → Notifications
   - Enable SMS notifications
   - Enter your phone number (with country code)
   - Click "Send Test SMS"
   - Check your phone for the test message

### Test End-to-End

```typescript
// Example: Test invoice creation notification
import { onInvoiceCreated } from '@/lib/invoiceLifecycle'

async function testInvoiceNotification() {
  await onInvoiceCreated({
    invoiceId: '123',
    amount: '0.5 sBTC',
    payee: 'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173',
    status: 'created',
    txId: '0x123abc...'
  })
}
```

## 📚 Usage Examples

### Example 1: Notify on Invoice Creation

```typescript
import { onInvoiceCreated } from '@/lib/invoiceLifecycle'

async function createInvoice(invoiceData) {
  // Create invoice on blockchain
  const txId = await contractCall(...)
  
  // Send notifications
  await onInvoiceCreated({
    invoiceId: invoiceData.id,
    amount: `${invoiceData.amount} sBTC`,
    payee: invoiceData.payee,
    payer: invoiceData.payer,
    status: 'created',
    txId: txId,
    dueDate: invoiceData.dueDate
  })
}
```

### Example 2: Notify on Payment Release

```typescript
import { onInvoiceReleased } from '@/lib/invoiceLifecycle'

async function releasePayment(invoiceId) {
  // Release payment on blockchain
  const txId = await releaseInvoicePayment(invoiceId)
  
  // Send notifications
  await onInvoiceReleased({
    invoiceId: invoiceId,
    amount: invoice.amount,
    payee: invoice.payee,
    status: 'released',
    txId: txId
  })
}
```

### Example 3: Display Notification History

```typescript
import { useInvoiceNotifications } from '@/hooks/useInvoiceNotifications'

function InvoiceNotificationHistory({ invoiceId }) {
  const { notifications, loading } = useInvoiceNotifications(invoiceId)
  
  if (loading) return <Spinner />
  
  return (
    <div>
      <h3>Notification History</h3>
      {notifications.map(notif => (
        <div key={notif.id}>
          <Badge>{notif.channel}</Badge>
          <span>{notif.type}</span>
          <span className={notif.status === 'sent' ? 'text-green' : 'text-red'}>
            {notif.status}
          </span>
          {notif.error_message && <span>{notif.error_message}</span>}
        </div>
      ))}
    </div>
  )
}
```

### Example 4: Retry Failed Notification

```typescript
import { NotificationService } from '@/lib/notificationService'

async function retryNotification(notificationId: string) {
  const result = await NotificationService.retryFailedNotification(notificationId)
  
  if (result.success) {
    toast.success('Notification resent successfully')
  } else {
    toast.error(`Failed to resend: ${result.error}`)
  }
}
```

## 🔐 Security Considerations

1. **API Keys Never Exposed**
   - All API keys stored in Supabase Edge Function secrets
   - Frontend never has access to credentials
   - Server-side validation of all requests

2. **Row Level Security (RLS)**
   - Users can only view their own notifications
   - Users can only modify their own integrations
   - Invoice events readable by authenticated users

3. **Input Validation**
   - Phone numbers validated for country code
   - Webhook URLs validated before storage
   - SQL injection prevented by Supabase client

4. **Rate Limiting**
   - Consider implementing rate limits in Edge Functions
   - Prevent notification spam
   - Protect against abuse

## 🎉 What Events Trigger Notifications?

| Event Type | Description | Discord | SMS |
|------------|-------------|---------|-----|
| `invoice_created` | New invoice created | ✅ | ✅ |
| `invoice_funded` | Escrow funded | ✅ | ✅ |
| `invoice_released` | Payment released | ✅ | ✅ |
| `invoice_disputed` | Dispute raised | ✅ | ✅ |
| `milestone_completed` | Milestone done | ✅ | ✅ |
| `invoice_cancelled` | Invoice cancelled | ✅ | ⚠️ |
| `payment_received` | Payment confirmed | ✅ | ⚠️ |

✅ = Enabled by default  
⚠️ = Optional (user configurable)

## 🛠️ Troubleshooting

### Discord webhook not working

1. Verify webhook URL format: `https://discord.com/api/webhooks/...`
2. Check webhook is not deleted in Discord
3. Verify webhook has permissions to post in channel
4. Check Supabase function logs: `supabase functions logs send-discord-notification`

### Twilio SMS not sending

1. Verify Twilio credentials are correct
2. Check phone number includes country code (e.g., +1)
3. Verify Twilio account has credits
4. Check Supabase Edge Function logs
5. Verify recipient phone number is verified (for trial accounts)

### Notifications not appearing in database

1. Check RLS policies allow inserts
2. Verify user authentication
3. Check Supabase logs for errors
4. Verify database migration ran successfully

### Real-time updates not working

1. Check Supabase Realtime is enabled for tables
2. Verify RLS policies allow SELECT
3. Check browser console for connection errors
4. Ensure user is authenticated

## 📞 Support

For issues or questions:
- Check Supabase function logs: `supabase functions logs <function-name>`
- Review database logs in Supabase Dashboard
- Check browser console for frontend errors
- Verify all environment variables are set

## 🎯 Next Steps

1. **Add Email Notifications**
   - Create `send-email-notification` Edge Function
   - Use SendGrid, AWS SES, or Resend
   - Add email field to NotificationSettings

2. **Add Webhook Support**
   - Allow users to register custom webhooks
   - Send invoice events to external systems
   - Support for Zapier/Make integrations

3. **Advanced Features**
   - Notification preferences per event type
   - Quiet hours (no notifications at night)
   - Notification batching (daily digest)
   - Multi-language support

4. **Analytics**
   - Notification delivery rates
   - User engagement metrics
   - Failed notification trends
   - Cost tracking (Twilio)

## 📄 License

This integration guide is part of the BitMind project. See LICENSE file for details.

---

**Built with ❤️ for the Stacks community**

