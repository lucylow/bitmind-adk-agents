/**
 * MCP Server Configuration
 * Central configuration for all MCP servers
 */

export interface MCPServerConfig {
  // Blockchain Data MCP Config
  blockchain: {
    rpcUrl: string;
    graphqlEndpoint: string;
    chainId: number;
    fallbackRpcUrls?: string[];
  };

  // Governance Platform MCP Config
  governance: {
    snapshotHub: string;
    tallyApiKey?: string;
    tallyApiUrl: string;
    defaultSpace?: string;
    defaultGovernor?: string;
  };

  // Risk Assessment MCP Config
  riskAssessment: {
    openaiApiKey?: string;
    anthropicApiKey?: string;
    riskThresholds: {
      low: number;
      medium: number;
      high: number;
    };
    enableAIAnalysis: boolean;
  };

  // General Config
  cacheEnabled: boolean;
  cacheTTL: number;
  maxRetries: number;
  retryDelay: number;
}

export const defaultMCPConfig: MCPServerConfig = {
  blockchain: {
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    graphqlEndpoint: process.env.GRAPH_ENDPOINT || 'https://api.thegraph.com/subgraphs/name/graphprotocol/compound-governance',
    chainId: parseInt(process.env.CHAIN_ID || '1'),
    fallbackRpcUrls: [
      'https://ethereum.publicnode.com',
      'https://rpc.ankr.com/eth',
    ],
  },

  governance: {
    snapshotHub: process.env.SNAPSHOT_HUB || 'https://hub.snapshot.org/graphql',
    tallyApiKey: process.env.TALLY_API_KEY,
    tallyApiUrl: process.env.TALLY_API_URL || 'https://api.tally.xyz/query',
    defaultSpace: process.env.DEFAULT_SNAPSHOT_SPACE || 'compound.eth',
    defaultGovernor: process.env.DEFAULT_GOVERNOR_ID,
  },

  riskAssessment: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    riskThresholds: {
      low: parseFloat(process.env.RISK_THRESHOLD_LOW || '0.3'),
      medium: parseFloat(process.env.RISK_THRESHOLD_MEDIUM || '0.6'),
      high: parseFloat(process.env.RISK_THRESHOLD_HIGH || '0.8'),
    },
    enableAIAnalysis: process.env.ENABLE_AI_RISK_ANALYSIS === 'true',
  },

  cacheEnabled: process.env.CACHE_ENABLED !== 'false',
  cacheTTL: parseInt(process.env.CACHE_TTL || '300'), // 5 minutes
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.RETRY_DELAY || '1000'), // 1 second
};

// Network-specific configurations
export const networkConfigs = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
    graphqlEndpoint: 'https://api.thegraph.com/subgraphs/name/graphprotocol/compound-governance',
  },
  goerli: {
    chainId: 5,
    name: 'Goerli Testnet',
    rpcUrl: 'https://eth-goerli.g.alchemy.com/v2/demo',
    graphqlEndpoint: 'https://api.thegraph.com/subgraphs/name/graphprotocol/compound-governance-goerli',
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    graphqlEndpoint: 'https://api.thegraph.com/subgraphs/name/graphprotocol/polygon-governance',
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    graphqlEndpoint: 'https://api.thegraph.com/subgraphs/name/graphprotocol/arbitrum-governance',
  },
};

// Popular DAO configurations
export const daoConfigs = {
  compound: {
    name: 'Compound',
    snapshotSpace: 'comp-vote.eth',
    tallyGovernorId: 'eip155:1:0xc0Da02939E1441F497fd74F78cE7Decb17B66529',
    governorAddress: '0xc0Da02939E1441F497fd74F78cE7Decb17B66529',
  },
  aave: {
    name: 'Aave',
    snapshotSpace: 'aave.eth',
    tallyGovernorId: 'eip155:1:0xEC568fffba86c094cf06b22134B23074DFE2252c',
    governorAddress: '0xEC568fffba86c094cf06b22134B23074DFE2252c',
  },
  uniswap: {
    name: 'Uniswap',
    snapshotSpace: 'uniswap.eth',
    tallyGovernorId: 'eip155:1:0x408ED6354d4973f66138C91495F2f2FCbd8724C3',
    governorAddress: '0x408ED6354d4973f66138C91495F2f2FCbd8724C3',
  },
  ens: {
    name: 'ENS',
    snapshotSpace: 'ens.eth',
    tallyGovernorId: 'eip155:1:0x323A76393544d5ecca80cd6ef2A560C6a395b7E3',
    governorAddress: '0x323A76393544d5ecca80cd6ef2A560C6a395b7E3',
  },
};

export function getMCPConfig(overrides?: Partial<MCPServerConfig>): MCPServerConfig {
  return {
    ...defaultMCPConfig,
    ...overrides,
    blockchain: {
      ...defaultMCPConfig.blockchain,
      ...overrides?.blockchain,
    },
    governance: {
      ...defaultMCPConfig.governance,
      ...overrides?.governance,
    },
    riskAssessment: {
      ...defaultMCPConfig.riskAssessment,
      ...overrides?.riskAssessment,
    },
  };
}

