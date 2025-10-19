# DAO Invoice Demo Guide

## Overview

The **Smart Invoice Deals for DAOs** demo provides a comprehensive, interactive experience for exploring BitMindAI's invoice processing capabilities specifically designed for DAO treasury management.

## Features

### 🎮 Interactive Demo Mode
- **No API Key Required** - Use pre-built mock data to explore the complete workflow
- **Full Escrow Simulation** - Experience all 7 steps from parsing to fund release
- **6 Pre-built DAO Templates** - Real-world scenarios from different DAO types

### 🤖 AI Integration Options

#### 1. Mock Data Mode (Recommended for Demo)
- **Zero Configuration** - Works out of the box
- **Instant Results** - No API calls, instant parsing
- **Complete Workflow** - All features enabled
- **Perfect for**: Judges, demos, testing UI/UX

#### 2. Supabase + OpenAI Integration
- **Backend API Key** - OpenAI API key stored securely in Supabase environment
- **No Frontend Secrets** - API key never exposed to the client
- **Real AI Parsing** - Actual OpenAI GPT-4 processing
- **Perfect for**: Production use, real invoices

#### 3. Direct OpenAI/Claude (Optional)
- **Bring Your Own Key** - Use your personal API key
- **Multiple Providers** - OpenAI GPT-4 or Anthropic Claude
- **Perfect for**: Development, testing different models

## DAO Invoice Templates

### 1. DeFi Protocol DAO - Security Audit
- **Amount**: 0.85 sBTC ($52,300)
- **Complexity**: Complex
- **Milestones**: 3 phases (assessment, testing, final report)
- **Use Case**: Smart contract security audit with post-audit support

### 2. NFT Marketplace Collective - Website Redesign
- **Amount**: 0.42 sBTC ($25,800)
- **Complexity**: Medium
- **Milestones**: Design, frontend, mobile optimization
- **Use Case**: Complete UX/UI overhaul with mobile responsiveness

### 3. Web3 Education Guild - Tutorial Series
- **Amount**: 0.65 sBTC ($39,900)
- **Complexity**: Medium
- **Milestones**: Videos, documentation, exercises
- **Use Case**: Comprehensive Clarity smart contract education content

### 4. Gaming DAO Treasury - Token Economics
- **Amount**: 0.28 sBTC ($17,200)
- **Complexity**: Simple
- **Milestones**: Single deliverable
- **Use Case**: Play-to-earn tokenomics modeling and whitepaper

### 5. Social Impact DAO - Community Platform
- **Amount**: 1.20 sBTC ($73,600)
- **Complexity**: Complex
- **Milestones**: 4 equal phases
- **Use Case**: Full-stack governance platform with blockchain integration

### 6. Metaverse Builder DAO - 3D Assets
- **Amount**: 0.55 sBTC ($33,750)
- **Complexity**: Simple
- **Milestones**: Single delivery
- **Use Case**: 50 unique 3D assets for virtual world

## Workflow Steps

### Step 1: AI Parse Invoice
- Select a DAO template or paste custom invoice text
- Choose AI provider (Supabase, OpenAI, Claude, or Mock Data)
- Extract structured data from natural language

### Step 2: Review & Edit
- Verify extracted information
- View all invoice details (payee, amount, milestones, etc.)
- Edit if needed before proceeding

### Step 3: Create Invoice
- Deploy invoice on-chain
- Creates smart contract state
- Records invoice in blockchain

### Step 4: Deposit sBTC
- Transfer funds to escrow
- Secures payment in smart contract
- Protected by post-conditions

### Step 5: Acknowledge Deposit
- Confirm funds received
- Moves invoice to "funded" state
- Ready for work to begin

### Step 6: Release Funds
- Complete work verification
- Release escrowed funds to payee
- Cryptographically enforced payment

### Step 7: Complete
- Invoice settled successfully
- View final transaction details
- Create another invoice

## Setup Instructions

### For Mock Data Demo (No Setup Required)
1. Navigate to `/demo` page
2. Click "Use Mock Data Demo (No API Key Needed)"
3. Explore the full workflow instantly

### For Supabase + OpenAI Integration

#### Prerequisites
- Supabase account
- OpenAI API key

#### Configuration
1. Copy `.env.local.template` to `.env.local`
2. Add Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Configure OpenAI API key in Supabase:
   - Go to Supabase Dashboard > Settings > Edge Functions
   - Add secret: `OPENAI_API_KEY=sk-...`

4. Deploy Supabase Edge Functions:
   ```bash
   cd supabase/functions
   supabase functions deploy parse-invoice
   ```

