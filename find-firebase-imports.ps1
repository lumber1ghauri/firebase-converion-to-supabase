# Component Update Helper
# This script helps you find files that need to be updated after Firebase removal

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  Firebase to Prisma Migration - File Scanner" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Scanning for files that import from Firebase..." -ForegroundColor Yellow
Write-Host ""

# Find files importing from firebase/firestore/bookings
$firestoreBookings = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" | Select-String -Pattern "@/firebase/firestore/bookings" | Select-Object -ExpandProperty Path -Unique

# Find files importing from firebase/server-actions
$serverActions = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" | Select-String -Pattern "@/firebase/server-actions" | Select-Object -ExpandProperty Path -Unique

# Find files importing FirebaseClientProvider
$clientProvider = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" | Select-String -Pattern "@/firebase/client-provider|@/firebase/provider|@/firebase" | Select-Object -ExpandProperty Path -Unique

Write-Host "📋 Files needing updates:" -ForegroundColor Cyan
Write-Host ""

$allFiles = @()
if ($firestoreBookings) {
    $allFiles += $firestoreBookings
}
if ($serverActions) {
    $allFiles += $serverActions
}
if ($clientProvider) {
    $allFiles += $clientProvider
}

$uniqueFiles = $allFiles | Sort-Object -Unique

if ($uniqueFiles.Count -eq 0) {
    Write-Host "  ✅ No Firebase imports found! Your migration is complete." -ForegroundColor Green
} else {
    Write-Host "  Found $($uniqueFiles.Count) file(s) to update:" -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($file in $uniqueFiles) {
        $relativePath = $file -replace [regex]::Escape($PWD.Path + "\"), ""
        Write-Host "  📄 $relativePath" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "===========================================================" -ForegroundColor Cyan
    Write-Host "  What to do:" -ForegroundColor Yellow
    Write-Host "===========================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. Replace imports:" -ForegroundColor White
    Write-Host "     OLD: import { saveBookingClient } from '@/firebase/firestore/bookings';" -ForegroundColor Red
    Write-Host "     NEW: import { saveBooking } from '@/lib/database';" -ForegroundColor Green
    Write-Host ""
    Write-Host "  2. Update function calls:" -ForegroundColor White
    Write-Host "     OLD: await saveBookingClient(firestore, booking);" -ForegroundColor Red
    Write-Host "     NEW: await saveBooking(booking);" -ForegroundColor Green
    Write-Host ""
    Write-Host "  3. Remove Firebase providers from layout.tsx" -ForegroundColor White
    Write-Host ""
    Write-Host "  See FIREBASE-TO-LOCAL-MIGRATION.md for complete guide" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""
