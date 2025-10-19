import React from 'react';
import NavigationBar from '@/components/NavigationBar';
import { RealtimeInvoiceDashboard } from '@/components/RealtimeInvoiceDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap, Shield } from 'lucide-react';

const RealtimeMonitor: React.FC = () => {
	return (
		<div className="min-h-screen bg-background">
			<NavigationBar />
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-4xl font-bold mb-4">Real-Time Blockchain Monitor</h1>
					<p className="text-muted-foreground text-lg mb-6">
						Live WebSocket integration with Hiro Stacks API for instant transaction tracking and invoice
						lifecycle monitoring
					</p>
				</div>

				{/* Features Overview */}
				<div className="grid md:grid-cols-3 gap-4 mb-8">
					<Card>
						<CardHeader>
							<Activity className="w-8 h-8 mb-2 text-blue-600" />
							<CardTitle>WebSocket Connection</CardTitle>
							<CardDescription>Real-time blockchain event streaming via Hiro API</CardDescription>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<Zap className="w-8 h-8 mb-2 text-orange-600" />
							<CardTitle>Instant Updates</CardTitle>
							<CardDescription>Sub-second latency for invoice status changes</CardDescription>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<Shield className="w-8 h-8 mb-2 text-green-600" />
							<CardTitle>Contract Monitoring</CardTitle>
							<CardDescription>Track escrow contract events and mempool transactions</CardDescription>
						</CardHeader>
					</Card>
				</div>

				{/* Real-time Dashboard */}
				<RealtimeInvoiceDashboard />

				{/* Technical Details */}
				<Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
					<CardHeader>
						<CardTitle>Technical Implementation</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<h3 className="font-semibold mb-2">📡 WebSocket Features</h3>
								<ul className="text-sm space-y-1 text-muted-foreground">
									<li>• Address transaction subscriptions</li>
									<li>• Contract call monitoring</li>
									<li>• Mempool transaction tracking</li>
									<li>• Automatic reconnection handling</li>
								</ul>
							</div>
							<div>
								<h3 className="font-semibold mb-2">🔍 Event Tracking</h3>
								<ul className="text-sm space-y-1 text-muted-foreground">
									<li>• Invoice creation (create-invoice)</li>
									<li>• Escrow funding (ack-deposit)</li>
									<li>• Payment release (release-funds)</li>
									<li>• Dispute creation (create-dispute)</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default RealtimeMonitor;

