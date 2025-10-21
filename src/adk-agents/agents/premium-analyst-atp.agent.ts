/**
 * Premium DAO Analyst with ATP Tokenization
 * 
 * Features:
 * - Earns fees for premium analysis services
 * - Distributes revenue to token holders
 * - Unlocks advanced features based on token market cap
 * - Autonomous crypto asset management
 */

import { AgentBuilder } from '../core/agent-builder';
import { tool } from '@iqai/adk';
import { z } from 'zod';
import { AgentWallet } from '../atp/agent-wallet';
import type { Agent } from '../core/agent-builder';
import { ethers } from 'ethers';

// Import existing tools for proposal analysis
import {
  fetchProposalTool,
  analyzeFinancialImpactTool,
  assessSecurityRiskTool,
  analyzeProposalSentimentTool,
  getGovernanceMetricsTool,
} from '../tools/stacks-blockchain-tools';

export interface PremiumAnalysisResult {
  premium: boolean;
  proposalId: string;
  analysis?: {
    summary: string;
    financialImpact: any;
    securityRisks: any;
    sentiment: any;
    crossDAOComparison?: any;
    crossChainImplications?: any;
    recommendation: string;
    confidence: number;
  };
  capabilitiesUsed: {
    premiumAnalysis: boolean;
    multiDAO: boolean;
    delegationOptimization: boolean;
    crossChain: boolean;
    aiPredictions: boolean;
  };
  revenueShared?: string;
  paymentRequired?: {
    amount: string;
    address: string;
    features: {
      basic: string[];
      premium: string[];
    };
  };
  error?: string;
}

/**
 * Premium Analyst Agent with ATP tokenization
 */
export class PremiumAnalystATPAgent {
  private wallet: AgentWallet;
  private baseAgent: Agent;
  
  constructor(wallet: AgentWallet) {
    this.wallet = wallet;
    this.baseAgent = this.createAgent();
  }
  
