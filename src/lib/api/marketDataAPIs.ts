import axios from 'axios';

export class CoinMarketCapAPI {
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async getCryptoPrices(symbols: string[] = ['BTC', 'STX']) {
		try {
			const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
				headers: { 'X-CMC_PRO_API_KEY': this.apiKey },
				params: { symbol: symbols.join(','), convert: 'USD' },
			});
			return response.data;
		} catch (error) {
			console.error('CoinMarketCap API error:', error);
			return null;
		}
	}

	async getHistoricalData(symbol: string, days: number = 30) {
		try {
			const timeStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
			const response = await axios.get(
				'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical',
				{
					headers: { 'X-CMC_PRO_API_KEY': this.apiKey },
					params: { symbol, time_start: timeStart, convert: 'USD' },
				}
			);
			return response.data;
		} catch (error) {
			console.error('CoinMarketCap API error:', error);
			return null;
		}
	}

	async getMarketMetrics(symbol: string = 'BTC') {
		try {
			const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/info', {
				headers: { 'X-CMC_PRO_API_KEY': this.apiKey },
				params: { symbol },
			});
			return response.data;
		} catch (error) {
			console.error('CoinMarketCap API error:', error);
			return null;
		}
	}
}

export class AlphaVantageAPI {
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async getExchangeRates() {
		try {
			const response = await axios.get(
				`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=BTC&apikey=${this.apiKey}`
			);
			return response.data;
		} catch (error) {
			console.error('AlphaVantage API error:', error);
			return null;
		}
	}

	async getForexRates(fromSymbol: string = 'USD', toSymbol: string = 'EUR') {
		try {
			const response = await axios.get(
				`https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${fromSymbol}&to_symbol=${toSymbol}&apikey=${this.apiKey}`
			);
			return response.data;
		} catch (error) {
			console.error('AlphaVantage API error:', error);
			return null;
		}
	}
}

const CMC_API_KEY = import.meta.env.VITE_COINMARKETCAP_API_KEY;
export const cmcAPI = CMC_API_KEY ? new CoinMarketCapAPI(CMC_API_KEY) : null;

