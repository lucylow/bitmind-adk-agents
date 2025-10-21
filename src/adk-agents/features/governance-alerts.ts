/**
 * Governance Alerts Feature
 * Real-time monitoring and intelligent alerting for DAO governance activities
 */

import { AgentBuilder, BaseTool, Agent } from '../core/agent-builder';
import { z } from 'zod';

// Alert Types and Interfaces
export interface GovernanceAlert {
  id: string;
  userId: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  proposalId?: string;
  metadata: Record<string, any>;
  timestamp: Date;
  expiresAt?: Date;
  channels: NotificationChannel[];
  status: 'pending' | 'sent' | 'failed' | 'dismissed';
}

export type AlertType = 
  | 'proposal_match'
  | 'voting_reminder'
  | 'delegation_opportunity'
  | 'critical_update'
  | 'trend_analysis'
  | 'deadline_warning'
  | 'security_alert';

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationChannel = 'email' | 'discord' | 'telegram' | 'in-app' | 'sms';

export interface MonitoringConfig {
  platforms: GovernancePlatform[];
  userInterests: string[];
  alertPreferences: AlertPreferences;
  monitoringInterval: number; // minutes
}

export type GovernancePlatform = 'snapshot' | 'tally' | 'compound' | 'aave' | 'uniswap';

export interface AlertPreferences {
  enabledTypes: AlertType[];
  minPriority: AlertPriority;
  preferredChannels: NotificationChannel[];
  quietHours?: { start: number; end: number }; // Hours in UTC
  batchingEnabled: boolean;
}

// In-memory storage (replace with database in production)
const alertsStorage = new Map<string, GovernanceAlert[]>();
const monitoringConfigs = new Map<string, MonitoringConfig>();

// Tool: Monitor governance feed
export const monitorGovernanceFeedTool: BaseTool = {
  name: 'monitor_governance_feed',
  description: 'Monitor various governance platforms for new proposals matching user interests',
  inputSchema: z.object({
    platforms: z.array(z.enum(['snapshot', 'tally', 'compound', 'aave', 'uniswap'])),
    userInterests: z.array(z.string()).describe('User interest keywords/categories'),
    userId: z.string().optional()
  }),
  execute: async ({ platforms, userInterests, userId }) => {
    // Fetch new proposals from platforms
    const newProposals = await fetchNewProposals(platforms);
    
    // Filter by user interests
    const relevantProposals = filterByInterest(newProposals, userInterests);
    
    // Prioritize proposals
    const prioritized = prioritizeProposals(relevantProposals, userInterests);
    
    // Generate alerts for relevant proposals
    if (userId && prioritized.urgent.length > 0) {
      await generateProposalAlerts(userId, prioritized.urgent, 'high');
    }
    
    return {
      totalNew: newProposals.length,
      relevant: relevantProposals.length,
      urgent: prioritized.urgent.length,
      recommendations: prioritized.recommendations,
      platforms: platforms.join(', '),
      nextCheck: calculateNextCheckTime()
    };
  }
};

// Tool: Send alert
export const sendAlertTool: BaseTool = {
  name: 'send_alert',
  description: 'Send alert to user through preferred notification channels',
  inputSchema: z.object({
    userId: z.string(),
    alertType: z.enum([
      'proposal_match',
      'voting_reminder',
      'delegation_opportunity',
      'critical_update',
      'trend_analysis',
      'deadline_warning',
      'security_alert'
    ]),
    title: z.string(),
    message: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    channels: z.array(z.enum(['email', 'discord', 'telegram', 'in-app', 'sms'])),
    metadata: z.any().optional(),
    proposalId: z.string().optional()
  }),
  execute: async ({ userId, alertType, title, message, priority, channels, metadata, proposalId }) => {
    // Check user preferences and quiet hours
    const shouldSend = checkSendConditions(userId, priority);
    
    if (!shouldSend.allowed) {
      return {
        sent: false,
        reason: shouldSend.reason,
        scheduledFor: shouldSend.scheduledFor
      };
    }
    
    // Create alert object
    const alert: GovernanceAlert = {
      id: generateAlertId(),
      userId,
      type: alertType,
      priority,
      title,
      message,
      proposalId,
      metadata: metadata || {},
      timestamp: new Date(),
      channels,
      status: 'pending'
    };
    
    // Send through channels
    const results = await sendThroughChannels(alert, channels);
    
    // Update status
    alert.status = results.allSuccess ? 'sent' : 'failed';
    
    // Store alert
    storeAlert(userId, alert);
    
    return {
      sent: results.allSuccess,
      alertId: alert.id,
      channels: results.channels,
      timestamp: alert.timestamp.toISOString(),
      failedChannels: results.failed
    };
  }
};

