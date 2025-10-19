# Chainhooks Integration Guide for BitMind

**Real-time blockchain event monitoring using Hiro Chainhooks**

## Overview

Chainhooks allow BitMind to react to on-chain events in real-time, enabling features like:
- Instant notification when invoice is funded
- Automatic status updates when funds are released
- Discord/Slack alerts for new invoices
- Analytics dashboards with live data

---

## What are Chainhooks?

Chainhooks are Hiro's solution for monitoring specific blockchain events without constantly polling the network. They provide:

✅ **Real-time**: Events delivered within seconds  
✅ **Selective**: Only monitor events you care about  
✅ **Reliable**: Built-in retry and delivery guarantees  
✅ **Scalable**: No need to index entire blockchain yourself

**Documentation**: https://docs.hiro.so/chainhooks

---

## Installation

### 1. Install Chainhook Node

```bash
# macOS
brew install hirosystems/tap/chainhook

# Linux (from source)
git clone https://github.com/hirosystems/chainhook.git
cd chainhook
cargo install --path .

# Verify installation
chainhook --version
```

### 2. Configure Chainhook

Create `chainhook-config.toml`:

```toml
[storage]
working_dir = "/var/chainhook"

[http_api]
http_port = 20456
database_uri = "redis://localhost:6379/"

[network]
mode = "testnet"
bitcoind_rpc_url = "http://localhost:18332"
bitcoind_rpc_username = "user"
bitcoind_rpc_password = "pass"
stacks_node_rpc_url = "http://localhost:20443"

[limits]
max_number_of_bitcoin_predicates = 100
max_number_of_concurrent_bitcoin_scans = 100
max_number_of_concurrent_stacks_scans = 100
max_caching_memory_size_mb = 32000

[event_source]
polling_delay_ms = 10000
```

---

## BitMind Chainhook Predicates

### 1. Monitor Invoice Creation

**Predicate**: `invoice-created.json`

```json
{
  "chain": "stacks",
  "uuid": "bitmind-invoice-created",
  "name": "Invoice Created Events",
  "version": 1,
  "networks": {
    "testnet": {
      "if_this": {
        "scope": "contract_call",
        "contract_identifier": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.escrow-secure",
        "method": "create-invoice"
      },
      "then_that": {
        "http_post": {
          "url": "https://api.bitmind.io/webhooks/chainhook/invoice-created",
          "authorization_header": "Bearer YOUR_SECRET_TOKEN"
        }
      }
    }
  }
}
```

**Register Hook:**

```bash
chainhook predicates apply invoice-created.json --config-path=chainhook-config.toml
```

**Webhook Handler (Express.js):**

