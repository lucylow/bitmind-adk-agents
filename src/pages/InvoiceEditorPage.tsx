import React, { useState } from 'react';
import Layout from '@/components/Layout';
import WalletConnect from '@/components/WalletConnect';
import InvoiceEditorAdvanced from '@/components/InvoiceEditorAdvanced';
import TransactionStatus, { TransactionState } from '@/components/TransactionStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InvoiceEditorPage() {
  const [txState, setTxState] = useState<TransactionState>('idle');
  const [txId, setTxId] = useState<string | undefined>();

  const handleCreateDeal = (data: any) => {
    if (data?.txId) {
      setTxId(data.txId);
      setTxState('pending');
      
      // Simulate transaction completion for demo
      setTimeout(() => {
        setTxState('success');
      }, 3000);
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Invoice Editor
            </h1>
            <p className="text-muted-foreground">
              Create and manage blockchain-secured invoices
            </p>
          </div>
          <WalletConnect />
        </div>

        <InvoiceEditorAdvanced onCreateDeal={handleCreateDeal} />

        {txState !== 'idle' && txId && (
          <TransactionStatus
            state={txState}
            txId={txId}
            title="Deal Creation"
            successMessage="Your deal has been created successfully on-chain"
            pendingMessage="Creating deal on blockchain..."
            onClose={() => {
              setTxState('idle');
              setTxId(undefined);
            }}
          />
        )}

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">1. Connect Wallet:</strong> Connect your Stacks wallet to sign transactions
            </div>
            <div>
              <strong className="text-foreground">2. Fill Invoice Details:</strong> Add line items, vendor/buyer info, and amounts
            </div>
            <div>
              <strong className="text-foreground">3. Preview & Validate:</strong> Review all details before submitting
            </div>
            <div>
              <strong className="text-foreground">4. Create Deal:</strong> Transaction is submitted to blockchain for immutable record
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
