@echo off
echo ========================================
echo    EXAM AI MALAWI - ONE CLICK START
echo ========================================
echo.
echo Starting Exam AI Malawi application...
echo This will start both backend and frontend servers.
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

echo ✅ Node.js and Python detected
echo.

:: Kill any existing servers
echo 🔄 Stopping any existing servers...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: Install frontend dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

:: Install backend dependencies if needed
if not exist "backend\venv" (
    echo 🐍 Creating Python virtual environment...
    cd backend
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
    cd ..
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo 🐍 Activating Python virtual environment...
    cd backend
    call venv\Scripts\activate
    cd ..
)

echo.
echo 🚀 Starting servers...
echo.

:: Create a temporary script to start backend
echo @echo off > start_backend_temp.bat
echo echo 🤖 Starting AI Backend Server... >> start_backend_temp.bat
echo cd backend >> start_backend_temp.bat
echo call venv\Scripts\activate >> start_backend_temp.bat
echo python app.py >> start_backend_temp.bat

:: Create a temporary script to start frontend
echo @echo off > start_frontend_temp.bat
echo echo 🌐 Starting React Frontend... >> start_frontend_temp.bat
echo timeout /t 5 /nobreak ^>nul >> start_frontend_temp.bat
echo npm start >> start_frontend_temp.bat

:: Start backend in new window
echo 🤖 Starting AI Backend Server (Port 8000)...
start "Exam AI Backend" cmd /c start_backend_temp.bat

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend in new window
echo 🌐 Starting React Frontend (Port 3000)...
start "Exam AI Frontend" cmd /c start_frontend_temp.bat

:: Wait for servers to start
echo.
echo ⏳ Waiting for servers to start...
timeout /t 8 /nobreak >nul

:: Check if backend is running
echo 🔍 Checking backend status...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend server is running on http://localhost:8000
) else (
    echo ⚠️  Backend server may still be starting...
)

echo.
echo 🎉 EXAM AI MALAWI IS STARTING!
echo.
echo 📊 Access Points:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo    Admin:    http://localhost:3000/admin
echo.
echo 🔧 Admin Access:
echo    Email: ylikagwa@gmail.com
echo    Features: User Analytics, Model Training, Performance Monitoring
echo.
echo 📝 What you can do:
echo    ✅ Register/Login to the app
echo    ✅ Use AI Assistant for questions
echo    ✅ Generate exams with AI
echo    ✅ Access admin panel for analytics
echo    ✅ Train AI model with new data
echo.
echo 🤖 Waiting for AI model to load...
timeout /t 5 /nobreak >nul

echo 🔍 Checking model status...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ AI model is ready!
) else (
    echo ⚠️  AI model still loading... This may take a few minutes on first run.
)

echo.
echo 🌐 Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ✅ Exam AI Malawi is now running!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🤖 Backend API: http://localhost:8000
echo 📊 API Docs: http://localhost:8000/docs
echo 🔍 Health Check: http://localhost:8000/health
echo.
echo 💡 Usage Tips:
echo    - AI model loads automatically on backend startup
echo    - Frontend will auto-reload on code changes
echo    - Backend will auto-reload on code changes  
echo    - Close those windows to stop the servers
echo    - Check console output for any errors
echo    - Admin panel: http://localhost:3000/admin
echo.
echo 🤖 AI Model Status:
echo    - If model loading fails, GPT-2 fallback will be used
echo    - Check backend console for "Model is ready to serve requests!"
echo    - Visit /health endpoint to verify model status
echo.
echo 🛑 To stop servers: Close the backend and frontend windows
echo    or run: taskkill /F /IM node.exe && taskkill /F /IM python.exe
echo.

:: Cleanup temporary files
del start_backend_temp.bat >nul 2>&1
del start_frontend_temp.bat >nul 2>&1

echo Press any key to close this window...
pause >nul
