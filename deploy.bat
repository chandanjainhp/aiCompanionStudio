@echo off
REM ===========================================
REM AI Companion Studio - Full Deployment Script (Windows)
REM Deploys both server and client
REM ===========================================

setlocal enabledelayedexpansion

REM Colors
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

REM Configuration
for /f %%A in ('cd') do set PROJECT_ROOT=%%A
set SERVER_DIR=%PROJECT_ROOT%\server
set CLIENT_DIR=%PROJECT_ROOT%\client

REM Functions
:log_info
echo [94mℹ️ [INFO][0m %~1
exit /b 0

:log_success
echo [92m✅ [SUCCESS][0m %~1
exit /b 0

:log_error
echo [91m❌ [ERROR][0m %~1
exit /b 0

REM Check prerequisites
:check_prerequisites
echo.
echo Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    call :log_error "Node.js is not installed"
    exit /b 1
)
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    call :log_error "npm is not installed"
    exit /b 1
)
call :log_success "Prerequisites check passed"
exit /b 0

REM Build server
:build_server
echo.
call :log_info "Building server..."
cd /d %SERVER_DIR%
call :log_info "Installing server dependencies..."
call npm install
if %ERRORLEVEL% NEQ 0 exit /b 1
call :log_info "Generating Prisma client..."
call npx prisma generate
if %ERRORLEVEL% NEQ 0 exit /b 1
call :log_success "Server build completed"
exit /b 0

REM Build client
:build_client
echo.
call :log_info "Building client..."
cd /d %CLIENT_DIR%
call :log_info "Installing client dependencies..."
call npm install
if %ERRORLEVEL% NEQ 0 exit /b 1
call :log_info "Building React app..."
call npm run build
if %ERRORLEVEL% NEQ 0 exit /b 1
call :log_success "Client build completed"
exit /b 0

REM Main deployment
:main
echo.
echo ================================================
echo AI Companion Studio - Full Deployment (Windows)
echo ================================================
echo.

call :check_prerequisites
if %ERRORLEVEL% NEQ 0 exit /b 1

call :build_server
if %ERRORLEVEL% NEQ 0 exit /b 1

call :build_client
if %ERRORLEVEL% NEQ 0 exit /b 1

echo.
echo ================================================
call :log_success "Full deployment build completed!"
echo ================================================
echo.
echo Next steps:
echo   1. Push to GitHub: git push origin full-developer
echo   2. Deploy server to: Render, Railway, or Fly.io
echo   3. Deploy client to: Vercel or Netlify
echo.

exit /b 0

REM Usage
:usage
echo.
echo Usage: %0
echo.
echo This script builds both server and client for deployment.
echo After building, push to GitHub and deploy to your chosen platform.
echo.
exit /b 0

REM Handle arguments
if "%1"=="/?" goto usage
if "%1"=="-h" goto usage
if "%1"=="--help" goto usage

call :main
