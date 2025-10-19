import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import NavigationBar from '@/components/NavigationBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { discordNotifications } from '@/lib/discord/discordNotificationService';
import { MessageSquare, Send, CheckCircle, XCircle, Bell, AlertTriangle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const DiscordNotifications = () => {
    const { toast } = useToast();
    const [testing, setTesting] = useState(false);
    const [testInvoiceId, setTestInvoiceId] = useState('DEMO-001');
    const [testAmount, setTestAmount] = useState('0.5 sBTC');
    const [testDAO, setTestDAO] = useState('Demo DAO');
    const [testDescription, setTestDescription] = useState('Test invoice for Discord notifications');
    const isEnabled = discordNotifications.isEnabled();
    const sendTestNotification = async (type) => {
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
            }
            else {
                toast({
                    title: '❌ Failed to Send',
                    description: result?.reason || 'Discord webhook not configured or failed',
                    variant: 'destructive',
                });
            }
        }
        catch (error) {
            toast({
                title: '❌ Error',
                description: 'Failed to send Discord notification',
                variant: 'destructive',
            });
        }
        finally {
            setTesting(false);
        }
    };
    const notificationTypes = [
        {
            id: 'test',
            title: '🧪 Test Connection',
            description: 'Send a test message to verify webhook configuration',
            color: 'bg-blue-500',
            icon: _jsx(MessageSquare, { className: "w-5 h-5" }),
        },
        {
            id: 'created',
            title: '📝 Invoice Created',
            description: 'Notify when a new invoice is created',
            color: 'bg-indigo-500',
            icon: _jsx(Bell, { className: "w-5 h-5" }),
        },
        {
            id: 'funded',
            title: '💰 Invoice Funded',
            description: 'Notify when escrow is funded',
            color: 'bg-purple-500',
            icon: _jsx(TrendingUp, { className: "w-5 h-5" }),
        },
        {
            id: 'released',
            title: '✅ Payment Released',
            description: 'Notify when payment is released to contractor',
            color: 'bg-green-500',
            icon: _jsx(CheckCircle, { className: "w-5 h-5" }),
        },
        {
            id: 'disputed',
            title: '⚠️ Dispute Raised',
            description: 'Alert when a dispute is raised',
            color: 'bg-red-500',
            icon: _jsx(AlertTriangle, { className: "w-5 h-5" }),
        },
        {
            id: 'milestone',
            title: '🎯 Milestone Complete',
            description: 'Notify milestone completion',
            color: 'bg-cyan-500',
            icon: _jsx(CheckCircle, { className: "w-5 h-5" }),
        },
        {
            id: 'ai',
            title: '🤖 AI Parsing',
            description: 'Notify when AI parses an invoice',
            color: 'bg-orange-500',
            icon: _jsx(Send, { className: "w-5 h-5" }),
        },
        {
            id: 'summary',
            title: '📊 Daily Summary',
            description: 'Send daily activity report',
            color: 'bg-teal-500',
            icon: _jsx(TrendingUp, { className: "w-5 h-5" }),
        },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx(NavigationBar, {}), _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold mb-4", children: "Discord DAO Notifications" }), _jsx("p", { className: "text-muted-foreground text-lg mb-4", children: "Keep your DAO community informed with real-time Discord notifications for all invoice events" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: isEnabled ? 'default' : 'destructive', className: "text-sm py-2 px-4", children: isEnabled ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Webhook Configured"] })) : (_jsxs(_Fragment, { children: [_jsx(XCircle, { className: "w-4 h-4 mr-2" }), "Webhook Not Configured"] })) }), !isEnabled && (_jsx("p", { className: "text-sm text-orange-600", children: "Add VITE_DISCORD_WEBHOOK_URL to .env.local to enable notifications" }))] })] }), _jsxs(Card, { className: "mb-8", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Test Configuration" }), _jsx(CardDescription, { children: "Customize the test data for demo notifications" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Invoice ID" }), _jsx(Input, { value: testInvoiceId, onChange: (e) => setTestInvoiceId(e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Amount" }), _jsx(Input, { value: testAmount, onChange: (e) => setTestAmount(e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "DAO Name" }), _jsx(Input, { value: testDAO, onChange: (e) => setTestDAO(e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Description" }), _jsx(Input, { value: testDescription, onChange: (e) => setTestDescription(e.target.value) })] })] }) })] }), _jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: notificationTypes.map((type) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsxs(CardHeader, { children: [_jsx("div", { className: `w-12 h-12 ${type.color} rounded-lg flex items-center justify-center text-white mb-3`, children: type.icon }), _jsx(CardTitle, { className: "text-lg", children: type.title }), _jsx(CardDescription, { className: "text-sm", children: type.description })] }), _jsx(CardContent, { children: _jsxs(Button, { onClick: () => sendTestNotification(type.id), disabled: !isEnabled || testing, className: "w-full", variant: "outline", children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), testing ? 'Sending...' : 'Send Test'] }) })] }, type.id))) }), _jsxs(Card, { className: "mb-8 bg-gradient-to-r from-purple-50 to-blue-50", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Discord Integration Features" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-3", children: "\u2728 Rich Embeds" }), _jsxs("ul", { className: "text-sm space-y-2 text-muted-foreground", children: [_jsx("li", { children: "\u2022 Color-coded by event type" }), _jsx("li", { children: "\u2022 Invoice details with formatting" }), _jsx("li", { children: "\u2022 Clickable blockchain explorer links" }), _jsx("li", { children: "\u2022 Timestamps and status indicators" }), _jsx("li", { children: "\u2022 Custom thumbnails and footers" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-3", children: "\uD83D\uDD14 Event Types" }), _jsxs("ul", { className: "text-sm space-y-2 text-muted-foreground", children: [_jsx("li", { children: "\u2022 Invoice creation (@here mention)" }), _jsx("li", { children: "\u2022 Escrow funding confirmations" }), _jsx("li", { children: "\u2022 Payment release notifications" }), _jsx("li", { children: "\u2022 Dispute alerts (@here mention)" }), _jsx("li", { children: "\u2022 Milestone completions" }), _jsx("li", { children: "\u2022 AI parsing results" }), _jsx("li", { children: "\u2022 Daily activity summaries" })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Setup Instructions" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "1. Create Discord Webhook" }), _jsxs("ul", { className: "text-sm space-y-1 text-muted-foreground list-disc list-inside", children: [_jsx("li", { children: "Open your Discord server settings" }), _jsx("li", { children: "Go to Integrations \u2192 Webhooks" }), _jsx("li", { children: "Click \"New Webhook\"" }), _jsx("li", { children: "Name it \"BitMind Notifications\"" }), _jsx("li", { children: "Select the channel for notifications" }), _jsx("li", { children: "Copy the webhook URL" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "2. Configure Environment Variable" }), _jsxs("p", { className: "text-sm text-muted-foreground mb-2", children: ["Add to your ", _jsx("code", { className: "bg-secondary px-2 py-1 rounded", children: ".env.local" }), " file:"] }), _jsx("div", { className: "bg-secondary p-3 rounded font-mono text-xs", children: "VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url" })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "3. Restart Development Server" }), _jsx("div", { className: "bg-secondary p-3 rounded font-mono text-xs", children: "npm run dev" })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "4. Test Connection" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Click \"Send Test\" on the Test Connection card above to verify your webhook works" })] })] }) })] })] })] }));
};
export default DiscordNotifications;