```typescript
import express from 'express';
import { sendDiscordNotification } from './notifications';

app.post('/webhooks/chainhook/invoice-created', async (req, res) => {
  const { apply, rollback } = req.body;

  for (const transaction of apply) {
    const { txid, contract_call } = transaction;
    
    // Extract invoice data from contract call
    const args = contract_call.args;
    const invoiceId = args[0]; // invoice-id
    const payee = args[1];     // payee
    const amount = args[2];    // amount

    console.log(`✅ New Invoice: #${invoiceId}`);
    console.log(`   Payee: ${payee}`);
    console.log(`   Amount: ${amount} satoshis`);
    console.log(`   TX: ${txid}`);

    // Store in database
    await db.invoices.create({
      invoiceId,
      payee,
      amount,
      txId: txid,
      status: 'created',
      createdAt: new Date(),
    });

    // Send notification
    await sendDiscordNotification({
      title: '📝 New Invoice Created',
      description: `Invoice #${invoiceId} for ${amount / 1e8} sBTC`,
      url: `https://explorer.stacks.co/txid/${txid}?chain=testnet`,
    });
  }

  res.status(200).json({ ok: true });
});
```

---

### 2. Monitor Fund Deposits

**Predicate**: `invoice-funded.json`

```json
{
  "chain": "stacks",
  "uuid": "bitmind-invoice-funded",
  "name": "Invoice Funded Events",
  "version": 1,
  "networks": {
    "testnet": {
      "if_this": {
        "scope": "print_event",
        "contract_identifier": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.escrow-secure",
        "contains": "funds-deposited"
      },
      "then_that": {
        "http_post": {
          "url": "https://api.bitmind.io/webhooks/chainhook/invoice-funded",
          "authorization_header": "Bearer YOUR_SECRET_TOKEN"
        }
      }
    }
  }
}
```

**Handler:**

```typescript
app.post('/webhooks/chainhook/invoice-funded', async (req, res) => {
  const { apply } = req.body;

  for (const transaction of apply) {
    const { txid, print_event } = transaction;
    const { invoice_id, amount } = print_event.data;

    console.log(`💰 Invoice Funded: #${invoice_id} with ${amount} satoshis`);

    // Update database
    await db.invoices.update({
      where: { invoiceId: invoice_id },
      data: {
        status: 'funded',
        depositTxId: txid,
        fundedAt: new Date(),
      },
    });

    // Notify contractor
    await notifyContractor(invoice_id, {
      message: 'Payment has been escrowed! Start work now.',
      explorerUrl: `https://explorer.stacks.co/txid/${txid}`,
    });
  }

  res.status(200).json({ ok: true });
});
```

---

### 3. Monitor Fund Releases

**Predicate**: `funds-released.json`

```json
{
  "chain": "stacks",
  "uuid": "bitmind-funds-released",
  "name": "Funds Released Events",
  "version": 1,
  "networks": {
    "testnet": {
      "if_this": {
        "scope": "print_event",
        "contract_identifier": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.escrow-secure",
        "contains": "funds-released"
      },
      "then_that": {
        "http_post": {
          "url": "https://api.bitmind.io/webhooks/chainhook/funds-released",
          "authorization_header": "Bearer YOUR_SECRET_TOKEN"
        }
      }
    }
  }
}
```

**Handler:**

```typescript
app.post('/webhooks/chainhook/funds-released', async (req, res) => {
  const { apply } = req.body;

  for (const transaction of apply) {
    const { txid, print_event } = transaction;
    const { invoice_id, amount, payee } = print_event.data;

    console.log(`✅ Funds Released: ${amount} to ${payee}`);

    // Update status
    await db.invoices.update({
      where: { invoiceId: invoice_id },
      data: {
        status: 'released',
        releaseTxId: txid,
        releasedAt: new Date(),
      },
    });

    // Celebrate! 🎉
    await sendSuccessNotification(invoice_id, payee, amount);
  }

  res.status(200).json({ ok: true });
});
```

---

## Frontend Integration

### Real-Time Status Updates

Use WebSockets to push updates to frontend:

**Backend (Socket.io):**

```typescript
import { Server } from 'socket.io';

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL },
});

