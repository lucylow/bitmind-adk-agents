import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, TrendingUp, Shield, DollarSign, Percent, Clock } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
const YieldOptimizer = () => {
    const { isConnected } = useWalletStore();
    const [amount, setAmount] = useState('');
    const [selectedStrategy, setSelectedStrategy] = useState('');
    const [loading, setLoading] = useState(false);
    const strategies = [
        {
            name: 'conservative',
            apy: 7.5,
            riskLevel: 2,
            minLockup: 1000,
            description: 'Low-risk stable coin farming with established protocols',
            tvl: 250000
        },
        {
            name: 'balanced',
            apy: 12.8,
            riskLevel: 5,
            minLockup: 500,
            description: 'Mixed strategy with diversified yield opportunities',
            tvl: 320000
        },
        {
            name: 'aggressive',
            apy: 25.3,
            riskLevel: 8,
            minLockup: 100,
            description: 'High-yield farming with premium DeFi protocols',
            tvl: 190000
        }
    ];
    const createYieldPosition = async () => {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }
        if (!amount || !selectedStrategy) {
            alert('Please enter amount and select strategy');
            return;
        }
        try {
            setLoading(true);
            // In production, call smart contract:
            // await callPublicFunction({
            //   contractName: 'yield-escrow',
            //   functionName: 'create-yield-position',
            //   functionArgs: [...]
            // });
            alert(`Yield position created successfully! Expected APY: ${strategies.find(s => s.name === selectedStrategy)?.apy}%`);
            setAmount('');
            setSelectedStrategy('');
        }
        catch (error) {
            console.error('Failed to create position:', error);
            alert('Failed to create position: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    };
    const calculateProjectedYield = (principal, apy, days) => {
        return (principal * (apy / 100) * (days / 365)).toFixed(2);
    };
    const getRiskColor = (level) => {
        if (level <= 3)
            return 'text-green-600 bg-green-100';
        if (level <= 6)
            return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };
    const getRiskLabel = (level) => {
        if (level <= 3)
            return 'Low Risk';
        if (level <= 6)
            return 'Medium Risk';
        return 'High Risk';
    };
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("h1", { className: "text-4xl font-bold mb-2 flex items-center gap-3", children: [_jsx(Zap, { className: "w-10 h-10 text-yellow-500" }), "Yield Optimizer"] }), _jsx("p", { className: "text-muted-foreground text-lg", children: "Earn 7-25% APY on escrowed funds with automated yield strategies" })] }), _jsxs("div", { className: "grid md:grid-cols-4 gap-4 mb-8", children: [_jsx(Card, { className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-green-700", children: "Total TVL" }), _jsx("p", { className: "text-3xl font-bold text-green-900", children: "$760K" })] }), _jsx(DollarSign, { className: "w-12 h-12 text-green-400" })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-blue-700", children: "Avg APY" }), _jsx("p", { className: "text-3xl font-bold text-blue-900", children: "15.2%" })] }), _jsx(Percent, { className: "w-12 h-12 text-blue-400" })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-purple-700", children: "Active Positions" }), _jsx("p", { className: "text-3xl font-bold text-purple-900", children: "124" })] }), _jsx(TrendingUp, { className: "w-12 h-12 text-purple-400" })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-orange-700", children: "Total Earned" }), _jsx("p", { className: "text-3xl font-bold text-orange-900", children: "$42.8K" })] }), _jsx(Zap, { className: "w-12 h-12 text-orange-400" })] }) }) })] }), _jsxs("div", { className: "grid md:grid-cols-3 gap-6 mb-8", children: [_jsxs(Card, { className: "md:col-span-1", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Create Yield Position" }), _jsx(CardDescription, { children: "Start earning passive income" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Amount (sBTC)" }), _jsx(Input, { type: "number", placeholder: "0.00", value: amount, onChange: (e) => setAmount(e.target.value), step: "0.01" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Strategy" }), _jsxs(Select, { value: selectedStrategy, onValueChange: setSelectedStrategy, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select strategy" }) }), _jsx(SelectContent, { children: strategies.map((strategy) => (_jsxs(SelectItem, { value: strategy.name, children: [strategy.name.charAt(0).toUpperCase() + strategy.name.slice(1), " - ", strategy.apy, "% APY"] }, strategy.name))) })] })] }), amount && selectedStrategy && (_jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-2", children: "Projected Earnings (30 days)" }), _jsxs("p", { className: "text-2xl font-bold text-green-600", children: [calculateProjectedYield(parseFloat(amount), strategies.find(s => s.name === selectedStrategy)?.apy || 0, 30), " sBTC"] })] })), _jsx(Button, { className: "w-full", onClick: createYieldPosition, disabled: !amount || !selectedStrategy || loading, children: loading ? 'Creating...' : 'Create Position' })] })] }), strategies.map((strategy) => (_jsxs(Card, { className: `cursor-pointer transition-all hover:shadow-lg ${selectedStrategy === strategy.name ? 'ring-2 ring-purple-600' : ''}`, onClick: () => setSelectedStrategy(strategy.name), children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(CardTitle, { className: "capitalize", children: strategy.name }), _jsx(Badge, { className: getRiskColor(strategy.riskLevel), children: getRiskLabel(strategy.riskLevel) })] }), _jsx(CardDescription, { children: strategy.description })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Percent, { className: "w-6 h-6 text-green-600" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "APY" })] }), _jsxs("span", { className: "text-3xl font-bold text-green-600", children: [strategy.apy, "%"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Min Lockup:" }), _jsxs("span", { className: "font-semibold", children: ["$", strategy.minLockup] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Risk Level:" }), _jsxs("span", { className: "font-semibold", children: [strategy.riskLevel, "/10"] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "TVL:" }), _jsxs("span", { className: "font-semibold", children: ["$", (strategy.tvl / 1000).toFixed(0), "K"] })] })] }), _jsxs("div", { className: "pt-4 border-t", children: [_jsxs("h4", { className: "text-sm font-semibold mb-2 flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4" }), "Example Returns"] }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "30 days (1 sBTC):" }), _jsxs("span", { className: "text-green-600 font-semibold", children: ["+", calculateProjectedYield(1, strategy.apy, 30), " sBTC"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "90 days (1 sBTC):" }), _jsxs("span", { className: "text-green-600 font-semibold", children: ["+", calculateProjectedYield(1, strategy.apy, 90), " sBTC"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "1 year (1 sBTC):" }), _jsxs("span", { className: "text-green-600 font-semibold", children: ["+", calculateProjectedYield(1, strategy.apy, 365), " sBTC"] })] })] })] })] })] }, strategy.name)))] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Your Active Positions" }), _jsx(CardDescription, { children: "Manage your yield farming positions" })] }), _jsx(CardContent, { children: isConnected ? (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No active positions. Create one above to start earning!" })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Shield, { className: "w-12 h-12 mx-auto mb-4 text-muted-foreground" }), _jsx("p", { className: "text-muted-foreground", children: "Connect your wallet to view positions" })] })) })] })] }));
};
export default YieldOptimizer;