// Tool: Setup monitoring
export const setupMonitoringTool: BaseTool = {
  name: 'setup_monitoring',
  description: 'Configure monitoring for user\'s governance interests',
  inputSchema: z.object({
    userId: z.string(),
    config: z.object({
      platforms: z.array(z.string()),
      interests: z.array(z.string()),
      alertTypes: z.array(z.string()),
      channels: z.array(z.string()),
      monitoringInterval: z.number().optional()
    })
  }),
  execute: async ({ userId, config }) => {
    const monitoringConfig: MonitoringConfig = {
      platforms: config.platforms as GovernancePlatform[],
      userInterests: config.interests,
      alertPreferences: {
        enabledTypes: config.alertTypes as AlertType[],
        minPriority: 'medium',
        preferredChannels: config.channels as NotificationChannel[],
        batchingEnabled: true
      },
      monitoringInterval: config.monitoringInterval || 15 // 15 minutes default
    };
    
    monitoringConfigs.set(userId, monitoringConfig);
    
    return {
      configured: true,
      userId,
      platforms: config.platforms,
      interests: config.interests,
      checkFrequency: `Every ${monitoringConfig.monitoringInterval} minutes`,
      message: 'Monitoring configured successfully'
    };
  }
};

// Tool: Check voting deadlines
export const checkVotingDeadlinesTool: BaseTool = {
  name: 'check_voting_deadlines',
  description: 'Check upcoming voting deadlines and send reminders',
  inputSchema: z.object({
    userId: z.string(),
    hoursAhead: z.number().optional().describe('How many hours to look ahead')
  }),
  execute: async ({ userId, hoursAhead = 48 }) => {
    // Get user's active proposals
    const activeProposals = await getUserActiveProposals(userId);
    
    // Filter by deadline
    const upcoming = activeProposals.filter(proposal => {
      const hoursRemaining = getHoursUntilDeadline(proposal.votingDeadline);
      return hoursRemaining <= hoursAhead && hoursRemaining > 0;
    });
    
    // Group by urgency
    const urgent = upcoming.filter(p => getHoursUntilDeadline(p.votingDeadline) <= 6);
    const soon = upcoming.filter(p => {
      const hours = getHoursUntilDeadline(p.votingDeadline);
      return hours > 6 && hours <= 24;
    });
    const later = upcoming.filter(p => getHoursUntilDeadline(p.votingDeadline) > 24);
    
    // Send alerts for urgent deadlines
    for (const proposal of urgent) {
      await sendAlertTool.execute({
        userId,
        alertType: 'deadline_warning',
        title: `⏰ Urgent: Voting ends in ${getHoursUntilDeadline(proposal.votingDeadline)} hours`,
        message: `Proposal "${proposal.title}" voting deadline is approaching. Make your decision soon!`,
        priority: 'high',
        channels: ['in-app', 'discord'],
        proposalId: proposal.id
      });
    }
    
    return {
      total: upcoming.length,
      urgent: urgent.length,
      soon: soon.length,
      later: later.length,
      proposals: upcoming.map(p => ({
        id: p.id,
        title: p.title,
        deadline: p.votingDeadline,
        hoursRemaining: getHoursUntilDeadline(p.votingDeadline)
      }))
    };
  }
};

