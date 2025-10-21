/**
 * Environment Configuration
 * Validates and exports environment variables
 */

import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  HOST: z.string().default('0.0.0.0'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // AI API Keys
  GOOGLE_API_KEY: z.string().min(1, 'Google API key is required'),
  OPENAI_API_KEY: z.string().optional(),
  
  // Blockchain
  ETHEREUM_RPC_URL: z.string().url().optional(),
  POLYGON_RPC_URL: z.string().url().optional(),
  STACKS_API_URL: z.string().url().default('https://api.mainnet.hiro.so'),
  
  // Database
  MONGODB_URI: z.string().default('mongodb://localhost:27017/dao-governance'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  // Security
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  SESSION_SECRET: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  
  // External APIs
  SNAPSHOT_API_URL: z.string().url().default('https://hub.snapshot.org/graphql'),
  TALLY_API_URL: z.string().url().optional(),
  COMPOUND_API_URL: z.string().url().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log')
});

export type Env = z.infer<typeof envSchema>;

// Parse and validate environment
let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export { env };

// Helper functions
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

