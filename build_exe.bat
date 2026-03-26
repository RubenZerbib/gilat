@echo off
chcp 65001 >nul 2>&1
title Build ClinicForm.exe
cd /d "%~dp0"

echo.
echo  Building ClinicForm.exe ...
echo.

:: Try .NET Framework C# compiler (present on all Windows 10/11)
set "CSC="
for /f "delims=" %%i in ('dir /s /b /o-n "%WINDIR%\Microsoft.NET\Framework64\v*\csc.exe" 2^>nul') do (
    if not defined CSC set "CSC=%%i"
)
if not defined CSC (
    for /f "delims=" %%i in ('dir /s /b /o-n "%WINDIR%\Microsoft.NET\Framework\v*\csc.exe" 2^>nul') do (
        if not defined CSC set "CSC=%%i"
    )
)

if not defined CSC (
    echo [ERROR] C# compiler not found.
    echo         Ensure .NET Framework is installed ^(ships with Windows 10/11^).
    pause
    exit /b 1
)

echo  Using: %CSC%
echo.

"%CSC%" /nologo /optimize /target:exe /out:ClinicForm.exe scripts\launcher.cs

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Compilation failed.
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
