import { openContractCall } from '@stacks/connect';
import { uintCV } from '@stacks/transactions';
// Placeholder env; wire properly via @stacks/network
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || 'SP000000000000000000002Q6VF78';
const NETWORK = undefined;
export class SBTCYieldFarming {
    async deployYieldContract(invoiceId, amount, yieldStrategy) {
        const txId = (await openContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: 'sbtc-yield-farming',
            functionName: 'deploy-yield-escrow',
            functionArgs: [uintCV(parseInt(invoiceId)), uintCV(amount), uintCV(yieldStrategy === 'stacking' ? 0 : 1)],
            network: NETWORK,
        }));
        return txId;
    }
    async calculateYield(amount, durationDays) {
        const stackingAPY = 0.08; // 8%
        const annualYield = amount * stackingAPY;
        return Math.floor((annualYield * durationDays) / 365);
    }
}
