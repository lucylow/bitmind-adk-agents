import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  ShoppingCart,
  TrendingUp,
  Lock,
  Unlock,
  Star,
  Zap,
  Shield,
  Award,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  atpManager,
  atpMarketplace,
  initializeDemoATPTokens,
  getATPAnalytics,
  AgentAccessToken,
  MarketplaceListing,
} from '../services/atp-tokenization';
import { toast } from 'sonner';

export default function ATPTokenMarketplace() {
  const [initialized, setInitialized] = useState(false);
  const [agentTokens, setAgentTokens] = useState<AgentAccessToken[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [analytics, setAnalytics] = useState(getATPAnalytics());
  const [selectedTier, setSelectedTier] = useState<'ALL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'>('ALL');

  useEffect(() => {
    initializeATP();
  }, []);

  const initializeATP = async () => {
    await initializeDemoATPTokens();
    setAgentTokens(atpManager.getAllAgentTokens());
    setListings(atpMarketplace.getActiveListings());
    setInitialized(true);
  };

  const purchaseToken = (token: AgentAccessToken) => {
    toast.success(`🎉 Purchased ${token.tier} access to ${token.agentName}!`, {
      description: `Valid until ${new Date(token.validUntil).toLocaleDateString()}`,
    });
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'BASIC':
        return <Shield className="w-5 h-5 text-blue-500" />;
      case 'PREMIUM':
        return <Star className="w-5 h-5 text-purple-500" />;
      case 'ENTERPRISE':
        return <Award className="w-5 h-5 text-yellow-500" />;
      default:
        return <Coins className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BASIC':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'PREMIUM':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'ENTERPRISE':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const filteredTokens = agentTokens.filter(
    (token) => selectedTier === 'ALL' || token.tier === selectedTier
  );

  if (!initialized) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 mb-4"
        >
          <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">ATP Token Marketplace</h1>
        </motion.div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Buy, sell, and trade tokenized AI agent access using IQ AI's Agent Tokenization Protocol (ATP)
        </p>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Agent Tokens</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalAgentTokens.toLocaleString()}</p>
            </div>
            <Coins className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Staked</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalStaked.toLocaleString()}</p>
            </div>
            <Lock className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Marketplace Volume</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.marketplaceVolume.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average APY</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageAPY}%</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3">
        <Button
          variant={selectedTier === 'ALL' ? 'default' : 'outline'}
          onClick={() => setSelectedTier('ALL')}
          size="sm"
        >
          All Tiers
        </Button>
        <Button
          variant={selectedTier === 'BASIC' ? 'default' : 'outline'}
          onClick={() => setSelectedTier('BASIC')}
          size="sm"
          className="gap-2"
        >
          <Shield className="w-4 h-4" />
          Basic
        </Button>
        <Button
          variant={selectedTier === 'PREMIUM' ? 'default' : 'outline'}
          onClick={() => setSelectedTier('PREMIUM')}
          size="sm"
          className="gap-2"
        >
          <Star className="w-4 h-4" />
          Premium
        </Button>
        <Button
          variant={selectedTier === 'ENTERPRISE' ? 'default' : 'outline'}
          onClick={() => setSelectedTier('ENTERPRISE')}
          size="sm"
          className="gap-2"
        >
          <Award className="w-4 h-4" />
          Enterprise
        </Button>
      </div>

      {/* Token Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTokens.map((token) => (
          <motion.div
            key={token.tokenId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className={`p-6 border-2 ${getTierColor(token.tier)} hover:shadow-xl transition-shadow`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTierIcon(token.tier)}
                  <div>
                    <h3 className="font-bold text-gray-900">{token.agentName}</h3>
                    <Badge className={`${getTierColor(token.tier)} border mt-1`}>
                      {token.tier}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">${token.price}</p>
                  <p className="text-xs text-gray-500">USDC</p>
                </div>
              </div>

              {/* Access Level */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Access Level</span>
                  <span className="text-sm font-bold text-gray-900">{token.accessLevel}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${token.accessLevel}%` }}
                  />
                </div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                <ul className="space-y-1">
                  {token.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                  {token.features.length > 3 && (
                    <li className="text-sm text-gray-500 pl-6">
                      +{token.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>

              {/* Token Info */}
              <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  {token.transferable ? (
                    <>
                      <Unlock className="w-4 h-4 text-green-500" />
                      <span>Transferable</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-gray-500" />
                      <span>Non-transferable</span>
                    </>
                  )}
                </div>
                <span>Valid 30 days</span>
              </div>

              {/* Purchase Button */}
              <Button
                onClick={() => purchaseToken(token)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Purchase Access
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Coins className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">What is ATP?</h3>
          </div>
          <p className="text-sm text-gray-600">
            Agent Tokenization Protocol (ATP) by IQ AI enables the creation, trading, and management of tokenized AI agent access rights on the blockchain.
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Staking Benefits</h3>
          </div>
          <p className="text-sm text-gray-600">
            Stake your governance tokens to earn rewards and gain boosted voting power. Lock periods range from 30-365 days with APYs up to 25%.
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">Trade on Marketplace</h3>
          </div>
          <p className="text-sm text-gray-600">
            Buy and sell transferable agent access tokens on the ATP marketplace. Premium tokens can be resold, creating a secondary market.
          </p>
        </Card>
      </div>

      {/* CTA */}
      <Card className="p-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-3">Start Using ATP Today</h2>
        <p className="text-lg mb-6 opacity-90">
          Join the future of AI governance with tokenized agent access
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            variant="secondary"
            className="gap-2 bg-white text-purple-600 hover:bg-gray-100"
          >
            <Zap className="w-5 h-5" />
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2 border-white text-white hover:bg-white hover:text-purple-600"
          >
            Learn More
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

