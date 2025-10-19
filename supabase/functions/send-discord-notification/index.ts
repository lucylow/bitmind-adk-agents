import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface DiscordNotificationRequest {
  invoiceId: string
  eventType: string
  invoiceData: {
    amount: string
    payee: string
    status: string
    txId?: string
    payer?: string
    dueDate?: string
  }
  webhookUrl: string
  userId?: string
}

serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { invoiceId, eventType, invoiceData, webhookUrl, userId } = await req.json() as DiscordNotificationRequest

    // Create Discord embed with rich formatting
    const embed = {
      title: `${getEventEmoji(eventType)} ${getEventTitle(eventType)}`,
      description: getEventDescription(eventType, invoiceData),
      color: getEventColor(eventType),
      fields: [
        {
          name: '📊 Invoice ID',
          value: `#${invoiceId}`,
          inline: true
        },
        {
          name: '💰 Amount',
          value: invoiceData.amount,
          inline: true
        },
        {
          name: '📍 Status',
          value: `\`${invoiceData.status.toUpperCase()}\``,
          inline: true
        },
        {
          name: '👤 Payee',
          value: `\`${invoiceData.payee.slice(0, 10)}...${invoiceData.payee.slice(-8)}\``,
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'BitMind Invoice System • Powered by Stacks',
        icon_url: 'https://avatars.githubusercontent.com/u/40718727'
      }
    }

    // Add payer field if available
    if (invoiceData.payer) {
      embed.fields.push({
        name: '💼 Payer',
        value: `\`${invoiceData.payer.slice(0, 10)}...${invoiceData.payer.slice(-8)}\``,
        inline: false
      })
    }

    // Add due date if available
    if (invoiceData.dueDate) {
      embed.fields.push({
        name: '📅 Due Date',
        value: new Date(invoiceData.dueDate).toLocaleDateString(),
        inline: true
      })
    }

    // Add transaction link if available
    if (invoiceData.txId) {
      const explorerUrl = `https://explorer.stacks.co/txid/${invoiceData.txId}?chain=testnet`
      embed.fields.push({
        name: '🔗 Transaction',
        value: `[View on Explorer](${explorerUrl})`,
        inline: false
      })
    }

    // Send to Discord webhook
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'BitMind Notifier',
        avatar_url: 'https://avatars.githubusercontent.com/u/40718727',
        embeds: [embed]
      })
    })

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text()
      throw new Error(`Discord API error: ${discordResponse.status} - ${errorText}`)
    }

    // Log successful notification in database
    const { error: dbError } = await supabase.from('notifications').insert({
      invoice_id: parseInt(invoiceId),
      user_id: userId || null,
      type: eventType,
      channel: 'discord',
      recipient: webhookUrl,
      status: 'sent',
      payload: invoiceData,
      sent_at: new Date().toISOString()
    })

    if (dbError) {
      console.error('Database logging error:', dbError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Discord notification sent successfully',
        invoiceId 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Discord notification error:', error)
    
    // Attempt to log failed notification
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      const body = await req.json()
      await supabase.from('notifications').insert({
        invoice_id: parseInt(body.invoiceId),
        user_id: body.userId || null,
        type: body.eventType,
        channel: 'discord',
        recipient: body.webhookUrl,
        status: 'failed',
        payload: body.invoiceData,
        error_message: error.message
      })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getEventEmoji(eventType: string): string {
  const emojis: Record<string, string> = {
    'invoice_created': '📝',
    'invoice_funded': '💰',
    'invoice_released': '✅',
    'invoice_disputed': '⚠️',
    'milestone_completed': '🎯',
    'invoice_cancelled': '❌',
    'payment_received': '💸'
  }
  return emojis[eventType] || '📋'
}

function getEventTitle(eventType: string): string {
  const titles: Record<string, string> = {
    'invoice_created': 'Invoice Created',
    'invoice_funded': 'Escrow Funded',
    'invoice_released': 'Payment Released',
    'invoice_disputed': 'Dispute Raised',
    'milestone_completed': 'Milestone Complete',
    'invoice_cancelled': 'Invoice Cancelled',
    'payment_received': 'Payment Received'
  }
  return titles[eventType] || 'Invoice Update'
}

function getEventDescription(eventType: string, data: any): string {
  const descriptions: Record<string, string> = {
    'invoice_created': `A new invoice has been created and is awaiting escrow funding.`,
    'invoice_funded': `Escrow has been funded successfully. Work can now begin.`,
    'invoice_released': `Payment has been released to the contractor. Transaction complete! 🎉`,
    'invoice_disputed': `A dispute has been raised on this invoice. Arbiter review required.`,
    'milestone_completed': `A project milestone has been marked as complete.`,
    'invoice_cancelled': `This invoice has been cancelled and funds returned.`,
    'payment_received': `Payment has been successfully received and confirmed.`
  }
  return descriptions[eventType] || 'Invoice status has been updated.'
}

function getEventColor(eventType: string): number {
  const colors: Record<string, number> = {
    'invoice_created': 0x3b82f6, // blue
    'invoice_funded': 0x10b981, // green
    'invoice_released': 0x22c55e, // success green
    'invoice_disputed': 0xef4444, // red
    'milestone_completed': 0xa855f7, // purple
    'invoice_cancelled': 0x6b7280, // gray
    'payment_received': 0x34d399  // emerald
  }
  return colors[eventType] || 0x6b7280 // gray
}

