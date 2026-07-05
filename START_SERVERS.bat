@echo off
echo ============================================
echo  HorizonCare AI Medical Center - Startup
echo ============================================

echo [1] Killing stale processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173"') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

echo [2] Starting FastAPI Backend on port 8000...
start "HorizonCare Backend" cmd /k "cd /d D:\AI Agent\backend && python -m uvicorn app.main:app --reload --port 8000"

echo [3] Starting React Frontend on port 5173...
start "HorizonCare Frontend" cmd /k "cd /d D:\AI Agent\frontend && npm run dev"

echo.
echo ============================================
echo  Servers are starting in separate windows!
echo ============================================
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo ============================================
echo.
echo Login Credentials:
echo  Admin       : admin / admin123
echo  Doctor      : priya / admin123
echo  Patient     : test_pat_user / admin123
echo  Receptionist: reception1 / admin123
echo ============================================
pause
