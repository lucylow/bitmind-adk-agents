import React, { useState, useEffect } from 'react';
import { demoLoader, formatSatoshis, getMilestoneProgress } from '@/lib/demoLoader';
import { DemoInvoice, BlockchainEvent } from '@/types/demo.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { discordNotifications } from '@/lib/discord/discordNotificationService';
import { useToast } from '@/hooks/use-toast';

interface InvoiceSimulatorProps {
	onInvoiceSelect?: (invoice: DemoInvoice) => void;
	onEventSimulate?: (event: BlockchainEvent) => void;
}

export const InvoiceSimulator: React.FC<InvoiceSimulatorProps> = ({ onInvoiceSelect, onEventSimulate }) => {
	const [invoices, setInvoices] = useState<DemoInvoice[]>([]);
	const [selectedInvoice, setSelectedInvoice] = useState<DemoInvoice | null>(null);
	const [events, setEvents] = useState<BlockchainEvent[]>([]);
	const [simulating, setSimulating] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		setInvoices(demoLoader.getAllInvoices());
	}, []);

	const handleInvoiceSelect = (invoice: DemoInvoice) => {
		setSelectedInvoice(invoice);
		setEvents(demoLoader.getEventsForInvoice(invoice.invoice_id));
		onInvoiceSelect?.(invoice);
	};

	const simulateMilestoneComplete = async () => {
		if (!selectedInvoice) return;
		setSimulating(true);

		const nextMilestone = selectedInvoice.milestones.find((m) => m.status === 'in_progress' || m.status === 'pending');

		if (!nextMilestone) {
			toast({
				title: '⚠️ No Pending Milestones',
				description: 'All milestones are already completed or blocked',
				variant: 'destructive',
			});
			setSimulating(false);
			return;
		}

		const event = demoLoader.simulateNewEvent(selectedInvoice.invoice_id, 'milestone_completed', {
			milestone_title: nextMilestone.title,
			amount_released: nextMilestone.amount,
			milestone_index: selectedInvoice.milestones.indexOf(nextMilestone) + 1,
		});

		setEvents((prev) => [...prev, event]);
		onEventSimulate?.(event);

		// Send Discord notification
		await discordNotifications.notifyMilestoneComplete(
			{
				id: selectedInvoice.invoice_id,
				amount: formatSatoshis(selectedInvoice.amount),
				dao: selectedInvoice.description.split('-')[0].trim(),
			},
			{
				description: nextMilestone.title,
				amount: formatSatoshis(nextMilestone.amount),
				progress: getMilestoneProgress(selectedInvoice),
			}
		);

		toast({
			title: '✅ Milestone Completed!',
			description: `${nextMilestone.title} marked as complete`,
		});

		setTimeout(() => setSimulating(false), 1000);
	};

	const simulateDispute = async () => {
		if (!selectedInvoice) return;
		setSimulating(true);

		const event = demoLoader.simulateNewEvent(selectedInvoice.invoice_id, 'dispute_raised', {
			raised_by: 'payer',
			reason: 'Quality issues with delivered work',
		});

		setEvents((prev) => [...prev, event]);
		onEventSimulate?.(event);

		// Send Discord notification
		await discordNotifications.notifyDispute(
			{
				id: selectedInvoice.invoice_id,
				amount: formatSatoshis(selectedInvoice.amount),
				dao: selectedInvoice.description.split('-')[0].trim(),
				arbiter: selectedInvoice.arbiter,
			},
			'Quality issues with delivered work'
		);

		toast({
			title: '⚠️ Dispute Raised',
			description: 'Dispute has been filed for this invoice',
			variant: 'destructive',
		});

		setTimeout(() => setSimulating(false), 1000);
	};

	const simulateFunding = async () => {
		if (!selectedInvoice) return;
		setSimulating(true);

		const event = demoLoader.simulateNewEvent(selectedInvoice.invoice_id, 'escrow_funded', {
			amount: selectedInvoice.amount,
			token_contract: selectedInvoice.token_contract,
		});

		setEvents((prev) => [...prev, event]);
		onEventSimulate?.(event);

		// Send Discord notification
		await discordNotifications.notifyInvoiceFunded({
			id: selectedInvoice.invoice_id,
			amount: formatSatoshis(selectedInvoice.amount),
			dao: selectedInvoice.description.split('-')[0].trim(),
			txId: event.tx_id,
		});

		toast({
			title: '💰 Escrow Funded!',
			description: `${formatSatoshis(selectedInvoice.amount)} deposited`,
		});

		setTimeout(() => setSimulating(false), 1000);
	};

	const simulateRelease = async () => {
		if (!selectedInvoice) return;
		setSimulating(true);

		const event = demoLoader.simulateNewEvent(selectedInvoice.invoice_id, 'payment_released', {
			amount: selectedInvoice.amount,
			recipient: selectedInvoice.payee,
		});

		setEvents((prev) => [...prev, event]);
		onEventSimulate?.(event);

		// Send Discord notification
		await discordNotifications.notifyPaymentReleased({
			id: selectedInvoice.invoice_id,
			amount: formatSatoshis(selectedInvoice.amount),
			dao: selectedInvoice.description.split('-')[0].trim(),
			payee: selectedInvoice.payee,
			txId: event.tx_id,
		});

		toast({
			title: '🎉 Payment Released!',
			description: 'Funds transferred to contractor',
		});

		setTimeout(() => setSimulating(false), 1000);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800';
			case 'disputed':
				return 'bg-red-100 text-red-800';
			case 'completed':
				return 'bg-blue-100 text-blue-800';
			case 'funded':
				return 'bg-purple-100 text-purple-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getEventIcon = (eventType: string) => {
		switch (eventType) {
			case 'invoice_created':
				return '📝';
			case 'escrow_funded':
				return '💰';
			case 'milestone_completed':
				return '🎯';
			case 'payment_released':
				return '✅';
			case 'dispute_raised':
				return '⚠️';
			default:
				return '📄';
		}
	};

	return (
		<Card className="border-2 border-blue-200">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileText className="w-6 h-6" />
					Demo Invoice Simulator
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid md:grid-cols-2 gap-6">
					{/* Invoice Selection */}
					<div>
						<h4 className="font-semibold mb-3">Select Invoice</h4>
						<div className="space-y-2 max-h-96 overflow-y-auto">
							{invoices.map((invoice) => (
								<div
									key={invoice.invoice_id}
									className={`p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors ${
										selectedInvoice?.invoice_id === invoice.invoice_id
											? 'border-blue-500 bg-blue-50'
											: 'border-gray-200'
									}`}
									onClick={() => handleInvoiceSelect(invoice)}
								>
									<div className="flex justify-between items-start mb-2">
										<span className="font-semibold">{invoice.invoice_id}</span>
										<Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
									</div>
									<p className="text-sm text-muted-foreground mb-1">{invoice.description.substring(0, 50)}...</p>
									<div className="flex justify-between items-center mt-2">
										<span className="text-sm font-medium">{formatSatoshis(invoice.amount)}</span>
										<span className="text-xs text-muted-foreground">
											{invoice.milestones.filter((m) => m.status === 'completed').length}/{invoice.milestones.length}{' '}
											milestones
										</span>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Event Simulation */}
					<div>
						<h4 className="font-semibold mb-3">Simulate Events</h4>
						{selectedInvoice ? (
							<div className="space-y-4">
								{/* Invoice Details */}
								<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
									<p className="text-sm font-semibold mb-2">Selected: {selectedInvoice.invoice_id}</p>
									<p className="text-xs text-muted-foreground mb-1">
										Amount: {formatSatoshis(selectedInvoice.amount)}
									</p>
									<p className="text-xs text-muted-foreground">
										Progress: {getMilestoneProgress(selectedInvoice)}%
									</p>
								</div>

								{/* Action Buttons */}
								<div className="grid grid-cols-2 gap-2">
									<Button onClick={simulateFunding} disabled={simulating} variant="outline" className="w-full">
										<Zap className="w-4 h-4 mr-2" />
										Fund Escrow
									</Button>
									<Button onClick={simulateMilestoneComplete} disabled={simulating} variant="outline" className="w-full">
										<CheckCircle className="w-4 h-4 mr-2" />
										Complete Milestone
									</Button>
									<Button onClick={simulateRelease} disabled={simulating} variant="outline" className="w-full">
										<CheckCircle className="w-4 h-4 mr-2" />
										Release Payment
									</Button>
									<Button onClick={simulateDispute} disabled={simulating} variant="destructive" className="w-full">
										<AlertTriangle className="w-4 h-4 mr-2" />
										Raise Dispute
									</Button>
								</div>

								{/* Recent Events */}
								<div>
									<h5 className="font-semibold mb-2 text-sm">Recent Events</h5>
									<div className="space-y-2 max-h-48 overflow-y-auto">
										{events.length === 0 ? (
											<p className="text-sm text-muted-foreground text-center py-4">
												No events yet. Simulate some!
											</p>
										) : (
											events.map((event) => (
												<div key={event.event_id} className="text-xs p-3 bg-secondary rounded-lg">
													<div className="flex justify-between items-start mb-1">
														<span className="font-semibold flex items-center gap-1">
															<span>{getEventIcon(event.event_type)}</span>
															{event.event_type.replace('_', ' ')}
														</span>
														<span className="text-muted-foreground">
															{new Date(event.timestamp).toLocaleTimeString()}
														</span>
													</div>
													<div className="text-muted-foreground font-mono">
														TX: {event.tx_id.substring(0, 20)}...
													</div>
													<div className="text-muted-foreground">Block: {event.block_height}</div>
												</div>
											))
										)}
									</div>
								</div>
							</div>
						) : (
							<div className="text-center py-12 text-muted-foreground">
								<FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
								<p>Select an invoice to simulate events</p>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};



