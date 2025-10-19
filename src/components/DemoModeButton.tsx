import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink,
  Zap,
  Shield,
  Wallet
} from 'lucide-react';
import { 
  DEMO_INVOICES, 
  DEMO_INVOICE_TEXT, 
  getRandomDemoInvoice,
  formatSatoshis,
  estimateUsdValue,
  DEMO_ADDRESSES
} from '@/lib/demoData';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DemoModeButtonProps {
  onLoadDemo?: (demoData: any) => void;
  variant?: 'button' | 'card';
}

const DemoModeButton: React.FC<DemoModeButtonProps> = ({ 
  onLoadDemo, 
  variant = 'button' 
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedDemo, setSelectedDemo] = useState(DEMO_INVOICES[0]);
  const { toast } = useToast();

  const handleCopy = (text: string, label: string) => {
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
    return (
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                One-Click Demo Mode
              </CardTitle>
              <CardDescription>
                Instantly load realistic test data for quick evaluation
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-purple-600 text-white">
              Hackathon Feature
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleQuickLoad}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Load Random Invoice
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Choose Demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select Demo Invoice</DialogTitle>
                    <DialogDescription>
                      Choose from pre-configured realistic invoices
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    {DEMO_INVOICES.map((demo) => (
                      <Card 
                        key={demo.invoice_id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedDemo.invoice_id === demo.invoice_id 
                            ? 'border-2 border-purple-600 bg-purple-50' 
                            : 'border-gray-200'
                        }`}
                        onClick={() => {
                          setSelectedDemo(demo);
                          handleLoadDemo(demo);
                        }}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">#{demo.invoice_id}</Badge>
                                <span className="text-sm font-semibold">{demo.dao_name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{demo.milestone_description}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Wallet className="w-3 h-3" />
                                Payee: {demo.payee.slice(0, 10)}...
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-purple-600">
                                {formatSatoshis(demo.amount)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {estimateUsdValue(demo.amount)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Quick Reference - Demo Addresses */}
            <div className="p-3 bg-white rounded-lg border">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Demo Addresses (Testnet)
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sample Payee (Alice):</span>
                  <button
                    onClick={() => handleCopy(DEMO_ADDRESSES.alice, 'Address')}
                    className="flex items-center gap-1 hover:text-purple-600 font-mono"
                  >
                    {DEMO_ADDRESSES.alice.slice(0, 12)}...
                    {copied === 'Address' ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sample Arbiter:</span>
                  <button
                    onClick={() => handleCopy(DEMO_ADDRESSES.neutral_arbiter, 'Arbiter')}
                    className="flex items-center gap-1 hover:text-purple-600 font-mono"
                  >
                    {DEMO_ADDRESSES.neutral_arbiter.slice(0, 12)}...
                    {copied === 'Arbiter' ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Parsing Demo Text */}
            <div className="p-3 bg-white rounded-lg border">
              <h4 className="text-sm font-semibold mb-2">Sample Invoice Text (for AI Demo)</h4>
              <div className="relative">
                <pre className="text-xs p-2 bg-gray-50 rounded overflow-x-auto whitespace-pre-wrap">
                  {DEMO_INVOICE_TEXT.slice(0, 200)}...
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(DEMO_INVOICE_TEXT, 'Invoice text')}
                >
                  {copied === 'Invoice text' ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open('https://explorer.stacks.co/sandbox/faucet?chain=testnet', '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Get Testnet STX
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open('https://docs.stacks.co', '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Stacks Docs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Button variant
  return (
    <Button 
      onClick={handleQuickLoad}
      className="bg-gradient-to-r from-purple-600 to-pink-600"
    >
      <Sparkles className="w-4 h-4 mr-2" />
      Load Demo Data
    </Button>
  );
};

export default DemoModeButton;



