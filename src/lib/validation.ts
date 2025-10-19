/**
 * Comprehensive Input Validation with Zod
 * Security-first validation for all invoice data
 */

import { z } from 'zod';

// Stacks address regex (testnet and mainnet)
const STACKS_ADDRESS_REGEX = /^(SP|ST)[0-9A-Z]{38,41}$/;
const CONTRACT_PRINCIPAL_REGEX = /^(SP|ST)[0-9A-Z]{38,41}\.[a-z0-9-]+$/;

// Constants for validation limits
export const VALIDATION_LIMITS = {
  MAX_INVOICE_AMOUNT: 100_0000_0000, // 100 BTC in satoshis
  MIN_INVOICE_AMOUNT: 100, // 0.000001 BTC minimum
  MAX_MILESTONE_DESCRIPTION: 500,
  MIN_MILESTONE_DESCRIPTION: 10,
  MIN_CONFIDENCE_SCORE: 0.8, // Reject low-confidence parses
  MAX_CONFIDENCE_SCORE: 1.0,
  MIN_DEADLINE_DAYS: 1, // At least 1 day in future
  MAX_DEADLINE_DAYS: 365, // Max 1 year out
} as const;

/**
 * Invoice ID validation - must be positive integer
 */
export const InvoiceIdSchema = z.number()
  .positive('Invoice ID must be positive')
  .int('Invoice ID must be an integer')
  .max(2147483647, 'Invoice ID exceeds maximum value'); // uint max in Clarity

/**
 * Stacks address validation
 */
export const StacksAddressSchema = z.string()
  .regex(STACKS_ADDRESS_REGEX, 'Invalid Stacks address format (must start with SP or ST)')
  .refine(
    (addr) => addr.length >= 39 && addr.length <= 42,
    'Stacks address must be 39-42 characters'
  );

/**
 * Contract principal validation (address.contract-name)
 */
export const ContractPrincipalSchema = z.string()
  .regex(CONTRACT_PRINCIPAL_REGEX, 'Invalid contract principal format')
  .refine(
    (principal) => {
      const [address, contractName] = principal.split('.');
      return contractName && contractName.length > 0 && contractName.length <= 40;
    },
    'Contract name must be 1-40 characters'
  );

/**
 * Amount validation - prevents overflow attacks
 */
export const AmountSchema = z.number()
  .positive('Amount must be positive')
  .int('Amount must be an integer (satoshis)')
  .min(VALIDATION_LIMITS.MIN_INVOICE_AMOUNT, `Amount must be at least ${VALIDATION_LIMITS.MIN_INVOICE_AMOUNT} satoshis`)
  .max(VALIDATION_LIMITS.MAX_INVOICE_AMOUNT, `Amount exceeds maximum of 100 BTC (${VALIDATION_LIMITS.MAX_INVOICE_AMOUNT} satoshis)`);

/**
 * Deadline validation - must be reasonable future date
 */
export const DeadlineSchema = z.string()
  .datetime('Deadline must be a valid ISO 8601 datetime')
  .refine(
    (dateStr) => {
      const deadline = new Date(dateStr);
      const now = new Date();
      const minDeadline = new Date(now.getTime() + VALIDATION_LIMITS.MIN_DEADLINE_DAYS * 24 * 60 * 60 * 1000);
      const maxDeadline = new Date(now.getTime() + VALIDATION_LIMITS.MAX_DEADLINE_DAYS * 24 * 60 * 60 * 1000);
      
      return deadline >= minDeadline && deadline <= maxDeadline;
    },
    `Deadline must be between ${VALIDATION_LIMITS.MIN_DEADLINE_DAYS} day and ${VALIDATION_LIMITS.MAX_DEADLINE_DAYS} days in the future`
  );

/**
 * Milestone description validation
 */
export const MilestoneDescriptionSchema = z.string()
  .min(VALIDATION_LIMITS.MIN_MILESTONE_DESCRIPTION, `Description must be at least ${VALIDATION_LIMITS.MIN_MILESTONE_DESCRIPTION} characters`)
  .max(VALIDATION_LIMITS.MAX_MILESTONE_DESCRIPTION, `Description must not exceed ${VALIDATION_LIMITS.MAX_MILESTONE_DESCRIPTION} characters`)
  .refine(
    (desc) => desc.trim().length > 0,
    'Description cannot be empty or only whitespace'
  );

/**
 * Confidence score validation (AI parsing quality)
 */
export const ConfidenceScoreSchema = z.number()
  .min(0, 'Confidence score must be between 0 and 1')
  .max(1, 'Confidence score must be between 0 and 1');

/**
 * Complete Invoice Data Schema
 */
