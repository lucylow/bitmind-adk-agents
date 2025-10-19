import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, DollarSign, BarChart3, PieChart } from 'lucide-react';
const AnalyticsDashboard = () => {
    const [invoiceData, setInvoiceData] = useState([]);
    const [riskAnalysis, setRiskAnalysis] = useState({
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0
    });
    const [delayTrends, setDelayTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadAnalyticsData();
    }, []);
    const loadAnalyticsData = async () => {
        setLoading(true);
        try {
            // Mock data for demonstration
            const mockInvoices = [
                {
                    id: 1,
                    amount: 50000,
                    dueDate: '2025-12-31',
                    riskScore: 8,
                    status: 'pending',
                    paymentHistory: { actualDelay: 5, predictedDelay: 7 }
                },
                {
                    id: 2,
                    amount: 25000,
                    dueDate: '2025-11-30',
                    riskScore: 5,
                    status: 'pending',
                    paymentHistory: { actualDelay: 2, predictedDelay: 3 }
                },
                {
                    id: 3,
                    amount: 75000,
                    dueDate: '2026-01-15',
                    riskScore: 3,
                    status: 'active',
                    paymentHistory: { actualDelay: 0, predictedDelay: 1 }
                },
                {
                    id: 4,
                    amount: 100000,
                    dueDate: '2025-12-15',
                    riskScore: 9,
                    status: 'pending',
                    paymentHistory: { actualDelay: 10, predictedDelay: 12 }
                },
                {
                    id: 5,
                    amount: 30000,
                    dueDate: '2026-02-01',
                    riskScore: 2,
                    status: 'active',
                    paymentHistory: { actualDelay: 0, predictedDelay: 0 }
                }
            ];
            setInvoiceData(mockInvoices);
            // Calculate risk analysis
            const analysis = {
                highRisk: mockInvoices.filter(inv => inv.riskScore >= 8).length,
                mediumRisk: mockInvoices.filter(inv => inv.riskScore >= 5 && inv.riskScore < 8).length,
                lowRisk: mockInvoices.filter(inv => inv.riskScore < 5).length
            };
            setRiskAnalysis(analysis);
            // Generate delay trends
            const trends = mockInvoices.map(inv => ({
                date: inv.dueDate,
                actualDelay: inv.paymentHistory.actualDelay,
                predictedDelay: inv.paymentHistory.predictedDelay,
                amount: inv.amount
            }));
            setDelayTrends(trends);
        }
        catch (error) {
            console.error('Failed to load analytics:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const totalInvoiceValue = invoiceData.reduce((sum, inv) => sum + inv.amount, 0);
    const averageRiskScore = invoiceData.length > 0
        ? invoiceData.reduce((sum, inv) => sum + inv.riskScore, 0) / invoiceData.length
        : 0;
    const aiInsights = [
        {
            type: 'warning',
            title: 'High Risk Alert',
            message: `${riskAnalysis.highRisk} invoices require immediate attention`,
            icon: AlertTriangle,
            color: 'text-red-600 bg-red-50 border-red-200'
        },
        {
            type: 'success',
            title: 'Payment Pattern',
            message: '94% accuracy in delay predictions this month',
            icon: TrendingUp,
            color: 'text-green-600 bg-green-50 border-green-200'
        },
        {
            type: 'info',
            title: 'Liquidity Recommendation',
            message: 'Consider early discount on 3 high-value invoices',
            icon: DollarSign,
            color: 'text-blue-600 bg-blue-50 border-blue-200'
        }
    ];
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("h1", { className: "text-4xl font-bold mb-2 flex items-center gap-3", children: [_jsx(Brain, { className: "w-10 h-10 text-purple-600" }), "AI-Powered Financial Analytics"] }), _jsx("p", { className: "text-muted-foreground text-lg", children: "Risk scoring, fraud detection, and payment predictions" })] }), _jsxs("div", { className: "grid md:grid-cols-4 gap-4 mb-8", children: [_jsx(Card, { className: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-purple-700", children: "Total Portfolio" }), _jsxs("p", { className: "text-3xl font-bold text-purple-900", children: ["$", (totalInvoiceValue / 1000).toFixed(0), "K"] })] }), _jsx(DollarSign, { className: "w-12 h-12 text-purple-400" })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-blue-700", children: "Active Invoices" }), _jsx("p", { className: "text-3xl font-bold text-blue-900", children: invoiceData.length })] }), _jsx(BarChart3, { className: "w-12 h-12 text-blue-400" })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-green-700", children: "Avg Risk Score" }), _jsxs("p", { className: "text-3xl font-bold text-green-900", children: [averageRiskScore.toFixed(1), "/10"] })] }), _jsx(PieChart, { className: "w-12 h-12 text-green-400" })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-orange-700", children: "Prediction Accuracy" }), _jsx("p", { className: "text-3xl font-bold text-orange-900", children: "94%" })] }), _jsx(Brain, { className: "w-12 h-12 text-orange-400" })] }) }) })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "AI Insights & Recommendations" }), _jsx("div", { className: "grid md:grid-cols-3 gap-4", children: aiInsights.map((insight, index) => (_jsx(Card, { className: `border-2 ${insight.color}`, children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(insight.icon, { className: "w-6 h-6 flex-shrink-0 mt-1" }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold mb-1", children: insight.title }), _jsx("p", { className: "text-sm", children: insight.message })] })] }) }) }, index))) })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6 mb-8", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Portfolio Risk Analysis" }), _jsx(CardDescription, { children: "Distribution of invoices by risk level" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-200", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 bg-red-600 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-xl", children: riskAnalysis.highRisk }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-red-900", children: "High Risk" }), _jsx("p", { className: "text-sm text-red-700", children: "Risk Score 8-10" })] })] }), _jsx(Badge, { variant: "destructive", children: "Critical" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-xl", children: riskAnalysis.mediumRisk }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-yellow-900", children: "Medium Risk" }), _jsx("p", { className: "text-sm text-yellow-700", children: "Risk Score 5-7" })] })] }), _jsx(Badge, { className: "bg-yellow-600", children: "Monitor" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 bg-green-600 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-xl", children: riskAnalysis.lowRisk }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-green-900", children: "Low Risk" }), _jsx("p", { className: "text-sm text-green-700", children: "Risk Score 0-4" })] })] }), _jsx(Badge, { className: "bg-green-600", children: "Healthy" })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Payment Delay Forecasting" }), _jsx(CardDescription, { children: "AI predictions vs actual delays" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: delayTrends.slice(0, 5).map((trend, index) => (_jsxs("div", { className: "p-3 border rounded-lg hover:bg-accent", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "font-semibold", children: trend.date }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["$", (trend.amount / 1000).toFixed(0), "K"] })] }), _jsxs("div", { className: "flex gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 bg-blue-500 rounded-full" }), _jsxs("span", { children: ["Actual: ", trend.actualDelay, "d"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 bg-green-500 rounded-full" }), _jsxs("span", { children: ["Predicted: ", trend.predictedDelay, "d"] })] })] }), _jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-600 h-2 rounded-full", style: {
                                                                width: `${Math.min(100, Math.max(0, 100 - (Math.abs(trend.actualDelay - trend.predictedDelay) * 10)))}%`
                                                            } }) }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: ["Prediction accuracy: ", Math.min(100, Math.max(0, 100 - (Math.abs(trend.actualDelay - trend.predictedDelay) * 10))).toFixed(0), "%"] })] })] }, index))) }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Liquidity Optimization Recommendations" }), _jsx(CardDescription, { children: "AI-powered insights for maximizing capital efficiency" })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid md:grid-cols-3 gap-4", children: invoiceData.slice(0, 3).map((invoice) => (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-bold", children: ["Invoice #", invoice.id] }), _jsxs("p", { className: "text-2xl font-bold text-purple-600", children: ["$", (invoice.amount / 1000).toFixed(0), "K"] })] }), _jsxs(Badge, { className: invoice.riskScore >= 8 ? 'bg-red-600' :
                                                    invoice.riskScore >= 5 ? 'bg-yellow-600' : 'bg-green-600', children: ["Risk: ", invoice.riskScore] })] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Due Date:" }), _jsx("span", { className: "font-semibold", children: invoice.dueDate })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Discounted Value:" }), _jsxs("span", { className: "font-semibold text-green-600", children: ["$", ((invoice.amount * 0.88) / 1000).toFixed(0), "K"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Potential Savings:" }), _jsx("span", { className: "font-semibold text-orange-600", children: "12%" })] })] })] }, invoice.id))) }) })] })] }));
};
export default AnalyticsDashboard;
