import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowDownUp, TrendingUp, Zap, Shield, AlertCircle, CheckCircle2, RefreshCw, Coins } from 'lucide-react';
const mockSwapRoutes = [
    {
        aggregator: '1inch',
        fromToken: 'USDC',
        toToken: 'sBTC',
        fromAmount: 50000,
        toAmount: 0.8125,
        rate: 61538,
        fee: 0.3,
        estimatedTime: '~2 minutes',
        slippage: 0.5,
        liquidity: 'High'
    },
    {
        aggregator: 'ParaSwap',
        fromToken: 'USDC',
        toToken: 'sBTC',
        fromAmount: 50000,
        toAmount: 0.8098,
        rate: 61728,
        fee: 0.4,
        estimatedTime: '~3 minutes',
        slippage: 0.8,
        liquidity: 'Medium'
    },
    {
        aggregator: 'CoW Swap',
        fromToken: 'USDC',
        toToken: 'sBTC',
        fromAmount: 50000,
        toAmount: 0.8142,
        rate: 61424,
        fee: 0.25,
        estimatedTime: '~5 minutes',
        slippage: 0.3,
        liquidity: 'High'
    },
];
const supportedTokens = [
    { symbol: 'sBTC', name: 'Stacked Bitcoin', icon: '₿', color: 'orange' },
    { symbol: 'STX', name: 'Stacks', icon: 'Ⓢ', color: 'purple' },
    { symbol: 'USDC', name: 'USD Coin', icon: '$', color: 'blue' },
    { symbol: 'USDT', name: 'Tether', icon: '$', color: 'green' },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'indigo' },
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: 'orange' },
];
export const CrossChainSwapPreview = () => {
    const [fromToken, setFromToken] = useState('USDC');
    const [toToken, setToToken] = useState('sBTC');
    const [amount, setAmount] = useState('50000');
    const [isLoading, setIsLoading] = useState(false);
    const handleRefreshRates = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1500);
    };
    const bestRoute = mockSwapRoutes[0]; // Highest toAmount
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("h1", { className: "text-4xl font-bold mb-2 flex items-center gap-3", children: [_jsx(Coins, { className: "w-10 h-10 text-blue-600" }), "Cross-Chain Multi-Asset Swaps"] }), _jsx("p", { className: "text-muted-foreground text-lg", children: "Best rates aggregated from leading DEXs and liquidity providers" })] }), _jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Swap Tokens" }), _jsx(CardDescription, { children: "Convert between assets with the best available rates" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "from-token", children: "From" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("select", { id: "from-token", value: fromToken, onChange: (e) => setFromToken(e.target.value), className: "w-1/3 p-3 border rounded-lg font-semibold", children: supportedTokens.map((token) => (_jsxs("option", { value: token.symbol, children: [token.icon, " ", token.symbol] }, token.symbol))) }), _jsx(Input, { type: "number", value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "0.00", className: "flex-1 text-2xl font-bold" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Balance: 125,432.50 USDC" })] }), _jsx("div", { className: "flex justify-center", children: _jsx(Button, { variant: "outline", size: "icon", className: "rounded-full", onClick: () => {
                                                        const temp = fromToken;
                                                        setFromToken(toToken);
                                                        setToToken(temp);
                                                    }, children: _jsx(ArrowDownUp, { className: "w-5 h-5" }) }) }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "to-token", children: "To (estimated)" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("select", { id: "to-token", value: toToken, onChange: (e) => setToToken(e.target.value), className: "w-1/3 p-3 border rounded-lg font-semibold", children: supportedTokens.map((token) => (_jsxs("option", { value: token.symbol, children: [token.icon, " ", token.symbol] }, token.symbol))) }), _jsx("div", { className: "flex-1 p-3 border rounded-lg", children: _jsx("p", { className: "text-2xl font-bold", children: bestRoute.toAmount }) })] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["1 ", fromToken, " = ", bestRoute.rate.toFixed(2), " ", toToken] })] }), _jsxs("div", { className: "p-4 bg-blue-50 rounded-lg space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Best Rate From" }), _jsx("span", { className: "font-semibold", children: bestRoute.aggregator })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Network Fee" }), _jsxs("span", { className: "font-semibold", children: ["$", bestRoute.fee] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Max Slippage" }), _jsxs("span", { className: "font-semibold", children: [bestRoute.slippage, "%"] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Estimated Time" }), _jsx("span", { className: "font-semibold", children: bestRoute.estimatedTime })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { className: "flex-1 bg-gradient-to-r from-blue-600 to-purple-600", size: "lg", children: [_jsx(Zap, { className: "w-5 h-5 mr-2" }), "Swap Now"] }), _jsx(Button, { variant: "outline", size: "lg", onClick: handleRefreshRates, disabled: isLoading, children: _jsx(RefreshCw, { className: `w-5 h-5 ${isLoading ? 'animate-spin' : ''}` }) })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Rate Comparison" }), _jsx(CardDescription, { children: "Live rates from multiple aggregators" })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: handleRefreshRates, children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}` }), "Refresh"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: mockSwapRoutes.map((route, idx) => (_jsx(Card, { className: `${idx === 0 ? 'border-green-500 border-2' : ''}`, children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold", children: route.aggregator.charAt(0) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: route.aggregator }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Liquidity: ", route.liquidity] })] })] }), idx === 0 && (_jsxs(Badge, { className: "bg-green-600", children: [_jsx(CheckCircle2, { className: "w-3 h-3 mr-1" }), "Best Rate"] }))] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "You Get" }), _jsxs("p", { className: "font-bold", children: [route.toAmount, " ", toToken] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Fee" }), _jsxs("p", { className: "font-bold", children: ["$", route.fee] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Time" }), _jsx("p", { className: "font-bold", children: route.estimatedTime })] })] })] }) }, idx))) }) })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "bg-gradient-to-br from-blue-50 to-purple-50", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-blue-600" }), "Why Cross-Chain Swaps?"] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(CheckCircle2, { className: "w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-sm", children: "Best Rates" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Aggregated from top DEXs and liquidity pools" })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(CheckCircle2, { className: "w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-sm", children: "Multi-Chain Support" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Seamless swaps across Bitcoin, Ethereum, and more" })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(CheckCircle2, { className: "w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-sm", children: "Low Slippage" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Smart routing minimizes price impact" })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(CheckCircle2, { className: "w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-sm", children: "Fast Execution" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Swaps complete in minutes, not hours" })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "w-5 h-5 text-blue-600" }), "Security Features"] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-green-600" }), _jsx("span", { children: "Audited smart contracts" })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-green-600" }), _jsx("span", { children: "MEV protection enabled" })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-green-600" }), _jsx("span", { children: "Slippage protection" })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-green-600" }), _jsx("span", { children: "Non-custodial swaps" })] })] })] }), _jsx(Card, { className: "bg-orange-50 border-orange-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-orange-600 flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-sm mb-1", children: "Note" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "This is a preview UI mockup. Full cross-chain integration requires bridge oracle contracts and liquidity provider partnerships." })] })] }) }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Supported Networks" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Badge, { variant: "outline", children: "Bitcoin" }), _jsx(Badge, { variant: "outline", children: "Stacks" }), _jsx(Badge, { variant: "outline", children: "Ethereum" }), _jsx(Badge, { variant: "outline", children: "Polygon" }), _jsx(Badge, { variant: "outline", children: "Avalanche" }), _jsx(Badge, { variant: "outline", children: "Cosmos" })] }) })] })] })] })] }));
};
export default CrossChainSwapPreview;
