import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Public API Demo Component
 * Demonstrates integration with GitHub, IPFS, and CoinGecko APIs
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchGitHubUser, fetchIPFSJson, convertUSDtoSatoshis, formatCurrency, fetchCryptoPrices } from '@/services/publicApis';
import { Loader2, Github, Bitcoin, Database, TrendingUp } from 'lucide-react';
export function PublicApiDemo() {
    // GitHub State
    const [githubUsername, setGithubUsername] = useState('octocat');
    const [githubUser, setGithubUser] = useState(null);
    const [githubLoading, setGithubLoading] = useState(false);
    // Crypto Prices State
    const [btcPrice, setBtcPrice] = useState(null);
    const [stxPrice, setStxPrice] = useState(null);
    const [cryptoLoading, setCryptoLoading] = useState(false);
    // IPFS State
    const [ipfsHash, setIpfsHash] = useState('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'); // Example: IPFS logo
    const [ipfsData, setIpfsData] = useState(null);
    const [ipfsLoading, setIpfsLoading] = useState(false);
    // USD to Sats Converter
    const [usdAmount, setUsdAmount] = useState('100');
    const [satsAmount, setSatsAmount] = useState(null);
    const [convertLoading, setConvertLoading] = useState(false);
    // GitHub User Fetch
    const handleFetchGitHub = async () => {
        setGithubLoading(true);
        try {
            const user = await fetchGitHubUser(githubUsername);
            setGithubUser(user);
        }
        catch (error) {
            console.error('GitHub fetch error:', error);
            alert('Failed to fetch GitHub user');
        }
        finally {
            setGithubLoading(false);
        }
    };
    // Crypto Prices Fetch
    const handleFetchCryptoPrices = async () => {
        setCryptoLoading(true);
        try {
            const prices = await fetchCryptoPrices(['bitcoin', 'blockstack'], ['usd']);
            setBtcPrice(prices.bitcoin.usd);
            setStxPrice(prices.blockstack.usd);
        }
        catch (error) {
            console.error('Crypto fetch error:', error);
            alert('Failed to fetch crypto prices');
        }
        finally {
            setCryptoLoading(false);
        }
    };
    // IPFS Fetch
    const handleFetchIPFS = async () => {
        setIpfsLoading(true);
        try {
            const data = await fetchIPFSJson(ipfsHash);
            setIpfsData(data);
        }
        catch (error) {
            console.error('IPFS fetch error:', error);
            alert('Failed to fetch from IPFS');
        }
        finally {
            setIpfsLoading(false);
        }
    };
    // USD to Sats Converter
    const handleConvertUSD = async () => {
        setConvertLoading(true);
        try {
            const sats = await convertUSDtoSatoshis(parseFloat(usdAmount));
            setSatsAmount(sats);
        }
        catch (error) {
            console.error('Conversion error:', error);
            alert('Failed to convert USD to satoshis');
        }
        finally {
            setConvertLoading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6 p-6", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h2", { className: "text-3xl font-bold mb-2", children: "Public API Integrations" }), _jsx("p", { className: "text-gray-600", children: "No authentication required - Free and open APIs" })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Github, { className: "w-6 h-6" }), _jsx("h3", { className: "text-xl font-bold", children: "GitHub API" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", value: githubUsername, onChange: (e) => setGithubUsername(e.target.value), placeholder: "GitHub username", onKeyDown: (e) => e.key === 'Enter' && handleFetchGitHub() }), _jsx(Button, { onClick: handleFetchGitHub, disabled: githubLoading, children: githubLoading ? _jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : 'Fetch' })] }), githubUser && (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg space-y-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: githubUser.avatar_url, alt: githubUser.name, className: "w-16 h-16 rounded-full" }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold", children: githubUser.name }), _jsxs("p", { className: "text-sm text-gray-600", children: ["@", githubUser.login] })] })] }), githubUser.bio && _jsx("p", { className: "text-sm", children: githubUser.bio }), _jsxs("div", { className: "flex gap-4 text-sm", children: [_jsxs("span", { children: ["\uD83D\uDCE6 ", githubUser.public_repos, " repos"] }), _jsxs("span", { children: ["\uD83D\uDC65 ", githubUser.followers, " followers"] })] }), githubUser.location && (_jsxs("p", { className: "text-sm", children: ["\uD83D\uDCCD ", githubUser.location] }))] }))] })] }), _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(TrendingUp, { className: "w-6 h-6" }), _jsx("h3", { className: "text-xl font-bold", children: "Crypto Prices" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs(Button, { onClick: handleFetchCryptoPrices, disabled: cryptoLoading, className: "w-full", children: [cryptoLoading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin mr-2" })) : (_jsx(Bitcoin, { className: "w-4 h-4 mr-2" })), "Fetch Live Prices"] }), (btcPrice || stxPrice) && (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg space-y-3", children: [btcPrice && (_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-semibold", children: "Bitcoin (BTC)" }), _jsx("span", { className: "text-lg font-bold text-orange-600", children: formatCurrency(btcPrice) })] })), stxPrice && (_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-semibold", children: "Stacks (STX)" }), _jsx("span", { className: "text-lg font-bold text-purple-600", children: formatCurrency(stxPrice) })] })), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Powered by CoinGecko API" })] }))] })] }), _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Database, { className: "w-6 h-6" }), _jsx("h3", { className: "text-xl font-bold", children: "IPFS Storage" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", value: ipfsHash, onChange: (e) => setIpfsHash(e.target.value), placeholder: "IPFS hash (Qm... or bafy...)" }), _jsx(Button, { onClick: handleFetchIPFS, disabled: ipfsLoading, children: ipfsLoading ? _jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : 'Fetch' })] }), ipfsData && (_jsx("div", { className: "bg-gray-50 p-4 rounded-lg max-h-64 overflow-auto", children: _jsx("pre", { className: "text-xs", children: JSON.stringify(ipfsData, null, 2) }) })), _jsx("p", { className: "text-xs text-gray-500", children: "Try: QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG" })] })] }), _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Bitcoin, { className: "w-6 h-6" }), _jsx("h3", { className: "text-xl font-bold", children: "USD \u2192 Satoshis" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", type: "number", value: usdAmount, onChange: (e) => setUsdAmount(e.target.value), placeholder: "USD amount" }), _jsx(Button, { onClick: handleConvertUSD, disabled: convertLoading, children: convertLoading ? _jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : 'Convert' })] }), satsAmount !== null && (_jsxs("div", { className: "bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg text-center", children: [_jsxs("p", { className: "text-sm text-gray-600 mb-2", children: ["$", usdAmount, " USD ="] }), _jsx("p", { className: "text-3xl font-bold text-orange-600", children: satsAmount.toLocaleString() }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "satoshis" })] }))] })] })] }), _jsxs(Card, { className: "p-6 bg-blue-50 border-blue-200", children: [_jsx("h3", { className: "text-lg font-bold mb-3", children: "\u2728 No API Keys Required!" }), _jsxs("div", { className: "grid md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-1", children: "GitHub API" }), _jsx("p", { className: "text-gray-600", children: "Access public profile data, repositories, and more without authentication." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-1", children: "CoinGecko API" }), _jsx("p", { className: "text-gray-600", children: "Real-time cryptocurrency prices and market data, completely free." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-1", children: "IPFS Gateways" }), _jsx("p", { className: "text-gray-600", children: "Decentralized file storage accessible through public gateways." })] })] })] })] }));
}