// Tool: Analyze governance trends
export const analyzeGovernanceTrendsTool: BaseTool = {
  name: 'analyze_governance_trends',
  description: 'Analyze trends in DAO governance and alert on significant shifts',
  inputSchema: z.object({
    daoAddress: z.string(),
    timeframe: z.enum(['day', 'week', 'month']).optional(),
    userId: z.string().optional()
  }),
  execute: async ({ daoAddress, timeframe = 'week', userId }) => {
    // Fetch governance data
    const trendData = await fetchGovernanceTrends(daoAddress, timeframe);
    
    // Analyze for significant changes
    const analysis = {
      participationTrend: trendData.participationChange,
      votingPatternShift: trendData.patternChange,
      newDelegates: trendData.newDelegates,
      unusualActivity: detectUnusualActivity(trendData),
      sentiment: analyzeSentiment(trendData)
    };
    
    // Generate alerts for significant trends
    if (userId && analysis.unusualActivity.detected) {
      await sendAlertTool.execute({
        userId,
        alertType: 'trend_analysis',
        title: '📊 Unusual Governance Activity Detected',
        message: analysis.unusualActivity.description,
        priority: 'medium',
        channels: ['in-app'],
        metadata: { trends: analysis }
      });
    }
    
    return {
      timeframe,
      analysis,
      alertsSent: userId ? 1 : 0,
      recommendations: generateTrendRecommendations(analysis)
    };
  }
};

// Helper Functions

async function fetchNewProposals(platforms: GovernancePlatform[]): Promise<any[]> {
  // Mock implementation - in production, integrate with actual APIs
  const mockProposals = [
    {
      id: 'prop-001',
      platform: 'snapshot',
      title: 'Treasury Diversification Strategy',
      category: 'treasury',
      status: 'active',
      votingDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      description: 'Proposal to diversify treasury holdings',
      urgency: 'medium'
    },
    {
      id: 'prop-002',
      platform: 'tally',
      title: 'Governance Parameter Update',
      category: 'governance',
      status: 'active',
      votingDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      description: 'Update quorum requirements',
      urgency: 'high'
    }
  ];
  
  return mockProposals.filter(p => platforms.includes(p.platform as GovernancePlatform));
}

function filterByInterest(proposals: any[], interests: string[]): any[] {
  if (interests.length === 0) return proposals;
  
  return proposals.filter(proposal => 
    interests.some(interest => 
      proposal.category.toLowerCase().includes(interest.toLowerCase()) ||
      proposal.title.toLowerCase().includes(interest.toLowerCase()) ||
      proposal.description.toLowerCase().includes(interest.toLowerCase())
    )
  );
}

function prioritizeProposals(proposals: any[], interests: string[]): {
  urgent: any[],
  recommendations: any[]
} {
  const urgent = proposals.filter(p => 
    p.urgency === 'high' || 
    getHoursUntilDeadline(p.votingDeadline) <= 24
  );
  
  const scored = proposals.map(p => ({
    ...p,
    score: calculateRelevanceScore(p, interests)
  })).sort((a, b) => b.score - a.score);
  
  return {
    urgent,
    recommendations: scored.slice(0, 5)
  };
}

function calculateRelevanceScore(proposal: any, interests: string[]): number {
  let score = 0;
  
  // Interest match
  const interestMatch = interests.filter(interest => 
    proposal.category.toLowerCase().includes(interest.toLowerCase()) ||
    proposal.title.toLowerCase().includes(interest.toLowerCase())
  ).length;
  
  score += interestMatch * 30;
  
  // Urgency
  if (proposal.urgency === 'high') score += 20;
  else if (proposal.urgency === 'medium') score += 10;
  
  // Deadline proximity
  const hoursRemaining = getHoursUntilDeadline(proposal.votingDeadline);
  if (hoursRemaining <= 24) score += 25;
  else if (hoursRemaining <= 72) score += 15;
  
  return score;
}

async function generateProposalAlerts(userId: string, proposals: any[], priority: AlertPriority) {
  for (const proposal of proposals) {
    await sendAlertTool.execute({
      userId,
      alertType: 'proposal_match',
      title: `🎯 New Proposal: ${proposal.title}`,
      message: `A new proposal matching your interests is now active on ${proposal.platform}`,
      priority,
      channels: ['in-app', 'discord'],
      proposalId: proposal.id,
      metadata: { proposal }
    });
  }
}

