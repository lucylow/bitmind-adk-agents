import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BitMindHiroIntegration, hiroAPI } from '@/lib/hiro/hiroAPI';
import { InvoiceBlockchainMonitor } from '@/lib/hiro/invoiceMonitoring';
import { discordNotifications } from '@/lib/discord/discordNotificationService';
import { Activity, ExternalLink, RefreshCw, MessageSquare } from 'lucide-react';

interface InvoiceEvent {
	id: string;
	type: 'created' | 'funded' | 'released' | 'disputed';
	timestamp: Date;
	txId: string;
	amount: string;
	status: 'pending' | 'confirmed' | 'failed';
	invoiceId?: string;
}

export function RealtimeInvoiceDashboard() {
	const [invoiceEvents, setInvoiceEvents] = useState<InvoiceEvent[]>([]);
	const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>(
		'connecting'
	);
	const [monitor, setMonitor] = useState<InvoiceBlockchainMonitor | null>(null);
	const [discordEnabled, setDiscordEnabled] = useState(false);

	useEffect(() => {
		setDiscordEnabled(discordNotifications.isEnabled());
		initializeHiroMonitoring();

		return () => {
			// Cleanup WebSocket connections
			hiroAPI.disconnect();
		};
	}, []);

	const initializeHiroMonitoring = async () => {
		try {
			await hiroAPI.initializeWebSocket();
			setConnectionStatus('connected');

			const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
			const invoiceMonitor = new InvoiceBlockchainMonitor(hiroAPI, contractAddress);
			setMonitor(invoiceMonitor);

			// Subscribe to real-time updates with Discord notifications
			await hiroAPI.subscribeToInvoiceTransactions(contractAddress, async (event: any) => {
				const newEvent: InvoiceEvent = {
					id: event.tx_id || `event-${Date.now()}`,
					type: determineEventType(event),
					timestamp: new Date(),
					txId: event.tx_id || '0x0',
					amount: extractAmount(event),
					status: event.tx_status === 'success' ? 'confirmed' : 'pending',
					invoiceId: extractInvoiceId(event),
				};

				setInvoiceEvents((prev) => [newEvent, ...prev.slice(0, 49)]); // Keep last 50 events

				// Send Discord notification based on event type
				if (discordEnabled && event.tx_status === 'success') {
					const notificationData = {
						id: extractInvoiceId(event),
						amount: extractAmount(event),
						dao: 'BitMind DAO',
						txId: event.tx_id,
					};

					switch (newEvent.type) {
						case 'created':
							await discordNotifications.notifyInvoiceCreated(notificationData);
							break;
						case 'funded':
							await discordNotifications.notifyInvoiceFunded(notificationData);
							break;
						case 'released':
							await discordNotifications.notifyPaymentReleased(notificationData);
							break;
						case 'disputed':
							await discordNotifications.notifyDispute(notificationData);
							break;
					}
				}
			});

			// Subscribe to mempool for pending transactions
			await hiroAPI.subscribeMempoolTransactions((tx: any) => {
				const newEvent: InvoiceEvent = {
					id: tx.tx_id || `mempool-${Date.now()}`,
					type: determineEventType(tx),
					timestamp: new Date(),
					txId: tx.tx_id || '0x0',
					amount: extractAmount(tx),
					status: 'pending',
					invoiceId: extractInvoiceId(tx),
				};

				setInvoiceEvents((prev) => [newEvent, ...prev.slice(0, 49)]);
			});
		} catch (error) {
			console.error('Failed to initialize Hiro monitoring:', error);
			setConnectionStatus('disconnected');
		}
	};

	const determineEventType = (event: any): InvoiceEvent['type'] => {
		const functionName = event.contract_call?.function_name;
		if (functionName === 'create-invoice' || functionName === 'create-invoice-secure') return 'created';
		if (functionName === 'ack-deposit') return 'funded';
		if (functionName === 'release-funds' || functionName === 'release-funds-secure') return 'released';
		if (functionName === 'create-dispute') return 'disputed';
		return 'created';
	};

	const extractAmount = (event: any): string => {
		const amountArg = event.contract_call?.function_args?.find((arg: any) => arg.name === 'amount');
		if (amountArg) {
			const amount = parseInt(amountArg.repr?.slice(1) || '0') / 100000000;
			return `${amount} sBTC`;
		}
		return '0 sBTC';
	};

	const extractInvoiceId = (event: any): string => {
		const idArg = event.contract_call?.function_args?.find((arg: any) => arg.name === 'invoice-id');
		return idArg?.repr?.slice(1) || '';
	};

	const getStatusColor = (status: InvoiceEvent['status']) => {
		switch (status) {
			case 'confirmed':
				return 'bg-green-500 text-white';
			case 'pending':
				return 'bg-yellow-500 text-white';
			case 'failed':
				return 'bg-red-500 text-white';
			default:
				return 'bg-gray-500 text-white';
		}
	};

	const getEventIcon = (type: InvoiceEvent['type']) => {
		switch (type) {
			case 'created':
				return '📝';
			case 'funded':
				return '💰';
			case 'released':
				return '✅';
			case 'disputed':
				return '⚠️';
			default:
				return '📄';
		}
	};

	const refresh = () => {
		hiroAPI.disconnect();
		setInvoiceEvents([]);
		setConnectionStatus('connecting');
		initializeHiroMonitoring();
	};

	const network = import.meta.env.VITE_NETWORK || 'testnet';

	return (
		<div className="space-y-4">
			{/* Connection Status */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Activity className="w-5 h-5" />
							Real-time Blockchain Monitor
						</div>
						<div className="flex items-center gap-2">
							<Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
								{connectionStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}
							</Badge>
							<Button size="sm" variant="outline" onClick={refresh}>
								<RefreshCw className="w-4 h-4" />
							</Button>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 gap-4">
						<div>
							<p className="text-sm text-muted-foreground">Network</p>
							<p className="font-semibold capitalize">{network}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Events Tracked</p>
							<p className="font-semibold">{invoiceEvents.length}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">WebSocket</p>
							<p className="font-semibold">{connectionStatus === 'connected' ? 'Active' : 'Inactive'}</p>
						</div>
					</div>
					{discordEnabled && (
						<div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2">
							<MessageSquare className="w-4 h-4 text-purple-600" />
							<span className="text-sm font-medium text-purple-900">
								Discord notifications enabled - DAO will be notified of all events
							</span>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Live Events Stream */}
			<Card>
				<CardHeader>
					<CardTitle>Live Transaction Feed</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2 max-h-96 overflow-y-auto">
						{invoiceEvents.length === 0 ? (
							<div className="text-center py-8">
								<Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground animate-pulse" />
								<p className="text-muted-foreground">Waiting for blockchain events...</p>
								<p className="text-sm text-muted-foreground mt-2">
									Create an invoice to see real-time updates
								</p>
							</div>
						) : (
							invoiceEvents.map((event) => (
								<div
									key={event.id}
									className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
								>
									<div className="flex items-center gap-3">
										<span className="text-2xl">{getEventIcon(event.type)}</span>
										<div>
											<p className="font-medium capitalize">{event.type} Event</p>
											<p className="text-sm text-muted-foreground">
												{event.timestamp.toLocaleTimeString()} • {event.amount}
												{event.invoiceId && ` • Invoice #${event.invoiceId}`}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Badge className={getStatusColor(event.status)}>{event.status}</Badge>
										{event.txId !== '0x0' && (
											<a
												href={`https://explorer.stacks.co/txid/${event.txId}?chain=${network}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-500 hover:underline text-sm flex items-center gap-1"
											>
												<ExternalLink className="w-3 h-3" />
												View TX
											</a>
										)}
									</div>
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>

			{/* Quick Stats */}
			<div className="grid md:grid-cols-4 gap-4">
				{[
					{
						label: 'Created',
						count: invoiceEvents.filter((e) => e.type === 'created').length,
						icon: '📝',
					},
					{ label: 'Funded', count: invoiceEvents.filter((e) => e.type === 'funded').length, icon: '💰' },
					{
						label: 'Released',
						count: invoiceEvents.filter((e) => e.type === 'released').length,
						icon: '✅',
					},
					{
						label: 'Disputed',
						count: invoiceEvents.filter((e) => e.type === 'disputed').length,
						icon: '⚠️',
					},
				].map((stat) => (
					<Card key={stat.label}>
						<CardContent className="pt-6">
							<div className="text-center">
								<div className="text-3xl mb-2">{stat.icon}</div>
								<p className="text-2xl font-bold">{stat.count}</p>
								<p className="text-sm text-muted-foreground">{stat.label}</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

