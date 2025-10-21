/**
 * ATP Agent Wallet Management
 * Enables agents to own, manage, and execute autonomous transactions
 */

import { ethers } from 'ethers';

// ABI for BitMindAgentToken contract
const BITMIND_AGENT_TOKEN_ABI = [
  'function depositRevenue() external payable',
  'function isCapabilityUnlocked(string) external view returns (bool)',
  'function balanceOf(address) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function totalRevenue() external view returns (uint256)',
  'function pendingRevenue(address) external view returns (uint256)',
  'function getAllCapabilities() external view returns (string[] memory, uint256[] memory, bool[] memory, uint256[] memory)',
  'function getFeeConfig() external view returns (uint256, uint256, uint256, uint256)',
  'event RevenueDeposited(uint256 amount, uint256 newRevenuePerToken)',
  'event CapabilityUnlocked(string capabilityName, uint256 marketCap, uint256 timestamp)'
];

export interface AgentWalletConfig {
  privateKey: string;
  rpcUrl: string;
  tokenAddress: string;
  network?: 'fraxtal' | 'ethereum' | 'polygon';
}

export interface Capability {
  name: string;
  requiredMarketCap: string;
  unlocked: boolean;
  unlockedAt: number;
}

export interface FeeConfig {
  basicAnalysisFee: string;
  premiumAnalysisFee: string;
  customStrategyFee: string;
  revenueSharePercentage: number;
}

/**
 * AgentWallet - Manages autonomous agent's crypto assets
 * Enables agents to own, manage, and execute transactions
 */
export class AgentWallet {
  private wallet: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;
  private tokenContract: ethers.Contract;
  public readonly network: string;
  
  constructor(config: AgentWalletConfig) {
    this.network = config.network || 'fraxtal';
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    
    // Agent token contract (BitMindAgentToken)
    this.tokenContract = new ethers.Contract(
      config.tokenAddress,
      BITMIND_AGENT_TOKEN_ABI,
      this.wallet
    );
  }
  
  /**
   * Get agent's wallet address
   */
  getAddress(): string {
    return this.wallet.address;
  }
  
