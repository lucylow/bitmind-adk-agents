// backend/src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPreferences {
  riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  focusAreas: Array<'DEFI' | 'INFRASTRUCTURE' | 'GOVERNANCE' | 'GRANTS' | 'TREASURY'>;
  votingStrategy: 'ACTIVE' | 'DELEGATE' | 'MIXED';
  notificationPreferences: {
    email: boolean;
    push: boolean;
    telegram: boolean;
  };
}

export interface IVotingHistory {
  proposalId: string;
  vote: string;
  timestamp: Date;
  confidence?: number;
  reasoning?: string;
}

export interface IConversation {
  message: string;
  response: string;
  agent: string;
  timestamp: Date;
}

export interface IInteraction {
  type: string;
  proposalId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface IUser extends Document {
  walletAddress: string;
  nickname?: string;
  email?: string;
  preferences: IUserPreferences;
  votingHistory: IVotingHistory[];
  conversations: IConversation[];
  interactions: IInteraction[];
  delegateAddress?: string;
  createdAt: Date;
  lastActive: Date;
}

const userPreferencesSchema = new Schema<IUserPreferences>({
  riskTolerance: {
    type: String,
    enum: ['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'],
    default: 'MODERATE'
  },
  focusAreas: [{
    type: String,
    enum: ['DEFI', 'INFRASTRUCTURE', 'GOVERNANCE', 'GRANTS', 'TREASURY']
  }],
  votingStrategy: {
    type: String,
    enum: ['ACTIVE', 'DELEGATE', 'MIXED'],
    default: 'MIXED'
  },
  notificationPreferences: {
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
    telegram: { type: Boolean, default: false }
  }
});

const votingHistorySchema = new Schema<IVotingHistory>({
  proposalId: { type: String, required: true },
  vote: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  confidence: Number,
  reasoning: String
});

const conversationSchema = new Schema<IConversation>({
  message: { type: String, required: true },
  response: { type: String, required: true },
  agent: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const interactionSchema = new Schema<IInteraction>({
  type: { type: String, required: true },
  proposalId: String,
  timestamp: { type: Date, default: Date.now },
  metadata: Schema.Types.Mixed
});

const userSchema = new Schema<IUser>({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  nickname: String,
  email: String,
  preferences: {
    type: userPreferencesSchema,
    default: () => ({})
  },
  votingHistory: [votingHistorySchema],
  conversations: [conversationSchema],
  interactions: [interactionSchema],
  delegateAddress: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for performance
userSchema.index({ lastActive: -1 });
userSchema.index({ 'votingHistory.proposalId': 1 });

export const User = mongoose.model<IUser>('User', userSchema);

