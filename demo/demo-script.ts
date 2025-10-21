// demo/demo-script.ts
import { governanceWorkflow, quickAnalysisAgent } from "../src/dao-index";

async function runHackathonDemo() {
  console.log("🎯 ADK-TS Hackathon 2025: DAO Governance Co-pilot Demo\n");
  
  try {
    // Scenario 1: New user exploring DAO governance
    console.log("Scenario 1: Educational Interaction");
    const educationalResponse = await quickAnalysisAgent.run(
      "Explain DAO governance to someone new to Web3, focusing on voting and proposal processes"
    );
    console.log("Educational Response:", educationalResponse.content.substring(0, 200) + "...");
    console.log("\n" + "=".repeat(80) + "\n");
    
    // Scenario 2: Detailed proposal analysis
    console.log("Scenario 2: Comprehensive Proposal Analysis");
    const analysis = await governanceWorkflow.analyzeProposalAndVote("prop-001");
    console.log("Analysis Completed:", analysis.timestamp);
    console.log("Proposal Analysis:");
    console.log(analysis.analysis.substring(0, 300) + "...");
    console.log("\n" + "=".repeat(80) + "\n");
    
    // Scenario 3: Voting recommendation
    console.log("Scenario 3: Voting Strategy Session");
    const votingAdvice = await quickAnalysisAgent.run(
      "What are the key financial metrics I should check before voting on a treasury allocation proposal?"
    );
    console.log("Voting Advice:", votingAdvice.content.substring(0, 150) + "...");
    console.log("\n" + "=".repeat(80) + "\n");
    
    console.log("\n✅ Demo completed successfully!");
    console.log("This demonstrates:");
    console.log("• Multi-agent coordination with ADK-TS");
    console.log("• Blockchain tool integration");
    console.log("• Specialized agent roles");
    console.log("• Real-world DAO governance utility");
  } catch (error) {
    console.error("Demo error:", error);
  }
}

runHackathonDemo();

