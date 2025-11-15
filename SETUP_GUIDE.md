# 🚀 Complete Setup Guide - Exam AI Malawi

## Full Stack Setup: React Frontend + FastAPI Backend + AI Model

This guide will help you set up and run the complete Exam AI Malawi application with your local language model.

---

## 📋 Prerequisites

### Required Software
- ✅ **Node.js 18+** - For React frontend
- ✅ **Python 3.8+** - For AI backend
- ✅ **npm** - For JavaScript packages
- ✅ **pip** - For Python packages

### Optional (for better performance)
- NVIDIA GPU with CUDA support (for faster AI inference)
- 8GB+ RAM recommended

---

## 🎯 Quick Start (Both Servers)

### Step 1: Install Frontend Dependencies
```bash
# In project root
npm install
```

### Step 2: Install Backend Dependencies
```bash
# Navigate to backend folder
cd backend

# Install Python packages
pip install -r requirements.txt
```

### Step 3: Start Both Servers

**Option A: Using Two Terminals (Recommended)**

Terminal 1 - Backend:
```bash
cd backend
python app.py
```

Terminal 2 - Frontend:
```bash
npm run dev
```

**Option B: Using Start Scripts**

Windows:
```bash
# Terminal 1
cd backend
start.bat

# Terminal 2 (in project root)
npm run dev
```

---

## 📂 Project Structure

```
Exam-AI-Mw Schools/
├── frontend (React)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # State management
│   │   ├── services/
│   │   │   └── aiService.js # 🔗 API client
│   │   └── utils/           # Utilities
│   ├── package.json
│   └── .env                 # Frontend config
│
├── backend (FastAPI)
│   ├── app.py              # 🤖 Main API server
│   ├── requirements.txt    # Python dependencies
│   ├── README.md           # Backend docs
│   └── .env                # Backend config
│
└── my_small_model/
    └── model.safetensors   # 🧠 Your AI model (641MB)
```

---

## 🔧 Detailed Setup

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and set:
REACT_APP_API_BASE_URL=http://localhost:8000
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional)
cp .env.example .env
```

### 3. Model Verification

Check that your model file exists:
```bash
dir my_small_model\model.safetensors  # Windows
ls my_small_model/model.safetensors   # Mac/Linux
```

✅ **Your Model:**
- File: `model.safetensors`
- Size: 641 MB (~612 MB)
- Format: SafeTensors
- Location: `my_small_model/`

---

## 🌐 Running the Application

### Start Backend Server (Port 8000)
```bash
cd backend
python app.py
```

**Output should show:**
```
INFO: Loading model from ../my_small_model...
INFO: Using device: cpu
✅ Model loaded successfully!
🚀 Model is ready to serve requests!
INFO: Uvicorn running on http://0.0.0.0:8000
```

### Start Frontend Server (Port 3000)
```bash
# In project root
npm run dev
```

**Output should show:**
```
Compiled successfully!

Local:            http://localhost:3000
On Your Network:  http://192.168.1.187:3000
```

### Verify Both Are Running

Open browser and visit:
- ✅ Frontend: http://localhost:3000
- ✅ Backend API: http://localhost:8000/docs

---

## 🧪 Testing the Integration

### 1. Test Backend API

**Check Health:**
```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu"
}
```

### 2. Test Chat Endpoint

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Hello, explain algebra\"}"
```

### 3. Test in React App

1. Open http://localhost:3000
2. Sign up / Log in
3. Go to Dashboard
4. Try the AI Assistant
5. Ask a question about any subject

---

## 🎮 Using the Application

### For Students

1. **Sign Up** - Create free account
2. **Dashboard** - View your stats
3. **AI Assistant** - Ask questions
   - Select subject
   - Type your question
   - Get AI-powered answers
4. **Generate Exams** - Practice tests
5. **Track Progress** - See your improvement

### Available Features

✅ **Free Plan:**
- 10 questions per day
- 3 exams per day
- Basic subjects

✅ **Premium Plan:**
- Unlimited questions
- 20 exams per day
- All subjects
- Advanced analytics
- PDF export

---

## 🐛 Troubleshooting

### Backend Issues

**Model not loading:**
```bash
# Check model file exists
dir my_small_model\model.safetensors

# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r backend/requirements.txt --force-reinstall
```

**Port 8000 already in use:**
```bash
# Find and kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use different port in backend/app.py
```

### Frontend Issues

**Port 3000 in use:**
```bash
npm run kill-servers
npm start
```

**API connection failed:**
1. Make sure backend is running (http://localhost:8000/health)
2. Check .env has correct API URL
3. Clear browser cache
4. Restart both servers

### Integration Issues

**Frontend can't connect to backend:**

1. Check both servers are running
2. Verify CORS is configured (already set in backend)
3. Check browser console for errors
4. Verify API URL in .env: `REACT_APP_API_BASE_URL=http://localhost:8000`

**Slow AI responses:**

This is normal! CPU inference takes 2-5 seconds per request.

To speed up:
- Use GPU if available (install CUDA-enabled PyTorch)
- Reduce max_tokens in backend
- Use smaller model

---

## 📊 Performance Expectations

### CPU Inference (Your Current Setup)
- Question generation: 3-5 seconds
- Answer generation: 2-4 seconds
- Chat response: 2-3 seconds
- Exam generation (10 questions): 30-50 seconds

### GPU Inference (If You Have NVIDIA GPU)
- Question generation: 0.5-1 second
- Answer generation: 0.5-1 second
- Chat response: 0.5 second
- Exam generation (10 questions): 5-10 seconds

---

## 🚀 Production Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy build/ folder
```

### Backend (Railway/Render)
```bash
cd backend
# Deploy using platform-specific instructions
```

### Environment Variables (Production)

Frontend .env:
```env
REACT_APP_API_BASE_URL=https://your-backend-url.com
```

Backend .env:
```env
ALLOWED_ORIGINS=https://your-frontend-url.com
```

---

## 📞 Support & Contact

### Having Issues?

1. Check backend logs in terminal
2. Check browser console (F12)
3. Review this guide
4. Contact support

### Contact Information
- **Email:** ylikagwa@gmail.com
- **Phone/WhatsApp:** +265 880 646 248
- **Organization:** Fatty AI-Ed-Tech

---

## 📝 Development Workflow

### Daily Development

```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
npm run dev
```

### Before Committing

```bash
# Test frontend
npm run build

# Test backend
curl http://localhost:8000/health
```

---

## ✅ Checklist

Setup Complete When:

- [ ] Node.js and Python installed
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend dependencies installed (`pip install -r backend/requirements.txt`)
- [ ] Model file exists (`my_small_model/model.safetensors`)
- [ ] Backend starts successfully (http://localhost:8000)
- [ ] Frontend starts successfully (http://localhost:3000)
- [ ] Can sign up and log in
- [ ] AI Assistant responds to questions
- [ ] No console errors

---

## 🎉 You're All Set!

Your Exam AI Malawi application is now running with:
- ✅ React frontend (Port 3000)
- ✅ FastAPI backend (Port 8000)
- ✅ Your custom AI model (641MB SafeTensors)
- ✅ Full stack integration

**Start both servers and enjoy your AI-powered exam assistant!** 🚀

---

**Last Updated:** November 13, 2025  
**Version:** 1.0.0  
**Status:** Production Ready
