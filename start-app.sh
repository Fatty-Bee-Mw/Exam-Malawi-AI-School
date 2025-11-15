#!/bin/bash

echo "========================================"
echo "   EXAM AI MALAWI - ONE CLICK START"
echo "========================================"
echo ""
echo "Starting Exam AI Malawi application..."
echo "This will start both backend and frontend servers."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo -e "${RED}ERROR: Python is not installed${NC}"
    echo "Please install Python from https://python.org/"
    exit 1
fi

# Use python3 if available, otherwise python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

echo -e "${GREEN}✅ Node.js and Python detected${NC}"
echo ""

# Kill any existing servers
echo -e "${YELLOW}🔄 Stopping any existing servers...${NC}"
pkill -f "node.*start" 2>/dev/null || true
pkill -f "python.*app.py" 2>/dev/null || true
sleep 2

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}ERROR: Failed to install frontend dependencies${NC}"
        exit 1
    fi
fi

# Install backend dependencies if needed
if [ ! -d "backend/venv" ]; then
    echo -e "${BLUE}🐍 Creating Python virtual environment...${NC}"
    cd backend
    $PYTHON_CMD -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
    if [ $? -ne 0 ]; then
        echo -e "${RED}ERROR: Failed to install backend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${BLUE}🐍 Python virtual environment ready${NC}"
fi

echo ""
echo -e "${YELLOW}🚀 Starting servers...${NC}"
echo ""

# Function to start backend
start_backend() {
    echo -e "${BLUE}🤖 Starting AI Backend Server...${NC}"
    cd backend
    source venv/bin/activate
    $PYTHON_CMD app.py
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🌐 Starting React Frontend...${NC}"
    sleep 5  # Wait for backend to start
    npm start
}

# Start backend in background
start_backend &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
start_frontend &
FRONTEND_PID=$!

# Wait for servers to start
echo ""
echo -e "${YELLOW}⏳ Waiting for servers to start...${NC}"
sleep 8

# Check if backend is running
echo -e "${BLUE}🔍 Checking backend status...${NC}"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server is running on http://localhost:8000${NC}"
else
    echo -e "${YELLOW}⚠️  Backend server may still be starting...${NC}"
fi

echo ""
echo -e "${GREEN}🎉 EXAM AI MALAWI IS STARTING!${NC}"
echo ""
echo -e "${BLUE}📊 Access Points:${NC}"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   Admin:    http://localhost:3000/admin"
echo ""
echo -e "${BLUE}🔧 Admin Access:${NC}"
echo "   Email: ylikagwa@gmail.com"
echo "   Features: User Analytics, Model Training, Performance Monitoring"
echo ""
echo -e "${BLUE}📝 What you can do:${NC}"
echo "   ✅ Register/Login to the app"
echo "   ✅ Use AI Assistant for questions"
echo "   ✅ Generate exams with AI"
echo "   ✅ Access admin panel for analytics"
echo "   ✅ Train AI model with new data"
echo ""

# Try to open browser (works on most Linux distros and macOS)
if command -v xdg-open &> /dev/null; then
    echo -e "${BLUE}🌐 Opening application in browser...${NC}"
    sleep 3
    xdg-open http://localhost:3000 &
elif command -v open &> /dev/null; then
    echo -e "${BLUE}🌐 Opening application in browser...${NC}"
    sleep 3
    open http://localhost:3000 &
else
    echo -e "${YELLOW}💡 Please open http://localhost:3000 in your browser${NC}"
fi

echo ""
echo -e "${GREEN}✅ Application started successfully!${NC}"
echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo "   - Both servers are running in background"
echo "   - Press Ctrl+C to stop both servers"
echo "   - Check terminal output for any errors"
echo "   - Admin panel: http://localhost:3000/admin"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    pkill -f "node.*start" 2>/dev/null || true
    pkill -f "python.*app.py" 2>/dev/null || true
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo -e "${YELLOW}🔄 Servers are running. Press Ctrl+C to stop.${NC}"
echo ""

# Wait for user to stop
wait
