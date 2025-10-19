import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, computeInvoiceTotal, validateInvoice, computeLineTotal, LineItem } from '@/utils/invoiceUtils';
import { Copy, Plus, X, Eye, Save } from 'lucide-react';

interface ParsedInvoice {
  invoice_number?: string;
  date?: string;
  vendor_name?: string;
  buyer_name?: string;
  total_amount?: number;
  currency?: string;
  line_items?: Array<{
    description: string;
    qty: number;
    unit_price?: number;
    unitPrice?: number;
  }>;
  confidence?: number;
}

interface InvoiceEditorProps {
  parsed?: ParsedInvoice;
  onCreateDeal?: (data: any) => void;
}

const emptyLine = (): LineItem => ({ description: '', qty: 1, unitPrice: 0 });

export default function InvoiceEditorAdvanced({ parsed, onCreateDeal }: InvoiceEditorProps) {
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
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  function updateField(path: string, value: any) {
    if (path.startsWith('line_items.')) {
      const [, idxStr, key] = path.split('.');
      const idx = Number(idxStr);
      setInvoice(inv => {
        const items = inv.line_items.map((it, i) => i === idx ? ({ ...it, [key]: value }) : it);
        return { ...inv, line_items: items };
      });
    } else {
      setInvoice(inv => ({ ...inv, [path]: value }));
    }
  }

  function addLine() {
    setInvoice(inv => ({ ...inv, line_items: [...inv.line_items, emptyLine()] }));
  }

  function removeLine(i: number) {
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

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    const ok = runValidation();
    if (!ok) {
      toast({ title: 'Validation errors', description: 'Please fix the errors before previewing', variant: 'destructive' });
      return;
    }
    setPreviewMode(true);
    toast({ title: 'Preview ready', description: 'Check values then create deal' });
  }

  async function handleCreateDeal(e: React.FormEvent) {
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
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Create deal failed', description: err.message || String(err), variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Invoice Editor</CardTitle>
          {invoice.parser_confidence !== null && (
            <Badge variant="outline" className="bg-muted">
              Confidence: {(invoice.parser_confidence * 100).toFixed(0)}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input 
                id="invoice_number"
                value={invoice.invoice_number} 
                onChange={e => updateField('invoice_number', e.target.value)} 
                aria-invalid={!!errors.invoice_number}
                className={errors.invoice_number ? 'border-destructive' : ''}
              />
              {errors.invoice_number && <p className="text-sm text-destructive">{errors.invoice_number}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date"
                type="date" 
                value={invoice.date} 
                onChange={e => updateField('date', e.target.value)} 
                aria-invalid={!!errors.date}
                className={errors.date ? 'border-destructive' : ''}
              />
              {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor_name">Vendor Name</Label>
              <Input 
                id="vendor_name"
                value={invoice.vendor_name} 
                onChange={e => updateField('vendor_name', e.target.value)} 
                aria-invalid={!!errors.vendor_name}
                className={errors.vendor_name ? 'border-destructive' : ''}
              />
              {errors.vendor_name && <p className="text-sm text-destructive">{errors.vendor_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer_name">Buyer Name</Label>
              <Input 
                id="buyer_name"
                value={invoice.buyer_name} 
                onChange={e => updateField('buyer_name', e.target.value)} 
                aria-invalid={!!errors.buyer_name}
                className={errors.buyer_name ? 'border-destructive' : ''}
              />
              {errors.buyer_name && <p className="text-sm text-destructive">{errors.buyer_name}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Line Items</h4>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="w-4 h-4 mr-1" />
                Add Line
              </Button>
            </div>

            {invoice.line_items.map((li, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-start p-3 bg-muted/50 rounded-lg">
                <div className="col-span-12 md:col-span-5">
                  <Input 
                    placeholder="Description" 
                    value={li.description}
                    onChange={e => updateField(`line_items.${idx}.description`, e.target.value)} 
                    className={errors[`line_${idx}_description`] ? 'border-destructive' : ''}
                  />
                  {errors[`line_${idx}_description`] && <p className="text-xs text-destructive mt-1">{errors[`line_${idx}_description`]}</p>}
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Input 
                    type="number" 
                    min="0" 
                    placeholder="Qty"
                    value={li.qty} 
                    onChange={e => updateField(`line_items.${idx}.qty`, e.target.value)} 
                    className={errors[`line_${idx}_qty`] ? 'border-destructive' : ''}
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="Price"
                    value={li.unitPrice} 
                    onChange={e => updateField(`line_items.${idx}.unitPrice`, e.target.value)} 
                    className={errors[`line_${idx}_unitPrice`] ? 'border-destructive' : ''}
                  />
                </div>
                <div className="col-span-3 md:col-span-2 flex items-center justify-end font-mono text-sm">
                  {formatCurrency(computeLineTotal(li.qty, li.unitPrice), invoice.currency)}
                </div>
                <div className="col-span-1 md:col-span-1 flex items-center justify-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeLine(idx)}
                    aria-label={`Remove line ${idx + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">{formatCurrency(totals.linesSum, invoice.currency)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Tax</span>
              <Input 
                type="number" 
                className="w-32 h-8 text-right" 
                value={invoice.tax} 
                onChange={e => updateField('tax', Number(e.target.value))} 
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Discount</span>
              <Input 
                type="number" 
                className="w-32 h-8 text-right" 
                value={invoice.discount} 
                onChange={e => updateField('discount', Number(e.target.value))} 
              />
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(totals.total, invoice.currency)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handlePreview} disabled={creating}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button type="button" variant="default" onClick={handleCreateDeal} disabled={creating}>
              <Save className="w-4 h-4 mr-2" />
              Create Deal
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { 
                navigator.clipboard?.writeText(JSON.stringify(invoice, null, 2)); 
                toast({ title: 'Copied', description: 'Invoice JSON copied to clipboard' }); 
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy JSON
            </Button>
          </div>

          {previewMode && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Check values carefully — creating a deal will submit to chain.
                </p>
                <pre className="text-xs bg-background p-3 rounded overflow-auto max-h-64">
                  {JSON.stringify({ ...invoice, totals }, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
