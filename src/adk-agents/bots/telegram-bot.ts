/**
 * Telegram Bot Integration for BitMind DAO Governance Co-pilot
 * 
 * Provides DAO governance analysis through Telegram with x402 micropayments
 */

import { Telegraf, Context, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import { proposalAnalystAgentADK } from '../agents/proposal-analyst-adk.agent';

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.warn('⚠️  TELEGRAM_BOT_TOKEN not set. Telegram bot disabled.');
  process.exit(0);
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Session storage
const userSessions = new Map<number, any>();

/**
 * Start command
 */
bot.start((ctx) => {
  ctx.reply(
    '🧠 *Welcome to BitMind DAO Governance Co-pilot!*\n\n' +
    '*AI-powered DAO governance analysis with multi-agent collaboration*\n\n' +
    '*📊 Free Commands:*\n' +
    '/analyze <proposal\\-id> \\- Basic proposal analysis\n' +
    '/vote <proposal\\-id> \\- Get voting recommendation\n' +
    '/treasury <dao\\-address> \\- Check treasury health\n\n' +
    '*💎 Premium Commands \\(0\\.10 USDC\\):*\n' +
    '/premium <proposal\\-id> \\- Deep analysis with risk modeling\n' +
    '/delegate <dao\\-space> \\- Optimal delegation strategy\n' +
    '/verify <tx\\-hash> \\- Verify payment\n\n' +
    '*💰 Payments via x402 protocol \\(USDC on Base\\)*',
    { parse_mode: 'MarkdownV2' }
  );
});

/**
 * Help command
 */
bot.help((ctx) => {
  ctx.reply(
    '*📖 BitMind Commands*\n\n' +
    '*Free Features:*\n' +
    '• /analyze \\- Basic proposal analysis\n' +
    '• /vote \\- Voting recommendations\n' +
    '• /treasury \\- Treasury health check\n' +
    '• /status \\- Bot status\n\n' +
    '*Premium Features \\(0\\.10 USDC\\):*\n' +
    '• /premium \\- Deep analysis\n' +
    '• /delegate \\- Delegation strategies\n' +
    '• /crossdao \\- Cross\\-DAO comparison\n\n' +
    'Type any command for more details\\!',
    { parse_mode: 'MarkdownV2' }
  );
});

/**
 * Analyze command (free tier)
 */
bot.command('analyze', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const proposalId = args[0];
  
  if (!proposalId) {
    ctx.reply('❌ Usage: /analyze <proposal-id>\n\nExample: /analyze prop-123');
    return;
  }
  
  const loadingMsg = await ctx.reply('🔍 Analyzing proposal...');
  
  try {
    const result = await proposalAnalystAgentADK.run(
      `Analyze proposal ${proposalId} with basic summary, vote distribution, and timeline.`,
      { proposalId }
    );
    
    const analyzeContent = (result as any).content || (result as any).message || 'Analysis complete';
    ctx.telegram.editMessageText(
      ctx.chat!.id,
      loadingMsg.message_id,
      undefined,
      `📊 *Proposal Analysis: ${proposalId}*\n\n${escapeMarkdown(analyzeContent)}\n\n💡 _Want deeper analysis? Try /premium ${proposalId}_`,
      { parse_mode: 'Markdown' }
    );
    
  } catch (error: any) {
    console.error('[Telegram] Analyze error:', error);
    ctx.telegram.editMessageText(
      ctx.chat!.id,
      loadingMsg.message_id,
      undefined,
      `❌ Error: ${error.message}`
    );
  }
});

/**
 * Premium analysis command
 */
bot.command('premium', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const proposalId = args[0];
  
  if (!proposalId) {
    ctx.reply('❌ Usage: /premium <proposal-id>\n\nExample: /premium prop-123');
    return;
  }
  
  const loadingMsg = await ctx.reply('💎 Requesting premium analysis...');
  
  try {
    const result = await proposalAnalystAgentADK.run(
      `Provide premium analysis for proposal ${proposalId} including deep financial impact, risk modeling, and cross-DAO comparison. Use require_payment tool.`,
      {
        proposalId,
        userAddress: ctx.from!.id.toString(),
        isPremium: true
      }
    );
    
    // Check if payment required
    const resultData = result as any;
    if (resultData.requiresPayment || resultData.status === 402) {
      const payment = resultData.payment || resultData;
      
      // Store session
      userSessions.set(ctx.from!.id, {
        proposalId,
        feature: 'premium_analysis',
        paymentRequest: payment
      });
      
      ctx.telegram.editMessageText(
        ctx.chat!.id,
        loadingMsg.message_id,
        undefined,
        `💳 *Payment Required \\(x402 Protocol\\)*\n\n` +
        `*Amount:* ${escapeMarkdown(payment.maxAmountRequired || payment.amount)} USDC\n` +
        `*Network:* ${escapeMarkdown(payment.network || 'Base Sepolia')}\n` +
        `*Pay To:* \`${escapeMarkdown(payment.payTo || payment.address)}\`\n` +
        `*Valid Until:* ${escapeMarkdown(new Date(payment.validUntil || Date.now() + 3600000).toLocaleString())}\n\n` +
        `After payment, use:\n` +
        `/verify <tx\\-hash>`,
        { parse_mode: 'MarkdownV2' }
      );
      
      return;
    }
    
    // Payment already verified - show results
    const content = resultData.content || resultData.message || 'Analysis complete';
    ctx.telegram.editMessageText(
      ctx.chat!.id,
      loadingMsg.message_id,
      undefined,
      `💎 *Premium Analysis: ${proposalId}*\n\n${escapeMarkdown(content)}`,
      { parse_mode: 'Markdown' }
    );
    
  } catch (error: any) {
    console.error('[Telegram] Premium error:', error);
    ctx.telegram.editMessageText(
      ctx.chat!.id,
      loadingMsg.message_id,
      undefined,
      `❌ Error: ${error.message}`
    );
  }
});

