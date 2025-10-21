import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'
import type { NotificationType } from './supabase-types'

type ApiIntegration = Database['public']['Tables']['api_integrations']['Row']
type Notification = Database['public']['Tables']['notifications']['Row']

interface NotificationResult {
  sent: number
  failed: number
  notifications: Array<{ status: string; channel: string; error?: string }>
}

/**
 * Multi-channel notification service
 */
export class NotificationService {
  /**
   * Send notifications to all active channels for an invoice event
   */
  static async notifyAllChannels(
    invoiceId: string,
    eventType: NotificationType,
    eventData: {
      amount: string
      payee: string
      status: string
      txId?: string
      payer?: string
      dueDate?: string
    }
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      sent: 0,
      failed: 0,
      notifications: []
    }

    try {
      // Get active integrations for notifications
      const { data, error } = await supabase
        .from('api_integrations')
        .select('*')
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching integrations:', error)
        result.failed++
        return result
      }

      const integrations = (data || []) as ApiIntegration[]

      if (integrations.length === 0) {
        console.log('No active notification channels configured')
        return result
      }

      // Send notifications to each active channel
      for (const integration of integrations) {
        try {
          if (integration.service === 'discord' && integration.config) {
            // Send Discord notification via Supabase Edge Function
            const webhookUrl = (integration.config as any).webhookUrl
            if (webhookUrl) {
              await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-discord-notification`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                  invoiceId,
                  eventType,
                  invoiceData: eventData,
                  webhookUrl,
                  userId: integration.user_id
                })
              })
              result.sent++
              result.notifications.push({ status: 'sent', channel: 'discord' })
            }
          }
          // Add more channels (Twilio, Email) here as needed
        } catch (error) {
          console.error(`Failed to send ${integration.service} notification:`, error)
          result.failed++
          result.notifications.push({
            status: 'failed',
            channel: integration.service,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    } catch (error) {
      console.error('Error in notifyAllChannels:', error)
      result.failed++
    }

    return result
  }

  /**
   * Get all notifications for a specific invoice
   */
  static async getInvoiceNotifications(invoiceId: number): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return (data || []) as Notification[]
    } catch (error) {
      console.error('Error fetching invoice notifications:', error)
      return []
    }
  }
}

// Legacy export for compatibility
export const sendNotification = () => Promise.resolve();
