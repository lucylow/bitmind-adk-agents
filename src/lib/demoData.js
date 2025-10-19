/**
 * Demo Data for One-Click Testing
 * Provides realistic mock data for hackathon judges and quick testing
 */
/**
 * Demo Stacks addresses for testing (testnet format)
 * These are sample addresses - replace with real testnet addresses for actual testing
 */
export const DEMO_ADDRESSES = {
    // DAO treasury addresses
    defi_protocol: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    nft_marketplace: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
    web3_guild: 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND',
    gaming_dao: 'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB',
    // Freelancer/contractor addresses
    alice: 'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ',
    bob: 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP',
    charlie: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28GBQA1W0F',
    // Arbiter addresses
    neutral_arbiter: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',
    trusted_mediator: 'ST2DS4MSWSGJ3W9FBC6BVT0Y92S345HY8N3T6AV4R',
    // Token contracts
    sbtc_token: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token',
    mock_token: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-token',
};
/**
 * Pre-configured demo invoices for one-click testing
 */
export const DEMO_INVOICES = [
    {
        invoice_id: 2025300,
        payee: DEMO_ADDRESSES.alice,
        amount: 85000000, // 0.85 sBTC in satoshis (8 decimals)
        amount_display: '0.85 sBTC ($52,300)',
        token_contract: DEMO_ADDRESSES.sbtc_token,
        arbiter: DEMO_ADDRESSES.neutral_arbiter,
        deadline: '2025-12-31',
        milestone_description: 'Smart contract security audit + comprehensive security review for DeFi protocol',
        dao_name: 'DeFi Protocol DAO',
    },
    {
        invoice_id: 2025299,
        payee: DEMO_ADDRESSES.bob,
        amount: 42000000, // 0.42 sBTC
        amount_display: '0.42 sBTC ($25,800)',
        token_contract: DEMO_ADDRESSES.sbtc_token,
        arbiter: DEMO_ADDRESSES.trusted_mediator,
        deadline: '2025-11-30',
        milestone_description: 'Complete website redesign with mobile-responsive layout and modern UI',
        dao_name: 'NFT Marketplace Collective',
    },
    {
        invoice_id: 2025298,
        payee: DEMO_ADDRESSES.charlie,
        amount: 65000000, // 0.65 sBTC
        amount_display: '0.65 sBTC ($39,900)',
        token_contract: DEMO_ADDRESSES.sbtc_token,
        arbiter: DEMO_ADDRESSES.neutral_arbiter,
        deadline: '2025-10-31',
        milestone_description: 'Educational tutorial series: 10 comprehensive Bitcoin development guides',
        dao_name: 'Web3 Education Guild',
    },
    {
        invoice_id: 2025297,
        payee: DEMO_ADDRESSES.alice,
        amount: 28000000, // 0.28 sBTC
        amount_display: '0.28 sBTC ($17,200)',
        token_contract: DEMO_ADDRESSES.sbtc_token,
        arbiter: DEMO_ADDRESSES.trusted_mediator,
        deadline: '2025-09-30',
        milestone_description: 'Token economics modeling and game theory analysis for gaming platform',
        dao_name: 'Gaming DAO Treasury',
    },
];
/**
 * Sample invoice text for AI parsing demo
 */
export const DEMO_INVOICE_TEXT = `Invoice #2025-042

FROM: BitDev Studio
TO: Alice (${DEMO_ADDRESSES.alice})

Services Provided:
Complete smart contract security audit for DeFi protocol including:
- Comprehensive code review
- Vulnerability assessment
- Gas optimization analysis
- Final security report

Amount: 0.85 Bitcoin (sBTC on Stacks)

Payment Terms:
- 100% upon completion and report delivery
- Escrowed via BitMind smart contract

Delivery Date: December 31, 2025
Arbiter: ${DEMO_ADDRESSES.neutral_arbiter}

Notes: All work to be verified on-chain with IPFS-stored evidence.
`;
/**
 * Get a random demo invoice for quick testing
 */
export function getRandomDemoInvoice() {
    const randomIndex = Math.floor(Math.random() * DEMO_INVOICES.length);
    return DEMO_INVOICES[randomIndex];
}
/**
 * Get demo invoice by ID
 */
export function getDemoInvoiceById(id) {
    return DEMO_INVOICES.find(invoice => invoice.invoice_id === id);
}
/**
 * Convert demo invoice to smart contract parameters
 */
export function demoToContractParams(demo) {
    // Convert deadline to block height (approximate)
    // For testnet: ~144 blocks per day
    const deadlineDate = new Date(demo.deadline);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const estimatedBlockHeight = Math.max(daysUntilDeadline * 144, 1000); // Minimum 1000 blocks
    return {
        invoiceId: demo.invoice_id,
        payee: demo.payee,
        amount: demo.amount,
        tokenContract: demo.token_contract,
        arbiter: demo.arbiter,
        deadline: estimatedBlockHeight,
    };
}
/**
 * Bitcoin/sBTC conversion utilities
 */
export const SATOSHIS_PER_BTC = 100000000;
export function btcToSatoshis(btc) {
    return Math.floor(btc * SATOSHIS_PER_BTC);
}
export function satoshisToBtc(satoshis) {
    return satoshis / SATOSHIS_PER_BTC;
}
export function formatSatoshis(satoshis, includeSymbol = true) {
    const btc = satoshisToBtc(satoshis);
    const formatted = btc.toFixed(8).replace(/\.?0+$/, ''); // Remove trailing zeros
    return includeSymbol ? `${formatted} sBTC` : formatted;
}
/**
 * USD price estimation (for display only)
 * In production, fetch from price oracle
 */
export function estimateUsdValue(satoshis, btcPriceUsd = 61500) {
    const btc = satoshisToBtc(satoshis);
    const usd = btc * btcPriceUsd;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(usd);
}
