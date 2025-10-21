// tests/proposal-analyst.test.ts
import { createProposalAnalystAgent, ProposalAnalysisSchema } from "../src/adk-agents/proposal-analysis.agent";

describe("ProposalAnalystAgent (integration skeleton)", () => {
  it("returns valid schema for a mock proposal", async () => {
    const agent = createProposalAnalystAgent();
    const out: any = await agent.run("Analyze proposal: proposal-mock-001");
    // Agent.run may return JSON string or object depending on ADK - parse if string
    let parsedOut = out;
    if (typeof out === "string") {
      try {
        parsedOut = JSON.parse(out);
      } catch {
        parsedOut = out;
      }
    }
    const valid = ProposalAnalysisSchema.safeParse(parsedOut);
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(["FOR", "AGAINST", "ABSTAIN"]).toContain(valid.data.recommendation);
    }
  });

  it("abstains on non-governance input", async () => {
    const agent = createProposalAnalystAgent();
    const out: any = await agent.run("Tell me a joke about cats");
    let parsedOut = out;
    if (typeof out === "string") {
      try {
        parsedOut = JSON.parse(out);
      } catch {
        parsedOut = out;
      }
    }
    const valid = ProposalAnalysisSchema.safeParse(parsedOut);
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.recommendation).toBe("ABSTAIN");
      expect(valid.data.confidence).toEqual(0);
    }
  });
});

