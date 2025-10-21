/**
 * Snapshot API Integration
 * Official GraphQL API for Snapshot governance platform
 * https://docs.snapshot.org/tools/api
 */

import axios from 'axios';

const SNAPSHOT_API = 'https://hub.snapshot.org/graphql';

export interface SnapshotProposal {
  id: string;
  title: string;
  body: string;
  choices: string[];
  start: number;
  end: number;
  snapshot: string;
  state: 'active' | 'pending' | 'closed';
  author: string;
  space: {
    id: string;
    name: string;
  };
  scores: number[];
  scores_total: number;
  votes: number;
  quorum: number;
  type: string;
}

export interface SnapshotSpace {
  id: string;
  name: string;
  about: string;
  network: string;
  symbol: string;
  members: string[];
}

/**
 * Fetch active proposals from Snapshot
 */
export async function fetchSnapshotProposals(
  spaceId?: string,
  state: 'active' | 'pending' | 'closed' = 'active'
): Promise<SnapshotProposal[]> {
  try {
    const query = `
      query Proposals($space: String, $state: String!) {
        proposals(
          first: 20,
          skip: 0,
          where: {
            space: $space,
            state: $state
          },
          orderBy: "created",
          orderDirection: desc
        ) {
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
          quorum
          type
        }
      }
    `;

    const response = await axios.post(SNAPSHOT_API, {
      query,
      variables: {
        space: spaceId,
        state,
      },
    });

    return response.data.data.proposals || [];
  } catch (error) {
    console.error('Snapshot API error:', error);
    return getMockSnapshotProposals();
  }
}

/**
 * Fetch specific proposal details
 */
export async function fetchSnapshotProposal(proposalId: string): Promise<SnapshotProposal | null> {
  try {
    const query = `
      query Proposal($id: String!) {
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
          quorum
          type
        }
      }
    `;

    const response = await axios.post(SNAPSHOT_API, {
      query,
      variables: { id: proposalId },
    });

    return response.data.data.proposal;
  } catch (error) {
    console.error('Snapshot API error:', error);
    return null;
  }
}

/**
 * Fetch DAO space information
 */
export async function fetchSnapshotSpace(spaceId: string): Promise<SnapshotSpace | null> {
  try {
    const query = `
      query Space($id: String!) {
        space(id: $id) {
          id
          name
          about
          network
          symbol
          members
        }
      }
    `;

    const response = await axios.post(SNAPSHOT_API, {
      query,
      variables: { id: spaceId },
    });

    return response.data.data.space;
  } catch (error) {
    console.error('Snapshot API error:', error);
    return null;
  }
}

/**
 * Search for DAOs on Snapshot
 */
export async function searchSnapshotSpaces(query: string): Promise<SnapshotSpace[]> {
  try {
    const graphqlQuery = `
      query Spaces {
        spaces(
          first: 20,
          skip: 0,
          orderBy: "created",
          orderDirection: desc
        ) {
          id
          name
          about
          network
          symbol
          members
        }
      }
    `;

    const response = await axios.post(SNAPSHOT_API, {
      query: graphqlQuery,
    });

    const spaces = response.data.data.spaces || [];
    
    // Filter by query locally
    if (query) {
      return spaces.filter((space: SnapshotSpace) => 
        space.name.toLowerCase().includes(query.toLowerCase()) ||
        space.id.toLowerCase().includes(query.toLowerCase())
      );
    }

    return spaces;
  } catch (error) {
    console.error('Snapshot API error:', error);
    return [];
  }
}

/**
 * Mock data for demo purposes (when API is unavailable)
 */
