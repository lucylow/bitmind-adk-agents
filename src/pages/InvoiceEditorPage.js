import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Layout from '@/components/Layout';
import WalletConnect from '@/components/WalletConnect';
import InvoiceEditorAdvanced from '@/components/InvoiceEditorAdvanced';
import TransactionStatus from '@/components/TransactionStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function InvoiceEditorPage() {
    const [txState, setTxState] = useState('idle');
    const [txId, setTxId] = useState();
    const handleCreateDeal = (data) => {
        if (data?.txId) {
            setTxId(data.txId);
            setTxState('pending');
            // Simulate transaction completion for demo
            setTimeout(() => {
                setTxState('success');
            }, 3000);
        }
    };
    return (_jsx(Layout, { children: _jsxs("div", { className: "container max-w-6xl mx-auto py-8 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: "Invoice Editor" }), _jsx("p", { className: "text-muted-foreground", children: "Create and manage blockchain-secured invoices" })] }), _jsx(WalletConnect, {})] }), _jsx(InvoiceEditorAdvanced, { onCreateDeal: handleCreateDeal }), txState !== 'idle' && txId && (_jsx(TransactionStatus, { state: txState, txId: txId, title: "Deal Creation", successMessage: "Your deal has been created successfully on-chain", pendingMessage: "Creating deal on blockchain...", onClose: () => {
                        setTxState('idle');
                        setTxId(undefined);
                    } })), _jsxs(Card, { className: "bg-muted/30", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "How It Works" }) }), _jsxs(CardContent, { className: "space-y-3 text-sm text-muted-foreground", children: [_jsxs("div", { children: [_jsx("strong", { className: "text-foreground", children: "1. Connect Wallet:" }), " Connect your Stacks wallet to sign transactions"] }), _jsxs("div", { children: [_jsx("strong", { className: "text-foreground", children: "2. Fill Invoice Details:" }), " Add line items, vendor/buyer info, and amounts"] }), _jsxs("div", { children: [_jsx("strong", { className: "text-foreground", children: "3. Preview & Validate:" }), " Review all details before submitting"] }), _jsxs("div", { children: [_jsx("strong", { className: "text-foreground", children: "4. Create Deal:" }), " Transaction is submitted to blockchain for immutable record"] })] })] })] }) }));
}
