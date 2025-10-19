import { openContractCall } from '@stacks/connect';
import { uintCV } from '@stacks/transactions';

// Placeholder env; wire properly via @stacks/network
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || 'SP000000000000000000002Q6VF78';
const NETWORK: any = undefined;

export class SBTCYieldFarming {
	async deployYieldContract(
		invoiceId: string,
		amount: number,
		yieldStrategy: 'stacking' | 'defi-lending'
	): Promise<string> {
		const txId = (await openContractCall({
			contractAddress: CONTRACT_ADDRESS,
			contractName: 'sbtc-yield-farming',
			functionName: 'deploy-yield-escrow',
			functionArgs: [uintCV(parseInt(invoiceId)), uintCV(amount), uintCV(yieldStrategy === 'stacking' ? 0 : 1)],
			network: NETWORK,
		})) as unknown as string;
		return txId;
	}

	async calculateYield(amount: number, durationDays: number): Promise<number> {
		const stackingAPY = 0.08; // 8%
		const annualYield = amount * stackingAPY;
		return Math.floor((annualYield * durationDays) / 365);
	}
}


