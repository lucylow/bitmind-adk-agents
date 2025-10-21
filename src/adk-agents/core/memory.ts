/**
 * Memory Management for ADK Agents
 * Handles user preferences, voting history, and agent memory
 */

export interface MemoryEntry {
  key: string;
  value: any;
  timestamp: number;
  expiresAt?: number;
}

export interface MemoryOptions {
  type: 'short-term' | 'long-term';
  maxEntries: number;
  ttl?: number; // Time to live in milliseconds
}

export class Memory {
  private entries: Map<string, MemoryEntry> = new Map();
  private options: MemoryOptions;

  constructor(options: MemoryOptions) {
    this.options = options;
  }

  set(key: string, value: any, ttl?: number): void {
    const entry: MemoryEntry = {
      key,
      value,
      timestamp: Date.now(),
      expiresAt: ttl ? Date.now() + ttl : undefined,
    };

    this.entries.set(key, entry);

    // Enforce max entries
    if (this.entries.size > this.options.maxEntries) {
      const oldestKey = Array.from(this.entries.keys())[0];
      this.entries.delete(oldestKey);
    }
  }

  get(key: string): any | undefined {
    const entry = this.entries.get(key);
    
    if (!entry) return undefined;

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return undefined;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
  }

  size(): number {
    return this.entries.size;
  }

  keys(): string[] {
    return Array.from(this.entries.keys());
  }
}

export interface UserPreference {
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  votingStrategy: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  preferredCategories?: string[];
  totalFeedbacks?: number;
  averageSatisfaction?: number;
  lastFeedback?: any;
}

export interface VotingHistoryEntry {
  proposalId: string;
  vote: 'FOR' | 'AGAINST' | 'ABSTAIN';
  timestamp: number;
  confidence?: number;
}

export class UserPreferenceMemory extends Memory {
  constructor(options: MemoryOptions) {
    super(options);
  }

  async getUserPreference(userAddress: string): Promise<UserPreference> {
    const key = `pref:${userAddress}`;
    const pref = this.get(key);
    
    if (pref) return pref;

    // Default preferences
    const defaultPref: UserPreference = {
      riskTolerance: 'MEDIUM',
      votingStrategy: 'BALANCED',
      totalFeedbacks: 0,
      averageSatisfaction: 0.5,
    };

    this.set(key, defaultPref);
    return defaultPref;
  }

  async storeUserPreference(userAddress: string, preference: UserPreference): Promise<void> {
    const key = `pref:${userAddress}`;
    this.set(key, preference);
  }

  async getVotingHistory(userAddress: string): Promise<VotingHistoryEntry[]> {
    const key = `history:${userAddress}`;
    return this.get(key) || [];
  }

  async storeVotingHistory(userAddress: string, entry: VotingHistoryEntry): Promise<void> {
    const key = `history:${userAddress}`;
    const history = await this.getVotingHistory(userAddress);
    history.push(entry);
    
    // Keep only last 100 entries
    if (history.length > 100) {
      history.shift();
    }
    
    this.set(key, history);
  }

  async clearUserData(userAddress: string): Promise<void> {
    this.delete(`pref:${userAddress}`);
    this.delete(`history:${userAddress}`);
  }
}
