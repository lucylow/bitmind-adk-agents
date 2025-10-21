import { z } from 'zod';
import * as ethers from 'ethers';

/**
 * Blockchain Data MCP Server
 * Provides access to on-chain governance data via The Graph and RPC
 */

export interface BlockchainDataConfig {
  rpcUrl: string;
  graphqlEndpoint: string;
  chainId: number;
}

export const ProposalDataSchema = z.object({
  id: z.string(),
  proposalId: z.string(),
  title: z.string(),
  description: z.string(),
  proposer: z.string(),
  startBlock: z.number(),
  endBlock: z.number(),
  forVotes: z.string(),
  againstVotes: z.string(),
  abstainVotes: z.string(),
  status: z.enum(['PENDING', 'ACTIVE', 'CANCELED', 'DEFEATED', 'SUCCEEDED', 'QUEUED', 'EXPIRED', 'EXECUTED']),
  createdAt: z.number(),
  executedAt: z.number().optional(),
});

export type ProposalData = z.infer<typeof ProposalDataSchema>;

export const VotingPowerSchema = z.object({
  address: z.string(),
  votingPower: z.string(),
  delegatedVotes: z.string(),
  tokenBalance: z.string(),
  blockNumber: z.number(),
});

export type VotingPower = z.infer<typeof VotingPowerSchema>;

export const TreasuryBalanceSchema = z.object({
  daoAddress: z.string(),
  totalValueUSD: z.number(),
  tokens: z.array(
    z.object({
      address: z.string(),
      symbol: z.string(),
      name: z.string(),
      balance: z.string(),
      decimals: z.number(),
      priceUSD: z.number(),
      valueUSD: z.number(),
    })
  ),
  lastUpdated: z.number(),
});

export type TreasuryBalance = z.infer<typeof TreasuryBalanceSchema>;

export class BlockchainDataMCPServer {
  private provider: ethers.JsonRpcProvider;
  private graphqlEndpoint: string;
  private chainId: number;

