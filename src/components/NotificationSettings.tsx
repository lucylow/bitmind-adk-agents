import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { Bell, MessageSquare, Phone, Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useNotificationStats } from '@/hooks/useInvoiceNotifications'

interface IntegrationSettings {
  discord: { enabled: boolean; webhookUrl: string }
  twilio: { enabled: boolean; phoneNumber: string }
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<IntegrationSettings>({
    discord: { enabled: false, webhookUrl: '' },
    twilio: { enabled: false, phoneNumber: '' }
  })

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [testingDiscord, setTestingDiscord] = useState(false)
  const [testingTwilio, setTestingTwilio] = useState(false)

  const { toast } = useToast()
  const { stats } = useNotificationStats()

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: integrations, error } = await supabase
        .from('api_integrations')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      if (integrations) {
        const discordConfig = integrations.find((i: any) => i.service === 'discord')
        const twilioConfig = integrations.find((i: any) => i.service === 'twilio')

        setSettings({
          discord: {
            enabled: (discordConfig as any)?.is_active || false,
            webhookUrl: (discordConfig as any)?.config?.webhookUrl || ''
          },
          twilio: {
            enabled: (twilioConfig as any)?.is_active || false,
            phoneNumber: (twilioConfig as any)?.config?.phoneNumber || ''
          }
        })
      }
    } catch (error: any) {
      console.error('Error loading settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notification settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Save Discord settings
      if (settings.discord.webhookUrl) {
        const { error: discordError } = await (supabase
          .from('api_integrations') as any)
          .upsert({
            user_id: user.id,
            service: 'discord',
            config: { webhookUrl: settings.discord.webhookUrl },
            is_active: settings.discord.enabled,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,service'
          })

        if (discordError) throw discordError
      }

      // Save Twilio settings
      if (settings.twilio.phoneNumber) {
        const { error: twilioError } = await (supabase
          .from('api_integrations') as any)
          .upsert({
            user_id: user.id,
            service: 'twilio',
            config: { phoneNumber: settings.twilio.phoneNumber },
            is_active: settings.twilio.enabled,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,service'
          })

        if (twilioError) throw twilioError
      }

      toast({
        title: 'Success',
        description: 'Notification settings saved successfully',
      })
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  async function testDiscordWebhook() {
    if (!settings.discord.webhookUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a Discord webhook URL first',
        variant: 'destructive'
      })
      return
    }

    setTestingDiscord(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase.functions.invoke('send-discord-notification', {
        body: {
          invoiceId: '0',
          eventType: 'invoice_created',
          invoiceData: {
            amount: '0.5 sBTC',
            payee: 'SP2X...TEST',
            status: 'created'
          },
          webhookUrl: settings.discord.webhookUrl,
          userId: user?.id
        }
      })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Test notification sent to Discord!',
      })
    } catch (error: any) {
      console.error('Discord test failed:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to send test notification',
        variant: 'destructive'
      })
    } finally {
      setTestingDiscord(false)
    }
  }

  async function testTwilioSMS() {
    if (!settings.twilio.phoneNumber) {
      toast({
        title: 'Error',
        description: 'Please enter a phone number first',
        variant: 'destructive'
      })
      return
    }

    setTestingTwilio(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase.functions.invoke('send-twilio-sms', {
        body: {
          invoiceId: '0',
          eventType: 'invoice_created',
          recipientPhone: settings.twilio.phoneNumber,
          invoiceAmount: '0.5 sBTC',
          userId: user?.id
        }
      })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Test SMS sent successfully!',
      })
    } catch (error: any) {
      console.error('Twilio test failed:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to send test SMS',
        variant: 'destructive'
      })
    } finally {
      setTestingTwilio(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notification Settings
        </h2>
        <p className="text-muted-foreground mt-2">
          Configure how you want to receive notifications about invoice events
        </p>
      </div>

      {/* Notification Stats */}
      {stats && stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <div className="text-xs text-muted-foreground">
                    {stat.channel} • {stat.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discord Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
            Discord Notifications
            {settings.discord.enabled && (
              <Badge variant="default" className="ml-auto">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Receive real-time invoice updates in your Discord server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="discord-enabled" className="cursor-pointer">
              Enable Discord notifications
            </Label>
            <Switch
              id="discord-enabled"
              checked={settings.discord.enabled}
              onCheckedChange={(checked: boolean) =>
                setSettings(prev => ({
                  ...prev,
                  discord: { ...prev.discord, enabled: checked }
                }))
              }
            />
          </div>

          {settings.discord.enabled && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="discord-webhook">Webhook URL</Label>
                <Input
                  id="discord-webhook"
                  type="url"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={settings.discord.webhookUrl}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      discord: { ...prev.discord, webhookUrl: e.target.value }
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Create a webhook in your Discord server: Settings → Integrations → Webhooks → New Webhook
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={testDiscordWebhook}
                disabled={testingDiscord || !settings.discord.webhookUrl}
              >
                {testingDiscord ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Test...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Test Notification
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Twilio SMS Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-500" />
            SMS Notifications (Twilio)
            {settings.twilio.enabled && (
              <Badge variant="default" className="ml-auto">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Get SMS alerts for critical invoice events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="twilio-enabled" className="cursor-pointer">
              Enable SMS notifications
            </Label>
            <Switch
              id="twilio-enabled"
              checked={settings.twilio.enabled}
              onCheckedChange={(checked: boolean) =>
                setSettings(prev => ({
                  ...prev,
                  twilio: { ...prev.twilio, enabled: checked }
                }))
              }
            />
          </div>

          {settings.twilio.enabled && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="twilio-phone">Phone Number</Label>
                <Input
                  id="twilio-phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={settings.twilio.phoneNumber}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      twilio: { ...prev.twilio, phoneNumber: e.target.value }
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +1 for US, +44 for UK)
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={testTwilioSMS}
                disabled={testingTwilio || !settings.twilio.phoneNumber}
              >
                {testingTwilio ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Test...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    Send Test SMS
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        onClick={saveSettings} 
        disabled={saving} 
        size="lg"
        className="w-full"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Notification Settings
          </>
        )}
      </Button>

      {/* Info Box */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Bell className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Notification Events:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Invoice created</li>
                <li>Escrow funded</li>
                <li>Payment released</li>
                <li>Dispute raised</li>
                <li>Milestone completed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

