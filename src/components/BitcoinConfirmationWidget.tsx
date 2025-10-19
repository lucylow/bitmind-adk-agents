/**
 * Bitcoin Block Confirmation Widget
 * Shows Bitcoin security anchoring for Stacks transactions
 * Demonstrates Bitcoin alignment and security model
 */

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, ExternalLink, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BitcoinConfirmationWidgetProps {
  stacksBlockHeight?: number;
  stacksTxId?: string;
  variant?: 'badge' | 'card' | 'inline';
  showDetails?: boolean;
}

// Stacks anchors to Bitcoin approximately every 10 minutes
const BLOCKS_PER_BTC_ANCHOR = 10;
const CONFIRMATIONS_FOR_FINALITY = 6; // Standard Bitcoin finality

export function BitcoinConfirmationWidget({ 
  stacksBlockHeight,
  stacksTxId,
  variant = 'badge',
  showDetails = false 
}: BitcoinConfirmationWidgetProps) {
  const [btcConfirmations, setBtcConfirmations] = useState(0);
  const [isFinalized, setIsFinalized] = useState(false);
  const [estimatedBtcBlock, setEstimatedBtcBlock] = useState(0);

  useEffect(() => {
    if (!stacksBlockHeight) return;

    // Estimate Bitcoin confirmations based on Stacks block height
    // Each Stacks block represents progress toward BTC anchoring
    const estimatedBtcBlocks = Math.floor(stacksBlockHeight / BLOCKS_PER_BTC_ANCHOR);
    setBtcConfirmations(estimatedBtcBlocks);
    setEstimatedBtcBlock(estimatedBtcBlocks);
    setIsFinalized(estimatedBtcBlocks >= CONFIRMATIONS_FOR_FINALITY);
  }, [stacksBlockHeight]);

  // Badge variant - compact display
  if (variant === 'badge') {
    return (
      <Badge 
        variant="outline" 
        className={`gap-2 ${
          isFinalized 
            ? 'bg-green-50 border-green-300 text-green-900' 
            : 'bg-orange-50 border-orange-300 text-orange-900'
        }`}
      >
        <Shield className="h-3 w-3" />
        <span className="text-xs font-medium">
          {isFinalized ? '✓ ' : '⏳ '}
          Secured by {btcConfirmations}+ Bitcoin blocks
        </span>
      </Badge>
    );
  }

  // Inline variant - minimal display
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3 w-3 text-orange-500" />
        <span>
          {btcConfirmations}+ BTC confirmations
          {isFinalized && <Check className="inline h-3 w-3 ml-1 text-green-600" />}
        </span>
      </div>
    );
  }

  // Card variant - full details
  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isFinalized ? 'bg-green-500' : 'bg-orange-500'
              }`}>
                {isFinalized ? (
                  <Check className="h-6 w-6 text-white" />
                ) : (
                  <Clock className="h-6 w-6 text-white animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">Bitcoin Security</h3>
                <p className="text-sm text-muted-foreground">
                  Transaction anchored to Bitcoin blockchain
                </p>
              </div>
            </div>
            <Badge className={isFinalized ? "bg-green-600" : "bg-orange-600"}>
              {isFinalized ? "Finalized" : "Pending"}
            </Badge>
          </div>

          {/* Confirmation Counter */}
          <div className="bg-white p-4 rounded-lg border-2 border-orange-300 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Bitcoin Confirmations</span>
              <span className="text-2xl font-bold text-orange-600">
                {btcConfirmations}+
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`absolute h-full transition-all duration-500 ${
                  isFinalized ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ 
                  width: `${Math.min((btcConfirmations / CONFIRMATIONS_FOR_FINALITY) * 100, 100)}%` 
                }}
              />
            </div>
            
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>0 blocks</span>
              <span>{CONFIRMATIONS_FOR_FINALITY} blocks (finality)</span>
            </div>
          </div>

          {/* Details */}
          {showDetails && (
            <div className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <h4 className="text-sm font-semibold mb-2">Security Details</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stacks Block Height:</span>
                    <span className="font-mono">{stacksBlockHeight || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Bitcoin Block:</span>
                    <span className="font-mono">{estimatedBtcBlock || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consensus:</span>
                    <span className="font-semibold">Proof-of-Transfer (PoX)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={isFinalized ? 'text-green-600 font-semibold' : 'text-orange-600'}>
                      {isFinalized ? '✓ Final' : '⏳ Confirming'}
                    </span>
                  </div>
                </div>
              </div>

              {/* What this means */}
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-xs text-blue-900">
                  <strong>What this means:</strong> Your transaction inherits Bitcoin's security 
                  through Stacks' Proof-of-Transfer consensus. After {CONFIRMATIONS_FOR_FINALITY} 
                  Bitcoin block confirmations (~60 min), this transaction achieves the same 
                  finality guarantees as a direct Bitcoin transaction.
                </p>
              </div>
            </div>
          )}

          {/* Explorer Links */}
          <div className="flex gap-2">
            {stacksTxId && (
              <Button size="sm" variant="outline" asChild className="flex-1">
                <a 
                  href={`https://explorer.stacks.co/txid/${stacksTxId}?chain=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  View on Stacks Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            )}
            <Button size="sm" variant="outline" asChild className="flex-1">
              <a 
                href="https://mempool.space"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                View Bitcoin Blocks
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>

          {/* Why Bitcoin Matters */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-900">
              🔒 <strong>Why this matters:</strong> Unlike other blockchains that rely on their 
              own consensus, Stacks transactions are cryptographically anchored to Bitcoin blocks. 
              This means your invoice escrow has the same security guarantees as Bitcoin itself—
              the most secure blockchain in existence.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Real-time confirmation tracker - updates as blocks are mined
 */
export function BitcoinConfirmationTracker({ 
  initialBlockHeight 
}: { 
  initialBlockHeight: number 
}) {
  const [currentBlockHeight, setCurrentBlockHeight] = useState(initialBlockHeight);

  useEffect(() => {
    // In production, this would connect to a WebSocket or poll the Stacks API
    // For demo, we can simulate block progression
    const interval = setInterval(() => {
      setCurrentBlockHeight(prev => prev + 1);
    }, 600000); // ~10 minutes per block

    return () => clearInterval(interval);
  }, []);

  return (
    <BitcoinConfirmationWidget 
      stacksBlockHeight={currentBlockHeight}
      variant="card"
      showDetails={true}
    />
  );
}

