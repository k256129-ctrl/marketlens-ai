@echo off
cd /d "%~dp0"
start "MarketLens Backend" cmd /k "cd backend && uvicorn app.main:app --reload --port 8000"
timeout /t 3 /nobreak >nul
start "MarketLens Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul
start http://localhost:5173
