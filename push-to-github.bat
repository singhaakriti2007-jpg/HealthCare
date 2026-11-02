@echo off
title Push MEDNEXUS to GitHub
color 0A
echo ============================================================
echo   MEDNEXUS - Quick GitHub Deployment Helper
echo ============================================================
echo.

set "GIT_CMD=C:\Users\Arush\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"

cd /d "%~dp0"

echo Current Git status:
"%GIT_CMD%" status --short
echo.

echo Enter your GitHub repository URL:
echo (Example: https://github.com/your-username/mednexus.git)
echo.
set /p REPO_URL="Repository URL: "

if "%REPO_URL%"=="" (
    echo [ERROR] No URL entered. Aborting.
    pause
    exit /b 1
)

echo.
echo [1/3] Setting remote origin...
"%GIT_CMD%" remote remove origin 2>nul
"%GIT_CMD%" remote add origin %REPO_URL%

echo [2/3] Renaming branch to main...
"%GIT_CMD%" branch -M main

echo [3/3] Pushing commits to GitHub...
"%GIT_CMD%" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo   SUCCESS! MEDNEXUS is now published on GitHub.
    echo ============================================================
) else (
    echo.
    echo [ERROR] Push failed. Make sure you created the repo on GitHub
    echo and have permissions to push.
)

pause
