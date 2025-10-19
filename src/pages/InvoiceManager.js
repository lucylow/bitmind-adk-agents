import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Search, Calendar, User, DollarSign, CheckCircle2, Clock, AlertCircle, Sparkles } from "lucide-react";
import { invoiceService } from '../services/invoiceService';
const InvoiceManager = () => {
    const [filterStatus, setFilterStatus] = useState("all");
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    useEffect(() => {
        loadInvoices();
    }, []);
    const loadInvoices = async () => {
        try {
            setLoading(true);
            // For demo purposes, load all invoices
            const allInvoices = await invoiceService.getAllInvoices();
            setInvoices(allInvoices);
        }
        catch (error) {
            console.error('Failed to load invoices:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const filteredInvoices = invoices.filter(inv => {
        const matchesStatus = filterStatus === "all" || inv.status.toLowerCase() === filterStatus;
        const matchesSearch = searchQuery === "" ||
            inv.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.daoName?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });
    const calculateProgress = (invoice) => {
        const completedMilestones = invoice.milestones.filter(m => m.status === 'RELEASED').length;
        return Math.round((completedMilestones / invoice.milestones.length) * 100);
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-gray-600 text-lg", children: "Loading invoices..." })] }) }));
    }
    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return _jsx(CheckCircle2, { className: "w-5 h-5 text-green-500" });
            case "funded":
                return _jsx(Clock, { className: "w-5 h-5 text-blue-500" });
            case "pending":
                return _jsx(AlertCircle, { className: "w-5 h-5 text-yellow-500" });
            case "dispute":
                return _jsx(AlertCircle, { className: "w-5 h-5 text-red-500" });
            default:
                return null;
        }
    };
    const getStatusBadge = (status) => {
        const variants = {
            completed: "default",
            funded: "secondary",
            pending: "outline",
            dispute: "destructive"
        };
        return variants[status] || "outline";
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100", children: _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("div", { className: "mb-8", children: _jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-2", children: "Invoice Manager" }), _jsx("p", { className: "text-gray-600 text-lg", children: "Create, track, and manage all your DAO invoices" })] }), _jsxs(Button, { size: "lg", className: "shadow-lg", children: [_jsx(Sparkles, { className: "mr-2 w-5 h-5" }), "Create with AI"] })] }) }), _jsxs("div", { className: "grid md:grid-cols-4 gap-4 mb-8", children: [_jsx(Card, { className: "bg-white shadow-md hover:shadow-lg transition-shadow", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Total Invoices" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: invoices.length })] }), _jsx(FileText, { className: "w-10 h-10 text-blue-500" })] }) }) }), _jsx(Card, { className: "bg-white shadow-md hover:shadow-lg transition-shadow", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Active" }), _jsx("p", { className: "text-3xl font-bold text-blue-600", children: invoices.filter(i => i.status === "ACTIVE").length })] }), _jsx(Clock, { className: "w-10 h-10 text-blue-500" })] }) }) }), _jsx(Card, { className: "bg-white shadow-md hover:shadow-lg transition-shadow", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Completed" }), _jsx("p", { className: "text-3xl font-bold text-green-600", children: invoices.filter(i => i.status === "COMPLETED").length })] }), _jsx(CheckCircle2, { className: "w-10 h-10 text-green-500" })] }) }) }), _jsx(Card, { className: "bg-white shadow-md hover:shadow-lg transition-shadow", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Disputes" }), _jsx("p", { className: "text-3xl font-bold text-red-600", children: invoices.filter(i => i.status === "DISPUTED").length })] }), _jsx(AlertCircle, { className: "w-10 h-10 text-red-500" })] }) }) })] }), _jsx(Card, { className: "mb-8 shadow-md", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search invoices by ID, DAO, or project title...", className: "w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: filterStatus === "all" ? "default" : "outline", onClick: () => setFilterStatus("all"), size: "sm", children: "All" }), _jsx(Button, { variant: filterStatus === "pending" ? "default" : "outline", onClick: () => setFilterStatus("pending"), size: "sm", children: "Pending" }), _jsx(Button, { variant: filterStatus === "funded" ? "default" : "outline", onClick: () => setFilterStatus("funded"), size: "sm", children: "Active" }), _jsx(Button, { variant: filterStatus === "completed" ? "default" : "outline", onClick: () => setFilterStatus("completed"), size: "sm", children: "Completed" }), _jsx(Button, { variant: filterStatus === "dispute" ? "default" : "outline", onClick: () => setFilterStatus("dispute"), size: "sm", children: "Disputes" })] })] }) }) }), _jsx("div", { className: "space-y-4", children: filteredInvoices.map((invoice) => (_jsx(Card, { className: "shadow-md hover:shadow-xl transition-all border-l-4 border-l-blue-500", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center gap-6", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-start gap-4 mb-4", children: [_jsx("div", { className: "bg-blue-100 p-3 rounded-lg", children: _jsx(FileText, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900", children: invoice.id }), _jsx(Badge, { variant: getStatusBadge(invoice.status), children: invoice.status.toUpperCase() }), getStatusIcon(invoice.status)] }), _jsx("p", { className: "text-lg font-semibold text-gray-700 mb-2", children: invoice.projectTitle }), _jsxs("div", { className: "flex flex-wrap gap-4 text-sm text-gray-600", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(User, { className: "w-4 h-4" }), _jsxs("span", { children: [invoice.contractorAddress.slice(0, 8), "..."] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(DollarSign, { className: "w-4 h-4" }), _jsx("span", { children: invoice.daoName || 'DAO' })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "w-4 h-4" }), _jsxs("span", { children: ["Timeline: ", invoice.timeline || 'N/A'] })] })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("span", { className: "text-gray-600", children: ["Milestones: ", invoice.milestones.filter(m => m.status === 'RELEASED').length, "/", invoice.milestones.length] }), _jsxs("span", { className: "font-semibold text-gray-900", children: [calculateProgress(invoice), "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: _jsx("div", { className: `h-3 rounded-full transition-all ${invoice.status === "COMPLETED"
                                                                ? "bg-green-500"
                                                                : invoice.status === "ACTIVE"
                                                                    ? "bg-blue-500"
                                                                    : invoice.status === "DISPUTED"
                                                                        ? "bg-red-500"
                                                                        : "bg-gray-400"}`, style: { width: `${calculateProgress(invoice)}%` } }) })] })] }), _jsxs("div", { className: "flex flex-col items-end gap-4 lg:min-w-[200px]", children: [_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Total Amount" }), _jsxs("p", { className: "text-3xl font-bold text-gray-900", children: [invoice.totalAmount, " ", invoice.currency] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", children: "View Details" }), invoice.status === 'ACTIVE' && (_jsx(Button, { size: "sm", className: "bg-gradient-to-r from-green-600 to-emerald-600", children: "Release Payment" })), invoice.status === 'DISPUTED' && (_jsx(Button, { size: "sm", variant: "destructive", children: "View Dispute" }))] })] })] }) }) }, invoice.id))) }), filteredInvoices.length === 0 && (_jsx(Card, { className: "shadow-md", children: _jsxs(CardContent, { className: "py-16 text-center", children: [_jsx(FileText, { className: "w-16 h-16 text-gray-300 mx-auto mb-4" }), _jsx("h3", { className: "text-xl font-semibold text-gray-600 mb-2", children: "No invoices found" }), _jsx("p", { className: "text-gray-500 mb-6", children: "Try adjusting your filters or create a new invoice" }), _jsxs(Button, { children: [_jsx(Plus, { className: "mr-2 w-5 h-5" }), "Create New Invoice"] })] }) }))] }) }));
};
export default InvoiceManager;
