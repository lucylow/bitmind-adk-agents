// Type-safe database types for Supabase integration
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      notifications: {
        Row: {
          id: string
          invoice_id: number
          user_id: string | null
          type: string
          channel: string
          recipient: string
          status: string
          payload: Json | null
          sent_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: number
          user_id?: string | null
          type: string
          channel: string
          recipient: string
          status?: string
          payload?: Json | null
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: number
          user_id?: string | null
          type?: string
          channel?: string
          recipient?: string
          status?: string
          payload?: Json | null
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      api_integrations: {
        Row: {
          id: string
          user_id: string | null
          service: string
          api_key_encrypted: string | null
          config: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          service: string
          api_key_encrypted?: string | null
          config?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          service?: string
          api_key_encrypted?: string | null
          config?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      invoice_events: {
        Row: {
          id: string
          invoice_id: number
          event_type: string
          tx_id: string | null
          block_height: number | null
          payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: number
          event_type: string
          tx_id?: string | null
          block_height?: number | null
          payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: number
          event_type?: string
          tx_id?: string | null
          block_height?: number | null
          payload?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      notification_stats: {
        Row: {
          user_id: string | null
          channel: string | null
          status: string | null
          count: number | null
          last_sent: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type NotificationRow = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type ApiIntegrationRow = Database['public']['Tables']['api_integrations']['Row']
export type ApiIntegrationInsert = Database['public']['Tables']['api_integrations']['Insert']
export type InvoiceEventRow = Database['public']['Tables']['invoice_events']['Row']
export type InvoiceEventInsert = Database['public']['Tables']['invoice_events']['Insert']

export type NotificationChannel = 'discord' | 'twilio' | 'email'
export type NotificationStatus = 'pending' | 'sent' | 'failed'
export type NotificationType = 
  | 'invoice_created' 
  | 'invoice_funded' 
  | 'invoice_released' 
  | 'invoice_disputed' 
  | 'milestone_completed'
  | 'invoice_cancelled'
  | 'payment_received'

