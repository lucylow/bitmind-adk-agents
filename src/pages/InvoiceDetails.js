import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, DollarSign } from "lucide-react";
import WalletConnect from "@/components/WalletConnect";
import MilestoneTracker from "@/components/MilestoneTracker";
import DisputeResolution from "@/components/DisputeResolution";
import { demoLoader } from "@/lib/demoLoader";
const InvoiceDetails = () => {
    const { id } = useParams();
    const [showDispute, setShowDispute] = useState(false);
    // Mock invoice database (in real app, fetch from blockchain)
    const invoiceDatabase = {
        "2025-300": {
            id: "2025-300",
            status: "released",
            amount: "0.85 sBTC",
            usdAmount: "$52,300",
            dao: "DeFi Protocol DAO",
            description: "Smart contract audit + security review",
            issuer: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            client: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
            arbitrator: "SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159",
            totalAmount: 52300,
            releasedAmount: 52300,
            createdAt: "2025-01-10",
            milestones: [
                { id: 1, description: "Initial security assessment", amount: 17433, status: "released" },
                { id: 2, description: "Smart contract audit", amount: 17433, status: "released" },
                { id: 3, description: "Final security review and documentation", amount: 17434, status: "released" },
            ],
        },
        "2025-299": {
            id: "2025-299",
            status: "funded",
            amount: "0.42 sBTC",
            usdAmount: "$25,800",
            dao: "NFT Marketplace Collective",
            description: "Website redesign + mobile responsive",
            issuer: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            client: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
            arbitrator: "SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159",
            totalAmount: 25800,
            releasedAmount: 17200,
            createdAt: "2025-01-12",
            milestones: [
                { id: 1, description: "Design mockups and wireframes", amount: 8600, status: "released" },
                { id: 2, description: "Frontend implementation", amount: 8600, status: "released" },
                { id: 3, description: "Mobile responsive testing", amount: 8600, status: "approved" },
            ],
        },
        "2025-298": {
            id: "2025-298",
            status: "verified",
            amount: "0.65 sBTC",
            usdAmount: "$39,900",
            dao: "Web3 Education Guild",
            description: "Tutorial series + documentation",
            issuer: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            client: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
            arbitrator: "SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159",
            totalAmount: 39900,
            releasedAmount: 0,
            createdAt: "2025-01-13",
            milestones: [
                { id: 1, description: "Tutorial content creation", amount: 13300, status: "approved" },
                { id: 2, description: "Video production and editing", amount: 13300, status: "approved" },
                { id: 3, description: "Documentation and deployment", amount: 13300, status: "approved" },
            ],
        },
        "2025-297": {
            id: "2025-297",
            status: "created",
            amount: "0.28 sBTC",
            usdAmount: "$17,200",
            dao: "Gaming DAO Treasury",
            description: "Token economics modeling",
            issuer: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            client: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
            arbitrator: "SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159",
            totalAmount: 17200,
            releasedAmount: 0,
            createdAt: "2025-01-14",
            milestones: [
                { id: 1, description: "Economic model research", amount: 5733, status: "pending" },
                { id: 2, description: "Token mechanics design", amount: 5733, status: "pending" },
                { id: 3, description: "Simulation and testing", amount: 5734, status: "pending" },
            ],
        },
    };
    // Try to get from demo data first, then fall back to static database
    const demoInvoice = id ? demoLoader.getInvoiceById(id) : null;
    const invoice = demoInvoice ? {
        id: demoInvoice.invoice_id,
        status: demoInvoice.status,
        amount: `${(demoInvoice.amount / 100000000).toFixed(3)} ${demoInvoice.currency}`,
        usdAmount: `≈ $${Math.round((demoInvoice.amount / 100000000) * 60000).toLocaleString()}`,
        dao: demoInvoice.description.split('-')[0].trim(),
        description: demoInvoice.description,
        issuer: demoInvoice.payer,
        client: demoInvoice.payee,
        arbitrator: demoInvoice.arbiter || 'Not assigned',
        totalAmount: Math.round((demoInvoice.amount / 100000000) * 60000),
        releasedAmount: Math.round((demoInvoice.milestones.filter(m => m.status === 'completed').reduce((sum, m) => sum + m.amount, 0) / 100000000) * 60000),
        createdAt: new Date(demoInvoice.created_at).toLocaleDateString(),
        milestones: demoInvoice.milestones.map((m, idx) => ({
            id: idx + 1,
            description: m.title,
            amount: Math.round((m.amount / 100000000) * 60000),
            status: m.status === 'completed' ? 'released' : m.status === 'in_progress' ? 'approved' : 'pending'
        })),
    } : invoiceDatabase[id || ""] || {
        id: id || "INV-001",
        status: "in-progress",
        amount: "$12,500",
        usdAmount: "$12,500",
        dao: "DeFi DAO",
        description: "General service invoice",
        issuer: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        client: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
        arbitrator: "SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159",
        totalAmount: 12500,
        releasedAmount: 5000,
        createdAt: "2025-01-15",
        milestones: [
            { id: 1, description: "Initial design mockups", amount: 5000, status: "released" },
            { id: 2, description: "Frontend implementation", amount: 5000, status: "approved" },
            { id: 3, description: "Testing and deployment", amount: 2500, status: "pending" },
        ],
    };
    const getStatusBadge = (status) => {
        const statusConfig = {
            "released": { variant: "default", className: "bg-green-600" },
            "verified": { variant: "default", className: "bg-blue-600" },
            "funded": { variant: "secondary", className: "bg-purple-600" },
            "created": { variant: "outline", className: "" },
            "completed": { variant: "default", className: "bg-green-600" },
            "in-progress": { variant: "secondary", className: "" },
            "pending": { variant: "outline", className: "" },
            "disputed": { variant: "destructive", className: "" },
        };
        const config = statusConfig[status] || { variant: "outline", className: "" };
        return (_jsx(Badge, { variant: config.variant, className: config.className, children: status }));
    };
    return (_jsx("div", { className: "min-h-screen bg-background", children: _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("header", { className: "mb-8", children: _jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx(Link, { to: "/", children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to Dashboard"] }) }), _jsx(WalletConnect, {})] }) }), _jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { children: ["Invoice ", invoice.id] }), _jsx(CardDescription, { children: invoice.dao })] }), getStatusBadge(invoice.status)] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [invoice.description && (_jsxs("div", { className: "bg-blue-50 p-3 rounded-lg border border-blue-200", children: [_jsx("p", { className: "text-sm font-semibold text-blue-900 mb-1", children: "Description" }), _jsx("p", { className: "text-sm text-blue-800", children: invoice.description })] })), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Issuer" }), _jsx("p", { className: "text-xs font-mono bg-secondary p-2 rounded", children: invoice.issuer })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Client" }), _jsx("p", { className: "text-xs font-mono bg-secondary p-2 rounded", children: invoice.client })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Arbitrator" }), _jsx("p", { className: "text-xs font-mono bg-secondary p-2 rounded", children: invoice.arbitrator })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Created" }), _jsx("p", { className: "text-sm", children: invoice.createdAt })] })] }) })] }), _jsx(MilestoneTracker, { milestones: invoice.milestones, invoiceId: invoice.id }), showDispute && (_jsx(DisputeResolution, { invoiceId: invoice.id, onClose: () => setShowDispute(false) }))] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Payment Summary" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Total Amount" }), _jsx("p", { className: "text-2xl font-bold", children: invoice.amount || `$${invoice.totalAmount.toLocaleString()}` }), _jsx("p", { className: "text-sm text-muted-foreground", children: invoice.usdAmount || `≈ $${invoice.totalAmount.toLocaleString()}` })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Released" }), _jsxs("p", { className: "text-xl font-semibold text-green-600", children: ["$", invoice.releasedAmount.toLocaleString()] }), _jsx("p", { className: "text-xs text-muted-foreground", children: invoice.releasedAmount > 0 ? `≈ ${((invoice.releasedAmount / invoice.totalAmount) * parseFloat(invoice.amount?.replace(/[^\d.]/g, '') || '0')).toFixed(2)} sBTC` : '0 sBTC' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Remaining" }), _jsxs("p", { className: "text-xl font-semibold", children: ["$", (invoice.totalAmount - invoice.releasedAmount).toLocaleString()] }), _jsx("p", { className: "text-xs text-muted-foreground", children: invoice.totalAmount > invoice.releasedAmount ? `≈ ${(((invoice.totalAmount - invoice.releasedAmount) / invoice.totalAmount) * parseFloat(invoice.amount?.replace(/[^\d.]/g, '') || '0')).toFixed(2)} sBTC` : '0 sBTC' })] }), _jsxs("div", { className: "pt-4 border-t border-border", children: [_jsx("div", { className: "w-full bg-secondary rounded-full h-2", children: _jsx("div", { className: "bg-primary h-2 rounded-full transition-all", style: { width: `${(invoice.releasedAmount / invoice.totalAmount) * 100}%` } }) }), _jsxs("p", { className: "text-xs text-muted-foreground mt-2 text-center", children: [Math.round((invoice.releasedAmount / invoice.totalAmount) * 100), "% Complete"] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Actions" }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [_jsx(DollarSign, { className: "w-4 h-4 mr-2" }), "Fund Invoice"] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", onClick: () => setShowDispute(true), children: [_jsx(AlertTriangle, { className: "w-4 h-4 mr-2" }), "Raise Dispute"] })] })] })] })] })] }) }));
};
export default InvoiceDetails;
