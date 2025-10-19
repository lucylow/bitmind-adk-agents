/**
 * sBTC Yield Calculator Dashboard
 * Shows potential Bitcoin rewards from Stacking escrowed funds
 * Demonstrates Bitcoin alignment and DeFi primitives
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Info, ExternalLink, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SBTCYieldDashboardProps {
  invoiceAmount: number; // in satoshis
  escrowDays?: number; // expected escrow duration
  showDetails?: boolean;
}

// Current Stacking APY rates (can be fetched from API in production)
const STACKING_APY = 0.08; // 8% annual from Bitcoin rewards
const CURRENT_BTC_PRICE = 64000; // Can be fetched from CoinGecko API

export function SBTCYieldDashboard({ 
  invoiceAmount, 
  escrowDays = 30,
  showDetails = true 
}: SBTCYieldDashboardProps) {
  const [projectedYield, setProjectedYield] = useState(0);
  const [yieldUSD, setYieldUSD] = useState(0);
  const [isStacking, setIsStacking] = useState(false);

  useEffect(() => {
    // Calculate potential yield from Stacking while invoice is in escrow
    const btcAmount = invoiceAmount / 100_000_000; // Convert satoshis to BTC
    const annualYield = btcAmount * STACKING_APY;
    const periodYield = (annualYield * escrowDays) / 365;
    
    setProjectedYield(periodYield);
    setYieldUSD(periodYield * CURRENT_BTC_PRICE);
  }, [invoiceAmount, escrowDays]);

  const btcAmount = invoiceAmount / 100_000_000;

  return (
    <Card className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-orange-900">sBTC Yield Potential</CardTitle>
              <CardDescription className="text-orange-700">
                Earn Bitcoin rewards while funds are in escrow
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-orange-600">
            <Zap className="w-3 h-3 mr-1" />
            {STACKING_APY * 100}% APY
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Yield Display */}
        <div className="bg-white p-4 rounded-lg border-2 border-orange-300 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Escrowed Amount</p>
              <p className="text-xl font-bold text-orange-900">
                ₿ {btcAmount.toFixed(8)}
              </p>
              <p className="text-xs text-orange-600">
                ${(btcAmount * CURRENT_BTC_PRICE).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Projected Yield ({escrowDays} days)
              </p>
              <p className="text-xl font-bold text-green-600">
                +₿ {projectedYield.toFixed(8)}
              </p>
              <p className="text-xs text-green-700">
                ~${yieldUSD.toFixed(2)} USD
              </p>
            </div>
          </div>
        </div>

        {/* Stacking Details */}
        {showDetails && (
          <div className="space-y-3">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-900">
                <strong>How it works:</strong> Escrowed sBTC can participate in Stacks' 
                Proof-of-Transfer consensus, earning Bitcoin rewards while maintaining 
                full escrow security. Rewards are automatically distributed every ~2 weeks.
              </AlertDescription>
            </Alert>

            {/* Stacking Breakdown */}
            <div className="bg-white p-3 rounded border space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">Yield Breakdown</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual APY:</span>
                  <span className="font-semibold">{(STACKING_APY * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escrow Period:</span>
                  <span className="font-semibold">{escrowDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reward Cycles:</span>
                  <span className="font-semibold">{Math.ceil(escrowDays / 14)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protocol:</span>
                  <span className="font-semibold">PoX (Proof-of-Transfer)</span>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={isStacking ? "default" : "outline"}
                className={isStacking ? "bg-orange-600" : ""}
                onClick={() => setIsStacking(!isStacking)}
              >
                <Zap className="w-4 h-4 mr-2" />
                {isStacking ? "Stacking Enabled ✓" : "Enable Stacking"}
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a 
                  href="https://docs.stacks.co/docs/stacks-academy/stacking" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Learn More
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Benefits List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center p-2 bg-white rounded">
            <p className="text-lg font-bold text-green-600">100%</p>
            <p className="text-xs text-muted-foreground">Bitcoin-backed</p>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <p className="text-lg font-bold text-blue-600">Non-Custodial</p>
            <p className="text-xs text-muted-foreground">You control funds</p>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <p className="text-lg font-bold text-purple-600">Secured</p>
            <p className="text-xs text-muted-foreground">Smart contract</p>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
          <p className="text-xs text-purple-900">
            💡 <strong>Pro tip:</strong> DAOs can Stack their treasury funds while waiting 
            for milestone completion, turning idle capital into productive Bitcoin-earning assets. 
            This is unique to Bitcoin's PoX model—no other blockchain offers this.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact version for inline display
 */
export function SBTCYieldBadge({ invoiceAmount, escrowDays = 30 }: { invoiceAmount: number; escrowDays?: number }) {
  const btcAmount = invoiceAmount / 100_000_000;
  const annualYield = btcAmount * STACKING_APY;
  const periodYield = (annualYield * escrowDays) / 365;

  return (
    <Badge variant="outline" className="gap-2 bg-orange-50 border-orange-300 text-orange-900">
      <TrendingUp className="w-3 h-3" />
      <span className="text-xs">
        Earn +₿{periodYield.toFixed(8)} (~${(periodYield * CURRENT_BTC_PRICE).toFixed(2)})
      </span>
    </Badge>
  );
}

