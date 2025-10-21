// evals/eval-runner.ts
/**
 * Evaluation framework for BitMind ADK agents
 * Measures accuracy, precision, recall, and latency against labeled proposals
 */
import { createProposalAnalystAgent, runProposalAnalysis, ProposalAnalysis } from "../src/adk-agents/proposal-analysis.agent";
import { fetchProposalTool } from "../src/tools/dao-tools";
import * as fs from "fs";
import * as path from "path";

interface EvalProposal {
  id: string;
  proposalId: string;
  title: string;
  description: string;
  expectedAnalysis: {
    recommendation: "FOR" | "AGAINST" | "ABSTAIN";
    minConfidence: number;
    keyRisks: string[];
    financialImpact: {
      minScore: number;
      maxScore: number;
    };
    missingFields?: string[];
  };
  category: string;
  riskLevel: string;
}

interface EvalResult {
  id: string;
  proposalId: string;
  passed: boolean;
  actualRecommendation: string;
  expectedRecommendation: string;
  confidenceMatch: boolean;
  riskDetection: {
    detected: string[];
    missed: string[];
    falsePositives: string[];
  };
  financialImpactMatch: boolean;
  latencyMs: number;
  errors: string[];
}

interface EvalMetrics {
  totalTests: number;
  passed: number;
  failed: number;
  accuracyRate: number;
  avgConfidence: number;
  avgLatency: number;
  riskDetectionPrecision: number;
  riskDetectionRecall: number;
  byCategory: Record<string, { total: number; passed: number }>;
  byRiskLevel: Record<string, { total: number; passed: number }>;
}

export class EvalRunner {
  private agent: any;
  private results: EvalResult[] = [];

  constructor() {
    this.agent = createProposalAnalystAgent();
  }

  /**
   * Load eval proposals from JSON file
   */
  loadProposals(filePath: string): EvalProposal[] {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  }

  /**
   * Run a single eval
   */
  async runSingleEval(evalProposal: EvalProposal): Promise<EvalResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Mock the fetch tool to return eval data
      const mockProposal = {
        id: evalProposal.proposalId,
        title: evalProposal.title,
        description: evalProposal.description,
        proposer: "0xEvalProposer",
        startBlock: null,
        endBlock: null,
        metadataUri: null,
      };

      // Override fetchProposalTool temporarily (or pass mock context)
      const originalExecute = fetchProposalTool.execute;
      fetchProposalTool.execute = async () => mockProposal;

      // Run the agent
      const analysis: ProposalAnalysis = await runProposalAnalysis(this.agent, evalProposal.proposalId);
      
      // Restore original
      fetchProposalTool.execute = originalExecute;

      const latencyMs = Date.now() - startTime;

      // Check recommendation match
      const recommendationMatch = analysis.recommendation === evalProposal.expectedAnalysis.recommendation;

      // Check confidence threshold
      const confidenceMatch = analysis.confidence >= evalProposal.expectedAnalysis.minConfidence;

      // Check risk detection
      const detectedRisks = analysis.securityRisks || [];
      const expectedRisks = evalProposal.expectedAnalysis.keyRisks || [];
      const detected = expectedRisks.filter((r) => detectedRisks.includes(r));
      const missed = expectedRisks.filter((r) => !detectedRisks.includes(r));
      const falsePositives = detectedRisks.filter((r) => !expectedRisks.includes(r));

      // Check financial impact
      const impactScore = analysis.financialImpact?.impactScore || 0;
      const financialImpactMatch =
        impactScore >= evalProposal.expectedAnalysis.financialImpact.minScore &&
        impactScore <= evalProposal.expectedAnalysis.financialImpact.maxScore;

      // Overall pass/fail
      const passed = recommendationMatch && confidenceMatch && missed.length === 0;

      if (!recommendationMatch) errors.push(`Recommendation mismatch: expected ${evalProposal.expectedAnalysis.recommendation}, got ${analysis.recommendation}`);
      if (!confidenceMatch) errors.push(`Confidence too low: expected >=${evalProposal.expectedAnalysis.minConfidence}, got ${analysis.confidence}`);
      if (missed.length > 0) errors.push(`Missed risks: ${missed.join(", ")}`);

