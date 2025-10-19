import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useWalletStore } from '@/store/useWalletStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import WalletConnect from './WalletConnect';
const ProtectedRoute = ({ children }) => {
    const { isConnected } = useWalletStore();
    if (!isConnected) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4", children: _jsxs(Card, { className: "max-w-lg w-full shadow-2xl", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg", children: _jsx(Lock, { className: "w-10 h-10 text-white" }) }), _jsx(CardTitle, { className: "text-3xl mb-2", children: "Wallet Connection Required" }), _jsx(CardDescription, { className: "text-base", children: "This page requires a connected Stacks wallet" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-blue-900 text-center", children: ["\uD83D\uDD10 ", _jsx("strong", { children: "BitMindAI" }), " uses wallet-based authentication for secure access to blockchain features."] }) }), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-semibold text-sm text-gray-700", children: "Supported Wallets:" }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs text-center", children: [_jsxs("div", { className: "p-2 border rounded-lg hover:bg-gray-50", children: [_jsx(Wallet, { className: "w-6 h-6 mx-auto mb-1 text-orange-600" }), _jsx("span", { children: "Hiro Wallet" })] }), _jsxs("div", { className: "p-2 border rounded-lg hover:bg-gray-50", children: [_jsx(Wallet, { className: "w-6 h-6 mx-auto mb-1 text-purple-600" }), _jsx("span", { children: "Leather" })] }), _jsxs("div", { className: "p-2 border rounded-lg hover:bg-gray-50", children: [_jsx(Wallet, { className: "w-6 h-6 mx-auto mb-1 text-blue-600" }), _jsx("span", { children: "Xverse" })] })] })] }), _jsxs("div", { className: "flex flex-col gap-3 pt-4 border-t", children: [_jsx("div", { className: "flex justify-center", children: _jsx(WalletConnect, {}) }), _jsx(Link, { to: "/landing", className: "w-full", children: _jsxs(Button, { variant: "outline", className: "w-full", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to Landing Page"] }) })] })] })] }) }));
    }
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
