// Invoice-related types used across the app

export interface ParsedInvoice {
	invoice_id: number;
	payee: string;
	amount: number; // integer in smallest units (e.g., satoshis)
	token_contract: string | null;
	arbiter: string | null;
	deadline: string; // ISO8601
	milestone_description: string;
	confidence_score: number; // 0..1
}

export interface InvoiceRealtimeUpdate {
	id: string;
	status?: string;
	releasedAmount?: number;
	[key: string]: unknown;
}


