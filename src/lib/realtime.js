export class InvoiceRealtimeUpdates {
    constructor() {
        Object.defineProperty(this, "ws", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "subscriptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    connect(url = 'wss://api.bitmind.io/ws') {
        this.ws = new WebSocket(url);
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const callback = this.subscriptions.get(String(data.invoiceId));
            if (callback)
                callback(data);
        };
    }
    disconnect() {
        this.ws?.close();
        this.ws = null;
    }
    subscribeToInvoice(invoiceId, callback) {
        this.subscriptions.set(invoiceId, callback);
        this.ws?.send(JSON.stringify({
            action: 'subscribe',
            invoiceId,
        }));
    }
}
