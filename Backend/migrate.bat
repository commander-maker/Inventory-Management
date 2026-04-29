@echo off
echo Running Prisma Migrations...
echo.

cd /d "%~dp0"
npx prisma migrate dev

echo.
echo Migration completed!
pause
