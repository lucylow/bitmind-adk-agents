export class InvoiceRealtimeUpdates {
	private ws: WebSocket | null = null;
	private subscriptions = new Map<string, (data: any) => void>();

	connect(url = 'wss://api.bitmind.io/ws') {
		this.ws = new WebSocket(url);
		this.ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			const callback = this.subscriptions.get(String(data.invoiceId));
			if (callback) callback(data);
		};
	}

	disconnect() {
		this.ws?.close();
		this.ws = null;
	}

	subscribeToInvoice(invoiceId: string, callback: (data: any) => void) {
		this.subscriptions.set(invoiceId, callback);
		this.ws?.send(
			JSON.stringify({
				action: 'subscribe',
				invoiceId,
			})
		);
	}
}


