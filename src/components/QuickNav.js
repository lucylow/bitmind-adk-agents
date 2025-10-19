import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Code, PlusCircle, FileText, BarChart3, HelpCircle, ArrowRight, MessageSquare, Activity } from 'lucide-react';
const QuickNav = () => {
    const navItems = [
        {
            title: 'AI Demo',
            description: 'See AI invoice parsing in action with real-time extraction',
            icon: _jsx(Sparkles, { className: "w-8 h-8" }),
            path: '/demo',
            color: 'from-orange-500 to-purple-600',
            badge: 'Popular'
        },
        {
            title: 'Interactive Demo',
            description: 'Full demo playground with simulations and production data',
            icon: _jsx(Sparkles, { className: "w-8 h-8" }),
            path: '/interactive-demo',
            color: 'from-pink-500 to-rose-600',
            badge: 'Featured'
        },
        {
            title: 'Create Invoice',
            description: 'Generate a new smart contract invoice with milestone tracking',
            icon: _jsx(PlusCircle, { className: "w-8 h-8" }),
            path: '/create',
            color: 'from-blue-500 to-cyan-600'
        },
        {
            title: 'Manage Invoices',
            description: 'View and manage all your active and completed invoices',
            icon: _jsx(FileText, { className: "w-8 h-8" }),
            path: '/invoices',
            color: 'from-purple-500 to-pink-600'
        },
        {
            title: 'API Demo',
            description: 'Explore live API integration with CoinGecko and public data',
            icon: _jsx(Code, { className: "w-8 h-8" }),
            path: '/api-demo',
            color: 'from-green-500 to-emerald-600'
        },
        {
            title: 'Analytics',
            description: 'Track performance metrics and payment statistics',
            icon: _jsx(BarChart3, { className: "w-8 h-8" }),
            path: '/analytics',
            color: 'from-indigo-500 to-blue-600'
        },
        {
            title: 'Discord Notifications',
            description: 'Real-time DAO notifications with Discord webhooks',
            icon: _jsx(MessageSquare, { className: "w-8 h-8" }),
            path: '/discord-notifications',
            color: 'from-purple-500 to-violet-600',
            badge: 'New'
        },
        {
            title: 'Live Monitor',
            description: 'Real-time blockchain monitoring via Hiro WebSocket',
            icon: _jsx(Activity, { className: "w-8 h-8" }),
            path: '/realtime-monitor',
            color: 'from-orange-500 to-red-600',
            badge: 'Live'
        },
        {
            title: 'Documentation',
            description: 'Learn how to use BitMindAI and integrate with your DAO',
            icon: _jsx(HelpCircle, { className: "w-8 h-8" }),
            path: '/help',
            color: 'from-gray-500 to-slate-600'
        },
    ];
    return (_jsxs("div", { className: "mb-12", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h2", { className: "text-3xl font-bold mb-2", children: "Quick Navigation" }), _jsx("p", { className: "text-muted-foreground", children: "Jump to key features and start exploring" })] }), _jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: navItems.map((item) => (_jsx(Link, { to: item.path, className: "group", children: _jsx(Card, { className: "h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 group-hover:scale-[1.02]", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `p-3 rounded-xl bg-gradient-to-br ${item.color} text-white flex-shrink-0 group-hover:scale-110 transition-transform`, children: item.icon }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("h3", { className: "text-lg font-bold", children: item.title }), item.badge && (_jsx("span", { className: "px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full", children: item.badge }))] }), _jsx("p", { className: "text-sm text-muted-foreground mb-3", children: item.description }), _jsxs("div", { className: "flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform", children: ["Explore", _jsx(ArrowRight, { className: "w-4 h-4 ml-1" })] })] })] }) }) }) }, item.path))) })] }));
};
export default QuickNav;
