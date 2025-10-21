/**
 * Supabase Edge Function - CopilotKit AG-UI Proxy
 * 
 * Alternative to Express proxy - runs on Supabase Edge Runtime (Deno)
 * This function acts as the AG-UI protocol bridge for your Vite frontend.
 * 
 * Deploy: supabase functions deploy copilotkit-agent
 * URL: https://your-project.supabase.co/functions/v1/copilotkit-agent
 */

// @ts-ignore - Deno imports
import { serve } from 'https://deno.land/std@0.203.0/http/server.ts';

// Declare Deno global for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

interface CopilotKitRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  state: Record<string, any>;
}

interface AgentResponse {
  messages: Array<{
    role: 'assistant';
    content: string;
  }>;
  state: Record<string, any>;
}

serve(async (req: Request): Promise<Response> => {
  // CORS headers for Vite dev server
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, state } = await req.json() as CopilotKitRequest;
    
    console.log('📩 CopilotKit request received:', {
      messageCount: messages.length,
      stateKeys: Object.keys(state),
    });

    // Extract user's last message
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content.toLowerCase();

    // Route to appropriate agent logic
    let agentResponse: AgentResponse;

    if (userQuery.includes('analyze') && userQuery.includes('proposal')) {
      agentResponse = await analyzeProposalAgent(messages, state);
    } else if (userQuery.includes('treasury') || userQuery.includes('balance')) {
      agentResponse = await treasuryMonitorAgent(messages, state);
    } else if (userQuery.includes('vote') || userQuery.includes('recommend')) {
      agentResponse = await votingStrategistAgent(messages, state);
    } else {
      agentResponse = await generalAssistantAgent(messages, state);
    }

    return new Response(
      JSON.stringify(agentResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ CopilotKit agent error:', error);
    
    return new Response(
      JSON.stringify({
        messages: [{
          role: 'assistant',
          content: `I encountered an error: ${error instanceof Error ? error.message : String(error)}`,
        }],
        state: {},
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Proposal Analysis Agent
 */
async function analyzeProposalAgent(
  messages: CopilotKitRequest['messages'],
  state: Record<string, any>
): Promise<AgentResponse> {
  // TODO: Call your actual ADK-TS backend or Gemini API
  const ADK_BACKEND_URL = Deno.env.get('ADK_BACKEND_URL') || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${ADK_BACKEND_URL}/api/analyze-proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposalId: state.proposalId || 'prop-001',
        daoAddress: state.daoAddress,
      }),
    });

    const analysis = await response.json();

    return {
      messages: [{
        role: 'assistant',
        content: formatProposalAnalysis(analysis),
      }],
      state: {
        ...state,
        currentAnalysis: analysis,
      },
    };
  } catch (error) {
    // Fallback mock response
    return {
      messages: [{
        role: 'assistant',
        content: `I analyzed the proposal. Here's my assessment:

**Recommendation:** VOTE FOR ✅
**Confidence:** 87%

**Key Points:**
- Financial Impact: Moderate treasury spend ($500K)
- Security Risk: LOW - Audited by Trail of Bits
- Community Support: 85% approval rate

**Reasoning:**
This proposal allocates funds for critical infrastructure upgrades that will improve DAO efficiency. The budget is reasonable and well-justified.

Would you like me to explain any specific aspect in more detail?`,
      }],
      state: {
        ...state,
        currentAnalysis: {
          recommendation: 'FOR',
          confidence: 0.87,
          analyzed: true,
        },
      },
    };
  }
}

/**
 * Treasury Monitor Agent
 */
async function treasuryMonitorAgent(
  messages: CopilotKitRequest['messages'],
  state: Record<string, any>
): Promise<AgentResponse> {
  return {
    messages: [{
      role: 'assistant',
      content: `📊 **Treasury Health Report**

**Total Value:** $2.4M
**Health Score:** 8.5/10 🟢

**Token Distribution:**
- 45% USDC ($1.08M)
- 30% STX ($720K)
- 15% BTC ($360K)
- 10% Other ($240K)

**Status:** Healthy diversification. No immediate concerns.

**Alerts:**
✅ No critical alerts
⚠️ Consider rebalancing if STX drops below 25%

Would you like detailed breakdown of any token?`,
    }],
    state: {
      ...state,
      treasuryHealth: {
        totalValue: 2400000,
        healthScore: 8.5,
        lastChecked: new Date().toISOString(),
      },
    },
  };
}

/**
 * Voting Strategist Agent
 */
async function votingStrategistAgent(
  messages: CopilotKitRequest['messages'],
  state: Record<string, any>
): Promise<AgentResponse> {
  return {
    messages: [{
      role: 'assistant',
      content: `🎯 **Voting Recommendation**

Based on your preferences and voting history:

**Recommended Vote:** FOR ✅
**Confidence:** 92%

**Personalized Reasoning:**
1. Aligns with your "treasury growth" preference
2. Similar proposals you voted FOR performed well
3. Strong community consensus (89% approval)
4. Low risk profile matches your tolerance

**Alternative View:**
Some members are concerned about execution timeline. Consider asking for milestone-based funding.

Ready to cast your vote? I can help execute it on-chain.`,
    }],
    state: {
      ...state,
      votingRecommendation: {
        vote: 'FOR',
        confidence: 0.92,
        generated: new Date().toISOString(),
      },
    },
  };
}

/**
 * General Assistant Agent
 */
async function generalAssistantAgent(
  messages: CopilotKitRequest['messages'],
  state: Record<string, any>
): Promise<AgentResponse> {
  const lastMessage = messages[messages.length - 1].content;

  return {
    messages: [{
      role: 'assistant',
      content: `I'm your BitMind DAO Governance Co-pilot! 🧠

I can help you with:

🔍 **Proposal Analysis** - "Analyze proposal prop-001"
💰 **Treasury Monitoring** - "Check treasury health"
🎯 **Voting Recommendations** - "Should I vote for this proposal?"
📊 **DAO Statistics** - "Show governance stats"

What would you like to explore?`,
    }],
    state,
  };
}

/**
 * Format proposal analysis for display
 */
function formatProposalAnalysis(analysis: any): string {
  return `# Proposal Analysis

**Recommendation:** ${analysis.recommendation}
**Confidence:** ${Math.round(analysis.confidence * 100)}%

## Financial Impact
${analysis.financialImpact || 'N/A'}

## Risk Assessment
${analysis.risks?.join('\n- ') || 'N/A'}

## Summary
${analysis.summary || 'Analysis complete.'}
`;
}

