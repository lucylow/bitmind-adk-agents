import { describe, it, expect } from 'vitest';
import { parseInvoiceWithAI, fallbackParser } from '@/lib/aiInvoiceParser';

describe('AI Invoice Parser', () => {
	it('should handle malformed input gracefully', async () => {
		const malformedText = 'random text with no invoice data';
		const result = await parseInvoiceWithAI(malformedText);
		expect(result.confidence_score).toBeLessThan(0.8);
		expect(result.payee).toContain('SP');
	});

	it('fallback parser extracts amount and address when present', () => {
		const text = 'Pay to SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7 amount 0.05 BTC';
		const parsed = fallbackParser(text);
		expect(parsed.payee).toBe('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
		expect(parsed.amount).toBe(5_000_000);
	});
});


