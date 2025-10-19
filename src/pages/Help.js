import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Zap, Bitcoin, CheckCircle2, Users, ArrowRight, BookOpen, MessageCircle, Code, ExternalLink } from "lucide-react";
const Help = () => {
    const features = [
        {
            icon: _jsx(Zap, { className: "w-8 h-8 text-blue-600" }),
            title: "AI-Powered Invoice Creation",
            description: "Use natural language to create invoices. Just describe what you need, and our AI will generate the smart contract.",
            steps: [
                "Click 'Create New Invoice'",
                "Describe your project in plain English",
                "Review the generated milestones and terms",
                "Submit for DAO approval"
            ]
        },
        {
            icon: _jsx(Bitcoin, { className: "w-8 h-8 text-orange-600" }),
            title: "Escrow & Payment",
            description: "Secure Bitcoin-native escrow using Stacks blockchain and sBTC for trustless milestone payments.",
            steps: [
                "DAO approves and funds the invoice",
                "Funds locked in smart contract escrow",
                "Contractor completes milestones",
                "Payments released automatically"
            ]
        },
        {
            icon: _jsx(FileText, { className: "w-8 h-8 text-purple-600" }),
            title: "Milestone Management",
            description: "Track progress with granular milestones. Each milestone has its own deliverables and payment amounts.",
            steps: [
                "Define clear milestone deliverables",
                "Submit proof of completion",
                "DAO reviews and approves",
                "Funds released to contractor"
            ]
        },
        {
            icon: _jsx(Shield, { className: "w-8 h-8 text-red-600" }),
            title: "Dispute Resolution",
            description: "Fair and transparent dispute handling with decentralized arbitrators when disagreements arise.",
            steps: [
                "Either party initiates dispute",
                "Evidence submitted on-chain",
                "Arbitrators review and vote",
                "Binding resolution executed"
            ]
        }
    ];
    const faqs = [
        {
            question: "What is BitMind?",
            answer: "BitMind is an AI-powered invoice escrow platform for DAOs built on the Stacks blockchain. It automates contractor payments using smart contracts and milestone-based releases."
        },
        {
            question: "How does the escrow system work?",
            answer: "When a DAO funds an invoice, the payment is locked in a Clarity smart contract. As contractors complete milestones, the DAO reviews and approves, triggering automatic payment releases."
        },
        {
            question: "What happens during a dispute?",
            answer: "Either party can initiate a dispute. Both sides submit evidence, and selected arbitrators review the case and vote on a resolution. The smart contract automatically executes the decision."
        },
        {
            question: "What assets are supported?",
            answer: "BitMind supports sBTC (Stacks Bitcoin), STX tokens, and various bridged assets. Multi-asset invoices allow flexible payment structures."
        },
        {
            question: "How are arbitrators selected?",
            answer: "Arbitrators are randomly selected from a pool of verified community members with good reputation scores. They stake tokens to ensure honest voting."
        },
        {
            question: "Can I cancel an invoice?",
            answer: "Yes, invoices can be cancelled before being funded. After funding, both parties must agree to cancellation, or a dispute resolution process is required."
        }
    ];
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100", children: _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "text-5xl font-bold text-gray-900 mb-4", children: "Help & Documentation" }), _jsx("p", { className: "text-xl text-gray-600 max-w-3xl mx-auto", children: "Everything you need to know about using BitMind for your DAO's invoice management" })] }), _jsxs(Card, { className: "mb-12 shadow-lg border-2 border-blue-200", children: [_jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-indigo-50", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(BookOpen, { className: "w-8 h-8 text-blue-600" }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-3xl", children: "Quick Start Guide" }), _jsx(CardDescription, { className: "text-base", children: "Get up and running in 5 minutes" })] })] }) }), _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "grid md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs("div", { className: "text-center p-4", children: [_jsx("div", { className: "bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3", children: _jsx("span", { className: "text-blue-600 font-bold text-xl", children: "1" }) }), _jsx("h3", { className: "font-semibold mb-2", children: "Connect Wallet" }), _jsx("p", { className: "text-sm text-gray-600", children: "Link your Stacks wallet to get started" })] }), _jsxs("div", { className: "text-center p-4", children: [_jsx("div", { className: "bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3", children: _jsx("span", { className: "text-purple-600 font-bold text-xl", children: "2" }) }), _jsx("h3", { className: "font-semibold mb-2", children: "Create Invoice" }), _jsx("p", { className: "text-sm text-gray-600", children: "Use AI to generate smart contract terms" })] }), _jsxs("div", { className: "text-center p-4", children: [_jsx("div", { className: "bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3", children: _jsx("span", { className: "text-orange-600 font-bold text-xl", children: "3" }) }), _jsx("h3", { className: "font-semibold mb-2", children: "Fund Escrow" }), _jsx("p", { className: "text-sm text-gray-600", children: "DAO approves and funds the contract" })] }), _jsxs("div", { className: "text-center p-4", children: [_jsx("div", { className: "bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3", children: _jsx("span", { className: "text-green-600 font-bold text-xl", children: "4" }) }), _jsx("h3", { className: "font-semibold mb-2", children: "Complete & Get Paid" }), _jsx("p", { className: "text-sm text-gray-600", children: "Finish milestones and receive payments" })] })] }) })] }), _jsxs("div", { className: "mb-12", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-6", children: "Core Features" }), _jsx("div", { className: "grid md:grid-cols-2 gap-6", children: features.map((feature, index) => (_jsxs(Card, { className: "shadow-md hover:shadow-xl transition-all", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "bg-gradient-to-br from-gray-100 to-gray-200 p-3 rounded-lg", children: feature.icon }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-xl mb-2", children: feature.title }), _jsx(CardDescription, { className: "text-base", children: feature.description })] })] }) }), _jsxs(CardContent, { children: [_jsx("h4", { className: "font-semibold text-sm text-gray-700 mb-3", children: "How it works:" }), _jsx("ol", { className: "space-y-2", children: feature.steps.map((step, stepIndex) => (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5", children: stepIndex + 1 }), _jsx("span", { className: "text-sm text-gray-600", children: step })] }, stepIndex))) })] })] }, index))) })] }), _jsxs("div", { className: "mb-12", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-6", children: "Frequently Asked Questions" }), _jsx("div", { className: "space-y-4", children: faqs.map((faq, index) => (_jsxs(Card, { className: "shadow-md hover:shadow-lg transition-all", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-lg flex items-start gap-2", children: [_jsx(CheckCircle2, { className: "w-5 h-5 text-green-500 mt-1 flex-shrink-0" }), faq.question] }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-gray-600 leading-relaxed", children: faq.answer }) })] }, index))) })] }), _jsxs("div", { className: "mb-12", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-6", children: "Developer Resources" }), _jsxs("div", { className: "grid md:grid-cols-3 gap-6", children: [_jsxs(Card, { className: "shadow-md hover:shadow-xl transition-all border-t-4 border-t-blue-500", children: [_jsxs(CardHeader, { children: [_jsx(Code, { className: "w-10 h-10 text-blue-600 mb-3" }), _jsx(CardTitle, { children: "Smart Contracts" }), _jsx(CardDescription, { children: "Explore our open-source Clarity contracts" })] }), _jsx(CardContent, { children: _jsxs(Button, { variant: "outline", className: "w-full", children: ["View on GitHub", _jsx(ExternalLink, { className: "ml-2 w-4 h-4" })] }) })] }), _jsxs(Card, { className: "shadow-md hover:shadow-xl transition-all border-t-4 border-t-purple-500", children: [_jsxs(CardHeader, { children: [_jsx(BookOpen, { className: "w-10 h-10 text-purple-600 mb-3" }), _jsx(CardTitle, { children: "API Documentation" }), _jsx(CardDescription, { children: "Integrate BitMind into your app" })] }), _jsx(CardContent, { children: _jsxs(Button, { variant: "outline", className: "w-full", children: ["Read Docs", _jsx(ExternalLink, { className: "ml-2 w-4 h-4" })] }) })] }), _jsxs(Card, { className: "shadow-md hover:shadow-xl transition-all border-t-4 border-t-green-500", children: [_jsxs(CardHeader, { children: [_jsx(Users, { className: "w-10 h-10 text-green-600 mb-3" }), _jsx(CardTitle, { children: "Community" }), _jsx(CardDescription, { children: "Join our Discord for support" })] }), _jsx(CardContent, { children: _jsxs(Button, { variant: "outline", className: "w-full", children: ["Join Discord", _jsx(ExternalLink, { className: "ml-2 w-4 h-4" })] }) })] })] })] }), _jsx(Card, { className: "shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white", children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx(MessageCircle, { className: "w-16 h-16 mx-auto mb-6 opacity-90" }), _jsx("h2", { className: "text-3xl font-bold mb-4", children: "Still Have Questions?" }), _jsx("p", { className: "text-lg text-blue-100 mb-8 max-w-2xl mx-auto", children: "Our support team is here to help. Get in touch and we'll respond within 24 hours." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsxs(Button, { size: "lg", variant: "secondary", className: "font-semibold", children: ["Contact Support", _jsx(ArrowRight, { className: "ml-2 w-5 h-5" })] }), _jsx(Button, { size: "lg", variant: "outline", className: "font-semibold bg-transparent text-white border-white hover:bg-white hover:text-blue-600", children: "Schedule Demo" })] })] }) })] }) }));
};
export default Help;
