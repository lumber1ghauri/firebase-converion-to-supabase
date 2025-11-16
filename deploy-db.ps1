# Vercel Database Setup Script
# After creating Vercel Postgres, copy DATABASE_URL from Vercel dashboard
# Replace the URL below with your actual Vercel Postgres connection string

Write-Host "=== Vercel Database Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "STEP 1: Get your DATABASE_URL from Vercel" -ForegroundColor Yellow
Write-Host "  1. Go to Vercel dashboard -> Your Project -> Storage -> Postgres"
Write-Host "  2. Click 'Connect' tab"
Write-Host "  3. Copy the 'DATABASE_URL' value"
Write-Host ""
Write-Host "STEP 2: Run this command with your DATABASE_URL:" -ForegroundColor Yellow
Write-Host '  $env:DATABASE_URL="your-vercel-postgres-url"; npx prisma db push' -ForegroundColor Green
Write-Host ""
Write-Host "Example:" -ForegroundColor Gray
Write-Host '  $env:DATABASE_URL="postgresql://user:pass@host.vercel.com:5432/db"; npx prisma db push' -ForegroundColor Gray
Write-Host ""
Write-Host "This will create the Booking table in your Vercel Postgres database." -ForegroundColor Cyan
