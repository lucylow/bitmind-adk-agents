import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
const steps = [
    {
        number: "1",
        title: "Describe Your Project",
        description: "Use natural language to describe scope, milestones, and budget.",
    },
    {
        number: "2",
        title: "AI Generates Contract",
        description: "AI processes text and generates a secure Clarity contract ready for deployment.",
    },
    {
        number: "3",
        title: "Deploy & Fund Escrow",
        description: "Deploy to Stacks testnet and fund the escrow with sBTC or STX.",
    },
    {
        number: "4",
        title: "Automated Payments",
        description: "Milestones trigger automatic payments. Disputes go to pre-selected arbitrators.",
    },
];
export function DemoSection() {
    return (_jsx("section", { id: "demo", className: "py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 }, className: "text-center mb-16", children: [_jsx("h2", { className: "text-3xl sm:text-4xl font-bold mb-4", children: "See It In Action" }), _jsx("p", { className: "text-xl text-gray-300 max-w-3xl mx-auto", children: "Experience the complete AI-to-blockchain workflow \u2014 no blockchain knowledge required." })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center", children: [_jsxs("div", { className: "space-y-8", children: [steps.map((step, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: -30 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay: index * 0.1 }, className: "flex items-start space-x-6 group", children: [_jsx("div", { className: "flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300", children: step.number }), _jsxs("div", { children: [_jsx("h4", { className: "text-xl font-semibold mb-2", children: step.title }), _jsx("p", { className: "text-gray-300", children: step.description })] })] }, step.number))), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay: 0.4 }, className: "pt-6", children: _jsx(Link, { to: "/app", children: _jsxs(Button, { size: "lg", className: "group bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700", children: ["\uD83C\uDFAF Launch Interactive Demo", _jsx(ArrowRight, { className: "ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" })] }) }) })] }), _jsx(motion.div, { initial: { opacity: 0, x: 30 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.6 }, className: "relative", children: _jsxs("div", { className: "bg-gray-800 rounded-3xl p-8 shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-3 h-3 bg-red-500 rounded-full" }), _jsx("div", { className: "w-3 h-3 bg-yellow-500 rounded-full" }), _jsx("div", { className: "w-3 h-3 bg-green-500 rounded-full" })] }), _jsx("div", { className: "text-sm text-gray-400", children: "AI Invoice Generator" })] }), _jsxs("div", { className: "bg-gray-900 rounded-2xl p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2 text-green-400", children: [_jsx(CheckCircle, { className: "w-5 h-5" }), _jsx("span", { className: "font-mono text-sm", children: "AI: Analyzing invoice description..." })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300", children: [_jsx("div", { className: "text-green-400", children: "$ Invoice: Website redesign" }), _jsx("div", { className: "text-blue-400", children: "$ Amount: 0.05 sBTC" }), _jsx("div", { className: "text-purple-400", children: "$ Milestones: 2" }), _jsx("div", { className: "text-yellow-400", children: "$ Deadline: 2025-10-20" })] }), _jsxs("div", { className: "flex items-center space-x-2 text-blue-400", children: [_jsx(CheckCircle, { className: "w-5 h-5" }), _jsx("span", { className: "font-mono text-sm", children: "Generating Clarity contract..." })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-4", children: [_jsx("div", { className: "text-green-400 text-sm mb-2", children: "Contract deployed successfully!" }), _jsx("div", { className: "text-xs text-gray-400 break-all", children: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.smart-invoice-v1" })] })] }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx(Link, { to: "/demo", children: _jsx(Button, { size: "lg", className: "rounded-full w-16 h-16 p-0 opacity-90 hover:opacity-100 transition-opacity bg-gradient-to-r from-blue-600 to-purple-600 text-white", children: _jsx(Play, { className: "w-6 h-6 ml-1" }) }) }) })] }) })] })] }) }));
}
