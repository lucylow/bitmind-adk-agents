/**
 * x402 Payment Protocol Integration
 * 
 * Implements HTTP 402 Payment Required protocol for instant crypto micropayments
 * Works alongside ATP tokenization for flexible payment options
 */

import { tool } from '@iqai/adk';
import { z } from 'zod';
import { ethers } from 'ethers';

// USDC contract ABI (minimal)
const USDC_ABI = [
  'function receiveWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) external',
  'function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) external',
  'function balanceOf(address) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)'
];

export interface X402PaymentRequest {
  status: 402;
  message: 'Payment Required';
  payment: {
    maxAmountRequired: string;
    asset: string;
    network: string;
    payTo: string;
    resource: string;
    description: string;
    validUntil: number;
    metadata?: Record<string, any>;
  };
}

/**
 * Feature pricing configuration
 */
export const FEATURE_PRICING = {
  premium_analysis: '0.10', // USDC
  cross_dao_comparison: '0.05',
  delegation_optimization: '0.15',
  custom_strategy: '0.25',
  risk_modeling: '0.20',
  predictive_analysis: '0.30'
} as const;

/**
 * x402 Payment Tool - Request payment for premium features
 */
export const x402PaymentTool = tool({
  name: 'require_payment',
  description: 'Request instant payment via x402 protocol for premium DAO governance analysis features',
  input: z.object({
    feature: z.enum([
      'premium_analysis',
      'cross_dao_comparison',
      'delegation_optimization',
      'custom_strategy',
      'risk_modeling',
      'predictive_analysis'
    ]).describe('Premium feature to unlock'),
    userAddress: z.string().describe('User wallet address'),
    proposalId: z.string().optional().describe('Proposal ID being analyzed'),
    customAmount: z.string().optional().describe('Custom payment amount (overrides default)')
  }),
  execute: async ({ feature, userAddress, proposalId, customAmount }) => {
    const amount = customAmount || FEATURE_PRICING[feature];
    
    // Generate unique nonce for this payment request
    const nonce = ethers.id(`${feature}-${userAddress}-${Date.now()}`);
    
    // Payment request following x402 specification
    const paymentRequest: X402PaymentRequest = {
      status: 402,
      message: 'Payment Required',
      payment: {
        maxAmountRequired: amount,
        asset: process.env.USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
        network: process.env.PAYMENT_NETWORK || 'base-sepolia',
        payTo: process.env.PAYMENT_RECEIVER_ADDRESS!,
        resource: `/api/premium/${feature}${proposalId ? `/${proposalId}` : ''}`,
        description: getFeatureDescription(feature),
        validUntil: Date.now() + 3600000, // 1 hour
        metadata: {
          feature,
          proposalId,
          nonce,
          timestamp: Date.now()
        }
      }
    };
    
    console.log(`[x402] Payment requested: ${amount} USDC for ${feature}`);
    
    return paymentRequest;
  }
});

/**
 * Verify x402 Payment Tool
 */