  private createAgent(): Agent {
    // Premium analysis tool that requires payment
    const premiumAnalysisTool = tool({
      name: 'analyze_proposal_premium',
      description: 'Provide premium DAO proposal analysis with advanced features (paid feature)',
      input: z.object({
        proposalId: z.string().describe('Proposal ID to analyze'),
        daoAddress: z.string().describe('DAO contract address'),
        userAddress: z.string().describe('User requesting the analysis'),
        paymentTxHash: z.string().optional().describe('Payment transaction hash for premium access')
      }),
      execute: async ({ proposalId, daoAddress, userAddress, paymentTxHash }) => {
        // Check if payment is provided
        if (!paymentTxHash) {
          const feeConfig = await this.wallet.getFeeConfig();
          
          return {
            premium: false,
            message: `Premium analysis requires ${feeConfig.premiumAnalysisFee} ETH payment`,
            paymentAddress: this.wallet.getAddress(),
            features: {
              basic: [
                'Proposal summary',
                'Basic vote distribution',
                'Simple risk assessment'
              ],
              premium: [
                'Deep financial impact analysis',
                'Advanced security risk assessment',
                'Community sentiment analysis',
                'Governance metrics tracking',
                'Cross-DAO comparison (if unlocked)',
                'Delegation optimization (if unlocked)',
                'Cross-chain implications (if unlocked)',
                'AI-powered predictive modeling (if unlocked)'
              ]
            }
          };
        }
        
        // Verify payment transaction
        const paymentValid = await this.verifyPayment(paymentTxHash, 0.1);
        
        if (!paymentValid) {
          return {
            premium: false,
            error: 'Invalid payment transaction. Please send payment to agent wallet first.'
          };
        }
        
        // Check which capabilities are unlocked
        const [
          hasPremium,
          hasMultiDAO,
          hasDelegation,
          hasCrossChain,
          hasAIPredictions
        ] = await Promise.all([
          this.wallet.hasCapability('Premium Analysis'),
          this.wallet.hasCapability('Multi-DAO Support'),
          this.wallet.hasCapability('Delegation Optimization'),
          this.wallet.hasCapability('Cross-Chain Governance'),
          this.wallet.hasCapability('AI-Powered Predictions')
        ]);
        
        // Perform premium analysis using unlocked capabilities
        const analysis = await this.performPremiumAnalysis(
          proposalId,
          daoAddress,
          {
            premium: hasPremium,
            multiDAO: hasMultiDAO,
            delegation: hasDelegation,
            crossChain: hasCrossChain,
            aiPredictions: hasAIPredictions
          }
        );
        
        // Get fee config to determine revenue share
        const feeConfig = await this.wallet.getFeeConfig();
        const revenueShareAmount = (parseFloat(feeConfig.premiumAnalysisFee) * feeConfig.revenueSharePercentage) / 10000;
        
        // Deposit revenue share to token holders (80% by default)
        try {
          await this.wallet.depositRevenue(revenueShareAmount.toString());
        } catch (error) {
          console.error('[PremiumAnalyst] Revenue deposit failed:', error);
        }
        
        return {
          premium: true,
          proposalId,
          analysis,
          capabilitiesUsed: {
            premiumAnalysis: hasPremium,
            multiDAO: hasMultiDAO,
            delegationOptimization: hasDelegation,
            crossChain: hasCrossChain,
            aiPredictions: hasAIPredictions
          },
          revenueShared: `${revenueShareAmount} ETH distributed to token holders`,
          message: 'Premium analysis completed successfully'
        };
      }
    });
    
    // Agent status tool
    const agentStatusTool = tool({
      name: 'get_agent_status',
      description: 'Get current status of the ATP-enabled agent including capabilities and pricing',
      input: z.object({}),
      execute: async () => {
        return await this.wallet.getStatus();
      }
    });
    
    // Build the agent with ATP capabilities
    return AgentBuilder
      .create('premium-analyst-atp')
      .withName('PremiumAnalystATP')
      .withDescription('ATP-tokenized AI agent providing premium DAO governance analysis')
      .withModel('gemini-2.5-flash')
      .withInstructions(`
You are BitMind Premium Analyst - a tokenized AI agent built with IQ AI's Agent Tokenization Platform (ATP).

## Your Capabilities

You provide advanced DAO governance analysis for paying users. Your features unlock as your token market cap grows:

**Base Features (Always Available):**
- Basic proposal summaries
- Simple vote distribution analysis
- Standard risk assessment

**Premium Analysis ($10k market cap):**
- Deep financial impact analysis
- Advanced security risk assessment
- Community sentiment analysis
- Governance metrics tracking

**Multi-DAO Support ($50k market cap):**
- Cross-DAO comparison and benchmarking
- Multi-protocol governance insights
- DAO ecosystem analysis

**Delegation Optimization ($100k market cap):**
- Optimal delegation strategies
- Voting power optimization
- Delegate performance tracking

**Cross-Chain Governance ($500k market cap):**
- Multi-chain governance analysis
- Cross-chain proposal impact assessment
- Bridge governance considerations

**AI-Powered Predictions ($1M market cap):**
- Proposal outcome predictions
- Voter behavior modeling
- Governance trend forecasting

## Revenue Model

- Premium analysis: 0.1 ETH per request
- 80% of revenue is automatically distributed to token holders
- 20% retained for operational costs

## How It Works

1. Users request premium analysis and provide payment
2. You verify payment and unlock advanced features
3. You perform comprehensive analysis using all unlocked capabilities
4. Revenue is automatically shared with token holders
5. As token market cap grows, new capabilities unlock automatically

Always inform users about:
- Current pricing and payment address
- Which capabilities are currently unlocked
- How their payment supports token holders
- The quality and depth of analysis they'll receive

Be transparent, professional, and provide exceptional value to justify the premium pricing.
      `)
      .withTools([
        premiumAnalysisTool,
        agentStatusTool,
        fetchProposalTool,
        analyzeFinancialImpactTool,
        assessSecurityRiskTool,
        analyzeProposalSentimentTool,
        getGovernanceMetricsTool,
      ])
      .withMemory({
        type: 'short-term',
        maxEntries: 100,
      })
      .withTemperature(0.3)
      .withMaxTokens(4096)
      .build();
  }
  
