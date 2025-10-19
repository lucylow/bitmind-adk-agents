import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { useWalletStore } from "@/store/useWalletStore";
const DisputeResolution = ({ invoiceId, onClose }) => {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isConnected, userAddress } = useWalletStore();
    const handleRaiseDispute = async () => {
        if (!isConnected) {
            toast.error("Please connect your wallet first");
            return;
        }
        if (!reason.trim()) {
            toast.error("Please provide a reason for the dispute");
            return;
        }
        try {
            setIsSubmitting(true);
            // In real implementation, call smart contract
            // await raiseDispute(invoiceId, reason, network);
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("Dispute raised successfully. The arbitrator will review it.");
            onClose();
        }
        catch (error) {
            console.error("Error raising dispute:", error);
            toast.error("Failed to raise dispute");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs(Card, { className: "border-destructive", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-destructive" }), _jsx(CardTitle, { children: "Raise a Dispute" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx(CardDescription, { children: "Explain the issue with this invoice. The arbitrator will review and make a decision." })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Dispute Reason" }), _jsx("textarea", { className: "w-full h-32 p-3 border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-destructive", placeholder: "Describe the issue in detail...", value: reason, onChange: (e) => setReason(e.target.value), maxLength: 512 }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [reason.length, "/512 characters"] })] }), _jsxs("div", { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-destructive font-semibold mb-2", children: "\u26A0\uFE0F Important" }), _jsxs("ul", { className: "text-xs text-muted-foreground space-y-1 list-disc list-inside", children: [_jsx("li", { children: "Raising a dispute will pause all milestone payments" }), _jsx("li", { children: "The arbitrator will review both parties' claims" }), _jsx("li", { children: "The decision will be final and binding" }), _jsx("li", { children: "False disputes may affect your reputation" })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "outline", onClick: onClose, className: "flex-1", children: "Cancel" }), _jsx(Button, { variant: "destructive", onClick: handleRaiseDispute, disabled: isSubmitting || !reason.trim() || !isConnected, className: "flex-1", children: isSubmitting ? "Submitting..." : "Raise Dispute" })] })] }) })] }));
};
export default DisputeResolution;
