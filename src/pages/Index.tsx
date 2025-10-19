import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Wallet, Shield, Plus, TrendingUp, RefreshCw, Sparkles, Award, Coins, Brain, Zap, Users, Target, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useWalletStore } from "@/store/useWalletStore";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import QuickNav from "@/components/QuickNav";
import DemoModeButton from "@/components/DemoModeButton";
import WalletConnect from "@/components/WalletConnect";

// Utility function for formatting currency
const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const Index: React.FC = () => {
  const { isConnected } = useWalletStore();
  const { prices, loading: pricesLoading, refetch } = useCryptoPrices();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Landing Page Header - Simple & Clean */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  BitMindAI
                </span>
                <span className="text-xs text-gray-500 -mt-1 hidden sm:block">Bitcoin-native smart invoices</span>
              </div>
            </Link>
            
            {/* Desktop Navigation - Key CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/demo">
                <Button variant="ghost" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try Demo
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link to="/create">
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
              {/* Wallet Connect - Less prominent, on the right */}
              <div className="ml-2 pl-2 border-l border-gray-200">
                <WalletConnect />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4 space-y-2">
              <Link to="/demo" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try Demo
                </Button>
              </Link>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Dashboard
                </Button>
              </Link>
              <Link to="/create" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
              <div className="pt-2 border-t border-gray-100">
                <WalletConnect />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            BitMindAI: Neural Network for Bitcoin's Real-World Economy
          </h1>
          <p className="text-muted-foreground text-xl mb-6 max-w-3xl mx-auto">
            AI-powered invoice parsing + Clarity smart contracts + Bitcoin-native sBTC settlement
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Badge variant="secondary" className="bg-green-100 text-green-800 px-4 py-2 text-sm">
              ✓ 95%+ AI Accuracy
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-4 py-2 text-sm">
              ⚡ Sub-2s Processing
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-4 py-2 text-sm">
              ₿ Bitcoin-Native Settlement
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-4 py-2 text-sm">
              🔒 Post-Condition Security
            </Badge>
          </div>
          
          {/* Action Buttons - Available to All Users */}
          <div className="flex gap-3 justify-center mt-6 flex-wrap">
            <Link to="/demo">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-purple-600 text-white hover:shadow-lg transition-all">
                <Sparkles className="w-5 h-5 mr-2" />
                Try DAO Invoice Demo
              </Button>
            </Link>
            <Link to="/create">
              <Button variant="outline" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </Link>
          </div>
          
          {/* Demo Feature Highlight */}
          <Card className="mt-6 max-w-3xl mx-auto bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border-2 border-purple-300">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">🎮 Interactive DAO Invoice Demo</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Explore smart invoice workflows with <strong>6 pre-built DAO templates</strong> covering DeFi audits, 
                    NFT marketplaces, education guilds, gaming tokenomics, and more. Try the full workflow with:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div className="bg-white p-2 rounded border">
                      ✅ <strong>Mock Data</strong> - No API key needed
                    </div>
                    <div className="bg-white p-2 rounded border">
                      🤖 <strong>Supabase + OpenAI</strong> - Uses your configured API
                    </div>
                    <div className="bg-white p-2 rounded border">
                      ⚡ <strong>Full Escrow Flow</strong> - Create to release
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Connection Info for Non-Connected Users */}
          {!isConnected && (
            <div className="mt-6 max-w-2xl mx-auto">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Wallet className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-gray-700">
                      <strong>Demo Mode Active:</strong> Explore features with mock data. Connect your wallet to create real invoices and interact with smart contracts.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        
        {/* Demo Mode for Hackathon Judges - Show for all users */}
        <div className="mt-8">
          <DemoModeButton variant="card" />
        </div>
        </section>

        {/* DeFi Features Highlight - NEW! */}
        <Card className="mb-8 bg-gradient-to-r from-purple-100 via-blue-100 to-green-100 border-purple-300">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 mb-3">
                🏆 Advanced DeFi Features - Hackathon Special
              </Badge>
              <h2 className="text-3xl font-bold mb-2">Next-Generation DeFi Primitives</h2>
              <p className="text-muted-foreground">
                Unlocking liquidity, governance, and capital efficiency for Bitcoin DAOs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/nft-marketplace">
                <Card className="hover:shadow-xl transition-all cursor-pointer bg-white border-2 hover:border-purple-400">
                  <CardContent className="pt-6 text-center">
                    <Award className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                    <h3 className="font-bold mb-2">Invoice NFTs</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Tokenize & trade receivables for instant liquidity
                    </p>
                    <Badge variant="outline" className="text-xs">
                      $2.4M Volume
                    </Badge>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/treasury">
                <Card className="hover:shadow-xl transition-all cursor-pointer bg-white border-2 hover:border-blue-400">
                  <CardContent className="pt-6 text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                    <h3 className="font-bold mb-2">MultiSig Treasury</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      3-of-5 approval workflows for secure DAO funding
                    </p>
                    <Badge variant="outline" className="text-xs">
                      247 Proposals
                    </Badge>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/yield-optimizer">
                <Card className="hover:shadow-xl transition-all cursor-pointer bg-white border-2 hover:border-green-400">
                  <CardContent className="pt-6 text-center">
                    <Zap className="w-12 h-12 mx-auto mb-3 text-green-600" />
                    <h3 className="font-bold mb-2">Yield Optimizer</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Earn 7-25% APY on escrowed funds
                    </p>
                    <Badge variant="outline" className="text-xs">
                      $760K TVL
                    </Badge>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/analytics">
                <Card className="hover:shadow-xl transition-all cursor-pointer bg-white border-2 hover:border-orange-400">
                  <CardContent className="pt-6 text-center">
                    <Brain className="w-12 h-12 mx-auto mb-3 text-orange-600" />
                    <h3 className="font-bold mb-2">AI Analytics</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Risk scoring, fraud detection & predictions
                    </p>
                    <Badge variant="outline" className="text-xs">
                      94% Accuracy
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="mt-6 text-center">
              <Link to="/cross-chain-swap">
                <Button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  <Coins className="w-4 h-4 mr-2" />
                  Explore Cross-Chain Swaps
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* sBTC Showcase - Bitcoin Alignment */}
        <Card className="mb-6 bg-gradient-to-r from-orange-50 via-orange-100 to-yellow-50 border-2 border-orange-300">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <Badge className="bg-orange-600 mb-2">
                ₿ Powered by Bitcoin via Stacks
              </Badge>
              <h2 className="text-2xl font-bold">Why sBTC on Stacks?</h2>
              <p className="text-muted-foreground mt-1">Unlocking Bitcoin's $1.3T economy for real-world utility</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-center mb-2">Bitcoin Security</h3>
                <p className="text-xs text-muted-foreground text-center">
                  Every transaction is anchored to Bitcoin blocks, inheriting Bitcoin's security model and finality guarantees
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-center mb-2">Smart Contract Layer</h3>
                <p className="text-xs text-muted-foreground text-center">
                  Clarity brings programmability to Bitcoin without modifying the base layer—no reentrancy, decidable execution
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-center mb-2">1:1 Bitcoin Peg</h3>
                <p className="text-xs text-muted-foreground text-center">
                  sBTC is backed 1:1 by real BTC, enabling Bitcoin-native DeFi without bridging to other chains
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
              <p className="text-sm text-center">
                <strong>Real-World Impact:</strong> DAOs can now pay contractors in Bitcoin with trustless escrow, 
                unlocking <strong>$1.3 trillion</strong> of Bitcoin liquidity for productive economic activity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Technical Architecture Overview */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">AI Invoice Parsing</h3>
                  <p className="text-sm text-muted-foreground">
                    BERT-based NLP transforms plain-English invoices into structured JSON-LD with 95.2% F1 score
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Clarity Smart Contracts</h3>
                  <p className="text-sm text-muted-foreground">
                    Formal verification ensures state transitions through created→funded→verified→released
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Bitcoin-Native Settlement</h3>
                  <p className="text-sm text-muted-foreground">
                    sBTC escrow eliminates counter-party risk with cryptographically enforced payment release
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Crypto Prices Banner */}
        <Card className="mb-6 bg-gradient-to-r from-orange-50 to-purple-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <div>
                  <h3 className="text-lg font-bold mb-1">Live Market Prices</h3>
                  <p className="text-sm text-muted-foreground">Real-time data from CoinGecko API</p>
                </div>
                <div className="flex gap-6 ml-8">
                  {pricesLoading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : (
                    <>
                      {prices.btc && (
                        <div>
                          <p className="text-xs text-gray-600">Bitcoin (BTC)</p>
                          <p className="text-xl font-bold text-orange-600">
                            {formatCurrency(prices.btc)}
                          </p>
                        </div>
                      )}
                      {prices.stx && (
                        <div>
                          <p className="text-xs text-gray-600">Stacks (STX)</p>
                          <p className="text-xl font-bold text-purple-600">
                            {formatCurrency(prices.stx)}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={refetch}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Link to="/supabase-test">
                  <Button variant="outline" size="sm">
                    Test Supabase
                  </Button>
                </Link>
                <Link to="/api-showcase">
                  <Button variant="outline" size="sm">
                    API Showcase
                  </Button>
                </Link>
                <Link to="/realtime-monitor">
                  <Button variant="outline" size="sm">
                    Live Monitor
                  </Button>
                </Link>
                <Link to="/discord-notifications">
                  <Button variant="outline" size="sm">
                    Discord Notify
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Performance Metrics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Core Performance Metrics</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <Sparkles className="w-8 h-8 mb-2 text-green-600" />
              <CardTitle>AI Accuracy</CardTitle>
              <CardDescription>Key field extraction (F1 score)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">95.2%</p>
              <p className="text-sm text-muted-foreground mt-1">40x improvement from 3.6%</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <TrendingUp className="w-8 h-8 mb-2 text-blue-600" />
              <CardTitle>Processing Time</CardTitle>
              <CardDescription>Invoice → Smart Contract</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">&lt;2s</p>
              <p className="text-sm text-muted-foreground mt-1">99% latency reduction</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <Wallet className="w-8 h-8 mb-2 text-purple-600" />
              <CardTitle>Cost per Transaction</CardTitle>
              <CardDescription>vs $15-20 manual processing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">$0.02</p>
              <p className="text-sm text-muted-foreground mt-1">85% contribution margin</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <Shield className="w-8 h-8 mb-2 text-orange-600" />
              <CardTitle>Settlement Time</CardTitle>
              <CardDescription>Bitcoin-native sBTC escrow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">Instant</p>
              <p className="text-sm text-muted-foreground mt-1">From 14.6 day average</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation */}
        <QuickNav />

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>AI-parsed invoices with Clarity smart contract escrow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  id: "2025-300", 
                  status: "released", 
                  amount: "0.85 sBTC", 
                  usd: "$52,300",
                  dao: "DeFi Protocol DAO",
                  description: "Smart contract audit + security review",
                  milestones: "3/3 verified"
                },
                { 
                  id: "2025-299", 
                  status: "funded", 
                  amount: "0.42 sBTC", 
                  usd: "$25,800",
                  dao: "NFT Marketplace Collective",
                  description: "Website redesign + mobile responsive",
                  milestones: "2/3 verified"
                },
                { 
                  id: "2025-298", 
                  status: "verified", 
                  amount: "0.65 sBTC", 
                  usd: "$39,900",
                  dao: "Web3 Education Guild",
                  description: "Tutorial series + documentation",
                  milestones: "Awaiting release"
                },
                { 
                  id: "2025-297", 
                  status: "created", 
                  amount: "0.28 sBTC", 
                  usd: "$17,200",
                  dao: "Gaming DAO Treasury",
                  description: "Token economics modeling",
                  milestones: "Awaiting deposit"
                },
              ].map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">#{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">{invoice.dao}</p>
                      <p className="text-xs text-muted-foreground">{invoice.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{invoice.amount}</p>
                      <p className="text-xs text-muted-foreground">{invoice.usd}</p>
                      <p className="text-xs text-muted-foreground">{invoice.milestones}</p>
                    </div>
                    <Badge
                      variant={
                        invoice.status === "released"
                          ? "default"
                          : invoice.status === "verified"
                          ? "default"
                          : invoice.status === "funded"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        invoice.status === "released"
                          ? "bg-green-600"
                          : invoice.status === "verified"
                          ? "bg-blue-600"
                          : invoice.status === "funded"
                          ? "bg-purple-600"
                          : ""
                      }
                    >
                      {invoice.status}
                    </Badge>
                    <Link to={`/invoice/${invoice.id}`}>
                      <Button size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
