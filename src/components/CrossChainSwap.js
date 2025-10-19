import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownUp, Coins, Zap, AlertCircle, TrendingUp } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
const CrossChainSwap = () => {
    const { isConnected } = useWalletStore();
    const [fromToken, setFromToken] = useState('STX');
    const [toToken, setToToken] = useState('BTC');
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [fromChain, setFromChain] = useState('stacks');
    const [toChain, setToChain] = useState('bitcoin');
    const [loading, setLoading] = useState(false);
    const tokens = [
        { symbol: 'STX', name: 'Stacks', balance: 1250.50, icon: '🔷' },
        { symbol: 'BTC', name: 'Bitcoin', balance: 0.5, icon: '₿' },
        { symbol: 'sBTC', name: 'Stacks Bitcoin', balance: 0.25, icon: '🟠' },
        { symbol: 'USDC', name: 'USD Coin', balance: 5000, icon: '💵' },
        { symbol: 'ETH', name: 'Ethereum', balance: 2.5, icon: '⟠' }
    ];
    const chains = [
        { name: 'stacks', icon: '🔷', status: 'active' },
        { name: 'bitcoin', icon: '₿', status: 'active' },
        { name: 'ethereum', icon: '⟠', status: 'active' },
        { name: 'polygon', icon: '🟣', status: 'active' }
    ];
    const calculateSwap = (amount) => {
        if (!amount || isNaN(parseFloat(amount))) {
            setToAmount('');
            return;
        }
        // Mock exchange rate calculation
        const rates = {
            'STX-BTC': 0.00002,
            'BTC-STX': 50000,
            'STX-sBTC': 0.00002,
            'sBTC-STX': 50000,
            'STX-USDC': 1.2,
            'USDC-STX': 0.833,
            'BTC-ETH': 15.5,
            'ETH-BTC': 0.0645
        };
        const rateKey = `${fromToken}-${toToken}`;
        const rate = rates[rateKey] || 1;
        const fee = 0.005; // 0.5% fee
        const result = parseFloat(amount) * rate * (1 - fee);
        setToAmount(result.toFixed(6));
    };
    const executeSwap = async () => {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }
        if (!fromAmount || !toAmount) {
            alert('Please enter an amount');
            return;
        }
        try {
            setLoading(true);
            // In production, call smart contract:
            // await callPublicFunction({
            //   contractName: 'payment-router',
            //   functionName: 'execute-cross-chain-payment',
            //   functionArgs: [...]
            // });
            alert(`Swap successful! ${fromAmount} ${fromToken} → ${toAmount} ${toToken}`);
            setFromAmount('');
            setToAmount('');
        }
        catch (error) {
            console.error('Swap failed:', error);
            alert('Swap failed: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    };
    const switchTokens = () => {
        const tempToken = fromToken;
        const tempAmount = fromAmount;
        const tempChain = fromChain;
        setFromToken(toToken);
        setToToken(tempToken);
        setFromAmount(toAmount);
        setToAmount(tempAmount);
        setFromChain(toChain);
        setToChain(tempChain);
    };
    return (_jsxs("div", { className: "container mx-auto px-4 py-8 max-w-4xl", children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsxs("h1", { className: "text-4xl font-bold mb-2 flex items-center justify-center gap-3", children: [_jsx(Coins, { className: "w-10 h-10 text-blue-600" }), "Cross-Chain Swap"] }), _jsx("p", { className: "text-muted-foreground text-lg", children: "Seamless multi-asset payments across blockchains" })] }), _jsxs("div", { className: "grid md:grid-cols-3 gap-4 mb-8", children: [_jsx(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-blue-700", children: "24h Volume" }), _jsx("p", { className: "text-2xl font-bold text-blue-900", children: "$1.2M" })] }), _jsx(TrendingUp, { className: "w-10 h-10 text-blue-400" })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-green-700", children: "Supported Chains" }), _jsx("p", { className: "text-2xl font-bold text-green-900", children: chains.length })] }), _jsx(Zap, { className: "w-10 h-10 text-green-400" })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-purple-700", children: "Avg Fee" }), _jsx("p", { className: "text-2xl font-bold text-purple-900", children: "0.5%" })] }), _jsx(Coins, { className: "w-10 h-10 text-purple-400" })] }) }) })] }), _jsxs(Card, { className: "mb-6", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Swap Tokens" }), _jsx(CardDescription, { children: "Exchange assets across different blockchains" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: "From" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs(Select, { value: fromChain, onValueChange: setFromChain, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: chains.map((chain) => (_jsx(SelectItem, { value: chain.name, children: _jsxs("span", { className: "flex items-center gap-2", children: [chain.icon, " ", chain.name.charAt(0).toUpperCase() + chain.name.slice(1)] }) }, chain.name))) })] }), _jsxs(Select, { value: fromToken, onValueChange: setFromToken, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: tokens.map((token) => (_jsx(SelectItem, { value: token.symbol, children: _jsxs("span", { className: "flex items-center gap-2", children: [token.icon, " ", token.symbol] }) }, token.symbol))) })] })] }), _jsxs("div", { className: "relative", children: [_jsx(Input, { type: "number", placeholder: "0.00", value: fromAmount, onChange: (e) => {
                                                    setFromAmount(e.target.value);
                                                    calculateSwap(e.target.value);
                                                }, step: "0.000001", className: "text-2xl h-16 pr-20" }), _jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2", children: _jsxs(Badge, { variant: "outline", children: ["Balance: ", tokens.find(t => t.symbol === fromToken)?.balance.toFixed(4)] }) })] })] }), _jsx("div", { className: "flex justify-center", children: _jsx(Button, { variant: "outline", size: "icon", className: "rounded-full w-12 h-12", onClick: switchTokens, children: _jsx(ArrowDownUp, { className: "w-6 h-6" }) }) }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: "To" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs(Select, { value: toChain, onValueChange: setToChain, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: chains.map((chain) => (_jsx(SelectItem, { value: chain.name, children: _jsxs("span", { className: "flex items-center gap-2", children: [chain.icon, " ", chain.name.charAt(0).toUpperCase() + chain.name.slice(1)] }) }, chain.name))) })] }), _jsxs(Select, { value: toToken, onValueChange: setToToken, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: tokens.map((token) => (_jsx(SelectItem, { value: token.symbol, children: _jsxs("span", { className: "flex items-center gap-2", children: [token.icon, " ", token.symbol] }) }, token.symbol))) })] })] }), _jsx("div", { className: "relative", children: _jsx(Input, { type: "number", placeholder: "0.00", value: toAmount, readOnly: true, className: "text-2xl h-16 bg-muted" }) })] }), fromAmount && toAmount && (_jsxs("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Exchange Rate:" }), _jsxs("span", { className: "font-semibold", children: ["1 ", fromToken, " = ", (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6), " ", toToken] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Fee (0.5%):" }), _jsxs("span", { className: "font-semibold", children: [(parseFloat(fromAmount) * 0.005).toFixed(6), " ", fromToken] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Estimated Time:" }), _jsx("span", { className: "font-semibold", children: "~2-5 minutes" })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Route:" }), _jsxs("span", { className: "font-semibold text-xs", children: [fromChain, " \u2192 Bridge \u2192 ", toChain] })] })] })), _jsx(Button, { className: "w-full h-14 text-lg", onClick: executeSwap, disabled: !fromAmount || !toAmount || loading, children: loading ? 'Swapping...' : `Swap ${fromToken} → ${toToken}` })] })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsx(Card, { className: "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Zap, { className: "w-6 h-6 text-blue-600 flex-shrink-0 mt-1" }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold mb-1", children: "Fast & Secure" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Powered by trusted bridge protocols with instant settlement and low fees" })] })] }) }) }), _jsx(Card, { className: "bg-gradient-to-r from-green-50 to-blue-50 border-green-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Coins, { className: "w-6 h-6 text-green-600 flex-shrink-0 mt-1" }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold mb-1", children: "Multi-Chain Support" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Swap between Stacks, Bitcoin, Ethereum, and more blockchains" })] })] }) }) })] }), !isConnected && (_jsx(Card, { className: "mt-6 bg-yellow-50 border-yellow-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(AlertCircle, { className: "w-6 h-6 text-yellow-600" }), _jsx("p", { className: "text-yellow-800", children: "Connect your wallet to start swapping tokens" })] }) }) }))] }));
};
export default CrossChainSwap;
