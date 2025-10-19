import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useWalletStore } from "@/store/useWalletStore";
const MilestoneTracker = ({ milestones, invoiceId }) => {
    const { isConnected } = useWalletStore();
    const handleApproveMilestone = async (milestoneId) => {
        if (!isConnected) {
            toast.error("Please connect your wallet first");
            return;
        }
        try {
            // In real implementation, call smart contract
            toast.success(`Milestone ${milestoneId} approved!`);
        }
        catch (error) {
            toast.error("Failed to approve milestone");
        }
    };
    const handleReleaseMilestone = async (milestoneId) => {
        if (!isConnected) {
            toast.error("Please connect your wallet first");
            return;
        }
        try {
            // In real implementation, call smart contract
            toast.success(`Payment for milestone ${milestoneId} released!`);
        }
        catch (error) {
            toast.error("Failed to release payment");
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "released":
                return _jsx(CheckCircle, { className: "w-4 h-4 text-green-600" });
            case "approved":
                return _jsx(CheckCircle, { className: "w-4 h-4 text-blue-600" });
            case "pending":
                return _jsx(Clock, { className: "w-4 h-4 text-yellow-600" });
            case "disputed":
                return _jsx(XCircle, { className: "w-4 h-4 text-red-600" });
            default:
                return _jsx(Clock, { className: "w-4 h-4" });
        }
    };
    const getStatusBadge = (status) => {
        const variants = {
            "released": "default",
            "approved": "secondary",
            "pending": "outline",
            "disputed": "destructive",
        };
        return _jsx(Badge, { variant: variants[status] || "outline", children: status });
    };
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { children: ["Milestones (", milestones.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: milestones.map((milestone, index) => (_jsxs("div", { className: "border border-border rounded-lg p-4", children: [_jsx("div", { className: "flex items-start justify-between mb-3", children: _jsxs("div", { className: "flex items-start gap-3 flex-1", children: [_jsx("div", { className: "mt-1", children: getStatusIcon(milestone.status) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsxs("h4", { className: "font-semibold", children: ["Milestone ", milestone.id] }), getStatusBadge(milestone.status)] }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: milestone.description }), _jsxs("p", { className: "text-lg font-bold", children: ["$", milestone.amount.toLocaleString()] })] })] }) }), milestone.status === "pending" && (_jsx("div", { className: "flex gap-2 mt-3", children: _jsx(Button, { size: "sm", onClick: () => handleApproveMilestone(milestone.id), disabled: !isConnected, children: "Approve" }) })), milestone.status === "approved" && (_jsx("div", { className: "flex gap-2 mt-3", children: _jsx(Button, { size: "sm", onClick: () => handleReleaseMilestone(milestone.id), disabled: !isConnected, children: "Release Payment" }) })), milestone.status === "released" && (_jsx("div", { className: "mt-3", children: _jsxs("p", { className: "text-sm text-green-600 flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Payment released successfully"] }) }))] }, milestone.id))) }) })] }));
};
export default MilestoneTracker;
