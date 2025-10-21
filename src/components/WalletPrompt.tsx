/**
 * Wallet Prompt Component
 * Shows a prompt to connect wallet when needed for transactions
 * Does NOT gate access - users can explore without wallet
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, AlertCircle } from 'lucide-react';
import WalletConnect from './WalletConnect';

interface WalletPromptProps {
  action: string; // e.g., "vote", "create proposal", "execute transaction"
  description?: string;
  onCancel?: () => void;
}

export const WalletPrompt: React.FC<WalletPromptProps> = ({
  action,
  description,
  onCancel
}) => {
  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle>Wallet Connection Required</CardTitle>
            <CardDescription>
              Connect your wallet to {action}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && (
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <AlertCircle className="w-4 h-4 mt-0.5 text-blue-600" />
            <p>{description}</p>
          </div>
        )}

        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-600 mb-3">
            This action requires a blockchain transaction. Connect your Stacks wallet to proceed:
          </p>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <WalletConnect />
            </div>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Supported wallets: Hiro Wallet, Xverse, Leather
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletPrompt;

