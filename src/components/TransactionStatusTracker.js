import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, ExternalLink, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { NETWORK } from '@/lib/stacksIntegration';
/**
 * Real-time transaction status tracker with Stacks Explorer integration
 * Follows Hiro best practices for user feedback
 */
const TransactionStatusTracker = ({ txId, status, operation, onRefresh, showExplorerLink = true, }) => {
    const [elapsed, setElapsed] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    useEffect(() => {
        if (status === 'pending' || status === 'broadcast') {
            const interval = setInterval(() => {
                setElapsed((prev) => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [status]);
    const getExplorerUrl = () => {
        if (!txId)
            return null;
        const chain = NETWORK.isMainnet() ? 'mainnet' : 'testnet';
        return `https://explorer.stacks.co/txid/${txId}?chain=${chain}`;
    };
    const getStatusIcon = () => {
        switch (status) {
            case 'pending':
            case 'broadcast':
                return _jsx(Loader2, { className: "w-5 h-5 animate-spin text-blue-600" });
            case 'success':
                return _jsx(CheckCircle, { className: "w-5 h-5 text-green-600" });
            case 'failed':
                return _jsx(XCircle, { className: "w-5 h-5 text-red-600" });
            default:
                return _jsx(Clock, { className: "w-5 h-5 text-gray-400" });
        }
    };
    const getStatusColor = () => {
        switch (status) {
            case 'pending':
            case 'broadcast':
                return 'bg-blue-50 border-blue-200';
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'failed':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };
    const getStatusBadge = () => {
        switch (status) {
            case 'broadcast':
                return (_jsx(Badge, { variant: "secondary", className: "bg-blue-100 text-blue-800", children: "Broadcasting..." }));
            case 'pending':
                return (_jsx(Badge, { variant: "secondary", className: "bg-blue-100 text-blue-800", children: "Confirming on-chain..." }));
            case 'success':
                return (_jsx(Badge, { variant: "default", className: "bg-green-600", children: "\u2713 Confirmed" }));
            case 'failed':
                return (_jsx(Badge, { variant: "destructive", children: "\u00D7 Failed" }));
            default:
                return null;
        }
    };
    const getEstimatedTime = () => {
        if (status === 'pending') {
            // Stacks blocks: ~10 minutes average
            return 'Est. 10-15 minutes';
        }
        if (status === 'broadcast') {
            return 'Broadcasting to network...';
        }
        return null;
    };
    const formatElapsed = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    if (!txId && status !== 'pending')
        return null;
    return (_jsxs(Card, { className: `border-2 ${getStatusColor()} transition-all`, children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getStatusIcon(), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-base", children: operation }), _jsx(CardDescription, { className: "text-xs mt-0.5", children: status === 'success'
                                                ? 'Transaction confirmed on Stacks blockchain'
                                                : status === 'failed'
                                                    ? 'Transaction failed - please try again'
                                                    : 'Waiting for blockchain confirmation' })] })] }), getStatusBadge()] }) }), _jsxs(CardContent, { className: "space-y-3", children: [txId && (_jsxs("div", { className: "flex items-center justify-between p-2 bg-white rounded border text-xs", children: [_jsxs("div", { className: "flex items-col gap-2", children: [_jsx("span", { className: "text-muted-foreground", children: "TX ID:" }), _jsxs("code", { className: "font-mono", children: [txId.slice(0, 8), "...", txId.slice(-8)] })] }), showExplorerLink && (_jsxs(Button, { size: "sm", variant: "ghost", className: "h-6 text-xs", onClick: () => window.open(getExplorerUrl() || '', '_blank'), children: [_jsx(ExternalLink, { className: "w-3 h-3 mr-1" }), "View on Explorer"] }))] })), (status === 'pending' || status === 'broadcast') && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-muted-foreground", children: "Elapsed:" }), _jsx("span", { className: "font-mono", children: formatElapsed(elapsed) })] }), _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-muted-foreground", children: "Estimated time:" }), _jsx("span", { children: getEstimatedTime() })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-1.5 overflow-hidden", children: _jsx("div", { className: "bg-blue-600 h-full rounded-full animate-pulse", style: { width: status === 'broadcast' ? '30%' : '70%' } }) })] })), status === 'success' && (_jsxs("div", { className: "p-3 bg-green-50 border border-green-200 rounded-lg", children: [_jsx("p", { className: "text-xs text-green-800", children: "\u2713 Transaction successfully confirmed on Bitcoin via Stacks" }), txId && (_jsx("p", { className: "text-xs text-green-600 mt-1", children: "Block anchored to Bitcoin for immutable security" }))] })), status === 'failed' && (_jsx("div", { className: "p-3 bg-red-50 border border-red-200 rounded-lg", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-red-600 mt-0.5" }), _jsxs("div", { className: "text-xs", children: [_jsx("p", { className: "text-red-800 font-semibold", children: "Transaction failed" }), _jsx("p", { className: "text-red-600 mt-1", children: "Common causes: insufficient balance, invalid parameters, or network issues." }), onRefresh && (_jsxs(Button, { size: "sm", variant: "outline", className: "mt-2 h-7 text-xs", onClick: onRefresh, children: [_jsx(RefreshCw, { className: "w-3 h-3 mr-1" }), "Try Again"] }))] })] }) })), (status === 'pending' || status === 'broadcast') && (_jsxs("div", { className: "text-xs text-muted-foreground border-t pt-2 space-y-1", children: [_jsxs("p", { children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Tip:" }), " Stacks transactions are anchored to Bitcoin blocks"] }), _jsx("p", { children: "\u23F1\uFE0F Average confirmation: 10-15 minutes (~1 Bitcoin block)" }), _jsx("p", { children: "\uD83D\uDD0D Track progress on Stacks Explorer for real-time updates" })] }))] })] }));
};
export default TransactionStatusTracker;
/**
 * Hook for managing transaction state
 * Usage example:
 *
 * const { txId, status, setTransaction } = useTransactionStatus();
 *
 * // After calling contract
 * setTransaction(txId, 'broadcast');
 *
 * // Poll for confirmation
 * pollTransactionStatus(txId).then(() => setTransaction(txId, 'success'));
 */
export function useTransactionStatus() {
    const [txId, setTxId] = useState(null);
    const [status, setStatus] = useState('pending');
    const setTransaction = (newTxId, newStatus) => {
        setTxId(newTxId);
        setStatus(newStatus);
    };
    const reset = () => {
        setTxId(null);
        setStatus('pending');
    };
    return {
        txId,
        status,
        setTransaction,
        reset,
    };
}
