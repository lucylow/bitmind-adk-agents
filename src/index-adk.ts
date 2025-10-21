// src/index-adk.ts
/**
 * BitMind DAO Governance Co-pilot
 * Main entry point for ADK-TS agent system
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DAOGovernanceWorkflow } from './workflows/dao-governance.workflow';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize workflow
const daoWorkflow = new DAOGovernanceWorkflow();

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'BitMind DAO Governance Co-pilot',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Analyze a single proposal
 * POST /api/analyze
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { proposalId, daoAddress, userAddress } = req.body;
    
    // Validation
    if (!proposalId || !daoAddress || !userAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields: proposalId, daoAddress, userAddress' 
      });
    }
    
    console.log(`[API] Analyzing proposal ${proposalId} for user ${userAddress}`);
    
    // Run workflow
    const result = await daoWorkflow.processProposal(
      proposalId, 
      daoAddress, 
      userAddress
    );
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error: unknown) {
    console.error('[API] Analysis error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * Monitor treasury health
 * GET /api/treasury/:daoAddress
 */
app.get('/api/treasury/:daoAddress', async (req, res) => {
  try {
    const { daoAddress } = req.params;
    
    console.log(`[API] Monitoring treasury for DAO ${daoAddress}`);
    
    const result = await daoWorkflow.monitorTreasuryHealth(daoAddress);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error: unknown) {
    console.error('[API] Treasury monitoring error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * Analyze multiple proposals
 * POST /api/analyze-batch
 */
app.post('/api/analyze-batch', async (req, res) => {
  try {
    const { proposalIds, daoAddress, userAddress } = req.body;
    
    if (!proposalIds || !Array.isArray(proposalIds) || !daoAddress || !userAddress) {
      return res.status(400).json({ 
        error: 'Invalid request format' 
      });
    }
    
    console.log(`[API] Batch analyzing ${proposalIds.length} proposals`);
    
    const results = await daoWorkflow.analyzeMultipleProposals(
      proposalIds,
      daoAddress,
      userAddress
    );
    
    res.json({
      success: true,
      count: results.length,
      data: results
    });
    
  } catch (error: unknown) {
    console.error('[API] Batch analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * Get agent status and capabilities
 * GET /api/agents
 */
app.get('/api/agents', (req, res) => {
  res.json({
    success: true,
    agents: [
      {
        name: 'ProposalAnalyst',
        description: 'Analyzes proposals for financial impact and security risks',
        capabilities: [
          'Financial impact assessment',
          'Security risk evaluation',
          'Stakeholder analysis',
          'Executive summaries'
        ]
      },
      {
        name: 'TreasuryMonitor',
        description: 'Monitors DAO treasury health and sustainability',
        capabilities: [
          'Treasury composition tracking',
          'Health score calculation',
          'Runway analysis',
          'Diversification assessment'
        ]
      },
      {
        name: 'VotingStrategist',
        description: 'Generates personalized voting recommendations',
        capabilities: [
          'Voting history analysis',
          'Personalized recommendations',
          'Risk assessment',
          'Confidence scoring'
        ]
      }
    ]
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API] Unhandled error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error' 
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('');
  console.log('============================================');
  console.log('🧠 BitMind DAO Governance Co-pilot');
  console.log('============================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: http://localhost:${PORT}/api/analyze`);
  console.log('');
  console.log('Ready to process DAO governance analysis! 🚀');
  console.log('============================================');
  console.log('');
});

export default app;

