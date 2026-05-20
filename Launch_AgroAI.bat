@echo off
title AgroAI Launcher
echo ==========================================
echo    AgroAI: One-Click System Launcher
echo ==========================================
echo.

:: Check for virtual environment
set PYTHON_EXE=python
if exist "venv\Scripts\python.exe" (
    echo [INFO] Virtual environment detected. Activating...
    set PYTHON_EXE=venv\Scripts\python.exe
)

echo [1/3] Starting Backend Server (Port 8000)...
start "AgroAI Backend" cmd /k "%PYTHON_EXE% -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"

echo [2/3] Starting Frontend Dev Server...
echo [INFO] Waiting for frontend to initialize...
cd frontend
start "AgroAI Frontend" cmd /k "npm run dev"

echo [3/3] Opening Browser in 10 seconds...
echo [INFO] Giving the servers a moment to bind to ports...
timeout /t 10 /nobreak > nul
start http://localhost:5173

echo.
echo ==========================================
echo    System is now LIVE!
echo    - Backend: http://localhost:8000
echo    - Frontend: http://localhost:5173
echo.
echo    If the page shows a "Server connection error":
echo    1. Check if the "AgroAI Backend" window has errors.
echo    2. Refresh the page after 5-10 seconds.
echo ==========================================
echo.
pause
