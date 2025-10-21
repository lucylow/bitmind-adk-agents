// src/integrations/blockchain-client.ts
import { ethers, JsonRpcProvider } from "ethers";
import { request, gql } from "graphql-request";

/**
 * Real blockchain integration layer
 * Replace RPC URLs and subgraph endpoints with your production values
 */

export interface BlockchainConfig {
  rpcUrl: string;
  subgraphUrl?: string;
  snapshotApiUrl?: string;
  governorAddress?: string;
}

export class BlockchainClient {
  private provider: JsonRpcProvider;
  private config: BlockchainConfig;

  constructor(config: BlockchainConfig) {
    this.config = config;
    this.provider = new JsonRpcProvider(config.rpcUrl);
  }

  /**
   * Fetch proposal from The Graph subgraph
   */
  async fetchProposalFromGraph(proposalId: string) {
    if (!this.config.subgraphUrl) throw new Error("Subgraph URL not configured");

    const query = gql`
      query GetProposal($id: ID!) {
        proposal(id: $id) {
          id
          proposalId
          proposer
          targets
          values
          signatures
          calldatas
          startBlock
          endBlock
          description
          status
          forVotes
          againstVotes
          abstainVotes
          canceled
          executed
          createdTimestamp
          createdBlock
        }
      }
    `;

    try {
      const data = await request(this.config.subgraphUrl, query, { id: proposalId }) as { proposal: any };
      return data.proposal;
    } catch (error: unknown) {
      console.error("Error fetching from subgraph:", error);
      throw error;
    }
  }

  /**
   * Fetch proposal from Snapshot (for Snapshot-based DAOs)
   */
  async fetchProposalFromSnapshot(proposalId: string, space: string) {
    const snapshotUrl = this.config.snapshotApiUrl || "https://hub.snapshot.org/graphql";
    
    const query = gql`
      query GetProposal($id: String!) {
        proposal(id: $id) {
          id
          title
          body
          choices
          start
          end
          snapshot
          state
          author
          space {
            id
            name
          }
          scores
          scores_total
          votes
        }
      }
    `;

    try {
      const data = await request(snapshotUrl, query, { id: proposalId }) as { proposal: any };
      return data.proposal;
    } catch (error: unknown) {
      console.error("Error fetching from Snapshot:", error);
      throw error;
    }
  }

  /**
   * Get voting power for an address at a specific block
   */
  async getVotingPower(tokenAddress: string, voterAddress: string, blockNumber?: number): Promise<number> {
    const tokenAbi = [
      "function balanceOf(address account) view returns (uint256)",
      "function delegates(address account) view returns (address)",
      "function getCurrentVotes(address account) view returns (uint96)",
      "function getPriorVotes(address account, uint256 blockNumber) view returns (uint96)",
    ];

    try {
      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, this.provider);
      
      // Try delegation-aware voting power first
      if (blockNumber) {
        try {
          const votes = await tokenContract.getPriorVotes(voterAddress, blockNumber);
          return parseFloat(ethers.formatUnits(votes, 18));
        } catch {
          // Fallback to current votes or balance
        }
      }

      try {
        const votes = await tokenContract.getCurrentVotes(voterAddress);
        return parseFloat(ethers.formatUnits(votes, 18));
      } catch {
        // Fallback to simple balance
        const balance = await tokenContract.balanceOf(voterAddress);
        return parseFloat(ethers.formatUnits(balance, 18));
      }
    } catch (error: unknown) {
      console.error("Error fetching voting power:", error);
      return 0;
    }
  }

  /**
   * Get DAO treasury balances
   */
  async getTreasuryBalances(treasuryAddress: string): Promise<Array<{ token: string; balance: string; symbol: string }>> {
    try {
      // Get native ETH balance
      const ethBalance = await this.provider.getBalance(treasuryAddress);
      const balances = [
        {
          token: "ETH",
          balance: ethers.formatEther(ethBalance),
          symbol: "ETH",
        },
      ];

      // Common ERC20 tokens (extend with your DAO's token list)
      const commonTokens = [
        { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", decimals: 6 }, // USDC
        { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", decimals: 6 }, // USDT
        { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", decimals: 18 }, // DAI
      ];

      const tokenAbi = ["function balanceOf(address account) view returns (uint256)"];

      for (const token of commonTokens) {
        try {
          const contract = new ethers.Contract(token.address, tokenAbi, this.provider);
          const balance = await contract.balanceOf(treasuryAddress);
          const formatted = ethers.formatUnits(balance, token.decimals);
          if (parseFloat(formatted) > 0) {
            balances.push({
              token: token.address,
              balance: formatted,
              symbol: token.symbol,
            });
          }
        } catch {
          // Skip if token balance check fails
        }
      }

      return balances;
    } catch (error: unknown) {
      console.error("Error fetching treasury balances:", error);
      return [];
    }
  }

  /**
   * Execute a vote transaction (requires signer)
   */
  async executeVote(
    governorAddress: string,
    proposalId: string,
    support: number, // 0 = against, 1 = for, 2 = abstain
    signer: ethers.Signer
  ) {
    const governorAbi = [
      "function castVote(uint256 proposalId, uint8 support) returns (uint256)",
      "function castVoteWithReason(uint256 proposalId, uint8 support, string reason) returns (uint256)",
    ];

    try {
      const governor = new ethers.Contract(governorAddress, governorAbi, signer);
      const tx = await governor.castVote(proposalId, support);
      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error: any) {
      console.error("Error executing vote:", error);
      return {
        success: false,
        error: error.message || String(error),
      };
    }
  }

  /**
   * Get proposal state from on-chain governor
   */
  async getProposalState(governorAddress: string, proposalId: string): Promise<string> {
    const governorAbi = ["function state(uint256 proposalId) view returns (uint8)"];
    
    try {
      const governor = new ethers.Contract(governorAddress, governorAbi, this.provider);
      const state = await governor.state(proposalId);
      
      // OpenZeppelin Governor states
      const states = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];
      return states[state] || "Unknown";
    } catch (error) {
      console.error("Error fetching proposal state:", error);
      return "Unknown";
    }
  }
}

/**
 * Factory function to create blockchain client with common configs
 */
export function createBlockchainClient(network: "mainnet" | "goerli" | "sepolia" | "custom", customConfig?: Partial<BlockchainConfig>): BlockchainClient {
  const configs: Record<string, BlockchainConfig> = {
    mainnet: {
      rpcUrl: process.env.MAINNET_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY",
      subgraphUrl: process.env.SUBGRAPH_URL,
      snapshotApiUrl: "https://hub.snapshot.org/graphql",
    },
    goerli: {
      rpcUrl: process.env.GOERLI_RPC_URL || "https://eth-goerli.g.alchemy.com/v2/YOUR_KEY",
      subgraphUrl: process.env.GOERLI_SUBGRAPH_URL,
    },
    sepolia: {
      rpcUrl: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY",
    },
    custom: { rpcUrl: customConfig?.rpcUrl || "" },
  };

  const finalConfig: BlockchainConfig = { ...configs[network], ...customConfig };
  return new BlockchainClient(finalConfig);
}

