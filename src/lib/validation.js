import { validateStacksAddress } from '@stacks/transactions';
/**
 * Validate Stacks wallet address
 */
export function validateWalletAddress(address, network = 'testnet') {
    if (!address || address.trim() === '') {
        return { isValid: false, error: 'Address is required' };
    }
    const trimmedAddress = address.trim();
    // Check format (SP for mainnet, ST for testnet)
    const prefix = network === 'mainnet' ? 'SP' : 'ST';
    if (!trimmedAddress.startsWith(prefix)) {
        return {
            isValid: false,
            error: `Invalid address format. ${network === 'mainnet' ? 'Mainnet' : 'Testnet'} addresses must start with ${prefix}`
        };
    }
    // Check length (Stacks addresses are typically 41 characters)
    if (trimmedAddress.length !== 41) {
        return { isValid: false, error: 'Invalid address length' };
    }
    // Use Stacks library validation
    try {
        const isValid = validateStacksAddress(trimmedAddress);
        if (!isValid) {
            return { isValid: false, error: 'Invalid Stacks address' };
        }
        return { isValid: true };
    }
    catch (error) {
        return { isValid: false, error: 'Failed to validate address' };
    }
}
/**
 * Validate amount (must be positive number)
 */
export function validateAmount(amount, min = 0) {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) {
        return { isValid: false, error: 'Amount must be a valid number' };
    }
    if (numAmount <= min) {
        return { isValid: false, error: `Amount must be greater than ${min}` };
    }
    if (!isFinite(numAmount)) {
        return { isValid: false, error: 'Amount must be a finite number' };
    }
    // Check for reasonable maximum (prevent overflow)
    if (numAmount > Number.MAX_SAFE_INTEGER / 1000000) {
        return { isValid: false, error: 'Amount is too large' };
    }
    return { isValid: true };
}
/**
 * Validate date (must be in future)
 */
export function validateFutureDate(dateString) {
    if (!dateString || dateString.trim() === '') {
        return { isValid: false, error: 'Date is required' };
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return { isValid: false, error: 'Invalid date format' };
    }
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (date < now) {
        return { isValid: false, error: 'Date must be in the future' };
    }
    // Check for reasonable max date (10 years from now)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 10);
    if (date > maxDate) {
        return { isValid: false, error: 'Date cannot be more than 10 years in the future' };
    }
    return { isValid: true };
}
/**
 * Validate milestone data
 */
export function validateMilestone(description, amount) {
    if (!description || description.trim() === '') {
        return { isValid: false, error: 'Milestone description is required' };
    }
    if (description.length > 500) {
        return { isValid: false, error: 'Description must be less than 500 characters' };
    }
    return validateAmount(amount, 0);
}
/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeString(input) {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .slice(0, 1000); // Limit length
}
/**
 * Format validation errors for display
 */
export function formatValidationError(field, result) {
    return result.error || `Invalid ${field}`;
}
