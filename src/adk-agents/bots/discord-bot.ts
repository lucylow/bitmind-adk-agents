/**
 * Discord Bot Integration for BitMind DAO Governance Co-pilot
 * 
 * Provides DAO governance analysis through Discord with x402 micropayments
 */

import { Client, GatewayIntentBits, EmbedBuilder, Message, ColorResolvable } from 'discord.js';
import { proposalAnalystAgentADK } from '../agents/proposal-analyst-adk.agent';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// Session storage for user interactions
const userSessions = new Map<string, any>();

client.on('ready', () => {
  console.log(`✅ Discord bot logged in as ${client.user?.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  
  // Set bot status
  client.user?.setPresence({
    activities: [{ name: 'DAO proposals | /help' }],
    status: 'online',
  });
});

client.on('messageCreate', async (message: Message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Help command
  if (message.content === '/help' || message.content === '!help') {
    await sendHelpMessage(message);
    return;
  }
  
  // Analyze command: /analyze <proposal-id> [--premium]
  if (message.content.startsWith('/analyze') || message.content.startsWith('!analyze')) {
    await handleAnalyzeCommand(message);
    return;
  }
  
  // Vote recommendation: /vote <proposal-id>
  if (message.content.startsWith('/vote') || message.content.startsWith('!vote')) {
    await handleVoteCommand(message);
    return;
  }
  
  // Treasury command: /treasury <dao-address>
  if (message.content.startsWith('/treasury') || message.content.startsWith('!treasury')) {
    await handleTreasuryCommand(message);
    return;
  }
  
  // Payment verification: /verify <tx-hash>
  if (message.content.startsWith('/verify') || message.content.startsWith('!verify')) {
    await handleVerifyPayment(message);
    return;
  }
  
  // Delegation strategy: /delegate <dao-space>
  if (message.content.startsWith('/delegate') || message.content.startsWith('!delegate')) {
    await handleDelegateCommand(message);
    return;
  }
  
  // Agent status: /status
  if (message.content === '/status' || message.content === '!status') {
    await sendStatusMessage(message);
    return;
  }
});

/**
 * Send help message
 */
async function sendHelpMessage(message: Message) {
  const embed = new EmbedBuilder()
    .setColor('#6366f1' as ColorResolvable)
    .setTitle('🧠 BitMind DAO Governance Co-pilot')
    .setDescription('AI-powered DAO governance analysis with multi-agent collaboration')
    .addFields(
      {
        name: '📊 Free Commands',
        value: '`/analyze <proposal-id>` - Basic proposal analysis\n' +
               '`/vote <proposal-id>` - Get voting recommendation\n' +
               '`/treasury <dao-address>` - Check treasury health\n' +
               '`/status` - Check bot status',
        inline: false
      },
      {
        name: '💎 Premium Commands (0.10 USDC)',
        value: '`/analyze <proposal-id> --premium` - Deep analysis with risk modeling\n' +
               '`/delegate <dao-space>` - Optimal delegation strategy\n' +
               '`/verify <tx-hash>` - Verify payment and unlock premium',
        inline: false
      },
      {
        name: '💰 Payment',
        value: 'Premium features use **x402 micropayments** (USDC on Base)\n' +
               'The bot will provide payment details when you request premium features.',
        inline: false
      }
    )
    .setFooter({ text: 'Powered by ADK-TS & ATP | Built for Hackathon 2025' })
    .setTimestamp();
  
  await message.reply({ embeds: [embed] });
}

/**
 * Handle analyze command
 */
async function handleAnalyzeCommand(message: Message) {
  const args = message.content.split(' ').slice(1);
  const proposalId = args[0];
  const isPremium = args.includes('--premium') || args.includes('-p');
  
  if (!proposalId) {
    await message.reply('❌ Usage: `/analyze <proposal-id> [--premium]`');
    return;
  }
  
  const loadingMsg = await message.reply('🔍 Analyzing DAO proposal...');
  
  try {
    const query = isPremium
      ? `Provide premium analysis for proposal ${proposalId} including deep financial impact, risk modeling, and cross-DAO comparison. Use require_payment tool to request payment.`
      : `Analyze proposal ${proposalId} with basic summary, vote distribution, and timeline.`;
    
    const result = await proposalAnalystAgentADK.run(query, {
      proposalId,
      userAddress: message.author.id,
      isPremium
    });
    
    // Check if payment required (x402 response)
    if (result.requiresPayment || result.status === 402) {
      const payment = result.payment || result;
      
      const paymentEmbed = new EmbedBuilder()
        .setColor('#FF6600' as ColorResolvable)
        .setTitle('💳 Payment Required - x402 Protocol')
        .setDescription('Premium analysis requires instant micropayment')
        .addFields(
          { name: '💰 Amount', value: `${payment.maxAmountRequired || payment.amount} USDC`, inline: true },
          { name: '🌐 Network', value: payment.network || 'Base Sepolia', inline: true },
          { name: '📍 Pay To', value: `\`${(payment.payTo || payment.address).slice(0, 10)}...${(payment.payTo || payment.address).slice(-8)}\``, inline: false },
          { name: '⏰ Valid Until', value: new Date(payment.validUntil || Date.now() + 3600000).toLocaleString(), inline: false }
        )
        .setFooter({ text: 'After payment, use /verify <tx-hash> to unlock premium features' });
      
      await loadingMsg.edit({ content: '', embeds: [paymentEmbed] });
      
      // Store session for later verification
      userSessions.set(message.author.id, {
        proposalId,
        feature: 'premium_analysis',
        paymentRequest: payment
      });
      
      return;
    }
    
    // Success - send analysis
    const analysisEmbed = new EmbedBuilder()
      .setColor('#00FF00' as ColorResolvable)
      .setTitle(`📊 ${isPremium ? 'Premium ' : ''}Analysis: Proposal #${proposalId}`)
      .setDescription(truncateText(result.content || JSON.stringify(result), 4000))
      .setTimestamp();
    
    if (isPremium) {
      analysisEmbed.setFooter({ text: '💎 Premium Analysis | Powered by x402' });
    }
    
    await loadingMsg.edit({ content: '', embeds: [analysisEmbed] });
    
  } catch (error: any) {
    console.error('[Discord] Analysis error:', error);
    await loadingMsg.edit(`❌ Error: ${error.message}`);
  }
}

