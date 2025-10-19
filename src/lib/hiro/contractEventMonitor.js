export class SmartContractEventMonitor {
    constructor(hiroAPI) {
        Object.defineProperty(this, "hiroAPI", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.hiroAPI = hiroAPI;
    }
    // Monitor specific contract events with detailed parsing
    async monitorEscrowEvents(contractId) {
        const eventHandlers = {
            'create-invoice': (event) => {
                console.log('🆕 New invoice created:', {
                    invoiceId: this.extractInvoiceId(event),
                    payer: this.extractAddress(event, 'payer'),
                    payee: this.extractAddress(event, 'payee'),
                    amount: this.extractAmount(event),
                    timestamp: new Date().toISOString(),
                });
            },
            'ack-deposit': (event) => {
                console.log('💰 Escrow funded:', {
                    invoiceId: this.extractInvoiceId(event),
                    amount: this.extractAmount(event),
                    blockHeight: event.block_height,
                });
            },
            'release-funds': (event) => {
                console.log('✅ Funds released:', {
                    invoiceId: this.extractInvoiceId(event),
                    recipient: this.extractAddress(event, 'payee'),
                    amount: this.extractAmount(event),
                });
            },
            'create-dispute': (event) => {
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
    extractInvoiceId(event) {
        return (event.contract_call?.function_args?.find((arg) => arg.name === 'invoice-id')?.repr?.slice(1) || '0');
    }
    extractAddress(event, paramName) {
        return event.contract_call?.function_args?.find((arg) => arg.name === paramName)?.repr || '';
    }
    extractAmount(event) {
        const amountArg = event.contract_call?.function_args?.find((arg) => arg.name === 'amount');
        if (amountArg) {
            const microUnits = parseInt(amountArg.repr.slice(1));
            return `${microUnits / 100000000} sBTC`;
        }
        return '0 sBTC';
    }
    extractString(event, paramName) {
        return event.contract_call?.function_args?.find((arg) => arg.name === paramName)?.repr?.replace(/"/g, '') || '';
    }
    // Parse transaction event details
    parseTransactionEvent(event) {
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
    parseArguments(args) {
        return args.reduce((acc, arg) => {
            acc[arg.name] = this.parseArgumentValue(arg.repr);
            return acc;
        }, {});
    }
    parseArgumentValue(repr) {
        if (repr.startsWith('u')) {
            return parseInt(repr.slice(1));
        }
        else if (repr.startsWith('"')) {
            return repr.replace(/"/g, '');
        }
        return repr;
    }
}
