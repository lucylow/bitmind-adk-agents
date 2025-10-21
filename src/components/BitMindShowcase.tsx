import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronRight, Activity, Zap, Shield, Users } from 'lucide-react';

/**
 * BitMind Showcase Component
 * Interactive landing page for DAO Governance Co-pilot
 * Works with React + Vite setup
 */

interface ChatMessage {
  id: number;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
  votesFor: number;
  votesAgainst: number;
  endsIn: string;
  financialImpact: string;
  recommendation: 'FOR' | 'AGAINST' | 'ABSTAIN';
  confidence: number;
}

export const BitMindShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
      id: 1, 
      type: 'agent', 
      content: "Hello! I'm your BitMind DAO Governance Co-pilot. I can analyze proposals, assess treasury risks, and provide voting recommendations. What would you like to know?", 
      timestamp: new Date() 
    }
  ]);
  const [walletConnected, setWalletConnected] = useState(false);

  const demos = [
    {
      title: "Proposal Analysis",
      description: "AI-powered analysis via MCP servers",
      icon: "📊",
      features: ["Financial Impact", "Risk Assessment", "Voting Recommendations"],
      code: `// Proposal Analyst Agent\nconst analysis = await analyst.analyze(\n  "PROP-2024-001",\n  daoAddress\n);\n\n// Results:\n// Risk: MEDIUM (35%)\n// Cost: $500K\n// Treasury Impact: 5%`
    },
    {
      title: "Multi-Agent System",
      description: "4 specialized agents via ADK-TS",
      icon: "🤖",
      features: ["Proposal Analyst", "Voting Strategist", "Treasury Monitor"],
      code: `// Multi-Agent Workflow\nconst workflow = new GovernanceWorkflow();\n\nconst result = await workflow.execute({\n  proposalId, daoAddress,\n  userContext\n});`
    },
    {
      title: "MCP Servers",
      description: "Custom blockchain data access",
      icon: "⚡",
      features: ["Blockchain Data", "Governance APIs", "Risk Assessment"],
      code: `// MCP Server Usage\nconst servers = createMCPServers();\n\nconst treasury = await servers\n  .blockchainData\n  .getTreasuryBalance(dao);\n\n// $5.25M | Health: 78%`
    }
  ];

  const mockProposals: Proposal[] = [
    {
      id: "PROP-2024-001",
      title: "Treasury Diversification Strategy",
      description: "Allocate 15% of treasury to stablecoins and low-risk DeFi yield strategies",
      risk: "MEDIUM",
      riskScore: 35,
      votesFor: 4500000,
      votesAgainst: 1200000,
      endsIn: "2 days",
      financialImpact: "$500K cost, 5% treasury impact",
      recommendation: "FOR",
      confidence: 82
    },
    {
      id: "PROP-2024-002", 
      title: "Protocol Upgrade v2.1",
      description: "Smart contract upgrades with enhanced security and gas optimization",
      risk: "HIGH",
      riskScore: 65,
      votesFor: 3200000,
      votesAgainst: 1800000,
      endsIn: "5 days",
      financialImpact: "$1.2M cost, 12% treasury impact",
      recommendation: "ABSTAIN",
      confidence: 68
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [demos.length]);

  const handleSendMessage = () => {
    if (!userMessage.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newUserMessage]);
    setUserMessage('');

    // Simulate AI response
    setTimeout(() => {
      let aiContent = '';
      const msg = userMessage.toLowerCase();
      
      if (msg.includes('proposal') || msg.includes('analyze')) {
        aiContent = "I can analyze any DAO proposal for you! I'll assess:\n\n✓ Financial impact on treasury\n✓ Security risks and concerns\n✓ Voting recommendation\n✓ Historical comparison\n\nJust provide the proposal ID. Try: 'Analyze PROP-2024-001'";
      } else if (msg.includes('2024-001')) {
        const prop = mockProposals[0];
        aiContent = `📊 **Analysis: ${prop.title}**\n\n**Risk:** ${prop.risk} (${prop.riskScore}%)\n**Financial:** ${prop.financialImpact}\n**Recommendation:** ${prop.recommendation} (${prop.confidence}% confidence)\n\n**Reasoning:**\n✓ Low financial risk\n✓ Aligns with treasury goals\n✓ Strong community support`;
      } else if (msg.includes('treasury') || msg.includes('balance')) {
        aiContent = "📊 **Treasury Status**\n\n💰 Total Value: $5.25M\n📈 Health Score: 78%\n⚠️ 2 alerts\n\n**Top Holdings:**\n• ETH: $3.5M (67%)\n• USDC: $1.5M (29%)\n• DAI: $250K (4%)\n\n**Recommendation:** Increase stablecoin ratio to 40% for better liquidity.";
      } else if (msg.includes('vote') || msg.includes('voting')) {
        aiContent = "🗳️ **Voting Recommendations**\n\nBased on your profile (moderate risk tolerance):\n\n✅ **PROP-2024-001:** Vote FOR (82% confidence)\n→ Low risk, good treasury strategy\n\n⚠️ **PROP-2024-002:** ABSTAIN (68% confidence)\n→ High risk, wait for audit\n\nWould you like detailed analysis on either?";
      } else {
        aiContent = "I'm here to help with DAO governance! I can:\n\n📊 Analyze proposals\n💰 Monitor treasury\n🗳️ Generate recommendations\n🔍 Assess risks\n📈 Track patterns\n\nWhat would you like to explore?";
      }
      
      const aiResponse: ChatMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: aiContent,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiResponse]);
    }, 800);
  };

  const handleConnectWallet = () => {
    setWalletConnected(true);
    const connectionMsg: ChatMessage = {
      id: Date.now(),
      type: 'agent',
      content: "✅ Wallet connected! I can now provide personalized recommendations based on your voting history and preferences. Try asking: 'What should I vote on?'",
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, connectionMsg]);
  };

  const handleVote = (proposalId: string, support: boolean) => {
    const proposal = mockProposals.find(p => p.id === proposalId);
    const voteType = support ? 'FOR' : 'AGAINST';
    
    const voteMsg: ChatMessage = {
      id: Date.now(),
      type: 'agent',
      content: `✅ **Vote Recorded: ${voteType}**\n\nProposal: ${proposal?.title}\n\nThis is a demo. In production:\n1. ✓ Request wallet signature\n2. ✓ Submit on-chain transaction\n3. ✓ Update voting power\n4. ✓ Log to audit trail\n\nYour vote would be recorded on the blockchain!`,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, voteMsg]);
    setIsChatVisible(true);
  };

  const handleAnalyzeProposal = (proposalId: string) => {
    const proposal = mockProposals.find(p => p.id === proposalId);
    
    const analysisMsg: ChatMessage = {
      id: Date.now(),
      type: 'agent',
      content: `📊 **Deep Analysis: ${proposal?.title}**\n\n**Financial Impact:**\n${proposal?.financialImpact}\n\n**Risk Assessment:**\n• Risk Level: ${proposal?.risk}\n• Risk Score: ${proposal?.riskScore}%\n• Security: ${proposal?.risk === 'HIGH' ? '3 concerns identified' : '1 minor concern'}\n\n**AI Recommendation:**\n${proposal?.recommendation} with ${proposal?.confidence}% confidence\n\n**Reasoning:**\n${proposal?.recommendation === 'FOR' ? '✓ Low financial risk\n✓ Strong community support\n✓ Aligns with DAO goals' : '⚠️ High risk score\n⚠️ Large treasury impact\n→ Wait for security audit'}`,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, analysisMsg]);
    setIsChatVisible(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            x: [0, -10, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                BM
              </div>
              <div>
                <span className="text-white font-bold text-xl">BitMind</span>
                <span className="hidden sm:inline text-xs text-gray-400 ml-2">DAO Governance Co-pilot</span>
              </div>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConnectWallet}
                className={`px-6 py-2 rounded-lg font-medium transition-all shadow-lg text-sm ${
                  walletConnected 
                    ? 'bg-green-600 text-white ring-2 ring-green-400' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {walletConnected ? '✅ Connected' : 'Connect Wallet'}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 mb-6 border border-white/20">
                <span className="text-sm text-blue-300">🚀 ADK-TS Framework</span>
                <span className="text-white/60">•</span>
                <span className="text-sm text-green-300">Multi-Agent System</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                BitMind
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mt-2">
                  Smarter DAOs
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                The AI-powered governance co-pilot that helps DAO members make informed decisions in seconds. 
                Built with <span className="text-blue-400 font-semibold">ADK-TS</span> and custom MCP servers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsChatVisible(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl flex items-center justify-center space-x-2"
                >
                  <span>🚀 Launch Demo</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open('/src/adk-agents/README.md', '_blank')}
                  className="border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
                >
                  <span>📖 Docs</span>
                </motion.button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/10">
                {[
                  { number: '99%', label: 'Faster' },
                  { number: '3', label: 'MCP Servers' },
                  { number: '4', label: 'AI Agents' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Interactive Demo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
                {/* Demo Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-400">Agent Console</div>
                </div>

                {/* Demo Content */}
                <div className="bg-black/50 rounded-xl p-6 min-h-[400px] border border-white/5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeDemo}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{demos[activeDemo].icon}</div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{demos[activeDemo].title}</h3>
                          <p className="text-gray-400 text-sm">{demos[activeDemo].description}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {demos[activeDemo].features.map((feature, index) => (
                          <motion.div
                            key={feature}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-3 text-sm text-gray-300"
                          >
                            <Check className="w-4 h-4 text-green-400" />
                            <span>{feature}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Code Preview */}
                      <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                        <pre className="text-green-400">{demos[activeDemo].code}</pre>
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setIsChatVisible(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
                        >
                          Try It
                        </button>
                        <button className="border border-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors font-medium">
                          View Code
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Dots */}
                <div className="flex justify-center space-x-2 mt-6">
                  {demos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveDemo(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === activeDemo ? 'bg-blue-500 w-8' : 'bg-gray-600 w-2'
                      }`}
                      aria-label={`View demo ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating AI Button */}
              <motion.button
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                onClick={() => setIsChatVisible(true)}
                className="absolute -top-4 -right-4 bg-gradient-to-br from-blue-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl cursor-pointer hover:shadow-blue-500/50 transition-shadow relative"
                title="Chat with BitMind AI"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                />
                🤖
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Proposals Section */}
      {walletConnected && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                🗳️ Active Proposals
              </h2>
              <p className="text-xl text-gray-300">
                AI-analyzed governance proposals with recommendations
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockProposals.map((proposal, index) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-gray-400 font-mono">{proposal.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          proposal.risk === 'HIGH' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {proposal.risk} RISK
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">{proposal.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">{proposal.description}</p>
                  
                  {/* Voting Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>For: {proposal.votesFor.toLocaleString()}</span>
                      <span>Against: {proposal.votesAgainst.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="bg-gradient-to-r from-green-500 to-green-400 h-full"
                      />
                    </div>
                    <div className="text-right text-xs text-blue-400">Ends in {proposal.endsIn}</div>
                  </div>

                  {/* AI Recommendation */}
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-blue-300">🤖 AI Recommends:</span>
                        <span className="text-white font-bold text-sm">{proposal.recommendation}</span>
                      </div>
                      <span className="text-xs text-blue-400">{proposal.confidence}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => handleVote(proposal.id, true)}
                      className="bg-green-600 text-white py-2 rounded-lg text-xs hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>For</span>
                    </button>
                    <button 
                      onClick={() => handleVote(proposal.id, false)}
                      className="bg-red-600 text-white py-2 rounded-lg text-xs hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Against</span>
                    </button>
                    <button 
                      onClick={() => handleAnalyzeProposal(proposal.id)}
                      className="bg-blue-600 text-white py-2 rounded-lg text-xs hover:bg-blue-700 transition-colors font-medium"
                    >
                      Analyze
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setIsChatVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">BitMind Assistant</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-gray-300 text-sm">Online - Ready to help</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatVisible(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900/50">
                <AnimatePresence>
                  {chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-gray-800 text-white rounded-bl-md border border-white/10'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-line leading-relaxed">{message.content}</div>
                        <div className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-200' : 'text-gray-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Quick Suggestions */}
                {chatMessages.length <= 2 && (
                  <div className="pt-4">
                    <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Analyze treasury",
                        "Review PROP-2024-001",
                        "What should I vote?",
                        "Show risk factors"
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setUserMessage(suggestion);
                          }}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs transition-colors border border-white/10"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-6 border-t border-white/10 bg-gray-800/50">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about proposals, treasury, risks, or voting strategies..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!userMessage.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
                  >
                    Send
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsChatVisible(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl shadow-2xl z-50 hover:shadow-blue-500/50 transition-shadow cursor-pointer"
        title="Chat with BitMind"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
        />
        💬
      </motion.button>
    </div>
  );
};

export default BitMindShowcase;

