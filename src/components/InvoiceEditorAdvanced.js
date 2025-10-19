import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, computeInvoiceTotal, validateInvoice, computeLineTotal } from '@/utils/invoiceUtils';
import { Copy, Plus, X, Eye, Save } from 'lucide-react';
const emptyLine = () => ({ description: '', qty: 1, unitPrice: 0 });
export default function InvoiceEditorAdvanced({ parsed, onCreateDeal }) {
    const { toast } = useToast();
    const [invoice, setInvoice] = useState({
        invoice_number: '',
        date: '',
        vendor_name: '',
        buyer_name: '',
        total_amount: 0,
        currency: 'USD',
        tax: 0,
        discount: 0,
        line_items: [emptyLine()],
        parser_confidence: parsed?.confidence || null,
    });
    const [errors, setErrors] = useState({});
    const [previewMode, setPreviewMode] = useState(false);
    const [creating, setCreating] = useState(false);
    useEffect(() => {
        if (parsed) {
            setInvoice(prev => ({
                ...prev,
                invoice_number: parsed.invoice_number || prev.invoice_number,
                date: parsed.date || prev.date,
                vendor_name: parsed.vendor_name || prev.vendor_name,
                buyer_name: parsed.buyer_name || prev.buyer_name,
                currency: parsed.currency || prev.currency,
                total_amount: parsed.total_amount || prev.total_amount,
                line_items: Array.isArray(parsed.line_items) && parsed.line_items.length > 0
                    ? parsed.line_items.map(li => ({
                        description: li.description || '',
                        qty: li.qty || 1,
                        unitPrice: li.unit_price || li.unitPrice || 0
                    }))
                    : prev.line_items,
                parser_confidence: parsed.confidence || prev.parser_confidence
            }));
        }
    }, [parsed]);
    const totals = computeInvoiceTotal(invoice.line_items, invoice.tax, invoice.discount);
    function updateField(path, value) {
        if (path.startsWith('line_items.')) {
            const [, idxStr, key] = path.split('.');
            const idx = Number(idxStr);
            setInvoice(inv => {
                const items = inv.line_items.map((it, i) => i === idx ? ({ ...it, [key]: value }) : it);
                return { ...inv, line_items: items };
            });
        }
        else {
            setInvoice(inv => ({ ...inv, [path]: value }));
        }
    }
    function addLine() {
        setInvoice(inv => ({ ...inv, line_items: [...inv.line_items, emptyLine()] }));
    }
    function removeLine(i) {
        if (invoice.line_items.length <= 1) {
            toast({ title: 'Cannot remove', description: 'At least one line item is required', variant: 'destructive' });
            return;
        }
        setInvoice(inv => ({ ...inv, line_items: inv.line_items.filter((_, idx) => idx !== i) }));
    }
    function runValidation() {
        const v = validateInvoice(invoice);
        setErrors(v);
        return Object.keys(v).length === 0;
    }
    async function handlePreview(e) {
        e.preventDefault();
        const ok = runValidation();
        if (!ok) {
            toast({ title: 'Validation errors', description: 'Please fix the errors before previewing', variant: 'destructive' });
            return;
        }
        setPreviewMode(true);
        toast({ title: 'Preview ready', description: 'Check values then create deal' });
    }
    async function handleCreateDeal(e) {
        e.preventDefault();
        if (!runValidation()) {
            toast({ title: 'Validation failed', variant: 'destructive' });
            return;
        }
        try {
            setCreating(true);
            const resp = await fetch('/api/invoice/create-deal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoice })
            });
            const data = await resp.json();
            if (!resp.ok) {
                throw new Error(data.error || 'Create deal failed');
            }
            toast({ title: 'Deal created successfully', variant: 'default' });
            onCreateDeal?.(data);
        }
        catch (err) {
            console.error(err);
            toast({ title: 'Create deal failed', description: err.message || String(err), variant: 'destructive' });
        }
        finally {
            setCreating(false);
        }
    }
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Invoice Editor" }), invoice.parser_confidence !== null && (_jsxs(Badge, { variant: "outline", className: "bg-muted", children: ["Confidence: ", (invoice.parser_confidence * 100).toFixed(0), "%"] }))] }) }), _jsx(CardContent, { children: _jsxs("form", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "invoice_number", children: "Invoice Number" }), _jsx(Input, { id: "invoice_number", value: invoice.invoice_number, onChange: e => updateField('invoice_number', e.target.value), "aria-invalid": !!errors.invoice_number, className: errors.invoice_number ? 'border-destructive' : '' }), errors.invoice_number && _jsx("p", { className: "text-sm text-destructive", children: errors.invoice_number })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "date", children: "Date" }), _jsx(Input, { id: "date", type: "date", value: invoice.date, onChange: e => updateField('date', e.target.value), "aria-invalid": !!errors.date, className: errors.date ? 'border-destructive' : '' }), errors.date && _jsx("p", { className: "text-sm text-destructive", children: errors.date })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "vendor_name", children: "Vendor Name" }), _jsx(Input, { id: "vendor_name", value: invoice.vendor_name, onChange: e => updateField('vendor_name', e.target.value), "aria-invalid": !!errors.vendor_name, className: errors.vendor_name ? 'border-destructive' : '' }), errors.vendor_name && _jsx("p", { className: "text-sm text-destructive", children: errors.vendor_name })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "buyer_name", children: "Buyer Name" }), _jsx(Input, { id: "buyer_name", value: invoice.buyer_name, onChange: e => updateField('buyer_name', e.target.value), "aria-invalid": !!errors.buyer_name, className: errors.buyer_name ? 'border-destructive' : '' }), errors.buyer_name && _jsx("p", { className: "text-sm text-destructive", children: errors.buyer_name })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "font-semibold", children: "Line Items" }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addLine, children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), "Add Line"] })] }), invoice.line_items.map((li, idx) => (_jsxs("div", { className: "grid grid-cols-12 gap-2 items-start p-3 bg-muted/50 rounded-lg", children: [_jsxs("div", { className: "col-span-12 md:col-span-5", children: [_jsx(Input, { placeholder: "Description", value: li.description, onChange: e => updateField(`line_items.${idx}.description`, e.target.value), className: errors[`line_${idx}_description`] ? 'border-destructive' : '' }), errors[`line_${idx}_description`] && _jsx("p", { className: "text-xs text-destructive mt-1", children: errors[`line_${idx}_description`] })] }), _jsx("div", { className: "col-span-4 md:col-span-2", children: _jsx(Input, { type: "number", min: "0", placeholder: "Qty", value: li.qty, onChange: e => updateField(`line_items.${idx}.qty`, e.target.value), className: errors[`line_${idx}_qty`] ? 'border-destructive' : '' }) }), _jsx("div", { className: "col-span-4 md:col-span-2", children: _jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "Price", value: li.unitPrice, onChange: e => updateField(`line_items.${idx}.unitPrice`, e.target.value), className: errors[`line_${idx}_unitPrice`] ? 'border-destructive' : '' }) }), _jsx("div", { className: "col-span-3 md:col-span-2 flex items-center justify-end font-mono text-sm", children: formatCurrency(computeLineTotal(li.qty, li.unitPrice), invoice.currency) }), _jsx("div", { className: "col-span-1 md:col-span-1 flex items-center justify-center", children: _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => removeLine(idx), "aria-label": `Remove line ${idx + 1}`, children: _jsx(X, { className: "w-4 h-4" }) }) })] }, idx)))] }), _jsxs("div", { className: "space-y-2 border-t pt-4", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Subtotal" }), _jsx("span", { className: "font-mono", children: formatCurrency(totals.linesSum, invoice.currency) })] }), _jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Tax" }), _jsx(Input, { type: "number", className: "w-32 h-8 text-right", value: invoice.tax, onChange: e => updateField('tax', Number(e.target.value)) })] }), _jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Discount" }), _jsx(Input, { type: "number", className: "w-32 h-8 text-right", value: invoice.discount, onChange: e => updateField('discount', Number(e.target.value)) })] }), _jsxs("div", { className: "flex justify-between text-lg font-bold border-t pt-2", children: [_jsx("span", { children: "Total" }), _jsx("span", { className: "font-mono", children: formatCurrency(totals.total, invoice.currency) })] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs(Button, { type: "button", onClick: handlePreview, disabled: creating, children: [_jsx(Eye, { className: "w-4 h-4 mr-2" }), "Preview"] }), _jsxs(Button, { type: "button", variant: "default", onClick: handleCreateDeal, disabled: creating, children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Create Deal"] }), _jsxs(Button, { type: "button", variant: "outline", onClick: () => {
                                        navigator.clipboard?.writeText(JSON.stringify(invoice, null, 2));
                                        toast({ title: 'Copied', description: 'Invoice JSON copied to clipboard' });
                                    }, children: [_jsx(Copy, { className: "w-4 h-4 mr-2" }), "Copy JSON"] })] }), previewMode && (_jsxs(Card, { className: "bg-muted/30", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-base", children: "Preview" }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-3", children: "Check values carefully \u2014 creating a deal will submit to chain." }), _jsx("pre", { className: "text-xs bg-background p-3 rounded overflow-auto max-h-64", children: JSON.stringify({ ...invoice, totals }, null, 2) })] })] }))] }) })] }));
}
