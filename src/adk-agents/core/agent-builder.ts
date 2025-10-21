/**
 * ADK-TS Agent Builder
 * Builder pattern for creating AI agents with fluent API
 */

import type { AgentConfig, Tool, MemoryConfig, AgentRunResult, AgentModel } from './types';
import { InMemoryStorage } from './memory';
import { auditLogger } from '../audit/audit-schema';

export class AgentBuilder {
  private config: Partial<AgentConfig> = {
    tools: [],
    temperature: 0.7,
    maxTokens: 4096,
  };

  static create(id: string): AgentBuilder {
    const builder = new AgentBuilder();
    builder.config.id = id;
    return builder;
  }

  withName(name: string): this {
    this.config.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.config.description = description;
    return this;
  }

  withModel(model: AgentModel): this {
    this.config.model = model;
    return this;
  }

  withInstructions(instructions: string): this {
    this.config.instructions = instructions;
    return this;
  }

  withTools(tools: Tool[]): this {
    this.config.tools = [...(this.config.tools || []), ...tools];
    return this;
  }

  withTool(tool: Tool): this {
    this.config.tools = [...(this.config.tools || []), tool];
    return this;
  }

  withMemory(memory: MemoryConfig): this {
    this.config.memory = memory;
    return this;
  }

  withTemperature(temperature: number): this {
    this.config.temperature = temperature;
    return this;
  }

  withMaxTokens(maxTokens: number): this {
    this.config.maxTokens = maxTokens;
    return this;
  }

  build(): Agent {
    if (!this.config.id) throw new Error('Agent ID is required');
    if (!this.config.name) throw new Error('Agent name is required');
    if (!this.config.model) throw new Error('Agent model is required');
    if (!this.config.instructions) throw new Error('Agent instructions are required');

    return new Agent(this.config as AgentConfig);
  }
}

export class Agent {
  private config: AgentConfig;
  private memory: InMemoryStorage;

  constructor(config: AgentConfig) {
    this.config = config;
    this.memory = new InMemoryStorage(config.memory);
  }

  async run(input: string, context?: Record<string, unknown>): Promise<AgentRunResult> {
    const runId = `run-${this.config.id}-${Date.now()}`;
    const startTime = Date.now();

    try {
      // Log the run start
      auditLogger.log({
        agentId: this.config.id,
        agentName: this.config.name,
        actionType: 'AGENT_RUN',
        inputs: { input, context },
        modelVersion: this.config.model,
        status: 'SUCCESS',
      });

      // Store context in memory
      if (context) {
        await this.memory.store('lastContext', context);
      }

      // Execute agent logic
      const result = await this.executeAgentLogic(input, context);

      const runResult: AgentRunResult = {
        runId,
        agentId: this.config.id,
        input,
        output: result.output,
        toolCalls: result.toolCalls,
        timestamp: new Date(),
        status: 'SUCCESS',
      };

      return runResult;
    } catch (error) {
      auditLogger.log({
        agentId: this.config.id,
        agentName: this.config.name,
        actionType: 'AGENT_RUN',
        inputs: { input, context },
        modelVersion: this.config.model,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  private async executeAgentLogic(
    input: string,
    context?: Record<string, unknown>
  ): Promise<{ output: unknown; toolCalls: any[] }> {
    // This is a simplified implementation
    // In a real ADK-TS implementation, this would call the LLM with function calling
    const toolCalls: any[] = [];

    // Simulate AI processing
    // In production, this would integrate with Gemini/Claude/GPT-4 API
    const output = {
      analysis: `Processed: ${input}`,
      context,
      instructions: this.config.instructions,
    };

    return { output, toolCalls };
  }

  async executeTool(toolName: string, params: Record<string, unknown>): Promise<unknown> {
    const tool = this.config.tools.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    const startTime = Date.now();
    const result = await tool.execute(params);
    const duration = Date.now() - startTime;

    auditLogger.log({
      agentId: this.config.id,
      agentName: this.config.name,
      actionType: 'TOOL_CALL',
      toolName,
      inputs: params,
      outputs: { result },
      modelVersion: this.config.model,
      status: 'SUCCESS',
    });

    return result;
  }

  getConfig(): AgentConfig {
    return { ...this.config };
  }

  getMemory(): InMemoryStorage {
    return this.memory;
  }
}

