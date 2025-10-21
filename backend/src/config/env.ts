// backend/src/config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  
  // ADK-TS Configuration
  GOOGLE_API_KEY: z.string().min(1, 'GOOGLE_API_KEY is required'),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // Blockchain Configuration
  ETHEREUM_RPC_URL: z.string().optional().default('https://eth-mainnet.g.alchemy.com/v2/demo'),
  POLYGON_RPC_URL: z.string().optional(),
  
  // Database
  MONGODB_URI: z.string().optional().default('mongodb://localhost:27017/dao-copilot'),
  REDIS_URL: z.string().optional().default('redis://localhost:6379'),
  
  // Security
  JWT_SECRET: z.string().optional().default('dev-secret-change-in-production'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
});

export type Env = z.infer<typeof envSchema>;

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

export function validateEnv(): boolean {
  try {
    envSchema.parse(process.env);
    return true;
  } catch {
    return false;
  }
}

