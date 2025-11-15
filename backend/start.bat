@echo off
REM Start script for Exam AI Malawi Backend API

echo ========================================
echo   Exam AI Malawi - Backend API Server
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo Checking Python version...
python --version

echo.
echo Checking if requirements are installed...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo.
    echo Dependencies not found. Installing...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo ✅ All dependencies installed!
echo.
echo Starting backend server...
echo Server will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press CTRL+C to stop the server
echo.

python app.py

pause
