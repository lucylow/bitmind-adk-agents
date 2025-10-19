import demoData from '@/data/bitmind_demo_data.json';
export class DemoDataLoader {
    constructor() {
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.data = demoData;
    }
    static getInstance() {
        if (!DemoDataLoader.instance) {
            DemoDataLoader.instance = new DemoDataLoader();
        }
        return DemoDataLoader.instance;
    }
    // Invoice management
    getAllInvoices() {
        return this.data.invoices;
    }
    getInvoiceById(id) {
        return this.data.invoices.find((inv) => inv.invoice_id === id);
    }
    getInvoicesByStatus(status) {
        return this.data.invoices.filter((inv) => inv.status === status);
    }
    getInvoicesByPriority(priority) {
        return this.data.invoices.filter((inv) => inv.priority === priority);
    }
    getInvoicesByCategory(category) {
        return this.data.invoices.filter((inv) => inv.category === category);
    }
    // AI Test cases
    getAITestCases() {
        return this.data.ai_test_cases;
    }
    getAITestCaseById(id) {
        return this.data.ai_test_cases.find((test) => test.id === id);
    }
    // Security utilities
    isAddressBlacklisted(address) {
        return this.data.security_data.blacklisted_addresses.includes(address);
    }
    getAddressRiskScore(address) {
        const entity = this.data.security_data.screened_entities.find((e) => e.address === address);
        return entity?.risk_score || 5; // Default medium risk
    }
    getAddressTrustLevel(address) {
        const entity = this.data.security_data.screened_entities.find((e) => e.address === address);
        return entity?.trust_level || 'unknown';
    }
    getAddressReputation(address) {
        const entity = this.data.security_data.screened_entities.find((e) => e.address === address);
        if (!entity)
            return null;
        return {
            risk_score: entity.risk_score,
            trust_level: entity.trust_level,
            completed_invoices: entity.completed_invoices,
            dispute_rate: entity.dispute_rate,
        };
    }
    // Blockchain events simulation
    getEventsForInvoice(invoiceId) {
        return this.data.blockchain_events.filter((event) => event.invoice_id === invoiceId);
    }
    getAllEvents() {
        return this.data.blockchain_events;
    }
    simulateNewEvent(invoiceId, eventType, details) {
        const newEvent = {
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
    getDemoWallets() {
        return this.data.demo_wallets;
    }
    getWalletByRole(role) {
        return this.data.demo_wallets.find((wallet) => wallet.role === role);
    }
    getWalletByAddress(address) {
        return this.data.demo_wallets.find((wallet) => wallet.address === address);
    }
    // Governance data
    getBatchApprovals() {
        return this.data.governance_data.batch_approvals;
    }
    getBatchApprovalById(batchId) {
        return this.data.governance_data.batch_approvals.find((batch) => batch.batch_id === batchId);
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
export function validateDemoAddresses() {
    const loader = DemoDataLoader.getInstance();
    const invoices = loader.getAllInvoices();
    const errors = [];
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
export function formatSatoshis(sats) {
    return `${(sats / 100000000).toFixed(8)} sBTC`;
}
export function formatUSD(sats, btcPrice = 60000) {
    const btc = sats / 100000000;
    const usd = btc * btcPrice;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd);
}
export function getMilestoneProgress(invoice) {
    const completed = invoice.milestones.filter((m) => m.status === 'completed').length;
    return Math.round((completed / invoice.milestones.length) * 100);
}
// Export singleton instance
export const demoLoader = DemoDataLoader.getInstance();