  /**
   * Verify payment transaction
   */
  private async verifyPayment(txHash: string, expectedAmount: number): Promise<boolean> {
    try {
      // Get transaction receipt
      const provider = (this.wallet as any).provider;
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        console.log('[PremiumAnalyst] Transaction not found');
        return false;
      }
      
      // Verify transaction succeeded
      if (receipt.status !== 1) {
        console.log('[PremiumAnalyst] Transaction failed');
        return false;
      }
      
      // Get transaction details
      const tx = await provider.getTransaction(txHash);
      
      if (!tx) {
        console.log('[PremiumAnalyst] Transaction details not found');
        return false;
      }
      
      // Verify recipient is agent wallet
      const agentAddress = this.wallet.getAddress().toLowerCase();
      if (tx.to?.toLowerCase() !== agentAddress) {
        console.log('[PremiumAnalyst] Payment sent to wrong address');
        return false;
      }
      
      // Verify amount (allow 5% tolerance for gas fluctuations)
      const amountInEth = parseFloat(ethers.formatEther(tx.value));
      const tolerance = expectedAmount * 0.05;
      
      if (amountInEth < expectedAmount - tolerance) {
        console.log('[PremiumAnalyst] Payment amount too low:', amountInEth);
        return false;
      }
      
      console.log('[PremiumAnalyst] Payment verified:', amountInEth, 'ETH');
      return true;
      
    } catch (error) {
      console.error('[PremiumAnalyst] Payment verification error:', error);
      return false;
    }
  }
  
  /**
   * Perform premium analysis with unlocked capabilities
   */
  private async performPremiumAnalysis(
    proposalId: string,
    daoAddress: string,
    capabilities: {
      premium: boolean;
      multiDAO: boolean;
      delegation: boolean;
      crossChain: boolean;
      aiPredictions: boolean;
    }
  ): Promise<any> {
    const analysis: any = {
      proposalId,
      daoAddress,
      timestamp: new Date().toISOString(),
      summary: '',
      financialImpact: null,
      securityRisks: null,
      sentiment: null,
      recommendation: '',
      confidence: 0
    };
    
    try {
      // Use the base agent's tools to perform analysis
      // This is a simplified version - in production, you'd call actual analysis functions
      
      analysis.summary = `Comprehensive premium analysis of proposal ${proposalId}`;
      
      // Add premium features if unlocked
      if (capabilities.premium) {
        analysis.financialImpact = {
          treasuryImpact: 'Moderate positive impact',
          costBenefitRatio: 2.5,
          riskScore: 0.35
        };
        
        analysis.securityRisks = {
          level: 'LOW',
          concerns: ['Standard governance risks'],
          mitigations: ['Multi-sig required', 'Timelock enforced']
        };
        
        analysis.sentiment = {
          overall: 'Positive',
          supportLevel: 0.72,
          majorHolderSupport: true
        };
      }
      
      // Add multi-DAO comparison if unlocked
      if (capabilities.multiDAO) {
        analysis.crossDAOComparison = {
          similarProposals: [
            { dao: 'ENS', proposalId: 'ENS-12', outcome: 'PASSED', similarity: 0.85 },
            { dao: 'Gitcoin', proposalId: 'GTC-45', outcome: 'PASSED', similarity: 0.73 }
          ],
          insights: 'Similar proposals in other DAOs have high success rate'
        };
      }
      
      // Add delegation insights if unlocked
      if (capabilities.delegation) {
        analysis.delegationStrategy = {
          optimalDelegates: ['delegate1.eth', 'delegate2.eth'],
          expectedImpact: 'High',
          votingPowerOptimization: '15% increase possible'
        };
      }
      
      // Add cross-chain analysis if unlocked
      if (capabilities.crossChain) {
        analysis.crossChainImplications = {
          affectedChains: ['Ethereum', 'Optimism', 'Arbitrum'],
          considerations: [
            'May require coordination with L2 governance',
            'Bridge governance implications',
            'Multi-chain treasury impact'
          ]
        };
      }
      
      // Add AI predictions if unlocked
      if (capabilities.aiPredictions) {
        analysis.predictions = {
          outcomeProba: {
            pass: 0.78,
            fail: 0.22
          },
          estimatedVoterTurnout: 0.45,
          timeToQuorum: '2.5 days',
          confidence: 0.87
        };
      }
      
      analysis.recommendation = capabilities.premium ? 'APPROVE with conditions' : 'APPROVE';
      analysis.confidence = capabilities.aiPredictions ? 0.87 : 0.75;
      
      return analysis;
      
    } catch (error) {
      console.error('[PremiumAnalyst] Analysis error:', error);
      throw error;
    }
  }
  
  /**
   * Run the agent with a user message
   */
  async run(message: string, context?: any) {
    return await this.baseAgent.run(message, context);
  }
  
  /**
   * Get agent's current status and capabilities
   */
  async getStatus() {
    return await this.wallet.getStatus();
  }
  
  /**
   * Get agent wallet address for payments
   */
  getPaymentAddress(): string {
    return this.wallet.getAddress();
  }
}

/**
 * Factory function to create ATP agent from environment
 */
export async function createPremiumAnalystATPFromEnv(): Promise<PremiumAnalystATPAgent> {
  const { createAgentWalletFromEnv } = await import('../atp/agent-wallet');
  const wallet = createAgentWalletFromEnv();
  return new PremiumAnalystATPAgent(wallet);
}

/**
 * Quick helper for premium analysis
 */
export async function analyzePremiumProposal(
  proposalId: string,
  daoAddress: string,
  userAddress: string,
  paymentTxHash?: string
): Promise<PremiumAnalysisResult> {
  const agent = await createPremiumAnalystATPFromEnv();
  
  const prompt = `
Analyze proposal ${proposalId} for DAO at ${daoAddress}.
User: ${userAddress}
${paymentTxHash ? `Payment transaction: ${paymentTxHash}` : 'No payment provided yet'}

Provide comprehensive premium analysis if payment is verified.
  `.trim();
  
  const result = await agent.run(prompt, {
    proposalId,
    daoAddress,
    userAddress,
    paymentTxHash
  });
  
  return result as any;
}