function checkSendConditions(userId: string, priority: AlertPriority): {
  allowed: boolean,
  reason?: string,
  scheduledFor?: Date
} {
  const config = monitoringConfigs.get(userId);
  
  if (!config) {
    return { allowed: true };
  }
  
  // Always allow critical alerts
  if (priority === 'critical') {
    return { allowed: true };
  }
  
  // Check quiet hours
  if (config.alertPreferences.quietHours) {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const { start, end } = config.alertPreferences.quietHours;
    
    if (currentHour >= start && currentHour < end) {
      const scheduleTime = new Date(now);
      scheduleTime.setUTCHours(end, 0, 0, 0);
      
      return {
        allowed: false,
        reason: 'Quiet hours active',
        scheduledFor: scheduleTime
      };
    }
  }
  
  // Check priority threshold
  const priorityLevels = { low: 0, medium: 1, high: 2, critical: 3 };
  const alertLevel = priorityLevels[priority];
  const minLevel = priorityLevels[config.alertPreferences.minPriority];
  
  if (alertLevel < minLevel) {
    return {
      allowed: false,
      reason: `Alert priority ${priority} below minimum ${config.alertPreferences.minPriority}`
    };
  }
  
  return { allowed: true };
}

async function sendThroughChannels(alert: GovernanceAlert, channels: NotificationChannel[]): Promise<{
  allSuccess: boolean,
  channels: Record<string, boolean>,
  failed: string[]
}> {
  const results: Record<string, boolean> = {};
  const failed: string[] = [];
  
  for (const channel of channels) {
    try {
      const success = await sendToChannel(alert, channel);
      results[channel] = success;
      if (!success) failed.push(channel);
    } catch (error) {
      results[channel] = false;
      failed.push(channel);
      console.error(`Failed to send alert through ${channel}:`, error);
    }
  }
  
  return {
    allSuccess: failed.length === 0,
    channels: results,
    failed
  };
}

async function sendToChannel(alert: GovernanceAlert, channel: NotificationChannel): Promise<boolean> {
  // Mock implementation - in production, integrate with actual services
  console.log(`[${channel.toUpperCase()}] Sending alert:`, alert.title);
  
  switch (channel) {
    case 'discord':
      // Integration with Discord webhook (already exists in codebase)
      return true;
    case 'email':
      // Email service integration
      return true;
    case 'telegram':
      // Telegram bot integration
      return true;
    case 'in-app':
      // In-app notification system
      return true;
    case 'sms':
      // SMS service integration (Twilio)
      return true;
    default:
      return false;
  }
}

function storeAlert(userId: string, alert: GovernanceAlert): void {
  if (!alertsStorage.has(userId)) {
    alertsStorage.set(userId, []);
  }
  
  const userAlerts = alertsStorage.get(userId)!;
  userAlerts.push(alert);
  
  // Keep only last 100 alerts
  if (userAlerts.length > 100) {
    userAlerts.shift();
  }
}

function generateAlertId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function calculateNextCheckTime(): Date {
  const next = new Date();
  next.setMinutes(next.getMinutes() + 15); // Default 15 minutes
  return next;
}

async function getUserActiveProposals(userId: string): Promise<any[]> {
  // Mock implementation
  return [
    {
      id: 'prop-active-1',
      title: 'Grant Proposal for Development',
      votingDeadline: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours
      userVoted: false
    },
    {
      id: 'prop-active-2',
      title: 'Treasury Allocation Update',
      votingDeadline: new Date(Date.now() + 30 * 60 * 60 * 1000), // 30 hours
      userVoted: false
    }
  ];
}

function getHoursUntilDeadline(deadline: Date): number {
  const now = new Date();
  const diff = new Date(deadline).getTime() - now.getTime();
  return Math.max(0, diff / (1000 * 60 * 60));
}

async function fetchGovernanceTrends(daoAddress: string, timeframe: string): Promise<any> {
  // Mock implementation
  return {
    participationChange: 15, // +15% increase
    patternChange: -5, // -5% shift in voting patterns
    newDelegates: 12,
    proposalVolume: 8,
    averageVotingPower: 1500000
  };
}

function detectUnusualActivity(trendData: any): {
  detected: boolean,
  description: string
} {
  if (Math.abs(trendData.participationChange) > 20) {
    return {
      detected: true,
      description: `Significant ${trendData.participationChange > 0 ? 'increase' : 'decrease'} in participation (${Math.abs(trendData.participationChange)}%)`
    };
  }
  
  if (trendData.newDelegates > 10) {
    return {
      detected: true,
      description: `${trendData.newDelegates} new delegates joined - governance landscape is changing`
    };
  }
  
  return {
    detected: false,
    description: 'Normal governance activity'
  };
}

