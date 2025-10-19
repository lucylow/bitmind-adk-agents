import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RefreshCw, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import NavigationBar from "@/components/NavigationBar";

const SupabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [tables, setTables] = useState<string[]>([]);
  const [invoiceCount, setInvoiceCount] = useState<number | null>(null);

  const testConnection = async () => {
    setConnectionStatus('testing');
    setErrorMessage('');
    setTables([]);
    setInvoiceCount(null);

    try {
      // Test 1: Basic connection
      const { data, error } = await supabase.from('invoices').select('count', { count: 'exact', head: true });
      
      if (error) {
        throw error;
      }

      // Test 2: Get actual data
      const { data: invoices, error: invoicesError, count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact' })
        .limit(1);

      if (invoicesError) {
        throw invoicesError;
      }

      setInvoiceCount(count || 0);
      setTables(['invoices', 'deals', 'invoice_line_items', 'transactions', 'parser_feedback', 'audit_logs']);
      setConnectionStatus('success');
    } catch (error: any) {
      console.error('Supabase connection error:', error);
      setErrorMessage(error.message || 'Unknown error occurred');
      setConnectionStatus('error');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Database className="w-8 h-8" />
              Supabase Connection Test
            </CardTitle>
            <CardDescription>
              Verify your Supabase integration is working correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold mb-1">Connection Status</h3>
                <p className="text-sm text-muted-foreground">
                  {connectionStatus === 'idle' && 'Ready to test...'}
                  {connectionStatus === 'testing' && 'Testing connection...'}
                  {connectionStatus === 'success' && 'Connected successfully!'}
                  {connectionStatus === 'error' && 'Connection failed'}
                </p>
              </div>
              <div>
                {connectionStatus === 'testing' && (
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                )}
                {connectionStatus === 'success' && (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                )}
                {connectionStatus === 'error' && (
                  <XCircle className="w-8 h-8 text-red-500" />
                )}
              </div>
            </div>

            {/* Error Message */}
            {connectionStatus === 'error' && errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Error Details:</h4>
                <p className="text-sm text-red-700">{errorMessage}</p>
                <div className="mt-3 text-xs text-red-600">
                  <p>Common issues:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Check if your Supabase project is active</li>
                    <li>Verify your API keys are correct</li>
                    <li>Ensure RLS policies allow anonymous access (or disable RLS for testing)</li>
                    <li>Check if the tables exist in your database</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Database Info */}
            {connectionStatus === 'success' && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Connection Successful!</h4>
                  <p className="text-sm text-green-700">
                    Your Supabase database is properly configured and accessible.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Database Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Invoices:</span>
                      <Badge variant="secondary">{invoiceCount ?? 'N/A'}</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Available Tables</h4>
                  <div className="flex flex-wrap gap-2">
                    {tables.map((table) => (
                      <Badge key={table} variant="outline" className="text-xs">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-semibold mb-2">Next Steps:</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>Set up authentication for user accounts</li>
                    <li>Configure Row Level Security (RLS) policies</li>
                    <li>Start storing invoice data in Supabase</li>
                    <li>Integrate with your smart contracts</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
                <RefreshCw className={`w-4 h-4 mr-2 ${connectionStatus === 'testing' ? 'animate-spin' : ''}`} />
                Test Connection
              </Button>
              {import.meta.env.VITE_SUPABASE_URL && (
                <Button variant="outline" asChild>
                  <a 
                    href={import.meta.env.VITE_SUPABASE_URL.replace('/rest/v1', '')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Open Supabase Dashboard
                  </a>
                </Button>
              )}
            </div>

            {/* Configuration Info */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-2 text-sm">Configuration</h4>
              <div className="space-y-1 text-xs text-muted-foreground font-mono">
                <p>URL: {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}</p>
                <p>Status: {import.meta.env.VITE_SUPABASE_URL ? '✓ Configured' : '✗ Missing env vars'}</p>
              </div>
              {!import.meta.env.VITE_SUPABASE_URL && (
                <p className="text-xs text-orange-600 mt-2">
                  ⚠️ Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseTest;