export const verifyPaymentTool = tool({
  name: 'verify_payment',
  description: 'Verify x402 payment proof and grant access to premium features',
  input: z.object({
    paymentProof: z.string().describe('X-PAYMENT header value (base64 encoded proof)'),
    expectedAmount: z.string().describe('Expected payment amount in USDC'),
    resource: z.string().describe('Resource being accessed'),
    feature: z.string().describe('Feature being unlocked')
  }),
  execute: async ({ paymentProof, expectedAmount, resource, feature }) => {
    try {
      // Parse payment proof (ERC-3009 TransferWithAuthorization signature)
      const proof = JSON.parse(Buffer.from(paymentProof, 'base64').toString('utf-8'));
      
      console.log(`[x402] Verifying payment for ${feature}...`);
      
      // Initialize provider and USDC contract
      const provider = new ethers.JsonRpcProvider(
        process.env.BASE_RPC_URL || 'https://sepolia.base.org'
      );
      
      const usdcAddress = process.env.USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
      const usdcContract = new ethers.Contract(usdcAddress, USDC_ABI, provider);
      
      // Verify amount
      const expectedAmountWei = ethers.parseUnits(expectedAmount, 6); // USDC has 6 decimals
      const providedAmount = BigInt(proof.value);
      
      if (providedAmount < expectedAmountWei) {
        console.log(`[x402] Insufficient amount: ${ethers.formatUnits(providedAmount, 6)} < ${expectedAmount}`);
        return {
          verified: false,
          error: 'Insufficient payment amount',
          expected: expectedAmount,
          received: ethers.formatUnits(providedAmount, 6)
        };
      }
      
      // Verify signature and execute transfer
      // In production, you'd verify the signature matches the authorization
      const wallet = new ethers.Wallet(process.env.PAYMENT_RECEIVER_PRIVATE_KEY!, provider);
      const usdcWithSigner = usdcContract.connect(wallet);
      
      try {
        // Execute the receiveWithAuthorization transaction
        const tx = await usdcWithSigner.receiveWithAuthorization(
          proof.from,
          proof.to,
          proof.value,
          proof.validAfter,
          proof.validBefore,
          proof.nonce,
          proof.v,
          proof.r,
          proof.s,
          {
            gasLimit: 200000
          }
        );
        
        console.log(`[x402] Payment transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        
        console.log(`[x402] Payment verified! Tx: ${receipt.hash}`);
        
        // Generate access token (valid for 24 hours)
        const accessToken = generateAccessToken(proof.from, feature, resource);
        
        return {
          verified: true,
          txHash: receipt.hash,
          access: {
            resource,
            feature,
            token: accessToken,
            expiresAt: Date.now() + 86400000 // 24 hours
          },
          amount: ethers.formatUnits(proof.value, 6),
          from: proof.from
        };
        
      } catch (txError: any) {
        console.error(`[x402] Transaction failed:`, txError);
        
        // Check if already executed
        if (txError.message.includes('nonce')) {
          return {
            verified: false,
            error: 'Payment authorization already used or invalid nonce'
          };
        }
        
        return {
          verified: false,
          error: `Transaction failed: ${txError.message}`
        };
      }
      
    } catch (error: any) {
      console.error(`[x402] Payment verification error:`, error);
      return {
        verified: false,
        error: `Verification failed: ${error.message}`
      };
    }
  }
});

/**
 * Check Payment Access Tool
 */
export const checkPaymentAccessTool = tool({
  name: 'check_payment_access',
  description: 'Check if user has valid payment access to a feature',
  input: z.object({
    accessToken: z.string().describe('Access token from payment verification'),
    feature: z.string().describe('Feature to check access for')
  }),
  execute: async ({ accessToken, feature }) => {
    try {
      const decoded = verifyAccessToken(accessToken);
      
      if (!decoded) {
        return {
          hasAccess: false,
          error: 'Invalid or expired access token'
        };
      }
      
      if (decoded.feature !== feature) {
        return {
          hasAccess: false,
          error: 'Access token not valid for this feature'
        };
      }
      
      return {
        hasAccess: true,
        feature: decoded.feature,
        expiresAt: decoded.expiresAt,
        userAddress: decoded.userAddress
      };
      
    } catch (error: any) {
      return {
        hasAccess: false,
        error: error.message
      };
    }
  }
});

/**
 * Helper: Get feature description for payment request
 */
function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    premium_analysis: 'Deep DAO proposal analysis with financial impact modeling and risk assessment',
    cross_dao_comparison: 'Compare proposal against similar decisions in other DAOs',
    delegation_optimization: 'Get optimal delegation strategy for your voting power',
    custom_strategy: 'Personalized voting strategy based on your preferences and history',
    risk_modeling: 'Advanced risk quantification and Monte Carlo simulations',
    predictive_analysis: 'AI-powered prediction of proposal outcomes and impacts'
  };
  
  return descriptions[feature] || 'Premium DAO governance feature';
}

/**
 * Helper: Generate access token
 */
function generateAccessToken(userAddress: string, feature: string, resource: string): string {
  const payload = {
    userAddress,
    feature,
    resource,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 86400000 // 24 hours
  };
  
  // In production, use proper JWT signing
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  return token;
}

/**
 * Helper: Verify access token
 */
function verifyAccessToken(token: string): any {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    
    if (decoded.expiresAt < Date.now()) {
      return null; // Expired
    }
    
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Helper: Format x402 response for HTTP
 */
export function formatX402Response(paymentRequest: X402PaymentRequest): {
  status: number;
  headers: Record<string, string>;
  body: any;
} {
  return {
    status: 402,
    headers: {
      'Content-Type': 'application/json',
      'X-Payment-Required': 'true',
      'X-Payment-Network': paymentRequest.payment.network,
      'X-Payment-Asset': paymentRequest.payment.asset,
      'X-Payment-Amount': paymentRequest.payment.maxAmountRequired
    },
    body: paymentRequest
  };
}

/**
 * Export all x402 tools
 */
export const x402Tools = [
  x402PaymentTool,
  verifyPaymentTool,
  checkPaymentAccessTool
];

