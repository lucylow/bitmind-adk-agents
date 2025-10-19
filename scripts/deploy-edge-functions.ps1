# BitMind - Supabase Edge Functions Deployment Script (PowerShell)
# This script deploys all Edge Functions for external API integrations

$ErrorActionPreference = "Stop"

Write-Host "🚀 BitMind Edge Functions Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
try {
    $null = Get-Command supabase -ErrorAction Stop
    Write-Host "✅ Supabase CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if user is logged in
try {
    $null = supabase projects list 2>&1
    Write-Host "✅ Authenticated with Supabase" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Supabase:" -ForegroundColor Yellow
    supabase login
}

Write-Host ""

# Prompt for project reference if not already linked
if (!(Test-Path ".supabase/config.toml")) {
    Write-Host "🔗 Project not linked. Please enter your project reference:" -ForegroundColor Yellow
    $ProjectRef = Read-Host "Project Ref (found in Supabase dashboard URL)"
    supabase link --project-ref $ProjectRef
}

Write-Host "✅ Project linked" -ForegroundColor Green
Write-Host ""

# Deploy Discord notification function
Write-Host "📬 Deploying Discord notification function..." -ForegroundColor Cyan
try {
    supabase functions deploy send-discord-notification
    Write-Host "   ✅ Discord function deployed successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to deploy Discord function" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Deploy Twilio SMS function
Write-Host "📱 Deploying Twilio SMS function..." -ForegroundColor Cyan
try {
    supabase functions deploy send-twilio-sms
    Write-Host "   ✅ Twilio function deployed successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to deploy Twilio function" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✨ All Edge Functions deployed successfully!" -ForegroundColor Green
Write-Host ""

# Check if secrets are set
Write-Host "🔐 Checking for required secrets..." -ForegroundColor Cyan
Write-Host ""

# Prompt for Twilio credentials if not set
Write-Host "Please configure your Twilio credentials:" -ForegroundColor Yellow
Write-Host ""
Write-Host "You can set them now or later via:" -ForegroundColor Gray
Write-Host "  supabase secrets set TWILIO_ACCOUNT_SID=your-sid" -ForegroundColor Gray
Write-Host "  supabase secrets set TWILIO_AUTH_TOKEN=your-token" -ForegroundColor Gray
Write-Host "  supabase secrets set TWILIO_PHONE_NUMBER=your-number" -ForegroundColor Gray
Write-Host ""

$SetSecrets = Read-Host "Do you want to set Twilio credentials now? (y/n)"

if ($SetSecrets -eq "y") {
    Write-Host ""
    $TwilioSid = Read-Host "Twilio Account SID"
    $TwilioToken = Read-Host "Twilio Auth Token"
    $TwilioPhone = Read-Host "Twilio Phone Number (with country code, e.g., +1234567890)"
    
    Write-Host ""
    Write-Host "Setting secrets..." -ForegroundColor Cyan
    
    supabase secrets set TWILIO_ACCOUNT_SID=$TwilioSid
    supabase secrets set TWILIO_AUTH_TOKEN=$TwilioToken
    supabase secrets set TWILIO_PHONE_NUMBER=$TwilioPhone
    
    Write-Host "✅ Secrets configured successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Remember to set your secrets before using SMS notifications" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure notification settings in BitMind app" -ForegroundColor White
Write-Host "2. Test Discord webhook integration" -ForegroundColor White
Write-Host "3. Test Twilio SMS integration" -ForegroundColor White
Write-Host "4. Monitor function logs: supabase functions logs <function-name>" -ForegroundColor White
Write-Host ""
Write-Host "Documentation: See EXTERNAL_API_INTEGRATION_GUIDE.md" -ForegroundColor Gray
Write-Host "=====================================" -ForegroundColor Cyan

