@echo off
title MarketLens AI Launcher
cd /d "%~dp0"

:: Start Backend inside backend folder
cd backend
if exist "venv\Scripts\activate.bat" (
    start "MarketLens Backend" cmd /k "call venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
) else (
    start "MarketLens Backend" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
)

:: Start Frontend inside frontend folder
cd /d "%~dp0\frontend"
start "MarketLens Frontend" cmd /k "npm run dev"

:: Open Browser after 4 seconds
timeout /t 4 /nobreak >nul
start http://localhost:5173