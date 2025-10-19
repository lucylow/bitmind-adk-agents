import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, FileText, Zap, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useWalletStore } from "@/store/useWalletStore";
const InvoiceCreationWizard = () => {
    const [step, setStep] = useState(1);
    const [aiInput, setAiInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const { isConnected, userAddress, network } = useWalletStore();
    // Simulate AI processing of natural language input
    const processAIInput = async () => {
        if (!aiInput.trim()) {
            toast.error("Please describe your invoice");
            return;
        }
        setIsProcessing(true);
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Parse the input (in real implementation, this would call GPT-4/Claude)
        const mockParsedData = {
            client: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
            arbitrator: "SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159",
            totalAmount: 5000,
            milestones: [
                { id: 1, description: "Initial design mockups", amount: 1500 },
                { id: 2, description: "Frontend implementation", amount: 2000 },
                { id: 3, description: "Testing and deployment", amount: 1500 },
            ],
            description: aiInput,
        };
        setInvoiceData(mockParsedData);
        setIsProcessing(false);
        setStep(2);
        toast.success("Invoice parsed successfully!");
    };
    const createInvoice = async () => {
        if (!isConnected || !invoiceData) {
            toast.error("Please connect your wallet first");
            return;
        }
        try {
            setIsProcessing(true);
            // In real implementation, this would call the smart contract
            // const result = await createInvoice(
            //   invoiceData.client,
            //   invoiceData.arbitrator,
            //   invoiceData.totalAmount,
            //   invoiceData.milestones.length,
            //   getNetwork(network === 'mainnet')
            // );
            // Simulate contract creation
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success("Invoice created successfully!");
            setStep(3);
            setIsProcessing(false);
        }
        catch (error) {
            console.error("Error creating invoice:", error);
            toast.error("Failed to create invoice");
            setIsProcessing(false);
        }
    };
    const resetWizard = () => {
        setStep(1);
        setAiInput("");
        setInvoiceData(null);
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("div", { className: "mb-8", children: _jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`, children: _jsx(MessageSquare, { className: "w-4 h-4" }) }), _jsx("span", { className: `text-sm font-medium ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`, children: "Describe Invoice" })] }), _jsx("div", { className: "flex-1 h-0.5 bg-secondary mx-4" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`, children: _jsx(FileText, { className: "w-4 h-4" }) }), _jsx("span", { className: `text-sm font-medium ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`, children: "Review Details" })] }), _jsx("div", { className: "flex-1 h-0.5 bg-secondary mx-4" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`, children: _jsx(CheckCircle, { className: "w-4 h-4" }) }), _jsx("span", { className: `text-sm font-medium ${step >= 3 ? 'text-foreground' : 'text-muted-foreground'}`, children: "Complete" })] })] }) }), step === 1 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-5 h-5 text-primary" }), "AI-Powered Invoice Creation"] }), _jsx(CardDescription, { children: "Describe your invoice in natural language, and our AI will structure it for you" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Describe your invoice" }), _jsx("textarea", { className: "w-full h-32 p-3 border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary", placeholder: "Example: I need to create an invoice for building a website for DeFi DAO. The total is $5,000 with 3 milestones: design ($1,500), development ($2,000), and deployment ($1,500). The client is SP2J6... and arbitrator is SP3FGQ...", value: aiInput, onChange: (e) => setAiInput(e.target.value) })] }), _jsx(Button, { onClick: processAIInput, disabled: isProcessing || !aiInput.trim(), className: "w-full", children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Zap, { className: "w-4 h-4 mr-2 animate-pulse" }), "Processing with AI..."] })) : (_jsxs(_Fragment, { children: [_jsx(Zap, { className: "w-4 h-4 mr-2" }), "Generate Invoice"] })) })] }) })] })), step === 2 && invoiceData && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Review Invoice Details" }), _jsx(CardDescription, { children: "Verify the AI-generated invoice structure before creating" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: "Description" }), _jsx("p", { className: "text-sm text-muted-foreground", children: invoiceData.description })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2 text-sm", children: "Client Address" }), _jsx("p", { className: "text-xs font-mono bg-secondary p-2 rounded", children: invoiceData.client })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2 text-sm", children: "Arbitrator Address" }), _jsx("p", { className: "text-xs font-mono bg-secondary p-2 rounded", children: invoiceData.arbitrator })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: "Total Amount" }), _jsxs("p", { className: "text-2xl font-bold", children: ["$", invoiceData.totalAmount.toLocaleString()] })] }), _jsxs("div", { children: [_jsxs("h3", { className: "font-semibold mb-3", children: ["Milestones (", invoiceData.milestones.length, ")"] }), _jsx("div", { className: "space-y-3", children: invoiceData.milestones.map((milestone) => (_jsxs("div", { className: "flex items-center justify-between p-3 border border-border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Badge, { variant: "outline", children: ["#", milestone.id] }), _jsx("span", { className: "text-sm", children: milestone.description })] }), _jsxs("span", { className: "font-semibold", children: ["$", milestone.amount.toLocaleString()] })] }, milestone.id))) })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "outline", onClick: () => setStep(1), className: "flex-1", children: "Back to Edit" }), _jsx(Button, { onClick: createInvoice, disabled: isProcessing || !isConnected, className: "flex-1", children: isProcessing ? "Creating..." : "Create Invoice" })] })] }) })] })), step === 3 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2 text-green-600", children: [_jsx(CheckCircle, { className: "w-6 h-6" }), "Invoice Created Successfully!"] }), _jsx(CardDescription, { children: "Your invoice has been deployed to the Stacks blockchain" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-4 bg-secondary rounded-lg", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-2", children: "Invoice ID" }), _jsxs("p", { className: "font-mono font-semibold", children: ["#INV-", Math.floor(Math.random() * 10000)] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm", children: "\u2705 Smart contract deployed" }), _jsx("p", { className: "text-sm", children: "\u2705 Milestones configured" }), _jsx("p", { className: "text-sm", children: "\u2705 Escrow initialized" })] }), _jsx(Button, { onClick: resetWizard, className: "w-full", children: "Create Another Invoice" })] }) })] }))] }));
};
export default InvoiceCreationWizard;