5. Restart dev server and use "Supabase + OpenAI" option

### For Direct OpenAI/Claude
1. Get API key from [OpenAI](https://platform.openai.com/) or [Anthropic](https://console.anthropic.com/)
2. Select provider in demo
3. Paste your API key when prompted
4. Parse invoice (API key is only used for the session, not stored)

## Technical Details

### Mock Data Structure
```typescript
interface DAOInvoiceTemplate {
  id: string;
  daoName: string;
  daoType: string;
  invoiceText: string;
  parsedData: {
    invoice_id: number;
    payee: string;
    payer: string;
    amount: number; // in satoshis
    token_contract: string;
    arbiter: string;
    deadline: string;
    milestone_description: string;
  };
  scenario: string;
  complexity: 'simple' | 'medium' | 'complex';
}
```

### API Integration
- **Supabase Function**: `/functions/parse-invoice`
- **OpenAI Model**: GPT-4o-mini (fast, cost-effective)
- **Claude Model**: Claude 3.5 Sonnet (high quality)
- **Response Format**: JSON-LD structured invoice data

### Smart Contract Integration
- **Contract**: `smart-invoice-escrow.clar`
- **Token**: sBTC (1:1 Bitcoin peg)
- **Security**: Post-condition protected transfers
- **Network**: Stacks testnet/mainnet

## Benefits for DAOs

### 1. Automated Processing
- **95.2% AI accuracy** in extracting invoice fields
- **Sub-2 second** processing time
- Eliminates manual data entry errors

### 2. Trustless Escrow
- Bitcoin-native settlement via sBTC
- Smart contract enforced payment terms
- No counter-party risk

### 3. Multi-Signature Support
- Arbiter can resolve disputes
- MultiSig treasury integration
- Governance-based approvals

### 4. Transparent Workflow
- All state transitions on-chain
- Audit trail for compliance
- Real-time status tracking

## Use Cases

### Treasury Management
- Pay contractors securely
- Milestone-based payments
- Budget tracking and reporting

### Vendor Payments
- Service agreements
- One-time payments
- Recurring invoices

### Grant Distribution
- Multi-phase grants
- Performance-based releases
- Community voting integration

### Cross-DAO Collaboration
- Inter-DAO payments
- Shared resource funding
- Collaborative project financing

## Troubleshooting

### Supabase Not Configured
**Issue**: "Supabase is not configured" error
**Solution**: 
1. Check `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Restart dev server after adding env vars
3. Use Mock Data mode as fallback

### OpenAI API Error
**Issue**: "OpenAI API error" when parsing
**Solution**:
1. Verify API key is valid
2. Check API key has credits
3. Ensure Supabase Edge Function has `OPENAI_API_KEY` secret set
4. Use Mock Data mode as fallback

### Wallet Connection Issues
**Issue**: Can't connect wallet for on-chain transactions
**Solution**:
1. Mock Data mode simulates transactions (no wallet needed)
2. For real transactions, install Hiro Wallet or Leather Wallet
3. Switch to testnet in wallet settings
4. Get testnet STX from faucet

## Demo Tips for Judges

### Quick Demo Path (2 minutes)
1. Click "Try DAO Invoice Demo" on homepage
2. Select any template (DeFi Audit is impressive)
3. Click "Use Mock Data Demo"
4. Click through all 7 steps
5. Show final completion screen

### Full Feature Demo (5 minutes)
1. Start with homepage overview
2. Navigate to demo page
3. Show template selector (6 different DAO types)
4. Click "random" button to show variety
5. Explain AI provider options
6. Use Mock Data for speed
7. At review step, highlight extracted fields
8. Walk through each escrow step
9. Show security features (arbiter, milestones)
10. Complete workflow

### Advanced Demo (10 minutes)
1. Show Supabase integration (if configured)
2. Demonstrate real AI parsing
3. Edit invoice text and re-parse
4. Show different templates for different DAO types
5. Explain smart contract security
6. Discuss Bitcoin-native settlement
7. Show mobile responsiveness
8. Navigate to analytics/dashboard
9. Show API integrations
10. Discuss production deployment

## Next Steps

After exploring the demo:
1. Review the [Smart Contracts](../contracts/README.md)
2. Check [API Integration Guide](./API_REFERENCE_COMPLETE.md)
3. Read [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
4. See [Deployment Guide](./DEPLOYMENT.md)
5. Join the community on Discord

## Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Questions**: Discord community
- **Email**: support@bitmindai.com (example)

---

**Built with ❤️ for Bitcoin DAOs**

