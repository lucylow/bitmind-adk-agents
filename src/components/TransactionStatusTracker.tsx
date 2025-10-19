import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { NETWORK } from '@/lib/stacksIntegration';

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'broadcast';

interface TransactionStatusTrackerProps {
  txId: string | null;
  status: TransactionStatus;
  operation: string;
  onRefresh?: () => void;
  showExplorerLink?: boolean;
}

/**
 * Real-time transaction status tracker with Stacks Explorer integration
 * Follows Hiro best practices for user feedback
 */
const TransactionStatusTracker: React.FC<TransactionStatusTrackerProps> = ({
  txId,
  status,
  operation,
  onRefresh,
  showExplorerLink = true,
}) => {
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
    if (!txId) return null;
    const chain = NETWORK.isMainnet() ? 'mainnet' : 'testnet';
    return `https://explorer.stacks.co/txid/${txId}?chain=${chain}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
      case 'broadcast':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
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
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Broadcasting...
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Confirming on-chain...
          </Badge>
        );
      case 'success':
        return (
          <Badge variant="default" className="bg-green-600">
            ✓ Confirmed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            × Failed
          </Badge>
        );
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

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!txId && status !== 'pending') return null;

  return (
    <Card className={`border-2 ${getStatusColor()} transition-all`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-base">
                {operation}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {status === 'success' 
                  ? 'Transaction confirmed on Stacks blockchain'
                  : status === 'failed'
                  ? 'Transaction failed - please try again'
                  : 'Waiting for blockchain confirmation'
                }
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Transaction ID */}
        {txId && (
          <div className="flex items-center justify-between p-2 bg-white rounded border text-xs">
            <div className="flex items-col gap-2">
              <span className="text-muted-foreground">TX ID:</span>
              <code className="font-mono">{txId.slice(0, 8)}...{txId.slice(-8)}</code>
            </div>
            {showExplorerLink && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={() => window.open(getExplorerUrl() || '', '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View on Explorer
              </Button>
            )}
          </div>
        )}

        {/* Progress information */}
        {(status === 'pending' || status === 'broadcast') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Elapsed:</span>
              <span className="font-mono">{formatElapsed(elapsed)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Estimated time:</span>
              <span>{getEstimatedTime()}</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full animate-pulse"
                style={{ width: status === 'broadcast' ? '30%' : '70%' }}
              />
            </div>
          </div>
        )}

        {/* Success details */}
        {status === 'success' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800">
              ✓ Transaction successfully confirmed on Bitcoin via Stacks
            </p>
            {txId && (
              <p className="text-xs text-green-600 mt-1">
                Block anchored to Bitcoin for immutable security
              </p>
            )}
          </div>
        )}

        {/* Failure details */}
        {status === 'failed' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <div className="text-xs">
                <p className="text-red-800 font-semibold">Transaction failed</p>
                <p className="text-red-600 mt-1">
                  Common causes: insufficient balance, invalid parameters, or network issues.
                </p>
                {onRefresh && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-7 text-xs"
                    onClick={onRefresh}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Helpful tips */}
        {(status === 'pending' || status === 'broadcast') && (
          <div className="text-xs text-muted-foreground border-t pt-2 space-y-1">
            <p>💡 <strong>Tip:</strong> Stacks transactions are anchored to Bitcoin blocks</p>
            <p>⏱️ Average confirmation: 10-15 minutes (~1 Bitcoin block)</p>
            <p>🔍 Track progress on Stacks Explorer for real-time updates</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
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
  const [txId, setTxId] = useState<string | null>(null);
  const [status, setStatus] = useState<TransactionStatus>('pending');

  const setTransaction = (newTxId: string | null, newStatus: TransactionStatus) => {
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



