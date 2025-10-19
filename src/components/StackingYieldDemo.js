import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Percent, Clock, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
/**
 * Stacking Yield Demo Component
 * Showcases how DAOs can earn yield on escrowed invoice funds using Stacking
 *
 * Based on Stacking DAO's immediate yield feature
 * Reference: https://stackingdao.com
 */
export const StackingYieldDemo = () => {
    const [yieldPositions, setYieldPositions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    // Calculate projected yield for escrowed funds
    const calculateYield = async (amount, durationDays = 30) => {
        const apy = 0.085; // 8.5% APY from Stacking DAO
        const dailyRate = apy / 365;
        const projectedYield = amount * dailyRate * durationDays;
        return Math.floor(projectedYield);
    };
    const createYieldPosition = async (invoiceId, amount) => {
        setIsLoading(true);
        try {
            const projectedYield = await calculateYield(amount);
            const newPosition = {
                id: `yield-${Date.now()}`,
                invoiceId,
                principal: amount,
                projectedYield,
                apy: 8.5,
                startTime: new Date().toISOString(),
                token: 'stSTX', // Stacking DAO receipt token
                status: 'active'
            };
            setYieldPositions(prev => [...prev, newPosition]);
            toast({
                title: '✅ Yield Position Created',
                description: `Earning ${(projectedYield / 100000000).toFixed(6)} sBTC @ 8.5% APY`,
            });
            console.log('Creating yield position on Stacking DAO...', {
                invoiceId,
                amount,
                projectedYield
            });
            return newPosition;
        }
        catch (error) {
            console.error('Failed to create yield position:', error);
            toast({
                title: '❌ Failed to Create Position',
                description: 'Please try again later',
                variant: 'destructive',
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const harvestYield = async (positionId) => {
        const position = yieldPositions.find(p => p.id === positionId);
        if (!position)
            return;
        setYieldPositions(prev => prev.map(p => p.id === positionId
            ? { ...p, status: 'harvested', harvestedAt: new Date().toISOString() }
            : p));
        toast({
            title: '🎉 Yield Harvested',
            description: `+${(position.projectedYield / 100000000).toFixed(6)} sBTC claimed`,
        });
    };
    // Demo treasury data
    const treasuryData = {
        totalEscrowed: 250000000, // 2.5 sBTC
        activeYield: yieldPositions
            .filter(p => p.status === 'active')
            .reduce((sum, p) => sum + p.projectedYield, 0),
        projectedAnnualYield: 21250000, // 0.2125 sBTC at 8.5% APY
        apy: 8.5
    };
    const formatBTC = (satoshis) => {
        return (satoshis / 100000000).toFixed(8).replace(/\.?0+$/, '');
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-green-600" }), "DAO Treasury Yield Optimization"] }), _jsx(CardDescription, { children: "Earn passive income on escrowed invoice funds via Stacking" })] }), _jsx(Badge, { className: "bg-green-600", children: "Powered by Stacking DAO" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-lg border border-green-200", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground mb-1", children: [_jsx(DollarSign, { className: "w-4 h-4" }), "Total Escrowed"] }), _jsxs("div", { className: "text-2xl font-bold text-green-600", children: [formatBTC(treasuryData.totalEscrowed), " sBTC"] }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "\u2248 $153,750 USD" })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg border border-green-200", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground mb-1", children: [_jsx(ArrowUpRight, { className: "w-4 h-4" }), "Active Yield"] }), _jsxs("div", { className: "text-2xl font-bold text-emerald-600", children: ["+", formatBTC(treasuryData.activeYield), " sBTC"] }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Accruing daily" })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg border border-green-200", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground mb-1", children: [_jsx(Percent, { className: "w-4 h-4" }), "Projected APY"] }), _jsxs("div", { className: "text-2xl font-bold text-green-600", children: [treasuryData.apy, "%"] }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["~", formatBTC(treasuryData.projectedAnnualYield), " sBTC/year"] })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Active Yield Positions" }), _jsx(CardDescription, { children: "Invoice escrow funds earning passive income via Bitcoin Stacking" })] }), _jsx(CardContent, { children: yieldPositions.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(TrendingUp, { className: "w-8 h-8 text-gray-400" }) }), _jsx("p", { className: "text-muted-foreground mb-4", children: "No active yield positions yet" }), _jsx(Button, { onClick: () => createYieldPosition('demo-2025-001', 50000000), disabled: isLoading, className: "bg-green-600 hover:bg-green-700", children: isLoading ? 'Creating...' : '🚀 Start Demo Yield Position (0.5 sBTC)' })] })) : (_jsxs("div", { className: "space-y-3", children: [yieldPositions.map(position => (_jsx(Card, { className: "border-green-200 bg-green-50/50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsx("div", { className: "flex items-start justify-between mb-3", children: _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsxs("span", { className: "font-semibold", children: ["Invoice #", position.invoiceId] }), _jsx(Badge, { variant: position.status === 'active' ? 'default' : 'secondary', className: position.status === 'active' ? 'bg-green-600' : '', children: position.status })] }), _jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3" }), "Started ", new Date(position.startTime).toLocaleDateString()] })] }) }), _jsxs("div", { className: "grid grid-cols-3 gap-3 mb-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Principal" }), _jsxs("div", { className: "font-semibold", children: [formatBTC(position.principal), " sBTC"] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Projected Yield (30d)" }), _jsxs("div", { className: "font-semibold text-green-600", children: ["+", formatBTC(position.projectedYield), " sBTC"] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "APY" }), _jsxs("div", { className: "font-semibold", children: [position.apy, "%"] })] })] }), position.status === 'active' && (_jsxs(Button, { onClick: () => harvestYield(position.id), size: "sm", className: "w-full bg-green-600 hover:bg-green-700", children: [_jsx(TrendingUp, { className: "w-4 h-4 mr-2" }), "Harvest Yield"] })), position.status === 'harvested' && (_jsxs("div", { className: "text-sm text-green-600 text-center py-2 bg-green-100 rounded", children: ["\u2713 Harvested on ", new Date(position.harvestedAt).toLocaleDateString()] }))] }) }, position.id))), _jsx(Button, { onClick: () => createYieldPosition(`demo-${Date.now()}`, 75000000), disabled: isLoading, variant: "outline", className: "w-full", children: "+ Add Another Position (0.75 sBTC)" })] })) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Stacking DAO Integration" }), _jsx(CardDescription, { children: "How BitMind integrates with Stacking DAO for yield optimization" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto", children: _jsx("pre", { className: "text-xs", children: _jsx("code", { children: `// Stack yield from invoice escrow
import { makeContractCall, uintCV } from '@stacks/transactions';

const stackInvoiceYield = async (invoiceId: number, amount: number) => {
  // Convert sBTC to STX for stacking (via DEX or wrapper)
  const stxAmount = await convertSBTCtoSTX(amount);
  
  // Deposit to Stacking DAO
  const contractCall = await makeContractCall({
    contractAddress: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG',
    contractName: 'stacking-dao-core-v1',
    functionName: 'deposit-stx',
    functionArgs: [uintCV(stxAmount)],
    postConditions: [
      makeStandardSTXPostCondition(
        senderAddress, 
        FungibleConditionCode.Equal, 
        stxAmount
      )
    ],
    network: NETWORK,
    anchorMode: AnchorMode.Any,
  });
  
  // Receive stSTX (liquid staking token)
  // 1 stSTX ≈ 1 STX + accrued stacking rewards
  // Tradeable, composable, immediate liquidity
  
  return contractCall;
};

// Harvest yield when invoice milestone completes
const harvestYieldOnRelease = async (invoiceId: number) => {
  // Withdraw principal + yield from Stacking DAO
  const withdrawTx = await makeContractCall({
    contractAddress: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG',
    contractName: 'stacking-dao-core-v1',
    functionName: 'request-withdraw',
    functionArgs: [uintCV(stxAmount)],
    network: NETWORK,
  });
  
  // Convert back to sBTC for invoice payment
  await convertSTXtoSBTC(stxAmount + yield);
  
  // Release to payee with earned yield bonus
  await releaseFunds(invoiceId);
};` }) }) }), _jsx("div", { className: "mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg", children: _jsxs("p", { className: "text-sm", children: [_jsx("strong", { children: "\uD83D\uDCA1 Key Benefit:" }), " DAOs can earn 8.5% APY on idle invoice escrow funds while waiting for milestone completion. The yield can be distributed to DAO members or added as a bonus to contractor payments."] }) }), _jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => window.open('https://stackingdao.com', '_blank'), children: "Learn More About Stacking DAO" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => window.open('https://docs.stacks.co/stacks-101/stacking', '_blank'), children: "How Stacking Works" })] })] })] })] }));
};
export default StackingYieldDemo;
