-- Create notifications table for tracking all outbound notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id BIGINT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL, -- 'invoice_created', 'invoice_funded', 'invoice_released', 'invoice_disputed', 'milestone_completed'
  channel VARCHAR(20) NOT NULL, -- 'discord', 'twilio', 'email'
  recipient TEXT NOT NULL, -- phone number, discord webhook, email address
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  payload JSONB,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create API integrations table for secure storage of user API configurations
CREATE TABLE IF NOT EXISTS api_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  service VARCHAR(50) NOT NULL, -- 'discord', 'twilio', 'sendgrid'
  api_key_encrypted TEXT, -- Encrypted API key (for future use)
  config JSONB, -- Service-specific configuration (webhooks, phone numbers, etc.)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service)
);

-- Create invoice events table for comprehensive audit trail
CREATE TABLE IF NOT EXISTS invoice_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id BIGINT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  tx_id TEXT,
  block_height BIGINT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_notifications_invoice ON notifications(invoice_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_events_invoice ON invoice_events(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_events_type ON invoice_events(event_type);
CREATE INDEX IF NOT EXISTS idx_invoice_events_created ON invoice_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_integrations_user ON api_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_api_integrations_service ON api_integrations(service);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for api_integrations
CREATE POLICY "Users can view their own API integrations"
  ON api_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API integrations"
  ON api_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API integrations"
  ON api_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API integrations"
  ON api_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for invoice_events (readable by all authenticated users)
CREATE POLICY "Authenticated users can view invoice events"
  ON invoice_events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert invoice events"
  ON invoice_events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for api_integrations
CREATE TRIGGER update_api_integrations_updated_at
  BEFORE UPDATE ON api_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for notification statistics
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
  user_id,
  channel,
  status,
  COUNT(*) as count,
  MAX(created_at) as last_sent
FROM notifications
GROUP BY user_id, channel, status;

-- Grant access to the view
GRANT SELECT ON notification_stats TO authenticated;

