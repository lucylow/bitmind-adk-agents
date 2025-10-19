import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiManager } from '@/lib/api/apiManager';
import NavigationBar from '@/components/NavigationBar';
import { CheckCircle, XCircle, Zap, Database, Brain, MessageSquare, Cloud, TrendingUp, Shield, } from 'lucide-react';
const APIShowcase = () => {
    const [apiStatus] = useState(apiManager.getAPIStatus());
    const [testResults, setTestResults] = useState({});
    const [loading, setLoading] = useState(null);
    const testAPI = async (apiName, testFn) => {
        setLoading(apiName);
        try {
            const result = await testFn();
            setTestResults((prev) => ({ ...prev, [apiName]: { success: true, data: result } }));
        }
        catch (error) {
            setTestResults((prev) => ({ ...prev, [apiName]: { success: false, error: error.message } }));
        }
        finally {
            setLoading(null);
        }
    };
    const apiCategories = [
        {
            name: 'Blockchain APIs',
            icon: Database,
            color: 'text-orange-600',
            apis: [
                {
                    name: 'Hiro Stacks API',
                    key: 'hiro',
                    available: apiStatus.blockchain.hiro,
                    description: 'Real-time Stacks blockchain data, transactions, and contract events',
                    test: async () => {
                        const api = apiManager.getAPI('hiro');
                        return await api?.getAccountBalance('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
                    },
                },
                {
                    name: 'Chainalysis',
                    key: 'chainalysis',
                    available: apiStatus.blockchain.chainalysis,
                    description: 'Compliance screening and risk assessment for Bitcoin addresses',
                    test: async () => {
                        const api = apiManager.getAPI('chainalysis');
                        return await api?.screenAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
                    },
                },
            ],
        },
        {
            name: 'Market Data APIs',
            icon: TrendingUp,
            color: 'text-blue-600',
            apis: [
                {
                    name: 'CoinMarketCap',
                    key: 'cmc',
                    available: apiStatus.marketData.coinmarketcap,
                    description: 'Comprehensive cryptocurrency market data and pricing',
                    test: async () => {
                        const api = apiManager.getAPI('cmc');
                        return await api?.getCryptoPrices(['BTC', 'STX']);
                    },
                },
                {
                    name: 'Alpha Vantage',
                    key: 'alphaVantage',
                    available: apiStatus.marketData.alphaVantage,
                    description: 'Traditional finance and forex data integration',
                    test: async () => {
                        const api = apiManager.getAPI('alphaVantage');
                        return await api?.getExchangeRates();
                    },
                },
            ],
        },
        {
            name: 'AI & ML APIs',
            icon: Brain,
            color: 'text-purple-600',
            apis: [
                {
                    name: 'Cohere',
                    key: 'cohere',
                    available: apiStatus.ai.cohere,
                    description: 'Advanced NLP for invoice classification and fraud detection',
                    test: async () => {
                        const api = apiManager.getAPI('cohere');
                        return await api?.classifyInvoiceType('Milestone payment for development work');
                    },
                },
                {
                    name: 'Hugging Face',
                    key: 'huggingface',
                    available: apiStatus.ai.huggingface,
                    description: 'Entity extraction and sentiment analysis',
                    test: async () => {
                        const api = apiManager.getAPI('huggingface');
                        return await api?.extractEntities('Payment to John Doe for consulting services in New York');
                    },
                },
            ],
        },
        {
            name: 'Communication APIs',
            icon: MessageSquare,
            color: 'text-green-600',
            apis: [
                {
                    name: 'Twilio SMS',
                    key: 'twilio',
                    available: apiStatus.communication.twilio,
                    description: 'SMS notifications for payment alerts and updates',
                    test: async () => ({ message: 'Twilio configured (test skipped to avoid SMS charges)' }),
                },
                {
                    name: 'Discord Webhook',
                    key: 'discord',
                    available: apiStatus.communication.discord,
                    description: 'Real-time DAO notifications in Discord channels',
                    test: async () => {
                        const api = apiManager.getAPI('discord');
                        return await api?.sendDAONotification('Test notification from API showcase', {
                            id: 'TEST-001',
                            amount: '0.1',
                            status: 'created',
                            dao: 'Demo DAO',
                        });
                    },
                },
            ],
        },
        {
            name: 'Storage APIs',
            icon: Cloud,
            color: 'text-indigo-600',
            apis: [
                {
                    name: 'Pinata IPFS',
                    key: 'pinata',
                    available: apiStatus.storage.pinata,
                    description: 'Decentralized storage for invoice documents and evidence',
                    test: async () => {
                        const api = apiManager.getAPI('pinata');
                        return await api?.uploadJSON({ test: 'data', timestamp: Date.now() }, 'BitMind API Test');
                    },
                },
            ],
        },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx(NavigationBar, {}), _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold mb-4", children: "API Integration Showcase" }), _jsx("p", { className: "text-muted-foreground text-lg mb-6", children: "BitMind integrates with leading blockchain, AI, and communication APIs to deliver enterprise-grade invoice management" }), _jsx("div", { className: "grid md:grid-cols-5 gap-4 mb-6", children: [
                                    {
                                        label: 'Blockchain',
                                        count: Object.values(apiStatus.blockchain).filter(Boolean).length,
                                        total: 2,
                                        icon: Database,
                                    },
                                    {
                                        label: 'Market Data',
                                        count: Object.values(apiStatus.marketData).filter(Boolean).length,
                                        total: 2,
                                        icon: TrendingUp,
                                    },
                                    {
                                        label: 'AI/ML',
                                        count: Object.values(apiStatus.ai).filter(Boolean).length,
                                        total: 2,
                                        icon: Brain,
                                    },
                                    {
                                        label: 'Communication',
                                        count: Object.values(apiStatus.communication).filter(Boolean).length,
                                        total: 2,
                                        icon: MessageSquare,
                                    },
                                    {
                                        label: 'Storage',
                                        count: Object.values(apiStatus.storage).filter(Boolean).length,
                                        total: 1,
                                        icon: Cloud,
                                    },
                                ].map((stat) => (_jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(stat.icon, { className: "w-5 h-5 text-muted-foreground" }), _jsxs(Badge, { variant: stat.count === stat.total ? 'default' : 'secondary', children: [stat.count, "/", stat.total] })] }), _jsx("p", { className: "text-sm font-semibold", children: stat.label })] }) }, stat.label))) })] }), _jsx("div", { className: "space-y-8", children: apiCategories.map((category) => (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(category.icon, { className: `w-6 h-6 ${category.color}` }), _jsx("h2", { className: "text-2xl font-bold", children: category.name })] }), _jsx("div", { className: "grid md:grid-cols-2 gap-4", children: category.apis.map((api) => (_jsxs(Card, { className: api.available ? 'border-green-200' : 'border-gray-200', children: [_jsx(CardHeader, { children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [api.name, api.available ? (_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" })) : (_jsx(XCircle, { className: "w-5 h-5 text-gray-400" }))] }), _jsx(CardDescription, { className: "mt-2", children: api.description })] }) }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "flex gap-2", children: _jsx(Badge, { variant: api.available ? 'default' : 'outline', children: api.available ? 'Configured' : 'Not Configured' }) }), api.available && (_jsxs(Button, { onClick: () => testAPI(api.key, api.test), disabled: loading === api.key, size: "sm", variant: "outline", className: "w-full", children: [_jsx(Zap, { className: "w-4 h-4 mr-2" }), loading === api.key ? 'Testing...' : 'Test API'] })), testResults[api.key] && (_jsx("div", { className: `p-3 rounded text-xs ${testResults[api.key].success
                                                                ? 'bg-green-50 text-green-800'
                                                                : 'bg-red-50 text-red-800'}`, children: testResults[api.key].success ? (_jsxs("div", { children: [_jsx("p", { className: "font-semibold mb-1", children: "\u2705 Success" }), _jsxs("pre", { className: "overflow-auto", children: [JSON.stringify(testResults[api.key].data, null, 2).substring(0, 200), "..."] })] })) : (_jsxs("p", { children: ["\u274C ", testResults[api.key].error] })) }))] }) })] }, api.key))) })] }, category.name))) }), _jsxs(Card, { className: "mt-8 bg-gradient-to-r from-purple-50 to-blue-50", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "w-6 h-6 text-purple-600" }), "Configuration Guide"] }) }), _jsxs(CardContent, { children: [_jsxs("p", { className: "mb-4", children: ["To enable all APIs, add your API keys to the ", _jsx("code", { children: ".env.local" }), " file. See", ' ', _jsx("code", { children: "ENV_SETUP.md" }), " for detailed instructions."] }), _jsxs("div", { className: "bg-white p-4 rounded border", children: [_jsx("p", { className: "text-sm font-mono mb-2", children: "Available APIs:" }), _jsx("ul", { className: "text-sm space-y-1 font-mono", children: apiManager.getAvailableAPIs().map((api) => (_jsxs("li", { className: "text-green-600", children: ["\u2713 ", api] }, api))) })] })] })] })] })] }));
};
export default APIShowcase;
