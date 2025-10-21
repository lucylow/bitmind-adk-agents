/**
 * Public API Integrations - No Authentication Required
 * These APIs provide free access to public data without API keys
 */
// ============================================
// GitHub API
// ============================================
export async function fetchGitHubUser(username) {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}
export async function fetchGitHubRepos(username) {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
    }
    return await response.json();
}
const IPFS_GATEWAYS = [
    { name: 'ipfs.io', url: 'https://ipfs.io/ipfs/' },
    { name: 'cloudflare', url: 'https://cloudflare-ipfs.com/ipfs/' },
    { name: 'pinata', url: 'https://gateway.pinata.cloud/ipfs/' },
    { name: 'dweb.link', url: 'https://dweb.link/ipfs/' },
];
/**
 * Fetch JSON data from IPFS
 * Tries multiple gateways for reliability
 */
export async function fetchIPFSJson(hash) {
    let lastError = null;
    // Try each gateway
    for (const gateway of IPFS_GATEWAYS) {
        try {
            const url = `${gateway.url}${hash}`;
            const response = await fetch(url, {
                signal: AbortSignal.timeout(10000), // 10 second timeout
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            console.log(`✅ IPFS fetch successful via ${gateway.name}`);
            return data;
        }
        catch (error) {
            console.warn(`❌ Failed to fetch from ${gateway.name}:`, error);
            lastError = error;
            continue;
        }
    }
    throw new Error(`Failed to fetch from IPFS: ${lastError?.message || 'All gateways failed'}`);
}
/**
 * Fetch file/blob from IPFS
 */
export async function fetchIPFSFile(hash) {
    const url = `${IPFS_GATEWAYS[0].url}${hash}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch IPFS file: ${response.statusText}`);
    }
    return await response.blob();
}
/**
 * Get IPFS gateway URL for a hash
 */
export function getIPFSUrl(hash, gatewayIndex = 0) {
    return `${IPFS_GATEWAYS[gatewayIndex].url}${hash}`;
}
/**
 * Validate IPFS hash format
 */
export function isValidIPFSHash(hash) {
    // IPFS v0 (Qm...) or v1 (bafy...)
    return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[0-9A-Za-z]{50,})$/.test(hash);
}
/**
 * Get current Bitcoin price
 */
export async function fetchBitcoinPrice(vsCurrency = 'usd') {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${vsCurrency}`);
    if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.bitcoin[vsCurrency];
}
/**
 * Get Ethereum (ETH) price
 */
export async function fetchEthereumPrice(vsCurrency = 'usd') {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${vsCurrency}`);
    if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.ethereum[vsCurrency];
}
/**
 * Get multiple cryptocurrency prices
 */
export async function fetchCryptoPrices(coinIds, vsCurrencies = ['usd']) {
    const coins = coinIds.join(',');
    const currencies = vsCurrencies.join(',');
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coins}&vs_currencies=${currencies}&include_24hr_change=true`);
    if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`);
    }
    return await response.json();
}
/**
 * Get detailed coin data
 */
export async function fetchCoinDetails(coinId) {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`);
    if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`);
    }
    return await response.json();
}
// ============================================
// 4. Ethereum Blockchain - Public RPC API
// ============================================
const ETH_API_URL = 'https://api.etherscan.io/api';
const ETH_TESTNET_API_URL = 'https://api-goerli.etherscan.io/api';
export async function fetchEthereumBlockchainInfo(testnet = false) {
    const apiUrl = testnet ? ETH_TESTNET_API_URL : ETH_API_URL;
    const response = await fetch(`${apiUrl}?module=proxy&action=eth_blockNumber`);
    if (!response.ok) {
        throw new Error(`Ethereum API error: ${response.statusText}`);
    }
    return await response.json();
}
export async function fetchEthereumAccountBalance(address, testnet = false) {
    const apiUrl = testnet ? ETH_TESTNET_API_URL : ETH_API_URL;
    const response = await fetch(`${apiUrl}?module=account&action=balance&address=${address}&tag=latest`);
    if (!response.ok) {
        throw new Error(`Ethereum API error: ${response.statusText}`);
    }
    return await response.json();
}
export async function fetchEthereumTransaction(txId, testnet = false) {
    const apiUrl = testnet ? ETH_TESTNET_API_URL : ETH_API_URL;
    const response = await fetch(`${apiUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txId}`);
    if (!response.ok) {
        throw new Error(`Ethereum API error: ${response.statusText}`);
    }
    return await response.json();
}
// ============================================
// 5. Utility Functions
// ============================================
/**
 * Convert USD to BTC using current price
 */
export async function convertUSDtoBTC(usdAmount) {
    const btcPrice = await fetchBitcoinPrice();
    return usdAmount / btcPrice;
}
/**
 * Convert BTC to satoshis
 */
export function btcToSatoshis(btc) {
    return Math.floor(btc * 100000000);
}
/**
 * Convert satoshis to BTC
 */
export function satoshisToBTC(sats) {
    return sats / 100000000;
}
/**
 * Convert USD to satoshis
 */
export async function convertUSDtoSatoshis(usdAmount) {
    const btc = await convertUSDtoBTC(usdAmount);
    return btcToSatoshis(btc);
}
/**
 * Format currency with appropriate decimals
 */
export function formatCurrency(amount, currency = 'USD') {
    if (currency === 'BTC') {
        return `₿${amount.toFixed(8)}`;
    }
    else if (currency === 'sats') {
        return `${amount.toLocaleString()} sats`;
    }
    else {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    }
}
class SimpleCache {
    constructor() {
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "defaultTTL", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 60000
        }); // 1 minute
    }
    get(key, ttl) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        const age = Date.now() - entry.timestamp;
        const maxAge = ttl || this.defaultTTL;
        if (age > maxAge) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    set(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }
    clear() {
        this.cache.clear();
    }
}
export const apiCache = new SimpleCache();
/**
 * Cached Bitcoin price fetch (1 minute cache)
 */
export async function fetchBitcoinPriceCached() {
    const cached = apiCache.get('btc-price');
    if (cached !== null)
        return cached;
    const price = await fetchBitcoinPrice();
    apiCache.set('btc-price', price);
    return price;
}
/**
 * Cached Ethereum price fetch (1 minute cache)
 */
export async function fetchEthereumPriceCached() {
    const cached = apiCache.get('eth-price');
    if (cached !== null)
        return cached;
    const price = await fetchEthereumPrice();
    apiCache.set('eth-price', price);
    return price;
}
