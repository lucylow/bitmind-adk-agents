#!/bin/bash

# BitMind - Supabase Edge Functions Deployment Script
# This script deploys all Edge Functions for external API integrations

set -e

echo "🚀 BitMind Edge Functions Deployment"
echo "====================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "🔐 Please login to Supabase:"
    supabase login
fi

echo "✅ Authenticated with Supabase"
echo ""

# Prompt for project reference if not already linked
if [ ! -f .supabase/config.toml ]; then
    echo "🔗 Project not linked. Please enter your project reference:"
    read -p "Project Ref (found in Supabase dashboard URL): " PROJECT_REF
    supabase link --project-ref "$PROJECT_REF"
fi

echo "✅ Project linked"
echo ""

# Deploy Discord notification function
echo "📬 Deploying Discord notification function..."
if supabase functions deploy send-discord-notification; then
    echo "   ✅ Discord function deployed successfully"
else
    echo "   ❌ Failed to deploy Discord function"
    exit 1
fi

echo ""

# Deploy Twilio SMS function
echo "📱 Deploying Twilio SMS function..."
if supabase functions deploy send-twilio-sms; then
    echo "   ✅ Twilio function deployed successfully"
else
    echo "   ❌ Failed to deploy Twilio function"
    exit 1
fi

echo ""
echo "====================================="
echo "✨ All Edge Functions deployed successfully!"
echo ""

# Check if secrets are set
echo "🔐 Checking for required secrets..."
echo ""

# Prompt for Twilio credentials if not set
echo "Please configure your Twilio credentials:"
echo ""
echo "You can set them now or later via:"
echo "  supabase secrets set TWILIO_ACCOUNT_SID=your-sid"
echo "  supabase secrets set TWILIO_AUTH_TOKEN=your-token"
echo "  supabase secrets set TWILIO_PHONE_NUMBER=your-number"
echo ""

read -p "Do you want to set Twilio credentials now? (y/n): " SET_SECRETS

if [ "$SET_SECRETS" = "y" ]; then
    echo ""
    read -p "Twilio Account SID: " TWILIO_SID
    read -p "Twilio Auth Token: " TWILIO_TOKEN
    read -p "Twilio Phone Number (with country code, e.g., +1234567890): " TWILIO_PHONE
    
    echo ""
    echo "Setting secrets..."
    supabase secrets set TWILIO_ACCOUNT_SID="$TWILIO_SID"
    supabase secrets set TWILIO_AUTH_TOKEN="$TWILIO_TOKEN"
    supabase secrets set TWILIO_PHONE_NUMBER="$TWILIO_PHONE"
    
    echo "✅ Secrets configured successfully"
else
    echo "⚠️  Remember to set your secrets before using SMS notifications"
fi

echo ""
echo "====================================="
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Configure notification settings in BitMind app"
echo "2. Test Discord webhook integration"
echo "3. Test Twilio SMS integration"
echo "4. Monitor function logs: supabase functions logs <function-name>"
echo ""
echo "Documentation: See EXTERNAL_API_INTEGRATION_GUIDE.md"
echo "====================================="

