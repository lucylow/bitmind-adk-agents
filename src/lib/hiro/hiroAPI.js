import { connectWebSocketClient } from '@stacks/blockchain-api-client';
import { io } from 'socket.io-client';
export class BitMindHiroIntegration {
    constructor(apiKey, network = 'testnet') {
        Object.defineProperty(this, "wsClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "socketClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "network", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.apiKey = apiKey;
        this.network = network;
        this.baseUrl = network === 'testnet' ? 'https://api.testnet.hiro.so' : 'https://api.mainnet.hiro.so';
    }
    // WebSocket connection for real-time updates
    async initializeWebSocket() {
        try {
            const wsUrl = this.baseUrl.replace('https://', 'wss://') + '/extended/v1/ws';
            this.wsClient = await connectWebSocketClient(wsUrl);
            console.log('✅ Hiro WebSocket connected successfully');
            return this.wsClient;
        }
        catch (error) {
            console.error('❌ Failed to connect to Hiro WebSocket:', error);
            // Return mock client for development without API key
            return this.createMockWebSocketClient();
        }
    }
    // Socket.io connection for enhanced real-time features
    initializeSocketIO() {
        try {
            const socket = io(this.baseUrl, {
                transports: ['websocket'],
                auth: { token: this.apiKey },
            });
            this.socketClient = socket;
            socket.on('connect', () => {
                console.log('✅ Hiro Socket.IO connected');
            });
            socket.on('disconnect', () => {
                console.log('⚠️ Hiro Socket.IO disconnected');
            });
            socket.on('error', (error) => {
                console.error('❌ Socket.IO error:', error);
            });
            return this.socketClient;
        }
        catch (error) {
            console.error('Failed to initialize Socket.IO:', error);
            return null;
        }
    }
    // Monitor specific invoice contract transactions
    async subscribeToInvoiceTransactions(contractAddress, callback) {
        if (!this.wsClient) {
            await this.initializeWebSocket();
        }
        try {
            const subscription = await this.wsClient.subscribeAddressTransactions(contractAddress, (event) => {
                console.log('📊 Invoice transaction update:', event);
                callback(event);
            });
            return subscription;
        }
        catch (error) {
            console.error('Error subscribing to transactions:', error);
            // Mock subscription for development
            return { unsubscribe: () => { } };
        }
    }
    // Monitor contract calls to your escrow contracts
    async subscribeToContractCalls(contractId, functionName, callback) {
        if (!this.socketClient) {
            this.initializeSocketIO();
        }
        if (!this.socketClient) {
            console.warn('Socket.IO not available, skipping subscription');
            return;
        }
        // Subscribe to specific contract function calls
        this.socketClient.emit('subscribe', {
            event: 'contract_call',
            contract_id: contractId,
            function_name: functionName,
        });
        this.socketClient.on('contract_call', (data) => {
            if (data.contract_id === contractId && data.function_name === functionName) {
                callback(data);
            }
        });
    }
    // Get real-time mempool transactions for pending invoices
    async subscribeMempoolTransactions(callback) {
        if (!this.wsClient) {
            await this.initializeWebSocket();
        }
        try {
            const subscription = await this.wsClient.subscribeMempoolTransactions((transaction) => {
                // Filter for your contract transactions
                if (transaction.contract_call?.contract_id?.includes('escrow-secure')) {
                    console.log('⏳ Pending invoice transaction:', transaction);
                    callback(transaction);
                }
            });
            return subscription;
        }
        catch (error) {
            console.error('Error subscribing to mempool:', error);
            return { unsubscribe: () => { } };
        }
    }
    // Disconnect all connections
    disconnect() {
        if (this.wsClient?.close) {
            this.wsClient.close();
        }
        if (this.socketClient) {
            this.socketClient.disconnect();
        }
        console.log('🔌 Hiro API connections closed');
    }
    // Create mock WebSocket client for development
    createMockWebSocketClient() {
        return {
            subscribeAddressTransactions: async (_address, callback) => {
                console.log('📡 Using mock WebSocket client');
                // Simulate events in development
                const mockEvent = {
                    tx_id: '0x' + 'mock123',
                    tx_status: 'success',
                    contract_call: {
                        function_name: 'create-invoice',
                        contract_id: 'mock-contract',
                    },
                };
                setTimeout(() => callback(mockEvent), 2000);
                return { unsubscribe: () => { } };
            },
            subscribeMempoolTransactions: async (callback) => {
                console.log('📡 Using mock mempool subscription');
                return { unsubscribe: () => { } };
            },
            close: () => { },
        };
    }
    getBaseUrl() {
        return this.baseUrl;
    }
    getApiKey() {
        return this.apiKey;
    }
}
// Export singleton instance
const HIRO_API_KEY = import.meta.env.VITE_HIRO_API_KEY || 'mock-key';
const NETWORK = import.meta.env.VITE_NETWORK || 'testnet';
export const hiroAPI = new BitMindHiroIntegration(HIRO_API_KEY, NETWORK);
