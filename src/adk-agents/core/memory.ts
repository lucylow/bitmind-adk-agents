/**
 * ADK-TS Memory System
 * Provides short-term and long-term memory for agents
 */

import type { MemoryConfig } from './types';

export class InMemoryStorage {
  private storage: Map<string, unknown> = new Map();
  private config?: MemoryConfig;

  constructor(config?: MemoryConfig) {
    this.config = config;
  }

  async store(key: string, value: unknown): Promise<void> {
    // Check max entries limit
    if (this.config?.maxEntries && this.storage.size >= this.config.maxEntries) {
      // Remove oldest entry (simplified - in production use proper LRU)
      const firstKey = this.storage.keys().next().value;
      this.storage.delete(firstKey);
    }

    this.storage.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  async retrieve(key: string): Promise<unknown> {
    const entry = this.storage.get(key) as { value: unknown; timestamp: number } | undefined;
    return entry?.value;
  }

  async retrieveAll(): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of this.storage.entries()) {
      result[key] = (entry as { value: unknown }).value;
    }
    return result;
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async has(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  getSize(): number {
    return this.storage.size;
  }
}

export class UserPreferenceMemory extends InMemoryStorage {
  async storeUserPreference(userAddress: string, preference: Record<string, unknown>): Promise<void> {
    await this.store(`user:${userAddress}`, preference);
  }

  async getUserPreference(userAddress: string): Promise<Record<string, unknown>> {
    const pref = await this.retrieve(`user:${userAddress}`);
    return (pref as Record<string, unknown>) || {};
  }

  async storeVotingHistory(userAddress: string, vote: {
    proposalId: string;
    vote: 'FOR' | 'AGAINST' | 'ABSTAIN';
    timestamp: number;
  }): Promise<void> {
    const history = await this.getVotingHistory(userAddress);
    history.push(vote);
    await this.store(`voting_history:${userAddress}`, history);
  }

  async getVotingHistory(userAddress: string): Promise<Array<{
    proposalId: string;
    vote: 'FOR' | 'AGAINST' | 'ABSTAIN';
    timestamp: number;
  }>> {
    const history = await this.retrieve(`voting_history:${userAddress}`);
    return (history as any[]) || [];
  }
}

