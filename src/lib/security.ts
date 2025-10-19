export class SecurityValidator {
	static validateStacksAddress(address: string): boolean {
		if (!address || typeof address !== 'string') return false;
		return /^(SP|ST)[0-9A-Z]{38,41}$/i.test(address);
	}

	static validateAmount(amount: number, maxAmount: number = 1_000_000_000): boolean {
		return amount > 0 && amount <= maxAmount && Number.isInteger(amount);
	}

	static sanitizeInput(input: string): string {
		return input
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
			.replace(/[<>]/g, '')
			.trim();
	}

	static validateDeadline(deadline: string): boolean {
		const date = new Date(deadline);
		const now = new Date();
		const maxFuture = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
		return date > now && date < maxFuture;
	}
}


