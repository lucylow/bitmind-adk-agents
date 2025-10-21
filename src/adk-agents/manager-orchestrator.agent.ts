// src/adk-agents/manager-orchestrator.agent.ts
import { AgentBuilder } from "@iqai/adk";
import { createProposalAnalystAgent, runProposalAnalysis } from "./proposal-analysis.agent";
import { createTreasuryMonitorAgent, runTreasuryAssessment } from "./treasury-monitor.agent";
import { createVotingStrategistAgent, runVotingRecommendation } from "./voting-strategist.agent";
import { guardrailManager } from "../guardrail-manager";

/**
 * Manager orchestrator coordinates the full flow:
 * 1. Run proposal analysis
 * 2. Run treasury assessment
 * 3. Run voting strategist
 * 4. If high-risk write is required, pause and require human confirmation
 */

export const createManagerOrchestrator = () =>
  AgentBuilder.create("manager-orchestrator")
    .withModel("gpt-4o-mini")
    .withInstruction(
      `
You are the Manager Orchestrator. You orchestrate ProposalAnalyst, TreasuryMonitor, and VotingStrategist.
Do not execute on-chain writes. If recommendedAction requires execution, emit status "AWAITING_APPROVAL" with runId and justification.
Return a structured object:
{ status: "DONE"|"AWAITING_APPROVAL"|"ERROR", runId, proposalId, analysis, treasury, recommendation, explainability }
`
    )
    .build();

/**
 * High-level orchestrator runner function
 */
export async function runFullGovernanceFlow(proposalId: string, daoAddress: string, userContext: any = {}) {
  const managerAgent = createManagerOrchestrator();

  // Step 0: basic guardrails on user input / request
  await guardrailManager.runInputChecks(`Analyze proposal ${proposalId}`);

  // Step 1: ProposalAnalysis
  const proposalAnalystAgent = createProposalAnalystAgent();
  const analysis = await runProposalAnalysis(proposalAnalystAgent, proposalId);

  // Step 2: TreasuryAssessment
  const treasuryAgent = createTreasuryMonitorAgent();
  const treasury = await runTreasuryAssessment(treasuryAgent, daoAddress);

  // Step 3: VotingRecommendation
  const votingAgent = createVotingStrategistAgent();
  const recommendation = await runVotingRecommendation(votingAgent, proposalId, {
    proposalAnalysis: analysis,
    treasuryAssessment: treasury,
    userPreferences: userContext.preferences || {},
    userAddress: userContext.address || "0xUNKNOWN",
  });

  // Explainability bundle (3 reasons + confidence)
  const explainability = {
    reasons: recommendation.reasoning.slice(0, 3),
    confidence: recommendation.confidence,
    topRisks: analysis.securityRisks.slice(0, 3),
  };

  // If recommendation asks for action on-chain and tool is high-risk -> require approval
  const needsApproval = recommendation.recommendedAction === "VOTE_FOR" || recommendation.recommendedAction === "VOTE_AGAINST";
  const isHighRisk = needsApproval; // refine with additional heuristics

  const runId = `run-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  if (isHighRisk && recommendation.confidence < 0.9) {
    // Await human approval
    return {
      status: "AWAITING_APPROVAL",
      runId,
      proposalId,
      analysis,
      treasury,
      recommendation,
      explainability,
      note: "Requires human confirmation due to <0.9 confidence",
    };
  }

  // otherwise return done (still do not auto-execute writes unless explicitly allowed)
  return {
    status: "DONE",
    runId,
    proposalId,
    analysis,
    treasury,
    recommendation,
    explainability,
  };
}

