import { apiManager } from '@/lib/api/apiManager';

export class DiscordNotificationService {
	private discordAPI: any;
	private enabled: boolean = false;

	constructor() {
		this.discordAPI = apiManager.getAPI('discord');
		this.enabled = apiManager.isAPIAvailable('discord');
	}

	isEnabled(): boolean {
		return this.enabled;
	}

	// Notify on invoice creation
	async notifyInvoiceCreated(invoiceData: any) {
		if (!this.enabled) {
			console.log('Discord notifications disabled');
			return { success: false, reason: 'Not configured' };
		}

		try {
			const result = await this.discordAPI.sendInvoiceCreated({
				id: invoiceData.invoice_id || invoiceData.id,
				amount: invoiceData.amount || '0 sBTC',
				dao: invoiceData.dao || 'Unknown DAO',
				payee: invoiceData.payee,
				description: invoiceData.milestone_description || invoiceData.description,
			});
			return { success: true, result };
		} catch (error) {
			console.error('Failed to send Discord notification:', error);
			return { success: false, error };
		}
	}

	// Notify on invoice funding
	async notifyInvoiceFunded(invoiceData: any, txId?: string) {
		if (!this.enabled) return { success: false, reason: 'Not configured' };

		try {
			const result = await this.discordAPI.sendInvoiceFunded({
				id: invoiceData.invoice_id || invoiceData.id,
				amount: invoiceData.amount || '0 sBTC',
				dao: invoiceData.dao || 'Unknown DAO',
				txId: txId || invoiceData.txId,
			});
			return { success: true, result };
		} catch (error) {
			console.error('Failed to send Discord notification:', error);
			return { success: false, error };
		}
	}

	// Notify on payment release
	async notifyPaymentReleased(invoiceData: any, txId?: string) {
		if (!this.enabled) return { success: false, reason: 'Not configured' };

		try {
			const result = await this.discordAPI.sendInvoiceReleased({
				id: invoiceData.invoice_id || invoiceData.id,
				amount: invoiceData.amount || '0 sBTC',
				dao: invoiceData.dao || 'Unknown DAO',
				payee: invoiceData.payee,
				txId: txId || invoiceData.txId,
			});
			return { success: true, result };
		} catch (error) {
			console.error('Failed to send Discord notification:', error);
			return { success: false, error };
		}
	}

	// Notify on dispute
	async notifyDispute(invoiceData: any, disputeReason?: string) {
		if (!this.enabled) return { success: false, reason: 'Not configured' };

		try {
			const result = await this.discordAPI.sendInvoiceDisputed({
				id: invoiceData.invoice_id || invoiceData.id,
				amount: invoiceData.amount || '0 sBTC',
				dao: invoiceData.dao || 'Unknown DAO',
				disputeReason,
				arbiter: invoiceData.arbiter,
			});
			return { success: true, result };
		} catch (error) {
			console.error('Failed to send Discord notification:', error);
			return { success: false, error };
		}
	}

	// Notify on milestone completion
	async notifyMilestoneComplete(invoiceData: any, milestoneData: any) {
		if (!this.enabled) return { success: false, reason: 'Not configured' };

		try {
			const result = await this.discordAPI.sendMilestoneCompleted(
				{ id: invoiceData.invoice_id || invoiceData.id },
				milestoneData
			);
			return { success: true, result };
		} catch (error) {
			console.error('Failed to send Discord notification:', error);
			return { success: false, error };
		}
	}

	// Notify on AI parsing
	async notifyAIParsing(invoiceData: any, aiResults: any) {
		if (!this.enabled) return { success: false, reason: 'Not configured' };

		try {
			const result = await this.discordAPI.sendAIParsingComplete(
				{ id: invoiceData.invoice_id || invoiceData.id },
				aiResults
			);
			return { success: true, result };
		} catch (error) {
			console.error('Failed to send Discord notification:', error);
			return { success: false, error };
		}
	}

	// Send daily summary
	async sendDailySummary(summaryData: any) {
		if (!this.enabled) return { success: false, reason: 'Not configured' };

		try {
			const result = await this.discordAPI.sendDailySummary(summaryData);
			return { success: true, result };
		} catch (error) {
			console.error('Failed to send Discord notification:', error);
			return { success: false, error };
		}
	}

	// Test connection
	async testConnection() {
		if (!this.enabled) return { success: false, reason: 'Not configured' };

		try {
			const result = await this.discordAPI.sendTestNotification();
			return result;
		} catch (error) {
			console.error('Failed to test Discord connection:', error);
			return { success: false, error };
		}
	}
}

// Export singleton
export const discordNotifications = new DiscordNotificationService();

