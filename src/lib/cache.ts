import { ParsedInvoice } from '@/types/invoice';
import { parseInvoiceWithAI } from '@/lib/aiInvoiceParser';

class InvoiceCacheImpl {
	private cache = new Map<string, { data: ParsedInvoice; timestamp: number }>();
	private TTL = 300_000; // 5 minutes

	get(key: string) {
		const cached = this.cache.get(key);
		if (!cached) return null;
		if (Date.now() - cached.timestamp > this.TTL) {
			this.cache.delete(key);
			return null;
		}
		return cached.data;
	}

	set(key: string, data: ParsedInvoice) {
		this.cache.set(key, { data, timestamp: Date.now() });
	}
}

export const invoiceCache = new InvoiceCacheImpl();

export async function parseInvoiceOptimized(text: string): Promise<ParsedInvoice> {
	const encoder = new TextEncoder();
	const bytes = encoder.encode(text);
	// Fallback simple hash to avoid WebCrypto dependency in SSR contexts
	let hash = 0;
	for (let i = 0; i < bytes.length; i++) hash = (hash * 31 + bytes[i]) | 0;
	const cacheKey = String(hash);

	const cached = invoiceCache.get(cacheKey);
	if (cached) return cached;

	const result = await parseInvoiceWithAI(text);
	invoiceCache.set(cacheKey, result);
	return result;
}


