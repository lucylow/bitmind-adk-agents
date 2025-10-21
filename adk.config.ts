/**
 * ADK-TS CLI Configuration
 * 
 * Official configuration for ADK CLI to discover agents, run dev server,
 * and launch web UI for BitMind DAO Governance Co-pilot
 * 
 * Note: Install @iqai/adk-cli first: npm install @iqai/adk-cli
 */

// Type-safe configuration object (compatible with defineConfig from @iqai/adk-cli)
export default {
  // Agent discovery configuration
  agents: {
    // Directories to search for agents (CLI will auto-discover)
    paths: [
      'src/adk-agents/agents/**/*.agent.ts',
      'src/agents/**/*.agent.ts',
    ],
    // Patterns to ignore
    ignore: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/*.backup',
      '**/node_modules/**',
      '**/dist/**'
    ],
  },
  
  // Development server configuration
  server: {
    port: 8000,
    host: '0.0.0.0',
    cors: {
      enabled: true,
      origins: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://bitmind.ai',
        process.env.FRONTEND_URL
      ].filter(Boolean) as string[]
    },
    // API endpoints
    routes: {
      health: '/health',
      agents: '/api/agents',
      chat: '/api/chat',
      tools: '/api/tools'
    }
  },
  
  // Web UI configuration
  web: {
    port: 3000,
    title: 'BitMind DAO Governance Co-pilot',
    description: 'AI-powered DAO governance analysis with multi-agent collaboration',
    theme: {
      primaryColor: '#6366f1',
      accentColor: '#8b5cf6',
      logo: '/assets/bitmind-logo.svg'
    },
    features: {
      chat: true,
      agentSelection: true,
      toolExecution: true,
      sessionHistory: true,
      darkMode: true
    }
  },
  
  // Hot reload configuration
  watch: {
    enabled: true,
    paths: [
      'src/**/*.ts',
      'src/**/*.tsx',
    ],
    ignore: [
      'node_modules/**',
      'dist/**',
      '**/*.test.ts',
      '**/*.spec.ts'
    ],
    // Debounce delay in ms
    debounce: 300
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    target: 'es2020',
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production'
  },
  
  // Plugins configuration
  plugins: [
    // x402 micropayment plugin
    {
      name: 'x402-payments',
      enabled: true,
      config: {
        network: process.env.PAYMENT_NETWORK || 'base-sepolia',
        tokenAddress: process.env.USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        receiverAddress: process.env.PAYMENT_RECEIVER_ADDRESS
      }
    },
    // ATP tokenization plugin
    {
      name: 'atp-integration',
      enabled: true,
      config: {
        tokenAddress: process.env.BITMIND_TOKEN_ADDRESS,
        agentWallet: process.env.AGENT_PRIVATE_KEY
      }
    }
  ],
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    outputs: ['console', 'file'],
    file: {
      path: 'logs/bitmind.log',
      maxSize: '10M',
      maxFiles: 5
    }
  },
  
  // Environment-specific overrides
  environments: {
    development: {
      server: {
        port: 8000,
      },
      logging: {
        level: 'debug'
      }
    },
    production: {
      server: {
        port: parseInt(process.env.PORT || '8000'),
      },
      build: {
        minify: true,
        sourcemap: false
      },
      logging: {
        level: 'warn'
      }
    }
  }
} as const;

