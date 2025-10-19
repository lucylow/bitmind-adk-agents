/**
 * Smart Invoice Contract Integration
 *
 * This module provides TypeScript utilities for interacting with the
 * smart-invoice-escrow Clarity smart contract from the frontend.
 */
import { openContractCall, } from '@stacks/connect';
import { StacksMainnet, StacksTestnet, StacksDevnet, } from '@stacks/network';
import { AnchorMode, PostConditionMode, stringAsciiCV, uintCV, noneCV, someCV, standardPrincipalCV, cvToJSON, callReadOnlyFunction, } from '@stacks/transactions';
// ======================
// Configuration
// ======================
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = 'smart-invoice-escrow';
const NETWORK_TYPE = import.meta.env.VITE_NETWORK || 'testnet';
/**
 * Get the appropriate Stacks network based on environment
 */
export function getNetwork() {
    switch (NETWORK_TYPE) {
        case 'mainnet':
            return new StacksMainnet();
        case 'devnet':
            return new StacksDevnet();
        case 'testnet':
        default:
            return new StacksTestnet();
    }
}
export var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus[InvoiceStatus["Created"] = 0] = "Created";
    InvoiceStatus[InvoiceStatus["Funded"] = 1] = "Funded";
    InvoiceStatus[InvoiceStatus["InProgress"] = 2] = "InProgress";
    InvoiceStatus[InvoiceStatus["Completed"] = 3] = "Completed";
    InvoiceStatus[InvoiceStatus["Disputed"] = 4] = "Disputed";
    InvoiceStatus[InvoiceStatus["Cancelled"] = 5] = "Cancelled";
})(InvoiceStatus || (InvoiceStatus = {}));
export var MilestoneStatus;
(function (MilestoneStatus) {
    MilestoneStatus[MilestoneStatus["Pending"] = 0] = "Pending";
    MilestoneStatus[MilestoneStatus["Completed"] = 1] = "Completed";
    MilestoneStatus[MilestoneStatus["Approved"] = 2] = "Approved";
    MilestoneStatus[MilestoneStatus["Paid"] = 3] = "Paid";
})(MilestoneStatus || (MilestoneStatus = {}));
// ======================
// Contract Call Functions
// ======================
/**
 * Create a new invoice
 */
export async function createInvoice(contractor, totalAmount, arbitrator, onFinish, onCancel) {
    const network = getNetwork();
    const functionArgs = [
        standardPrincipalCV(contractor),
        arbitrator ? someCV(standardPrincipalCV(arbitrator)) : noneCV(),
        uintCV(totalAmount),
    ];
    const options = {
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-invoice',
        functionArgs,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        onFinish,
        onCancel,
    };
    await openContractCall(options);
}
/**
 * Add a milestone to an invoice
 */
export async function addMilestone(invoiceId, description, amount, onFinish, onCancel) {
    const network = getNetwork();
    const functionArgs = [
        uintCV(invoiceId),
        stringAsciiCV(description),
        uintCV(amount),
    ];
    const options = {
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'add-milestone',
        functionArgs,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        onFinish,
        onCancel,
    };
    await openContractCall(options);
}
/**
 * Fund an invoice (lock STX in escrow)
 */
export async function fundInvoice(invoiceId, amount, senderAddress, onFinish, onCancel) {
    const network = getNetwork();
    // Note: Post conditions would be added here to ensure the exact amount is transferred
    // but makeStandardSTXPostCondition has been updated in the latest @stacks/transactions
    const postConditions = [];
    const functionArgs = [uintCV(invoiceId)];
    const options = {
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'fund-invoice',
        functionArgs,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
        postConditions,
        onFinish,
        onCancel,
    };
    await openContractCall(options);
}
/**
 * Mark a milestone as completed (contractor action)
 */
export async function completeMilestone(invoiceId, milestoneIndex, onFinish, onCancel) {
    const network = getNetwork();
    const functionArgs = [uintCV(invoiceId), uintCV(milestoneIndex)];
    const options = {
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'complete-milestone',
        functionArgs,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        onFinish,
        onCancel,
    };
    await openContractCall(options);
}
/**
 * Approve and pay a milestone (client action)
 */
export async function approveAndPayMilestone(invoiceId, milestoneIndex, onFinish, onCancel) {
    const network = getNetwork();
    const functionArgs = [uintCV(invoiceId), uintCV(milestoneIndex)];
    const options = {
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'approve-and-pay-milestone',
        functionArgs,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        onFinish,
        onCancel,
    };
    await openContractCall(options);
}
/**
 * Raise a dispute on an invoice
 */
export async function raiseDispute(invoiceId, reason, onFinish, onCancel) {
    const network = getNetwork();
    const functionArgs = [uintCV(invoiceId), stringAsciiCV(reason)];
    const options = {
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'raise-dispute',
        functionArgs,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        onFinish,
        onCancel,
    };
    await openContractCall(options);
}
/**
 * Resolve a dispute (arbitrator action)
 */
