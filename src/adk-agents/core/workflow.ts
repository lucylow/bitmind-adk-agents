/**
 * ADK-TS Workflow System
 * Orchestrates multi-step agent workflows
 */

import type { WorkflowStep } from './types';
import { auditLogger } from '../audit/audit-schema';

export abstract class Workflow {
  protected workflowId: string;
  protected workflowName: string;
  protected steps: WorkflowStep[] = [];

  constructor(id: string, name: string) {
    this.workflowId = id;
    this.workflowName = name;
  }

  protected async executeSteps(steps: WorkflowStep[]): Promise<unknown[]> {
    const results: unknown[] = [];

    for (const step of steps) {
      try {
        console.log(`[WORKFLOW] Executing step: ${step.name}`);
        const result = await step.execute();
        results.push(result);

        if (step.onSuccess) {
          await step.onSuccess(result);
        }
      } catch (error) {
        console.error(`[WORKFLOW] Step ${step.name} failed:`, error);
        
        if (step.onError) {
          await step.onError(error as Error);
        }

        throw error;
      }
    }

    return results;
  }

  protected async executeParallel(steps: WorkflowStep[]): Promise<unknown[]> {
    console.log(`[WORKFLOW] Executing ${steps.length} steps in parallel`);
    
    const promises = steps.map(async (step) => {
      try {
        const result = await step.execute();
        if (step.onSuccess) {
          await step.onSuccess(result);
        }
        return result;
      } catch (error) {
        if (step.onError) {
          await step.onError(error as Error);
        }
        throw error;
      }
    });

    return Promise.all(promises);
  }

  abstract execute(input: Record<string, unknown>): Promise<unknown>;
}

export class SequentialWorkflow extends Workflow {
  constructor(id: string, name: string, steps: WorkflowStep[]) {
    super(id, name);
    this.steps = steps;
  }

  async execute(input: Record<string, unknown>): Promise<unknown> {
    auditLogger.log({
      agentId: this.workflowId,
      agentName: this.workflowName,
      actionType: 'AGENT_RUN',
      inputs: input,
      modelVersion: '1.0.0',
      status: 'SUCCESS',
    });

    return this.executeSteps(this.steps);
  }
}

export class ParallelWorkflow extends Workflow {
  constructor(id: string, name: string, steps: WorkflowStep[]) {
    super(id, name);
    this.steps = steps;
  }

  async execute(input: Record<string, unknown>): Promise<unknown> {
    auditLogger.log({
      agentId: this.workflowId,
      agentName: this.workflowName,
      actionType: 'AGENT_RUN',
      inputs: input,
      modelVersion: '1.0.0',
      status: 'SUCCESS',
    });

    return this.executeParallel(this.steps);
  }
}

