// src/workflows/dao-governance.workflow.ts
import { AgentBuilder } from "@iqai/adk";
import { createProposalAnalystAgent } from "../agents/proposal-analyst.agent";
import { createVotingStrategistAgent } from "../agents/voting-strategist.agent";
import { createTreasuryMonitorAgent } from "../agents/treasury-monitor.agent";
import { connectWalletTool } from "../tools/wallet-tools";

export class DAOGovernanceWorkflow {
  async analyzeProposalAndVote(proposalId: string, userPreferences?: any) {
    // Step 1: Connect wallet (if needed)
    let walletConnected = false;
    let walletAddress = '';
    
    try {
      const wallet = await connectWalletTool.execute({});
      walletConnected = wallet.connected;
      walletAddress = wallet.address;
      console.log(`Connected wallet: ${wallet.address}`);
    } catch (error) {
      console.log("Wallet not connected, proceeding with analysis only");
    }

    // Create specialized agents
    const proposalAnalyst = createProposalAnalystAgent();
    const votingStrategist = createVotingStrategistAgent();
    const treasuryMonitor = createTreasuryMonitorAgent();

    // Step 2: Multi-agent sequential analysis
    const workflow = AgentBuilder
      .create("dao-governance-orchestrator")
      .withModel("gemini-2.0-flash-exp")
      .asSequential([proposalAnalyst, treasuryMonitor, votingStrategist])
      .withInstruction(`
        Coordinate the analysis of DAO proposal ${proposalId} through specialized agents:
        1. Proposal Analyst: Deep analysis of proposal content and mechanics
        2. Treasury Monitor: Financial impact assessment on DAO treasury  
        3. Voting Strategist: Personalized recommendation based on analysis

        Ensure comprehensive coverage of all aspects and provide actionable insights.
      `)
      .build();

    const analysis = await workflow.run(`
      Analyze proposal ${proposalId} and provide comprehensive governance assessment.
      ${userPreferences ? `User preferences: ${JSON.stringify(userPreferences)}` : ''}
      ${walletConnected ? `Connected wallet: ${walletAddress}` : ''}
    `);

    return {
      walletConnected,
      walletAddress,
      analysis: analysis.content,
      timestamp: new Date().toISOString(),
      proposalId
    };
  }

  async quickProposalAssessment(proposalId: string) {
    // Simplified workflow for quick analysis
    const proposalAnalyst = createProposalAnalystAgent();
    
    return await proposalAnalyst.run(`
      Provide executive summary and key risks for proposal ${proposalId}.
      Focus on the most critical aspects for quick decision-making.
    `);
  }
}

