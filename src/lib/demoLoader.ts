import demoData from '@/data/bitmind_demo_data.json';
import type { DemoInvoice, AITestCase, BlockchainEvent, DemoWallet, BatchApproval } from '@/types/demo.types';

export class DemoDataLoader {
	private static instance: DemoDataLoader;
	public data: typeof demoData;

	private constructor() {
		this.data = demoData;
	}

	static getInstance(): DemoDataLoader {
		if (!DemoDataLoader.instance) {
			DemoDataLoader.instance = new DemoDataLoader();
		}
		return DemoDataLoader.instance;
	}

	// Invoice management
	getAllInvoices(): DemoInvoice[] {
		return this.data.invoices as DemoInvoice[];
	}

	getInvoiceById(id: string): DemoInvoice | undefined {
		return this.data.invoices.find((inv) => inv.invoice_id === id) as DemoInvoice | undefined;
	}

	getInvoicesByStatus(status: string): DemoInvoice[] {
		return this.data.invoices.filter((inv) => inv.status === status) as DemoInvoice[];
	}

	getInvoicesByPriority(priority: string): DemoInvoice[] {
		return this.data.invoices.filter((inv) => inv.priority === priority) as DemoInvoice[];
	}

	getInvoicesByCategory(category: string): DemoInvoice[] {
		return this.data.invoices.filter((inv) => inv.category === category) as DemoInvoice[];
	}

	// AI Test cases
	getAITestCases(): AITestCase[] {
		return this.data.ai_test_cases as AITestCase[];
	}

	getAITestCaseById(id: string): AITestCase | undefined {
		return this.data.ai_test_cases.find((test) => test.id === id) as AITestCase | undefined;
	}

	// Security utilities
	isAddressBlacklisted(address: string): boolean {
		return this.data.security_data.blacklisted_addresses.includes(address);
	}

	getAddressRiskScore(address: string): number {
		const entity = this.data.security_data.screened_entities.find((e) => e.address === address);
		return entity?.risk_score || 5; // Default medium risk
	}

	getAddressTrustLevel(address: string): string {
		const entity = this.data.security_data.screened_entities.find((e) => e.address === address);
		return entity?.trust_level || 'unknown';
	}

	getAddressReputation(address: string) {
		const entity = this.data.security_data.screened_entities.find((e) => e.address === address);
		if (!entity) return null;
		return {
			risk_score: entity.risk_score,
			trust_level: entity.trust_level,
			completed_invoices: entity.completed_invoices,
			dispute_rate: entity.dispute_rate,
		};
	}

	// Blockchain events simulation
	getEventsForInvoice(invoiceId: string): BlockchainEvent[] {
		return this.data.blockchain_events.filter((event) => event.invoice_id === invoiceId) as BlockchainEvent[];
	}

	getAllEvents(): BlockchainEvent[] {
		return this.data.blockchain_events as BlockchainEvent[];
	}

	simulateNewEvent(invoiceId: string, eventType: string, details?: any): BlockchainEvent {
		const newEvent: BlockchainEvent = {
			event_id: `evt_${Date.now()}`,
			event_type: eventType,
			invoice_id: invoiceId,
			block_height: Math.floor(Math.random() * 1000) + 255000,
			tx_id: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
			timestamp: new Date().toISOString(),
			details: details || { simulated: true },
		};

		return newEvent;
	}

	// Demo wallet utilities
	getDemoWallets(): DemoWallet[] {
		return this.data.demo_wallets as DemoWallet[];
	}

	getWalletByRole(role: string): DemoWallet | undefined {
		return this.data.demo_wallets.find((wallet) => wallet.role === role) as DemoWallet | undefined;
	}

	getWalletByAddress(address: string): DemoWallet | undefined {
		return this.data.demo_wallets.find((wallet) => wallet.address === address) as DemoWallet | undefined;
	}

	// Governance data
	getBatchApprovals(): BatchApproval[] {
		return this.data.governance_data.batch_approvals as BatchApproval[];
	}

	getBatchApprovalById(batchId: string): BatchApproval | undefined {
		return this.data.governance_data.batch_approvals.find((batch) => batch.batch_id === batchId) as
			| BatchApproval
			| undefined;
	}

	// Statistics and analytics
	getInvoiceStats() {
		const invoices = this.getAllInvoices();
		return {
			total: invoices.length,
			active: invoices.filter((i) => i.status === 'active').length,
			disputed: invoices.filter((i) => i.status === 'disputed').length,
			completed: invoices.filter((i) => i.status === 'completed').length,
			totalValue: invoices.reduce((sum, inv) => sum + inv.amount, 0),
			averageConfidence: invoices.reduce((sum, inv) => sum + inv.confidence_score, 0) / invoices.length,
		};
	}

	getMilestoneStats() {
		const invoices = this.getAllInvoices();
		const allMilestones = invoices.flatMap((inv) => inv.milestones);
		return {
			total: allMilestones.length,
			completed: allMilestones.filter((m) => m.status === 'completed').length,
			in_progress: allMilestones.filter((m) => m.status === 'in_progress').length,
			pending: allMilestones.filter((m) => m.status === 'pending').length,
			disputed: allMilestones.filter((m) => m.status === 'disputed').length,
			blocked: allMilestones.filter((m) => m.status === 'blocked').length,
		};
	}
}

// Utility function to validate Stacks addresses in demo data
export function validateDemoAddresses(): { valid: boolean; errors: string[] } {
	const loader = DemoDataLoader.getInstance();
	const invoices = loader.getAllInvoices();
	const errors: string[] = [];
	const stacksAddressRegex = /^(SP|ST)[0-9A-Z]{38,41}$/;

	invoices.forEach((invoice) => {
		if (!stacksAddressRegex.test(invoice.payee)) {
			errors.push(`Invalid payee address in invoice ${invoice.invoice_id}: ${invoice.payee}`);
		}
		if (!stacksAddressRegex.test(invoice.payer)) {
			errors.push(`Invalid payer address in invoice ${invoice.invoice_id}: ${invoice.payer}`);
		}
		if (invoice.arbiter && !stacksAddressRegex.test(invoice.arbiter)) {
			errors.push(`Invalid arbiter address in invoice ${invoice.invoice_id}: ${invoice.arbiter}`);
		}
	});

	return {
		valid: errors.length === 0,
		errors,
	};
}

// Helper functions for formatting
export function formatSatoshis(sats: number): string {
	return `${(sats / 100000000).toFixed(8)} sBTC`;
}

export function formatUSD(sats: number, btcPrice: number = 60000): string {
	const btc = sats / 100000000;
	const usd = btc * btcPrice;
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd);
}

export function getMilestoneProgress(invoice: DemoInvoice): number {
	const completed = invoice.milestones.filter((m) => m.status === 'completed').length;
	return Math.round((completed / invoice.milestones.length) * 100);
}

// Export singleton instance
export const demoLoader = DemoDataLoader.getInstance();

