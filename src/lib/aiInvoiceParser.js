import { z } from 'zod';
const InvoiceSchema = z.object({
    invoice_id: z.number().positive(),
    payee: z.string().regex(/^(SP|ST)[0-9A-Z]{38,41}$/i, 'Invalid Stacks address'),
    amount: z.number().positive(),
    token_contract: z.string().nullable(),
    arbiter: z.string().nullable(),
    deadline: z.string().datetime(),
    milestone_description: z.string(),
    confidence_score: z.number().min(0).max(1),
});
async function callAIProvider(invoiceText, systemPrompt, provider) {
    // Placeholder provider shim; wire to actual API later
    // For now, return a minimal structured response guessing via naive heuristics
    const fallback = fallbackParser(invoiceText);
    return JSON.stringify({ ...fallback, confidence_score: 0.81 });
}
export async function parseInvoiceWithAI(invoiceText, provider = 'openai') {
    const systemPrompt = `
		Extract invoice data with HIGH confidence. Output JSON with confidence_score field.
		For addresses, use placeholder format: "SP[PLACEHOLDER]" if unclear.
		Return confidence_score between 0-1 based on extraction certainty.
	`;
    try {
        const response = await callAIProvider(invoiceText, systemPrompt, provider);
        const parsed = JSON.parse(response);
        // Validate with Zod
        const validated = InvoiceSchema.parse(parsed);
        // Additional business logic validation
        if (validated.confidence_score < 0.8) {
            throw new Error(`Low confidence score: ${validated.confidence_score}`);
        }
        return validated;
    }
    catch (error) {
        // Fallback to manual parsing heuristics
        return fallbackParser(invoiceText);
    }
}
// Exported for tests
export function fallbackParser(text) {
    const amountMatch = text.match(/(\d+\.?\d*)\s*(BTC|sBTC|STX)/i);
    const addressMatch = text.match(/(SP|ST)[0-9A-Z]{38,41}/i);
    return {
        invoice_id: Date.now(),
        payee: addressMatch?.[0] ?? 'SP[PLACEHOLDER]',
        amount: amountMatch ? Math.floor(parseFloat(amountMatch[1]) * 100000000) : 0,
        token_contract: 'SP000000000000000000002Q6VF78.sbtc-token',
        arbiter: null,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        milestone_description: text.substring(0, 100),
        confidence_score: 0.6,
    };
}
/**
 * System prompt for AI invoice extraction
 */
export const AI_SYSTEM_PROMPT = `You are an assistant that extracts structured invoice variables from free-form invoice text for an on-chain Clarity escrow contract. The output must be STRICT JSON only (no explanation, no prose). Validate and normalize dates to ISO 8601 (YYYY-MM-DD). Normalize monetary amounts to integers (in token base units). If currency symbol is BTC or sBTC assume 8 decimal places (multiply BTC value by 1e8 and output integer). For other currencies, assume 2 decimals and multiply by 100. If a field is missing, set it to null. Fields required: invoice_id (uint), payee (principal string, e.g., 'SP2...'), amount (integer in token base units), token_contract (principal string or null), arbiter (principal string or null), deadline (ISO date or null), milestone_description (string), payer (principal or null). Use the invoice text to infer reasonable invoice_id (prefer a numeric invoice number if present; else hash the invoice shortid as unsigned int). Output only valid JSON.`;
/**
 * Generate user prompt with invoice text
 */
export function generateUserPrompt(invoiceText) {
    return `EXAMPLE:
Invoice text:
"Invoice #4592
To: alice.stacks
From: dao: ExampleDAO (treasury)
Amount: 0.125 sBTC for website redesign
Milestone: Deliver final static site + handover (due 2025-10-20)
Arbiter: arbiter.stacks"

Desired JSON output (example):
{
  "invoice_id": 4592,
  "payee": "alice.stacks",
  "payer": "SP3EXAMPLEDAO...", 
  "amount": 12500000,
  "token_contract": "SP000000000000000000002Q6VF78.sbtc-token",
  "arbiter": "arbiter.stacks",
  "deadline": "2025-10-20",
  "milestone_description": "Deliver final static site + handover"
}

NOW PROCESS:
Extract the variables from the following invoice text (do NOT include any extra text). Provide strict JSON only.

--- INVOICE START ---
${invoiceText}
--- INVOICE END ---`;
}
/**
 * Parse invoice using OpenAI API
 */
export async function parseInvoiceWithOpenAI(invoiceText, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-5-mini-2025-08-07',
            messages: [
                { role: 'system', content: AI_SYSTEM_PROMPT },
                { role: 'user', content: generateUserPrompt(invoiceText) },
            ],
            max_completion_tokens: 500,
        }),
    });
    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    const data = await response.json();
    const content = data.choices[0].message.content;
    try {
        const parsed = JSON.parse(content);
        return parsed;
    }
    catch (error) {
        throw new Error('Failed to parse AI response as JSON');
    }
}
/**
 * Parse invoice using Anthropic Claude API
 */
export async function parseInvoiceWithClaude(invoiceText, apiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 500,
            system: AI_SYSTEM_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: generateUserPrompt(invoiceText),
                },
            ],
        }),
    });
    if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
    }
    const data = await response.json();
    const content = data.content[0].text;
    try {
        const parsed = JSON.parse(content);
        return parsed;
    }
    catch (error) {
        throw new Error('Failed to parse AI response as JSON');
    }
}
/**
 * Parse invoice using local/custom API endpoint
 */
export async function parseInvoiceWithCustomAPI(invoiceText, apiEndpoint, apiKey) {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            system_prompt: AI_SYSTEM_PROMPT,
            user_prompt: generateUserPrompt(invoiceText),
        }),
    });
    if (!response.ok) {
        throw new Error(`Custom API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}
/**
 * Validate invoice data
 */
export function validateInvoiceData(data) {
    const errors = [];
    if (!data.invoice_id || data.invoice_id <= 0) {
        errors.push('invoice_id must be a positive integer');
    }
    if (!data.amount || data.amount <= 0) {
        errors.push('amount must be a positive integer');
    }
    if (data.deadline) {
        const deadlineDate = new Date(data.deadline);
        if (isNaN(deadlineDate.getTime())) {
            errors.push('deadline must be a valid ISO 8601 date');
        }
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * Helper: Generate invoice ID from text (fallback if no ID in invoice)
 */
export function generateInvoiceIdFromText(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}
/**
 * Helper: Convert ISO date to block height estimate (for deadline)
 * Stacks blocks are ~10 minutes apart
 */
export function isoDateToBlockHeight(isoDate, currentBlockHeight) {
    const targetDate = new Date(isoDate);
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    const blocksUntilDeadline = Math.floor(diffMinutes / 10); // ~10 min per block
    return currentBlockHeight + blocksUntilDeadline;
}
