import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { NotificationRow } from '@/lib/supabase-types'

/**
 * Hook to fetch and subscribe to real-time notifications for a specific invoice
 */
export function useInvoiceNotifications(invoiceId: number | null) {
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!invoiceId || invoiceId === null) {
      setLoading(false)
      return
    }

    let channel: RealtimeChannel

    async function fetchNotifications() {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('notifications')
          .select('*')
          .eq('invoice_id', invoiceId as number)
          .order('created_at', { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setNotifications((data || []) as NotificationRow[])
      } catch (err: any) {
        console.error('Error fetching notifications:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchNotifications()

    // Subscribe to real-time updates
    channel = supabase
      .channel(`notifications:invoice_id=eq.${invoiceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `invoice_id=eq.${invoiceId}`
        },
        (payload) => {
          console.log('New notification received:', payload.new)
          setNotifications((prev) => [payload.new as NotificationRow, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `invoice_id=eq.${invoiceId}`
        },
        (payload) => {
          console.log('Notification updated:', payload.new)
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === payload.new.id ? (payload.new as NotificationRow) : notif
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [invoiceId])

  return { notifications, loading, error }
}

/**
 * Hook to fetch and subscribe to all user notifications
 */
export function useUserNotifications() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let channel: RealtimeChannel

    async function fetchNotifications() {
      try {
        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setNotifications([])
          setLoading(false)
          return
        }

        const { data, error: fetchError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (fetchError) {
          throw fetchError
        }

        setNotifications((data || []) as NotificationRow[])
      } catch (err: any) {
        console.error('Error fetching user notifications:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchNotifications()

    // Subscribe to real-time updates for current user
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      channel = supabase
        .channel(`notifications:user_id=eq.${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New user notification received:', payload.new)
            setNotifications((prev) => [payload.new as NotificationRow, ...prev.slice(0, 49)])
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('User notification updated:', payload.new)
            setNotifications((prev) =>
              prev.map((notif) =>
                notif.id === payload.new.id ? (payload.new as NotificationRow) : notif
              )
            )
          }
        )
        .subscribe()
    }

    setupRealtimeSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return { notifications, loading, error }
}

/**
 * Hook to get notification statistics
 */
export function useNotificationStats() {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setStats([])
          setLoading(false)
          return
        }

        const { data, error: fetchError } = await supabase
          .from('notification_stats')
          .select('*')
          .eq('user_id', user.id)

        if (fetchError) {
          throw fetchError
        }

        setStats(data || [])
      } catch (err: any) {
        console.error('Error fetching notification stats:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)

    return () => clearInterval(interval)
  }, [])

  return { stats, loading, error }
}

