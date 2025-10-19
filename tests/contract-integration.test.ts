import { describe, it, expect, vi } from 'vitest';
import { createInvoiceSecure } from '@/lib/stacksIntegration';

vi.mock('@stacks/connect', () => ({
	openContractCall: vi.fn().mockResolvedValue('0x' + 'a'.repeat(64)),
	UserSession: class {},
}));

describe('Smart Contract Integration', () => {
	it('should create invoice with valid parameters', async () => {
    const mockUserSession: any = {
        loadUserData: () => ({ profile: { stxAddress: { testnet: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' } } }),
    };

		const invoiceData = {
			invoice_id: 1,
			payee: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
			amount: 1_000_000,
			token_contract: 'SP000000000000000000002Q6VF78.sbtc-token',
			arbiter: null,
			deadline: '2025-12-31T00:00:00Z',
			milestone_description: 'Test work',
			confidence_score: 0.95,
		};

		const txId = await createInvoiceSecure(invoiceData as any, mockUserSession);
		expect(txId).toMatch(/^0x[a-f0-9]{64}$/);
	});
});


