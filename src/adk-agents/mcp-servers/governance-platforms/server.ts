import { z } from 'zod';
import axios from 'axios';

/**
 * Governance Platform MCP Server
 * Integrates with Snapshot, Tally, and other governance platforms
 */

export interface GovernancePlatformConfig {
  snapshotHub?: string;
  tallyApiKey?: string;
  tallyApiUrl?: string;
}

export const SnapshotProposalSchema = z.object({
  id: z.string(),
  ipfs: z.string(),
  space: z.object({
    id: z.string(),
    name: z.string(),
  }),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  choices: z.array(z.string()),
  start: z.number(),
  end: z.number(),
  state: z.string(),
  author: z.string(),
  scores: z.array(z.number()),
  scores_total: z.number(),
  votes: z.number(),
});

export type SnapshotProposal = z.infer<typeof SnapshotProposalSchema>;

export const TallyProposalSchema = z.object({
  id: z.string(),
  proposalId: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.string(),
  creator: z.string(),
  startBlock: z.number(),
  endBlock: z.number(),
  forVotes: z.string(),
  againstVotes: z.string(),
  abstainVotes: z.string(),
  quorum: z.string(),
  eta: z.number().optional(),
});

export type TallyProposal = z.infer<typeof TallyProposalSchema>;

export class GovernancePlatformMCPServer {
  private snapshotHub: string;
  private tallyApiKey?: string;
  private tallyApiUrl: string;

  constructor(config: GovernancePlatformConfig) {
    this.snapshotHub = config.snapshotHub || 'https://hub.snapshot.org/graphql';
    this.tallyApiKey = config.tallyApiKey;
    this.tallyApiUrl = config.tallyApiUrl || 'https://api.tally.xyz/query';
  }

  /**
   * Get proposals from Snapshot for a specific space
   */
  async getSnapshotProposals(
    space: string,
    options?: {
      first?: number;
      skip?: number;
      state?: 'pending' | 'active' | 'closed' | 'all';
    }
  ): Promise<SnapshotProposal[]> {
    const query = `
      query Proposals($space: String!, $first: Int, $skip: Int, $state: String) {
        proposals(
          first: $first
          skip: $skip
          where: { space: $space, state: $state }
          orderBy: "created"
          orderDirection: desc
        ) {
          id
          ipfs
          space {
            id
            name
          }
          type
          title
          body
          choices
          start
          end
          state
          author
          scores
          scores_total
          votes
        }
      }
    `;

    try {
      const response = await axios.post(this.snapshotHub, {
        query,
        variables: {
          space,
          first: options?.first || 20,
          skip: options?.skip || 0,
          state: options?.state || 'all',
        },
      });

      if (response.data.errors) {
        throw new Error(`Snapshot API Error: ${JSON.stringify(response.data.errors)}`);
      }

      return response.data.data.proposals.map((p: any) =>
        SnapshotProposalSchema.parse(p)
      );
    } catch (error) {
      console.error('Failed to fetch Snapshot proposals:', error);
      return this.getMockSnapshotProposals(space);
    }
  }

  /**
   * Get a single proposal from Snapshot
   */
  async getSnapshotProposal(proposalId: string): Promise<SnapshotProposal | null> {
    const query = `
      query Proposal($id: String!) {
        proposal(id: $id) {
          id
          ipfs
          space {
            id
            name
          }
          type
          title
          body
          choices
          start
          end
          state
          author
          scores
          scores_total
          votes
        }
      }
    `;

    try {
      const response = await axios.post(this.snapshotHub, {
        query,
        variables: { id: proposalId },
      });

      if (response.data.errors) {
        throw new Error(`Snapshot API Error: ${JSON.stringify(response.data.errors)}`);
      }

      if (!response.data.data.proposal) {
        return null;
      }

      return SnapshotProposalSchema.parse(response.data.data.proposal);
    } catch (error) {
      console.error('Failed to fetch Snapshot proposal:', error);
      return null;
    }
  }

  /**
   * Get votes for a Snapshot proposal
   */
  async getSnapshotVotes(
    proposalId: string,
    options?: { first?: number; skip?: number }
  ): Promise<Array<{
    voter: string;
    choice: number | number[];
    vp: number;
    created: number;
    reason?: string;
  }>> {
    const query = `
      query Votes($proposalId: String!, $first: Int, $skip: Int) {
        votes(
          first: $first
          skip: $skip
          where: { proposal: $proposalId }
          orderBy: "vp"
          orderDirection: desc
        ) {
          voter
          choice
          vp
          created
          reason
        }
      }
    `;

    try {
      const response = await axios.post(this.snapshotHub, {
        query,
        variables: {
          proposalId,
          first: options?.first || 100,
          skip: options?.skip || 0,
        },
      });

      if (response.data.errors) {
        throw new Error(`Snapshot API Error: ${JSON.stringify(response.data.errors)}`);
      }

      return response.data.data.votes;
    } catch (error) {
      console.error('Failed to fetch Snapshot votes:', error);
      return [];
    }
  }

