import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiManager } from '@/lib/api/apiManager';
import NavigationBar from '@/components/NavigationBar';
import {
	CheckCircle,
	XCircle,
	Zap,
	Database,
	Brain,
	MessageSquare,
	Cloud,
	TrendingUp,
	Shield,
} from 'lucide-react';

const APIShowcase: React.FC = () => {
	const [apiStatus] = useState(apiManager.getAPIStatus());
	const [testResults, setTestResults] = useState<any>({});
	const [loading, setLoading] = useState<string | null>(null);

	const testAPI = async (apiName: string, testFn: () => Promise<any>) => {
		setLoading(apiName);
		try {
			const result = await testFn();
			setTestResults((prev: any) => ({ ...prev, [apiName]: { success: true, data: result } }));
		} catch (error: any) {
			setTestResults((prev: any) => ({ ...prev, [apiName]: { success: false, error: error.message } }));
		} finally {
			setLoading(null);
		}
	};

	const apiCategories = [
		{
			name: 'Blockchain APIs',
			icon: Database,
			color: 'text-orange-600',
			apis: [
				{
					name: 'Hiro Stacks API',
					key: 'hiro',
					available: apiStatus.blockchain.hiro,
					description: 'Real-time Stacks blockchain data, transactions, and contract events',
					test: async () => {
						const api = apiManager.getAPI('hiro');
						return await api?.getAccountBalance('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
					},
				},
				{
					name: 'Chainalysis',
					key: 'chainalysis',
					available: apiStatus.blockchain.chainalysis,
					description: 'Compliance screening and risk assessment for Bitcoin addresses',
					test: async () => {
						const api = apiManager.getAPI('chainalysis');
						return await api?.screenAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
					},
				},
			],
		},
		{
			name: 'Market Data APIs',
			icon: TrendingUp,
			color: 'text-blue-600',
			apis: [
				{
					name: 'CoinMarketCap',
					key: 'cmc',
					available: apiStatus.marketData.coinmarketcap,
					description: 'Comprehensive cryptocurrency market data and pricing',
					test: async () => {
						const api = apiManager.getAPI('cmc');
						return await api?.getCryptoPrices(['BTC', 'STX']);
					},
				},
				{
					name: 'Alpha Vantage',
					key: 'alphaVantage',
					available: apiStatus.marketData.alphaVantage,
					description: 'Traditional finance and forex data integration',
					test: async () => {
						const api = apiManager.getAPI('alphaVantage');
						return await api?.getExchangeRates();
					},
				},
			],
		},
		{
			name: 'AI & ML APIs',
			icon: Brain,
			color: 'text-purple-600',
			apis: [
				{
					name: 'Cohere',
					key: 'cohere',
					available: apiStatus.ai.cohere,
					description: 'Advanced NLP for invoice classification and fraud detection',
					test: async () => {
						const api = apiManager.getAPI('cohere');
						return await api?.classifyInvoiceType('Milestone payment for development work');
					},
				},
				{
					name: 'Hugging Face',
					key: 'huggingface',
					available: apiStatus.ai.huggingface,
					description: 'Entity extraction and sentiment analysis',
					test: async () => {
						const api = apiManager.getAPI('huggingface');
						return await api?.extractEntities('Payment to John Doe for consulting services in New York');
					},
				},
			],
		},
		{
			name: 'Communication APIs',
			icon: MessageSquare,
			color: 'text-green-600',
			apis: [
				{
					name: 'Twilio SMS',
					key: 'twilio',
					available: apiStatus.communication.twilio,
					description: 'SMS notifications for payment alerts and updates',
					test: async () => ({ message: 'Twilio configured (test skipped to avoid SMS charges)' }),
				},
				{
					name: 'Discord Webhook',
					key: 'discord',
					available: apiStatus.communication.discord,
					description: 'Real-time DAO notifications in Discord channels',
					test: async () => {
						const api = apiManager.getAPI('discord');
						return await api?.sendDAONotification('Test notification from API showcase', {
							id: 'TEST-001',
							amount: '0.1',
							status: 'created',
							dao: 'Demo DAO',
						});
					},
				},
			],
		},
		{
			name: 'Storage APIs',
			icon: Cloud,
			color: 'text-indigo-600',
			apis: [
				{
					name: 'Pinata IPFS',
					key: 'pinata',
					available: apiStatus.storage.pinata,
					description: 'Decentralized storage for invoice documents and evidence',
					test: async () => {
						const api = apiManager.getAPI('pinata');
						return await api?.uploadJSON(
							{ test: 'data', timestamp: Date.now() },
							'BitMind API Test'
						);
					},
				},
			],
		},
	];

	return (
		<div className="min-h-screen bg-background">
			<NavigationBar />
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-4xl font-bold mb-4">API Integration Showcase</h1>
					<p className="text-muted-foreground text-lg mb-6">
						BitMind integrates with leading blockchain, AI, and communication APIs to deliver
						enterprise-grade invoice management
					</p>

					<div className="grid md:grid-cols-5 gap-4 mb-6">
						{[
							{
								label: 'Blockchain',
								count: Object.values(apiStatus.blockchain).filter(Boolean).length,
								total: 2,
								icon: Database,
							},
							{
								label: 'Market Data',
								count: Object.values(apiStatus.marketData).filter(Boolean).length,
								total: 2,
								icon: TrendingUp,
							},
							{
								label: 'AI/ML',
								count: Object.values(apiStatus.ai).filter(Boolean).length,
								total: 2,
								icon: Brain,
							},
							{
								label: 'Communication',
								count: Object.values(apiStatus.communication).filter(Boolean).length,
								total: 2,
								icon: MessageSquare,
							},
							{
								label: 'Storage',
								count: Object.values(apiStatus.storage).filter(Boolean).length,
								total: 1,
								icon: Cloud,
							},
						].map((stat) => (
							<Card key={stat.label}>
								<CardContent className="pt-6">
									<div className="flex items-center justify-between mb-2">
										<stat.icon className="w-5 h-5 text-muted-foreground" />
										<Badge variant={stat.count === stat.total ? 'default' : 'secondary'}>
											{stat.count}/{stat.total}
										</Badge>
									</div>
									<p className="text-sm font-semibold">{stat.label}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				<div className="space-y-8">
					{apiCategories.map((category) => (
						<div key={category.name}>
							<div className="flex items-center gap-3 mb-4">
								<category.icon className={`w-6 h-6 ${category.color}`} />
								<h2 className="text-2xl font-bold">{category.name}</h2>
							</div>

							<div className="grid md:grid-cols-2 gap-4">
								{category.apis.map((api) => (
									<Card
										key={api.key}
										className={api.available ? 'border-green-200' : 'border-gray-200'}
									>
										<CardHeader>
											<div className="flex items-start justify-between">
												<div>
													<CardTitle className="flex items-center gap-2">
														{api.name}
														{api.available ? (
															<CheckCircle className="w-5 h-5 text-green-600" />
														) : (
															<XCircle className="w-5 h-5 text-gray-400" />
														)}
													</CardTitle>
													<CardDescription className="mt-2">
														{api.description}
													</CardDescription>
												</div>
											</div>
										</CardHeader>
										<CardContent>
											<div className="space-y-3">
												<div className="flex gap-2">
													<Badge variant={api.available ? 'default' : 'outline'}>
														{api.available ? 'Configured' : 'Not Configured'}
													</Badge>
												</div>

												{api.available && (
													<Button
														onClick={() => testAPI(api.key, api.test)}
														disabled={loading === api.key}
														size="sm"
														variant="outline"
														className="w-full"
													>
														<Zap className="w-4 h-4 mr-2" />
														{loading === api.key ? 'Testing...' : 'Test API'}
													</Button>
												)}

												{testResults[api.key] && (
													<div
														className={`p-3 rounded text-xs ${
															testResults[api.key].success
																? 'bg-green-50 text-green-800'
																: 'bg-red-50 text-red-800'
														}`}
													>
														{testResults[api.key].success ? (
															<div>
																<p className="font-semibold mb-1">✅ Success</p>
																<pre className="overflow-auto">
																	{JSON.stringify(
																		testResults[api.key].data,
																		null,
																		2
																	).substring(0, 200)}
																	...
																</pre>
															</div>
														) : (
															<p>❌ {testResults[api.key].error}</p>
														)}
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					))}
				</div>

				<Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="w-6 h-6 text-purple-600" />
							Configuration Guide
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="mb-4">
							To enable all APIs, add your API keys to the <code>.env.local</code> file. See{' '}
							<code>ENV_SETUP.md</code> for detailed instructions.
						</p>
						<div className="bg-white p-4 rounded border">
							<p className="text-sm font-mono mb-2">Available APIs:</p>
							<ul className="text-sm space-y-1 font-mono">
								{apiManager.getAvailableAPIs().map((api) => (
									<li key={api} className="text-green-600">
										✓ {api}
									</li>
								))}
							</ul>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default APIShowcase;

