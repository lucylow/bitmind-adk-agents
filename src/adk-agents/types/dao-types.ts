/**
 * DAO Governance Co-pilot Type Definitions
 * Defines core interfaces for DAO governance operations
 */

export interface DAOProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  startBlock: number;
  endBlock: number;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  status: 'PENDING' | 'ACTIVE' | 'EXECUTED' | 'FAILED' | 'CANCELLED';
  executionDate?: Date;
  executionTx?: string;
}

export interface ProposalAnalysis {
  proposalId: string;
  summary: string;
  financialImpact: string;
  risks: string[];
  opportunities: string[];
  recommendation: 'FOR' | 'AGAINST' | 'ABSTAIN' | 'NEUTRAL';
  confidence: number;
  reasoning: string[];
  keyMetrics: {
    estimatedCost: number;
    treasuryImpactPercent: number;
    riskScore: number;
    communitySupport: number;
  };
}

export interface VotingStrategy {
  strategy: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  delegateIfBelowThreshold: boolean;
  votingPowerThreshold: number;
  autoVote: boolean;
  requiresApproval: boolean;
}

export interface TreasuryData {
  totalValueUSD: number;
  tokens: Array<{
    symbol: string;
    address: string;
    balance: number;
    valueUSD: number;
    percentage: number;
  }>;
  lastUpdated: Date;
  monthlyBurnRate: number;
  runwayMonths: number;
}

export interface VotingRecommendation {
  vote: 'FOR' | 'AGAINST' | 'ABSTAIN';
  confidence: number;
  reasoning: string[];
  alternativeActions: string[];
  delegationSuggestion?: {
    shouldDelegate: boolean;
    suggestedDelegate?: string;
    reason: string;
  };
}

export interface UserPreferences {
  address: string;
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  votingStrategy: VotingStrategy;
  notificationPreferences: {
    newProposals: boolean;
    votingDeadlines: boolean;
    executionResults: boolean;
  };
  watchedDAOs: string[];
}

export interface GovernanceFlowResult {
  proposalId: string;
  analysis: ProposalAnalysis;
  recommendation: VotingRecommendation;
  treasuryHealth: TreasuryData;
  timestamp: Date;
  agentActions: Array<{
    agentName: string;
    action: string;
    result: string;
  }>;
}