/**
 * Handle vote recommendation command
 */
async function handleVoteCommand(message: Message) {
  const args = message.content.split(' ').slice(1);
  const proposalId = args[0];
  
  if (!proposalId) {
    await message.reply('❌ Usage: `/vote <proposal-id>`');
    return;
  }
  
  const loadingMsg = await message.reply('🎯 Generating voting recommendation...');
  
  try {
    const result = await proposalAnalystAgentADK.run(
      `Provide voting recommendation for proposal ${proposalId} based on financial impact, community sentiment, and risk assessment.`,
      { proposalId }
    );
    
    const voteEmbed = new EmbedBuilder()
      .setColor('#8b5cf6' as ColorResolvable)
      .setTitle(`🗳️ Vote Recommendation: #${proposalId}`)
      .setDescription(truncateText(result.content || 'Analysis complete', 4000))
      .setTimestamp();
    
    await loadingMsg.edit({ content: '', embeds: [voteEmbed] });
    
  } catch (error: any) {
    console.error('[Discord] Vote command error:', error);
    await loadingMsg.edit(`❌ Error: ${error.message}`);
  }
}

/**
 * Handle treasury command
 */
async function handleTreasuryCommand(message: Message) {
  const args = message.content.split(' ').slice(1);
  const daoAddress = args[0];
  
  if (!daoAddress) {
    await message.reply('❌ Usage: `/treasury <dao-address>`');
    return;
  }
  
  const loadingMsg = await message.reply('💰 Analyzing treasury health...');
  
  try {
    const result = await proposalAnalystAgentADK.run(
      `Analyze treasury health and composition for DAO at address ${daoAddress}`,
      { daoAddress }
    );
    
    const treasuryEmbed = new EmbedBuilder()
      .setColor('#10b981' as ColorResolvable)
      .setTitle(`💰 Treasury Analysis`)
      .setDescription(truncateText(result.content || 'Analysis complete', 4000))
      .setTimestamp();
    
    await loadingMsg.edit({ content: '', embeds: [treasuryEmbed] });
    
  } catch (error: any) {
    console.error('[Discord] Treasury command error:', error);
    await loadingMsg.edit(`❌ Error: ${error.message}`);
  }
}

