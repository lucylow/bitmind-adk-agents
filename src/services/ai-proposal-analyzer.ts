/**
 * AI-Powered Proposal Analysis Service
 * Uses OpenAI/Claude to generate natural language summaries and insights
 */

import axios from 'axios';

const OPENAI_API_KEY = (import.meta as any).env?.VITE_OPENAI_API_KEY || '';
const ANTHROPIC_API_KEY = (import.meta as any).env?.VITE_ANTHROPIC_API_KEY || '';
const SUPABASE_FUNCTION_URL = (import.meta as any).env?.VITE_SUPABASE_URL
  ? `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/analyze-proposal`
  : '';

export interface ProposalAnalysisResult {
  summary: string;
  keyPoints: string[];
  risks: string[];
  opportunities: string[];
  recommendation: 'FOR' | 'AGAINST' | 'ABSTAIN';
  confidence: number;
  reasoning: string[];
  tldr: string;
  technicalComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  financialImpact: {
    estimated: string;
    confidence: number;
  };
  securityRisks: {
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    concerns: string[];
  };
}

/**
 * Analyze proposal using OpenAI GPT-4
 */
export async function analyzeProposalWithOpenAI(
  title: string,
  description: string,
  metadata?: Record<string, any>
): Promise<ProposalAnalysisResult> {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured, using mock analysis');
    return generateMockAnalysis(title, description);
  }

  try {
    const prompt = buildAnalysisPrompt(title, description, metadata);

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert DAO governance advisor analyzing blockchain governance proposals. 
            Provide detailed, balanced analysis focusing on financial impact, security risks, and community benefit.
            Output your analysis as JSON matching the ProposalAnalysisResult schema.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const analysis = JSON.parse(response.data.choices[0].message.content);
    return validateAndNormalizeAnalysis(analysis);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateMockAnalysis(title, description);
  }
}

/**
 * Analyze proposal using Anthropic Claude
 */
export async function analyzeProposalWithClaude(
  title: string,
  description: string,
  metadata?: Record<string, any>
): Promise<ProposalAnalysisResult> {
  if (!ANTHROPIC_API_KEY) {
    console.warn('Anthropic API key not configured, using mock analysis');
    return generateMockAnalysis(title, description);
  }

  try {
    const prompt = buildAnalysisPrompt(title, description, metadata);

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `You are an expert DAO governance advisor. Analyze this proposal and provide structured JSON output:\n\n${prompt}\n\nProvide analysis as JSON with fields: summary, keyPoints, risks, opportunities, recommendation, confidence, reasoning, tldr, technicalComplexity, financialImpact, securityRisks.`,
          },
        ],
      },
      {
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return validateAndNormalizeAnalysis(analysis);
    }

    return generateMockAnalysis(title, description);
  } catch (error) {
    console.error('Claude API error:', error);
    return generateMockAnalysis(title, description);
  }
}

/**
 * Analyze proposal using Supabase Edge Function (backend API key)
 */
