import { ReactNode } from 'react';
import { useWalletStore } from '@/store/useWalletStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Wallet, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import WalletConnect from './WalletConnect';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isConnected } = useWalletStore();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl mb-2">Wallet Connection Required</CardTitle>
            <CardDescription className="text-base">
              This page requires a connected Stacks wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 text-center">
                🔐 <strong>BitMindAI</strong> uses wallet-based authentication for secure access to blockchain features.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Supported Wallets:</h4>
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="p-2 border rounded-lg hover:bg-gray-50">
                  <Wallet className="w-6 h-6 mx-auto mb-1 text-orange-600" />
                  <span>Hiro Wallet</span>
                </div>
                <div className="p-2 border rounded-lg hover:bg-gray-50">
                  <Wallet className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                  <span>Leather</span>
                </div>
                <div className="p-2 border rounded-lg hover:bg-gray-50">
                  <Wallet className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                  <span>Xverse</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t">
              <div className="flex justify-center">
                <WalletConnect />
              </div>
              <Link to="/landing" className="w-full">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Landing Page
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

