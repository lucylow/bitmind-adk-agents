import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RefreshCw, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import NavigationBar from "@/components/NavigationBar";
const SupabaseTest = () => {
    const [connectionStatus, setConnectionStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [tables, setTables] = useState([]);
    const [invoiceCount, setInvoiceCount] = useState(null);
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
        }
        catch (error) {
            console.error('Supabase connection error:', error);
            setErrorMessage(error.message || 'Unknown error occurred');
            setConnectionStatus('error');
        }
    };
    useEffect(() => {
        testConnection();
    }, []);
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx(NavigationBar, {}), _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs(Card, { className: "max-w-3xl mx-auto", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-3", children: [_jsx(Database, { className: "w-8 h-8" }), "Supabase Connection Test"] }), _jsx(CardDescription, { children: "Verify your Supabase integration is working correctly" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-1", children: "Connection Status" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [connectionStatus === 'idle' && 'Ready to test...', connectionStatus === 'testing' && 'Testing connection...', connectionStatus === 'success' && 'Connected successfully!', connectionStatus === 'error' && 'Connection failed'] })] }), _jsxs("div", { children: [connectionStatus === 'testing' && (_jsx(RefreshCw, { className: "w-8 h-8 text-blue-500 animate-spin" })), connectionStatus === 'success' && (_jsx(CheckCircle, { className: "w-8 h-8 text-green-500" })), connectionStatus === 'error' && (_jsx(XCircle, { className: "w-8 h-8 text-red-500" }))] })] }), connectionStatus === 'error' && errorMessage && (_jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg", children: [_jsx("h4", { className: "font-semibold text-red-800 mb-2", children: "Error Details:" }), _jsx("p", { className: "text-sm text-red-700", children: errorMessage }), _jsxs("div", { className: "mt-3 text-xs text-red-600", children: [_jsx("p", { children: "Common issues:" }), _jsxs("ul", { className: "list-disc list-inside mt-1 space-y-1", children: [_jsx("li", { children: "Check if your Supabase project is active" }), _jsx("li", { children: "Verify your API keys are correct" }), _jsx("li", { children: "Ensure RLS policies allow anonymous access (or disable RLS for testing)" }), _jsx("li", { children: "Check if the tables exist in your database" })] })] })] })), connectionStatus === 'success' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg", children: [_jsx("h4", { className: "font-semibold text-green-800 mb-2", children: "\u2705 Connection Successful!" }), _jsx("p", { className: "text-sm text-green-700", children: "Your Supabase database is properly configured and accessible." })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx("h4", { className: "font-semibold mb-3", children: "Database Statistics" }), _jsx("div", { className: "space-y-2", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Total Invoices:" }), _jsx(Badge, { variant: "secondary", children: invoiceCount ?? 'N/A' })] }) })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx("h4", { className: "font-semibold mb-3", children: "Available Tables" }), _jsx("div", { className: "flex flex-wrap gap-2", children: tables.map((table) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: table }, table))) })] }), _jsxs("div", { className: "p-4 border rounded-lg bg-blue-50", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Next Steps:" }), _jsxs("ul", { className: "text-sm space-y-1 list-disc list-inside text-muted-foreground", children: [_jsx("li", { children: "Set up authentication for user accounts" }), _jsx("li", { children: "Configure Row Level Security (RLS) policies" }), _jsx("li", { children: "Start storing invoice data in Supabase" }), _jsx("li", { children: "Integrate with your smart contracts" })] })] })] })), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { onClick: testConnection, disabled: connectionStatus === 'testing', children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${connectionStatus === 'testing' ? 'animate-spin' : ''}` }), "Test Connection"] }), import.meta.env.VITE_SUPABASE_URL && (_jsx(Button, { variant: "outline", asChild: true, children: _jsx("a", { href: import.meta.env.VITE_SUPABASE_URL.replace('/rest/v1', ''), target: "_blank", rel: "noopener noreferrer", children: "Open Supabase Dashboard" }) }))] }), _jsxs("div", { className: "p-4 border rounded-lg bg-gray-50", children: [_jsx("h4", { className: "font-semibold mb-2 text-sm", children: "Configuration" }), _jsxs("div", { className: "space-y-1 text-xs text-muted-foreground font-mono", children: [_jsxs("p", { children: ["URL: ", import.meta.env.VITE_SUPABASE_URL || 'Not configured'] }), _jsxs("p", { children: ["Status: ", import.meta.env.VITE_SUPABASE_URL ? '✓ Configured' : '✗ Missing env vars'] })] }), !import.meta.env.VITE_SUPABASE_URL && (_jsx("p", { className: "text-xs text-orange-600 mt-2", children: "\u26A0\uFE0F Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local" }))] })] })] }) })] }));
};
export default SupabaseTest;
