/**
 * Blockchain Integration Tools for ADK-TS Agents
 * Real Stacks blockchain integration for wallet connection and DAO governance
 */

import { z } from 'zod';
import { tool } from '../core/tool-factory';
import { walletConnector } from '../blockchain/stacks-wallet-connector';
import { daoGovernanceContract, StacksContractCaller } from '../blockchain/stacks-contract-caller';
import type { BaseTool } from '../core/agent-builder';

// ==================== SCHEMAS ====================

export const ConnectWalletSchema = z.object({
  autoConnect: z.boolean().optional(),
});

export const CastVoteSchema = z.object({
  proposalId: z.number(),
  support: z.enum(['for', 'against', 'abstain']),
  reason: z.string().optional(),
});

export const CreateProposalSchema = z.object({
  title: z.string(),
  description: z.string(),
  actions: z.array(z.object({
    target: z.string(),
    functionName: z.string(),
    functionArgs: z.array(z.any()),
  })),
});

export const GetProposalSchema = z.object({
  proposalId: z.number(),
});

export const GetVotingPowerSchema = z.object({
  address: z.string(),
  blockHeight: z.number().optional(),
});

// ==================== WALLET TOOLS ====================

export const connectWalletTool: BaseTool = {
  name: 'connect_wallet',
  description: 'Connect to user\'s Stacks wallet (Hiro, Xverse, etc.) for blockchain interactions',
  inputSchema: ConnectWalletSchema,
  execute: async (input: z.infer<typeof ConnectWalletSchema>) => {
    try {
      const connection = await walletConnector.connectWallet();
      return {
        success: true,
        address: connection.address,
        network: connection.network,
        message: `Wallet connected successfully: ${connection.address}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      };
    }
  },
};

export const getWalletConnectionTool: BaseTool = {
  name: 'get_wallet_connection',
  description: 'Get current wallet connection status and address',
  inputSchema: z.object({}),
  execute: async () => {
    const connection = walletConnector.getWalletConnection();
    
    if (!connection) {
      return {
        isConnected: false,
        message: 'No wallet connected',
      };
    }

    return {
      isConnected: true,
      address: connection.address,
      network: connection.network,
      publicKey: connection.publicKey,
    };
  },
};

export const disconnectWalletTool: BaseTool = {
  name: 'disconnect_wallet',
  description: 'Disconnect the current wallet',
  inputSchema: z.object({}),
  execute: async () => {
    await walletConnector.disconnectWallet();
    return {
      success: true,
      message: 'Wallet disconnected successfully',
    };
  },
};

// ==================== DAO GOVERNANCE TOOLS ====================

export const castVoteTool: BaseTool = {
  name: 'cast_vote_on_chain',
  description: 'Cast a vote on a DAO proposal on-chain (HIGH RISK - requires wallet signature)',
  inputSchema: CastVoteSchema,
  execute: async (input: z.infer<typeof CastVoteSchema>) => {
    try {
      const result = await daoGovernanceContract.castVote({
        proposalId: input.proposalId,
        support: input.support,
        reason: input.reason,
      });

      return {
        success: true,
        txId: result.txId,
        status: result.status,
        message: `Vote cast successfully! Transaction: ${result.txId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cast vote',
      };
    }
  },
};

export const createProposalTool: BaseTool = {
  name: 'create_proposal_on_chain',
  description: 'Create a new DAO proposal on-chain (requires minimum token balance)',
  inputSchema: CreateProposalSchema,
  execute: async (input: z.infer<typeof CreateProposalSchema>) => {
    try {
      const result = await daoGovernanceContract.createProposal(
        input.title,
        input.description,
        input.actions
      );

      return {
        success: true,
        proposalId: result.proposalId,
        txId: result.txId,
        message: `Proposal created successfully! ID: ${result.proposalId}, TX: ${result.txId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create proposal',
      };
    }
  },
};

export const executeProposalTool: BaseTool = {
  name: 'execute_proposal',
  description: 'Execute a passed proposal on-chain (requires proposal to have passed)',
  inputSchema: GetProposalSchema,
  execute: async (input: z.infer<typeof GetProposalSchema>) => {
    try {
      const result = await daoGovernanceContract.executeProposal(input.proposalId);

      return {
        success: true,
        txId: result.txId,
        message: `Proposal ${input.proposalId} executed successfully! TX: ${result.txId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute proposal',
      };
    }
  },
};

export const getProposalOnChainTool: BaseTool = {
  name: 'get_proposal_on_chain',
  description: 'Get proposal data directly from the Stacks blockchain',
  inputSchema: GetProposalSchema,
  execute: async (input: z.infer<typeof GetProposalSchema>) => {
    try {
      const proposal = await daoGovernanceContract.getProposal(input.proposalId);
      const state = await daoGovernanceContract.getProposalState(input.proposalId);

      return {
        success: true,
        proposal: {
          ...proposal,
          state,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get proposal',
      };
    }
  },
};

export const getVotingPowerOnChainTool: BaseTool = {
  name: 'get_voting_power_on_chain',
  description: 'Get voting power for an address from the blockchain',
  inputSchema: GetVotingPowerSchema,
  execute: async (input: z.infer<typeof GetVotingPowerSchema>) => {
    try {
      const votingPower = await daoGovernanceContract.getVotingPower(
        input.address,
        input.blockHeight
      );

      return {
        success: true,
        address: input.address,
        votingPower,
        blockHeight: input.blockHeight,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get voting power',
      };
    }
  },
};

export const hasVotedTool: BaseTool = {
  name: 'check_has_voted',
  description: 'Check if an address has already voted on a proposal',
  inputSchema: z.object({
    proposalId: z.number(),
    address: z.string(),
  }),
  execute: async (input) => {
    try {
      const hasVoted = await daoGovernanceContract.hasVoted(
        input.proposalId,
        input.address
      );

      return {
        success: true,
        proposalId: input.proposalId,
        address: input.address,
        hasVoted,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check vote status',
      };
    }
  },
};

// ==================== EXPORT ALL BLOCKCHAIN TOOLS ====================

export const blockchainIntegrationTools: BaseTool[] = [
  connectWalletTool,
  getWalletConnectionTool,
  disconnectWalletTool,
  castVoteTool,
  createProposalTool,
  executeProposalTool,
  getProposalOnChainTool,
  getVotingPowerOnChainTool,
  hasVotedTool,
];

