/**
 * Agent Governance System
 * 
 * Token-based governance for agent decisions and upgrades
 * Token holders vote on agent behavior, features, and upgrades
 */

import { ethers } from 'ethers';

// Governance contract ABI
const GOVERNANCE_ABI = [
  'function propose(string memory description, address[] memory targets, uint256[] memory values, bytes[] memory calldatas) external returns (uint256)',
  'function castVote(uint256 proposalId, uint8 support) external',
  'function castVoteWithReason(uint256 proposalId, uint8 support, string memory reason) external',
  'function execute(uint256 proposalId) external',
  'function cancel(uint256 proposalId) external',
  'function getProposal(uint256 proposalId) external view returns (tuple(uint256 id, address proposer, string description, uint256 startBlock, uint256 endBlock, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, bool executed, bool canceled))',
  'function state(uint256 proposalId) external view returns (uint8)',
  'function votingPeriod() external view returns (uint256)',
  'function votingDelay() external view returns (uint256)',
  'function proposalThreshold() external view returns (uint256)',
  'function quorum(uint256 blockNumber) external view returns (uint256)',
  'event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description)',
  'event VoteCast(address indexed voter, uint256 indexed proposalId, uint8 support, uint256 weight, string reason)',
  'event ProposalExecuted(uint256 indexed proposalId)'
];

export enum ProposalState {
  Pending = 0,
  Active = 1,
  Canceled = 2,
  Defeated = 3,
  Succeeded = 4,
  Queued = 5,
  Expired = 6,
  Executed = 7
}

export enum VoteType {
  Against = 0,
  For = 1,
  Abstain = 2
}

export interface Proposal {
  id: string;
  proposer: string;
  description: string;
  startBlock: number;
  endBlock: number;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  executed: boolean;
  canceled: boolean;
  state: ProposalState;
}

export interface GovernanceAction {
  target: string;
  value: string;
  calldata: string;
  description: string;
}

/**
 * Agent Governance System
 * Manages token-based governance for agent decisions
 */
export class AgentGovernance {
  private provider: ethers.JsonRpcProvider;
  private governanceContract: ethers.Contract;
  private signer?: ethers.Wallet;
  
