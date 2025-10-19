import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { hiroAPI } from '@/lib/hiro/hiroAPI';
import { InvoiceBlockchainMonitor } from '@/lib/hiro/invoiceMonitoring';
import { discordNotifications } from '@/lib/discord/discordNotificationService';
import { Activity, ExternalLink, RefreshCw, MessageSquare } from 'lucide-react';
export function RealtimeInvoiceDashboard() {
    const [invoiceEvents, setInvoiceEvents] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [monitor, setMonitor] = useState(null);
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
            await hiroAPI.subscribeToInvoiceTransactions(contractAddress, async (event) => {
                const newEvent = {
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
            await hiroAPI.subscribeMempoolTransactions((tx) => {
                const newEvent = {
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
        }
        catch (error) {
            console.error('Failed to initialize Hiro monitoring:', error);
            setConnectionStatus('disconnected');
        }
    };
    const determineEventType = (event) => {
        const functionName = event.contract_call?.function_name;
        if (functionName === 'create-invoice' || functionName === 'create-invoice-secure')
            return 'created';
        if (functionName === 'ack-deposit')
            return 'funded';
        if (functionName === 'release-funds' || functionName === 'release-funds-secure')
            return 'released';
        if (functionName === 'create-dispute')
            return 'disputed';
        return 'created';
    };
    const extractAmount = (event) => {
        const amountArg = event.contract_call?.function_args?.find((arg) => arg.name === 'amount');
        if (amountArg) {
            const amount = parseInt(amountArg.repr?.slice(1) || '0') / 100000000;
            return `${amount} sBTC`;
        }
        return '0 sBTC';
    };
    const extractInvoiceId = (event) => {
        const idArg = event.contract_call?.function_args?.find((arg) => arg.name === 'invoice-id');
        return idArg?.repr?.slice(1) || '';
    };
    const getStatusColor = (status) => {
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
    const getEventIcon = (type) => {
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
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "w-5 h-5" }), "Real-time Blockchain Monitor"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: connectionStatus === 'connected' ? 'default' : 'destructive', children: connectionStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected' }), _jsx(Button, { size: "sm", variant: "outline", onClick: refresh, children: _jsx(RefreshCw, { className: "w-4 h-4" }) })] })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Network" }), _jsx("p", { className: "font-semibold capitalize", children: network })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Events Tracked" }), _jsx("p", { className: "font-semibold", children: invoiceEvents.length })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "WebSocket" }), _jsx("p", { className: "font-semibold", children: connectionStatus === 'connected' ? 'Active' : 'Inactive' })] })] }), discordEnabled && (_jsxs("div", { className: "mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2", children: [_jsx(MessageSquare, { className: "w-4 h-4 text-purple-600" }), _jsx("span", { className: "text-sm font-medium text-purple-900", children: "Discord notifications enabled - DAO will be notified of all events" })] }))] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Live Transaction Feed" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: invoiceEvents.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(Activity, { className: "w-12 h-12 mx-auto mb-3 text-muted-foreground animate-pulse" }), _jsx("p", { className: "text-muted-foreground", children: "Waiting for blockchain events..." }), _jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Create an invoice to see real-time updates" })] })) : (invoiceEvents.map((event) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-2xl", children: getEventIcon(event.type) }), _jsxs("div", { children: [_jsxs("p", { className: "font-medium capitalize", children: [event.type, " Event"] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [event.timestamp.toLocaleTimeString(), " \u2022 ", event.amount, event.invoiceId && ` • Invoice #${event.invoiceId}`] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { className: getStatusColor(event.status), children: event.status }), event.txId !== '0x0' && (_jsxs("a", { href: `https://explorer.stacks.co/txid/${event.txId}?chain=${network}`, target: "_blank", rel: "noopener noreferrer", className: "text-blue-500 hover:underline text-sm flex items-center gap-1", children: [_jsx(ExternalLink, { className: "w-3 h-3" }), "View TX"] }))] })] }, event.id)))) }) })] }), _jsx("div", { className: "grid md:grid-cols-4 gap-4", children: [
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
                ].map((stat) => (_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl mb-2", children: stat.icon }), _jsx("p", { className: "text-2xl font-bold", children: stat.count }), _jsx("p", { className: "text-sm text-muted-foreground", children: stat.label })] }) }) }, stat.label))) })] }));
}
