import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Vote, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Wallet,
  FileText,
  Activity,
  BarChart3,
  Zap,
  ChevronRight,
  RefreshCw,
  Settings,
  Globe
} from 'lucide-react';
import { managerOrchestrator } from '../adk-agents/agents/manager-orchestrator';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

interface GovernanceState {
  analyzing: boolean;
  result: any | null;
  selectedProposal: string | null;
  daoAddress: string;
  proposals: any[];
  userPreferences: Record<string, any>;
}

export default function GovernanceCopilot() {
  const [state, setState] = useState<GovernanceState>({
    analyzing: false,
    result: null,
    selectedProposal: null,
    daoAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    proposals: [],
    userPreferences: {
      riskTolerance: 'medium',
      focusAreas: ['treasury-growth', 'security'],
      autoVote: false,
    },
  });

  // Load demo proposals on mount
  useEffect(() => {
    loadDemoProposals();
  }, []);

  const loadDemoProposals = () => {
    const demoProposals = [
      {
        id: 'prop-001',
        title: 'Increase Development Fund by 500,000 USDC',
        description: 'Proposal to allocate additional funds for Q1 2025 development initiatives including smart contract audits, frontend redesign, and mobile app development.',
        status: 'ACTIVE',
        dao: 'BitMind DAO',
        platform: 'Snapshot',
        forVotes: 15420,
        againstVotes: 2340,
        quorum: '85%',
        endsIn: '2 days',
        category: 'Treasury',
        risk: 'MEDIUM',
      },
      {
        id: 'prop-002',
        title: 'Upgrade Governance Smart Contracts v2.0',
        description: 'Deploy upgraded governance contracts with enhanced security features, vote delegation, and quadratic voting mechanisms. Audit completed by Trail of Bits.',
        status: 'ACTIVE',
        dao: 'DeFi Alliance DAO',
        platform: 'Tally',
        forVotes: 8900,
        againstVotes: 450,
        quorum: '92%',
        endsIn: '5 days',
        category: 'Protocol Upgrade',
        risk: 'HIGH',
      },
      {
        id: 'prop-003',
        title: 'Partner with Chainlink for Price Oracles',
        description: 'Integrate Chainlink oracles for real-time price feeds to improve trading efficiency and reduce slippage on the DEX.',
        status: 'ACTIVE',
        dao: 'DeFi Protocol DAO',
        platform: 'Snapshot',
        forVotes: 22100,
        againstVotes: 890,
        quorum: '96%',
        endsIn: '1 day',
        category: 'Integration',
        risk: 'LOW',
      },
      {
        id: 'prop-004',
        title: 'Launch NFT Rewards Program for Active Voters',
        description: 'Create a gamified voting rewards system where active participants earn exclusive NFTs that unlock premium DAO features and revenue sharing.',
        status: 'PENDING',
        dao: 'Community DAO',
        platform: 'Snapshot',
        forVotes: 0,
        againstVotes: 0,
        quorum: '0%',
        endsIn: '7 days',
        category: 'Community',
        risk: 'LOW',
      },
    ];

    setState(prev => ({ ...prev, proposals: demoProposals }));
  };

  const analyzeProposal = async (proposalId: string) => {
    setState(prev => ({ ...prev, analyzing: true, selectedProposal: proposalId }));
    
    try {
      toast.info('🤖 AI Agent analyzing proposal...', {
        description: 'Running multi-agent governance analysis',
      });

      const result = await managerOrchestrator.runFullGovernanceFlow(
        proposalId,
        state.daoAddress,
        {
          preferences: state.userPreferences,
          address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
        }
      );

      setState(prev => ({ ...prev, result, analyzing: false }));
      
      toast.success('✅ Analysis complete!', {
        description: `Recommendation: ${result.votingRecommendation.recommendation} (${Math.round(result.votingRecommendation.confidence * 100)}% confidence)`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze proposal');
      setState(prev => ({ ...prev, analyzing: false }));
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toUpperCase()) {
      case 'HIGH': return 'text-red-500 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'FOR': return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'AGAINST': return <XCircle className="w-6 h-6 text-red-500" />;
      case 'ABSTAIN': return <Clock className="w-6 h-6 text-yellow-500" />;
      default: return <Brain className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">DAO Governance Co-pilot AI-Agent</h1>
                <p className="text-gray-600 mt-1">Multi-agent system built with ADK-TS for the ADK-TS Agents Hackathon 2025</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Preferences
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card className="p-4 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Proposals</p>
                <p className="text-2xl font-bold text-gray-900">{state.proposals.filter(p => p.status === 'ACTIVE').length}</p>
              </div>
              <Vote className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="p-4 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Analyzed Today</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">95.2%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Treasury Health</p>
                <p className="text-2xl font-bold text-gray-900">8.5/10</p>
              </div>
              <Shield className="w-8 h-8 text-cyan-500" />
            </div>
          </Card>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="proposals" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="proposals" className="gap-2">
              <FileText className="w-4 h-4" />
              Proposals
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Analysis
            </TabsTrigger>
            <TabsTrigger value="treasury" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Treasury
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-2">
              <Zap className="w-4 h-4" />
              Automation
            </TabsTrigger>
          </TabsList>

          {/* Proposals Tab */}
          <TabsContent value="proposals">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Active Proposals</h2>
                <Button variant="outline" size="sm" onClick={loadDemoProposals} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>

              {state.proposals.map((proposal) => (
                <Card key={proposal.id} className="p-6 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{proposal.title}</h3>
                        <Badge className={`${getRiskColor(proposal.risk)} border`}>
                          {proposal.risk} Risk
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Globe className="w-3 h-3" />
                          {proposal.platform}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{proposal.description}</p>
                      
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">DAO</p>
                          <p className="font-semibold text-gray-900">{proposal.dao}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Category</p>
                          <p className="font-semibold text-gray-900">{proposal.category}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Quorum</p>
                          <p className="font-semibold text-gray-900">{proposal.quorum}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ends In</p>
                          <p className="font-semibold text-gray-900">{proposal.endsIn}</p>
                        </div>
                      </div>

                      {/* Voting Stats */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">For: {proposal.forVotes.toLocaleString()}</span>
                          <span className="text-sm font-medium text-gray-700">Against: {proposal.againstVotes.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                            style={{ 
                              width: `${(proposal.forVotes / (proposal.forVotes + proposal.againstVotes)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col gap-2">
                      <Button
                        onClick={() => analyzeProposal(proposal.id)}
                        disabled={state.analyzing}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2"
                      >
                        {state.analyzing && state.selectedProposal === proposal.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4" />
                            AI Analyze
                          </>
                        )}
                      </Button>
                      
                      {state.result && state.selectedProposal === proposal.id && (
                        <Button variant="outline" className="gap-2">
                          <ChevronRight className="w-4 h-4" />
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="analysis">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {state.result ? (
                <div className="space-y-6">
                  {/* Recommendation Card */}
                  <Card className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                    <div className="flex items-center gap-4 mb-6">
                      {getRecommendationIcon(state.result.votingRecommendation.recommendation)}
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                          Vote {state.result.votingRecommendation.recommendation}
                        </h2>
                        <p className="text-lg text-gray-600">
                          {Math.round(state.result.votingRecommendation.confidence * 100)}% Confidence
                        </p>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="mb-6">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all"
                          style={{ width: `${state.result.votingRecommendation.confidence * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Key Reasoning</h3>
                      <ul className="space-y-2">
                        {state.result.votingRecommendation.reasoning.map((reason: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Risk Assessment */}
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <h4 className="font-bold text-gray-900">Risk Assessment</h4>
                      </div>
                      <p className="text-gray-700">{state.result.votingRecommendation.riskAssessment}</p>
                    </div>
                  </Card>

                  {/* Proposal Analysis Details */}
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="p-6 bg-white/80 backdrop-blur">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-blue-500" />
                        Financial Impact
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Estimated Cost</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ${state.result.proposalAnalysis.financialImpact.estimatedCost.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Treasury Impact</p>
                          <p className={`text-2xl font-bold ${state.result.proposalAnalysis.financialImpact.treasuryImpact < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {state.result.proposalAnalysis.financialImpact.treasuryImpact > 0 ? '+' : ''}
                            {(state.result.proposalAnalysis.financialImpact.treasuryImpact * 100).toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Risk Score</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {(state.result.proposalAnalysis.financialImpact.riskScore * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 bg-white/80 backdrop-blur">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-green-500" />
                        Security Analysis
                      </h3>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Risk Level</p>
                        <Badge className={`${getRiskColor(state.result.proposalAnalysis.securityAnalysis.riskLevel)} border text-lg px-3 py-1`}>
                          {state.result.proposalAnalysis.securityAnalysis.riskLevel}
                        </Badge>
                      </div>
                      {state.result.proposalAnalysis.securityAnalysis.concerns.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Security Concerns</p>
                          <ul className="space-y-2">
                            {state.result.proposalAnalysis.securityAnalysis.concerns.map((concern: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{concern}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Alternative Views */}
                  <Card className="p-6 bg-white/80 backdrop-blur">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Alternative Perspectives</h3>
                    <div className="space-y-3">
                      {state.result.votingRecommendation.alternativeViews.map((view: string, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-700">{view}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 gap-2"
                    >
                      <Vote className="w-5 h-5" />
                      Execute Vote
                    </Button>
                    <Button size="lg" variant="outline" className="gap-2">
                      <FileText className="w-5 h-5" />
                      Export Report
                    </Button>
                  </div>
                </div>
              ) : (
                <Card className="p-12 bg-white/80 backdrop-blur text-center">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Analysis Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Select a proposal from the Proposals tab and click "AI Analyze" to see detailed recommendations
                  </p>
                  <Button onClick={() => document.querySelector('[value="proposals"]')?.dispatchEvent(new Event('click', { bubbles: true }))}>
                    View Proposals
                  </Button>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* Treasury Tab */}
          <TabsContent value="treasury">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 bg-white/80 backdrop-blur">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Treasury Health Monitor</h2>
                
                {state.result?.treasuryStatus ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-3xl font-bold text-gray-900">
                          ${state.result.treasuryStatus.totalValue.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Health Score</p>
                        <p className="text-3xl font-bold text-green-600">
                          {(state.result.treasuryStatus.healthScore * 10).toFixed(1)}/10
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Diversification</p>
                        <p className="text-3xl font-bold text-blue-600">
                          {state.result.treasuryStatus.tokens.length} Tokens
                        </p>
                      </div>
                    </div>

                    {/* Token Breakdown */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Token Holdings</h3>
                      <div className="space-y-3">
                        {state.result.treasuryStatus.tokens.map((token: any, idx: number) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-gray-900">{token.symbol}</span>
                              <span className="text-gray-700">{token.percentage.toFixed(2)}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>Balance: {token.balance.toLocaleString()}</span>
                              <span>Value: ${token.value.toLocaleString()}</span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                                style={{ width: `${token.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Alerts */}
                    {state.result.treasuryStatus.alerts.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Alerts</h3>
                        <div className="space-y-2">
                          {state.result.treasuryStatus.alerts.map((alert: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{alert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Analyze a proposal to see treasury status</p>
                  </div>
                )}
              </Card>
            </motion.div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 bg-white/80 backdrop-blur">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Automated Governance</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Zap className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Auto-Vote</h3>
                        <Badge variant="outline" className="mt-1">Coming Soon</Badge>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Automatically execute votes based on your preferences and AI recommendations when confidence exceeds threshold.
                    </p>
                    <Button disabled className="w-full">
                      Enable Auto-Voting
                    </Button>
                  </Card>

                  <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Activity className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Real-time Alerts</h3>
                        <Badge variant="outline" className="mt-1">Coming Soon</Badge>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Get instant notifications when new proposals match your interests or require urgent attention.
                    </p>
                    <Button disabled className="w-full">
                      Configure Alerts
                    </Button>
                  </Card>

                  <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Globe className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Multi-DAO Support</h3>
                        <Badge variant="outline" className="mt-1">Coming Soon</Badge>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Monitor and participate in governance across multiple DAOs from a single dashboard.
                    </p>
                    <Button disabled className="w-full">
                      Add DAOs
                    </Button>
                  </Card>

                  <Card className="p-6 border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-cyan-100 rounded-lg">
                        <Brain className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Learning Mode</h3>
                        <Badge variant="outline" className="mt-1">Coming Soon</Badge>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      AI learns from your voting patterns to improve recommendations over time.
                    </p>
                    <Button disabled className="w-full">
                      Enable Learning
                    </Button>
                  </Card>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Powered by Badge */}
      <div className="max-w-7xl mx-auto mt-8 text-center">
        <p className="text-sm text-gray-500">
          Powered by <span className="font-bold text-purple-600">IQ AI ADK-TS</span> • 
          Multi-Agent Governance System • 
          <span className="font-bold text-blue-600"> ATP Tokenization Ready</span>
        </p>
      </div>
    </div>
  );
}

