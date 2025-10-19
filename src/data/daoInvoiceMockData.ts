/**
 * Mock Data for DAO Smart Invoice Deals Demo
 * Complete dataset for demonstrating the full workflow without API keys
 */

export interface DAOInvoiceTemplate {
  id: string;
  daoName: string;
  daoType: string;
  invoiceText: string;
  parsedData: {
    invoice_id: number;
    payee: string;
    payer: string;
    amount: number; // in satoshis
    token_contract: string;
    arbiter: string;
    deadline: string;
    milestone_description: string;
  };
  scenario: string;
  complexity: 'simple' | 'medium' | 'complex';
  nlpMetadata?: {
    processingTime: number; // milliseconds
    f1Score: number;
    model: string;
    extractedEntities: string[];
    schemaType: string;
  };
}

export const DAO_INVOICE_TEMPLATES: DAOInvoiceTemplate[] = [
  {
    id: 'defi-audit',
    daoName: 'DeFi Protocol DAO',
    daoType: 'DeFi',
    scenario: 'Smart Contract Security Audit',
    complexity: 'complex',
    invoiceText: `Invoice #2025-300
To: SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7 (Alice Security Firm)
From: DeFi Protocol DAO Treasury
Description: Comprehensive smart contract security audit covering 5 contracts
Amount: 0.85 sBTC due on 2025-12-31
Milestones:
  - Initial security assessment (25%) - Review architecture
  - Vulnerability scanning & testing (40%) - Automated + manual testing
  - Final report & remediation guidance (35%) - Deliver detailed report
Arbiter: SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE (DAO Governance MultiSig)
Notes: Include gas optimization recommendations and post-audit support for 30 days`,
    parsedData: {
      invoice_id: 2025300,
      payee: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      payer: 'SP1H1733V5MZ3SZ9XRW9FKYAH3SF0T5PKGTG4D0D1',
      amount: 85000000, // 0.85 sBTC in satoshis
      token_contract: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sbtc-token',
      arbiter: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      deadline: '2025-12-31',
      milestone_description: 'Smart contract security audit with 3 milestones: assessment, testing, final report'
    },
    nlpMetadata: {
      processingTime: 1847,
      f1Score: 0.952,
      model: 'BERT-base-uncased',
      extractedEntities: ['payee', 'payer', 'amount', 'milestones', 'arbiter', 'deadline'],
      schemaType: 'JSON-LD'
    }
  },
  {
    id: 'nft-marketplace',
    daoName: 'NFT Marketplace Collective',
    daoType: 'NFT/Marketplace',
    scenario: 'Website Redesign & Mobile Development',
    complexity: 'medium',
    invoiceText: `Invoice #2025-299
To: SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JCW (Bob Design Studio)
From: NFT Marketplace Collective
Description: Complete website redesign with mobile-responsive interface
Amount: 0.42 sBTC for UX/UI redesign + frontend implementation
Milestones:
  - Design mockups & wireframes (33%)
  - Frontend implementation (33%)
  - Mobile optimization & testing (34%)
Deadline: 2025-11-15
Arbiter: SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE`,
    parsedData: {
      invoice_id: 2025299,
      payee: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JCW',
      payer: 'SP1K1A1PMGW2ZJCNF46NWZWHG8TS1D23EGH1KNGF1',
      amount: 42000000, // 0.42 sBTC
      token_contract: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sbtc-token',
      arbiter: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      deadline: '2025-11-15',
      milestone_description: 'Website redesign with mobile-responsive interface in 3 phases'
    }
  },
  {
    id: 'web3-education',
    daoName: 'Web3 Education Guild',
    daoType: 'Education',
    scenario: 'Tutorial Series & Technical Documentation',
    complexity: 'medium',
    invoiceText: `Invoice #2025-298
To: SP3NXX9GHXKJA6KHG0V3PPW3K9VQXK3DWVF2C5YQJ (Carol Tech Writer)
From: Web3 Education Guild
Description: Create comprehensive tutorial series on Clarity smart contracts
Amount: 0.65 sBTC
Deliverables:
  - 10 video tutorials covering basics to advanced topics
  - Written documentation with code examples
  - Interactive coding exercises
Payment Schedule: 3 milestones (30% / 40% / 30%)
Due: 2025-12-20
Arbiter: SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE`,
    parsedData: {
      invoice_id: 2025298,
      payee: 'SP3NXX9GHXKJA6KHG0V3PPW3K9VQXK3DWVF2C5YQJ',
      payer: 'SP2T6MPYQ3FZJXFDN0S8DN3JCY8BMXC8XGBQY9VGT',
      amount: 65000000, // 0.65 sBTC
      token_contract: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sbtc-token',
      arbiter: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      deadline: '2025-12-20',
      milestone_description: 'Tutorial series with videos, documentation, and interactive exercises'
    }
  },
  {
    id: 'gaming-tokenomics',
    daoName: 'Gaming DAO Treasury',
    daoType: 'Gaming',
    scenario: 'Token Economics Design',
    complexity: 'simple',
    invoiceText: `Invoice #2025-297
To: SP1WTA0YBPC5R6GDMPPJCEDEA6Z2ZEPNMQ4C8DGCP (Dave Economics)
From: Gaming DAO Treasury
Description: Token economics modeling and whitepaper
Amount: 0.28 sBTC
Work: Design sustainable tokenomics with play-to-earn mechanics
Deadline: 2025-11-30
Arbiter: SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE`,
    parsedData: {
      invoice_id: 2025297,
      payee: 'SP1WTA0YBPC5R6GDMPPJCEDEA6Z2ZEPNMQ4C8DGCP',
      payer: 'SP2QH3VFYQ3T1QJYVP9MZQNC3NK3KHYQ5GG8PH2FT',
      amount: 28000000, // 0.28 sBTC
      token_contract: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sbtc-token',
      arbiter: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      deadline: '2025-11-30',
      milestone_description: 'Token economics modeling for play-to-earn game'
    }
  },
  {
    id: 'social-community',
    daoName: 'Social Impact DAO',
    daoType: 'Social Impact',
    scenario: 'Community Management Platform',
    complexity: 'complex',
    invoiceText: `Invoice #2025-296
To: SP39BCTZK5HKJ7H1XKBX2STFP5HMBPJF8R1Z7GVCY (Eve Dev Team)
From: Social Impact DAO
Description: Build community engagement platform with governance voting
Amount: 1.20 sBTC
Scope:
  - User authentication & profiles
  - Proposal creation & voting system
  - Integration with Stacks blockchain
  - Mobile-first responsive design
Milestones: 4 phases at 25% each
Deadline: 2026-01-31
Arbiter: SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE`,
    parsedData: {
      invoice_id: 2025296,
      payee: 'SP39BCTZK5HKJ7H1XKBX2STFP5HMBPJF8R1Z7GVCY',
      payer: 'SP1AXZQ4GXNR8N5QH7PJ0T2V0SXFZP3VYKCMKG0QT',
      amount: 120000000, // 1.20 sBTC
      token_contract: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sbtc-token',
      arbiter: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      deadline: '2026-01-31',
      milestone_description: 'Community platform with authentication, voting, and blockchain integration'
    }
  },
  {
    id: 'metaverse-3d',
    daoName: 'Metaverse Builder DAO',
    daoType: 'Metaverse',
    scenario: '3D Asset Creation',
    complexity: 'simple',
    invoiceText: `Invoice #2025-295
To: SP2F4QC6JBH6ZKJCP6YE6E4ZPVX8VTXNP1GKMV0QC (Frank 3D Artist)
From: Metaverse Builder DAO
Description: Create 50 unique 3D assets for virtual world
Amount: 0.55 sBTC
Assets: Buildings, furniture, avatars, and environment objects
Delivery: All assets in GLTF format with textures
Due: 2025-12-10
Arbiter: SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE`,
    parsedData: {
      invoice_id: 2025295,
      payee: 'SP2F4QC6JBH6ZKJCP6YE6E4ZPVX8VTXNP1GKMV0QC',
      payer: 'SP3BXKJ7Q5PHMZ8GVZF4XYHN0CPQE1NXVYR6T9GFT',
      amount: 55000000, // 0.55 sBTC
      token_contract: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sbtc-token',
      arbiter: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      deadline: '2025-12-10',
      milestone_description: '50 unique 3D assets for metaverse virtual world'
    }
  }
];

