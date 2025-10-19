import axios from 'axios';
export class TwilioAPI {
    constructor(accountSid, authToken, fromNumber) {
        Object.defineProperty(this, "accountSid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "authToken", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fromNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.fromNumber = fromNumber;
    }
    async sendInvoiceNotification(to, invoiceId, amount) {
        try {
            // Note: In production, use Twilio SDK. This is a simplified version.
            const response = await axios.post(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, new URLSearchParams({
                Body: `BitMind Invoice #${invoiceId} for ${amount} sBTC has been created. Check your dashboard for details.`,
                From: this.fromNumber,
                To: to,
            }), {
                auth: {
                    username: this.accountSid,
                    password: this.authToken,
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Twilio API error:', error);
            return { error: true, message: 'Failed to send SMS' };
        }
    }
    async sendPaymentAlert(to, amount) {
        try {
            const response = await axios.post(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, new URLSearchParams({
                Body: `Payment of ${amount} sBTC has been released via BitMind escrow. Funds are now available.`,
                From: this.fromNumber,
                To: to,
            }), {
                auth: {
                    username: this.accountSid,
                    password: this.authToken,
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Twilio API error:', error);
            return { error: true, message: 'Failed to send SMS' };
        }
    }
}
export class DiscordAPI {
    constructor(webhookUrl) {
        Object.defineProperty(this, "webhookUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.webhookUrl = webhookUrl;
    }
    // Core notification method with rich embeds
    async sendDAONotification(message, invoiceData) {
        try {
            const response = await axios.post(this.webhookUrl, {
                embeds: [
                    {
                        title: '📋 BitMind Invoice Update',
                        description: message,
                        color: 0x00ff00,
                        fields: [
                            { name: 'Invoice ID', value: invoiceData.id.toString(), inline: true },
                            { name: 'Amount', value: `${invoiceData.amount} sBTC`, inline: true },
                            { name: 'Status', value: invoiceData.status.toUpperCase(), inline: true },
                            { name: 'DAO', value: invoiceData.dao || 'Unknown', inline: false },
                        ],
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: 'BitMind AI - Smart Invoice Platform',
                        },
                    },
                ],
            });
            return response.data;
        }
        catch (error) {
            console.error('Discord API error:', error);
            return { error: true, message: 'Failed to send Discord notification' };
        }
    }
    // Invoice Created - Rich notification with all details
    async sendInvoiceCreated(invoiceData) {
        try {
            const response = await axios.post(this.webhookUrl, {
                content: `@here 🆕 **New Invoice Created!**`,
                embeds: [
                    {
                        title: '📝 Invoice Created',
                        description: `A new invoice has been created on BitMind platform`,
                        color: 0x5865f2, // Discord blue
                        fields: [
                            { name: '🆔 Invoice ID', value: `#${invoiceData.id}`, inline: true },
                            { name: '💰 Amount', value: `${invoiceData.amount}`, inline: true },
                            { name: '📊 Status', value: '🟡 Created', inline: true },
                            { name: '🏛️ DAO', value: invoiceData.dao || 'N/A', inline: true },
                            { name: '👤 Payee', value: `\`${invoiceData.payee?.substring(0, 20)}...\``, inline: true },
                            { name: '⏰ Created', value: new Date().toLocaleString(), inline: true },
                            { name: '📄 Description', value: invoiceData.description || 'No description provided', inline: false },
                        ],
                        thumbnail: {
                            url: 'https://api.dicebear.com/7.x/shapes/svg?seed=invoice',
                        },
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: '🤖 BitMind AI • Powered by Stacks & Bitcoin',
                            icon_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bitmind',
                        },
                    },
                ],
            });
            return response.data;
        }
        catch (error) {
            console.error('Discord API error:', error);
            return { error: true, message: 'Failed to send Discord notification' };
        }
    }
    // Invoice Funded - Escrow deposit notification
    async sendInvoiceFunded(invoiceData) {
        try {
            const response = await axios.post(this.webhookUrl, {
                content: `💰 **Invoice Funded - Escrow Secured!**`,
                embeds: [
                    {
                        title: '💎 Escrow Funded',
                        description: `Funds have been deposited into escrow for invoice #${invoiceData.id}`,
                        color: 0x9b59b6, // Purple
                        fields: [
                            { name: '🆔 Invoice ID', value: `#${invoiceData.id}`, inline: true },
                            { name: '💵 Amount', value: `${invoiceData.amount}`, inline: true },
                            { name: '📊 Status', value: '🟣 Funded', inline: true },
                            { name: '🏛️ DAO', value: invoiceData.dao || 'N/A', inline: true },
                            { name: '🔒 Escrow', value: 'Secured via Clarity smart contract', inline: false },
                            { name: '⚡ Transaction', value: invoiceData.txId ? `[View on Explorer](https://explorer.stacks.co/txid/${invoiceData.txId})` : 'Pending', inline: false },
                        ],
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: '🔐 Funds secured on Bitcoin Layer-2',
                        },
                    },
                ],
            });
            return response.data;
        }
        catch (error) {
            console.error('Discord API error:', error);
            return { error: true, message: 'Failed to send Discord notification' };
        }
    }
    // Invoice Released - Payment completed
    async sendInvoiceReleased(invoiceData) {
        try {
            const response = await axios.post(this.webhookUrl, {
                content: `🎉 **Payment Released - Work Completed!**`,
                embeds: [
                    {
                        title: '✅ Payment Released',
                        description: `Funds have been released to the contractor for invoice #${invoiceData.id}`,
                        color: 0x2ecc71, // Green
                        fields: [
                            { name: '🆔 Invoice ID', value: `#${invoiceData.id}`, inline: true },
                            { name: '💸 Amount Released', value: `${invoiceData.amount}`, inline: true },
                            { name: '📊 Status', value: '🟢 Released', inline: true },
                            { name: '🏛️ DAO', value: invoiceData.dao || 'N/A', inline: true },
                            { name: '👤 Recipient', value: `\`${invoiceData.payee?.substring(0, 20)}...\``, inline: true },
                            { name: '✨ Completion', value: '100% Work Verified', inline: true },
                            { name: '⚡ Transaction', value: invoiceData.txId ? `[View on Explorer](https://explorer.stacks.co/txid/${invoiceData.txId})` : 'Pending', inline: false },
                        ],
                        thumbnail: {
                            url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=success',
                        },
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: '✨ Successful completion via BitMind',
                        },
                    },
                ],
            });
            return response.data;
        }
        catch (error) {
            console.error('Discord API error:', error);
            return { error: true, message: 'Failed to send Discord notification' };
        }
    }
    // Invoice Disputed - Alert notification
    async sendInvoiceDisputed(invoiceData) {
        try {
            const response = await axios.post(this.webhookUrl, {
                content: `@here ⚠️ **DISPUTE RAISED - Attention Required!**`,
                embeds: [
                    {
                        title: '⚠️ Dispute Raised',
                        description: `A dispute has been raised for invoice #${invoiceData.id}. Arbitrator intervention required.`,
                        color: 0xe74c3c, // Red
                        fields: [
                            { name: '🆔 Invoice ID', value: `#${invoiceData.id}`, inline: true },
                            { name: '💰 Amount', value: `${invoiceData.amount}`, inline: true },
                            { name: '📊 Status', value: '🔴 Disputed', inline: true },
                            { name: '🏛️ DAO', value: invoiceData.dao || 'N/A', inline: true },
                            { name: '⚖️ Reason', value: invoiceData.disputeReason || 'Not specified', inline: false },
                            { name: '👨‍⚖️ Arbitrator', value: invoiceData.arbiter ? `\`${invoiceData.arbiter.substring(0, 20)}...\`` : 'Not assigned', inline: false },
                            { name: '⏰ Reported', value: new Date().toLocaleString(), inline: false },
                        ],
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: '⚡ Urgent: Requires DAO attention',
                        },
                    },
                ],
            });
            return response.data;
        }
        catch (error) {
            console.error('Discord API error:', error);
            return { error: true, message: 'Failed to send Discord notification' };
        }
    }
    // Milestone Completed notification
    async sendMilestoneCompleted(invoiceData, milestoneData) {
        try {
            const response = await axios.post(this.webhookUrl, {
                embeds: [
                    {
                        title: '🎯 Milestone Completed',
                        description: `Milestone "${milestoneData.description}" has been completed`,
                        color: 0x3498db, // Light blue
                        fields: [
                            { name: '🆔 Invoice ID', value: `#${invoiceData.id}`, inline: true },
                            { name: '🎯 Milestone', value: milestoneData.description, inline: true },
                            { name: '💰 Amount', value: `${milestoneData.amount} sBTC`, inline: true },
                            { name: '📊 Progress', value: `${milestoneData.progress || 0}%`, inline: true },
                        ],
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: 'BitMind Milestone Tracker',
                        },
                    },
                ],
            });
            return response.data;
        }
        catch (error) {
            console.error('Discord API error:', error);
            return { error: true, message: 'Failed to send Discord notification' };
        }
    }
    // AI Parsing notification
    async sendAIParsingComplete(invoiceData, aiResults) {
        try {
            const response = await axios.post(this.webhookUrl, {
                embeds: [
                    {
                        title: '🤖 AI Invoice Parsed',
                        description: `AI has successfully parsed invoice with ${aiResults.confidence || 0}% confidence`,
                        color: 0xf39c12, // Orange
                        fields: [
                            { name: '🆔 Invoice ID', value: `#${invoiceData.id}`, inline: true },
                            { name: '🎯 Confidence', value: `${aiResults.confidence || 0}%`, inline: true },
                            { name: '📊 Fields Extracted', value: `${aiResults.fieldsExtracted || 0}`, inline: true },
                            { name: '⚡ Processing Time', value: `${aiResults.processingTime || 'N/A'}`, inline: true },
                        ],
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: '🧠 Powered by Cohere AI',
                        },
                    },
                ],
            });
            return response.data;
        }
        catch (error) {
            console.error('Discord API error:', error);
            return { error: true, message: 'Failed to send Discord notification' };
        }
    }
    // Daily summary notification
    async sendDailySummary(summaryData) {
        try {
            const response = await axios.post(this.webhookUrl, {
                content: `📊 **Daily BitMind Summary**`,
                embeds: [
                    {
                        title: '📈 Daily Activity Report',
                        description: `Summary for ${new Date().toLocaleDateString()}`,
                        color: 0x1abc9c, // Turquoise
                        fields: [
                            { name: '📝 Invoices Created', value: summaryData.created?.toString() || '0', inline: true },
                            { name: '💰 Total Funded', value: summaryData.totalFunded || '0 sBTC', inline: true },
                            { name: '✅ Completed', value: summaryData.completed?.toString() || '0', inline: true },
                            { name: '⚠️ Disputes', value: summaryData.disputes?.toString() || '0', inline: true },
                            { name: '💵 Total Volume', value: summaryData.totalVolume || '0 sBTC', inline: true },
                            { name: '👥 Active DAOs', value: summaryData.activeDaos?.toString() || '0', inline: true },
                        ],
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: '📊 BitMind Daily Report',
                        },
                    },
                ],
            });
            return response.data;
        }
        catch (error) {
            console.error('Discord API error:', error);
            return { error: true, message: 'Failed to send Discord notification' };
        }
    }
    // Test connection
    async sendTestNotification() {
        try {
            const response = await axios.post(this.webhookUrl, {
                content: `🧪 **BitMind Discord Integration Test**`,
                embeds: [
                    {
                        title: '✅ Connection Successful',
                        description: 'Your Discord webhook is properly configured and working!',
                        color: 0x2ecc71,
                        fields: [
                            { name: '🔗 Integration', value: 'BitMind DAO Notifications', inline: true },
                            { name: '⏰ Test Time', value: new Date().toLocaleString(), inline: true },
                            { name: '✨ Status', value: 'All systems operational', inline: false },
                        ],
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: '🤖 BitMind AI - Smart Invoice Platform',
                        },
                    },
                ],
            });
            return { success: true, data: response.data };
        }
        catch (error) {
            console.error('Discord API error:', error);
            return { success: false, error: true, message: 'Failed to send test notification' };
        }
    }
}
const DISCORD_WEBHOOK = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
export const discordAPI = DISCORD_WEBHOOK ? new DiscordAPI(DISCORD_WEBHOOK) : null;
