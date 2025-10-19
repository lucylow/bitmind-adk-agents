/**
 * Supabase Invoice Parser Integration
 * Calls the Supabase Edge Function that uses OpenAI API
 * (OpenAI API key is stored securely in Supabase environment variables)
 */

import { supabase } from '@/integrations/supabase/client';
import type { InvoiceData } from './aiInvoiceParser';

/**
 * Parse invoice using Supabase Edge Function with OpenAI
 * This function calls the Supabase parse-invoice edge function which has
 * the OpenAI API key configured in the Supabase environment.
 * 
 * No API key needed from the frontend!
 */
export async function parseInvoiceWithSupabase(
  invoiceText: string,
  owner?: string
): Promise<InvoiceData> {
  try {
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('parse-invoice', {
      body: {
        text: invoiceText,
        owner: owner || null
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Supabase parsing error: ${error.message}`);
    }

    if (!data || !data.invoice) {
      throw new Error('No invoice data returned from Supabase');
    }

    // Map the Supabase response to InvoiceData format
    const invoice = data.invoice;
    
    // Convert the response to our InvoiceData format
    const invoiceData: InvoiceData = {
      invoice_id: parseInt(invoice.invoice_number) || Math.floor(Date.now() / 1000),
      payee: invoice.buyer_name || null,
      payer: invoice.vendor_name || null,
      amount: Math.floor((invoice.total_amount || 0) * 100000000), // Convert to satoshis
      token_contract: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sbtc-token',
      arbiter: null, // Not extracted by default parser
      deadline: invoice.date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      milestone_description: invoice.line_items?.map((item: any) => item.description).join('; ') || 'Invoice payment'
    };

    return invoiceData;
  } catch (error: any) {
    console.error('Error calling Supabase parse-invoice:', error);
    throw new Error(`Failed to parse invoice with Supabase: ${error.message}`);
  }
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && url !== 'https://placeholder.supabase.co');
}

/**
 * Get Supabase configuration status
 */
export function getSupabaseStatus(): {
  configured: boolean;
  url: string | undefined;
  hasKey: boolean;
} {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return {
    configured: isSupabaseConfigured(),
    url: url === 'https://placeholder.supabase.co' ? undefined : url,
    hasKey: !!(key && key !== 'placeholder-key')
  };
}

