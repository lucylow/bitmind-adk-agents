import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, ArrowRight, AlertCircle, FileText, Brain } from "lucide-react";
import { invoiceService } from '../services/invoiceService';
import { useNavigate } from 'react-router-dom';
const CreateInvoice = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [description, setDescription] = useState('');
    const [projectTitle, setProjectTitle] = useState('');
    const [contractorAddress, setContractorAddress] = useState('');
    const [arbitratorAddress, setArbitratorAddress] = useState('');
    const [aiPreview, setAiPreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [deploymentResult, setDeploymentResult] = useState(null);
    const steps = [
        { id: 0, name: 'Describe', description: 'Tell us about your project' },
        { id: 1, name: 'Review', description: 'Check AI-generated contract' },
        { id: 2, name: 'Deploy', description: 'Deploy to blockchain' },
        { id: 3, name: 'Success', description: 'Invoice created' },
    ];
    // Auto-generate AI preview when description is ready
    useEffect(() => {
        if (description && description.length > 30 && currentStep === 0) {
            const timer = setTimeout(async () => {
                try {
                    const preview = await invoiceService.getAIPreview(description);
                    setAiPreview(preview);
                }
                catch (error) {
                    console.error('AI preview failed:', error);
                }
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [description, currentStep]);
    const handleStep1Submit = () => {
        if (!aiPreview || !description || !contractorAddress) {
            alert('Please fill in all required fields and wait for AI processing');
            return;
        }
        setCurrentStep(1);
    };
    const handleStep2Submit = async () => {
        setIsProcessing(true);
        setCurrentStep(2);
        try {
            const result = await invoiceService.createSmartInvoice({
                description,
                projectTitle: projectTitle || aiPreview?.project_title || 'Untitled Project',
                clientWallet: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
                contractorAddress,
                arbitratorAddress: arbitratorAddress || 'SP1KFJXJ8Q9HV7YP3WGH98JN3JKZM7RQ2TKXHXF4N',
            });
            setDeploymentResult(result);
            setCurrentStep(3);
        }
        catch (error) {
            alert(`Deployment failed: ${error.message}`);
            setCurrentStep(1);
        }
        finally {
            setIsProcessing(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("div", { className: "inline-block mb-4", children: _jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg", children: _jsx(Sparkles, { className: "w-8 h-8 text-white" }) }) }), _jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-4", children: "Create Smart Invoice with AI" }), _jsx("p", { className: "text-xl text-gray-600 max-w-2xl mx-auto", children: "Transform your project description into a secure, blockchain-powered smart contract" })] }), _jsx("div", { className: "max-w-4xl mx-auto mb-12", children: _jsx("div", { className: "flex items-center justify-center", children: steps.map((step, index) => (_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: `w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${index < currentStep
                                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                                                : index === currentStep
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-4 ring-blue-100'
                                                    : 'bg-gray-200 text-gray-500'}`, children: index < currentStep ? (_jsx(CheckCircle2, { className: "w-5 h-5" })) : (index + 1) }), _jsxs("div", { className: "mt-3 text-center", children: [_jsx("div", { className: `text-sm font-medium ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'}`, children: step.name }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: step.description })] })] }), index < steps.length - 1 && (_jsx("div", { className: `flex-1 h-1 mx-4 mt-6 rounded-full transition-all duration-300 min-w-[80px] ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}` }))] }, step.id))) }) }), _jsx("div", { className: "max-w-4xl mx-auto", children: _jsx(Card, { className: "shadow-xl border-2 border-gray-200", children: _jsxs(CardContent, { className: "p-8", children: [currentStep === 0 && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Project Title ", _jsx("span", { className: "text-orange-500", children: "*" })] }), _jsx("input", { type: "text", value: projectTitle, onChange: (e) => setProjectTitle(e.target.value), className: "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all", placeholder: "e.g., Website Redesign for Marketing DAO" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Describe Your Project in Detail ", _jsx("span", { className: "text-orange-500", children: "*" })] }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), rows: 8, className: "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none", placeholder: "Example: Create a responsive website for our DAO with 3 milestones: \n1. Design approval (30% - 1,500 sBTC)\n2. Frontend development (50% - 2,500 sBTC)  \n3. Backend integration and launch (20% - 1,000 sBTC)\nTotal budget: 5,000 sBTC. Timeline: 6 weeks." }), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [_jsx("div", { className: "text-sm", children: description.length < 30 ? (_jsxs("span", { className: "text-orange-600 flex items-center gap-1", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), "Provide more details (minimum 30 characters)"] })) : (_jsxs("span", { className: "text-green-600 flex items-center gap-1", children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), "AI is processing your description..."] })) }), _jsxs("div", { className: "text-sm text-gray-500", children: [description.length, " characters"] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Contractor Wallet Address ", _jsx("span", { className: "text-orange-500", children: "*" })] }), _jsx("input", { type: "text", value: contractorAddress, onChange: (e) => setContractorAddress(e.target.value), className: "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm", placeholder: "SP3FGQ8Z7JY..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Arbitrator Address (Optional)" }), _jsx("input", { type: "text", value: arbitratorAddress, onChange: (e) => setArbitratorAddress(e.target.value), className: "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm", placeholder: "SP3FGQ8Z7JY... (Leave empty for default)" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "An independent third party to resolve disputes" })] }), aiPreview && (_jsxs(Card, { className: "bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-blue-900", children: [_jsx(Brain, { className: "w-5 h-5" }), "AI Preview", _jsxs(Badge, { className: "ml-2 bg-green-500", children: [Math.round(aiPreview.confidence * 100), "% Confidence"] })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm mb-4", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Total Amount:" }), _jsxs("div", { className: "text-lg font-bold text-blue-900", children: [aiPreview.total_amount, " ", aiPreview.currency] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Milestones:" }), _jsxs("div", { className: "text-lg font-bold text-purple-900", children: [aiPreview.milestones.length, " milestones detected"] })] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Project Scope:" }), _jsx("p", { className: "text-sm text-gray-700 mt-1", children: aiPreview.project_scope })] })] })] })), _jsx("div", { className: "flex justify-end pt-6 border-t border-gray-200", children: _jsxs(Button, { onClick: handleStep1Submit, disabled: !aiPreview || description.length < 30 || !contractorAddress, size: "lg", className: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50", children: ["Continue to Review", _jsx(ArrowRight, { className: "ml-2 w-5 h-5" })] }) })] })), currentStep === 1 && aiPreview && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Review Contract Terms" }), _jsx("p", { className: "text-gray-600", children: "Verify the AI-generated smart contract details" })] }), _jsxs(Card, { className: "bg-gray-50", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Project Overview" }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Project Title:" }), _jsx("span", { className: "font-semibold", children: projectTitle || aiPreview.project_title })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Total Budget:" }), _jsxs("span", { className: "font-semibold", children: [aiPreview.total_amount, " ", aiPreview.currency] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Timeline:" }), _jsx("span", { className: "font-semibold", children: aiPreview.timeline })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Contractor:" }), _jsxs("span", { className: "font-mono text-xs", children: [contractorAddress.slice(0, 12), "..."] })] })] })] }), _jsxs(Card, { className: "bg-gray-50", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { children: ["Milestones (", aiPreview.milestones.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: aiPreview.milestones.map((milestone, index) => (_jsxs("div", { className: "border-l-4 border-blue-500 pl-4 py-2 bg-white rounded-r-lg", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("span", { className: "font-semibold text-gray-900", children: ["Milestone ", index + 1] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-blue-600 font-bold", children: [milestone.amount, " ", aiPreview.currency] }), _jsxs("div", { className: "text-xs text-gray-500", children: [milestone.percentage, "%"] })] })] }), _jsx("p", { className: "text-sm text-gray-700 mb-1", children: milestone.description }), _jsxs("p", { className: "text-xs text-gray-500", children: [_jsx("span", { className: "font-medium", children: "Condition:" }), " ", milestone.condition] })] }, index))) }) })] }), _jsxs("div", { className: "flex justify-between pt-6 border-t border-gray-200", children: [_jsx(Button, { onClick: () => setCurrentStep(0), variant: "outline", size: "lg", children: "Back to Edit" }), _jsxs(Button, { onClick: handleStep2Submit, size: "lg", className: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all", children: [_jsx(CheckCircle2, { className: "mr-2 w-5 h-5" }), "Deploy Smart Contract"] })] })] })), currentStep === 2 && (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Deploying Contract" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Please confirm the transaction in your wallet..." }), _jsxs("div", { className: "inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg", children: [_jsx("div", { className: "w-2 h-2 bg-blue-600 rounded-full animate-pulse" }), _jsx("span", { className: "text-sm text-blue-900 font-medium", children: "Processing on Stacks blockchain" })] })] })), currentStep === 3 && deploymentResult && (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6", children: _jsx(CheckCircle2, { className: "w-12 h-12 text-green-600" }) }), _jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Invoice Created Successfully!" }), _jsx("p", { className: "text-gray-600 mb-8", children: "Your smart contract has been deployed to the Stacks blockchain" }), _jsx(Card, { className: "bg-gray-50 max-w-md mx-auto mb-8", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "space-y-3 text-left", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Invoice ID:" }), _jsx("span", { className: "font-mono font-semibold", children: deploymentResult.invoiceId })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Contract:" }), _jsx("span", { className: "font-mono text-xs", children: deploymentResult.contractAddress })] })] }) }) }), _jsxs("div", { className: "flex gap-4 justify-center", children: [_jsxs(Button, { onClick: () => navigate('/invoices'), size: "lg", className: "bg-gradient-to-r from-blue-600 to-purple-600", children: [_jsx(FileText, { className: "mr-2 w-5 h-5" }), "View All Invoices"] }), _jsx(Button, { onClick: () => {
                                                        setCurrentStep(0);
                                                        setDescription('');
                                                        setProjectTitle('');
                                                        setContractorAddress('');
                                                        setArbitratorAddress('');
                                                        setAiPreview(null);
                                                        setDeploymentResult(null);
                                                    }, variant: "outline", size: "lg", children: "Create Another" })] })] }))] }) }) })] }) }));
};
export default CreateInvoice;