  constructor(
    governanceAddress: string,
    rpcUrl: string,
    privateKey?: string
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.governanceContract = new ethers.Contract(
      governanceAddress,
      GOVERNANCE_ABI,
      this.provider
    );
    
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
      this.governanceContract = this.governanceContract.connect(this.signer);
    }
  }
  
  /**
   * Create a governance proposal
   */
  async createProposal(
    description: string,
    actions: GovernanceAction[]
  ): Promise<{ proposalId: string; txHash: string }> {
    if (!this.signer) {
      throw new Error('Signer required to create proposals');
    }
    
    console.log('[Governance] Creating proposal:', description);
    
    const targets = actions.map(a => a.target);
    const values = actions.map(a => ethers.parseEther(a.value));
    const calldatas = actions.map(a => a.calldata);
    
    const tx = await this.governanceContract.propose(
      description,
      targets,
      values,
      calldatas
    );
    
    const receipt = await tx.wait();
    
    // Extract proposal ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = this.governanceContract.interface.parseLog(log);
        return parsed?.name === 'ProposalCreated';
      } catch {
        return false;
      }
    });
    
    let proposalId = '0';
    if (event) {
      const parsed = this.governanceContract.interface.parseLog(event);
      proposalId = parsed?.args.proposalId.toString();
    }
    
    console.log('[Governance] Proposal created:', proposalId);
    
    return {
      proposalId,
      txHash: receipt.hash
    };
  }
  
  /**
   * Cast vote on a proposal
   */
  async vote(
    proposalId: string,
    support: VoteType,
    reason?: string
  ): Promise<{ txHash: string }> {
    if (!this.signer) {
      throw new Error('Signer required to vote');
    }
    
    console.log('[Governance] Voting on proposal:', proposalId, 'Support:', VoteType[support]);
    
    let tx;
    if (reason) {
      tx = await this.governanceContract.castVoteWithReason(
        proposalId,
        support,
        reason
      );
    } else {
      tx = await this.governanceContract.castVote(proposalId, support);
    }
    
    const receipt = await tx.wait();
    
    console.log('[Governance] Vote cast successfully');
    
    return { txHash: receipt.hash };
  }
  
  /**
   * Execute a successful proposal
   */
  async executeProposal(proposalId: string): Promise<{ txHash: string }> {
    if (!this.signer) {
      throw new Error('Signer required to execute proposals');
    }
    
    console.log('[Governance] Executing proposal:', proposalId);
    
    // Check proposal state
    const state = await this.getProposalState(proposalId);
    if (state !== ProposalState.Succeeded && state !== ProposalState.Queued) {
      throw new Error(`Proposal not ready for execution. Current state: ${ProposalState[state]}`);
    }
    
    const tx = await this.governanceContract.execute(proposalId);
    const receipt = await tx.wait();
    
    console.log('[Governance] Proposal executed successfully');
    
    return { txHash: receipt.hash };
  }
  
  /**
   * Cancel a proposal
   */
  async cancelProposal(proposalId: string): Promise<{ txHash: string }> {
    if (!this.signer) {
      throw new Error('Signer required to cancel proposals');
    }
    
    console.log('[Governance] Canceling proposal:', proposalId);
    
    const tx = await this.governanceContract.cancel(proposalId);
    const receipt = await tx.wait();
    
    console.log('[Governance] Proposal canceled');
    
    return { txHash: receipt.hash };
  }
  
  /**
   * Get proposal details
   */
  async getProposal(proposalId: string): Promise<Proposal> {
    const proposal = await this.governanceContract.getProposal(proposalId);
    const state = await this.governanceContract.state(proposalId);
    
    return {
      id: proposalId,
      proposer: proposal.proposer,
      description: proposal.description,
      startBlock: proposal.startBlock.toNumber(),
      endBlock: proposal.endBlock.toNumber(),
      forVotes: ethers.formatEther(proposal.forVotes),
      againstVotes: ethers.formatEther(proposal.againstVotes),
      abstainVotes: ethers.formatEther(proposal.abstainVotes),
      executed: proposal.executed,
      canceled: proposal.canceled,
      state: state
    };
  }
  
  /**
   * Get proposal state
   */
  async getProposalState(proposalId: string): Promise<ProposalState> {
    return await this.governanceContract.state(proposalId);
  }
  
  /**
   * Get governance parameters
   */
  async getGovernanceParams(): Promise<{
    votingPeriod: number;
    votingDelay: number;
    proposalThreshold: string;
  }> {
    const [votingPeriod, votingDelay, proposalThreshold] = await Promise.all([
      this.governanceContract.votingPeriod(),
      this.governanceContract.votingDelay(),
      this.governanceContract.proposalThreshold()
    ]);
    
    return {
      votingPeriod: votingPeriod.toNumber(),
      votingDelay: votingDelay.toNumber(),
      proposalThreshold: ethers.formatEther(proposalThreshold)
    };
  }
  
  /**
   * Get current quorum
   */
  async getQuorum(blockNumber?: number): Promise<string> {
    const block = blockNumber || await this.provider.getBlockNumber();
    const quorum = await this.governanceContract.quorum(block);
    return ethers.formatEther(quorum);
  }
  
  /**
   * Listen for new proposals
   */
  onProposalCreated(callback: (proposalId: string, proposer: string, description: string) => void) {
    this.governanceContract.on('ProposalCreated', (proposalId, proposer, description) => {
      callback(proposalId.toString(), proposer, description);
    });
  }
  
  /**
   * Listen for votes
   */
  onVoteCast(callback: (voter: string, proposalId: string, support: VoteType, weight: string, reason: string) => void) {
    this.governanceContract.on('VoteCast', (voter, proposalId, support, weight, reason) => {
      callback(voter, proposalId.toString(), support, ethers.formatEther(weight), reason);
    });
  }
  
  /**
   * Listen for proposal executions
   */
  onProposalExecuted(callback: (proposalId: string) => void) {
    this.governanceContract.on('ProposalExecuted', (proposalId) => {
      callback(proposalId.toString());
    });
  }
}

