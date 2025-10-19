export class SecurityValidator {
    static validateStacksAddress(address) {
        if (!address || typeof address !== 'string')
            return false;
        return /^(SP|ST)[0-9A-Z]{38,41}$/i.test(address);
    }
    static validateAmount(amount, maxAmount = 1000000000) {
        return amount > 0 && amount <= maxAmount && Number.isInteger(amount);
    }
    static sanitizeInput(input) {
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/[<>]/g, '')
            .trim();
    }
    static validateDeadline(deadline) {
        const date = new Date(deadline);
        const now = new Date();
        const maxFuture = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        return date > now && date < maxFuture;
    }
}
