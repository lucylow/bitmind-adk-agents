/**
 * Stacks Contract Caller
 * Handles interactions with DAO governance smart contracts on Stacks
 */

import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
  stringAsciiCV,
  trueCV,
  falseCV,
  bufferCV,
} from '@stacks/transactions';
import type { StacksNetwork } from '@stacks/network';
import { StacksTestnet } from '@stacks/network';
import { walletConnector } from './stacks-wallet-connector';

export interface ProposalData {
  id: number;
  title: string;
  description: string;
  proposer: string;
  startBlockHeight: number;
  endBlockHeight: number;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  executed: boolean;
  cancelled: boolean;
}

export interface VoteParams {
  proposalId: number;
  support: 'for' | 'against' | 'abstain';
  reason?: string;
}

export class StacksContractCaller {
  private network: StacksNetwork;
  private contractAddress: string;
  private contractName: string;

  constructor(
    contractAddress: string,
    contractName: string,
    network?: StacksNetwork
  ) {
    this.contractAddress = contractAddress;
    this.contractName = contractName;
    this.network = network || new StacksTestnet();
  }

  /**
   * Cast a vote on a proposal
   */
  async castVote(params: VoteParams): Promise<{ txId: string; status: string }> {
    const userAddress = walletConnector.getUserAddress();
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    // Convert vote support to uint
    let supportValue: number;
    switch (params.support) {
      case 'for':
        supportValue = 1;
        break;
      case 'against':
        supportValue = 0;
        break;
      case 'abstain':
        supportValue = 2;
        break;
      default:
        throw new Error('Invalid vote support value');
    }

    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: params.reason ? 'cast-vote-with-reason' : 'cast-vote',
        functionArgs: params.reason
          ? [
              uintCV(params.proposalId),
              uintCV(supportValue),
              stringAsciiCV(params.reason),
            ]
          : [uintCV(params.proposalId), uintCV(supportValue)],
        senderKey: '', // Will be filled by wallet
        validateWithAbi: true,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);

      if (broadcastResponse.error) {
        throw new Error(`Transaction failed: ${broadcastResponse.error}`);
      }

      return {
        txId: broadcastResponse.txid,
        status: 'PENDING',
      };
    } catch (error) {
      console.error('Failed to cast vote:', error);
      throw error;
    }
  }

  /**
   * Create a new proposal
   */
  async createProposal(
    title: string,
    description: string,
    actions: Array<{
      target: string;
      functionName: string;
      functionArgs: any[];
    }>
  ): Promise<{ txId: string; proposalId: number }> {
    const userAddress = walletConnector.getUserAddress();
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      // Encode actions as buffer
      const encodedActions = JSON.stringify(actions);

      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'propose',
        functionArgs: [
          stringAsciiCV(title),
          stringAsciiCV(description),
          bufferCV(Buffer.from(encodedActions)),
        ],
        senderKey: '',
        validateWithAbi: true,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);

      if (broadcastResponse.error) {
        throw new Error(`Transaction failed: ${broadcastResponse.error}`);
      }

      // Get proposal ID from events (simplified)
      const proposalId = Date.now(); // In production, parse from contract events

      return {
        txId: broadcastResponse.txid,
        proposalId,
      };
    } catch (error) {
      console.error('Failed to create proposal:', error);
      throw error;
    }
  }

  /**
   * Execute a proposal
   */
  async executeProposal(proposalId: number): Promise<{ txId: string }> {
    const userAddress = walletConnector.getUserAddress();
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'execute',
        functionArgs: [uintCV(proposalId)],
        senderKey: '',
        validateWithAbi: true,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);

      if (broadcastResponse.error) {
        throw new Error(`Transaction failed: ${broadcastResponse.error}`);
      }

      return {
        txId: broadcastResponse.txid,
      };
    } catch (error) {
      console.error('Failed to execute proposal:', error);
      throw error;
    }
  }

  /**
   * Get proposal data (read-only)
   */
  async getProposal(proposalId: number): Promise<ProposalData> {
    // This would use callReadOnlyFunction in production
    // For now, return mock data
    console.log(`Getting proposal ${proposalId} from ${this.contractAddress}.${this.contractName}`);

    return {
      id: proposalId,
      title: 'Treasury Allocation for Development',
      description: 'Allocate 100,000 STX for development initiatives',
      proposer: 'SP2X...PROPOSER',
      startBlockHeight: 100000,
      endBlockHeight: 100500,
      forVotes: 15000,
      againstVotes: 3000,
      abstainVotes: 500,
      executed: false,
      cancelled: false,
    };
  }

  /**
   * Get voting power for an address
   */
  async getVotingPower(address: string, blockHeight?: number): Promise<number> {
    // This would call the token contract's get-balance function
    console.log(`Getting voting power for ${address}`);
    
    // Mock implementation
    return 1000;
  }

  /**
   * Check if user has voted on a proposal
   */
  async hasVoted(proposalId: number, address: string): Promise<boolean> {
    // This would call the contract's has-voted function
    console.log(`Checking if ${address} has voted on proposal ${proposalId}`);
    
    // Mock implementation
    return false;
  }

  /**
   * Get proposal state
   */
  async getProposalState(proposalId: number): Promise<
    'PENDING' | 'ACTIVE' | 'CANCELLED' | 'DEFEATED' | 'SUCCEEDED' | 'QUEUED' | 'EXPIRED' | 'EXECUTED'
  > {
    // This would call the contract's proposal-state function
    console.log(`Getting state for proposal ${proposalId}`);
    
    // Mock implementation
    return 'ACTIVE';
  }
}

// Create default instance for DAO governance contract
export const daoGovernanceContract = new StacksContractCaller(
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Replace with your contract address
  'dao-governance', // Replace with your contract name
  new StacksTestnet()
);

