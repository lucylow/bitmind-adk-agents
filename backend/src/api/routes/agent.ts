// backend/src/api/routes/agent.ts
import express from 'express';
import { agentService } from '../../services/AgentService.js';
import { User } from '../../models/User.js';
import { ProposalAnalysis } from '../../models/ProposalAnalysis.js';
import { authenticateWallet, optionalAuth, createRateLimiter } from '../../middleware/auth.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';

const router = express.Router();
const rateLimiter = createRateLimiter();

// Apply rate limiting to all routes
router.use(rateLimiter);

/**
 * POST /api/agent/analyze-proposal
 * Analyze a DAO proposal using AI agents
 */
router.post('/analyze-proposal', authenticateWallet, async (req: AuthenticatedRequest, res) => {
  try {
    const { proposalId, daoAddress, force = false } = req.body;
    const walletAddress = req.walletAddress!;

    if (!proposalId) {
      return res.status(400).json({
        success: false,
        error: 'Proposal ID is required'
      });
    }

    console.log(`📊 Analyzing proposal ${proposalId} for ${walletAddress}`);

    // Check cache unless force refresh
    if (!force) {
      const cached = await ProposalAnalysis.findOne({
        proposalId,
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (cached) {
        return res.json({
          success: true,
          data: cached.analysis,
          cached: true,
          timestamp: cached.timestamp.toISOString()
        });
      }
    }

    const analysis = await agentService.analyzeProposal(proposalId, walletAddress);

    // Track interaction
    await User.findOneAndUpdate(
      { walletAddress },
      {
        $push: {
          interactions: {
            type: 'PROPOSAL_ANALYSIS',
            proposalId,
            timestamp: new Date()
          }
        },
        lastActive: new Date()
      },
      { upsert: true }
    );

    res.json({
      success: true,
      data: analysis,
      cached: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing proposal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze proposal',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/agent/voting-recommendation
 * Get personalized voting recommendation
 */
router.post('/voting-recommendation', authenticateWallet, async (req: AuthenticatedRequest, res) => {
  try {
    const { proposalId } = req.body;
    const walletAddress = req.walletAddress!;

    if (!proposalId) {
      return res.status(400).json({
        success: false,
        error: 'Proposal ID is required'
      });
    }

    console.log(`🎯 Getting recommendation for ${proposalId} - ${walletAddress}`);

    const recommendation = await agentService.getPersonalizedRecommendation(
      proposalId,
      walletAddress
    );

    // Track interaction
    await User.findOneAndUpdate(
      { walletAddress },
      {
        $push: {
          interactions: {
            type: 'RECOMMENDATION_REQUEST',
            proposalId,
            timestamp: new Date()
          }
        },
        lastActive: new Date()
      },
      { upsert: true }
    );

    res.json({
      success: true,
      data: recommendation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting recommendation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/agent/chat
 * Chat with AI agent
 */
router.post('/chat', authenticateWallet, async (req: AuthenticatedRequest, res) => {
  try {
    const { message, context = {} } = req.body;
    const walletAddress = req.walletAddress!;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log(`💬 Chat message from ${walletAddress}: ${message.substring(0, 50)}...`);

    const response = await agentService.chatWithAgent(
      message.trim(),
      context,
      walletAddress
    );

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in agent chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/agent/user/profile
 * Get user profile and preferences
 */
router.get('/user/profile', authenticateWallet, async (req: AuthenticatedRequest, res) => {
  try {
    const walletAddress = req.walletAddress!;

    const user = await User.findOne({ walletAddress });

    if (!user) {
      return res.json({
        success: true,
        data: {
          walletAddress,
          isNewUser: true,
          preferences: null,
          votingHistory: [],
          stats: {
            totalVotes: 0,
            totalAnalyses: 0,
            totalChats: 0
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        nickname: user.nickname,
        preferences: user.preferences,
        votingHistory: user.votingHistory.slice(-20), // Last 20 votes
        delegateAddress: user.delegateAddress,
        stats: {
          totalVotes: user.votingHistory.length,
          totalAnalyses: user.interactions.filter(i => i.type === 'PROPOSAL_ANALYSIS').length,
          totalChats: user.conversations.length
        },
        createdAt: user.createdAt,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/agent/user/preferences
 * Update user preferences
 */
router.put('/user/preferences', authenticateWallet, async (req: AuthenticatedRequest, res) => {
  try {
    const { preferences } = req.body;
    const walletAddress = req.walletAddress!;

    if (!preferences) {
      return res.status(400).json({
        success: false,
        error: 'Preferences object is required'
      });
    }

    const user = await User.findOneAndUpdate(
      { walletAddress },
      {
        preferences,
        lastActive: new Date()
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      success: true,
      data: user.preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/agent/user/history
 * Get user's interaction history
 */
router.get('/user/history', authenticateWallet, async (req: AuthenticatedRequest, res) => {
  try {
    const walletAddress = req.walletAddress!;
    const { limit = 50, type } = req.query;

    const user = await User.findOne({ walletAddress });

    if (!user) {
      return res.json({
        success: true,
        data: {
          interactions: [],
          conversations: [],
          votingHistory: []
        }
      });
    }

    let interactions = user.interactions;
    if (type) {
      interactions = interactions.filter(i => i.type === type);
    }

    res.json({
      success: true,
      data: {
        interactions: interactions.slice(-Number(limit)),
        conversations: user.conversations.slice(-Number(limit)),
        votingHistory: user.votingHistory.slice(-Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/agent/proposals/recent
 * Get recent proposal analyses
 */
router.get('/proposals/recent', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { limit = 10 } = req.query;

    const analyses = await ProposalAnalysis.find()
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .select('-__v');

    res.json({
      success: true,
      data: analyses
    });
  } catch (error) {
    console.error('Error fetching recent proposals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent proposals',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

