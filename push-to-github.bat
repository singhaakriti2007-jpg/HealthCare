@echo off
title Push MEDNEXUS to GitHub
color 0B
echo ============================================================
echo   MEDNEXUS - GitHub Publisher
echo   Repository: https://github.com/singhaakriti2007-jpg/mednexus
echo ============================================================
echo.

set "GIT_CMD=C:\Users\Arush\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"

cd /d "%~dp0"

echo [1/2] Connecting to remote origin...
"%GIT_CMD%" remote remove origin 2>nul
"%GIT_CMD%" remote add origin https://github.com/singhaakriti2007-jpg/mednexus.git
"%GIT_CMD%" branch -M main

echo [2/2] Pushing code to GitHub...
echo (If a GitHub sign-in window opens, click "Sign in with your browser")
echo.

"%GIT_CMD%" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo   SUCCESS! MEDNEXUS is now live on GitHub:
    echo   https://github.com/singhaakriti2007-jpg/mednexus
    echo ============================================================
) else (
    echo.
    echo [NOTE] If it asks for authentication, generate a Personal Access Token:
    echo 1. Go to: https://github.com/settings/tokens
    echo 2. Generate a classic token with 'repo' scope
    echo 3. Enter your token when prompted
)

pause
