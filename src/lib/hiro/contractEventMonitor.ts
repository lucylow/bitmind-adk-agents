import { BitMindHiroIntegration } from './hiroAPI';

export class SmartContractEventMonitor {
	private hiroAPI: BitMindHiroIntegration;

	constructor(hiroAPI: BitMindHiroIntegration) {
		this.hiroAPI = hiroAPI;
	}

	// Monitor specific contract events with detailed parsing
	async monitorEscrowEvents(contractId: string) {
		const eventHandlers = {
			'create-invoice': (event: any) => {
				console.log('🆕 New invoice created:', {
					invoiceId: this.extractInvoiceId(event),
					payer: this.extractAddress(event, 'payer'),
					payee: this.extractAddress(event, 'payee'),
					amount: this.extractAmount(event),
					timestamp: new Date().toISOString(),
				});
			},

			'ack-deposit': (event: any) => {
				console.log('💰 Escrow funded:', {
					invoiceId: this.extractInvoiceId(event),
					amount: this.extractAmount(event),
					blockHeight: event.block_height,
				});
			},

			'release-funds': (event: any) => {
				console.log('✅ Funds released:', {
					invoiceId: this.extractInvoiceId(event),
					recipient: this.extractAddress(event, 'payee'),
					amount: this.extractAmount(event),
				});
			},

			'create-dispute': (event: any) => {
				console.log('⚠️ Dispute created:', {
					invoiceId: this.extractInvoiceId(event),
					disputeReason: this.extractString(event, 'reason'),
				});
			},
		};

		// Subscribe to each event type
		Object.entries(eventHandlers).forEach(([functionName, handler]) => {
			this.hiroAPI.subscribeToContractCalls(contractId, functionName, handler);
		});
	}

	// Extract structured data from contract events
	private extractInvoiceId(event: any): string {
		return (
			event.contract_call?.function_args?.find((arg: any) => arg.name === 'invoice-id')?.repr?.slice(1) || '0'
		);
	}

	private extractAddress(event: any, paramName: string): string {
		return event.contract_call?.function_args?.find((arg: any) => arg.name === paramName)?.repr || '';
	}

	private extractAmount(event: any): string {
		const amountArg = event.contract_call?.function_args?.find((arg: any) => arg.name === 'amount');
		if (amountArg) {
			const microUnits = parseInt(amountArg.repr.slice(1));
			return `${microUnits / 100000000} sBTC`;
		}
		return '0 sBTC';
	}

	private extractString(event: any, paramName: string): string {
		return event.contract_call?.function_args?.find((arg: any) => arg.name === paramName)?.repr?.replace(/"/g, '') || '';
	}

	// Parse transaction event details
	parseTransactionEvent(event: any) {
		return {
			txId: event.tx_id,
			status: event.tx_status,
			blockHeight: event.block_height,
			functionName: event.contract_call?.function_name,
			contractId: event.contract_call?.contract_id,
			timestamp: new Date(event.burn_block_time * 1000).toISOString(),
			args: this.parseArguments(event.contract_call?.function_args || []),
		};
	}

	private parseArguments(args: any[]) {
		return args.reduce((acc, arg) => {
			acc[arg.name] = this.parseArgumentValue(arg.repr);
			return acc;
		}, {} as Record<string, any>);
	}

	private parseArgumentValue(repr: string): any {
		if (repr.startsWith('u')) {
			return parseInt(repr.slice(1));
		} else if (repr.startsWith('"')) {
			return repr.replace(/"/g, '');
		}
		return repr;
	}
}