  /**
   * Get proposals from Tally
   */
  async getTallyProposals(
    governorId: string,
    options?: { first?: number; offset?: number }
  ): Promise<TallyProposal[]> {
    const query = `
      query Proposals($governorId: String!, $first: Int, $offset: Int) {
        proposals(
          governorId: $governorId
          first: $first
          offset: $offset
          orderBy: { field: START_BLOCK, direction: DESC }
        ) {
          id
          proposalId
          title
          description
          status
          creator
          startBlock
          endBlock
          forVotes
          againstVotes
          abstainVotes
          quorum
          eta
        }
      }
    `;

    try {
      const response = await axios.post(
        this.tallyApiUrl,
        {
          query,
          variables: {
            governorId,
            first: options?.first || 20,
            offset: options?.offset || 0,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.tallyApiKey && { 'Api-Key': this.tallyApiKey }),
          },
        }
      );

      if (response.data.errors) {
        throw new Error(`Tally API Error: ${JSON.stringify(response.data.errors)}`);
      }

      return response.data.data.proposals.map((p: any) =>
        TallyProposalSchema.parse(p)
      );
    } catch (error) {
      console.error('Failed to fetch Tally proposals:', error);
      return this.getMockTallyProposals(governorId);
    }
  }

  /**
   * Get a single proposal from Tally
   */
  async getTallyProposal(proposalId: string): Promise<TallyProposal | null> {
    const query = `
      query Proposal($proposalId: String!) {
        proposal(id: $proposalId) {
          id
          proposalId
          title
          description
          status
          creator
          startBlock
          endBlock
          forVotes
          againstVotes
          abstainVotes
          quorum
          eta
        }
      }
    `;

    try {
      const response = await axios.post(
        this.tallyApiUrl,
        {
          query,
          variables: { proposalId },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.tallyApiKey && { 'Api-Key': this.tallyApiKey }),
          },
        }
      );

      if (response.data.errors) {
        throw new Error(`Tally API Error: ${JSON.stringify(response.data.errors)}`);
      }

      if (!response.data.data.proposal) {
        return null;
      }

      return TallyProposalSchema.parse(response.data.data.proposal);
    } catch (error) {
      console.error('Failed to fetch Tally proposal:', error);
      return null;
    }
  }

  /**
   * Get DAO information from Tally
   */
  async getTallyDAOInfo(governorId: string): Promise<{
    id: string;
    name: string;
    slug: string;
    tokenId: string;
    totalProposals: number;
    totalVoters: number;
  } | null> {
    const query = `
      query Governor($governorId: String!) {
        governor(id: $governorId) {
          id
          name
          slug
          token {
            id
          }
          proposalStats {
            total
          }
          delegateStats {
            total
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        this.tallyApiUrl,
        {
          query,
          variables: { governorId },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.tallyApiKey && { 'Api-Key': this.tallyApiKey }),
          },
        }
      );

      if (response.data.errors || !response.data.data.governor) {
        return null;
      }

      const gov = response.data.data.governor;
      return {
        id: gov.id,
        name: gov.name,
        slug: gov.slug,
        tokenId: gov.token.id,
        totalProposals: gov.proposalStats.total,
        totalVoters: gov.delegateStats.total,
      };
    } catch (error) {
      console.error('Failed to fetch Tally DAO info:', error);
      return null;
    }
  }

  // Mock data methods for development
  private getMockSnapshotProposals(space: string): SnapshotProposal[] {
    return [
      {
        id: 'snapshot-proposal-1',
        ipfs: 'QmMockIPFSHash1',
        space: {
          id: space,
          name: 'Mock DAO',
        },
        type: 'single-choice',
        title: 'Increase Treasury Allocation for Development',
        body: 'This proposal seeks to increase the development fund allocation from 10% to 15%.',
        choices: ['For', 'Against', 'Abstain'],
        start: Math.floor(Date.now() / 1000) - 86400 * 2,
        end: Math.floor(Date.now() / 1000) + 86400 * 5,
        state: 'active',
        author: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        scores: [1500000, 300000, 50000],
        scores_total: 1850000,
        votes: 1234,
      },
    ];
  }

  private getMockTallyProposals(governorId: string): TallyProposal[] {
    return [
      {
        id: 'tally-proposal-1',
        proposalId: '1',
        title: 'Implement Protocol Upgrade v2.0',
        description: 'This proposal implements major protocol upgrades including gas optimization and new features.',
        status: 'ACTIVE',
        creator: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        startBlock: 18000000,
        endBlock: 18050000,
        forVotes: '1500000000000000000000000',
        againstVotes: '300000000000000000000000',
        abstainVotes: '50000000000000000000000',
        quorum: '1000000000000000000000000',
        eta: undefined,
      },
    ];
  }
}

export default GovernancePlatformMCPServer;

