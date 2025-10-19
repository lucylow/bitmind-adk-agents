# BitMind API Reference

Complete API documentation with `curl` examples for integration.

## Table of Contents

1. [Authentication](#authentication)
2. [Smart Contract Integration](#smart-contract-integration)
3. [Invoice Management](#invoice-management)
4. [AI Parsing](#ai-parsing)
5. [Query & Monitoring](#query--monitoring)
6. [Error Codes](#error-codes)

---

## Authentication

BitMind uses Stacks wallet authentication for blockchain operations. For backend API (optional), use API keys.

### Connect Wallet

**Frontend (Stacks.js):**

```typescript
import { showConnect } from '@stacks/connect';

showConnect({
  appDetails: {
    name: 'BitMind',
    icon: window.location.origin + '/icon.png',
  },
  onFinish: () => console.log('✅ Connected'),
  onCancel: () => console.log('❌ Cancelled'),
});
```

**Response:** User's wallet address available via `UserSession`

---

## Smart Contract Integration

### 1. Create Invoice

Deploy a new invoice smart contract on Stacks blockchain.

**Endpoint:** Contract call to `escrow-secure.create-invoice`

**Parameters:**
- `invoice-id` (uint): Unique invoice identifier
- `payee` (principal): Recipient Stacks address
- `amount` (uint): Amount in token base units (satoshis for sBTC)
- `token-contract` (principal): Token contract address
- `arbiter` (principal): Dispute arbiter address
- `deadline` (uint): Deadline in block height
- `metadata-hash` (optional buff): IPFS hash for additional data

**TypeScript Example:**

```typescript
import { createInvoice } from '@/lib/stacksIntegration';

await createInvoice(
  2025001,                                          // invoice ID
  'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',     // payee
  85000000,                                         // 0.85 sBTC (8 decimals)
  'SP000000000000000000002Q6VF78.sbtc-token',      // token contract
  'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',     // arbiter
  150000,                                           // deadline (block height)
  userSession
);
```

**Clarity Contract Call:**

```clarity
(contract-call? .escrow-secure create-invoice 
  u2025001 
  'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
  u85000000
  .sbtc-token
  'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5
  u150000
  none
)
```

**Post-Conditions (Security):**

```typescript
import { makeStandardSTXPostCondition, FungibleConditionCode } from '@stacks/transactions';

const postConditions = [
  makeStandardSTXPostCondition(
    senderAddress,
    FungibleConditionCode.LessEqual,
    100000 // Max 0.1 STX fee
  ),
];
```

**Response:**

```json
{
  "txId": "0x1234567890abcdef...",
  "status": "pending"
}
```

**Track Transaction:**

```bash
# View on Stacks Explorer
https://explorer.stacks.co/txid/0x1234567890abcdef?chain=testnet
```

---

### 2. Fund Escrow

Transfer tokens to escrow and acknowledge deposit.

**Step 1: Transfer Tokens**

```typescript
import { transferTokensToEscrow } from '@/lib/stacksIntegration';

await transferTokensToEscrow(
  85000000,    // amount
  senderAddress,
  userSession
);
```

**Step 2: Acknowledge Deposit**

```typescript
import { acknowledgeDeposit } from '@/lib/stacksIntegration';

await acknowledgeDeposit(2025001, userSession);
```

**Equivalent cURL (if using backend API):**

```bash
curl -X POST https://api.bitmind.io/v1/invoices/2025001/fund \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "amount": 85000000,
    "txId": "0xabc..."
  }'
```

**Response:**

```json
{
  "success": true,
  "invoiceId": 2025001,
  "status": "funded",
  "depositedAmount": 85000000,
  "txId": "0xdef..."
}
```

---

### 3. Release Funds

Release escrowed funds to payee (callable by payer or arbiter).

**TypeScript:**

```typescript
import { releaseFunds } from '@/lib/stacksIntegration';

await releaseFunds(2025001, userSession, {
  amount: 85000000,
  payee: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  tokenContract: 'SP000000000000000000002Q6VF78.sbtc-token'
});
```

**Clarity:**

```clarity
(contract-call? .escrow-secure release-funds u2025001)
```

**cURL (Backend API):**

```bash
curl -X POST https://api.bitmind.io/v1/invoices/2025001/release \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "txId": "0x...",
    "signature": "..."
  }'
```

**Response:**

```json
{
  "success": true,
  "invoiceId": 2025001,
  "status": "released",
  "releasedAmount": 85000000,
  "payee": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
  "txId": "0x...",
  "explorerUrl": "https://explorer.stacks.co/txid/0x...?chain=testnet"
}
```

---

### 4. Refund to Payer

Refund escrowed funds back to payer (callable by payer or arbiter).

**TypeScript:**

```typescript
import { refundToPayer } from '@/lib/stacksIntegration';

await refundToPayer(2025001, userSession);
```

**cURL:**

```bash
curl -X POST https://api.bitmind.io/v1/invoices/2025001/refund \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**

```json
{
  "success": true,
  "invoiceId": 2025001,
  "status": "refunded",
  "refundedAmount": 85000000,
  "txId": "0x..."
}
```

---

## Invoice Management

### Get Invoice Details

**Read-Only Contract Call:**

```typescript
import { getInvoice } from '@/lib/stacksIntegration';

const invoice = await getInvoice(2025001);
```

**cURL (Backend API):**

```bash
curl -X GET https://api.bitmind.io/v1/invoices/2025001 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**

```json
{
  "invoiceId": 2025001,
  "creator": "SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "payer": "SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "payee": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
  "amount": 85000000,
  "depositedAmount": 85000000,
  "tokenContract": "SP000000000000000000002Q6VF78.sbtc-token",
  "arbiter": "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5",
  "status": 1,
  "statusText": "FUNDED",
  "createdAt": 123456,
  "deadline": 150000,
  "metadataHash": null
}
```

---

### List All Invoices

**Backend API:**

```bash
curl -X GET "https://api.bitmind.io/v1/invoices?limit=20&offset=0&status=funded" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Query Parameters:**
- `limit` (int): Results per page (default: 20, max: 100)
- `offset` (int): Pagination offset (default: 0)
- `status` (string): Filter by status: `open`, `funded`, `released`, `refunded`, `disputed`
- `payee` (string): Filter by payee address
- `payer` (string): Filter by payer address

**Response:**

```json
{
  "invoices": [
    {
      "invoiceId": 2025001,
      "amount": 85000000,
      "status": "funded",
      "createdAt": "2025-10-13T12:00:00Z"
    }
  ],
  "total": 247,
  "limit": 20,
  "offset": 0
}
```

---

## AI Parsing

### Parse Invoice with AI

Extract structured data from plain-text invoices using GPT-4 or Claude.

**TypeScript:**

```typescript
import { parseInvoiceWithOpenAI } from '@/lib/aiInvoiceParser';

const invoiceText = `
Invoice #2025-042
TO: Alice (SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7)
Amount: 0.85 BTC
Work: Smart contract audit
Due: December 31, 2025
Arbiter: ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5
`;

const parsed = await parseInvoiceWithOpenAI(invoiceText, OPENAI_API_KEY);
```

**cURL (Backend API):**

```bash
curl -X POST https://api.bitmind.io/v1/parse \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "text": "Invoice #2025-042\nTO: Alice...",
    "provider": "openai"
  }'
```

**Request Body:**

```json
{
  "text": "Invoice text here...",
  "provider": "openai" | "claude" | "custom",
  "customEndpoint": "https://your-api.com/parse" (optional)
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "invoice_id": 2025042,
    "payee": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    "amount": 85000000,
    "token_contract": "SP000000000000000000002Q6VF78.sbtc-token",
    "arbiter": "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5",
    "deadline": "2025-12-31",
    "milestone_description": "Smart contract audit"
  },
  "confidence": 0.98,
  "processingTime": 1.42
}
```

---

## Query & Monitoring

### Get Token Balance

```typescript
import { getTokenBalance } from '@/lib/stacksIntegration';

const balance = await getTokenBalance('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
```

**cURL:**

```bash
curl -X GET "https://api.bitmind.io/v1/balance/SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**

```json
{
  "address": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
  "balance": 185000000,
  "formattedBalance": "1.85 sBTC"
}
```

---

### Get Contract Status

Check if contract is paused or operational.

```typescript
const status = await callReadOnlyFunction({
  contractAddress: CONTRACT_ADDRESS,
  contractName: 'escrow-secure',
  functionName: 'is-paused',
  functionArgs: [],
  network: NETWORK,
  senderAddress: CONTRACT_ADDRESS,
});
```

**Response:**

```clarity
(ok false)  ;; Contract is operational
;; or
(ok true)   ;; Contract is paused
```

---

### Monitor Transaction Status

**Poll Transaction:**

```bash
curl -X GET https://api.bitmind.io/v1/transactions/0x1234567890abcdef \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**

```json
{
  "txId": "0x1234567890abcdef...",
  "status": "success",
  "blockHeight": 123456,
  "confirmations": 3,
  "gasUsed": 4500,
  "events": [
    {
      "type": "print",
      "data": {
        "event": "invoice-created",
        "invoice-id": 2025001
      }
    }
  ]
}
```

---

## Error Codes

### Smart Contract Errors

| Code | Constant | Description |
|------|----------|-------------|
| 100 | `ERR-INVOICE-EXISTS` | Invoice ID already exists |
| 101 | `ERR-NOT-PAYER` | Caller is not the invoice payer |
| 102 | `ERR-ALREADY-FUNDED` | Invoice already funded |
| 103 | `ERR-NO-FUNDS` | No funds in escrow |
| 104 | `ERR-NOT-ARBITER-OR-PAYER` | Unauthorized to release/refund |
| 105 | `ERR-NOT-PAYEE` | Caller is not the payee |
| 106 | `ERR-TRANSFER-FAILED` | Token transfer failed |
| 107 | `ERR-CONTRACT-PAUSED` | Contract is paused (emergency) |
| 108 | `ERR-NOT-ADMIN` | Caller is not an admin |
| 109 | `ERR-TOKEN-NOT-WHITELISTED` | Token not approved |
| 110 | `ERR-INVALID-AMOUNT` | Amount is zero or exceeds maximum |
| 111 | `ERR-INVALID-INVOICE-ID` | Invoice ID is invalid |

### Backend API Errors

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `INVALID_INPUT` | Validation error |
| 401 | `UNAUTHORIZED` | Missing or invalid API key |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RATE_LIMIT` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

**Example Error Response:**

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Payee address must start with SP or ST",
    "field": "payee",
    "statusCode": 400
  }
}
```

---

## Rate Limits

- **AI Parsing**: 100 requests/hour per API key
- **Contract Queries**: Unlimited (read-only)
- **Transaction Submission**: 10 transactions/minute per wallet
- **Backend API**: 1000 requests/hour per API key

---

## Webhooks (Optional)

Subscribe to real-time invoice events.

**Setup:**

```bash
curl -X POST https://api.bitmind.io/v1/webhooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "url": "https://your-app.com/webhooks/bitmind",
    "events": ["invoice.created", "invoice.funded", "invoice.released"]
  }'
```

**Webhook Payload:**

```json
{
  "event": "invoice.funded",
  "timestamp": "2025-10-13T12:00:00Z",
  "data": {
    "invoiceId": 2025001,
    "amount": 85000000,
    "status": "funded",
    "txId": "0x..."
  }
}
```

---

## SDKs & Libraries

### JavaScript/TypeScript

```bash
npm install @bitmind/sdk
```

```typescript
import { BitMindClient } from '@bitmind/sdk';

const client = new BitMindClient({
  network: 'testnet',
  apiKey: 'your-api-key',
});

const invoice = await client.invoices.create({
  payee: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  amount: '0.85',
  currency: 'sBTC',
});
```

### Python

```bash
pip install bitmind-sdk
```

```python
from bitmind import BitMindClient

client = BitMindClient(api_key='your-key')
invoice = client.invoices.create(
    payee='SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    amount=0.85,
    currency='sBTC'
)
```

---

## Support

- **Documentation**: https://docs.bitmind.io
- **Stacks Docs**: https://docs.stacks.co
- **Hiro Docs**: https://docs.hiro.so
- **Discord**: https://discord.gg/stacks (#bitmind)
- **Email**: api@bitmind.io

---

**Last Updated:** October 14, 2025  
**API Version:** v1.0.0  
**Testnet Contract:** `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.escrow-secure`



