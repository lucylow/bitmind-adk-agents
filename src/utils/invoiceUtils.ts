// Invoice utilities for formatting & validation
export function formatCurrency(value: number | string | null | undefined, currency: string = 'USD'): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '';
  const n = Number(value);
  return `${currency} ${n.toFixed(2)}`;
}

export function computeLineTotal(qty: number | string, unitPrice: number | string): number {
  const q = Number(qty) || 0;
  const p = Number(unitPrice) || 0;
  const total = q * p;
  return Math.round(total * 100) / 100;
}

export interface LineItem {
  description: string;
  qty: number | string;
  unitPrice: number | string;
}

export function computeInvoiceTotal(lineItems: LineItem[] = [], tax: number = 0, discount: number = 0) {
  const linesSum = lineItems.reduce((acc, li) => {
    const lineTotal = computeLineTotal(li.qty, li.unitPrice);
    return acc + lineTotal;
  }, 0);
  const taxAmount = Number(tax) || 0;
  const discountAmount = Number(discount) || 0;
  const total = Math.round((linesSum + taxAmount - discountAmount) * 100) / 100;
  return { linesSum, taxAmount, discountAmount, total };
}

export interface Invoice {
  invoice_number?: string;
  vendor_name?: string;
  buyer_name?: string;
  date?: string;
  total_amount?: number | string;
  line_items?: LineItem[];
}

export function validateInvoice(invoice: Invoice) {
  const errors: Record<string, string> = {};
  if (!invoice.vendor_name || invoice.vendor_name.trim().length === 0) {
    errors.vendor_name = 'Vendor name required';
  }
  if (!invoice.buyer_name || invoice.buyer_name.trim().length === 0) {
    errors.buyer_name = 'Buyer name required';
  }
  if (!invoice.date) errors.date = 'Invoice date required';
  const amount = Number(invoice.total_amount);
  if (Number.isNaN(amount) || amount <= 0) {
    errors.total_amount = 'Total must be a positive number';
  }
  if (!Array.isArray(invoice.line_items) || invoice.line_items.length === 0) {
    errors.line_items = 'Add at least one line item';
  } else {
    invoice.line_items.forEach((li, idx) => {
      if (!li.description || li.description.trim().length === 0) {
        errors[`line_${idx}_description`] = 'Description required';
      }
      if (!li.qty || Number(li.qty) <= 0) {
        errors[`line_${idx}_qty`] = 'Quantity must be > 0';
      }
      if (!li.unitPrice || Number(li.unitPrice) < 0) {
        errors[`line_${idx}_unitPrice`] = 'Unit price required';
      }
    });
  }
  return errors;
}
