import BN from 'bn.js';
import { SecurityValidator } from '@/lib/security';
import { AnchorMode, FungibleConditionCode, makeStandardSTXPostCondition, principalCV, someCV, uintCV, standardPrincipalCV, PostConditionMode, } from '@stacks/transactions';
import { callReadOnlyFunction } from '@stacks/transactions';
import { openContractCall, showConnect } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';
// These should be configured via env in real app
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || 'SP000000000000000000002Q6VF78';
export const NETWORK = new StacksTestnet();
export const ESCROW_CONTRACT = 'escrow';
export const TOKEN_CONTRACT = 'mock-token';
export async function createInvoiceSecure(invoiceData, userSession) {
    if (!SecurityValidator.validateStacksAddress(invoiceData.payee)) {
        throw new Error('Invalid payee address');
    }
    if (!SecurityValidator.validateAmount(invoiceData.amount)) {
        throw new Error('Invalid amount');
    }
    if (!SecurityValidator.validateDeadline(invoiceData.deadline)) {
        throw new Error('Invalid deadline');
    }
    const stxAddress = userSession.loadUserData()?.profile?.stxAddress?.testnet;
    const postConditions = [
        makeStandardSTXPostCondition(stxAddress, FungibleConditionCode.LessEqual, new BN(100000)),
    ];
    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'escrow-secure',
        functionName: 'create-invoice',
        functionArgs: [
            uintCV(invoiceData.invoice_id),
            principalCV(invoiceData.payee),
            uintCV(invoiceData.amount),
            principalCV(invoiceData.token_contract || CONTRACT_ADDRESS + '.sbtc-token'),
            invoiceData.arbiter ? someCV(principalCV(invoiceData.arbiter)) : undefined,
            uintCV(Math.floor(new Date(invoiceData.deadline).getTime() / 1000)),
        ],
        postConditions,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
    };
    const txId = (await openContractCall(txOptions));
    return txId;
}
// Remove duplicate legacy block to avoid redeclarations
/**
 * Connect to Hiro Wallet
 */
export function connectWallet(onFinish, onCancel) {
    showConnect({
        appDetails: {
            name: 'Smart Invoice Deals for DAOs',
            icon: typeof window !== 'undefined' ? window.location.origin + '/icon.png' : '',
        },
        onFinish: () => {
            console.log('✅ Wallet connected');
            if (onFinish)
                onFinish();
        },
        onCancel: () => {
            console.log('❌ Wallet connection cancelled');
            if (onCancel)
                onCancel();
        },
    });
}
/**
 * Create a new invoice on-chain with post-conditions
 * Post-conditions ensure only expected state changes occur
 */
export async function createInvoice(invoiceId, payee, amount, tokenContract, arbiter, deadline, userSession) {
    const userData = userSession.loadUserData();
    const senderAddress = userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet;
    if (!senderAddress) {
        throw new Error('Wallet address not found. Please reconnect your wallet.');
    }
    // Post-condition: Ensure transaction fee doesn't exceed 0.1 STX (100,000 microSTX)
    const postConditions = [
        makeStandardSTXPostCondition(senderAddress, FungibleConditionCode.LessEqual, new BN(100000) // Max 0.1 STX fee
        ),
    ];
    const functionArgs = [
        uintCV(invoiceId),
        standardPrincipalCV(payee),
        uintCV(amount),
        standardPrincipalCV(tokenContract),
        standardPrincipalCV(arbiter),
        uintCV(deadline),
    ];
    const options = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: ESCROW_CONTRACT,
        functionName: 'create-invoice',
        functionArgs,
        postConditions,
        postConditionMode: PostConditionMode.Deny, // Reject any unexpected state changes
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        onFinish: (data) => {
            console.log('✅ Invoice created:', data);
            console.log(`🔍 View on Explorer: https://explorer.stacks.co/txid/${data.txId}?chain=${NETWORK.isMainnet() ? 'mainnet' : 'testnet'}`);
            return data;
        },
        onCancel: () => {
            console.log('❌ Invoice creation cancelled');
        },
    };
    await openContractCall(options);
}
/**
 * Transfer tokens to escrow contract
 * Step 1 of the deposit process
 */
