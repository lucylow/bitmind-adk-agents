// Type declarations for invoiceService.js
export interface InvoiceServiceInterface {
  parseWithAI: (description: string) => Promise<any>;
  createInvoice: (invoiceData: any) => Promise<any>;
  createSmartInvoice: (invoiceData: any) => Promise<any>;
  getInvoices: () => Promise<any[]>;
  getAllInvoices: () => Promise<any[]>;
  getInvoice: (id: string) => Promise<any>;
  getAIPreview: (description: string) => Promise<any>;
  updateInvoice: (id: string, data: any) => Promise<any>;
  deleteInvoice: (id: string) => Promise<void>;
  [key: string]: any; // Allow any additional methods
}

export const invoiceService: InvoiceServiceInterface;