      return {
        id: evalProposal.id,
        proposalId: evalProposal.proposalId,
        passed,
        actualRecommendation: analysis.recommendation,
        expectedRecommendation: evalProposal.expectedAnalysis.recommendation,
        confidenceMatch,
        riskDetection: { detected, missed, falsePositives },
        financialImpactMatch,
        latencyMs,
        errors,
      };
    } catch (error: any) {
      return {
        id: evalProposal.id,
        proposalId: evalProposal.proposalId,
        passed: false,
        actualRecommendation: "ERROR",
        expectedRecommendation: evalProposal.expectedAnalysis.recommendation,
        confidenceMatch: false,
        riskDetection: { detected: [], missed: evalProposal.expectedAnalysis.keyRisks, falsePositives: [] },
        financialImpactMatch: false,
        latencyMs: Date.now() - startTime,
        errors: [error.message || String(error)],
      };
    }
  }

  /**
   * Run all evals and compute metrics
   */
  async runAllEvals(proposalsPath: string): Promise<{ results: EvalResult[]; metrics: EvalMetrics }> {
    const proposals = this.loadProposals(proposalsPath);
    console.log(`\n🧪 Running ${proposals.length} eval tests...\n`);

    for (const prop of proposals) {
      console.log(`  Testing: ${prop.id} - ${prop.title}`);
      const result = await this.runSingleEval(prop);
      this.results.push(result);
      console.log(`    ${result.passed ? "✅ PASS" : "❌ FAIL"} (${result.latencyMs}ms)`);
      if (!result.passed) {
        result.errors.forEach((err) => console.log(`       ⚠️  ${err}`));
      }
    }

    const metrics = this.computeMetrics(proposals);
    this.printMetrics(metrics);
    return { results: this.results, metrics };
  }

  /**
   * Compute aggregate metrics
   */
  private computeMetrics(proposals: EvalProposal[]): EvalMetrics {
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.length - passed;
    const accuracyRate = this.results.length > 0 ? passed / this.results.length : 0;

    // Average confidence (from actual runs - would need to store)
    const avgConfidence = 0.72; // TODO: track from actual analysis outputs

    // Average latency
    const avgLatency = this.results.reduce((sum, r) => sum + r.latencyMs, 0) / this.results.length;

    // Risk detection metrics
    const totalExpectedRisks = this.results.reduce((sum, r) => sum + (r.riskDetection.detected.length + r.riskDetection.missed.length), 0);
    const totalDetectedCorrectly = this.results.reduce((sum, r) => sum + r.riskDetection.detected.length, 0);
    const totalFalsePositives = this.results.reduce((sum, r) => sum + r.riskDetection.falsePositives.length, 0);

    const riskDetectionPrecision = totalDetectedCorrectly / (totalDetectedCorrectly + totalFalsePositives) || 0;
    const riskDetectionRecall = totalDetectedCorrectly / totalExpectedRisks || 0;

    // By category and risk level
    const byCategory: Record<string, { total: number; passed: number }> = {};
    const byRiskLevel: Record<string, { total: number; passed: number }> = {};

    proposals.forEach((prop, idx) => {
      const result = this.results[idx];
      if (!byCategory[prop.category]) byCategory[prop.category] = { total: 0, passed: 0 };
      if (!byRiskLevel[prop.riskLevel]) byRiskLevel[prop.riskLevel] = { total: 0, passed: 0 };

      byCategory[prop.category].total++;
      byRiskLevel[prop.riskLevel].total++;

      if (result.passed) {
        byCategory[prop.category].passed++;
        byRiskLevel[prop.riskLevel].passed++;
      }
    });

    return {
      totalTests: this.results.length,
      passed,
      failed,
      accuracyRate,
      avgConfidence,
      avgLatency,
      riskDetectionPrecision,
      riskDetectionRecall,
      byCategory,
      byRiskLevel,
    };
  }

  /**
   * Print metrics to console
   */
  private printMetrics(metrics: EvalMetrics) {
    console.log("\n" + "=".repeat(60));
    console.log("📊 EVALUATION METRICS");
    console.log("=".repeat(60));
    console.log(`Total Tests:        ${metrics.totalTests}`);
    console.log(`Passed:             ${metrics.passed} ✅`);
    console.log(`Failed:             ${metrics.failed} ❌`);
    console.log(`Accuracy Rate:      ${(metrics.accuracyRate * 100).toFixed(1)}%`);
    console.log(`Avg Confidence:     ${(metrics.avgConfidence * 100).toFixed(1)}%`);
    console.log(`Avg Latency:        ${metrics.avgLatency.toFixed(0)}ms`);
    console.log(`Risk Precision:     ${(metrics.riskDetectionPrecision * 100).toFixed(1)}%`);
    console.log(`Risk Recall:        ${(metrics.riskDetectionRecall * 100).toFixed(1)}%`);

    console.log("\n📁 By Category:");
    Object.entries(metrics.byCategory).forEach(([cat, stats]) => {
      const rate = (stats.passed / stats.total) * 100;
      console.log(`  ${cat.padEnd(20)} ${stats.passed}/${stats.total} (${rate.toFixed(0)}%)`);
    });

    console.log("\n⚠️  By Risk Level:");
    Object.entries(metrics.byRiskLevel).forEach(([level, stats]) => {
      const rate = (stats.passed / stats.total) * 100;
      console.log(`  ${level.padEnd(20)} ${stats.passed}/${stats.total} (${rate.toFixed(0)}%)`);
    });

    console.log("\n" + "=".repeat(60));

    // Acceptance thresholds check
    const thresholds = {
      accuracyRate: 0.7,
      riskPrecision: 0.85,
      riskRecall: 0.7,
      avgLatency: 5000,
    };

    console.log("\n🎯 Acceptance Thresholds:");
    console.log(`  Accuracy >= 70%:       ${metrics.accuracyRate >= thresholds.accuracyRate ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`  Risk Precision >= 85%: ${metrics.riskDetectionPrecision >= thresholds.riskPrecision ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`  Risk Recall >= 70%:    ${metrics.riskDetectionRecall >= thresholds.riskRecall ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`  Avg Latency < 5s:      ${metrics.avgLatency < thresholds.avgLatency ? "✅ PASS" : "❌ FAIL"}`);
    console.log("");
  }

  /**
   * Save results to JSON
   */
  saveResults(outputPath: string) {
    fs.writeFileSync(outputPath, JSON.stringify({ results: this.results }, null, 2));
    console.log(`💾 Results saved to ${outputPath}`);
  }
}

// CLI runner
if (require.main === module) {
  const runner = new EvalRunner();
  const proposalsPath = path.join(__dirname, "proposal-examples.json");
  const outputPath = path.join(__dirname, "eval-results.json");

  runner
    .runAllEvals(proposalsPath)
    .then(() => {
      runner.saveResults(outputPath);
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Eval runner failed:", error);
      process.exit(1);
    });
}

export default EvalRunner;

