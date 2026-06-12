# Local Setup Guide for Exam AI Malawi

## Prerequisites

1. Python 3.8+ installed
2. Node.js 16+ installed
3. Git installed

## Backend Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `backend/.env` file with the following:

```bash
# Google Gemini AI (Required for AI to work)
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.5-flash-lite

# Optional: Skip local model loading (recommended for testing)
SKIP_LOCAL_MODEL=true

# Phase 3: AI Providers (Optional but recommended)
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=llama3-70b-8192
OPENROUTER_API_KEY=your-openrouter-api-key-here
OPENROUTER_MODEL=anthropic/claude-3-haiku

# PayChangu Payment Gateway (Optional)
PAYCHANGU_API_KEY=your-paychangu-api-key-here
PAYCHANGU_MERCHANT_ID=your-merchant-id-here

# Logging
LOG_LEVEL=INFO
```

### 3. Get Gemini API Key

1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Create a new API key
4. Copy it to your `backend/.env` file

### 4. Start Backend Server

```bash
cd backend
python app.py
```

The backend should start on `http://localhost:8000`

### 5. Verify Backend Health

Open your browser and visit:
```
http://localhost:8000/health
```

You should see a JSON response indicating the backend is healthy.

## Frontend Setup

### 1. Install Node Dependencies

```bash
cd src
npm install
```

### 2. Configure Frontend Environment

Create a `src/.env` file with:

```bash
REACT_APP_API_BASE_URL=http://localhost:8000
```

### 3. Start Frontend Development Server

```bash
cd src
npm start
```

The frontend should start on `http://localhost:3000`

## Troubleshooting AI Connection Issues

### Issue: "AI Agent Is Sleeping" or AI not connecting

**Solution 1: Check Backend is Running**
- Ensure the backend server is running on port 8000
- Check the terminal for any error messages
- Verify the `/health` endpoint returns a healthy status

**Solution 2: Check API Keys**
- Ensure `GEMINI_API_KEY` is set in `backend/.env`
- Verify the API key is valid and not expired
- Try generating a new API key from Google AI Studio

**Solution 3: Check Dependencies**
- Ensure all Python dependencies are installed: `pip install -r requirements.txt`
- Check for import errors in the backend terminal

**Solution 4: Check CORS**
- If using a different port, update `REACT_APP_API_BASE_URL` in `src/.env`
- Ensure the backend CORS configuration allows your frontend origin

**Solution 5: Test Backend Directly**
```bash
# Test the chat endpoint directly
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2+2?", "user_id": "test"}'
```

### Issue: Backend Won't Start

**Solution 1: Check Python Version**
```bash
python --version
# Should be 3.8 or higher
```

**Solution 2: Install Missing Dependencies**
```bash
pip install -r requirements.txt
```

**Solution 3: Check for Syntax Errors**
- The terminal will show syntax errors if any exist
- Fix any syntax errors shown in the error messages

### Issue: Frontend Can't Connect to Backend

**Solution 1: Check Backend URL**
- Ensure `REACT_APP_API_BASE_URL=http://localhost:8000` in `src/.env`
- Restart the frontend after changing environment variables

**Solution 2: Check Backend is Running**
- Visit `http://localhost:8000/health` in your browser
- If it doesn't load, the backend isn't running

**Solution 3: Check Browser Console**
- Open browser DevTools (F12)
- Check the Console tab for CORS or network errors
- Check the Network tab for failed requests

## Testing the System

### 1. Test Backend Health
```bash
curl http://localhost:8000/health
```

### 2. Test Cache Stats
```bash
curl http://localhost:8000/api/cache/stats
```

### 3. Test Routing Stats
```bash
curl http://localhost:8000/api/routing/stats
```

### 4. Test Chat Endpoint
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is photosynthesis?", "user_id": "test"}'
```

## Common Issues and Solutions

### Issue: "ModuleNotFoundError: No module named 'sentence_transformers'"
**Solution:** Install missing dependencies
```bash
pip install sentence-transformers numpy
```

### Issue: "UnboundLocalError: cannot access local variable"
**Solution:** This should be fixed in the latest code. If you see this, ensure you have the latest version of the files.

### Issue: "SyntaxError: '(' was never closed"
**Solution:** This should be fixed in the latest code. Ensure you have the latest version of app.py.

### Issue: Frontend shows "WifiOffIcon not found"
**Solution:** This should be fixed in the latest code. Ensure you have the latest version of AIAssistant.js.

## Development Workflow

1. Start backend: `cd backend && python app.py`
2. Start frontend: `cd src && npm start`
3. Open browser to `http://localhost:3000`
4. Test chat functionality
5. Check backend logs for errors
6. Check browser console for frontend errors

## Production Deployment Notes

For production deployment:
1. Set `SKIP_LOCAL_MODEL=true` in environment
2. Use environment variables for all API keys
3. Configure CORS for your production domain
4. Use a production-grade WSGI server (Gunicorn, Uvicorn)
5. Set up proper logging and monitoring

## Support

If you encounter issues:
1. Check the backend terminal for error messages
2. Check the browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
5. Test the backend endpoints directly with curl
