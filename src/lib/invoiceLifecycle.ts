import { NotificationService } from './notificationService'
import { supabase } from '@/integrations/supabase/client'
import type { NotificationType } from './supabase-types'

interface InvoiceEventData {
  invoiceId: string
  amount: string
  payee: string
  payer?: string
  status: string
  txId?: string
  blockHeight?: number
  dueDate?: string
  description?: string
}

/**
 * Handle invoice lifecycle events and trigger appropriate notifications
 */
export async function handleInvoiceEvent(
  eventType: NotificationType,
  eventData: InvoiceEventData
): Promise<void> {
  try {
    console.log(`Handling invoice event: ${eventType}`, eventData)

    // 1. Log event to invoice_events table
    await logInvoiceEvent(eventData.invoiceId, eventType, eventData)

    // 2. Send notifications to all active channels
    const result = await NotificationService.notifyAllChannels(
      eventData.invoiceId,
      eventType,
      {
        amount: eventData.amount,
        payee: eventData.payee,
        status: eventData.status,
        txId: eventData.txId,
        payer: eventData.payer,
        dueDate: eventData.dueDate
      }
    )

    console.log(`Notifications sent: ${result.sent} succeeded, ${result.failed} failed`)

    // 3. Update invoice metadata if needed
    await updateInvoiceMetadata(eventData.invoiceId, eventType, eventData)

  } catch (error) {
    console.error('Error handling invoice event:', error)
    throw error
  }
}

/**
 * Log invoice event to database for audit trail
 */
async function logInvoiceEvent(
  invoiceId: string,
  eventType: NotificationType,
  eventData: InvoiceEventData
): Promise<void> {
  try {
    const { error } = await (supabase.from('invoice_events') as any).insert({
      invoice_id: parseInt(invoiceId),
      event_type: eventType,
      tx_id: eventData.txId || null,
      block_height: eventData.blockHeight || null,
      payload: {
        amount: eventData.amount,
        payee: eventData.payee,
        payer: eventData.payer,
        status: eventData.status,
        description: eventData.description,
        dueDate: eventData.dueDate
      }
    })

    if (error) {
      console.error('Error logging invoice event:', error)
      throw error
    }
  } catch (error) {
    console.error('Failed to log invoice event:', error)
    // Don't throw - we don't want to fail the entire operation if logging fails
  }
}

/**
 * Update invoice metadata in local storage or cache
 */
async function updateInvoiceMetadata(
  invoiceId: string,
  eventType: NotificationType,
  eventData: InvoiceEventData
): Promise<void> {
  try {
    // Store last event in localStorage for quick access
    const metadataKey = `invoice_${invoiceId}_metadata`
    const metadata = {
      lastEvent: eventType,
      lastEventTime: new Date().toISOString(),
      status: eventData.status,
      txId: eventData.txId
    }

    localStorage.setItem(metadataKey, JSON.stringify(metadata))
  } catch (error) {
    console.error('Failed to update invoice metadata:', error)
    // Don't throw - metadata update is not critical
  }
}

/**
 * Convenience functions for specific invoice events
 */

export async function onInvoiceCreated(invoiceData: InvoiceEventData): Promise<void> {
  return handleInvoiceEvent('invoice_created', {
    ...invoiceData,
    status: 'created'
  })
}

export async function onInvoiceFunded(invoiceData: InvoiceEventData): Promise<void> {
  return handleInvoiceEvent('invoice_funded', {
    ...invoiceData,
    status: 'funded'
  })
}

export async function onInvoiceReleased(invoiceData: InvoiceEventData): Promise<void> {
  return handleInvoiceEvent('invoice_released', {
    ...invoiceData,
    status: 'released'
  })
}

export async function onInvoiceDisputed(invoiceData: InvoiceEventData): Promise<void> {
  return handleInvoiceEvent('invoice_disputed', {
    ...invoiceData,
    status: 'disputed'
  })
}

export async function onMilestoneCompleted(invoiceData: InvoiceEventData): Promise<void> {
  return handleInvoiceEvent('milestone_completed', {
    ...invoiceData,
    status: 'milestone_completed'
  })
}

export async function onInvoiceCancelled(invoiceData: InvoiceEventData): Promise<void> {
  return handleInvoiceEvent('invoice_cancelled', {
    ...invoiceData,
    status: 'cancelled'
  })
}

export async function onPaymentReceived(invoiceData: InvoiceEventData): Promise<void> {
  return handleInvoiceEvent('payment_received', {
    ...invoiceData,
    status: 'payment_received'
  })
}

/**
 * Get invoice event history
 */
export async function getInvoiceEventHistory(invoiceId: string) {
  try {
    const { data, error } = await supabase
      .from('invoice_events')
      .select('*')
      .eq('invoice_id', parseInt(invoiceId))
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return (data || []) as any[]
  } catch (error) {
    console.error('Error fetching invoice event history:', error)
    throw error
  }
}

/**
 * Get all invoice events for current user
 */
export async function getUserInvoiceEvents(limit: number = 50) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('invoice_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return (data || []) as any[]
  } catch (error) {
    console.error('Error fetching user invoice events:', error)
    throw error
  }
}

/**
 * Batch process multiple invoice events
 */
export async function handleBatchInvoiceEvents(
  events: Array<{ eventType: NotificationType; eventData: InvoiceEventData }>
): Promise<{ succeeded: number; failed: number }> {
  let succeeded = 0
  let failed = 0

  for (const event of events) {
    try {
      await handleInvoiceEvent(event.eventType, event.eventData)
      succeeded++
    } catch (error) {
      console.error(`Failed to handle event ${event.eventType}:`, error)
      failed++
    }
  }

  return { succeeded, failed }
}

/**
 * Get invoice lifecycle status summary
 */
export async function getInvoiceLifecycleStatus(invoiceId: string) {
  try {
    const events = await getInvoiceEventHistory(invoiceId)
    const notifications = await NotificationService.getInvoiceNotifications(parseInt(invoiceId))

    const summary = {
      totalEvents: events.length,
      totalNotifications: notifications.length,
      lastEvent: events[0] || null,
      notificationsSent: notifications.filter(n => n.status === 'sent').length,
      notificationsFailed: notifications.filter(n => n.status === 'failed').length,
      eventTimeline: events.map((e: any) => ({
        type: e.event_type,
        timestamp: e.created_at,
        txId: e.tx_id
      }))
    }

    return summary
  } catch (error) {
    console.error('Error getting invoice lifecycle status:', error)
    throw error
  }
}

