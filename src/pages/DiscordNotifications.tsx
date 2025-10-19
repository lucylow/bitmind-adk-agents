import React, { useState } from 'react';
import NavigationBar from '@/components/NavigationBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { discordNotifications } from '@/lib/discord/discordNotificationService';
import { MessageSquare, Send, CheckCircle, XCircle, Bell, AlertTriangle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DiscordNotifications: React.FC = () => {
	const { toast } = useToast();
	const [testing, setTesting] = useState(false);
	const [testInvoiceId, setTestInvoiceId] = useState('DEMO-001');
	const [testAmount, setTestAmount] = useState('0.5 sBTC');
	const [testDAO, setTestDAO] = useState('Demo DAO');
	const [testDescription, setTestDescription] = useState('Test invoice for Discord notifications');

	const isEnabled = discordNotifications.isEnabled();

	const sendTestNotification = async (type: string) => {
		setTesting(true);
		try {
			let result;
			const testData = {
				id: testInvoiceId,
				invoice_id: testInvoiceId,
				amount: testAmount,
				dao: testDAO,
				description: testDescription,
				payee: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
				arbiter: 'SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159',
				txId: '0x1234567890abcdef',
			};

			switch (type) {
				case 'test':
					result = await discordNotifications.testConnection();
					break;
				case 'created':
					result = await discordNotifications.notifyInvoiceCreated(testData);
					break;
				case 'funded':
					result = await discordNotifications.notifyInvoiceFunded(testData);
					break;
				case 'released':
					result = await discordNotifications.notifyPaymentReleased(testData);
					break;
				case 'disputed':
					result = await discordNotifications.notifyDispute(testData, 'Work not completed as specified');
					break;
				case 'milestone':
					result = await discordNotifications.notifyMilestoneComplete(testData, {
						description: 'Phase 1 Development',
						amount: '0.2 sBTC',
						progress: 33,
					});
					break;
				case 'ai':
					result = await discordNotifications.notifyAIParsing(testData, {
						confidence: 95,
						fieldsExtracted: 12,
						processingTime: '1.8s',
					});
					break;
				case 'summary':
					result = await discordNotifications.sendDailySummary({
						created: 15,
						completed: 12,
						disputes: 1,
						totalFunded: '8.5 sBTC',
						totalVolume: '12.3 sBTC',
						activeDaos: 8,
					});
					break;
			}

			if (result?.success) {
				toast({
					title: '✅ Notification Sent!',
					description: `Check your Discord channel for the ${type} notification`,
				});
			} else {
				toast({
					title: '❌ Failed to Send',
					description: result?.reason || 'Discord webhook not configured or failed',
					variant: 'destructive',
				});
			}
		} catch (error) {
			toast({
				title: '❌ Error',
				description: 'Failed to send Discord notification',
				variant: 'destructive',
			});
		} finally {
			setTesting(false);
		}
	};

	const notificationTypes = [
		{
			id: 'test',
			title: '🧪 Test Connection',
			description: 'Send a test message to verify webhook configuration',
			color: 'bg-blue-500',
			icon: <MessageSquare className="w-5 h-5" />,
		},
		{
			id: 'created',
			title: '📝 Invoice Created',
			description: 'Notify when a new invoice is created',
			color: 'bg-indigo-500',
			icon: <Bell className="w-5 h-5" />,
		},
		{
			id: 'funded',
			title: '💰 Invoice Funded',
			description: 'Notify when escrow is funded',
			color: 'bg-purple-500',
			icon: <TrendingUp className="w-5 h-5" />,
		},
		{
			id: 'released',
			title: '✅ Payment Released',
			description: 'Notify when payment is released to contractor',
			color: 'bg-green-500',
			icon: <CheckCircle className="w-5 h-5" />,
		},
		{
			id: 'disputed',
			title: '⚠️ Dispute Raised',
			description: 'Alert when a dispute is raised',
			color: 'bg-red-500',
			icon: <AlertTriangle className="w-5 h-5" />,
		},
		{
			id: 'milestone',
			title: '🎯 Milestone Complete',
			description: 'Notify milestone completion',
			color: 'bg-cyan-500',
			icon: <CheckCircle className="w-5 h-5" />,
		},
		{
			id: 'ai',
			title: '🤖 AI Parsing',
			description: 'Notify when AI parses an invoice',
			color: 'bg-orange-500',
			icon: <Send className="w-5 h-5" />,
		},
		{
			id: 'summary',
			title: '📊 Daily Summary',
			description: 'Send daily activity report',
			color: 'bg-teal-500',
			icon: <TrendingUp className="w-5 h-5" />,
		},
	];

	return (
		<div className="min-h-screen bg-background">
			<NavigationBar />
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold mb-4">Discord DAO Notifications</h1>
					<p className="text-muted-foreground text-lg mb-4">
						Keep your DAO community informed with real-time Discord notifications for all invoice events
					</p>

					<div className="flex items-center gap-3">
						<Badge variant={isEnabled ? 'default' : 'destructive'} className="text-sm py-2 px-4">
							{isEnabled ? (
								<>
									<CheckCircle className="w-4 h-4 mr-2" />
									Webhook Configured
								</>
							) : (
								<>
									<XCircle className="w-4 h-4 mr-2" />
									Webhook Not Configured
								</>
							)}
						</Badge>
						{!isEnabled && (
							<p className="text-sm text-orange-600">
								Add VITE_DISCORD_WEBHOOK_URL to .env.local to enable notifications
							</p>
						)}
					</div>
				</div>

				{/* Test Data Configuration */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Test Configuration</CardTitle>
						<CardDescription>Customize the test data for demo notifications</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<Label>Invoice ID</Label>
								<Input value={testInvoiceId} onChange={(e) => setTestInvoiceId(e.target.value)} />
							</div>
							<div>
								<Label>Amount</Label>
								<Input value={testAmount} onChange={(e) => setTestAmount(e.target.value)} />
							</div>
							<div>
								<Label>DAO Name</Label>
								<Input value={testDAO} onChange={(e) => setTestDAO(e.target.value)} />
							</div>
							<div>
								<Label>Description</Label>
								<Input value={testDescription} onChange={(e) => setTestDescription(e.target.value)} />
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Notification Types */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					{notificationTypes.map((type) => (
						<Card key={type.id} className="hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center text-white mb-3`}>
									{type.icon}
								</div>
								<CardTitle className="text-lg">{type.title}</CardTitle>
								<CardDescription className="text-sm">{type.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<Button
									onClick={() => sendTestNotification(type.id)}
									disabled={!isEnabled || testing}
									className="w-full"
									variant="outline"
								>
									<Send className="w-4 h-4 mr-2" />
									{testing ? 'Sending...' : 'Send Test'}
								</Button>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Features Overview */}
				<Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50">
					<CardHeader>
						<CardTitle>Discord Integration Features</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<h3 className="font-semibold mb-3">✨ Rich Embeds</h3>
								<ul className="text-sm space-y-2 text-muted-foreground">
									<li>• Color-coded by event type</li>
									<li>• Invoice details with formatting</li>
									<li>• Clickable blockchain explorer links</li>
									<li>• Timestamps and status indicators</li>
									<li>• Custom thumbnails and footers</li>
								</ul>
							</div>
							<div>
								<h3 className="font-semibold mb-3">🔔 Event Types</h3>
								<ul className="text-sm space-y-2 text-muted-foreground">
									<li>• Invoice creation (@here mention)</li>
									<li>• Escrow funding confirmations</li>
									<li>• Payment release notifications</li>
									<li>• Dispute alerts (@here mention)</li>
									<li>• Milestone completions</li>
									<li>• AI parsing results</li>
									<li>• Daily activity summaries</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Setup Instructions */}
				<Card>
					<CardHeader>
						<CardTitle>Setup Instructions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div>
								<h4 className="font-semibold mb-2">1. Create Discord Webhook</h4>
								<ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
									<li>Open your Discord server settings</li>
									<li>Go to Integrations → Webhooks</li>
									<li>Click "New Webhook"</li>
									<li>Name it "BitMind Notifications"</li>
									<li>Select the channel for notifications</li>
									<li>Copy the webhook URL</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold mb-2">2. Configure Environment Variable</h4>
								<p className="text-sm text-muted-foreground mb-2">
									Add to your <code className="bg-secondary px-2 py-1 rounded">.env.local</code> file:
								</p>
								<div className="bg-secondary p-3 rounded font-mono text-xs">
									VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
								</div>
							</div>
							<div>
								<h4 className="font-semibold mb-2">3. Restart Development Server</h4>
								<div className="bg-secondary p-3 rounded font-mono text-xs">npm run dev</div>
							</div>
							<div>
								<h4 className="font-semibold mb-2">4. Test Connection</h4>
								<p className="text-sm text-muted-foreground">
									Click "Send Test" on the Test Connection card above to verify your webhook works
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default DiscordNotifications;

