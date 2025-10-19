import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Smart Invoice Demo Component
 * Step-by-step workflow for AI-powered invoice creation and escrow
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Circle, Loader2, Sparkles, FileText, Wallet, ArrowRight, Check, } from 'lucide-react';
import { parseInvoiceWithOpenAI, parseInvoiceWithClaude, validateInvoiceData } from '@/lib/aiInvoiceParser';
import { createInvoice, transferTokensToEscrow, acknowledgeDeposit, releaseFunds, satoshisToBtc, } from '@/lib/stacksIntegration';
const STEPS = [
    { id: 'parse', label: 'AI Parse Invoice', description: 'Extract data from natural language' },
    { id: 'review', label: 'Review & Edit', description: 'Verify extracted information' },
    { id: 'create', label: 'Create Invoice', description: 'Deploy on-chain' },
    { id: 'deposit', label: 'Deposit sBTC', description: 'Transfer to escrow' },
    { id: 'acknowledge', label: 'Acknowledge Deposit', description: 'Mark as funded' },
    { id: 'release', label: 'Release Funds', description: 'Complete payment' },
    { id: 'complete', label: 'Complete', description: 'Invoice settled' },
];
export default function SmartInvoiceDemo() {
    const [currentStep, setCurrentStep] = useState('parse');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Invoice data
    const [invoiceText, setInvoiceText] = useState(`Invoice #2024-001
To: SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7 (Alice)
From: WebGuild DAO
Description: UX redesign and deliverables: wireframes + responsive pages
Amount: 0.05 sBTC due on 2025-12-31
Milestones: Initial mockups (50%) | Final delivery (50%)
Arbiter: SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE`);
    const [parsedData, setParsedData] = useState(null);
    const [apiKey, setApiKey] = useState('');
    const [aiProvider, setAiProvider] = useState('openai');
    // Transaction data
    const [txHash, setTxHash] = useState(null);
    const [invoiceStatus, setInvoiceStatus] = useState('');
    /**
     * Step 1: Parse invoice with AI
     */
    const handleParseInvoice = async () => {
        setLoading(true);
        setError(null);
        try {
            let parsed;
            if (aiProvider === 'openai') {
                parsed = await parseInvoiceWithOpenAI(invoiceText, apiKey);
            }
            else {
                parsed = await parseInvoiceWithClaude(invoiceText, apiKey);
            }
            const validation = validateInvoiceData(parsed);
            if (!validation.valid) {
                setError(`Validation errors: ${validation.errors.join(', ')}`);
                return;
            }
            setParsedData(parsed);
            setCurrentStep('review');
        }
        catch (err) {
            setError(err.message || 'Failed to parse invoice');
        }
        finally {
            setLoading(false);
        }
    };
    /**
     * Step 2: Review and proceed to create
     */
    const handleReviewComplete = () => {
        setCurrentStep('create');
    };
    /**
     * Step 3: Create invoice on-chain
     */
    const handleCreateInvoice = async () => {
        if (!parsedData)
            return;
        setLoading(true);
        setError(null);
        try {
            await createInvoice(parsedData.invoice_id, parsedData.payee || '', parsedData.amount, parsedData.token_contract || '', parsedData.arbiter || '', 99999999, // Deadline in block height
            null // User session
            );
            setCurrentStep('deposit');
        }
        catch (err) {
            setError(err.message || 'Failed to create invoice');
        }
        finally {
            setLoading(false);
        }
    };
    /**
     * Step 4: Deposit tokens to escrow
     */
    const handleDepositTokens = async () => {
        if (!parsedData)
            return;
        setLoading(true);
        setError(null);
        try {
            await transferTokensToEscrow(parsedData.amount, parsedData.payer || '', null);
            setCurrentStep('acknowledge');
        }
        catch (err) {
            setError(err.message || 'Failed to deposit tokens');
        }
        finally {
            setLoading(false);
        }
    };
    /**
     * Step 5: Acknowledge deposit
     */
    const handleAcknowledgeDeposit = async () => {
        if (!parsedData)
            return;
        setLoading(true);
        setError(null);
        try {
            await acknowledgeDeposit(parsedData.invoice_id, null);
            setInvoiceStatus('FUNDED');
            setCurrentStep('release');
        }
        catch (err) {
            setError(err.message || 'Failed to acknowledge deposit');
        }
        finally {
            setLoading(false);
        }
    };
    /**
     * Step 6: Release funds
     */
    const handleReleaseFunds = async () => {
        if (!parsedData)
            return;
        setLoading(true);
        setError(null);
        try {
            await releaseFunds(parsedData.invoice_id, null);
            setInvoiceStatus('RELEASED');
            setCurrentStep('complete');
        }
        catch (err) {
            setError(err.message || 'Failed to release funds');
        }
        finally {
            setLoading(false);
        }
    };
    /**
     * Render step indicator
     */
    const renderStepIndicator = () => (_jsx("div", { className: "flex items-center justify-between mb-8 overflow-x-auto pb-4", children: STEPS.map((step, index) => {
            const stepIndex = STEPS.findIndex(s => s.id === currentStep);
            const isComplete = index < stepIndex;
            const isCurrent = step.id === currentStep;
            return (_jsxs("div", { className: "flex items-center flex-shrink-0", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: `
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                ${isComplete ? 'bg-green-500 border-green-500' : ''}
                ${isCurrent ? 'bg-blue-500 border-blue-500' : ''}
                ${!isComplete && !isCurrent ? 'bg-gray-100 border-gray-300' : ''}
              `, children: isComplete ? (_jsx(CheckCircle2, { className: "w-5 h-5 text-white" })) : isCurrent ? (_jsx(Circle, { className: "w-5 h-5 text-white fill-current" })) : (_jsx(Circle, { className: "w-5 h-5 text-gray-400" })) }), _jsx("span", { className: `
                mt-2 text-xs font-medium text-center max-w-[100px]
                ${isCurrent ? 'text-blue-600' : 'text-gray-500'}
              `, children: step.label })] }), index < STEPS.length - 1 && (_jsx("div", { className: `
                w-12 h-0.5 mx-2 mt-[-20px]
                ${isComplete ? 'bg-green-500' : 'bg-gray-300'}
              ` }))] }, step.id));
        }) }));
    return (_jsxs("div", { className: "container mx-auto py-8 px-4 max-w-5xl", children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsx("h1", { className: "text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent", children: "Smart Invoice Deals for DAOs" }), _jsx("p", { className: "text-gray-600", children: "AI-powered Bitcoin-native invoicing on Stacks" })] }), renderStepIndicator(), error && (_jsx(Alert, { variant: "destructive", className: "mb-6", children: _jsx(AlertDescription, { children: error }) })), currentStep === 'parse' && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-5 h-5" }), "AI Invoice Parser"] }), _jsx(CardDescription, { children: "Paste your invoice text below and let AI extract the structured data" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Select AI Provider" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: aiProvider === 'openai' ? 'default' : 'outline', onClick: () => setAiProvider('openai'), children: "OpenAI GPT-4" }), _jsx(Button, { variant: aiProvider === 'claude' ? 'default' : 'outline', onClick: () => setAiProvider('claude'), children: "Anthropic Claude" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "API Key" }), _jsx(Input, { type: "password", placeholder: `Enter your ${aiProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API key`, value: apiKey, onChange: (e) => setApiKey(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Invoice Text" }), _jsx(Textarea, { rows: 10, placeholder: "Paste your invoice text here...", value: invoiceText, onChange: (e) => setInvoiceText(e.target.value), className: "font-mono text-sm" })] }), _jsx(Button, { onClick: handleParseInvoice, disabled: loading || !apiKey, className: "w-full", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Parsing with AI..."] })) : (_jsxs(_Fragment, { children: [_jsx(Sparkles, { className: "w-4 h-4 mr-2" }), "Parse Invoice with AI"] })) })] })] })), currentStep === 'review' && parsedData && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5" }), "Review Extracted Data"] }), _jsx(CardDescription, { children: "Verify the information extracted by AI" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Invoice ID" }), _jsx("p", { className: "text-lg font-semibold", children: parsedData.invoice_id })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Amount" }), _jsxs("p", { className: "text-lg font-semibold", children: [satoshisToBtc(parsedData.amount), " sBTC", _jsxs("span", { className: "text-sm text-gray-500 ml-2", children: ["(", parsedData.amount.toLocaleString(), " sats)"] })] })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Payee" }), _jsx("p", { className: "text-sm font-mono bg-gray-50 p-2 rounded", children: parsedData.payee })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Arbiter" }), _jsx("p", { className: "text-sm font-mono bg-gray-50 p-2 rounded", children: parsedData.arbiter })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Milestone Description" }), _jsx("p", { className: "text-sm bg-gray-50 p-2 rounded", children: parsedData.milestone_description })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Deadline" }), _jsx("p", { className: "text-sm", children: parsedData.deadline || 'No deadline' })] })] }), _jsxs(Button, { onClick: handleReviewComplete, className: "w-full", children: ["Looks Good, Continue", _jsx(ArrowRight, { className: "w-4 h-4 ml-2" })] })] })] })), ['create', 'deposit', 'acknowledge', 'release'].includes(currentStep) && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Wallet, { className: "w-5 h-5" }), STEPS.find(s => s.id === currentStep)?.label] }), _jsx(CardDescription, { children: STEPS.find(s => s.id === currentStep)?.description })] }), _jsxs(CardContent, { className: "space-y-4", children: [parsedData && (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Invoice ID:" }), _jsxs("span", { className: "font-mono font-semibold", children: ["#", parsedData.invoice_id] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Amount:" }), _jsxs("span", { className: "font-semibold", children: [satoshisToBtc(parsedData.amount), " sBTC"] })] }), invoiceStatus && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Status:" }), _jsx(Badge, { variant: invoiceStatus === 'RELEASED' ? 'default' : 'secondary', children: invoiceStatus })] }))] })), _jsx(Button, { onClick: currentStep === 'create' ? handleCreateInvoice :
                                    currentStep === 'deposit' ? handleDepositTokens :
                                        currentStep === 'acknowledge' ? handleAcknowledgeDeposit :
                                            handleReleaseFunds, disabled: loading, className: "w-full", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Processing..."] })) : (_jsxs(_Fragment, { children: [STEPS.find(s => s.id === currentStep)?.label, _jsx(ArrowRight, { className: "w-4 h-4 ml-2" })] })) })] })] })), currentStep === 'complete' && (_jsxs(Card, { className: "border-green-500", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2 text-green-600", children: [_jsx(Check, { className: "w-6 h-6" }), "Invoice Complete!"] }), _jsx(CardDescription, { children: "Funds have been successfully released to the payee" })] }), _jsxs(CardContent, { className: "space-y-4", children: [parsedData && (_jsxs("div", { className: "bg-green-50 p-6 rounded-lg space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Invoice ID:" }), _jsxs("span", { className: "font-mono font-bold text-lg", children: ["#", parsedData.invoice_id] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Amount Transferred:" }), _jsxs("span", { className: "font-bold text-lg text-green-600", children: [satoshisToBtc(parsedData.amount), " sBTC"] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Status:" }), _jsx(Badge, { className: "bg-green-500", children: "RELEASED" })] })] })), _jsx(Button, { variant: "outline", onClick: () => {
                                    setCurrentStep('parse');
                                    setParsedData(null);
                                    setError(null);
                                    setInvoiceStatus('');
                                }, className: "w-full", children: "Create Another Invoice" })] })] }))] }));
}
