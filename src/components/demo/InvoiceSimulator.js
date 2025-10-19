import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { demoLoader, formatSatoshis, getMilestoneProgress } from '@/lib/demoLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { discordNotifications } from '@/lib/discord/discordNotificationService';
import { useToast } from '@/hooks/use-toast';
export const InvoiceSimulator = ({ onInvoiceSelect, onEventSimulate }) => {
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [events, setEvents] = useState([]);
    const [simulating, setSimulating] = useState(false);
    const { toast } = useToast();
    useEffect(() => {
        setInvoices(demoLoader.getAllInvoices());
    }, []);
    const handleInvoiceSelect = (invoice) => {
        setSelectedInvoice(invoice);
        setEvents(demoLoader.getEventsForInvoice(invoice.invoice_id));
        onInvoiceSelect?.(invoice);
    };
    const simulateMilestoneComplete = async () => {
        if (!selectedInvoice)
            return;
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
        await discordNotifications.notifyMilestoneComplete({
            id: selectedInvoice.invoice_id,
            amount: formatSatoshis(selectedInvoice.amount),
            dao: selectedInvoice.description.split('-')[0].trim(),
        }, {
            description: nextMilestone.title,
            amount: formatSatoshis(nextMilestone.amount),
            progress: getMilestoneProgress(selectedInvoice),
        });
        toast({
            title: '✅ Milestone Completed!',
            description: `${nextMilestone.title} marked as complete`,
        });
        setTimeout(() => setSimulating(false), 1000);
    };
    const simulateDispute = async () => {
        if (!selectedInvoice)
            return;
        setSimulating(true);
        const event = demoLoader.simulateNewEvent(selectedInvoice.invoice_id, 'dispute_raised', {
            raised_by: 'payer',
            reason: 'Quality issues with delivered work',
        });
        setEvents((prev) => [...prev, event]);
        onEventSimulate?.(event);
        // Send Discord notification
        await discordNotifications.notifyDispute({
            id: selectedInvoice.invoice_id,
            amount: formatSatoshis(selectedInvoice.amount),
            dao: selectedInvoice.description.split('-')[0].trim(),
            arbiter: selectedInvoice.arbiter,
        }, 'Quality issues with delivered work');
        toast({
            title: '⚠️ Dispute Raised',
            description: 'Dispute has been filed for this invoice',
            variant: 'destructive',
        });
        setTimeout(() => setSimulating(false), 1000);
    };
    const simulateFunding = async () => {
        if (!selectedInvoice)
            return;
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
        if (!selectedInvoice)
            return;
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
    const getStatusColor = (status) => {
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
    const getEventIcon = (eventType) => {
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
    return (_jsxs(Card, { className: "border-2 border-blue-200", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-6 h-6" }), "Demo Invoice Simulator"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-3", children: "Select Invoice" }), _jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: invoices.map((invoice) => (_jsxs("div", { className: `p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors ${selectedInvoice?.invoice_id === invoice.invoice_id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200'}`, onClick: () => handleInvoiceSelect(invoice), children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("span", { className: "font-semibold", children: invoice.invoice_id }), _jsx(Badge, { className: getStatusColor(invoice.status), children: invoice.status })] }), _jsxs("p", { className: "text-sm text-muted-foreground mb-1", children: [invoice.description.substring(0, 50), "..."] }), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [_jsx("span", { className: "text-sm font-medium", children: formatSatoshis(invoice.amount) }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [invoice.milestones.filter((m) => m.status === 'completed').length, "/", invoice.milestones.length, ' ', "milestones"] })] })] }, invoice.invoice_id))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-3", children: "Simulate Events" }), selectedInvoice ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-4 bg-blue-50 rounded-lg border border-blue-200", children: [_jsxs("p", { className: "text-sm font-semibold mb-2", children: ["Selected: ", selectedInvoice.invoice_id] }), _jsxs("p", { className: "text-xs text-muted-foreground mb-1", children: ["Amount: ", formatSatoshis(selectedInvoice.amount)] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Progress: ", getMilestoneProgress(selectedInvoice), "%"] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs(Button, { onClick: simulateFunding, disabled: simulating, variant: "outline", className: "w-full", children: [_jsx(Zap, { className: "w-4 h-4 mr-2" }), "Fund Escrow"] }), _jsxs(Button, { onClick: simulateMilestoneComplete, disabled: simulating, variant: "outline", className: "w-full", children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Complete Milestone"] }), _jsxs(Button, { onClick: simulateRelease, disabled: simulating, variant: "outline", className: "w-full", children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Release Payment"] }), _jsxs(Button, { onClick: simulateDispute, disabled: simulating, variant: "destructive", className: "w-full", children: [_jsx(AlertTriangle, { className: "w-4 h-4 mr-2" }), "Raise Dispute"] })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-semibold mb-2 text-sm", children: "Recent Events" }), _jsx("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: events.length === 0 ? (_jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "No events yet. Simulate some!" })) : (events.map((event) => (_jsxs("div", { className: "text-xs p-3 bg-secondary rounded-lg", children: [_jsxs("div", { className: "flex justify-between items-start mb-1", children: [_jsxs("span", { className: "font-semibold flex items-center gap-1", children: [_jsx("span", { children: getEventIcon(event.event_type) }), event.event_type.replace('_', ' ')] }), _jsx("span", { className: "text-muted-foreground", children: new Date(event.timestamp).toLocaleTimeString() })] }), _jsxs("div", { className: "text-muted-foreground font-mono", children: ["TX: ", event.tx_id.substring(0, 20), "..."] }), _jsxs("div", { className: "text-muted-foreground", children: ["Block: ", event.block_height] })] }, event.event_id)))) })] })] })) : (_jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [_jsx(FileText, { className: "w-12 h-12 mx-auto mb-3 opacity-50" }), _jsx("p", { children: "Select an invoice to simulate events" })] }))] })] }) })] }));
};