  /**
   * Get agent's ETH balance
   */
  async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }
  
  /**
   * Get agent's token balance
   */
  async getTokenBalance(): Promise<string> {
    const balance = await this.tokenContract.balanceOf(this.wallet.address);
    return ethers.formatEther(balance);
  }
  
  /**
   * Get total revenue collected by agent
   */
  async getTotalRevenue(): Promise<string> {
    const revenue = await this.tokenContract.totalRevenue();
    return ethers.formatEther(revenue);
  }
  
  /**
   * Get pending claimable revenue for a token holder
   */
  async getPendingRevenue(holderAddress: string): Promise<string> {
    const pending = await this.tokenContract.pendingRevenue(holderAddress);
    return ethers.formatEther(pending);
  }
  
  /**
   * Agent deposits earned revenue to token holders
   * Called after agent earns fees from premium services
   * 
   * @param amount - Amount in ETH to deposit as revenue
   * @returns Transaction receipt
   */
  async depositRevenue(amount: string): Promise<ethers.TransactionReceipt> {
    console.log(`[AgentWallet] Depositing ${amount} ETH as revenue to token holders...`);
    
    const tx = await this.tokenContract.depositRevenue({
      value: ethers.parseEther(amount),
      gasLimit: 200000
    });
    
    const receipt = await tx.wait();
    console.log(`[AgentWallet] Revenue deposited successfully. Tx: ${receipt.hash}`);
    
    return receipt;
  }
  
  /**
   * Check if agent has unlocked specific capability
   * 
   * @param capabilityName - Name of the capability to check
   * @returns True if capability is unlocked
   */
  async hasCapability(capabilityName: string): Promise<boolean> {
    return await this.tokenContract.isCapabilityUnlocked(capabilityName);
  }
  
  /**
   * Get all capabilities and their current status
   */
  async getAllCapabilities(): Promise<Capability[]> {
    const [names, marketCaps, unlocked, timestamps] = await this.tokenContract.getAllCapabilities();
    
    return names.map((name: string, i: number) => ({
      name,
      requiredMarketCap: ethers.formatEther(marketCaps[i]),
      unlocked: unlocked[i],
      unlockedAt: timestamps[i].toNumber()
    }));
  }
  
  /**
   * Get current fee configuration
   */
  async getFeeConfig(): Promise<FeeConfig> {
    const [basicFee, premiumFee, customFee, revenueShare] = await this.tokenContract.getFeeConfig();
    
    return {
      basicAnalysisFee: ethers.formatEther(basicFee),
      premiumAnalysisFee: ethers.formatEther(premiumFee),
      customStrategyFee: ethers.formatEther(customFee),
      revenueSharePercentage: revenueShare
    };
  }
  
  /**
   * Execute autonomous transaction
   * Agent can send tokens, interact with DeFi protocols
   * 
   * @param to - Recipient address
   * @param value - Amount in ETH to send
   * @param data - Optional transaction data
   * @returns Transaction receipt
   */
  async executeTransaction(
    to: string,
    value: string,
    data?: string
  ): Promise<ethers.TransactionReceipt> {
    console.log(`[AgentWallet] Executing transaction to ${to} with value ${value} ETH`);
    
    const tx = await this.wallet.sendTransaction({
      to,
      value: ethers.parseEther(value),
      data: data || '0x'
    });
    
    const receipt = await tx.wait();
    console.log(`[AgentWallet] Transaction executed. Tx: ${receipt?.hash}`);
    
    return receipt!;
  }
  
  /**
   * Agent can autonomously stake tokens for governance
   * 
   * @param stakingContract - Address of staking contract
   * @param amount - Amount to stake in ETH
   * @returns Transaction receipt
   */
  async stakeForGovernance(
    stakingContract: string,
    amount: string
  ): Promise<ethers.TransactionReceipt> {
    const contract = new ethers.Contract(
      stakingContract,
      ['function stake(uint256) external'],
      this.wallet
    );
    
    console.log(`[AgentWallet] Staking ${amount} tokens for governance...`);
    const tx = await contract.stake(ethers.parseEther(amount));
    const receipt = await tx.wait();
    
    console.log(`[AgentWallet] Staked successfully. Tx: ${receipt.hash}`);
    return receipt;
  }
  
  /**
   * Interact with any smart contract
   * 
   * @param contractAddress - Contract to interact with
   * @param abi - Contract ABI
   * @param method - Method to call
   * @param params - Method parameters
   * @returns Transaction receipt or call result
   */
  async interactWithContract(
    contractAddress: string,
    abi: string[],
    method: string,
    params: any[]
  ): Promise<any> {
    const contract = new ethers.Contract(contractAddress, abi, this.wallet);
    
    console.log(`[AgentWallet] Calling ${method} on ${contractAddress}...`);
    
    // Check if method is view/pure
    const fragment = contract.interface.getFunction(method);
    const isView = fragment && (fragment.stateMutability === 'view' || fragment.stateMutability === 'pure');
    
    if (isView) {
      // Call (read-only)
      return await contract[method](...params);
    } else {
      // Transaction (state-changing)
      const tx = await contract[method](...params);
      const receipt = await tx.wait();
      console.log(`[AgentWallet] Transaction completed. Tx: ${receipt.hash}`);
      return receipt;
    }
  }
  
  /**
   * Get comprehensive agent wallet status
   */
  async getStatus() {
    const [balance, tokenBalance, totalRevenue, capabilities, feeConfig] = await Promise.all([
      this.getBalance(),
      this.getTokenBalance(),
      this.getTotalRevenue(),
      this.getAllCapabilities(),
      this.getFeeConfig()
    ]);
    
    return {
      address: this.getAddress(),
      network: this.network,
      balance,
      tokenBalance,
      totalRevenue,
      capabilities: capabilities.map(cap => ({
        name: cap.name,
        unlocked: cap.unlocked,
        requiredMarketCap: cap.requiredMarketCap
      })),
      pricing: {
        basic: `${feeConfig.basicAnalysisFee} ETH`,
        premium: `${feeConfig.premiumAnalysisFee} ETH`,
        custom: `${feeConfig.customStrategyFee} ETH`,
        revenueShare: `${feeConfig.revenueSharePercentage / 100}%`
      }
    };
  }
  
  /**
   * Listen for capability unlock events
   */
  onCapabilityUnlocked(callback: (capabilityName: string, marketCap: string, timestamp: number) => void) {
    this.tokenContract.on('CapabilityUnlocked', (name, marketCap, timestamp) => {
      callback(name, ethers.formatEther(marketCap), timestamp.toNumber());
    });
  }
  
  /**
   * Listen for revenue deposit events
   */
  onRevenueDeposited(callback: (amount: string, revenuePerToken: string) => void) {
    this.tokenContract.on('RevenueDeposited', (amount, revenuePerToken) => {
      callback(ethers.formatEther(amount), ethers.formatEther(revenuePerToken));
    });
  }
}

/**
 * Factory function to create agent wallet from environment variables
 */
export function createAgentWalletFromEnv(): AgentWallet {
  const config: AgentWalletConfig = {
    privateKey: process.env.AGENT_PRIVATE_KEY!,
    rpcUrl: process.env.FRAXTAL_RPC_URL!,
    tokenAddress: process.env.BITMIND_TOKEN_ADDRESS!,
    network: 'fraxtal'
  };
  
  if (!config.privateKey || !config.rpcUrl || !config.tokenAddress) {
    throw new Error('Missing required environment variables for AgentWallet');
  }
  
  return new AgentWallet(config);
}