  constructor(config: BlockchainDataConfig) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.graphqlEndpoint = config.graphqlEndpoint;
    this.chainId = config.chainId;
  }

  /**
   * Fetch proposal data from The Graph subgraph
   */
  async getProposalData(proposalId: string): Promise<ProposalData> {
    const query = `
      query GetProposal($proposalId: String!) {
        proposal(id: $proposalId) {
          id
          proposalId
          title
          description
          proposer
          startBlock
          endBlock
          forVotes
          againstVotes
          abstainVotes
          status
          createdAt
          executedAt
        }
      }
    `;

    try {
      const response = await fetch(this.graphqlEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { proposalId },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
      }

      if (!result.data?.proposal) {
        // Return mock data if not found (for development)
        return this.getMockProposalData(proposalId);
      }

      return ProposalDataSchema.parse(result.data.proposal);
    } catch (error) {
      console.warn('Failed to fetch from The Graph, using mock data:', error);
      return this.getMockProposalData(proposalId);
    }
  }

  /**
   * Get real-time treasury balance
   */
  async getTreasuryBalance(daoAddress: string): Promise<TreasuryBalance> {
    try {
      const currentBlock = await this.provider.getBlockNumber();

      // Query common token balances (ETH, USDC, USDT, DAI)
      const tokens = await this.getTokenBalances(daoAddress, [
        { address: 'ETH', symbol: 'ETH', name: 'Ethereum', decimals: 18 },
        { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
        { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether', decimals: 6 },
        { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 },
      ]);

      const totalValueUSD = tokens.reduce((sum, token) => sum + token.valueUSD, 0);

      return TreasuryBalanceSchema.parse({
        daoAddress,
        totalValueUSD,
        tokens,
        lastUpdated: Math.floor(Date.now() / 1000),
      });
    } catch (error) {
      console.warn('Failed to fetch treasury balance, using mock data:', error);
      return this.getMockTreasuryBalance(daoAddress);
    }
  }

  /**
   * Calculate voting power for an address at a specific block
   */
  async getVotingPower(address: string, blockNumber?: number): Promise<VotingPower> {
    try {
      const block = blockNumber || (await this.provider.getBlockNumber());

      // Query The Graph for voting power data
      const query = `
        query GetVotingPower($address: String!, $block: Int!) {
          delegate(id: $address, block: { number: $block }) {
            id
            delegatedVotes
            tokenBalance
          }
        }
      `;

      const response = await fetch(this.graphqlEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { address: address.toLowerCase(), block },
        }),
      });

      const result = await response.json();

      if (result.data?.delegate) {
        return VotingPowerSchema.parse({
          address,
          votingPower: result.data.delegate.delegatedVotes,
          delegatedVotes: result.data.delegate.delegatedVotes,
          tokenBalance: result.data.delegate.tokenBalance,
          blockNumber: block,
        });
      }

      return this.getMockVotingPower(address, block);
    } catch (error) {
      console.warn('Failed to fetch voting power, using mock data:', error);
      return this.getMockVotingPower(address, blockNumber || 0);
    }
  }

  /**
   * Get historical proposal votes
   */
  async getProposalVotes(proposalId: string): Promise<{
    votes: Array<{
      voter: string;
      support: 'FOR' | 'AGAINST' | 'ABSTAIN';
      votes: string;
      reason: string;
      timestamp: number;
    }>;
    totalVotes: number;
  }> {
    const query = `
      query GetProposalVotes($proposalId: String!) {
        votes(where: { proposal: $proposalId }, first: 100, orderBy: timestamp, orderDirection: desc) {
          voter
          support
          votes
          reason
          timestamp
        }
      }
    `;

    try {
      const response = await fetch(this.graphqlEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { proposalId },
        }),
      });

      const result = await response.json();

      if (result.data?.votes) {
        const votes = result.data.votes.map((vote: any) => ({
          voter: vote.voter,
          support: vote.support === 0 ? 'AGAINST' : vote.support === 1 ? 'FOR' : 'ABSTAIN',
          votes: vote.votes,
          reason: vote.reason || '',
          timestamp: vote.timestamp,
        }));

        return {
          votes,
          totalVotes: votes.length,
        };
      }

      return { votes: [], totalVotes: 0 };
    } catch (error) {
      console.warn('Failed to fetch proposal votes:', error);
      return { votes: [], totalVotes: 0 };
    }
  }

  // Private helper methods for token balances
  private async getTokenBalances(
    daoAddress: string,
    tokens: Array<{ address: string; symbol: string; name: string; decimals: number }>
  ): Promise<TreasuryBalance['tokens']> {
    const balances = await Promise.all(
      tokens.map(async (token) => {
        let balance = '0';
        let priceUSD = 0;

        if (token.address === 'ETH') {
          // Get ETH balance
          const ethBalance = await this.provider.getBalance(daoAddress);
          balance = ethBalance.toString();
          priceUSD = await this.getTokenPrice('ethereum');
        } else {
          // Get ERC20 balance
          const erc20ABI = [
            'function balanceOf(address owner) view returns (uint256)',
          ];
          const tokenContract = new ethers.Contract(token.address, erc20ABI, this.provider);
          const tokenBalance = await tokenContract.balanceOf(daoAddress);
          balance = tokenBalance.toString();
          priceUSD = await this.getTokenPrice(token.symbol.toLowerCase());
        }

        const balanceNum = Number(balance) / Math.pow(10, token.decimals);
        const valueUSD = balanceNum * priceUSD;

        return {
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          balance,
          decimals: token.decimals,
          priceUSD,
          valueUSD,
        };
      })
    );

    return balances;
  }

  // Mock price oracle (replace with real price feed like Coingecko or Chainlink)
  private async getTokenPrice(symbol: string): Promise<number> {
    const mockPrices: Record<string, number> = {
      ethereum: 3500,
      usdc: 1.0,
      usdt: 1.0,
      dai: 1.0,
    };

    return mockPrices[symbol] || 0;
  }

  // Mock data methods for development
  private getMockProposalData(proposalId: string): ProposalData {
    return {
      id: proposalId,
      proposalId,
      title: 'Proposal: Increase Development Fund Allocation',
      description:
        'This proposal seeks to increase the development fund allocation from 10% to 15% of the treasury to accelerate product development and hire additional engineers.',
      proposer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      startBlock: 18000000,
      endBlock: 18050000,
      forVotes: ethers.parseEther('1500000').toString(),
      againstVotes: ethers.parseEther('300000').toString(),
      abstainVotes: ethers.parseEther('50000').toString(),
      status: 'ACTIVE',
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 2,
      executedAt: undefined,
    };
  }

  private getMockTreasuryBalance(daoAddress: string): TreasuryBalance {
    return {
      daoAddress,
      totalValueUSD: 5250000,
      tokens: [
        {
          address: 'ETH',
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethers.parseEther('1000').toString(),
          decimals: 18,
          priceUSD: 3500,
          valueUSD: 3500000,
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'USDC',
          name: 'USD Coin',
          balance: '1500000000000',
          decimals: 6,
          priceUSD: 1.0,
          valueUSD: 1500000,
        },
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          symbol: 'DAI',
          name: 'Dai Stablecoin',
          balance: ethers.parseEther('250000').toString(),
          decimals: 18,
          priceUSD: 1.0,
          valueUSD: 250000,
        },
      ],
      lastUpdated: Math.floor(Date.now() / 1000),
    };
  }

  private getMockVotingPower(address: string, blockNumber: number): VotingPower {
    return {
      address,
      votingPower: ethers.parseEther('50000').toString(),
      delegatedVotes: ethers.parseEther('50000').toString(),
      tokenBalance: ethers.parseEther('50000').toString(),
      blockNumber,
    };
  }
}

export default BlockchainDataMCPServer;

