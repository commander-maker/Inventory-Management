# Prisma Migration Script
Write-Host "Running Prisma Migrations..." -ForegroundColor Cyan
Write-Host ""

# Change to Backend directory
Set-Location $PSScriptRoot

# Run migration
npx prisma migrate dev

Write-Host ""
Write-Host "Migration completed!" -ForegroundColor Green
Read-Host "Press Enter to exit"