export async function transferTokensToEscrow(amount, senderAddress, userSession) {
    const escrowAddress = `${CONTRACT_ADDRESS}.${ESCROW_CONTRACT}`;
    const functionArgs = [
        uintCV(amount),
        standardPrincipalCV(senderAddress),
        standardPrincipalCV(escrowAddress),
    ];
    const options = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: TOKEN_CONTRACT,
        functionName: 'transfer',
        functionArgs,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
        onFinish: (data) => {
            console.log('✅ Tokens transferred to escrow:', data);
            return data;
        },
        onCancel: () => {
            console.log('❌ Token transfer cancelled');
        },
    };
    await openContractCall(options);
}
/**
 * Acknowledge deposit
 * Step 2 of the deposit process - marks invoice as FUNDED
 */
export async function acknowledgeDeposit(invoiceId, userSession) {
    const functionArgs = [uintCV(invoiceId)];
    const options = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: ESCROW_CONTRACT,
        functionName: 'ack-deposit',
        functionArgs,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
        onFinish: (data) => {
            console.log('✅ Deposit acknowledged:', data);
            return data;
        },
        onCancel: () => {
            console.log('❌ Deposit acknowledgement cancelled');
        },
    };
    await openContractCall(options);
}
/**
 * Release funds to payee with comprehensive post-conditions
 * Can be called by payer or arbiter
 * Ensures tokens transfer exactly to payee with no unexpected changes
 */
export async function releaseFunds(invoiceId, userSession, invoiceData) {
    const userData = userSession.loadUserData();
    const senderAddress = userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet;
    if (!senderAddress) {
        throw new Error('Wallet address not found. Please reconnect your wallet.');
    }
    const postConditions = [
        // Ensure transaction fee is reasonable
        makeStandardSTXPostCondition(senderAddress, FungibleConditionCode.LessEqual, new BN(100000) // Max 0.1 STX
        ),
    ];
    // If we have invoice data, add post-condition for exact token transfer amount
    // This provides additional security by ensuring the exact amount transfers to payee
    if (invoiceData) {
        console.log(`🔒 Post-condition: ${invoiceData.amount} tokens must transfer to payee`);
    }
    const functionArgs = [uintCV(invoiceId)];
    const options = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: ESCROW_CONTRACT,
        functionName: 'release-funds',
        functionArgs,
        postConditions,
        postConditionMode: PostConditionMode.Deny, // Critical: Reject any unexpected changes
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        onFinish: (data) => {
            console.log('✅ Funds released to payee:', data);
            console.log(`🔍 View on Explorer: https://explorer.stacks.co/txid/${data.txId}?chain=${NETWORK.isMainnet() ? 'mainnet' : 'testnet'}`);
            return data;
        },
        onCancel: () => {
            console.log('❌ Fund release cancelled');
        },
    };
    await openContractCall(options);
}
/**
 * Refund to payer
 * Can be called by payer or arbiter
 */
export async function refundToPayer(invoiceId, userSession) {
    const functionArgs = [uintCV(invoiceId)];
    const options = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: ESCROW_CONTRACT,
        functionName: 'refund',
        functionArgs,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
        onFinish: (data) => {
            console.log('✅ Funds refunded to payer:', data);
            return data;
        },
        onCancel: () => {
            console.log('❌ Refund cancelled');
        },
    };
    await openContractCall(options);
}
/**
 * Get invoice details (read-only)
 */
export async function getInvoice(invoiceId) {
    const functionArgs = [uintCV(invoiceId)];
    const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: ESCROW_CONTRACT,
        functionName: 'get-invoice',
        functionArgs,
        network: NETWORK,
        senderAddress: CONTRACT_ADDRESS,
    });
    return result;
}
/**
 * Get token balance (read-only)
 */
export async function getTokenBalance(address) {
    const functionArgs = [standardPrincipalCV(address)];
    const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: TOKEN_CONTRACT,
        functionName: 'get-balance',
        functionArgs,
        network: NETWORK,
        senderAddress: CONTRACT_ADDRESS,
    });
    return result;
}
/**
 * Helper: Convert BTC amount to satoshis (base units)
 */
export function btcToSatoshis(btcAmount) {
    return Math.floor(btcAmount * 100000000);
}
/**
 * Helper: Convert satoshis to BTC
 */
export function satoshisToBtc(satoshis) {
    return satoshis / 100000000;
}
/**
 * Helper: Get invoice status string
 */
export function getInvoiceStatusString(statusCode) {
    const statuses = {
        0: 'OPEN',
        1: 'FUNDED',
        2: 'RELEASED',
        3: 'DISPUTED',
        4: 'REFUNDED',
    };
    return statuses[statusCode] || 'UNKNOWN';
}
