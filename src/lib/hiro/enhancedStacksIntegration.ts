import { hiroAPI, BitMindHiroIntegration } from './hiroAPI';
import { InvoiceBlockchainMonitor } from './invoiceMonitoring';
import { SmartContractEventMonitor } from './contractEventMonitor';
import { createInvoiceSecure } from '@/lib/stacksIntegration';
import { ParsedInvoice } from '@/types/invoice';
import { UserSession } from '@stacks/connect';
import { discordNotifications } from '@/lib/discord/discordNotificationService';

export async function createInvoiceWithMonitoring(
	invoiceData: ParsedInvoice,
	userSession: UserSession
): Promise<{ txId: string; monitor: InvoiceBlockchainMonitor }> {
	// Create invoice using existing secure logic
	const txId = await createInvoiceSecure(invoiceData, userSession);

	// Set up real-time monitoring
	const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
	const monitor = new InvoiceBlockchainMonitor(hiroAPI, contractAddress);

	// Initialize WebSocket connection if not already connected
	if (!hiroAPI['wsClient']) {
		await hiroAPI.initializeWebSocket();
	}

	// Track this specific invoice with Discord notifications
	await monitor.trackInvoiceLifecycle(invoiceData.invoice_id.toString(), {
		onCreated: async (data) => {
			console.log('✅ Invoice created on-chain:', data);
			
			// Send Discord notification
			await discordNotifications.notifyInvoiceCreated({
				invoice_id: invoiceData.invoice_id,
				amount: `${invoiceData.amount / 100000000} sBTC`,
				dao: 'BitMind DAO',
				payee: invoiceData.payee,
				description: invoiceData.milestone_description,
			});
			
			// Emit custom event for UI updates
			window.dispatchEvent(
				new CustomEvent('invoice-created', {
					detail: {
						invoiceId: invoiceData.invoice_id,
						txId: data.tx_id,
						timestamp: new Date(),
					},
				})
			);
		},
		onFunded: async (data) => {
			console.log('💰 Invoice funded:', data);
			
			// Send Discord notification
			await discordNotifications.notifyInvoiceFunded({
				invoice_id: invoiceData.invoice_id,
				amount: `${invoiceData.amount / 100000000} sBTC`,
				dao: 'BitMind DAO',
				txId: data.tx_id,
			});
			
			window.dispatchEvent(
				new CustomEvent('invoice-funded', {
					detail: {
						invoiceId: invoiceData.invoice_id,
						txId: data.tx_id,
						timestamp: new Date(),
					},
				})
			);
		},
		onReleased: async (data) => {
			console.log('🎉 Payment released:', data);
			
			// Send Discord notification
			await discordNotifications.notifyPaymentReleased({
				invoice_id: invoiceData.invoice_id,
				amount: `${invoiceData.amount / 100000000} sBTC`,
				dao: 'BitMind DAO',
				payee: invoiceData.payee,
				txId: data.tx_id,
			});
			
			window.dispatchEvent(
				new CustomEvent('invoice-released', {
					detail: {
						invoiceId: invoiceData.invoice_id,
						txId: data.tx_id,
						timestamp: new Date(),
					},
				})
			);
		},
		onDisputed: async (data) => {
			console.log('⚠️ Dispute raised:', data);
			
			// Send Discord notification
			await discordNotifications.notifyDispute({
				invoice_id: invoiceData.invoice_id,
				amount: `${invoiceData.amount / 100000000} sBTC`,
				dao: 'BitMind DAO',
				arbiter: invoiceData.arbiter,
			}, 'Dispute raised on-chain');
			
			window.dispatchEvent(
				new CustomEvent('invoice-disputed', {
					detail: {
						invoiceId: invoiceData.invoice_id,
						txId: data.tx_id,
						timestamp: new Date(),
					},
				})
			);
		},
	});

	return { txId, monitor };
}

export async function initializeContractMonitoring() {
	const contractId = `${import.meta.env.VITE_CONTRACT_ADDRESS}.${import.meta.env.VITE_ESCROW_CONTRACT || 'escrow-secure'}`;
	const eventMonitor = new SmartContractEventMonitor(hiroAPI);

	// Initialize WebSocket
	await hiroAPI.initializeWebSocket();

	// Start monitoring all escrow events
	await eventMonitor.monitorEscrowEvents(contractId);

	console.log('📡 Contract monitoring initialized for:', contractId);

	return eventMonitor;
}

export async function getInvoiceRealtimeStatus(invoiceId: string) {
	const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
	const monitor = new InvoiceBlockchainMonitor(hiroAPI, contractAddress);

	try {
		const history = await monitor.getInvoiceTransactionHistory(invoiceId);
		return {
			invoiceId,
			transactionCount: history.length,
			latestStatus: history[0]?.tx_status || 'unknown',
			transactions: history,
		};
	} catch (error) {
		console.error('Error fetching invoice status:', error);
		return null;
	}
}

export { hiroAPI, InvoiceBlockchainMonitor, SmartContractEventMonitor };

