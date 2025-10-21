/**
 * ADK-TS Tool Factory
 * Factory for creating agent tools with consistent patterns
 */

import type { Tool } from './types';
import { z } from 'zod';

export interface ToolDefinition {
  name: string;
  description: string;
  schema: z.ZodSchema;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresApproval?: boolean;
}

export class ToolFactory {
  static createTool(definition: ToolDefinition): Tool {
    return {
      name: definition.name,
      description: definition.description,
      parameters: this.zodToParameters(definition.schema),
      execute: async (params: Record<string, unknown>) => {
        // Validate parameters
        const validated = definition.schema.parse(params) as Record<string, unknown>;
        return definition.execute(validated);
      },
      riskLevel: definition.riskLevel || 'LOW',
      requiresApproval: definition.requiresApproval || false,
    };
  }

  private static zodToParameters(schema: z.ZodSchema): Record<string, unknown> {
    // Simplified conversion - in production, use proper Zod to JSON Schema conversion
    return {
      type: 'object',
      properties: {},
    };
  }

  static createToolFromFunction<T extends Record<string, unknown>>(
    name: string,
    description: string,
    schema: z.ZodSchema<T>,
    fn: (params: T) => Promise<unknown>,
    options?: { riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'; requiresApproval?: boolean }
  ): Tool {
    return this.createTool({
      name,
      description,
      schema,
      execute: fn as (params: Record<string, unknown>) => Promise<unknown>,
      riskLevel: options?.riskLevel,
      requiresApproval: options?.requiresApproval,
    });
  }
}

export function tool<T extends Record<string, unknown>>(config: {
  name: string;
  description: string;
  schema: z.ZodSchema<T>;
  execute: (params: T) => Promise<unknown>;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresApproval?: boolean;
}): Tool {
  return ToolFactory.createTool({
    name: config.name,
    description: config.description,
    schema: config.schema,
    execute: config.execute as (params: Record<string, unknown>) => Promise<unknown>,
    riskLevel: config.riskLevel,
    requiresApproval: config.requiresApproval,
  });
}