export async function resolveDispute(invoiceId, resolution, refundToClient, onFinish, onCancel) {
    const network = getNetwork();
    const functionArgs = [
        uintCV(invoiceId),
        stringAsciiCV(resolution),
        uintCV(refundToClient),
    ];
    const options = {
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'resolve-dispute',
        functionArgs,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        onFinish,
        onCancel,
    };
    await openContractCall(options);
}
// ======================
// Read-Only Functions
// ======================
/**
 * Get invoice details
 */
export async function getInvoice(invoiceId) {
    const network = getNetwork();
    try {
        const result = await callReadOnlyFunction({
            network,
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-invoice',
            functionArgs: [uintCV(invoiceId)],
            senderAddress: CONTRACT_ADDRESS,
        });
        const jsonResult = cvToJSON(result);
        if (jsonResult.success && jsonResult.value?.value) {
            const data = jsonResult.value.value;
            return {
                invoiceId,
                client: data.client.value,
                contractor: data.contractor.value,
                arbitrator: data.arbitrator?.value?.value,
                totalAmount: parseInt(data['total-amount'].value),
                amountPaid: parseInt(data['amount-paid'].value),
                status: parseInt(data.status.value),
                milestoneCount: parseInt(data['milestone-count'].value),
                createdAt: parseInt(data['created-at'].value),
                completedAt: data['completed-at']?.value ? parseInt(data['completed-at'].value) : undefined,
            };
        }
        return null;
    }
    catch (error) {
        console.error('Error fetching invoice:', error);
        return null;
    }
}
/**
 * Get milestone details
 */
export async function getMilestone(invoiceId, milestoneIndex) {
    const network = getNetwork();
    try {
        const result = await callReadOnlyFunction({
            network,
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-milestone',
            functionArgs: [uintCV(invoiceId), uintCV(milestoneIndex)],
            senderAddress: CONTRACT_ADDRESS,
        });
        const jsonResult = cvToJSON(result);
        if (jsonResult.success && jsonResult.value?.value) {
            const data = jsonResult.value.value;
            return {
                description: data.description.value,
                amount: parseInt(data.amount.value),
                status: parseInt(data.status.value),
                completedAt: data['completed-at']?.value ? parseInt(data['completed-at'].value) : undefined,
                approvedAt: data['approved-at']?.value ? parseInt(data['approved-at'].value) : undefined,
                paidAt: data['paid-at']?.value ? parseInt(data['paid-at'].value) : undefined,
            };
        }
        return null;
    }
    catch (error) {
        console.error('Error fetching milestone:', error);
        return null;
    }
}
/**
 * Get dispute details
 */
export async function getDispute(invoiceId) {
    const network = getNetwork();
    try {
        const result = await callReadOnlyFunction({
            network,
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-dispute',
            functionArgs: [uintCV(invoiceId)],
            senderAddress: CONTRACT_ADDRESS,
        });
        const jsonResult = cvToJSON(result);
        if (jsonResult.success && jsonResult.value?.value) {
            const data = jsonResult.value.value;
            return {
                raisedBy: data['raised-by'].value,
                reason: data.reason.value,
                createdAt: parseInt(data['created-at'].value),
                resolved: data.resolved.value,
                resolution: data.resolution?.value?.value,
                resolvedAt: data['resolved-at']?.value ? parseInt(data['resolved-at'].value) : undefined,
            };
        }
        return null;
    }
    catch (error) {
        console.error('Error fetching dispute:', error);
        return null;
    }
}
/**
 * Get contract escrow balance
 */
export async function getEscrowBalance() {
    const network = getNetwork();
    try {
        const result = await callReadOnlyFunction({
            network,
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-escrow-balance',
            functionArgs: [],
            senderAddress: CONTRACT_ADDRESS,
        });
        const jsonResult = cvToJSON(result);
        return jsonResult.success ? parseInt(jsonResult.value) : 0;
    }
    catch (error) {
        console.error('Error fetching escrow balance:', error);
        return 0;
    }
}
/**
 * Utility: Convert microSTX to STX
 */
export function microStxToStx(microStx) {
    return microStx / 1000000;
}
/**
 * Utility: Convert STX to microSTX
 */
export function stxToMicroStx(stx) {
    return Math.floor(stx * 1000000);
}
/**
 * Utility: Get status label
 */
export function getInvoiceStatusLabel(status) {
    const labels = {
        [InvoiceStatus.Created]: 'Created',
        [InvoiceStatus.Funded]: 'Funded',
        [InvoiceStatus.InProgress]: 'In Progress',
        [InvoiceStatus.Completed]: 'Completed',
        [InvoiceStatus.Disputed]: 'Disputed',
        [InvoiceStatus.Cancelled]: 'Cancelled',
    };
    return labels[status] || 'Unknown';
}
/**
 * Utility: Get milestone status label
 */
export function getMilestoneStatusLabel(status) {
    const labels = {
        [MilestoneStatus.Pending]: 'Pending',
        [MilestoneStatus.Completed]: 'Completed',
        [MilestoneStatus.Approved]: 'Approved',
        [MilestoneStatus.Paid]: 'Paid',
    };
    return labels[status] || 'Unknown';
}
