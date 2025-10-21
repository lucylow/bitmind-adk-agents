// src/dao-index.ts
import { rootAgent, governanceWorkflow, quickAnalysisAgent } from "./agents/dao-agent";
import * as dotenv from "dotenv";

dotenv.config();

// Example usage for the hackathon demo
async function demoDAOGovernanceCoPilot() {
  console.log("🚀 DAO Governance Co-pilot Initialized\n");

  try {
    // Demo 1: Quick analysis
    console.log("1. Quick Proposal Analysis:");
    const quickResult = await quickAnalysisAgent.run(
      "Briefly analyze a treasury diversification proposal for a DAO"
    );
    console.log(quickResult.content);
    console.log("\n" + "=".repeat(50) + "\n");

    // Demo 2: Comprehensive workflow
    console.log("2. Comprehensive Proposal Analysis:");
    const comprehensiveResult = await governanceWorkflow.analyzeProposalAndVote(
      "prop-2024-001",
      { riskTolerance: "medium", focus: "treasury-management" }
    );
    
    console.log("Wallet Connected:", comprehensiveResult.walletConnected);
    console.log("Analysis Complete:", comprehensiveResult.timestamp);
    console.log("Proposal ID:", comprehensiveResult.proposalId);
    console.log("\nFull Analysis:");
    console.log(comprehensiveResult.analysis);
    console.log("\n" + "=".repeat(50) + "\n");

    // Demo 3: Interactive session
    console.log("3. Starting Interactive Session...");
    const response = await rootAgent.run(
      "Can you help me understand what factors I should consider when voting on DAO proposals?"
    );
    
    console.log("Assistant Response:", response.content);
  } catch (error) {
    console.error("Error during demo:", error);
  }
}

// Run demo if this file is executed directly
if (require.main === module) {
  demoDAOGovernanceCoPilot().catch(console.error);
}

export { rootAgent, governanceWorkflow, quickAnalysisAgent };