/**
 * Vote recommendation command
 */
bot.command('vote', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const proposalId = args[0];
  
  if (!proposalId) {
    ctx.reply('❌ Usage: /vote <proposal-id>\n\nExample: /vote prop-123');
    return;
  }
  
  const loadingMsg = await ctx.reply('🎯 Generating voting recommendation...');
  
  try {
    const result = await proposalAnalystAgentADK.run(
      `Provide voting recommendation for proposal ${proposalId} based on financial impact and risk.`,
      { proposalId }
    );
    
    const voteContent = (result as any).content || (result as any).message || 'Recommendation complete';
    ctx.telegram.editMessageText(
      ctx.chat!.id,
      loadingMsg.message_id,
      undefined,
      `🗳️ *Vote Recommendation: ${proposalId}*\n\n${escapeMarkdown(voteContent)}`,
      { parse_mode: 'Markdown' }
    );
    
  } catch (error: any) {
    console.error('[Telegram] Vote error:', error);
    ctx.telegram.editMessageText(
      ctx.chat!.id,
      loadingMsg.message_id,
      undefined,
      `❌ Error: ${error.message}`
    );
  }
});

/**
 * Treasury command
 */
bot.command('treasury', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const daoAddress = args[0];
  
  if (!daoAddress) {
    ctx.reply('❌ Usage: /treasury <dao-address>\n\nExample: /treasury 0x1234...');
    return;
  }
  
  const loadingMsg = await ctx.reply('💰 Analyzing treasury...');
  
  try {
    const result = await proposalAnalystAgentADK.run(
      `Analyze treasury health for DAO at ${daoAddress}`,
      { daoAddress }
    );
    
    const treasuryContent = (result as any).content || (result as any).message || 'Analysis complete';
    ctx.telegram.editMessageText(
      ctx.chat!.id,
      loadingMsg.message_id,
      undefined,
      `💰 *Treasury Analysis*\n\n${escapeMarkdown(treasuryContent)}`,
      { parse_mode: 'Markdown' }
    );
    
  } catch (error: any) {
    console.error('[Telegram] Treasury error:', error);
    ctx.telegram.editMessageText(
      ctx.chat!.id,
      loadingMsg.message_id,
      undefined,
      `❌ Error: ${error.message}`
    );
  }
});

/**
 * Verify payment command
 */
bot.command('verify', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const txHash = args[0];
  
  if (!txHash) {
    ctx.reply('❌ Usage: /verify <tx-hash>\n\nExample: /verify 0xabc123...');
    return;
  }
  
  const session = userSessions.get(ctx.from!.id);
  
  if (!session) {
    ctx.reply('❌ No pending payment found. Request a premium feature first.');
    return;
  }
  
  const loadingMsg = await ctx.reply('🔐 Verifying payment...');
  
  try {
    // Simulate verification (replace with real on-chain verification)
    const verified = txHash.length === 66 && txHash.startsWith('0x');
    
    if (verified) {
      ctx.telegram.editMessageText(
        ctx.chat!.id,
        loadingMsg.message_id,
        undefined,
        `✅ *Payment Verified!*\n\n` +
        `Transaction: \`${txHash.slice(0, 10)}...${txHash.slice(-8)}\`\n` +
        `Access: Premium Analysis (24 hours)\n\n` +
        `Generating your premium analysis...`,
        { parse_mode: 'Markdown' }
      );
      
      // Provide premium analysis
      const result = await proposalAnalystAgentADK.run(
        `Provide premium analysis for proposal ${session.proposalId}`,
        { proposalId: session.proposalId, isPremium: true, verified: true }
      );
      
      const premiumContent = (result as any).content || (result as any).message || 'Analysis complete';
      ctx.reply(
        `💎 *Premium Analysis: ${session.proposalId}*\n\n${escapeMarkdown(premiumContent)}`,
        { parse_mode: 'Markdown' }
      );
      
      userSessions.delete(ctx.from!.id);
    } else {
      ctx.telegram.editMessageText(
        ctx.chat!.id,
        loadingMsg.message_id,
        undefined,
        '❌ Payment verification failed. Please check transaction hash.'
      );
    }
    
  } catch (error: any) {
    console.error('[Telegram] Verify error:', error);
    ctx.telegram.editMessageText(
      ctx.chat!.id,
      loadingMsg.message_id,
      undefined,
      `❌ Error: ${error.message}`
    );
  }
});

/**
 * Status command
 */
bot.command('status', (ctx) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  
  ctx.reply(
    `🤖 *Bot Status*\n\n` +
    `Status: ✅ Online\n` +
    `Uptime: ${hours}h ${minutes}m\n` +
    `Agents: Proposal Analyst, Voting Strategist, Treasury Monitor\n` +
    `Features: x402 Payments, ATP Tokenization, Multi-Agent Collaboration`,
    { parse_mode: 'Markdown' }
  );
});

/**
 * Helper: Escape markdown special characters
 */
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

// Launch bot
bot.launch().then(() => {
  console.log('✅ Telegram bot started');
}).catch((error) => {
  console.error('❌ Failed to start Telegram bot:', error);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;

