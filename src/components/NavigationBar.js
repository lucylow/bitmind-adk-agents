import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Brain, Menu, X, LayoutDashboard, FileText, PlusCircle, BarChart3, HelpCircle, Sparkles, Code, Home, ChevronDown, Store, Repeat, Wallet, TrendingUp } from "lucide-react";
import { useState } from 'react';
import WalletConnect from './WalletConnect';
import { useWalletStore } from '@/store/useWalletStore';
const NavigationBar = () => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
    const { isConnected } = useWalletStore();
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
    const isLandingPage = location.pathname === '/' || location.pathname === '/landing';
    // Navigation sections for better organization
    const mainNavItems = [
        {
            label: 'Home',
            path: '/app',
            icon: _jsx(Home, { className: "w-4 h-4" }),
            description: 'Main dashboard'
        },
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: _jsx(LayoutDashboard, { className: "w-4 h-4" }),
            description: 'Overview & metrics'
        },
        {
            label: 'Invoices',
            path: '/invoices',
            icon: _jsx(FileText, { className: "w-4 h-4" }),
            description: 'Manage invoices'
        },
        {
            label: 'Analytics',
            path: '/analytics',
            icon: _jsx(BarChart3, { className: "w-4 h-4" }),
            description: 'Performance metrics'
        },
    ];
    const demoNavItems = [
        {
            label: 'AI Demo',
            path: '/demo',
            icon: _jsx(Sparkles, { className: "w-4 h-4" }),
            badge: 'New',
            description: 'AI invoice parsing'
        },
        {
            label: 'API Demo',
            path: '/api-demo',
            icon: _jsx(Code, { className: "w-4 h-4" }),
            description: 'Live API integration'
        },
    ];
    const defiNavItems = [
        {
            label: 'NFT Marketplace',
            path: '/nft-marketplace',
            icon: _jsx(Store, { className: "w-4 h-4" }),
            description: 'Trade invoice NFTs'
        },
        {
            label: 'Cross-Chain Swap',
            path: '/cross-chain-swap',
            icon: _jsx(Repeat, { className: "w-4 h-4" }),
            description: 'Multi-chain swaps'
        },
        {
            label: 'Treasury',
            path: '/treasury',
            icon: _jsx(Wallet, { className: "w-4 h-4" }),
            description: 'Multisig treasury'
        },
        {
            label: 'Yield Optimizer',
            path: '/yield-optimizer',
            icon: _jsx(TrendingUp, { className: "w-4 h-4" }),
            description: 'Optimize yields'
        },
    ];
    const actionItems = [
        {
            label: 'Create Invoice',
            path: '/create',
            icon: _jsx(PlusCircle, { className: "w-4 h-4" }),
            description: 'New invoice'
        },
        {
            label: 'Help',
            path: '/help',
            icon: _jsx(HelpCircle, { className: "w-4 h-4" }),
            description: 'Documentation'
        },
    ];
    // Don't show navbar on standalone landing page
    if (isLandingPage) {
        return null;
    }
    return (_jsx("nav", { className: "bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm", children: _jsxs("div", { className: "container mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "flex justify-between items-center h-16", children: [_jsxs(Link, { to: "/app", className: "flex items-center space-x-3 group", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform", children: _jsx(Brain, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent", children: "BitMindAI" }), _jsx("span", { className: "text-xs text-gray-500 -mt-1 hidden sm:block", children: "Bitcoin-native smart invoices" })] })] }), _jsxs("div", { className: "hidden lg:flex items-center gap-1", children: [mainNavItems.map((item) => (_jsxs(Link, { to: item.path, className: `px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive(item.path)
                                        ? 'bg-blue-50 text-blue-600 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`, children: [item.icon, item.label, item.badge && (_jsx(Badge, { variant: "secondary", className: "ml-1 text-xs", children: item.badge }))] }, item.path))), _jsxs("div", { className: "relative group", children: [_jsxs("button", { className: "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900", onMouseEnter: () => setIsDemoMenuOpen(true), onMouseLeave: () => setIsDemoMenuOpen(false), children: [_jsx(Sparkles, { className: "w-4 h-4" }), "Demos", _jsx(ChevronDown, { className: "w-3 h-3" })] }), isDemoMenuOpen && (_jsxs("div", { className: "absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50", onMouseEnter: () => setIsDemoMenuOpen(true), onMouseLeave: () => setIsDemoMenuOpen(false), children: [demoNavItems.map((item) => (_jsxs(Link, { to: item.path, className: `flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`, children: [item.icon, _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium text-sm", children: item.label }), item.badge && (_jsx(Badge, { variant: "secondary", className: "text-xs", children: item.badge }))] }), item.description && (_jsx("span", { className: "text-xs text-gray-500", children: item.description }))] })] }, item.path))), _jsx("div", { className: "my-2 border-t border-gray-100" }), _jsx("div", { className: "px-4 py-1", children: _jsx("span", { className: "text-xs font-semibold text-gray-400 uppercase", children: "DeFi Features" }) }), defiNavItems.map((item) => (_jsxs(Link, { to: item.path, className: `flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`, children: [item.icon, _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium text-sm", children: item.label }), item.badge && (_jsx(Badge, { variant: "secondary", className: "text-xs", children: item.badge }))] }), item.description && (_jsx("span", { className: "text-xs text-gray-500", children: item.description }))] })] }, item.path)))] }))] }), actionItems.map((item) => (_jsxs(Link, { to: item.path, className: `px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive(item.path)
                                        ? 'bg-blue-50 text-blue-600 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`, children: [item.icon, item.label] }, item.path))), _jsx(Link, { to: "/landing", className: "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 border-l border-gray-200 ml-2", title: "Back to Landing Page", children: _jsx(Home, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "hidden lg:block", children: _jsx(WalletConnect, {}) }), _jsx("button", { className: "lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors", onClick: () => setIsMenuOpen(!isMenuOpen), children: isMenuOpen ? _jsx(X, { className: "w-6 h-6" }) : _jsx(Menu, { className: "w-6 h-6" }) })] })] }), isMenuOpen && (_jsx("div", { className: "lg:hidden pb-4 border-t border-gray-100 mt-2 pt-4", children: _jsxs("div", { className: "space-y-1", children: [mainNavItems.map((item) => (_jsxs(Link, { to: item.path, className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                                    ? 'bg-blue-50 text-blue-600 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-50'}`, onClick: () => setIsMenuOpen(false), children: [item.icon, _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [item.label, item.badge && (_jsx(Badge, { variant: "secondary", className: "text-xs", children: item.badge }))] }), item.description && (_jsx("span", { className: "text-xs text-gray-500", children: item.description }))] })] }, item.path))), _jsx("div", { className: "pt-2 pb-1 px-3", children: _jsx("span", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Demos" }) }), demoNavItems.map((item) => (_jsxs(Link, { to: item.path, className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                                    ? 'bg-blue-50 text-blue-600 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-50'}`, onClick: () => setIsMenuOpen(false), children: [item.icon, _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [item.label, item.badge && (_jsx(Badge, { variant: "secondary", className: "text-xs bg-green-100 text-green-800", children: item.badge }))] }), item.description && (_jsx("span", { className: "text-xs text-gray-500", children: item.description }))] })] }, item.path))), _jsx("div", { className: "pt-2 pb-1 px-3", children: _jsx("span", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "DeFi Features" }) }), defiNavItems.map((item) => (_jsxs(Link, { to: item.path, className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                                    ? 'bg-blue-50 text-blue-600 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-50'}`, onClick: () => setIsMenuOpen(false), children: [item.icon, _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [item.label, item.badge && (_jsx(Badge, { variant: "secondary", className: "text-xs", children: item.badge }))] }), item.description && (_jsx("span", { className: "text-xs text-gray-500", children: item.description }))] })] }, item.path))), _jsx("div", { className: "pt-2 pb-1 px-3", children: _jsx("span", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Actions" }) }), actionItems.map((item) => (_jsxs(Link, { to: item.path, className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                                    ? 'bg-blue-50 text-blue-600 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-50'}`, onClick: () => setIsMenuOpen(false), children: [item.icon, item.label] }, item.path))), _jsx("div", { className: "pt-2 pb-1 px-3", children: _jsx("span", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Quick Links" }) }), _jsxs(Link, { to: "/landing", className: "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-gray-700 hover:bg-gray-50", onClick: () => setIsMenuOpen(false), children: [_jsx(Home, { className: "w-4 h-4" }), "Back to Landing Page"] }), _jsx("div", { className: "pt-4 px-3", children: _jsx(WalletConnect, {}) })] }) }))] }) }));
};
export default NavigationBar;