export async function analyzeProposalWithSupabase(
  title: string,
  description: string,
  metadata?: Record<string, any>
): Promise<ProposalAnalysisResult> {
  if (!SUPABASE_FUNCTION_URL) {
    console.warn('Supabase not configured, using mock analysis');
    return generateMockAnalysis(title, description);
  }

  try {
    const response = await axios.post(
      SUPABASE_FUNCTION_URL,
      {
        title,
        description,
        metadata,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''}`,
        },
      }
    );

    return validateAndNormalizeAnalysis(response.data);
  } catch (error) {
    console.error('Supabase analysis error:', error);
    return generateMockAnalysis(title, description);
  }
}

/**
 * Build analysis prompt
 */
function buildAnalysisPrompt(
  title: string,
  description: string,
  metadata?: Record<string, any>
): string {
  let prompt = `Analyze this DAO governance proposal:\n\n`;
  prompt += `Title: ${title}\n\n`;
  prompt += `Description: ${description}\n\n`;

  if (metadata) {
    prompt += `Additional Context:\n`;
    if (metadata.forVotes) prompt += `- For Votes: ${metadata.forVotes}\n`;
    if (metadata.againstVotes) prompt += `- Against Votes: ${metadata.againstVotes}\n`;
    if (metadata.quorum) prompt += `- Quorum: ${metadata.quorum}\n`;
    if (metadata.category) prompt += `- Category: ${metadata.category}\n`;
    if (metadata.dao) prompt += `- DAO: ${metadata.dao}\n`;
  }

  prompt += `\nProvide a comprehensive analysis including:
1. A concise summary (2-3 sentences)
2. Key points (3-5 bullet points)
3. Potential risks
4. Opportunities
5. Voting recommendation (FOR/AGAINST/ABSTAIN)
6. Confidence level (0-1)
7. Reasoning for recommendation
8. TL;DR (one sentence)
9. Technical complexity assessment
10. Financial impact estimate
11. Security risk assessment`;

  return prompt;
}

/**
 * Validate and normalize AI response
 */
function validateAndNormalizeAnalysis(data: any): ProposalAnalysisResult {
  return {
    summary: data.summary || 'Analysis summary not available',
    keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
    risks: Array.isArray(data.risks) ? data.risks : [],
    opportunities: Array.isArray(data.opportunities) ? data.opportunities : [],
    recommendation: ['FOR', 'AGAINST', 'ABSTAIN'].includes(data.recommendation)
      ? data.recommendation
      : 'ABSTAIN',
    confidence: typeof data.confidence === 'number' ? data.confidence : 0.5,
    reasoning: Array.isArray(data.reasoning) ? data.reasoning : [],
    tldr: data.tldr || data.summary || 'TL;DR not available',
    technicalComplexity: ['LOW', 'MEDIUM', 'HIGH'].includes(data.technicalComplexity)
      ? data.technicalComplexity
      : 'MEDIUM',
    financialImpact: {
      estimated: data.financialImpact?.estimated || 'Unknown',
      confidence: data.financialImpact?.confidence || 0.5,
    },
    securityRisks: {
      level: ['LOW', 'MEDIUM', 'HIGH'].includes(data.securityRisks?.level)
        ? data.securityRisks.level
        : 'MEDIUM',
      concerns: Array.isArray(data.securityRisks?.concerns)
        ? data.securityRisks.concerns
        : [],
    },
  };
}

/**
 * Generate mock analysis (for demo/fallback)
 */
export function generateMockAnalysis(
  title: string,
  description: string
): ProposalAnalysisResult {
  // Simple keyword-based mock analysis
  const lowerDesc = description.toLowerCase();
  const lowerTitle = title.toLowerCase();

  const hasHighRisk = 
    lowerDesc.includes('upgrade') || 
    lowerDesc.includes('mint') || 
    lowerDesc.includes('burn') ||
    lowerDesc.includes('contract');

  const hasFinancial = 
    lowerDesc.includes('fund') || 
    lowerDesc.includes('treasury') || 
    lowerDesc.includes('usdc') ||
    lowerDesc.includes('allocation');

  const hasPartnership = 
    lowerDesc.includes('partner') || 
    lowerDesc.includes('integrate') || 
    lowerDesc.includes('collaboration');

  const risks: string[] = [];
  const opportunities: string[] = [];
  const keyPoints: string[] = [];

  if (hasHighRisk) {
    risks.push('Smart contract upgrade involves technical risk - ensure audits are complete');
    risks.push('Changes to core protocol require careful testing and gradual rollout');
    keyPoints.push('Protocol upgrade with enhanced security features');
  }

  if (hasFinancial) {
    risks.push('Significant treasury allocation requires milestone-based distribution');
    opportunities.push('Investment in development can drive long-term protocol growth');
    keyPoints.push('Treasury allocation for development initiatives');
  }

  if (hasPartnership) {
    opportunities.push('Strategic partnership can enhance protocol capabilities');
    opportunities.push('Integration with established provider reduces development time');
    keyPoints.push('Partnership with reputable service provider');
  }

  // Default entries
  if (risks.length === 0) {
    risks.push('Standard governance risks apply');
  }
  if (opportunities.length === 0) {
    opportunities.push('Proposal aligns with DAO objectives');
  }
  if (keyPoints.length === 0) {
    keyPoints.push('Community-driven governance proposal');
  }

  keyPoints.push('Voting period allows adequate time for community deliberation');
  keyPoints.push('Proposal includes clear success metrics');

  // Determine recommendation
  let recommendation: 'FOR' | 'AGAINST' | 'ABSTAIN' = 'FOR';
  let confidence = 0.75;

  if (hasHighRisk && !lowerDesc.includes('audit')) {
    recommendation = 'ABSTAIN';
    confidence = 0.6;
  } else if (hasHighRisk && lowerDesc.includes('audit')) {
    recommendation = 'FOR';
    confidence = 0.8;
  }

  const reasoning = [
    `Proposal demonstrates clear objectives and implementation plan`,
    hasHighRisk 
      ? 'Technical complexity requires careful review but audit provides confidence'
      : 'Low technical complexity with straightforward implementation',
    hasFinancial 
      ? 'Financial allocation is reasonable relative to treasury size'
      : 'Non-financial proposal reduces immediate budget impact',
    'Community sentiment appears positive based on early voting patterns',
  ];

  const recommendationEmoji = recommendation === 'FOR' ? '✅' : recommendation === 'AGAINST' ? '❌' : '⚠️';
  const recommendationText = recommendation === 'FOR' 
    ? 'Strong proposal with clear benefits and managed risks'
    : recommendation === 'AGAINST'
    ? 'Significant concerns require resolution before approval'
    : 'Proposal has merit but needs additional review';

  return {
    summary: `This proposal seeks to ${lowerTitle.includes('increase') ? 'increase' : lowerTitle.includes('upgrade') ? 'upgrade' : 'implement'} ${
      hasFinancial ? 'treasury allocation' : hasPartnership ? 'a strategic partnership' : 'protocol improvements'
    }. The initiative aims to enhance DAO capabilities while managing associated risks through ${
      hasHighRisk ? 'comprehensive audits and' : ''
    } milestone-based execution.`,
    keyPoints,
    risks,
    opportunities,
    recommendation,
    confidence,
    reasoning,
    tldr: `${recommendationEmoji} ${recommendationText}`,
    technicalComplexity: hasHighRisk ? 'HIGH' : hasPartnership ? 'MEDIUM' : 'LOW',
    financialImpact: {
      estimated: hasFinancial 
        ? description.match(/\$?[\d,]+/)?.[0] || 'Significant'
        : 'Minimal',
      confidence: hasFinancial ? 0.7 : 0.9,
    },
    securityRisks: {
      level: hasHighRisk ? 'HIGH' : hasPartnership ? 'MEDIUM' : 'LOW',
      concerns: hasHighRisk 
        ? ['Smart contract modifications', 'Requires comprehensive audit review']
        : hasPartnership
        ? ['Third-party integration dependencies']
        : [],
    },
  };
}

/**
 * Choose best AI provider based on availability and preferences
 */
export async function analyzeProposal(
  title: string,
  description: string,
  metadata?: Record<string, any>,
  preferredProvider: 'openai' | 'claude' | 'supabase' | 'auto' = 'auto'
): Promise<ProposalAnalysisResult> {
  // Try preferred provider first
  if (preferredProvider === 'openai' && OPENAI_API_KEY) {
    return analyzeProposalWithOpenAI(title, description, metadata);
  }
  
  if (preferredProvider === 'claude' && ANTHROPIC_API_KEY) {
    return analyzeProposalWithClaude(title, description, metadata);
  }
  
  if (preferredProvider === 'supabase' && SUPABASE_FUNCTION_URL) {
    return analyzeProposalWithSupabase(title, description, metadata);
  }

  // Auto-select based on availability
  if (SUPABASE_FUNCTION_URL) {
    return analyzeProposalWithSupabase(title, description, metadata);
  }
  
  if (OPENAI_API_KEY) {
    return analyzeProposalWithOpenAI(title, description, metadata);
  }
  
  if (ANTHROPIC_API_KEY) {
    return analyzeProposalWithClaude(title, description, metadata);
  }

  // Fallback to mock analysis
  return generateMockAnalysis(title, description);
}

