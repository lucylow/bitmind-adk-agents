// backend/src/models/ProposalAnalysis.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IRiskFactor {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  evidence: string[];
  confidence: number;
}

export interface IAnalysis {
  summary: string;
  financialImpact: string;
  risks: IRiskFactor[];
  recommendations: string[];
  confidence: number;
  keyFactors?: string[];
}

export interface IUserSpecificRecommendation {
  recommendation: 'FOR' | 'AGAINST' | 'ABSTAIN';
  confidence: number;
  reasoning: string;
  keyFactors: string[];
  estimatedImpact?: string;
}

export interface IProposalAnalysis extends Document {
  proposalId: string;
  daoName: string;
  daoAddress?: string;
  analysis: IAnalysis;
  userSpecificRecommendation?: IUserSpecificRecommendation;
  metadata: {
    proposalTitle?: string;
    proposalDescription?: string;
    proposer?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  };
  timestamp: Date;
  expiresAt: Date;
  version: string;
}

const riskFactorSchema = new Schema<IRiskFactor>({
  type: { type: String, required: true },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    required: true
  },
  description: { type: String, required: true },
  evidence: [String],
  confidence: { type: Number, min: 0, max: 1 }
});

const analysisSchema = new Schema<IAnalysis>({
  summary: { type: String, required: true },
  financialImpact: String,
  risks: [riskFactorSchema],
  recommendations: [String],
  confidence: { type: Number, min: 0, max: 1 },
  keyFactors: [String]
});

const userSpecificRecommendationSchema = new Schema<IUserSpecificRecommendation>({
  recommendation: {
    type: String,
    enum: ['FOR', 'AGAINST', 'ABSTAIN'],
    required: true
  },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  reasoning: { type: String, required: true },
  keyFactors: [String],
  estimatedImpact: String
});

const proposalAnalysisSchema = new Schema<IProposalAnalysis>({
  proposalId: {
    type: String,
    required: true,
    index: true
  },
  daoName: { type: String, required: true },
  daoAddress: String,
  analysis: {
    type: analysisSchema,
    required: true
  },
  userSpecificRecommendation: userSpecificRecommendationSchema,
  metadata: {
    proposalTitle: String,
    proposalDescription: String,
    proposer: String,
    startDate: Date,
    endDate: Date,
    status: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  version: {
    type: String,
    default: '1.0.0'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
proposalAnalysisSchema.index({ proposalId: 1, daoName: 1 });
proposalAnalysisSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const ProposalAnalysis = mongoose.model<IProposalAnalysis>('ProposalAnalysis', proposalAnalysisSchema);