/**
 * Pre-defined governance proposal templates for common agent decisions
 */
export class GovernanceProposalTemplates {
  /**
   * Proposal to update agent pricing
   */
  static updatePricing(
    tokenAddress: string,
    basicFee: string,
    premiumFee: string,
    customFee: string
  ): { description: string; actions: GovernanceAction[] } {
    const iface = new ethers.Interface([
      'function updateFeeConfig(uint256,uint256,uint256,uint256)'
    ]);
    
    return {
      description: `Update BitMind Agent Pricing\n\nBasic Analysis: ${basicFee} ETH\nPremium Analysis: ${premiumFee} ETH\nCustom Strategy: ${customFee} ETH\n\nThis proposal updates the agent's service fees to better reflect market conditions and value provided.`,
      actions: [{
        target: tokenAddress,
        value: '0',
        calldata: iface.encodeFunctionData('updateFeeConfig', [
          ethers.parseEther(basicFee),
          ethers.parseEther(premiumFee),
          ethers.parseEther(customFee),
          8000 // Keep 80% revenue share
        ]),
        description: 'Update fee configuration'
      }]
    };
  }
  
  /**
   * Proposal to change agent wallet
   */
  static updateAgentWallet(
    tokenAddress: string,
    newWalletAddress: string
  ): { description: string; actions: GovernanceAction[] } {
    const iface = new ethers.Interface([
      'function updateAgentWallet(address)'
    ]);
    
    return {
      description: `Update Agent Wallet Address\n\nNew Wallet: ${newWalletAddress}\n\nThis proposal updates the agent's operational wallet address. Ensure the new address is secure and properly backed up.`,
      actions: [{
        target: tokenAddress,
        value: '0',
        calldata: iface.encodeFunctionData('updateAgentWallet', [newWalletAddress]),
        description: 'Update agent wallet address'
      }]
    };
  }
  
  /**
   * Proposal to adjust revenue sharing
   */
  static updateRevenueShare(
    tokenAddress: string,
    revenueSharePercentage: number
  ): { description: string; actions: GovernanceAction[] } {
    if (revenueSharePercentage < 0 || revenueSharePercentage > 100) {
      throw new Error('Revenue share must be between 0 and 100');
    }
    
    const iface = new ethers.Interface([
      'function updateFeeConfig(uint256,uint256,uint256,uint256)'
    ]);
    
    return {
      description: `Adjust Revenue Sharing\n\nNew Revenue Share: ${revenueSharePercentage}%\n\nThis proposal adjusts the percentage of agent revenue distributed to token holders.`,
      actions: [{
        target: tokenAddress,
        value: '0',
        calldata: iface.encodeFunctionData('updateFeeConfig', [
          ethers.parseEther('0.01'), // Keep existing fees
          ethers.parseEther('0.1'),
          ethers.parseEther('0.5'),
          revenueSharePercentage * 100 // Convert to basis points
        ]),
        description: 'Update revenue share percentage'
      }]
    };
  }
}

/**
 * Factory function to create governance from environment
 */
export function createGovernanceFromEnv(privateKey?: string): AgentGovernance {
  const governanceAddress = process.env.GOVERNANCE_CONTRACT_ADDRESS;
  const rpcUrl = process.env.FRAXTAL_RPC_URL;
  
  if (!governanceAddress || !rpcUrl) {
    throw new Error('Missing governance configuration in environment');
  }
  
  return new AgentGovernance(governanceAddress, rpcUrl, privateKey);
}