export function getMockSnapshotProposals(): SnapshotProposal[] {
  return [
    {
      id: 'snapshot-001',
      title: 'Increase Treasury Allocation for Q1 2025',
      body: 'This proposal seeks to increase the treasury allocation by 500,000 USDC for development initiatives including smart contract audits, frontend redesign, and mobile app development. The funds will be distributed over 3 months with milestone-based releases.',
      choices: ['For', 'Against', 'Abstain'],
      start: Math.floor(Date.now() / 1000) - 86400 * 2,
      end: Math.floor(Date.now() / 1000) + 86400 * 2,
      snapshot: '18000000',
      state: 'active',
      author: '0x123...abc',
      space: {
        id: 'bitmind.eth',
        name: 'BitMind DAO',
      },
      scores: [15420, 2340, 180],
      scores_total: 17940,
      votes: 342,
      quorum: 10000,
      type: 'single-choice',
    },
    {
      id: 'snapshot-002',
      title: 'Partner with Chainlink for Oracle Services',
      body: 'Proposal to integrate Chainlink price oracles into our DeFi protocol for reliable and decentralized price feeds. This will enhance security and reduce dependency on centralized data sources.',
      choices: ['For', 'Against', 'Abstain'],
      start: Math.floor(Date.now() / 1000) - 86400,
      end: Math.floor(Date.now() / 1000) + 86400 * 3,
      snapshot: '18050000',
      state: 'active',
      author: '0x456...def',
      space: {
        id: 'defi-protocol.eth',
        name: 'DeFi Protocol DAO',
      },
      scores: [22100, 890, 210],
      scores_total: 23200,
      votes: 456,
      quorum: 15000,
      type: 'single-choice',
    },
    {
      id: 'snapshot-003',
      title: 'Launch NFT Rewards Program for Active Voters',
      body: 'Create a gamified voting rewards system where active participants earn exclusive NFTs that unlock premium DAO features, governance boosts, and revenue sharing.',
      choices: ['For', 'Against', 'Abstain'],
      start: Math.floor(Date.now() / 1000),
      end: Math.floor(Date.now() / 1000) + 86400 * 7,
      snapshot: '18100000',
      state: 'active',
      author: '0x789...ghi',
      space: {
        id: 'community.eth',
        name: 'Community DAO',
      },
      scores: [0, 0, 0],
      scores_total: 0,
      votes: 0,
      quorum: 5000,
      type: 'single-choice',
    },
  ];
}

/**
 * Format Snapshot proposal for display
 */
export function formatSnapshotProposal(proposal: SnapshotProposal) {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = proposal.end - now;
  const daysLeft = Math.floor(timeLeft / 86400);
  const hoursLeft = Math.floor((timeLeft % 86400) / 3600);

  const totalVotes = proposal.scores.reduce((a, b) => a + b, 0);
  const forPercentage = totalVotes > 0 ? (proposal.scores[0] / totalVotes) * 100 : 0;
  const quorumPercentage = proposal.quorum > 0 ? (totalVotes / proposal.quorum) * 100 : 0;

  return {
    ...proposal,
    timeLeftText: daysLeft > 0 ? `${daysLeft} days` : `${hoursLeft} hours`,
    forPercentage: forPercentage.toFixed(1),
    quorumPercentage: Math.min(quorumPercentage, 100).toFixed(1),
    status: proposal.state.toUpperCase(),
  };
}

/**
 * Popular DAOs on Snapshot for quick access
 */
export const POPULAR_SNAPSHOT_DAOS = [
  { id: 'uniswap', name: 'Uniswap', description: 'Decentralized exchange protocol' },
  { id: 'aave.eth', name: 'Aave', description: 'DeFi lending protocol' },
  { id: 'ens.eth', name: 'ENS', description: 'Ethereum Name Service' },
  { id: 'gitcoin.eth', name: 'Gitcoin', description: 'Web3 funding platform' },
  { id: 'balancer.eth', name: 'Balancer', description: 'Automated portfolio manager' },
  { id: 'compound-governance.eth', name: 'Compound', description: 'Money market protocol' },
  { id: 'yam.eth', name: 'Yam Finance', description: 'DeFi experiment' },
  { id: 'radicle.eth', name: 'Radicle', description: 'Decentralized code collaboration' },
];