// When Chainhook triggers
app.post('/webhooks/chainhook/invoice-created', async (req, res) => {
  // ... process event ...

  // Broadcast to all connected clients
  io.emit('invoice-created', {
    invoiceId,
    payee,
    amount,
    txId: txid,
    timestamp: new Date(),
  });

  res.status(200).json({ ok: true });
});
```

**Frontend (React):**

```typescript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function useRealtimeInvoices() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const socket = io('https://api.bitmind.io');

    socket.on('invoice-created', (data) => {
      console.log('🔔 New invoice:', data);
      setInvoices((prev) => [data, ...prev]);
      
      // Show toast notification
      toast({
        title: '📝 New Invoice',
        description: `Invoice #${data.invoiceId} created`,
      });
    });

    socket.on('invoice-funded', (data) => {
      console.log('💰 Invoice funded:', data);
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.invoiceId === data.invoiceId
            ? { ...inv, status: 'funded' }
            : inv
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  return invoices;
}
```

---

## Discord Integration

Send real-time notifications to Discord:

```typescript
import axios from 'axios';

async function sendDiscordNotification(event: {
  title: string;
  description: string;
  color?: string;
  url?: string;
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  await axios.post(webhookUrl, {
    embeds: [
      {
        title: event.title,
        description: event.description,
        color: event.color === 'success' ? 3066993 : 15158332, // green : red
        url: event.url,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'BitMind Invoice System',
        },
      },
    ],
  });
}

// Usage in Chainhook handler
await sendDiscordNotification({
  title: '✅ Invoice #2025001 Funded',
  description: 'Escrow received 0.85 sBTC',
  color: 'success',
  url: 'https://explorer.stacks.co/txid/0x...',
});
```

---

## Analytics Dashboard

Aggregate events for real-time analytics:

```typescript
// Store events in time-series database
app.post('/webhooks/chainhook/invoice-created', async (req, res) => {
  const { apply } = req.body;

  for (const tx of apply) {
    // Store in TimescaleDB or InfluxDB
    await db.query(`
      INSERT INTO invoice_events (event_type, invoice_id, amount, timestamp)
      VALUES ('created', $1, $2, NOW())
    `, [tx.invoice_id, tx.amount]);
  }

  // Update real-time metrics
  await redis.incr('metrics:invoices_created_today');
  await redis.incrby('metrics:volume_today', tx.amount);

  res.status(200).json({ ok: true });
});

// API endpoint for dashboard
app.get('/api/metrics/realtime', async (req, res) => {
  const metrics = {
    invoicesToday: await redis.get('metrics:invoices_created_today'),
    volumeToday: await redis.get('metrics:volume_today'),
    activeInvoices: await db.invoices.count({ where: { status: 'funded' } }),
  };

  res.json(metrics);
});
```

---

## Monitoring & Debugging

### View Active Chainhooks

```bash
chainhook predicates list --config-path=chainhook-config.toml
```

### Check Chainhook Logs

```bash
tail -f /var/chainhook/logs/chainhook.log
```

### Test Webhook Locally

Use `ngrok` to expose localhost:

```bash
ngrok http 3000

# Update predicate URL to:
# https://abc123.ngrok.io/webhooks/chainhook/invoice-created
```

---

## Production Deployment

### 1. Use a Dedicated Server

```bash
# Install on Ubuntu
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install chainhook

# Create systemd service
sudo nano /etc/systemd/system/chainhook.service
```

**Service File:**

```ini
[Unit]
Description=Chainhook Service
After=network.target

[Service]
Type=simple
User=chainhook
WorkingDirectory=/var/chainhook
ExecStart=/usr/local/bin/chainhook service start --config-path=/etc/chainhook/config.toml
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable chainhook
sudo systemctl start chainhook
```

### 2. Secure Webhooks

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(req: Request) {
  const signature = req.headers['x-chainhook-signature'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.CHAINHOOK_SECRET;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    throw new Error('Invalid signature');
  }
}

app.post('/webhooks/chainhook/*', (req, res, next) => {
  try {
    verifyWebhookSignature(req);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});
```

### 3. Handle Reorgs

Chainhooks automatically handle chain reorganizations:

```typescript
app.post('/webhooks/chainhook/invoice-created', async (req, res) => {
  const { apply, rollback } = req.body;

  // Handle rollback (chain reorg)
  if (rollback && rollback.length > 0) {
    for (const tx of rollback) {
      console.warn(`⚠️ Rolling back transaction: ${tx.txid}`);
      await db.invoices.update({
        where: { txId: tx.txid },
        data: { status: 'rolled_back' },
      });
    }
  }

  // Handle new confirmed transactions
  for (const tx of apply) {
    // ... normal processing
  }

  res.status(200).json({ ok: true });
});
```

---

## Resources

- **Chainhooks Documentation**: https://docs.hiro.so/chainhooks
- **Chainhooks GitHub**: https://github.com/hirosystems/chainhook
- **Stacks Explorer API**: https://docs.hiro.so/api
- **Discord Support**: https://discord.gg/stacks

---

**Next Steps:**
1. Set up Chainhook node on your server
2. Deploy webhook handlers
3. Test with testnet transactions
4. Monitor logs and adjust configuration
5. Deploy to production after thorough testing

🚀 **With Chainhooks, your BitMind invoices are now truly real-time!**



