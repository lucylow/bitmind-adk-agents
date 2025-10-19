export interface DemoInvoice {
	invoice_id: string;
	payee: string;
	payer: string;
	amount: number;
	token_contract: string;
	currency: 'sBTC' | 'STX';
	milestones: Milestone[];
	arbiter: string | null;
	deadline: string;
	status: InvoiceStatus;
	current_milestone: number;
	description: string;
	category: string;
	priority: 'low' | 'medium' | 'high';
	tags: string[];
	ipfs_hash: string;
	dispute: Dispute | null;
	created_at: string;
	updated_at: string;
	security_hash: string;
	confidence_score: number;
}

export interface Milestone {
	id: string;
	title: string;
	description: string;
	amount: number;
	due_date: string;
	status: MilestoneStatus;
	completion_proof: string | null;
	completed_at: string | null;
}

export interface Dispute {
	id: string;
	triggered_by: 'payer' | 'payee';
	triggered_at: string;
	reason: string;
	evidence_ipfs: string;
	dispute_type: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
	proposed_solution: string;
	status: DisputeStatus;
}

export interface AITestCase {
	id: string;
	description: string;
	text: string;
	expected_extraction: {
		invoice_id: string | null;
		payee: string;
		payer: string | null;
		amount: number;
		currency: string;
		milestones: number;
		arbiter: string | null;
	};
}

export interface BlockchainEvent {
	event_id: string;
	event_type: string;
	invoice_id: string;
	block_height: number;
	tx_id: string;
	timestamp: string;
	details: Record<string, any>;
}

export interface DemoWallet {
	label: string;
	address: string;
	type: 'single_sig' | 'multi_sig';
	balance_sats: number;
	network: string;
	role: string;
}

export interface BatchApproval {
	batch_id: string;
	description: string;
	invoices: string[];
	total_amount: number;
	approval_threshold: number;
	approvals: Approval[];
	status: string;
	executed_at: string;
}

export interface Approval {
	org: string;
	approved: boolean;
	timestamp: string;
	signature?: string;
	reason?: string;
}

export type InvoiceStatus = 'draft' | 'active' | 'funded' | 'disputed' | 'completed' | 'cancelled';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'disputed' | 'blocked';
export type DisputeStatus = 'under_review' | 'resolved' | 'escalated' | 'cancelled';



