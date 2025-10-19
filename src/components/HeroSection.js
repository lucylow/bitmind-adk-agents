import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Github, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
export function HeroSection() {
    return (_jsxs("section", { className: "relative min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 lg:px-8 overflow-hidden", children: [_jsxs("div", { className: "max-w-7xl mx-auto text-center", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 backdrop-blur-sm mb-8", children: [_jsx(Zap, { className: "w-4 h-4 mr-2 text-yellow-500" }), "\uD83D\uDE80 Built for Stacks Vibe Coding Hackathon 2025"] }), _jsxs(motion.h1, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6", children: [_jsx("span", { className: "block text-gray-900", children: "AI-Powered" }), _jsx("span", { className: "block bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-gradient", children: "Smart Invoices" })] }), _jsx(motion.p, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto mb-10 leading-relaxed", children: "Transform natural language into secure, Bitcoin-native contracts. Automate DAO contractor payments with AI-generated Clarity contracts on Stacks." }), _jsxs(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto text-gray-700 mb-12", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-gray-900 mb-2", children: "10x" }), _jsx("div", { className: "text-gray-600", children: "Faster Contract Creation" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-gray-900 mb-2", children: "100%" }), _jsx("div", { className: "text-gray-600", children: "Clarity Security" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-gray-900 mb-2", children: "$0" }), _jsx("div", { className: "text-gray-600", children: "Dispute Costs" })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, className: "flex flex-col sm:flex-row gap-4 justify-center items-center mb-16", children: [_jsx(Link, { to: "/app", children: _jsxs(Button, { size: "lg", className: "group bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 h-14 px-10 text-lg", children: ["\uD83D\uDE80 Try Live Demo", _jsx(ArrowRight, { className: "ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" })] }) }), _jsx(Button, { size: "lg", variant: "outline", className: "group h-14 px-10 text-lg", asChild: true, children: _jsxs("a", { href: "#demo", children: [_jsx(Play, { className: "mr-2 w-5 h-5" }), "Watch Demo Video"] }) }), _jsx(Button, { size: "lg", variant: "outline", className: "group h-14 px-10 text-lg", asChild: true, children: _jsxs("a", { href: "https://github.com", target: "_blank", rel: "noopener noreferrer", children: [_jsx(Github, { className: "mr-2 w-5 h-5" }), "View on GitHub"] }) })] }), _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5 }, className: "flex flex-wrap justify-center gap-4", children: ['Stacks', 'Clarity', 'sBTC', 'AI', 'Bitcoin', 'DAO'].map((tech) => (_jsx("div", { className: "px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 ring-1 ring-gray-200", children: tech }, tech))) })] }), _jsxs("div", { className: "absolute inset-0 -z-10 overflow-hidden pointer-events-none", children: [_jsx(motion.div, { className: "absolute top-1/4 left-1/4 w-4 h-4 bg-orange-500 rounded-full", animate: {
                            y: [0, -20, 0],
                            opacity: [0.5, 1, 0.5],
                        }, transition: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        } }), _jsx(motion.div, { className: "absolute top-1/3 right-1/4 w-6 h-6 bg-blue-500 rounded-full", animate: {
                            y: [0, 20, 0],
                            opacity: [0.7, 1, 0.7],
                        }, transition: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1,
                        } }), _jsx(motion.div, { className: "absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-500 rounded-full", animate: {
                            y: [0, -15, 0],
                            opacity: [0.3, 0.8, 0.3],
                        }, transition: {
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5,
                        } })] })] }));
}
