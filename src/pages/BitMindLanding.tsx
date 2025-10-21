import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Activity, Shield, Zap, Users, ChevronRight, X, Check } from 'lucide-react';

/**
 * BitMind Landing Page
 * Interactive showcase for DAO Governance Co-pilot
 */

export default function BitMindLanding() {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { 
      id: 1, 
      type: 'agent', 
      content: "Hello! I'm your BitMind DAO Governance Co-pilot. I can analyze proposals, assess treasury risks, and provide voting recommendations. What would you like to know?", 
      timestamp: new Date() 
    }
  ]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [activeProposal, setActiveProposal] = useState(null);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const demos = [
    {
      title: "Proposal Analysis",
      description: "AI-powered deep analysis of governance proposals",
      icon: "📊",
      features: ["Financial Impact Assessment", "Multi-Dimensional Risk Scoring", "Historical Comparison"],
      code: `const analysis = await proposalAnalyst\n  .analyze("PROP-2024-001")\n  .withRiskAssessment()\n  .withFinancialImpact();\n\n// Results:\n// Risk: MEDIUM (35%)\n// Cost: $500K\n// Treasury Impact: 5%`
    },
    {
      title: "Multi-Agent System",
      description: "Specialized agents working together via ADK-TS",
      icon: "🤖",
      features: ["Proposal Analyst", "Voting Strategist", "Treasury Monitor"],
      code: `const workflow = new GovernanceWorkflow();\n\nconst result = await workflow.execute({\n  proposalId: "PROP-001",\n  daoAddress: "0xDAO...",\n  userContext: preferences\n});`
    },
    {
      title: "MCP Servers",
      description: "Custom Model Context Protocol servers for blockchain",
      icon: "⚡",
      features: ["Blockchain Data", "Governance Platforms", "Risk Assessment"],
      code: `const servers = createMCPServers();\n\nconst treasury = await servers\n  .blockchainData\n  .getTreasuryBalance(daoAddress);\n\n// $5.25M total value\n// Health Score: 78%`
    }
  ];

  // Mock proposals for interactive demo
  const mockProposals = [
    {
      id: "PROP-2024-001",
      title: "Treasury Diversification Strategy",
      description: "Allocate 15% of treasury to stablecoins and low-risk DeFi yield strategies to improve resilience",
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
      title: "Protocol Upgrade v2.1 - Enhanced Security",
      description: "Comprehensive smart contract upgrades including gas optimization, security patches, and new governance features",
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
  }, []);

  const handleSendMessage = () => {
    if (!userMessage.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newUserMessage]);
    setUserMessage('');

    // Simulate AI response based on keywords
    setTimeout(() => {
      let aiContent = '';
      const msg = userMessage.toLowerCase();
      
      if (msg.includes('proposal') || msg.includes('analyze')) {
        aiContent = "I can analyze any DAO proposal for you! Just provide the proposal ID and DAO address. I'll assess:\n\n✓ Financial impact on treasury\n✓ Security risks and concerns\n✓ Voting recommendation based on your preferences\n✓ Historical comparison with similar proposals\n\nWould you like me to analyze a specific proposal?";
      } else if (msg.includes('treasury') || msg.includes('balance')) {
        aiContent = "I'm monitoring the DAO treasury in real-time. Current status:\n\n💰 Total Value: $5.25M\n📊 Health Score: 78%\n⚠️ 2 alerts detected\n\nTop holdings:\n• ETH: $3.5M (67%)\n• USDC: $1.5M (29%)\n• DAI: $250K (4%)\n\nRecommendation: Increase stablecoin ratio for better liquidity.";
      } else if (msg.includes('vote') || msg.includes('recommend')) {
        aiContent = "Based on your voting history and risk tolerance (moderate), I recommend:\n\n🗳️ **PROP-2024-001**: Vote FOR (82% confidence)\nReasons:\n✓ Low financial risk\n✓ Aligns with treasury diversification goals\n✓ Strong community support\n\n🗳️ **PROP-2024-002**: ABSTAIN (68% confidence)\nReasons:\n⚠️ High risk score (65%)\n~ Mixed community sentiment\n→ Recommend waiting for security audit";
      } else {
        aiContent = "I'm here to help with DAO governance! I can:\n\n📊 Analyze proposals\n💰 Monitor treasury health\n🗳️ Generate voting recommendations\n🔍 Assess risks\n📈 Track historical patterns\n\nWhat would you like to explore?";
      }
      
      const aiResponse = {
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
    setTimeout(() => {
      setActiveProposal(mockProposals[0]);
    }, 500);
  };

  const handleVote = (proposalId: string, support: boolean) => {
    const proposal = mockProposals.find(p => p.id === proposalId);
    const voteType = support ? 'FOR' : 'AGAINST';
    
    const confirmMessage = {
      id: Date.now(),
      type: 'agent',
      content: `✅ Vote recorded: ${voteType} on ${proposal?.title}\n\nThis is a simulation. In production, this would:\n1. Request wallet signature\n2. Submit transaction on-chain\n3. Update voting power\n4. Log to audit trail`,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, confirmMessage]);
    setIsChatVisible(true);
  };

  const handleAnalyzeProposal = (proposalId: string) => {
    const proposal = mockProposals.find(p => p.id === proposalId);
    
    const analysisMessage = {
      id: Date.now(),
      type: 'agent',
      content: `📊 **Analysis for ${proposal?.title}**\n\n**Financial Impact:**\n${proposal?.financialImpact}\n\n**Risk Assessment:**\nRisk Level: ${proposal?.risk} (${proposal?.riskScore}%)\n\n**Recommendation:**\n${proposal?.recommendation} with ${proposal?.confidence}% confidence\n\n**Key Considerations:**\n✓ Treasury can sustain this allocation\n⚠️ Monitor yield strategies closely\n→ Review security audits before execution`,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, analysisMessage]);
    setIsChatVisible(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
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
              <span className="text-white font-bold text-xl">BitMind</span>
              <span className="hidden sm:inline text-xs text-gray-400 ml-2">DAO Governance Co-pilot</span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'Architecture', 'Demo', 'ADK-TS'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className="text-gray-300 hover:text-white transition-colors font-medium text-sm"
                >
                  {item}
                </a>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConnectWallet}
                className={`px-6 py-2 rounded-lg font-medium transition-all shadow-lg ${
                  walletConnected 
                    ? 'bg-green-600 text-white ring-2 ring-green-400' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {walletConnected ? '✅ Connected' : 'Connect Wallet'}
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/80 backdrop-blur-lg border-b border-white/10"
            >
              <div className="px-4 py-4 space-y-4">
                {['Features', 'Architecture', 'Demo', 'ADK-TS'].map((item) => (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase()}`} 
                    className="block text-gray-300 hover:text-white transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <button 
                  onClick={() => {
                    handleConnectWallet();
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-6 py-2 rounded-lg font-medium transition-all ${
                    walletConnected 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  }`}
                >
                  {walletConnected ? '✅ Connected' : 'Connect Wallet'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                <span className="text-sm text-blue-300">🚀 Built with ADK-TS</span>
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
                The AI-powered governance co-pilot that helps DAO members make informed decisions. 
                Built with <span className="text-blue-400 font-semibold">ADK-TS</span> to deliver 
                multi-agent intelligence for decentralized governance.
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
                  onClick={() => window.location.href = '/src/adk-agents/README.md'}
                  className="border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
                >
                  <span>📖 Documentation</span>
                </motion.button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/10">
                {[
                  { number: '99%', label: 'Faster Analysis' },
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
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-400">BitMind Agent Console</div>
                </div>

                {/* Interactive Demo Content */}
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

                      <div className="space-y-3">
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
                      <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                        <pre className="text-green-400">{demos[activeDemo].code}</pre>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium">
                          Run Analysis
                        </button>
                        <button className="border border-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors font-medium">
                          View Code
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Demo Navigation */}
                <div className="flex justify-center space-x-2 mt-6">
                  {demos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveDemo(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === activeDemo ? 'bg-blue-500 w-8' : 'bg-gray-600 w-2'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating AI Assistant Button */}
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

      {/* Live Proposal Feed Section */}
      {walletConnected && (
        <section id="proposals" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20 relative z-10">
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
                Real-time governance proposals analyzed by BitMind AI agents
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
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
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
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{proposal.description}</p>
                  
                  {/* Voting Stats */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">For</span>
                      <span className="text-green-400 font-semibold">{proposal.votesFor.toLocaleString()}</span>
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
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Against</span>
                      <span className="text-red-400 font-semibold">{proposal.votesAgainst.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-3 border-t border-white/10">
                      <span className="text-gray-400">Ends In</span>
                      <span className="text-blue-400 font-semibold">{proposal.endsIn}</span>
                    </div>
                  </div>

                  {/* AI Recommendation Badge */}
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-blue-300">🤖 AI Recommendation:</span>
                        <span className="text-white font-bold">{proposal.recommendation}</span>
                      </div>
                      <span className="text-sm text-blue-400">{proposal.confidence}% confidence</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => handleVote(proposal.id, true)}
                      className="bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>For</span>
                    </button>
                    <button 
                      onClick={() => handleVote(proposal.id, false)}
                      className="bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Against</span>
                    </button>
                    <button 
                      onClick={() => handleAnalyzeProposal(proposal.id)}
                      className="bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
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

      {/* ADK-TS Integration Section */}
      <section id="adk-ts" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Powered by <span className="text-blue-400">ADK-TS</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Leveraging IQ AI's Agent Development Kit to build production-grade 
              multi-agent systems for DAO governance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🤖",
                title: "Multi-Agent System",
                description: "4 specialized agents working together",
                details: ["Proposal Analyst", "Voting Strategist", "Treasury Monitor", "Orchestrator"]
              },
              {
                icon: "🔧",
                title: "Custom Tools",
                description: "20+ blockchain-integrated tools",
                details: ["Web3 Integration", "The Graph Queries", "Snapshot API", "Tally API"]
              },
              {
                icon: "📡",
                title: "MCP Servers",
                description: "3 custom Model Context Protocol servers",
                details: ["Blockchain Data", "Governance Platforms", "Risk Assessment", "Real-time Updates"]
              },
              {
                icon: "🎯",
                title: "Type Safety",
                description: "Full TypeScript with Zod validation",
                details: ["Schema Validation", "Error Handling", "Type Inference", "Runtime Checks"]
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all group cursor-pointer"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-1">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-center space-x-2">
                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Chat Modal */}
      <AnimatePresence>
        {isChatVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
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
              {/* Chat Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">BitMind Assistant</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-gray-300 text-sm">Online - Ready to analyze</p>
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

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900/50">
                <AnimatePresence initial={false}>
                  {chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
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

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 justify-center pt-4">
                  {[
                    "Analyze treasury health",
                    "Review proposal PROP-2024-001",
                    "What's my voting power?",
                    "Show risk assessment"
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setUserMessage(suggestion);
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs transition-colors border border-white/10"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-white/10 bg-gray-800/50">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about proposals, treasury, risk analysis, or voting strategies..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
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

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-3xl p-12 border border-white/10"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Transform DAO Governance?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Experience the future of decentralized decision-making with BitMind's AI-powered co-pilot.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsChatVisible(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl flex items-center justify-center space-x-2"
              >
                <span>🚀 Launch Live Demo</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
              >
                <span>📚 View on GitHub</span>
              </motion.button>
            </div>
            <p className="text-gray-400 text-sm mt-6">
              Built with ❤️ for the IQ AI Hackathon 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                BM
              </div>
              <span className="text-white font-bold text-lg">BitMind</span>
            </div>
            <div className="text-gray-400 text-sm text-center">
              © 2025 BitMind - The Collective Intelligence for Smarter DAOs
            </div>
            <div className="flex items-center space-x-6">
              {['GitHub', 'Docs', 'Discord'].map((link) => (
                <a key={link} href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button (Always Visible) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsChatVisible(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl shadow-2xl z-50 hover:shadow-blue-500/50 transition-shadow cursor-pointer"
        title="Chat with BitMind AI"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
        />
        💬
      </motion.button>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
}

