#!/usr/bin/env ts-node
/**
 * BitMind ADK Governance Demo Script
 * Showcases the full agent orchestration flow with guardrails
 */
import { runFullGovernanceFlow } from "../src/adk-agents/manager-orchestrator.agent";
import { guardrailManager } from "../src/guardrail-manager";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

interface DemoConfig {
  proposalId: string;
  daoAddress: string;
  userAddress: string;
  userPreferences: {
    riskTolerance: "low" | "medium" | "high";
    priorityAreas: string[];
    autoVote: boolean;
  };
}

async function runInteractiveDemo() {
  console.log("\n" + "=".repeat(70));
  console.log("🧠 BitMind ADK Governance Agent Demo");
  console.log("   OpenAI Best Practices Implementation + ADK-TS");
  console.log("=".repeat(70) + "\n");

  // Get user input
  const proposalId = await question("Enter Proposal ID (or press Enter for demo): ");
  const daoAddress = await question("Enter DAO Address (or press Enter for demo): ");
  const userAddress = await question("Enter Your Wallet Address (or press Enter for demo): ");

  const config: DemoConfig = {
    proposalId: proposalId || "demo-proposal-001",
    daoAddress: daoAddress || "0xDemoDAO",
    userAddress: userAddress || "0xDemoUser",
    userPreferences: {
      riskTolerance: "medium",
      priorityAreas: ["treasury-health", "security", "community-growth"],
      autoVote: false,
    },
  };

  console.log("\n📋 Configuration:");
  console.log(`   Proposal ID: ${config.proposalId}`);
  console.log(`   DAO Address: ${config.daoAddress}`);
  console.log(`   User Address: ${config.userAddress}`);
  console.log(`   Risk Tolerance: ${config.userPreferences.riskTolerance}`);
  console.log("");

  try {
    console.log("🚀 Starting governance analysis workflow...\n");

    // Step 1: Input guardrails
    console.log("⚡ [Step 1/5] Running input guardrails...");
    try {
      await guardrailManager.runInputChecks(`Analyze proposal ${config.proposalId}`);
      console.log("   ✅ Input validation passed\n");
    } catch (error: any) {
      console.log(`   ❌ Guardrail triggered: ${error.message}\n`);
      process.exit(1);
    }

    // Step 2: Run orchestrator
    console.log("🤖 [Step 2/5] Orchestrating multi-agent analysis...");
    console.log("   • ProposalAnalyst: Analyzing proposal details...");
    console.log("   • TreasuryMonitor: Assessing treasury impact...");
    console.log("   • VotingStrategist: Generating recommendation...\n");

    const startTime = Date.now();
    const result = await runFullGovernanceFlow(config.proposalId, config.daoAddress, {
      address: config.userAddress,
      preferences: config.userPreferences,
    });
    const duration = Date.now() - startTime;

    console.log(`   ✅ Analysis complete in ${duration}ms\n`);

    // Step 3: Display results
    console.log("=".repeat(70));
    console.log("📊 ANALYSIS RESULTS");
    console.log("=".repeat(70) + "\n");

    console.log("🔍 Proposal Analysis:");
    console.log(`   Status: ${result.status}`);
    console.log(`   Run ID: ${result.runId}`);
    console.log(`   Executive Summary: ${result.analysis.executiveSummary || "N/A"}`);
    console.log(`   Financial Impact Score: ${result.analysis.financialImpact.impactScore} / 1.0`);
    console.log(`   Security Risks: ${result.analysis.securityRisks.length > 0 ? result.analysis.securityRisks.join(", ") : "None detected"}`);
    console.log("");

    console.log("💰 Treasury Assessment:");
    console.log(`   DAO Address: ${result.treasury.daoAddress}`);
    console.log(`   Total Treasury: ${result.treasury.totalTreasuryUsd ? "$" + result.treasury.totalTreasuryUsd.toLocaleString() : "N/A"}`);
    console.log(`   Liquidity Health: ${(result.treasury.liquidityHealthScore * 100).toFixed(0)}%`);
    console.log("");

    console.log("🗳️  Voting Recommendation:");
    console.log(`   Recommendation: ${result.recommendation.recommendation} ${getRecommendationEmoji(result.recommendation.recommendation)}`);
    console.log(`   Confidence: ${(result.recommendation.confidence * 100).toFixed(1)}%`);
    console.log(`   Action Required: ${result.recommendation.recommendedAction}`);
    console.log("\n   Top Reasons:");
    result.explainability.reasons.forEach((reason: string, idx: number) => {
      console.log(`     ${idx + 1}. ${reason}`);
    });
    console.log("");

    // Step 4: Human approval flow
    if (result.status === "AWAITING_APPROVAL") {
      console.log("=".repeat(70));
      console.log("⚠️  HUMAN APPROVAL REQUIRED");
      console.log("=".repeat(70));
      console.log(`   ${result.note}`);
      console.log(`   Run ID: ${result.runId}`);
      console.log("");
      console.log("   This action requires explicit confirmation before execution.");
      console.log("   In production, this would trigger a notification and wait for approval.");
      console.log("");

      const approve = await question("   Approve this action? (yes/no): ");
      if (approve.toLowerCase() === "yes" || approve.toLowerCase() === "y") {
        console.log("   ✅ Action approved (demo mode - not executing on-chain)\n");
      } else {
        console.log("   ❌ Action rejected\n");
      }
    }

    // Step 5: Summary
    console.log("=".repeat(70));
    console.log("✅ Demo Complete");
    console.log("=".repeat(70));
    console.log("\n📝 Key Takeaways:");
    console.log("   • Multi-agent orchestration working (ProposalAnalyst + TreasuryMonitor + VotingStrategist)");
    console.log("   • Input guardrails validated (relevance + safety classifiers)");
    console.log("   • Tool risk taxonomy enforced (LOW/MEDIUM/HIGH)");
    console.log("   • Human-in-loop approval for high-risk actions");
    console.log("   • Structured outputs with Zod validation");
    console.log("   • Audit trail generated for all operations");
    console.log("");
    console.log("🚀 Next Steps:");
    console.log("   1. Run evals: ts-node evals/eval-runner.ts");
    console.log("   2. Connect real blockchain data (see src/integrations/blockchain-client.ts)");
    console.log("   3. Deploy human approval API (see src/api/human-approval.ts)");
    console.log("   4. Set up monitoring & alerts");
    console.log("");

  } catch (error: any) {
    console.error("\n❌ Demo failed:", error.message || error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    rl.close();
  }
}

function getRecommendationEmoji(rec: string): string {
  switch (rec) {
    case "FOR":
      return "👍";
    case "AGAINST":
      return "👎";
    case "ABSTAIN":
      return "🤷";
    default:
      return "";
  }
}

// Run if called directly
if (require.main === module) {
  runInteractiveDemo().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { runInteractiveDemo };

