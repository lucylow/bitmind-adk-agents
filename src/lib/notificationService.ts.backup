import { supabase } from '@/integrations/supabase/client'
import type { 
  NotificationChannel, 
  NotificationType, 
  NotificationRow 
} from './supabase-types'

interface InvoiceData {
  amount: string
  payee: string
  status: string
  txId?: string
  payer?: string
  dueDate?: string
}

interface NotificationConfig {
  webhookUrl?: string
  recipientPhone?: string
  recipientEmail?: string
}

export class NotificationService {
  /**
   * Send notification via Supabase Edge Function
   */
  static async sendNotification(
    channel: NotificationChannel,
    invoiceId: string,
    eventType: NotificationType,
    invoiceData: InvoiceData,
    config: NotificationConfig
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Get current user for tracking
      const { data: { user } } = await supabase.auth.getUser()

      const functionName = channel === 'discord' 
        ? 'send-discord-notification' 
        : channel === 'twilio'
        ? 'send-twilio-sms'
        : 'send-email-notification'

      const payload = {
        invoiceId,
        eventType,
        invoiceData,
        userId: user?.id,
        ...config
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      })

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error: any) {
      console.error(`${channel} notification failed:`, error)

      // Log failed notification to database
      try {
        await (supabase.from('notifications') as any).insert({
          invoice_id: parseInt(invoiceId),
          type: eventType,
          channel,
          recipient: config.webhookUrl || config.recipientPhone || config.recipientEmail || '',
          status: 'failed',
          error_message: error.message,
          payload: invoiceData
        })
      } catch (dbError) {
        console.error('Failed to log notification error:', dbError)
      }

      return { success: false, error: error.message }
    }
  }

  /**
   * Send Discord notification
   */
  static async sendDiscordNotification(
    invoiceId: string,
    eventType: NotificationType,
    invoiceData: InvoiceData,
    webhookUrl: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.sendNotification('discord', invoiceId, eventType, invoiceData, {
      webhookUrl
    })
  }

  /**
   * Send Twilio SMS
   */
  static async sendTwilioSMS(
    invoiceId: string,
    eventType: NotificationType,
    invoiceAmount: string,
    recipientPhone: string,
    txId?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.sendNotification('twilio', invoiceId, eventType, {
      amount: invoiceAmount,
      payee: '',
      status: eventType,
      txId
    }, {
      recipientPhone
    })
  }

  /**
   * Get notification history for an invoice
   */
  static async getInvoiceNotifications(invoiceId: number): Promise<NotificationRow[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }

    return (data || []) as NotificationRow[]
  }

  /**
   * Get all notifications for current user
   */
  static async getUserNotifications(): Promise<NotificationRow[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching user notifications:', error)
      throw error
    }

    return (data || []) as NotificationRow[]
  }

  /**
   * Get notification statistics for current user
   */
  static async getNotificationStats() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('notification_stats')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching notification stats:', error)
      throw error
    }

    return data || []
  }

  /**
   * Retry failed notification
   */
  static async retryFailedNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single()

      if (error || !notification) {
        throw new Error('Notification not found')
      }

      const typedNotification = notification as NotificationRow

      if (typedNotification.status !== 'failed') {
        throw new Error('Can only retry failed notifications')
      }

      // Extract config from original notification
      const config: NotificationConfig = {}
      if (typedNotification.channel === 'discord') {
        config.webhookUrl = typedNotification.recipient
      } else if (typedNotification.channel === 'twilio') {
        config.recipientPhone = typedNotification.recipient
      } else if (typedNotification.channel === 'email') {
        config.recipientEmail = typedNotification.recipient
      }

      // Retry the notification
      return await this.sendNotification(
        typedNotification.channel as NotificationChannel,
        typedNotification.invoice_id.toString(),
        typedNotification.type as NotificationType,
        typedNotification.payload as unknown as InvoiceData,
        config
      )
    } catch (error: any) {
      console.error('Error retrying notification:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get user's active API integrations
   */
  static async getActiveIntegrations() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('api_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching integrations:', error)
      throw error
    }

    return (data || []) as any[]
  }

  /**
   * Send notifications to all active channels for an invoice event
   */
  static async notifyAllChannels(
    invoiceId: string,
    eventType: NotificationType,
    invoiceData: InvoiceData
  ): Promise<{ sent: number; failed: number; results: any[] }> {
    try {
      const integrations = await this.getActiveIntegrations()

      const notificationPromises = integrations.map(async (integration: any) => {
        try {
          if (integration.service === 'discord' && integration.config?.webhookUrl) {
            return await this.sendDiscordNotification(
              invoiceId,
              eventType,
              invoiceData,
              integration.config.webhookUrl
            )
          } else if (integration.service === 'twilio' && integration.config?.phoneNumber) {
            return await this.sendTwilioSMS(
              invoiceId,
              eventType,
              invoiceData.amount,
              integration.config.phoneNumber,
              invoiceData.txId
            )
          }
          return { success: false, error: 'Invalid integration config' }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      })

      const results = await Promise.allSettled(notificationPromises)

      let sent = 0
      let failed = 0
      const processedResults = results.map((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          sent++
          return result.value
        } else {
          failed++
          return result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
        }
      })

      return { sent, failed, results: processedResults }
    } catch (error: any) {
      console.error('Error sending notifications to all channels:', error)
      return { sent: 0, failed: 0, results: [{ success: false, error: error.message }] }
    }
  }
}

