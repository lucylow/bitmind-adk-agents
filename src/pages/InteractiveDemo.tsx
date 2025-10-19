import React, { useState } from 'react';
import NavigationBar from '@/components/NavigationBar';
import { InvoiceSimulator } from '@/components/demo/InvoiceSimulator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { demoLoader, validateDemoAddresses, formatSatoshis } from '@/lib/demoLoader';
import { DemoInvoice, BlockchainEvent, AITestCase } from '@/types/demo.types';
import {
	Sparkles,
	Database,
	Activity,
	Shield,
	TrendingUp,
	Users,
	FileText,
	CheckCircle,
	AlertTriangle,
} from 'lucide-react';
import { parseInvoiceOptimized } from '@/lib/cache';
import { useToast } from '@/hooks/use-toast';

const InteractiveDemo: React.FC = () => {
	const { toast } = useToast();
	const [selectedInvoice, setSelectedInvoice] = useState<DemoInvoice | null>(null);
	const [simulatedEvents, setSimulatedEvents] = useState<BlockchainEvent[]>([]);
	const [aiTestResults, setAiTestResults] = useState<any>(null);
	const [testing, setTesting] = useState(false);

	const stats = demoLoader.getInvoiceStats();
	const milestoneStats = demoLoader.getMilestoneStats();
	const validation = validateDemoAddresses();

	const testAIParsing = async (testCase: AITestCase) => {
		setTesting(true);
		try {
			const result = await parseInvoiceOptimized(testCase.text);
			setAiTestResults({
				testId: testCase.id,
				description: testCase.description,
				extracted: result,
				expected: testCase.expected_extraction,
				success: true,
			});
			toast({
				title: '🤖 AI Parsing Complete',
				description: `Confidence: ${Math.round((result.confidence_score || 0) * 100)}%`,
			});
		} catch (error) {
			setAiTestResults({
				testId: testCase.id,
				error: error,
				success: false,
			});
			toast({
				title: '❌ Parsing Failed',
				description: 'AI parsing encountered an error',
				variant: 'destructive',
			});
		} finally {
			setTesting(false);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<NavigationBar />
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold mb-4">🎮 Interactive Demo Playground</h1>
					<p className="text-muted-foreground text-lg mb-6">
						Explore BitMind's full capabilities with production-grade demo data and interactive simulations
					</p>

					{/* Quick Stats */}
					<div className="grid md:grid-cols-5 gap-4">
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
									<p className="text-2xl font-bold">{stats.total}</p>
									<p className="text-sm text-muted-foreground">Demo Invoices</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
									<p className="text-2xl font-bold">{stats.active}</p>
									<p className="text-sm text-muted-foreground">Active</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
									<p className="text-2xl font-bold">{stats.disputed}</p>
									<p className="text-sm text-muted-foreground">Disputed</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
									<p className="text-2xl font-bold">{formatSatoshis(stats.totalValue)}</p>
									<p className="text-sm text-muted-foreground">Total Value</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<Sparkles className="w-8 h-8 mx-auto mb-2 text-orange-600" />
									<p className="text-2xl font-bold">{Math.round(stats.averageConfidence * 100)}%</p>
									<p className="text-sm text-muted-foreground">AI Confidence</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Main Tabs */}
				<Tabs defaultValue="simulator" className="space-y-6">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="simulator">Invoice Simulator</TabsTrigger>
						<TabsTrigger value="ai">AI Testing</TabsTrigger>
						<TabsTrigger value="security">Security</TabsTrigger>
						<TabsTrigger value="governance">Governance</TabsTrigger>
					</TabsList>

					{/* Invoice Simulator Tab */}
					<TabsContent value="simulator" className="space-y-6">
						<InvoiceSimulator
							onInvoiceSelect={setSelectedInvoice}
							onEventSimulate={(event) => setSimulatedEvents((prev) => [event, ...prev])}
						/>

						{/* Simulated Events Log */}
						{simulatedEvents.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle>Simulated Events Log</CardTitle>
									<CardDescription>Events you've simulated in this session</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{simulatedEvents.slice(0, 10).map((event) => (
											<div key={event.event_id} className="p-3 bg-secondary rounded-lg">
												<div className="flex justify-between items-start">
													<div>
														<p className="font-semibold text-sm">
															{event.event_type.replace('_', ' ').toUpperCase()}
														</p>
														<p className="text-xs text-muted-foreground">Invoice: {event.invoice_id}</p>
													</div>
													<Badge variant="outline">{new Date(event.timestamp).toLocaleTimeString()}</Badge>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					{/* AI Testing Tab */}
					<TabsContent value="ai" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Sparkles className="w-6 h-6" />
									AI Invoice Parsing Test Cases
								</CardTitle>
								<CardDescription>Test AI parsing with different invoice formats and complexity levels</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{demoLoader.getAITestCases().map((testCase) => (
										<div key={testCase.id} className="p-4 border rounded-lg">
											<div className="flex justify-between items-start mb-3">
												<div>
													<h4 className="font-semibold">{testCase.id.replace('_', ' ').toUpperCase()}</h4>
													<p className="text-sm text-muted-foreground">{testCase.description}</p>
												</div>
												<Button size="sm" onClick={() => testAIParsing(testCase)} disabled={testing}>
													<Sparkles className="w-4 h-4 mr-2" />
													Test Parse
												</Button>
											</div>
											<div className="bg-secondary p-3 rounded text-sm font-mono whitespace-pre-wrap">
												{testCase.text.substring(0, 200)}...
											</div>
										</div>
									))}
								</div>

								{aiTestResults && (
									<div className={`mt-4 p-4 rounded-lg ${aiTestResults.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
										<h4 className="font-semibold mb-2">
											{aiTestResults.success ? '✅ Parsing Successful' : '❌ Parsing Failed'}
										</h4>
										<div className="text-sm space-y-1">
											<p>Test: {aiTestResults.description}</p>
											{aiTestResults.success && (
												<>
													<p>Confidence: {Math.round((aiTestResults.extracted?.confidence_score || 0) * 100)}%</p>
													<p>Extracted Fields: {Object.keys(aiTestResults.extracted || {}).length}</p>
												</>
											)}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Security Tab */}
					<TabsContent value="security" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Shield className="w-6 h-6" />
									Security & Risk Assessment
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{/* Validation Status */}
									<div className={`p-4 rounded-lg ${validation.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
										<div className="flex items-center gap-2 mb-2">
											{validation.valid ? (
												<CheckCircle className="w-5 h-5 text-green-600" />
											) : (
												<AlertTriangle className="w-5 h-5 text-red-600" />
											)}
											<h4 className="font-semibold">
												Address Validation: {validation.valid ? 'All Valid' : 'Issues Found'}
											</h4>
										</div>
										{validation.errors.length > 0 && (
											<ul className="text-sm space-y-1">
												{validation.errors.map((error, i) => (
													<li key={i} className="text-red-700">
														• {error}
													</li>
												))}
											</ul>
										)}
									</div>

									{/* Screened Entities */}
									<div>
										<h4 className="font-semibold mb-3">Screened Entities</h4>
										<div className="space-y-2">
											{demoLoader.data.security_data.screened_entities.map((entity) => (
												<div key={entity.address} className="p-3 border rounded-lg">
													<div className="flex justify-between items-start mb-2">
														<code className="text-xs">{entity.address}</code>
														<Badge
															variant={
																entity.trust_level === 'high'
																	? 'default'
																	: entity.trust_level === 'medium'
																		? 'secondary'
																		: 'destructive'
															}
														>
															{entity.trust_level}
														</Badge>
													</div>
													<div className="grid grid-cols-3 gap-2 text-xs">
														<div>
															<p className="text-muted-foreground">Risk Score</p>
															<p className="font-semibold">{entity.risk_score}/10</p>
														</div>
														<div>
															<p className="text-muted-foreground">Completed</p>
															<p className="font-semibold">{entity.completed_invoices}</p>
														</div>
														<div>
															<p className="text-muted-foreground">Dispute Rate</p>
															<p className="font-semibold">{(entity.dispute_rate * 100).toFixed(1)}%</p>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>

									{/* Blacklisted Addresses */}
									<div>
										<h4 className="font-semibold mb-3 flex items-center gap-2">
											<AlertTriangle className="w-5 h-5 text-red-600" />
											Blacklisted Addresses
										</h4>
										<div className="space-y-2">
											{demoLoader.data.security_data.blacklisted_addresses.map((address) => (
												<div key={address} className="p-2 bg-red-50 border border-red-200 rounded">
													<code className="text-xs text-red-800">{address}</code>
												</div>
											))}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Governance Tab */}
					<TabsContent value="governance" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="w-6 h-6" />
									DAO Governance & Batch Approvals
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{demoLoader.getBatchApprovals().map((batch) => (
										<div key={batch.batch_id} className="p-4 border-2 border-blue-200 rounded-lg">
											<div className="flex justify-between items-start mb-3">
												<div>
													<h4 className="font-semibold">{batch.batch_id}</h4>
													<p className="text-sm text-muted-foreground">{batch.description}</p>
												</div>
												<Badge variant="default" className="bg-green-600">
													{batch.status}
												</Badge>
											</div>

											<div className="grid md:grid-cols-2 gap-4 mb-4">
												<div>
													<p className="text-sm text-muted-foreground">Total Amount</p>
													<p className="font-semibold">{formatSatoshis(batch.total_amount)}</p>
												</div>
												<div>
													<p className="text-sm text-muted-foreground">Approval Threshold</p>
													<p className="font-semibold">
														{batch.approvals.filter((a) => a.approved).length} / {batch.approval_threshold}
													</p>
												</div>
											</div>

											<div className="space-y-2">
												<h5 className="font-semibold text-sm">Approvals:</h5>
												{batch.approvals.map((approval, i) => (
													<div
														key={i}
														className={`p-2 rounded text-sm ${approval.approved ? 'bg-green-50' : 'bg-orange-50'}`}
													>
														<div className="flex justify-between items-center">
															<code className="text-xs">{approval.org.substring(0, 20)}...</code>
															<Badge variant={approval.approved ? 'default' : 'outline'}>
																{approval.approved ? '✅ Approved' : '⏳ Pending'}
															</Badge>
														</div>
														{approval.reason && (
															<p className="text-xs text-muted-foreground mt-1">{approval.reason}</p>
														)}
													</div>
												))}
											</div>

											<div className="mt-3 pt-3 border-t">
												<p className="text-xs text-muted-foreground">
													Executed: {new Date(batch.executed_at).toLocaleString()}
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Milestone Statistics */}
						<Card>
							<CardHeader>
								<CardTitle>Milestone Performance</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid md:grid-cols-3 gap-4">
									<div className="p-4 bg-green-50 rounded-lg">
										<p className="text-sm text-muted-foreground mb-1">Completed</p>
										<p className="text-2xl font-bold text-green-600">{milestoneStats.completed}</p>
										<p className="text-xs text-muted-foreground">
											{Math.round((milestoneStats.completed / milestoneStats.total) * 100)}% completion rate
										</p>
									</div>
									<div className="p-4 bg-blue-50 rounded-lg">
										<p className="text-sm text-muted-foreground mb-1">In Progress</p>
										<p className="text-2xl font-bold text-blue-600">{milestoneStats.in_progress}</p>
										<p className="text-xs text-muted-foreground">Currently active</p>
									</div>
									<div className="p-4 bg-orange-50 rounded-lg">
										<p className="text-sm text-muted-foreground mb-1">Pending</p>
										<p className="text-2xl font-bold text-orange-600">{milestoneStats.pending}</p>
										<p className="text-xs text-muted-foreground">Awaiting start</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Demo Data Info */}
				<Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Database className="w-6 h-6" />
							Demo Data Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-3 gap-4">
							<div>
								<h4 className="font-semibold mb-2">📊 Data Version</h4>
								<p className="text-sm text-muted-foreground">v{demoLoader.data.version}</p>
								<p className="text-xs text-muted-foreground">Updated: {demoLoader.data.last_updated}</p>
							</div>
							<div>
								<h4 className="font-semibold mb-2">🔍 Test Cases</h4>
								<p className="text-sm text-muted-foreground">{demoLoader.getAITestCases().length} AI parsing scenarios</p>
								<p className="text-xs text-muted-foreground">Standard, minimal, and complex formats</p>
							</div>
							<div>
								<h4 className="font-semibold mb-2">🏛️ Demo Wallets</h4>
								<p className="text-sm text-muted-foreground">{demoLoader.getDemoWallets().length} configured wallets</p>
								<p className="text-xs text-muted-foreground">Payer, Payee, and Arbiter roles</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default InteractiveDemo;



