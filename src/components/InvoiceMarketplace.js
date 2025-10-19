import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, TrendingUp, Clock, AlertCircle, Gavel } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
const InvoiceMarketplace = () => {
    const { isConnected } = useWalletStore();
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [bidAmount, setBidAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    useEffect(() => {
        loadListedInvoices();
    }, []);
    const loadListedInvoices = async () => {
        setLoading(true);
        try {
            // Mock data for demonstration
            const mockInvoices = [
                {
                    tokenId: 1,
                    invoiceId: 2025001,
                    amount: 0.85,
                    currency: 'sBTC',
                    dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
                    debtor: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
                    riskScore: 3,
                    listing: {
                        seller: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
                        askPrice: 0.75,
                        isAuction: true,
                        highestBid: 0.70,
                        highestBidder: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
                        auctionEnd: Date.now() + 2 * 24 * 60 * 60 * 1000
                    }
                },
                {
                    tokenId: 2,
                    invoiceId: 2025002,
                    amount: 1.2,
                    currency: 'sBTC',
                    dueDate: Date.now() + 45 * 24 * 60 * 60 * 1000,
                    debtor: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ8',
                    riskScore: 2,
                    listing: {
                        seller: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
                        askPrice: 1.1,
                        isAuction: false
                    }
                },
                {
                    tokenId: 3,
                    invoiceId: 2025003,
                    amount: 0.42,
                    currency: 'sBTC',
                    dueDate: Date.now() + 60 * 24 * 60 * 60 * 1000,
                    debtor: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ9',
                    riskScore: 5,
                    listing: {
                        seller: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
                        askPrice: 0.38,
                        isAuction: false
                    }
                }
            ];
            setInvoices(mockInvoices);
        }
        catch (error) {
            console.error('Failed to load invoices:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const placeBid = async (tokenId, amount) => {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }
        try {
            setLoading(true);
            // In production, call smart contract:
            // await callPublicFunction({
            //   contractAddress,
            //   contractName: 'invoice-nft-marketplace',
            //   functionName: 'place-bid',
            //   functionArgs: [types.uint(tokenId), types.uint(parseFloat(amount) * 1000000)]
            // });
            alert(`Bid of ${amount} STX placed successfully!`);
            loadListedInvoices();
        }
        catch (error) {
            console.error('Bid failed:', error);
            alert('Bid failed: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    };
    const buyInvoice = async (tokenId, askPrice) => {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }
        try {
            setLoading(true);
            // In production, call smart contract
            alert(`Invoice purchased for ${askPrice} sBTC!`);
            loadListedInvoices();
        }
        catch (error) {
            console.error('Purchase failed:', error);
            alert('Purchase failed: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    };
    const getRiskColor = (score) => {
        if (score <= 3)
            return 'text-green-600 bg-green-100';
        if (score <= 6)
            return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };
    const filteredInvoices = invoices.filter(invoice => {
        if (activeTab === 'all')
            return true;
        if (activeTab === 'auction')
            return invoice.listing?.isAuction;
        if (activeTab === 'fixed')
            return !invoice.listing?.isAuction;
        return true;
    });
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold mb-2", children: "Invoice Receivables Marketplace" }), _jsx("p", { className: "text-muted-foreground text-lg", children: "Trade tokenized invoices for instant liquidity" })] }), _jsxs("div", { className: "grid md:grid-cols-4 gap-4 mb-8", children: [_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Award, { className: "w-10 h-10 text-purple-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Total Volume" }), _jsx("p", { className: "text-2xl font-bold", children: "$2.4M" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(TrendingUp, { className: "w-10 h-10 text-green-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Active Listings" }), _jsx("p", { className: "text-2xl font-bold", children: invoices.length })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Gavel, { className: "w-10 h-10 text-blue-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Auctions" }), _jsx("p", { className: "text-2xl font-bold", children: invoices.filter(inv => inv.listing?.isAuction).length })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Clock, { className: "w-10 h-10 text-orange-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Avg. Discount" }), _jsx("p", { className: "text-2xl font-bold", children: "12.3%" })] })] }) }) })] }), _jsxs("div", { className: "flex gap-2 mb-6", children: [_jsx(Button, { variant: activeTab === 'all' ? 'default' : 'outline', onClick: () => setActiveTab('all'), children: "All Listings" }), _jsx(Button, { variant: activeTab === 'auction' ? 'default' : 'outline', onClick: () => setActiveTab('auction'), children: "Auctions" }), _jsx(Button, { variant: activeTab === 'fixed' ? 'default' : 'outline', onClick: () => setActiveTab('fixed'), children: "Fixed Price" })] }), loading ? (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-muted-foreground", children: "Loading invoices..." }) })) : (_jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredInvoices.map((invoice) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs(CardTitle, { children: ["Invoice #", invoice.invoiceId] }), _jsxs(Badge, { className: getRiskColor(invoice.riskScore), children: ["Risk: ", invoice.riskScore, "/10"] })] }), _jsxs(CardDescription, { children: ["Token ID: ", invoice.tokenId] })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "space-y-3 mb-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Amount:" }), _jsxs("span", { className: "font-semibold", children: [invoice.amount, " ", invoice.currency] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Due:" }), _jsx("span", { className: "font-semibold", children: new Date(invoice.dueDate).toLocaleDateString() })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Debtor:" }), _jsxs("span", { className: "font-mono text-xs", children: [invoice.debtor.substring(0, 8), "..."] })] })] }), invoice.listing?.isAuction ? (_jsxs("div", { className: "space-y-3 border-t pt-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-blue-600", children: [_jsx(Gavel, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-semibold", children: "Auction" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Current Bid:" }), _jsxs("span", { className: "font-bold text-blue-600", children: [invoice.listing.highestBid, " sBTC"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Ends in:" }), _jsxs("span", { className: "text-sm", children: [Math.ceil((invoice.listing.auctionEnd - Date.now()) / (24 * 60 * 60 * 1000)), " days"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { type: "number", placeholder: "Your bid (sBTC)", value: bidAmount, onChange: (e) => setBidAmount(e.target.value), step: "0.01" }), _jsx(Button, { onClick: () => placeBid(invoice.tokenId, bidAmount), disabled: !bidAmount || parseFloat(bidAmount) <= (invoice.listing.highestBid || 0), children: "Bid" })] })] })) : (_jsxs("div", { className: "space-y-3 border-t pt-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Fixed Price:" }), _jsxs("span", { className: "text-2xl font-bold text-green-600", children: [invoice.listing?.askPrice, " sBTC"] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Discount:" }), _jsxs("span", { className: "text-green-600 font-semibold", children: [((1 - (invoice.listing.askPrice / invoice.amount)) * 100).toFixed(1), "%"] })] }), _jsx(Button, { className: "w-full", onClick: () => buyInvoice(invoice.tokenId, invoice.listing.askPrice), children: "Buy Now" })] }))] })] }, invoice.tokenId))) })), !isConnected && (_jsx(Card, { className: "mt-8 bg-yellow-50 border-yellow-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(AlertCircle, { className: "w-6 h-6 text-yellow-600" }), _jsx("p", { className: "text-yellow-800", children: "Connect your wallet to trade invoice NFTs" })] }) }) }))] }));
};
export default InvoiceMarketplace;
