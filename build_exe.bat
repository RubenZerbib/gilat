@echo off
chcp 65001 >nul 2>&1
title Build ClinicForm.exe
cd /d "%~dp0"

echo.
echo  Building ClinicForm.exe ...
echo.

powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0scripts\build.ps1"

if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Build failed. See errors above.
    pause
    exit /b 1
)

echo.
echo  ============================================
echo   ClinicForm.exe created successfully!
echo   Double-click it to launch the application.
echo  ============================================
echo.
pause