/**
 * Get random DAO invoice template for demo
 */
export function getRandomDAOInvoice(): DAOInvoiceTemplate {
  const randomIndex = Math.floor(Math.random() * DAO_INVOICE_TEMPLATES.length);
  return DAO_INVOICE_TEMPLATES[randomIndex];
}

/**
 * Get DAO invoice by ID
 */
export function getDAOInvoiceById(id: string): DAOInvoiceTemplate | undefined {
  return DAO_INVOICE_TEMPLATES.find(template => template.id === id);
}

/**
 * Get DAO invoices by type
 */
export function getDAOInvoicesByType(daoType: string): DAOInvoiceTemplate[] {
  return DAO_INVOICE_TEMPLATES.filter(template => 
    template.daoType.toLowerCase() === daoType.toLowerCase()
  );
}

/**
 * Get DAO invoices by complexity
 */
export function getDAOInvoicesByComplexity(complexity: 'simple' | 'medium' | 'complex'): DAOInvoiceTemplate[] {
  return DAO_INVOICE_TEMPLATES.filter(template => template.complexity === complexity);
}

/**
 * Summary statistics for demo data
 */
export const DAO_DEMO_STATS = {
  totalInvoices: DAO_INVOICE_TEMPLATES.length,
  totalValue: DAO_INVOICE_TEMPLATES.reduce((sum, t) => sum + t.parsedData.amount, 0),
  daoTypes: [...new Set(DAO_INVOICE_TEMPLATES.map(t => t.daoType))],
  averageAmount: DAO_INVOICE_TEMPLATES.reduce((sum, t) => sum + t.parsedData.amount, 0) / DAO_INVOICE_TEMPLATES.length
};

