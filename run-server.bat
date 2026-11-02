@echo off
title MEDNEXUS - AI Healthcare Intelligence Server
color 0B
echo ============================================================
echo   MEDNEXUS - AI Healthcare Intelligence Platform
echo   Smarter Healthcare. Better Decisions.
echo ============================================================
echo.

set "PATH=C:\Users\Arush\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;C:\Users\Arush\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback;%PATH%"

cd /d "%~dp0"

echo [1/3] Verifying Database Schema and Seed Data...
call pnpm prisma generate
echo [2/3] Starting Server on 0.0.0.0:3000...
echo.
echo Local Access:             http://localhost:3000
echo Network (Any Device):     http://192.168.0.103:3000
echo.
echo Demo Accounts:
echo   Admin:        admin@mednexus.com     / Admin@123
echo   Doctor:       doctor@mednexus.com    / Doctor@123
echo   Receptionist: reception@mednexus.com / Reception@123
echo   Patient:      patient@mednexus.com   / Patient@123
echo.
echo Opening browser in 3 seconds...
start "" http://localhost:3000

call pnpm start
pause