function analyzeSentiment(trendData: any): {
  overall: string,
  score: number
} {
  // Simple sentiment analysis
  let score = 0.5;
  
  if (trendData.participationChange > 10) score += 0.2;
  if (trendData.participationChange < -10) score -= 0.2;
  
  let overall = 'neutral';
  if (score > 0.6) overall = 'positive';
  if (score < 0.4) overall = 'negative';
  
  return { overall, score };
}

function generateTrendRecommendations(analysis: any): string[] {
  const recommendations: string[] = [];
  
  if (analysis.participationTrend > 20) {
    recommendations.push('High participation detected - good time to engage with governance');
  }
  
  if (analysis.newDelegates > 10) {
    recommendations.push('Consider reviewing new delegates for potential delegation');
  }
  
  if (analysis.unusualActivity.detected) {
    recommendations.push('Monitor closely - unusual activity may indicate important changes');
  }
  
  return recommendations;
}

/**
 * Create Governance Alert System Agent
 */
export function createGovernanceAlertAgent(): Agent {
  return AgentBuilder
    .create('governance-alert-system')
    .withName('GovernanceAlertSystem')
    .withDescription('Real-time monitoring and intelligent alerting for DAO governance')
    .withModel('gemini-2.5-flash')
    .withInstruction(`
      You monitor governance activities and alert users about important events.
      
      ALERT TYPES:
      - **Proposal Matching**: New proposals matching user's interests or voting history
      - **Voting Reminders**: Deadline approaching for active votes
      - **Delegation Opportunities**: When delegation might be beneficial
      - **Critical Updates**: Emergency proposals or security issues
      - **Trend Analysis**: Shifts in DAO voting patterns or participation
      - **Security Alerts**: Suspicious activity or potential risks
      
      PRIORITIZATION:
      1. Critical security issues → Immediate notification
      2. Voting deadlines < 6 hours → High priority
      3. High-match proposals → Medium priority
      4. Trend analyses → Low priority (batched)
      
      COMMUNICATION:
      - Clear, actionable alerts
      - Include relevant context and links
      - Respect user preferences and quiet hours
      - Batch low-priority alerts when enabled
      - Provide "why this matters" for each alert
      
      CHANNELS:
      - In-app: Always available, instant
      - Discord: Real-time community platform
      - Email: Detailed digests
      - Telegram: Mobile-first notifications
      - SMS: Critical alerts only
      
      Always balance being proactive with respecting user attention.
    `)
    .withTools([
      monitorGovernanceFeedTool,
      sendAlertTool,
      setupMonitoringTool,
      checkVotingDeadlinesTool,
      analyzeGovernanceTrendsTool
    ])
    .withMemory({
      type: 'short-term',
      maxEntries: 100
    })
    .withTemperature(0.4) // Lower for consistent, reliable alerting
    .withMaxTokens(2048)
    .build();
}

/**
 * Export singleton instance
 */
export const governanceAlertSystem = createGovernanceAlertAgent();

/**
 * Helper function to setup user monitoring
 */
export async function setupUserMonitoring(
  userId: string,
  interests: string[],
  platforms: GovernancePlatform[] = ['snapshot', 'tally']
) {
  const config = {
    platforms,
    interests,
    alertTypes: ['proposal_match', 'voting_reminder', 'critical_update'],
    channels: ['in-app', 'discord']
  };
  
  return setupMonitoringTool.execute({ userId, config });
}

/**
 * Usage Examples
 */
export const GOVERNANCE_ALERTS_EXAMPLES = {
  setupMonitoring: `
    await setupUserMonitoring(
      'user123',
      ['treasury', 'governance', 'grants'],
      ['snapshot', 'tally', 'compound']
    );
  `,
  
  checkDeadlines: `
    const deadlines = await checkVotingDeadlinesTool.execute({
      userId: 'user123',
      hoursAhead: 48
    });
  `,
  
  analyzeTrends: `
    const trends = await analyzeGovernanceTrendsTool.execute({
      daoAddress: 'SP2X...ABC',
      timeframe: 'week',
      userId: 'user123'
    });
  `
};

