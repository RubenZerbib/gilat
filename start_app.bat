@echo off
chcp 65001 >nul 2>&1
title Clinic Form - Starting...

echo ============================================
echo   Clinic Medical Form Signing System
echo ============================================
echo.

:: Resolve project root to wherever this .bat lives
cd /d "%~dp0"

:: ── 1. Check Node.js ──────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Download from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found

:: ── 2. Install dependencies if needed ─────────
if not exist "node_modules\" (
    echo [*] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)
echo [OK] Dependencies ready

:: ── 3. Create .env from example if missing ────
if not exist ".env" (
    if exist ".env.example" (
        echo [*] Creating .env from .env.example...
        copy ".env.example" ".env" >nul
    )
)
echo [OK] Environment file ready

:: ── 4. Prepare database ───────────────────────
echo [*] Preparing database...
call npx prisma generate >nul 2>&1
call npx prisma db push --skip-generate >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Database setup failed.
    pause
    exit /b 1
)
echo [OK] Database ready

:: ── 5. Start dev server + open browser ────────
echo.
echo [*] Starting development server on http://localhost:3000
echo     Press Ctrl+C to stop.
echo.

start "" powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0scripts\wait-and-open.ps1"

call npm run dev
