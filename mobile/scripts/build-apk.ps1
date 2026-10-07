# Wallet Android APK build (EAS Cloud)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Checking EAS login..."
$whoami = eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Not logged in. Opening Expo login..."
  eas login
}

if (-not (Test-Path "eas.json")) {
  throw "eas.json not found"
}

Write-Host "Configuring EAS project (first run only)..."
eas build:configure --platform android --non-interactive 2>$null

Write-Host "Starting Android APK build (preview profile)..."
Write-Host "API URL baked in: http://192.168.1.142:3000/api"
Write-Host "Change mobile/eas.json env if your PC IP differs."
eas build -p android --profile preview --non-interactive

Write-Host ""
Write-Host "When build finishes, download APK from the link above or:"
Write-Host "  eas build:list --platform android --limit 1"
