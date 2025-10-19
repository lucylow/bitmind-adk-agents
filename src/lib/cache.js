import { parseInvoiceWithAI } from '@/lib/aiInvoiceParser';
class InvoiceCacheImpl {
    constructor() {
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "TTL", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 300000
        }); // 5 minutes
    }
    get(key) {
        const cached = this.cache.get(key);
        if (!cached)
            return null;
        if (Date.now() - cached.timestamp > this.TTL) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }
    set(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }
}
export const invoiceCache = new InvoiceCacheImpl();
export async function parseInvoiceOptimized(text) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    // Fallback simple hash to avoid WebCrypto dependency in SSR contexts
    let hash = 0;
    for (let i = 0; i < bytes.length; i++)
        hash = (hash * 31 + bytes[i]) | 0;
    const cacheKey = String(hash);
    const cached = invoiceCache.get(cacheKey);
    if (cached)
        return cached;
    const result = await parseInvoiceWithAI(text);
    invoiceCache.set(cacheKey, result);
    return result;
}