export const InvoiceSchema = z.object({
  invoice_id: InvoiceIdSchema,
  payee: StacksAddressSchema,
  payer: StacksAddressSchema.nullable().optional(),
  amount: AmountSchema,
  token_contract: ContractPrincipalSchema.nullable().optional(),
  arbiter: StacksAddressSchema.nullable().optional(),
  deadline: DeadlineSchema,
  milestone_description: MilestoneDescriptionSchema,
  confidence_score: ConfidenceScoreSchema.optional()
});

/**
 * Invoice Creation Request Schema (from user input)
 */
export const InvoiceCreationSchema = InvoiceSchema.extend({
  confidence_score: ConfidenceScoreSchema.refine(
    (score) => score === undefined || score >= VALIDATION_LIMITS.MIN_CONFIDENCE_SCORE,
    `AI confidence score must be at least ${VALIDATION_LIMITS.MIN_CONFIDENCE_SCORE * 100}% to proceed automatically`
  )
});

/**
 * Type exports
 */
export type ValidatedInvoice = z.infer<typeof InvoiceSchema>;
export type ValidatedInvoiceCreation = z.infer<typeof InvoiceCreationSchema>;

/**
 * Validation helper with detailed error messages
 */
export function validateInvoiceData(data: unknown): {
  success: boolean;
  data?: ValidatedInvoice;
  errors?: string[];
} {
  try {
    const validated = InvoiceSchema.parse(data);
    return { 
      success: true,
      data: validated
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err: z.ZodIssue) => 
        `${err.path.join('.')}: ${err.message}`
      );
      return {
        success: false,
        errors
      };
    }
    return {
      success: false,
      errors: ['Unknown validation error']
    };
  }
}

/**
 * Additional security validations
 */
export const SecurityValidations = {
  /**
   * Prevent self-payment attacks
   */
  preventSelfPayment: (payee: string, payer: string | null | undefined): boolean => {
    if (!payer) return true; // No payer specified yet
    return payee.toLowerCase() !== payer.toLowerCase();
  },

  /**
   * Validate arbiter is different from payer and payee
   */
  validateArbiter: (arbiter: string | null | undefined, payee: string, payer: string | null | undefined): boolean => {
    if (!arbiter) return true; // Arbiter is optional
    const arbiterLower = arbiter.toLowerCase();
    const payeeLower = payee.toLowerCase();
    const payerLower = payer?.toLowerCase();
    
    return arbiterLower !== payeeLower && arbiterLower !== payerLower;
  },

  /**
   * Sanitize user input to prevent injection
   */
  sanitizeString: (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .substring(0, VALIDATION_LIMITS.MAX_MILESTONE_DESCRIPTION);
  }
};

/**
 * Comprehensive validation with security checks
 */
export function validateInvoiceWithSecurity(data: unknown): {
  success: boolean;
  data?: ValidatedInvoice;
  errors?: string[];
  warnings?: string[];
} {
  // First, validate with Zod schema
  const validation = validateInvoiceData(data);
  
  if (!validation.success) {
    return validation;
  }

  const invoice = validation.data!;
  const warnings: string[] = [];

  // Additional security validations
  if (!SecurityValidations.preventSelfPayment(invoice.payee, invoice.payer)) {
    return {
      success: false,
      errors: ['Security: Payee and payer cannot be the same address (self-payment not allowed)']
    };
  }

  if (!SecurityValidations.validateArbiter(invoice.arbiter, invoice.payee, invoice.payer)) {
    return {
      success: false,
      errors: ['Security: Arbiter must be different from both payee and payer']
    };
  }

  // Warnings for potentially suspicious amounts
  if (invoice.amount > 10_0000_0000) { // > 10 BTC
    warnings.push('Large amount detected (>10 BTC). Please verify this is intentional.');
  }

  // Warning for very short deadlines
  const deadline = new Date(invoice.deadline);
  const now = new Date();
  const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysUntilDeadline < 3) {
    warnings.push('Deadline is less than 3 days away. Consider allowing more time for completion.');
  }

  return {
    success: true,
    data: invoice,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Quick validation helpers for forms
 */
export const FormValidators = {
  isValidStacksAddress: (address: string): boolean => {
    return StacksAddressSchema.safeParse(address).success;
  },

  isValidAmount: (amount: number): boolean => {
    return AmountSchema.safeParse(amount).success;
  },

  isValidDeadline: (deadline: string): boolean => {
    return DeadlineSchema.safeParse(deadline).success;
  },

  formatValidationError: (fieldName: string, error: string): string => {
    return `${fieldName}: ${error}`;
  }
};

/**
 * Direct exports for convenience
 */
export const validateWalletAddress = (address: string): boolean => {
  return FormValidators.isValidStacksAddress(address);
};

export const validateAmount = (amount: number): boolean => {
  return FormValidators.isValidAmount(amount);
};

export const validateMilestone = (description: string): boolean => {
  return MilestoneDescriptionSchema.safeParse(description).success;
};

export const sanitizeString = SecurityValidations.sanitizeString;

export const formatValidationError = FormValidators.formatValidationError;
