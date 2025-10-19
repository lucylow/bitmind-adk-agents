import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface TwilioSMSRequest {
  invoiceId: string
  eventType: string
  recipientPhone: string
  invoiceAmount: string
  txId?: string
  userId?: string
}

serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Twilio credentials from environment
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured in environment')
    }

    if (!TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio phone number not configured')
    }

    const { invoiceId, eventType, recipientPhone, invoiceAmount, txId, userId } = await req.json() as TwilioSMSRequest

    // Validate phone number format
    if (!recipientPhone.startsWith('+')) {
      throw new Error('Phone number must include country code (e.g., +1234567890)')
    }

    // Format SMS message based on event type
    const message = formatSMSMessage(eventType, invoiceId, invoiceAmount, txId)

    // Create Twilio API authentication
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)

    // Send SMS via Twilio API
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: recipientPhone,
          From: TWILIO_PHONE_NUMBER,
          Body: message
        })
      }
    )

    if (!twilioResponse.ok) {
      const errorData = await twilioResponse.json()
      throw new Error(`Twilio API error: ${errorData.message || twilioResponse.statusText}`)
    }

    const twilioData = await twilioResponse.json()

    // Log successful notification in database
    const { error: dbError } = await supabase.from('notifications').insert({
      invoice_id: parseInt(invoiceId),
      user_id: userId || null,
      type: eventType,
      channel: 'twilio',
      recipient: recipientPhone,
      status: 'sent',
      payload: { 
        sid: twilioData.sid,
        amount: invoiceAmount,
        txId: txId || null
      },
      sent_at: new Date().toISOString()
    })

    if (dbError) {
      console.error('Database logging error:', dbError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        sid: twilioData.sid,
        invoiceId
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Twilio SMS error:', error)
    
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
        channel: 'twilio',
        recipient: body.recipientPhone,
        status: 'failed',
        payload: { amount: body.invoiceAmount },
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

function formatSMSMessage(
  eventType: string, 
  invoiceId: string, 
  amount: string, 
  txId?: string
): string {
  const messages: Record<string, string> = {
    'invoice_created': `BitMind Alert: Invoice #${invoiceId} created for ${amount}. Awaiting escrow funding.`,
    'invoice_funded': `BitMind Alert: Invoice #${invoiceId} funded! Escrow of ${amount} is secure. Begin work now.`,
    'invoice_released': `BitMind Alert: Payment of ${amount} released for invoice #${invoiceId}. Funds available!`,
    'invoice_disputed': `BitMind Alert: Dispute raised on invoice #${invoiceId}. Arbiter review initiated.`,
    'milestone_completed': `BitMind Alert: Milestone completed on invoice #${invoiceId}. Payment pending approval.`,
    'invoice_cancelled': `BitMind Alert: Invoice #${invoiceId} cancelled. Funds returned.`,
    'payment_received': `BitMind Alert: Payment of ${amount} received for invoice #${invoiceId}.`
  }

  let message = messages[eventType] || `BitMind: Invoice #${invoiceId} updated.`
  
  // Append transaction ID if available (truncated for SMS)
  if (txId) {
    message += ` TX: ${txId.slice(0, 8)}...`
  }

  // Add BitMind link
  message += ' | bitmind.app'

  return message
}

