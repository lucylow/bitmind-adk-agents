import axios from 'axios';

const HIRO_API_KEY = import.meta.env.VITE_HIRO_API_KEY;
const HIRO_BASE_URL = 'https://api.hiro.so';

export class StacksDataAPI {
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async getTransactionStatus(txId: string) {
		try {
			const response = await axios.get(`${HIRO_BASE_URL}/extended/v1/tx/${txId}`, {
				headers: { 'X-API-Key': this.apiKey },
			});
			return response.data;
		} catch (error) {
			console.error('Hiro API error:', error);
			return null;
		}
	}

	async getContractEvents(contractId: string, limit: number = 20) {
		try {
			const response = await axios.get(`${HIRO_BASE_URL}/extended/v1/contract/${contractId}/events`, {
				headers: { 'X-API-Key': this.apiKey },
				params: { limit },
			});
			return response.data;
		} catch (error) {
			console.error('Hiro API error:', error);
			return null;
		}
	}

	async getAccountTransactions(address: string, limit: number = 50) {
		try {
			const response = await axios.get(`${HIRO_BASE_URL}/extended/v1/address/${address}/transactions`, {
				headers: { 'X-API-Key': this.apiKey },
				params: { limit },
			});
			return response.data;
		} catch (error) {
			console.error('Hiro API error:', error);
			return null;
		}
	}

	async getAccountBalance(address: string) {
		try {
			const response = await axios.get(`${HIRO_BASE_URL}/extended/v1/address/${address}/balances`, {
				headers: { 'X-API-Key': this.apiKey },
			});
			return response.data;
		} catch (error) {
			console.error('Hiro API error:', error);
			return null;
		}
	}
}

export class ChainalysisAPI {
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async screenAddress(address: string, asset: string = 'BTC') {
		try {
			const response = await axios.post(
				'https://api.chainalysis.com/api/kyt/v1/transfers',
				{
					network: 'bitcoin',
					asset,
					transferReference: `bitmind-${Date.now()}`,
					outputs: [{ address, amount: 100000000 }],
				},
				{
					headers: {
						Authorization: `Bearer ${this.apiKey}`,
						'Content-Type': 'application/json',
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error('Chainalysis API error:', error);
			return { risk: 'unknown', error: true };
		}
	}
}

// Export default instance if API key available
export const hiroAPI = HIRO_API_KEY ? new StacksDataAPI(HIRO_API_KEY) : null;