/**
 * Handle payment verification
 */
async function handleVerifyPayment(message: Message) {
  const args = message.content.split(' ').slice(1);
  const txHash = args[0];
  
  if (!txHash) {
    await message.reply('❌ Usage: `/verify <tx-hash>`');
    return;
  }
  
  const session = userSessions.get(message.author.id);
  
  if (!session) {
    await message.reply('❌ No pending payment found. Request a premium feature first.');
    return;
  }
  
  const loadingMsg = await message.reply('🔐 Verifying payment...');
  
  try {
    // In production, verify the transaction on-chain
    // For demo, simulate verification
    const verified = await simulatePaymentVerification(txHash);
    
    if (verified) {
      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00' as ColorResolvable)
        .setTitle('✅ Payment Verified!')
        .setDescription('Your premium features are now unlocked.')
        .addFields(
          { name: 'Transaction', value: `\`${txHash.slice(0, 10)}...${txHash.slice(-8)}\``, inline: false },
          { name: 'Access', value: 'Premium Analysis (24 hours)', inline: false }
        )
        .setTimestamp();
      
      await loadingMsg.edit({ content: '', embeds: [successEmbed] });
      
      // Now provide the premium analysis
      await handleAnalyzeCommand(message);
      
      userSessions.delete(message.author.id);
    } else {
      await loadingMsg.edit('❌ Payment verification failed. Please check transaction hash and try again.');
    }
    
  } catch (error: any) {
    console.error('[Discord] Payment verification error:', error);
    await loadingMsg.edit(`❌ Error: ${error.message}`);
  }
}

/**
 * Handle delegation command
 */
async function handleDelegateCommand(message: Message) {
  const args = message.content.split(' ').slice(1);
  const daoSpace = args[0];
  
  if (!daoSpace) {
    await message.reply('❌ Usage: `/delegate <dao-space>`');
    return;
  }
  
  await message.reply('💎 This is a premium feature (0.15 USDC). Use `/analyze <proposal-id> --premium` to access premium features with payment.');
}

/**
 * Send status message
 */
async function sendStatusMessage(message: Message) {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  
  const statusEmbed = new EmbedBuilder()
    .setColor('#6366f1' as ColorResolvable)
    .setTitle('🤖 Bot Status')
    .addFields(
      { name: 'Status', value: '✅ Online', inline: true },
      { name: 'Uptime', value: `${hours}h ${minutes}m`, inline: true },
      { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
      { name: 'Agents', value: 'Proposal Analyst, Voting Strategist, Treasury Monitor', inline: false },
      { name: 'Features', value: 'x402 Payments, ATP Tokenization, Multi-Agent Collaboration', inline: false }
    )
    .setTimestamp();
  
  await message.reply({ embeds: [statusEmbed] });
}

/**
 * Helper: Truncate text to fit Discord limits
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Helper: Simulate payment verification (replace with real verification)
 */
async function simulatePaymentVerification(txHash: string): Promise<boolean> {
  // In production, verify on-chain
  return txHash.length === 66 && txHash.startsWith('0x');
}

// Start the bot
if (process.env.DISCORD_BOT_TOKEN) {
  client.login(process.env.DISCORD_BOT_TOKEN).catch((error) => {
    console.error('❌ Failed to login to Discord:', error);
  });
} else {
  console.warn('⚠️  DISCORD_BOT_TOKEN not set. Discord bot disabled.');
}

export default client;

