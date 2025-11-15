# 🚀 Deployment Guide - Exam AI Malawi

## 📋 Overview

This guide covers deploying the Exam AI Malawi application to various platforms including Netlify, Vercel, and other hosting services.

---

## 🎯 Deployment Options

### **Option 1: Netlify (Recommended for Frontend)**
- ✅ **Best for:** Frontend-only deployment with serverless functions
- ✅ **Features:** Automatic builds, custom domains, form handling
- ✅ **Cost:** Free tier available

### **Option 2: Vercel (Alternative Frontend)**
- ✅ **Best for:** React applications with API routes
- ✅ **Features:** Edge functions, automatic deployments
- ✅ **Cost:** Free tier available

### **Option 3: Full-Stack Deployment**
- ✅ **Frontend:** Netlify/Vercel
- ✅ **Backend:** Railway, Render, or Heroku
- ✅ **AI Model:** Hugging Face Spaces or dedicated server

---

## 🔧 Pre-Deployment Setup

### **1. Environment Configuration**

Create `.env.production` file:
```bash
# Frontend Environment Variables
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0

# Backend Environment Variables (for backend deployment)
MODEL_PATH=./my_small_model
CORS_ORIGINS=https://your-frontend-url.com
PORT=8000
```

### **2. Build Configuration**

Update `package.json` scripts:
```json
{
  "scripts": {
    "build": "react-scripts build",
    "build:production": "REACT_APP_API_URL=https://your-api.com npm run build",
    "deploy:netlify": "npm run build && netlify deploy --prod",
    "deploy:vercel": "npm run build && vercel --prod"
  }
}
```

---

## 🌐 Frontend Deployment

### **Netlify Deployment**

#### **Method 1: Drag & Drop**
1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag the `build` folder to deploy
   - Configure custom domain if needed

#### **Method 2: Git Integration**
1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Link GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Add environment variables

#### **Method 3: Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=build
```

### **Vercel Deployment**

#### **Method 1: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### **Method 2: Git Integration**
1. **Push to GitHub**
2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Configure build settings
   - Deploy

---

## 🤖 Backend Deployment Options

### **Option 1: Railway (Recommended)**

1. **Create `railway.json`:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "startCommand": "python app.py",
    "healthcheckPath": "/health"
  }
}
```

2. **Create `Dockerfile`:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ .
COPY my_small_model/ ./my_small_model/

# Expose port
EXPOSE 8000

# Start application
CMD ["python", "app.py"]
```

3. **Deploy:**
   - Connect GitHub to Railway
   - Configure environment variables
   - Deploy automatically

### **Option 2: Render**

1. **Create `render.yaml`:**
```yaml
services:
  - type: web
    name: exam-ai-backend
    env: python
    buildCommand: "pip install -r backend/requirements.txt"
    startCommand: "cd backend && python app.py"
    envVars:
      - key: PORT
        value: 8000
      - key: MODEL_PATH
        value: ./my_small_model
```

### **Option 3: Heroku**

1. **Create `Procfile`:**
```
web: cd backend && python app.py
```

2. **Create `runtime.txt`:**
```
python-3.9.18
```

3. **Deploy:**
```bash
heroku create exam-ai-malawi
heroku config:set MODEL_PATH=./my_small_model
git push heroku main
```

---

## 🧠 AI Model Deployment

### **Option 1: Include in Backend**
- ✅ **Pros:** Simple deployment, no external dependencies
- ❌ **Cons:** Large deployment size, slower builds

### **Option 2: Hugging Face Model Hub**
```python
# Update backend to load from Hugging Face
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "your-username/exam-ai-malawi"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)
```

### **Option 3: External Model Server**
- Deploy model to dedicated GPU server
- Use API calls from backend
- Better performance for large models

---

## 📁 File Structure for Deployment

```
exam-ai-malawi/
├── 📱 Frontend Files
│   ├── public/
│   ├── src/
│   ├── build/                 # Generated after npm run build
│   ├── package.json
│   ├── netlify.toml          # Netlify configuration
│   └── vercel.json           # Vercel configuration
│
├── 🤖 Backend Files
│   ├── backend/
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   ├── training_api.py
│   │   ├── ai_tutor.py
│   │   └── file_processors.py
│   ├── my_small_model/       # AI model files
│   ├── Dockerfile            # For containerized deployment
│   └── railway.json          # Railway configuration
│
└── 📋 Deployment Files
    ├── .env.production
    ├── DEPLOYMENT_GUIDE.md
    └── docker-compose.yml     # For local testing
```

---

## 🔧 Environment Variables

### **Frontend Variables**
```bash
REACT_APP_API_URL=https://your-backend.railway.app
REACT_APP_ENVIRONMENT=production
REACT_APP_ADMIN_EMAIL=ylikagwa@gmail.com
```

### **Backend Variables**
```bash
# Server Configuration
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=https://your-frontend.netlify.app

# Model Configuration
MODEL_PATH=./my_small_model
MAX_TOKENS=512
TEMPERATURE=0.7

