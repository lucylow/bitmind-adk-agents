import { useEffect } from 'react';
import { discordNotifications } from '@/lib/discord/discordNotificationService';
export function useDiscordNotifications() {
    const isEnabled = discordNotifications.isEnabled();
    // Listen for browser events and send Discord notifications
    useEffect(() => {
        const handleInvoiceCreated = async (event) => {
            const customEvent = event;
            await discordNotifications.notifyInvoiceCreated({
                id: customEvent.detail.invoiceId,
                amount: customEvent.detail.amount || '0 sBTC',
                dao: customEvent.detail.dao || 'BitMind DAO',
            });
        };
        const handleInvoiceFunded = async (event) => {
            const customEvent = event;
            await discordNotifications.notifyInvoiceFunded({
                id: customEvent.detail.invoiceId,
                amount: customEvent.detail.amount || '0 sBTC',
                dao: customEvent.detail.dao || 'BitMind DAO',
                txId: customEvent.detail.txId,
            });
        };
        const handleInvoiceReleased = async (event) => {
            const customEvent = event;
            await discordNotifications.notifyPaymentReleased({
                id: customEvent.detail.invoiceId,
                amount: customEvent.detail.amount || '0 sBTC',
                dao: customEvent.detail.dao || 'BitMind DAO',
                txId: customEvent.detail.txId,
            });
        };
        const handleInvoiceDisputed = async (event) => {
            const customEvent = event;
            await discordNotifications.notifyDispute({
                id: customEvent.detail.invoiceId,
                amount: customEvent.detail.amount || '0 sBTC',
                dao: customEvent.detail.dao || 'BitMind DAO',
            });
        };
        if (isEnabled) {
            window.addEventListener('invoice-created', handleInvoiceCreated);
            window.addEventListener('invoice-funded', handleInvoiceFunded);
            window.addEventListener('invoice-released', handleInvoiceReleased);
            window.addEventListener('invoice-disputed', handleInvoiceDisputed);
            return () => {
                window.removeEventListener('invoice-created', handleInvoiceCreated);
                window.removeEventListener('invoice-funded', handleInvoiceFunded);
                window.removeEventListener('invoice-released', handleInvoiceReleased);
                window.removeEventListener('invoice-disputed', handleInvoiceDisputed);
            };
        }
    }, [isEnabled]);
    return {
        isEnabled,
        notifyInvoiceCreated: discordNotifications.notifyInvoiceCreated.bind(discordNotifications),
        notifyInvoiceFunded: discordNotifications.notifyInvoiceFunded.bind(discordNotifications),
        notifyPaymentReleased: discordNotifications.notifyPaymentReleased.bind(discordNotifications),
        notifyDispute: discordNotifications.notifyDispute.bind(discordNotifications),
        notifyMilestoneComplete: discordNotifications.notifyMilestoneComplete.bind(discordNotifications),
        notifyAIParsing: discordNotifications.notifyAIParsing.bind(discordNotifications),
        sendDailySummary: discordNotifications.sendDailySummary.bind(discordNotifications),
        testConnection: discordNotifications.testConnection.bind(discordNotifications),
    };
}
