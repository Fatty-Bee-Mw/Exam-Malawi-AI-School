# Exam AI Malawi - Backend API

FastAPI backend server that serves the language model for the Exam AI Malawi React application.

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Verify Model Files

Ensure your model is in the correct location:
```
Exam-AI-Mw Schools/
├── my_small_model/
│   └── model.safetensors  ✅ (Your model file)
└── backend/
    ├── app.py
    └── requirements.txt
```

### 3. Start the Server

```bash
python app.py
```

Or with uvicorn directly:
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at: **http://localhost:8000**

---

## 📋 API Endpoints

### Health Check
```bash
GET /health
```

### Generate Question
```bash
POST /api/generate-question
Content-Type: application/json

{
  "subject": "Mathematics",
  "topic": "Algebra",
  "difficulty": "medium",
  "question_type": "multiple_choice",
  "num_questions": 1
}
```

### Answer Question
```bash
POST /api/answer-question
Content-Type: application/json

{
  "question": "What is the quadratic formula?",
  "context": "Mathematics - Algebra"
}
```

### Generate Exam
```bash
POST /api/generate-exam
Content-Type: application/json

{
  "subject": "Science",
  "topics": ["Biology", "Chemistry", "Physics"],
  "num_questions": 10,
  "difficulty": "medium"
}
```

### Chat with AI
```bash
POST /api/chat
Content-Type: application/json

{
  "message": "Explain photosynthesis",
  "conversation_history": []
}
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Settings
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development

# Model Settings
MODEL_PATH=../my_small_model
DEVICE=auto  # auto, cpu, or cuda

# API Settings
MAX_TOKENS=200
TEMPERATURE=0.7
TOP_P=0.9
```

---

## 🖥️ System Requirements

### Minimum Requirements
- Python 3.8+
- 4GB RAM (for CPU inference)
- 2GB free disk space

### Recommended Requirements
- Python 3.10+
- 8GB+ RAM
- NVIDIA GPU with 4GB+ VRAM (for faster inference)
- CUDA 11.8+ (if using GPU)

---

## 🐛 Troubleshooting

### Model Not Loading

If you see "Model not loaded" errors:

1. **Check model file exists:**
   ```bash
   ls ../my_small_model/model.safetensors
   ```

2. **Install required dependencies:**
   ```bash
   pip install torch transformers safetensors
   ```

3. **Check Python version:**
   ```bash
   python --version  # Should be 3.8+
   ```

### CUDA/GPU Issues

If you want to use GPU but it's not detected:

```bash
# Check if CUDA is available
python -c "import torch; print(torch.cuda.is_available())"

# Install CUDA-enabled PyTorch
pip install torch --index-url https://download.pytorch.org/whl/cu118
```

### Port Already in Use

If port 8000 is already in use:

```bash
# Option 1: Kill process on port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Option 2: Use different port
uvicorn app:app --port 8001
```

---

## 📊 Model Information

### Your Model
- **File:** `model.safetensors` (641 MB)
- **Format:** SafeTensors (secure, fast loading)
- **Estimated Size:** Small Language Model (~355M-774M parameters)
- **Likely Model:** GPT-2 Medium or similar

### Supported Model Formats
- ✅ SafeTensors (.safetensors)
- ✅ PyTorch (.bin, .pt)
- ✅ Hugging Face models

---

## 🔄 Development

### Run with Auto-Reload
```bash
uvicorn app:app --reload
```

### View API Documentation
Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

---

## 🚢 Production Deployment

### Using Gunicorn (Recommended)
```bash
pip install gunicorn
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Using Docker
```bash
# Build image
docker build -t exam-ai-backend .

# Run container
docker run -p 8000:8000 exam-ai-backend
```

---

## 📝 Notes

### Model Loading
- The server tries to load your local model first
- If model loading fails, it falls back to base GPT-2
- First startup may take 1-2 minutes to load the model

### Performance
- **CPU:** 2-5 seconds per request
- **GPU:** 0.5-1 second per request
- Responses are generated in real-time

### Memory Usage
- Model: ~1.5GB RAM
- Server: ~500MB RAM
- Total: ~2GB RAM minimum

---

## 🤝 Integration with React Frontend

The React app is pre-configured to connect to this API at `http://localhost:8000`.

Make sure both servers are running:
1. **Backend:** `python app.py` (Port 8000)
2. **Frontend:** `npm start` (Port 3000)

---

## 📞 Support

For issues or questions:
- **Email:** ylikagwa@gmail.com
- **Phone/WhatsApp:** +265 880 646 248
- **Organization:** Fatty AI-Ed-Tech

---

**Status:** ✅ Ready for Development  
**Last Updated:** November 13, 2025
