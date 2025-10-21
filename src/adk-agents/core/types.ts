/**
 * ADK-TS Core Types
 * Type definitions for the Agent Development Kit TypeScript framework
 */

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  model: string;
  instructions: string;
  tools: Tool[];
  memory?: MemoryConfig;
  temperature?: number;
  maxTokens?: number;
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresApproval?: boolean;
}

export interface MemoryConfig {
  type: 'short-term' | 'long-term' | 'hybrid';
  maxEntries?: number;
  persistTo?: string;
}

export interface AgentRunResult {
  runId: string;
  agentId: string;
  input: string;
  output: unknown;
  toolCalls: ToolCall[];
  timestamp: Date;
  status: 'SUCCESS' | 'FAILED' | 'PENDING_APPROVAL';
  error?: string;
}

export interface ToolCall {
  toolName: string;
  input: Record<string, unknown>;
  output: unknown;
  timestamp: Date;
  duration: number;
}

export interface WorkflowStep {
  name: string;
  execute: () => Promise<unknown>;
  onSuccess?: (result: unknown) => Promise<void>;
  onError?: (error: Error) => Promise<void>;
}

export interface MCPServerConfig {
  name: string;
  description: string;
  endpoints: MCPEndpoint[];
}

export interface MCPEndpoint {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  handler: (params: Record<string, unknown>) => Promise<unknown>;
}

export interface AgentMemory {
  store: (key: string, value: unknown) => Promise<void>;
  retrieve: (key: string) => Promise<unknown>;
  clear: () => Promise<void>;
}

export type AgentModel = 
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro'
  | 'gemini-1.5-pro'
  | 'claude-3-5-sonnet'
  | 'gpt-4o';

