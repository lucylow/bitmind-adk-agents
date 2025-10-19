import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Copy, Check, ExternalLink, Zap, Shield, Wallet } from 'lucide-react';
import { DEMO_INVOICES, DEMO_INVOICE_TEXT, getRandomDemoInvoice, formatSatoshis, estimateUsdValue, DEMO_ADDRESSES } from '@/lib/demoData';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog';
const DemoModeButton = ({ onLoadDemo, variant = 'button' }) => {
    const [copied, setCopied] = useState(null);
    const [selectedDemo, setSelectedDemo] = useState(DEMO_INVOICES[0]);
    const { toast } = useToast();
    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        toast({
            title: '✓ Copied to clipboard',
            description: `${label} copied successfully`,
        });
        setTimeout(() => setCopied(null), 2000);
    };
    const handleLoadDemo = (demo = selectedDemo) => {
        if (onLoadDemo) {
            onLoadDemo(demo);
        }
        toast({
            title: '🎉 Demo Loaded',
            description: `Invoice #${demo.invoice_id} loaded successfully`,
        });
    };
    const handleQuickLoad = () => {
        const randomDemo = getRandomDemoInvoice();
        setSelectedDemo(randomDemo);
        handleLoadDemo(randomDemo);
    };
    if (variant === 'card') {
        return (_jsxs(Card, { className: "border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-5 h-5 text-purple-600" }), "One-Click Demo Mode"] }), _jsx(CardDescription, { children: "Instantly load realistic test data for quick evaluation" })] }), _jsx(Badge, { variant: "secondary", className: "bg-purple-600 text-white", children: "Hackathon Feature" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs(Button, { onClick: handleQuickLoad, className: "bg-gradient-to-r from-purple-600 to-pink-600", children: [_jsx(Sparkles, { className: "w-4 h-4 mr-2" }), "Load Random Invoice"] }), _jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Choose Demo"] }) }), _jsxs(DialogContent, { className: "max-w-3xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Select Demo Invoice" }), _jsx(DialogDescription, { children: "Choose from pre-configured realistic invoices" })] }), _jsx("div", { className: "space-y-3 mt-4", children: DEMO_INVOICES.map((demo) => (_jsx(Card, { className: `cursor-pointer transition-all hover:shadow-lg ${selectedDemo.invoice_id === demo.invoice_id
                                                                ? 'border-2 border-purple-600 bg-purple-50'
                                                                : 'border-gray-200'}`, onClick: () => {
                                                                setSelectedDemo(demo);
                                                                handleLoadDemo(demo);
                                                            }, children: _jsx(CardContent, { className: "pt-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: "outline", children: ["#", demo.invoice_id] }), _jsx("span", { className: "text-sm font-semibold", children: demo.dao_name })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: demo.milestone_description }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(Wallet, { className: "w-3 h-3" }), "Payee: ", demo.payee.slice(0, 10), "..."] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-lg font-bold text-purple-600", children: formatSatoshis(demo.amount) }), _jsx("p", { className: "text-xs text-muted-foreground", children: estimateUsdValue(demo.amount) })] })] }) }) }, demo.invoice_id))) })] })] })] }), _jsxs("div", { className: "p-3 bg-white rounded-lg border", children: [_jsxs("h4", { className: "text-sm font-semibold mb-2 flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4" }), "Demo Addresses (Testnet)"] }), _jsxs("div", { className: "space-y-1 text-xs", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Sample Payee (Alice):" }), _jsxs("button", { onClick: () => handleCopy(DEMO_ADDRESSES.alice, 'Address'), className: "flex items-center gap-1 hover:text-purple-600 font-mono", children: [DEMO_ADDRESSES.alice.slice(0, 12), "...", copied === 'Address' ? (_jsx(Check, { className: "w-3 h-3 text-green-600" })) : (_jsx(Copy, { className: "w-3 h-3" }))] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Sample Arbiter:" }), _jsxs("button", { onClick: () => handleCopy(DEMO_ADDRESSES.neutral_arbiter, 'Arbiter'), className: "flex items-center gap-1 hover:text-purple-600 font-mono", children: [DEMO_ADDRESSES.neutral_arbiter.slice(0, 12), "...", copied === 'Arbiter' ? (_jsx(Check, { className: "w-3 h-3 text-green-600" })) : (_jsx(Copy, { className: "w-3 h-3" }))] })] })] })] }), _jsxs("div", { className: "p-3 bg-white rounded-lg border", children: [_jsx("h4", { className: "text-sm font-semibold mb-2", children: "Sample Invoice Text (for AI Demo)" }), _jsxs("div", { className: "relative", children: [_jsxs("pre", { className: "text-xs p-2 bg-gray-50 rounded overflow-x-auto whitespace-pre-wrap", children: [DEMO_INVOICE_TEXT.slice(0, 200), "..."] }), _jsx(Button, { size: "sm", variant: "ghost", className: "absolute top-2 right-2", onClick: () => handleCopy(DEMO_INVOICE_TEXT, 'Invoice text'), children: copied === 'Invoice text' ? (_jsx(Check, { className: "w-3 h-3 text-green-600" })) : (_jsx(Copy, { className: "w-3 h-3" })) })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: () => window.open('https://explorer.stacks.co/sandbox/faucet?chain=testnet', '_blank'), children: [_jsx(ExternalLink, { className: "w-3 h-3 mr-1" }), "Get Testnet STX"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: () => window.open('https://docs.stacks.co', '_blank'), children: [_jsx(ExternalLink, { className: "w-3 h-3 mr-1" }), "Stacks Docs"] })] })] }) })] }));
    }
    // Button variant
    return (_jsxs(Button, { onClick: handleQuickLoad, className: "bg-gradient-to-r from-purple-600 to-pink-600", children: [_jsx(Sparkles, { className: "w-4 h-4 mr-2" }), "Load Demo Data"] }));
};
export default DemoModeButton;
