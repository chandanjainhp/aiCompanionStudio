@echo off
REM ===========================================
REM Environment Setup Script (Windows)
REM ===========================================

setlocal enabledelayedexpansion

REM Configuration
for /f %%A in ('cd') do set PROJECT_ROOT=%%A
set SERVER_DIR=%PROJECT_ROOT%\server
set CLIENT_DIR=%PROJECT_ROOT%\client

REM Check prerequisites
if not exist "%SERVER_DIR%\.env.example" (
    echo [91m❌ [ERROR][0m server\.env.example not found
    exit /b 1
)

:menu
cls
echo.
echo ================================================
echo Environment Setup Menu
echo ================================================
echo.
echo 1. Setup server .env file
echo 2. Setup client .env file
echo 3. Setup both ^(recommended^)
echo 4. View .env example
echo 0. Exit
echo.
echo ================================================
echo.

set /p choice="Select option (0-3): "

if "%choice%"=="1" goto setup_server
if "%choice%"=="2" goto setup_client
if "%choice%"=="3" goto setup_both
if "%choice%"=="4" goto view_example
if "%choice%"=="0" goto exit_script
goto invalid

:setup_server
echo.
echo Setting up server environment variables...
if exist "%SERVER_DIR%\.env" (
    echo [93m⚠️ [WARN][0m server\.env already exists
    goto menu
)

echo Copying .env.example to .env...
copy "%SERVER_DIR%\.env.example" "%SERVER_DIR%\.env" >nul
echo [92m✅ [SUCCESS][0m Created server\.env

echo.
echo Now edit server\.env and set:
echo.
echo   Required variables:
echo   - DATABASE_URL=postgresql://...
echo   - JWT_SECRET=your-secret (min 32 chars^)
echo   - JWT_REFRESH_SECRET=your-secret (min 32 chars^)
echo   - OPENROUTER_API_KEY=sk-or-v1-...
echo   - APP_URL=http://localhost:5173
echo.
echo   Get OpenRouter API key from:
echo   https://openrouter.ai/keys
echo.
pause
goto menu

:setup_client
echo.
echo Setting up client environment variables...

if not exist "%CLIENT_DIR%\.env.production" (
    (
        echo # Backend API URL
        echo VITE_API_URL=http://localhost:3000
    ) > "%CLIENT_DIR%\.env.production"
    echo [92m✅ [SUCCESS][0m Created client\.env.production
) else (
    echo [93m⚠️ [WARN][0m client\.env.production already exists
)

if not exist "%CLIENT_DIR%\.env.development" (
    (
        echo # Backend API URL ^(development^)
        echo VITE_API_URL=http://localhost:3000
    ) > "%CLIENT_DIR%\.env.development"
    echo [92m✅ [SUCCESS][0m Created client\.env.development
)

echo.
pause
goto menu

:setup_both
call :setup_server
call :setup_client
goto menu

:view_example
echo.
echo Viewing server\.env.example:
echo.
type "%SERVER_DIR%\.env.example" | more
pause
goto menu

:invalid
echo.
echo [91m❌ [ERROR][0m Invalid option
echo.
pause
goto menu

:exit_script
echo.
echo [92m✅ [SUCCESS][0m Exiting setup
echo.
exit /b 0
