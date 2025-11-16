# Setup Verification Script for Sellaya LBA-02
# This script checks if your environment is ready for local development

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  Sellaya LBA-02 Setup Verification" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Node.js version
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -ge 18) {
        Write-Host "  ✓ Node.js $nodeVersion (OK)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Node.js $nodeVersion (Need v18 or higher)" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "  ✗ Node.js not found" -ForegroundColor Red
    Write-Host "    Install from: https://nodejs.org/" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check if .env.local exists
Write-Host "Checking environment file..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "  ✓ .env.local exists" -ForegroundColor Green
    
    # Check for required variables
    $envContent = Get-Content ".env.local" -Raw
    
    $requiredVars = @(
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "FIREBASE_SERVICE_ACCOUNT_KEY",
        "STRIPE_SECRET_KEY",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        "RESEND_API_KEY"
    )
    
    Write-Host "  Checking environment variables..." -ForegroundColor Yellow
    foreach ($var in $requiredVars) {
        if ($envContent -match "$var=.+") {
            # Check if it's still a placeholder
            if ($envContent -match "$var=.*YOUR.*HERE" -or $envContent -match "$var=\{\}" -or $envContent -match "$var=sk_test_YOUR") {
                Write-Host "    ⚠ $var (needs update)" -ForegroundColor Yellow
                $allGood = $false
            } else {
                Write-Host "    ✓ $var" -ForegroundColor Green
            }
        } else {
            Write-Host "    ✗ $var (missing)" -ForegroundColor Red
            $allGood = $false
        }
    }
} else {
    Write-Host "  ✗ .env.local not found" -ForegroundColor Red
    Write-Host "    A template has been created. Please update it." -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check if node_modules exists
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  ✓ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠ node_modules not found" -ForegroundColor Yellow
    Write-Host "    Run: npm install" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check if package.json exists
Write-Host "Checking project files..." -ForegroundColor Yellow
$requiredFiles = @("package.json", "next.config.ts", "tsconfig.json")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (missing)" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "  STATUS: Ready to go! 🚀" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Next steps:" -ForegroundColor Cyan
    Write-Host "    1. If you haven't already: npm install" -ForegroundColor White
    Write-Host "    2. Run development server: npm run dev" -ForegroundColor White
    Write-Host "    3. Open browser: http://localhost:3000" -ForegroundColor White
} else {
    Write-Host "  STATUS: Action required ⚠" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Please fix the issues above, then:" -ForegroundColor Cyan
    Write-Host "    1. Update .env.local with your credentials" -ForegroundColor White
    Write-Host "    2. Run: npm install" -ForegroundColor White
    Write-Host "    3. Run this script again to verify" -ForegroundColor White
    Write-Host ""
    Write-Host "  See SETUP-QUICK-START.md for detailed instructions" -ForegroundColor Yellow
}

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""