# File Processing
MAX_FILE_SIZE=10485760  # 10MB
SUPPORTED_FORMATS=.txt,.pdf,.docx,.csv,.xlsx,.json,.xml,.html,.md

# Training Configuration
MAX_TRAINING_FILES=50
TRAINING_DATA_PATH=./my_small_model/training_data
```

---

## 🚀 Deployment Steps

### **Step 1: Prepare Frontend**
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test build locally
npx serve -s build
```

### **Step 2: Deploy Frontend**
```bash
# Option A: Netlify
netlify deploy --prod --dir=build

# Option B: Vercel
vercel --prod
```

### **Step 3: Deploy Backend**
```bash
# Option A: Railway
# Push to GitHub and connect to Railway

# Option B: Render
# Connect GitHub repository to Render

# Option C: Heroku
heroku create your-app-name
git push heroku main
```

### **Step 4: Configure Environment**
- Set environment variables in hosting platform
- Update CORS origins
- Test API endpoints

### **Step 5: Test Deployment**
- Test frontend functionality
- Verify API connections
- Test file uploads
- Check AI responses
- Validate admin panel

---

## 🔍 Deployment Checklist

### **Pre-Deployment**
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Build process tested locally
- [ ] API endpoints working
- [ ] File upload functionality tested
- [ ] AI model responses verified

### **Frontend Deployment**
- [ ] Build successful
- [ ] Static files served correctly
- [ ] Routing works (SPA configuration)
- [ ] Environment variables loaded
- [ ] API calls reach backend

### **Backend Deployment**
- [ ] Server starts successfully
- [ ] Health check endpoint responds
- [ ] CORS configured correctly
- [ ] File uploads work
- [ ] AI model loads properly
- [ ] Database/storage accessible

### **Post-Deployment**
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Performance monitoring setup
- [ ] Error logging configured
- [ ] Backup strategy implemented

---

## 🛠️ Troubleshooting

### **Common Frontend Issues**

#### **Build Failures**
```bash
# Clear cache and rebuild
npm run build -- --reset-cache

# Check for missing dependencies
npm audit fix
```

#### **Routing Issues**
- Ensure `netlify.toml` or `vercel.json` has SPA redirects
- Check `public/_redirects` file for Netlify

#### **API Connection Issues**
- Verify `REACT_APP_API_URL` is correct
- Check CORS configuration on backend
- Test API endpoints directly

### **Common Backend Issues**

#### **Model Loading Failures**
```python
# Add error handling for model loading
try:
    model = AutoModelForCausalLM.from_pretrained(MODEL_PATH)
except Exception as e:
    logger.error(f"Model loading failed: {e}")
    # Fallback to smaller model or error response
```

#### **File Upload Issues**
- Check file size limits
- Verify supported file formats
- Test file processing locally

#### **Memory Issues**
- Reduce model size for deployment
- Implement model quantization
- Use CPU-only inference if needed

---

## 📊 Performance Optimization

### **Frontend Optimization**
```bash
# Analyze bundle size
npm run build -- --analyze

# Optimize images
npm install --save-dev imagemin-webpack-plugin

# Enable compression
# Add to netlify.toml or vercel.json
```

### **Backend Optimization**
```python
# Model quantization
from transformers import AutoModelForCausalLM
import torch

model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    torch_dtype=torch.float16,  # Use half precision
    device_map="auto"
)
```

---

## 🔐 Security Considerations

### **Frontend Security**
- Environment variables for sensitive data
- Content Security Policy headers
- HTTPS enforcement

### **Backend Security**
- Input validation and sanitization
- Rate limiting for API endpoints
- Secure file upload handling
- Authentication for admin endpoints

---

## 📈 Monitoring & Analytics

### **Frontend Monitoring**
- Google Analytics integration
- Error tracking with Sentry
- Performance monitoring

### **Backend Monitoring**
- Health check endpoints
- Logging and error tracking
- Performance metrics
- Usage analytics

---

## 💰 Cost Estimation

### **Free Tier Limits**
- **Netlify:** 100GB bandwidth, 300 build minutes
- **Vercel:** 100GB bandwidth, 6000 serverless function executions
- **Railway:** $5/month after free trial
- **Render:** Free tier with limitations

### **Scaling Considerations**
- Monitor usage and upgrade plans as needed
- Consider CDN for static assets
- Optimize for cost-effective scaling

---

## 📞 Support & Maintenance

### **Deployment Support**
- **Email:** ylikagwa@gmail.com
- **Phone/WhatsApp:** +265 880 646 248
- **Organization:** Fatty AI-Ed-Tech

### **Maintenance Tasks**
- Regular dependency updates
- Security patches
- Performance monitoring
- Backup verification
- User feedback integration

---

**🎉 Your Exam AI Malawi is Ready for Production!**

**Deployment Options:** ✅ Netlify + Railway (Recommended)  
**Features:** ✅ Voice Input + Multi-Format Training + Intelligent Tutoring  
**Scalability:** ✅ Cloud-ready with monitoring and analytics  

**Status:** 🚀 Production-Ready Deployment Guide Complete!

**Last Updated:** November 13, 2025  
**By:** Fatty AI-Ed-Tech
