import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Percent, Clock, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface YieldPosition {
  id: string;
  invoiceId: string;
  principal: number;
  projectedYield: number;
  apy: number;
  startTime: string;
  token: string;
  status: 'active' | 'harvested';
  harvestedAt?: string;
}

/**
 * Stacking Yield Demo Component
 * Showcases how DAOs can earn yield on escrowed invoice funds using Stacking
 * 
 * Based on Stacking DAO's immediate yield feature
 * Reference: https://stackingdao.com
 */
export const StackingYieldDemo: React.FC = () => {
  const [yieldPositions, setYieldPositions] = useState<YieldPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Calculate projected yield for escrowed funds
  const calculateYield = async (amount: number, durationDays: number = 30): Promise<number> => {
    const apy = 0.085; // 8.5% APY from Stacking DAO
    const dailyRate = apy / 365;
    const projectedYield = amount * dailyRate * durationDays;
    return Math.floor(projectedYield);
  };

  const createYieldPosition = async (invoiceId: string, amount: number) => {
    setIsLoading(true);
    
    try {
      const projectedYield = await calculateYield(amount);
      
      const newPosition: YieldPosition = {
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
    } catch (error) {
      console.error('Failed to create yield position:', error);
      toast({
        title: '❌ Failed to Create Position',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const harvestYield = async (positionId: string) => {
    const position = yieldPositions.find(p => p.id === positionId);
    if (!position) return;

    setYieldPositions(prev => 
      prev.map(p => 
        p.id === positionId 
          ? { ...p, status: 'harvested', harvestedAt: new Date().toISOString() }
          : p
      )
    );

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

  const formatBTC = (satoshis: number) => {
    return (satoshis / 100000000).toFixed(8).replace(/\.?0+$/, '');
  };

  return (
    <div className="space-y-6">
      {/* Treasury Overview */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                DAO Treasury Yield Optimization
              </CardTitle>
              <CardDescription>
                Earn passive income on escrowed invoice funds via Stacking
              </CardDescription>
            </div>
            <Badge className="bg-green-600">
              Powered by Stacking DAO
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                Total Escrowed
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatBTC(treasuryData.totalEscrowed)} sBTC
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ≈ $153,750 USD
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <ArrowUpRight className="w-4 h-4" />
                Active Yield
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                +{formatBTC(treasuryData.activeYield)} sBTC
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Accruing daily
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Percent className="w-4 h-4" />
                Projected APY
              </div>
              <div className="text-2xl font-bold text-green-600">
                {treasuryData.apy}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ~{formatBTC(treasuryData.projectedAnnualYield)} sBTC/year
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Yield Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Yield Positions</CardTitle>
          <CardDescription>
            Invoice escrow funds earning passive income via Bitcoin Stacking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {yieldPositions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-muted-foreground mb-4">
                No active yield positions yet
              </p>
              <Button 
                onClick={() => createYieldPosition('demo-2025-001', 50000000)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Creating...' : '🚀 Start Demo Yield Position (0.5 sBTC)'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {yieldPositions.map(position => (
                <Card key={position.id} className="border-green-200 bg-green-50/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">Invoice #{position.invoiceId}</span>
                          <Badge 
                            variant={position.status === 'active' ? 'default' : 'secondary'}
                            className={position.status === 'active' ? 'bg-green-600' : ''}
                          >
                            {position.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Started {new Date(position.startTime).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Principal</div>
                        <div className="font-semibold">
                          {formatBTC(position.principal)} sBTC
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Projected Yield (30d)</div>
                        <div className="font-semibold text-green-600">
                          +{formatBTC(position.projectedYield)} sBTC
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">APY</div>
                        <div className="font-semibold">{position.apy}%</div>
                      </div>
                    </div>

                    {position.status === 'active' && (
                      <Button 
                        onClick={() => harvestYield(position.id)}
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Harvest Yield
                      </Button>
                    )}

                    {position.status === 'harvested' && (
                      <div className="text-sm text-green-600 text-center py-2 bg-green-100 rounded">
                        ✓ Harvested on {new Date(position.harvestedAt!).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <Button 
                onClick={() => createYieldPosition(`demo-${Date.now()}`, 75000000)}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                + Add Another Position (0.75 sBTC)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Code Example */}
      <Card>
        <CardHeader>
          <CardTitle>Stacking DAO Integration</CardTitle>
          <CardDescription>
            How BitMind integrates with Stacking DAO for yield optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-xs"><code>{`// Stack yield from invoice escrow
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
};`}</code></pre>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm">
              <strong>💡 Key Benefit:</strong> DAOs can earn 8.5% APY on idle invoice escrow funds
              while waiting for milestone completion. The yield can be distributed to DAO members
              or added as a bonus to contractor payments.
            </p>
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://stackingdao.com', '_blank')}
            >
              Learn More About Stacking DAO
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://docs.stacks.co/stacks-101/stacking', '_blank')}
            >
              How Stacking Works
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StackingYieldDemo;



