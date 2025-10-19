# PowerShell Script to Update Twilio Secrets in Supabase
# Run this script to update the exposed Twilio credentials

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   BitMind - Update Twilio Secrets in Supabase" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseCheck = Get-Command npx -ErrorAction SilentlyContinue
if (-not $supabaseCheck) {
    Write-Host "ERROR: npx not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Supabase CLI is available" -ForegroundColor Green
Write-Host ""

# Prompt for new credentials
Write-Host "Enter your NEW Twilio credentials:" -ForegroundColor Yellow
Write-Host ""

$twilioSid = Read-Host "Twilio Account SID (starts with AC...)"
$twilioToken = Read-Host "Twilio Auth Token" -AsSecureString
$twilioTokenPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($twilioToken))

if ([string]::IsNullOrWhiteSpace($twilioSid) -or [string]::IsNullOrWhiteSpace($twilioTokenPlain)) {
    Write-Host "ERROR: Both Account SID and Auth Token are required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setting secrets in Supabase..." -ForegroundColor Yellow
Write-Host ""

# Set the new secrets
try {
    Write-Host "1. Setting twilio2-sid..." -ForegroundColor Cyan
    $result1 = npx supabase secrets set "twilio2-sid=$twilioSid" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ twilio2-sid set successfully" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Failed to set twilio2-sid" -ForegroundColor Red
        Write-Host "   Error: $result1" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "2. Setting twilio2-secret..." -ForegroundColor Cyan
    $result2 = npx supabase secrets set "twilio2-secret=$twilioTokenPlain" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ twilio2-secret set successfully" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Failed to set twilio2-secret" -ForegroundColor Red
        Write-Host "   Error: $result2" -ForegroundColor Red
    }
    
} catch {
    Write-Host "ERROR: Failed to set secrets" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Listing all secrets (values are hidden):" -ForegroundColor Yellow
Write-Host ""

npx supabase secrets list

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "✓ Twilio secrets updated successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your .env.local file with the new credentials" -ForegroundColor White
Write-Host "2. Redeploy any Supabase Edge Functions that use Twilio" -ForegroundColor White
Write-Host "3. Test the integration to ensure it works" -ForegroundColor White
Write-Host ""
Write-Host "To deploy functions:" -ForegroundColor Yellow
Write-Host "  npx supabase functions deploy function-name" -ForegroundColor Cyan
Write-Host ""



