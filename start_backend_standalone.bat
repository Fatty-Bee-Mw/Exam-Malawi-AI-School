@echo off
title Exam AI Backend Server - DO NOT CLOSE THIS WINDOW
echo ========================================
echo    EXAM AI BACKEND SERVER
echo ========================================
echo.
echo Checking for existing processes on port 8000...

netstat -ano | findstr :8000 >nul
if %errorlevel% == 0 (
    echo Found process using port 8000. Killing it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    echo Port 8000 cleared.
) else (
    echo Port 8000 is available.
)

echo.
echo Starting backend on http://0.0.0.0:8000
echo.
cd backend
call venv\Scripts\activate
echo.
python app.py
echo.
echo ========================================
echo Backend stopped or crashed
echo This window will remain open for debugging
echo Press any key to close this window...
pause 
