// Supabase Edge Function for AI Proposal Analysis
// Uses OpenAI API key stored in Supabase secrets (secure backend)

// Supabase Edge Function - Deno Runtime
// @ts-ignore - Deno imports not recognized by standard TypeScript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// Declare Deno global for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, description, metadata } = await req.json();

    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build analysis prompt
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

    prompt += `\nProvide analysis as JSON with these exact fields:
{
  "summary": "2-3 sentence overview",
  "keyPoints": ["point1", "point2", "point3"],
  "risks": ["risk1", "risk2"],
  "opportunities": ["opp1", "opp2"],
  "recommendation": "FOR|AGAINST|ABSTAIN",
  "confidence": 0.0-1.0,
  "reasoning": ["reason1", "reason2", "reason3"],
  "tldr": "one sentence summary",
  "technicalComplexity": "LOW|MEDIUM|HIGH",
  "financialImpact": {
    "estimated": "amount or description",
    "confidence": 0.0-1.0
  },
  "securityRisks": {
    "level": "LOW|MEDIUM|HIGH",
    "concerns": ["concern1", "concern2"]
  }
}`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert DAO governance advisor analyzing blockchain governance proposals. 
            Provide detailed, balanced analysis focusing on financial impact, security risks, and community benefit.
            Output ONLY valid JSON matching the exact schema provided.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openaiData = await openaiResponse.json();
    const analysis = JSON.parse(openaiData.choices[0].message.content);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error analyzing proposal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze proposal';
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        fallback: {
          summary: 'AI analysis temporarily unavailable',
          keyPoints: ['Proposal requires manual review'],
          risks: ['Unable to assess risks automatically'],
          opportunities: ['Manual analysis recommended'],
          recommendation: 'ABSTAIN',
          confidence: 0.5,
          reasoning: ['AI service unavailable'],
          tldr: 'Manual review required',
          technicalComplexity: 'MEDIUM',
          financialImpact: { estimated: 'Unknown', confidence: 0.5 },
          securityRisks: { level: 'MEDIUM', concerns: [] },
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

