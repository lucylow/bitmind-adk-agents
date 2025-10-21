/**
 * Tally API Integration
 * Official GraphQL API for Tally governance platform
 * https://docs.tally.xyz/tally-api/overview
 */

import axios from 'axios';

const TALLY_API = 'https://api.tally.xyz/query';
const TALLY_API_KEY = (import.meta as any).env?.VITE_TALLY_API_KEY || '';

export interface TallyProposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'executed' | 'defeated' | 'queued';
  proposer: string;
  eta?: number;
  startBlock: number;
  endBlock: number;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  quorum: string;
  governor: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface TallyGovernor {
  id: string;
  name: string;
  slug: string;
  tokenId: string;
  type: string;
  quorum: string;
  proposalThreshold: string;
}

/**
 * Fetch proposals from Tally
 */
export async function fetchTallyProposals(
  governorId?: string,
  chainId: string = '1'
): Promise<TallyProposal[]> {
  try {
    const query = `
      query Proposals($chainId: ChainID!, $governorId: ID) {
        proposals(
          chainId: $chainId
          governorId: $governorId
          pagination: { limit: 20, offset: 0 }
          sort: { field: START_BLOCK, order: DESC }
        ) {
          id
          title
          description
          status
          proposer
          eta
          startBlock
          endBlock
          forVotes
          againstVotes
          abstainVotes
          quorum
          governor {
            id
            name
            slug
          }
        }
      }
    `;

    const response = await axios.post(
      TALLY_API,
      {
        query,
        variables: {
          chainId,
          governorId,
        },
      },
      {
        headers: {
          'Api-Key': TALLY_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data.proposals || [];
  } catch (error) {
    console.error('Tally API error:', error);
    return getMockTallyProposals();
  }
}

/**
 * Fetch specific proposal details
 */
export async function fetchTallyProposal(
  proposalId: string,
  chainId: string = '1'
): Promise<TallyProposal | null> {
  try {
    const query = `
      query Proposal($id: ID!, $chainId: ChainID!) {
        proposal(id: $id, chainId: $chainId) {
          id
          title
          description
          status
          proposer
          eta
          startBlock
          endBlock
          forVotes
          againstVotes
          abstainVotes
          quorum
          governor {
            id
            name
            slug
          }
        }
      }
    `;

    const response = await axios.post(
      TALLY_API,
      {
        query,
        variables: {
          id: proposalId,
          chainId,
        },
      },
      {
        headers: {
          'Api-Key': TALLY_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data.proposal;
  } catch (error) {
    console.error('Tally API error:', error);
    return null;
  }
}

/**
 * Fetch governor (DAO) information
 */
export async function fetchTallyGovernor(
  slug: string,
  chainId: string = '1'
): Promise<TallyGovernor | null> {
  try {
    const query = `
      query Governor($slug: String!, $chainId: ChainID!) {
        governor(slug: $slug, chainId: $chainId) {
          id
          name
          slug
          tokenId
          type
          quorum
          proposalThreshold
        }
      }
    `;

    const response = await axios.post(
      TALLY_API,
      {
        query,
        variables: {
          slug,
          chainId,
        },
      },
      {
        headers: {
          'Api-Key': TALLY_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data.governor;
  } catch (error) {
    console.error('Tally API error:', error);
    return null;
  }
}

/**
 * Mock data for demo purposes
 */
export function getMockTallyProposals(): TallyProposal[] {
  return [
    {
      id: 'tally-001',
      title: 'Upgrade Governance Smart Contracts v2.0',
      description: 'Deploy upgraded governance contracts with enhanced security features, vote delegation, and quadratic voting mechanisms. Full audit completed by Trail of Bits with no critical findings.',
      status: 'active',
      proposer: '0xabc...123',
      startBlock: 18000000,
      endBlock: 18050000,
      forVotes: '8900000000000000000000',
      againstVotes: '450000000000000000000',
      abstainVotes: '50000000000000000000',
      quorum: '5000000000000000000000',
      governor: {
        id: 'gov-001',
        name: 'DeFi Alliance DAO',
        slug: 'defi-alliance',
      },
    },
    {
      id: 'tally-002',
      title: 'Allocate 1M USDC for Security Bug Bounty Program',
      description: 'Establish a comprehensive bug bounty program with Immunefi to incentivize security researchers to find vulnerabilities in our protocol before malicious actors do.',
      status: 'active',
      proposer: '0xdef...456',
      startBlock: 18020000,
      endBlock: 18070000,
      forVotes: '12500000000000000000000',
      againstVotes: '230000000000000000000',
      abstainVotes: '120000000000000000000',
      quorum: '5000000000000000000000',
      governor: {
        id: 'gov-002',
        name: 'Protocol Security DAO',
        slug: 'protocol-security',
      },
    },
  ];
}

/**
 * Format Tally proposal for display
 */
export function formatTallyProposal(proposal: TallyProposal) {
  const forVotes = parseFloat(proposal.forVotes) / 1e18;
  const againstVotes = parseFloat(proposal.againstVotes) / 1e18;
  const abstainVotes = parseFloat(proposal.abstainVotes) / 1e18;
  const totalVotes = forVotes + againstVotes + abstainVotes;
  
  const forPercentage = totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0;
  const quorumReached = totalVotes >= parseFloat(proposal.quorum) / 1e18;

  // Estimate blocks remaining (assuming 12s block time)
  const currentBlock = 18030000; // Mock current block
  const blocksRemaining = Math.max(0, proposal.endBlock - currentBlock);
  const hoursRemaining = (blocksRemaining * 12) / 3600;
  const daysRemaining = Math.floor(hoursRemaining / 24);

  return {
    ...proposal,
    forVotesFormatted: forVotes.toLocaleString(),
    againstVotesFormatted: againstVotes.toLocaleString(),
    abstainVotesFormatted: abstainVotes.toLocaleString(),
    forPercentage: forPercentage.toFixed(1),
    quorumReached,
    timeLeftText: daysRemaining > 0 ? `${daysRemaining} days` : `${Math.floor(hoursRemaining)} hours`,
  };
}

/**
 * Popular DAOs on Tally for quick access
 */
export const POPULAR_TALLY_DAOS = [
  { slug: 'compound', name: 'Compound', description: 'Money market protocol' },
  { slug: 'gitcoin', name: 'Gitcoin', description: 'Web3 funding platform' },
  { slug: 'optimism', name: 'Optimism', description: 'L2 scaling solution' },
  { slug: 'arbitrum', name: 'Arbitrum', description: 'L2 scaling solution' },
  { slug: 'ens', name: 'ENS', description: 'Ethereum Name Service' },
  { slug: 'hop-protocol', name: 'Hop Protocol', description: 'Cross-chain bridge' },
  { slug: 'frax', name: 'Frax Finance', description: 'Fractional stablecoin protocol' },
  { slug: 'pool-together', name: 'PoolTogether', description: 'No-loss lottery' },
];

