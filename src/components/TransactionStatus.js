import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Loader2, XCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { getErrorActionText, canRetryTransaction } from '@/lib/blockchainErrorHandler';
export function TransactionStatus({ state, txId, error, title = 'Transaction Status', successMessage = 'Transaction completed successfully', pendingMessage = 'Transaction pending...', onRetry, onClose, explorerUrl = 'https://explorer.hiro.so/txid' }) {
    if (state === 'idle')
        return null;
    const getStatusIcon = () => {
        switch (state) {
            case 'pending':
                return _jsx(Loader2, { className: "w-12 h-12 text-blue-600 animate-spin" });
            case 'success':
                return _jsx(CheckCircle2, { className: "w-12 h-12 text-green-600" });
            case 'error':
                return _jsx(XCircle, { className: "w-12 h-12 text-red-600" });
            default:
                return _jsx(Clock, { className: "w-12 h-12 text-gray-400" });
        }
    };
    const getStatusBadge = () => {
        switch (state) {
            case 'pending':
                return _jsx(Badge, { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200", children: "Pending" });
            case 'success':
                return _jsx(Badge, { variant: "outline", className: "bg-green-50 text-green-700 border-green-200", children: "Success" });
            case 'error':
                return _jsx(Badge, { variant: "outline", className: "bg-red-50 text-red-700 border-red-200", children: "Failed" });
            default:
                return null;
        }
    };
    return (_jsxs(Card, { className: "border-2", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: title }), getStatusBadge()] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col items-center justify-center py-6", children: [getStatusIcon(), state === 'pending' && (_jsxs("div", { className: "text-center mt-4", children: [_jsx("p", { className: "font-semibold mb-2", children: pendingMessage }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Please confirm the transaction in your wallet and wait for blockchain confirmation" })] })), state === 'success' && (_jsxs("div", { className: "text-center mt-4", children: [_jsx("p", { className: "font-semibold text-green-700 mb-2", children: successMessage }), txId && (_jsxs("div", { className: "mt-3", children: [_jsxs("a", { href: `${explorerUrl}/${txId}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline", children: ["View on Explorer", _jsx(ExternalLink, { className: "w-4 h-4" })] }), _jsx("div", { className: "mt-2 text-xs text-muted-foreground font-mono bg-gray-50 p-2 rounded break-all", children: txId })] }))] })), state === 'error' && error && (_jsxs("div", { className: "text-center mt-4 space-y-3 w-full", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-red-700 mb-2", children: "Transaction Failed" }), _jsx("p", { className: "text-sm text-muted-foreground", children: error.message })] }), error.technicalDetails && (_jsxs("details", { className: "text-xs text-left", children: [_jsx("summary", { className: "cursor-pointer text-muted-foreground hover:text-foreground", children: "Technical details" }), _jsx("div", { className: "mt-2 p-2 bg-gray-50 rounded font-mono break-all", children: error.technicalDetails })] })), canRetryTransaction(error) && onRetry && (_jsxs(Button, { onClick: onRetry, variant: "outline", className: "w-full", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), getErrorActionText(error)] }))] }))] }), (state === 'success' || state === 'error') && onClose && (_jsx("div", { className: "pt-4 border-t", children: _jsx(Button, { onClick: onClose, variant: "outline", className: "w-full", children: "Close" }) }))] })] }));
}
export default TransactionStatus;
