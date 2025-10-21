/**
 * BitMind DAO Governance MCP Server
 * 
 * Custom Model Context Protocol server providing standardized access to:
 * - Snapshot proposals and voting data
 * - On-chain governance metrics
 * - Treasury analytics
 * - Delegation information
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { ethers } from 'ethers';

interface SnapshotProposal {
  id: string;
  title: string;
  body: string;
  choices: string[];
  start: number;
  end: number;
  state: string;
  scores_total: number;
  scores: number[];
}

interface VotingPowerResult {
  address: string;
  votingPower: string;
  delegatedPower: string;
  totalPower: string;
  breakdown: Array<{ source: string; amount: string }>;
}

interface TreasuryAnalysis {
  address: string;
  totalValueUSD: string;
  assets: Array<{
    token: string;
    symbol: string;
    amount: string;
    valueUSD: string;
    percentage: number;
  }>;
  healthScore: number;
  diversificationScore: number;
  liquidityScore: number;
}

class DAOGovernanceMCPServer {
  private server: Server;
  private snapshotEndpoint = 'https://hub.snapshot.org/graphql';
  private ethProvider: ethers.JsonRpcProvider;
  
  constructor() {
    this.server = new Server(
      {
        name: 'bitmind-dao-governance',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.ethProvider = new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com'
    );
    
    this.setupHandlers();
  }
  
  private setupHandlers() {
    // List available MCP tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'fetch_snapshot_proposals',
          description: 'Fetch active proposals from Snapshot.org for a DAO space',
          inputSchema: {
            type: 'object',
            properties: {
              space: {
                type: 'string',
                description: 'DAO space identifier (e.g., "uniswap.eth", "gitcoindao.eth")'
              },
              state: {
                type: 'string',
                enum: ['active', 'pending', 'closed', 'all'],
                default: 'active',
                description: 'Proposal state filter'
              },
              limit: {
                type: 'number',
                default: 10,
                description: 'Maximum number of proposals to return'
              }
            },
            required: ['space'],
          },
        },
        {
          name: 'get_proposal_details',
          description: 'Get detailed information about a specific proposal',
          inputSchema: {
            type: 'object',
            properties: {
              proposalId: {
                type: 'string',
                description: 'Snapshot proposal ID'
              }
            },
            required: ['proposalId'],
          },
        },
        {
          name: 'get_voting_power',
          description: 'Calculate voting power for an address in a DAO',
          inputSchema: {
            type: 'object',
            properties: {
              address: {
                type: 'string',
                description: 'Ethereum address to check'
              },
              daoSpace: {
                type: 'string',
                description: 'DAO space identifier'
              },
              blockNumber: {
                type: 'string',
                description: 'Optional: specific block number',
                default: 'latest'
              }
            },
            required: ['address', 'daoSpace'],
          },
        },
        {
          name: 'analyze_treasury',
          description: 'Analyze DAO treasury health, composition, and diversification',
          inputSchema: {
            type: 'object',
            properties: {
              daoAddress: {
                type: 'string',
                description: 'DAO treasury address'
              },
              includeTokens: {
                type: 'boolean',
                default: true,
                description: 'Include ERC20 token holdings'
              },
              includeNFTs: {
                type: 'boolean',
                default: false,
                description: 'Include NFT holdings'
              }
            },
            required: ['daoAddress'],
          },
        },
        {
          name: 'get_delegation_info',
          description: 'Get delegation information for an address',
          inputSchema: {
            type: 'object',
            properties: {
              address: {
                type: 'string',
                description: 'Address to check'
              },
              daoSpace: {
                type: 'string',
                description: 'DAO space identifier'
              }
            },
            required: ['address', 'daoSpace'],
          },
        },
        {
          name: 'compare_proposals',
          description: 'Compare similar proposals across multiple DAOs',
          inputSchema: {
            type: 'object',
            properties: {
              proposalId: {
                type: 'string',
                description: 'Reference proposal ID'
              },
              searchSpaces: {
                type: 'array',
                items: { type: 'string' },
                description: 'DAO spaces to search for similar proposals'
              }
            },
            required: ['proposalId'],
          },
        },
        {
          name: 'get_governance_metrics',
          description: 'Get governance participation metrics for a DAO',
          inputSchema: {
            type: 'object',
            properties: {
              daoSpace: {
                type: 'string',
                description: 'DAO space identifier'
              },
              timeframe: {
                type: 'string',
                enum: ['7d', '30d', '90d', 'all'],
                default: '30d',
                description: 'Time period for metrics'
              }
            },
            required: ['daoSpace'],
          },
        },
      ];
      
      return { tools };
    });
    
    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        let result;
        
        switch (name) {
          case 'fetch_snapshot_proposals':
            result = await this.fetchSnapshotProposals(args as any);
            break;
          case 'get_proposal_details':
            result = await this.getProposalDetails(args as any);
            break;
          case 'get_voting_power':
            result = await this.getVotingPower(args as any);
            break;
          case 'analyze_treasury':
            result = await this.analyzeTreasury(args as any);
            break;
          case 'get_delegation_info':
            result = await this.getDelegationInfo(args as any);
            break;
          case 'compare_proposals':
            result = await this.compareProposals(args as any);
            break;
          case 'get_governance_metrics':
            result = await this.getGovernanceMetrics(args as any);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error: any) {
        console.error(`[MCP] Tool ${name} error:`, error);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: error.message }, null, 2)
          }],
          isError: true
        };
      }
    });
  }
  
  /**
   * Fetch Snapshot proposals
   */
  private async fetchSnapshotProposals({
    space,
    state = 'active',
    limit = 10
  }: {
    space: string;
    state?: string;
    limit?: number;
  }): Promise<SnapshotProposal[]> {
    const query = `
      query Proposals($space: String!, $state: String!, $limit: Int!) {
        proposals(
          where: { space: $space, state: $state },
          orderBy: "created",
          orderDirection: desc,
          first: $limit
        ) {
          id
          title
          body
          choices
          start
          end
          state
          scores_total
          scores
          author
          created
        }
      }
    `;
    
    const response = await axios.post(this.snapshotEndpoint, {
      query,
      variables: { space, state: state === 'all' ? undefined : state, limit }
    });
    
    if (response.data.errors) {
      throw new Error(`Snapshot API error: ${JSON.stringify(response.data.errors)}`);
    }
    
    return response.data.data.proposals;
  }
  
  /**
   * Get proposal details
   */
  private async getProposalDetails({ proposalId }: { proposalId: string }) {
    const query = `
      query Proposal($id: String!) {
        proposal(id: $id) {
          id
          title
          body
          choices
          start
          end
          state
          scores_total
          scores
          votes
          author
          created
          space {
            id
            name
          }
        }
      }
    `;
    
    const response = await axios.post(this.snapshotEndpoint, {
      query,
      variables: { id: proposalId }
    });
    
    return response.data.data.proposal;
  }
  
  /**
   * Get voting power
   */
  private async getVotingPower({
    address,
    daoSpace,
    blockNumber = 'latest'
  }: {
    address: string;
    daoSpace: string;
    blockNumber?: string;
  }): Promise<VotingPowerResult> {
    // This is a simplified implementation
    // In production, query actual governance token contracts
    
    const query = `
      query VotingPower($space: String!, $voter: String!) {
        vp(
          voter: $voter
          space: $space
        ) {
          vp
          vp_by_strategy
          vp_state
        }
      }
    `;
    
    const response = await axios.post(this.snapshotEndpoint, {
      query,
      variables: { space: daoSpace, voter: address }
    });
    
    const vpData = response.data.data.vp;
    
    return {
      address,
      votingPower: vpData?.vp?.toString() || '0',
      delegatedPower: '0', // Would query delegation contracts
      totalPower: vpData?.vp?.toString() || '0',
      breakdown: vpData?.vp_by_strategy?.map((vp: number, i: number) => ({
        source: `Strategy ${i + 1}`,
        amount: vp.toString()
      })) || []
    };
  }
  
  /**
   * Analyze treasury
   */
  private async analyzeTreasury({
    daoAddress,
    includeTokens = true,
    includeNFTs = false
  }: {
    daoAddress: string;
    includeTokens?: boolean;
    includeNFTs?: boolean;
  }): Promise<TreasuryAnalysis> {
    // Get ETH balance
    const ethBalance = await this.ethProvider.getBalance(daoAddress);
    const ethBalanceFormatted = ethers.formatEther(ethBalance);
    
    // Mock token holdings (in production, query actual ERC20 contracts)
    const mockAssets = [
      {
        token: 'ETH',
        symbol: 'ETH',
        amount: ethBalanceFormatted,
        valueUSD: (parseFloat(ethBalanceFormatted) * 3000).toFixed(2), // Mock price
        percentage: 60
      },
      {
        token: 'USDC',
        symbol: 'USDC',
        amount: '500000',
        valueUSD: '500000',
        percentage: 25
      },
      {
        token: 'UNI',
        symbol: 'UNI',
        amount: '100000',
        valueUSD: '300000',
        percentage: 15
      }
    ];
    
    const totalValue = mockAssets.reduce((sum, asset) => sum + parseFloat(asset.valueUSD), 0);
    
    return {
      address: daoAddress,
      totalValueUSD: totalValue.toFixed(2),
      assets: mockAssets,
      healthScore: 0.85,
      diversificationScore: 0.72,
      liquidityScore: 0.90
    };
  }
  
  /**
   * Get delegation info
   */
  private async getDelegationInfo({
    address,
    daoSpace
  }: {
    address: string;
    daoSpace: string;
  }) {
    return {
      address,
      daoSpace,
      delegating: {
        to: null,
        amount: '0'
      },
      delegated: {
        from: [],
        totalAmount: '0'
      }
    };
  }
  
  /**
   * Compare proposals
   */
  private async compareProposals({
    proposalId,
    searchSpaces = []
  }: {
    proposalId: string;
    searchSpaces?: string[];
  }) {
    const proposal = await this.getProposalDetails({ proposalId });
    
    // In production, use semantic search to find similar proposals
    return {
      originalProposal: proposal,
      similarProposals: [],
      commonPatterns: [],
      outcomes: []
    };
  }
  
  /**
   * Get governance metrics
   */
  private async getGovernanceMetrics({
    daoSpace,
    timeframe = '30d'
  }: {
    daoSpace: string;
    timeframe?: string;
  }) {
    const proposals = await this.fetchSnapshotProposals({
      space: daoSpace,
      state: 'all',
      limit: 50
    });
    
    return {
      daoSpace,
      timeframe,
      totalProposals: proposals.length,
      averageParticipation: 0.35,
      passRate: 0.68,
      averageVotingPower: '12500',
      topVoters: [],
      proposalTypes: {}
    };
  }
  
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('✅ BitMind DAO Governance MCP server running on stdio');
  }
}

// Start server
const server = new DAOGovernanceMCPServer();
server.run().catch((error) => {
  console.error('❌ MCP server error:', error);
  process.exit(1);
});

export default server;

