import React, { useState, useEffect } from "react";
import { MotionConfig, motion } from "framer-motion";
import {
  Cpu,
  ShieldCheck,
  PieChart,
  Bolt,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";

/**
 * LandingPageAIAgents - Production-ready landing page highlighting AI agents
 * Tailwind friendly, interactive demo simulation built-in.
 *
 * Features:
 * - Interactive multi-agent workflow demo
 * - Human-in-the-loop approval flow
 * - Real-time logs and explainability
 * - Responsive design
 */

type AgentStep = {
  id: string;
  title: string;
  description: string;
  durationMs: number;
  status?: "pending" | "running" | "done" | "failed";
  output?: string;
};

const DEFAULT_AGENTS: AgentStep[] = [
  {
    id: "proposal-analyst",
    title: "Proposal Analyst",
    description:
      "Parses the proposal, extracts financials, and runs security checks.",
    durationMs: 1600,
  },
  {
    id: "treasury-monitor",
    title: "Treasury Monitor",
    description: "Assesses treasury exposure and liquidity impact in real-time.",
    durationMs: 1200,
  },
  {
    id: "voting-strategist",
    title: "Voting Strategist",
    description:
      "Synthesizes analysis and user prefs to produce an explainable vote recommendation.",
    durationMs: 1400,
  },
];

export default function LandingPageAIAgents(): JSX.Element {
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>(
    DEFAULT_AGENTS.map((s) => ({ ...s, status: "pending" }))
  );
  const [runId, setRunId] = useState<string | null>(null);
  const [explainBundle, setExplainBundle] = useState<any | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [approved, setApproved] = useState<boolean | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [loadingApprove, setLoadingApprove] = useState(false);

  useEffect(() => {
    // reset when demo stops
    if (!running) {
      setSteps(DEFAULT_AGENTS.map((s) => ({ ...s, status: "pending", output: undefined })));
      setRunId(null);
      setExplainBundle(null);
      setNeedsApproval(false);
      setApproved(null);
      setLog([]);
    }
  }, [running]);

  async function runDemo() {
    setRunning(true);
    setRunId(`run-${Date.now()}`);
    pushLog("Starting BitMind multi-agent demo...");
    // sequentially run agents (simulate)
    let localExplain: any = { reasons: [] as string[], confidence: 0 };
    for (let i = 0; i < steps.length; i++) {
      const id = steps[i].id;
      updateStepStatus(id, "running");
      pushLog(`Agent "${steps[i].title}" started.`);
      await wait(steps[i].durationMs);
      // produce simulated outputs and update explainability
      if (id === "proposal-analyst") {
        const out = "Identified $1.2M outgoing transfer; found potential smart-contract risk.";
        updateStepOutput(id, out);
        localExplain.reasons.push("Material treasury outflow detected");
        localExplain.confidence += 0.3;
        pushLog(`Agent "${steps[i].title}" finished: ${short(out)}`);
      } else if (id === "treasury-monitor") {
        const out = "Treasury concentrated in 2 assets; liquidity moderate.";
        updateStepOutput(id, out);
        localExplain.reasons.push("Concentration risk in treasury");
        localExplain.confidence += 0.25;
        pushLog(`Agent "${steps[i].title}" finished: ${short(out)}`);
      } else if (id === "voting-strategist") {
        const out = "Recommendation: ABSTAIN (security risk + low confidence).";
        updateStepOutput(id, out);
        localExplain.reasons.push("Security risk + uncertain impact");
        localExplain.confidence += 0.2;
        pushLog(`Agent "${steps[i].title}" finished: ${short(out)}`);
      }
      updateStepStatus(id, "done");
    }

    // finalize explain bundle
    localExplain.confidence = Math.min(1, Number(localExplain.confidence.toFixed(2)));
    setExplainBundle({
      reasons: localExplain.reasons,
      confidence: localExplain.confidence,
      topRisks: ["Smart contract reentrancy pattern (possible)", "Treasury concentration"],
      similarProposals: [
        { id: "proposal-19", title: "Liquidity allocation 2024-07" },
        { id: "proposal-34", title: "Treasury risk mitigation" },
      ],
    });

    // Decision heuristics: in demo we escalate when confidence < 0.9 OR top risk present
    const escalate = localExplain.confidence < 0.9 || localExplain.reasons.length > 0;
    setNeedsApproval(escalate);
    pushLog(
      escalate
        ? "Manager: Decision requires human approval before executing any on-chain action."
        : "Manager: Decision auto-approved by policy."
    );

    setRunning(false);
  }

  function updateStepStatus(id: string, status: AgentStep["status"]) {
    setSteps((s) => s.map((x) => (x.id === id ? { ...x, status } : x)));
  }
  function updateStepOutput(id: string, output: string) {
    setSteps((s) => s.map((x) => (x.id === id ? { ...x, output } : x)));
  }
  function pushLog(line: string) {
    setLog((l) => [new Date().toLocaleTimeString() + " • " + line, ...l].slice(0, 50));
  }

  async function approveDemo() {
    setLoadingApprove(true);
    pushLog("Approver clicked: attempting to approve high-risk action...");
    await wait(800);
    // simulate simple RBAC + multisig check
    const simulatedOk = Math.random() > 0.05; // 95% chance success
    if (simulatedOk) {
      setApproved(true);
      setNeedsApproval(false);
      pushLog("Human approval granted. Manager executed on-chain action (simulated). TX: 0xMOCKTX123");
    } else {
      setApproved(false);
      pushLog("Human approval failed due to policy mismatch or missing multisig signature.");
    }
    setLoadingApprove(false);
  }

  return (
    <MotionConfig transition={{ duration: 0.28 }}>
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Hero */}
            <div>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl md:text-5xl font-extrabold leading-tight"
              >
                BitMind: Your <span className="text-teal-300">AI-Powered Multi-Agent</span> Co-pilot for Trusted DAO Governance
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.08 }}
                className="mt-6 text-slate-300 max-w-xl"
              >
                Leverage intelligent AI agents that analyze proposals, monitor treasury health, generate personalized voting strategies,
                and ensure secure on-chain execution — all seamlessly orchestrated to empower DAO members with actionable insights.
              </motion.p>

              <div className="mt-8 flex gap-4">
                <a
                  href="#demo"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 px-4 py-2 rounded-md font-semibold shadow"
                >
                  <Play size={16} /> Experience AI Agents in Action
                </a>

                <a
                  href="#features"
                  className="inline-flex items-center gap-2 border border-slate-700 px-4 py-2 rounded-md hover:bg-slate-800"
                >
                  Learn how it works
                </a>
              </div>

              {/* quick feature badges */}
              <div className="mt-8 flex gap-3 flex-wrap">
                <Badge icon={<Cpu size={16} />} label="Autonomous Agents" />
                <Badge icon={<PieChart size={16} />} label="Explainable Recommendations" />
                <Badge icon={<ShieldCheck size={16} />} label="Guardrails & Approvals" />
                <Badge icon={<Bolt size={16} />} label="MCP + On-Chain Access" />
              </div>
            </div>

            {/* Visual / demo card */}
            <div className="relative">
              <motion.div
                initial={{ scale: 0.98, opacity: 0.9 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-800/60 ring-1 ring-slate-700 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-slate-300 font-medium">Interactive Demo</div>
                    <div className="mt-1 text-lg font-semibold">Multi-Agent Governance Run</div>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Clock size={14} />
                    Demo • No real funds
                  </div>
                </div>

                <div id="demo" className="mt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="text-sm text-slate-400">Agents</div>
                      <div className="space-y-2">
                        {steps.map((s) => (
                          <AgentRow key={s.id} step={s} />
                        ))}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => runDemo()}
                          disabled={running}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold ${
                            running ? "bg-slate-600/40 cursor-not-allowed" : "bg-teal-500 hover:bg-teal-400 text-slate-900"
                          }`}
                        >
                          <Play size={14} /> Run Demo
                        </button>

                        <button
                          onClick={() => {
                            setRunning(false);
                            setSteps(DEFAULT_AGENTS.map((x) => ({ ...x, status: "pending", output: undefined })));
                            setExplainBundle(null);
                            setNeedsApproval(false);
                            setApproved(null);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold bg-slate-700 hover:bg-slate-600"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm text-slate-400">Manager & Explainability</div>

                      <div className="bg-slate-900/60 rounded-lg p-3 min-h-[180px]">
                        {explainBundle ? (
                          <ExplainCard explain={explainBundle} />
                        ) : (
                          <div className="text-slate-400 text-sm">Run the demo to see the explainability bundle.</div>
                        )}
                      </div>

                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-slate-400">Human-in-loop</div>
                          <div className="text-xs text-slate-400">Status</div>
                        </div>

                        <div className="mt-2 flex items-center gap-3">
                          <div className="text-sm">
                            {needsApproval ? (
                              <span className="text-amber-300">AWAITING HUMAN APPROVAL</span>
                            ) : approved === true ? (
                              <span className="text-green-300">APPROVED & EXECUTED</span>
                            ) : approved === false ? (
                              <span className="text-red-300">APPROVAL REJECTED</span>
                            ) : (
                              <span className="text-slate-400">No approval required</span>
                            )}
                          </div>

                          {needsApproval && (
                            <div className="ml-auto flex gap-2">
                              <button
                                onClick={() => approveDemo()}
                                disabled={loadingApprove}
                                className="bg-emerald-500 px-3 py-2 rounded-md text-slate-900 font-semibold hover:bg-emerald-400 inline-flex items-center gap-2"
                              >
                                <CheckCircle size={14} /> Approve
                              </button>
                              <button
                                onClick={() => {
                                  setApproved(false);
                                  pushLog("Approver rejected the action.");
                                  setNeedsApproval(false);
                                }}
                                className="bg-red-700 px-3 py-2 rounded-md text-white font-semibold hover:bg-red-600 inline-flex items-center gap-2"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* logs */}
                  <div className="mt-6">
                    <div className="text-xs text-slate-400 mb-2">Run logs</div>
                    <div className="bg-slate-900/50 p-3 rounded-md max-h-40 overflow-auto">
                      <ul className="text-xs space-y-2">
                        {log.length === 0 ? (
                          <li className="text-slate-400">No logs yet — start the demo</li>
                        ) : (
                          log.map((l, i) => <li key={i} className="text-slate-300">{l}</li>)
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* subtle glow */}
              <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 opacity-10 blur-3xl pointer-events-none" />
            </div>
          </div>
        </section>

        {/* features */}
        <section id="features" className="bg-slate-800/60 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <motion.h2 className="text-2xl font-bold mb-6">Powered by Advanced AI Agents</motion.h2>

            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Cpu size={28} />}
                title="Proposal Analyst Agent"
                blurb="Deep financial and security impact analysis — extracts structured financials and flags contract risk."
              />
              <FeatureCard
                icon={<PieChart size={28} />}
                title="Treasury Monitor Agent"
                blurb="Real-time treasury health alerts, concentration & liquidity analysis, and risk scoring."
              />
              <FeatureCard
                icon={<ShieldCheck size={28} />}
                title="Voting Strategist Agent"
                blurb="Personalized, explainable voting recommendations that respect your preferences and voting power."
              />
            </div>

            <div className="mt-10 grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className="text-lg font-semibold">Why multi-agent?</h3>
                <p className="mt-2 text-slate-300 max-w-prose">
                  Unlike single-chatbot approaches, BitMind decomposes governance workflows into specialized agents — each focused, auditable, and orchestrated by a manager.
                  This enables robust reasoning, easier testing, and safer integrations with on-chain systems through guardrails and human-in-loop approvals.
                </p>

                <ul className="mt-4 space-y-2 text-slate-300">
                  <li className="flex items-start gap-2"><Bolt size={16} className="mt-1"/> Continuous 24/7 monitoring</li>
                  <li className="flex items-start gap-2"><Eye size={16} className="mt-1"/> Increased voter confidence through explainability</li>
                  <li className="flex items-start gap-2"><ShieldCheck size={16} className="mt-1"/> Safeguarded treasury actions (multisig & approvals)</li>
                </ul>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-md">
                <div className="text-sm text-slate-400">Interactive diagram</div>
                <div className="mt-2 h-44 flex items-center justify-center">
                  {/* simple illustrative SVG block */}
                  <svg viewBox="0 0 600 220" className="w-full h-full">
                    <defs>
                      <linearGradient id="g1" x1="0" x2="1">
                        <stop offset="0" stopColor="#0EA5A4" stopOpacity="0.95" />
                        <stop offset="1" stopColor="#06B6D4" stopOpacity="0.95" />
                      </linearGradient>
                    </defs>
                    <rect x="8" y="30" rx="10" width="180" height="60" fill="#111827" stroke="#2b3440"/>
                    <text x="20" y="66" fontSize="12" fill="#cbd5e1">Proposal Analyst</text>

                    <rect x="210" y="30" rx="10" width="180" height="60" fill="#111827" stroke="#2b3440"/>
                    <text x="230" y="66" fontSize="12" fill="#cbd5e1">Treasury Monitor</text>

                    <rect x="410" y="30" rx="10" width="180" height="60" fill="#111827" stroke="#2b3440"/>
                    <text x="430" y="66" fontSize="12" fill="#cbd5e1">Voting Strategist</text>

                    <path d="M190 60 L210 60" stroke="url(#g1)" strokeWidth="2" />
                    <path d="M390 60 L410 60" stroke="url(#g1)" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA strip */}
        <section className="py-10">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between bg-slate-900/50 p-6 rounded-xl gap-4">
            <div>
              <div className="text-sm text-slate-300">Ready to see agents in your DAO?</div>
              <div className="mt-1 text-xl font-semibold">Experience the BitMind demo or schedule a live walkthrough.</div>
            </div>
            <div className="flex gap-3">
              <a href="#demo" onClick={(e)=>{ e.preventDefault(); document.getElementById("demo")?.scrollIntoView({behavior:'smooth'})}} className="bg-teal-500 px-4 py-2 rounded-md text-slate-900 font-semibold hover:bg-teal-400">Try Live Demo</a>
              <a href="/contact" className="border border-slate-700 px-4 py-2 rounded-md hover:bg-slate-800">Contact Sales</a>
            </div>
          </div>
        </section>
      </main>
    </MotionConfig>
  );
}

/* ---------------------------
   Helper UI subcomponents
   --------------------------- */

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700/60 text-slate-200 text-sm">
      <div className="text-teal-300">{icon}</div>
      <div>{label}</div>
    </div>
  );
}

function AgentRow({ step }: { step: AgentStep }) {
  const color =
    step.status === "done" ? "bg-emerald-500" : step.status === "running" ? "bg-amber-400" : "bg-slate-700/40";
  return (
    <div className="flex items-center gap-3 bg-slate-900/40 rounded-md p-3">
      <div className={`w-2 h-10 rounded-full ${color}`} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">{step.title}</div>
          <div className="text-xs text-slate-400">{step.status?.toUpperCase()}</div>
        </div>
        <div className="text-xs text-slate-400">{step.description}</div>
        {step.output && <div className="mt-2 text-xs text-slate-300">{short(step.output)}</div>}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, blurb }: { icon: React.ReactNode; title: string; blurb: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="bg-slate-900/40 p-5 rounded-lg flex gap-4">
      <div className="p-2 rounded-md bg-slate-800/60">{icon}</div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-slate-300 mt-1 max-w-sm">{blurb}</div>
      </div>
    </motion.div>
  );
}

function ExplainCard({ explain }: { explain: any }) {
  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">Explainability</div>
          <div className="text-xs text-slate-400">Top reasons & confidence</div>
        </div>
        <div className="text-sm font-semibold text-teal-300">{Math.round(explain.confidence * 100)}%</div>
      </div>

      <div className="mt-3 text-sm">
        <ul className="space-y-2">
          {explain.reasons.map((r: string, i: number) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span className="text-slate-200">{r}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 text-xs text-slate-400">Top risks: {explain.topRisks.join(", ")}</div>

        <div className="mt-3">
          <div className="text-xs text-slate-400">Similar proposals</div>
          <div className="mt-2 flex gap-2">
            {explain.similarProposals.map((p: any) => (
              <div key={p.id} className="bg-slate-800/60 px-3 py-1 rounded text-xs">
                {p.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------
   Utility functions
   --------------------------- */

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
function short(s: string, l = 80) {
  if (!s) return "";
  return s.length > l ? s.slice(0, l).trim() + "…" : s;
}

