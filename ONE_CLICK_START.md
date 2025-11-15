# 🚀 ONE CLICK START - Exam AI Malawi

## 🎯 Quick Launch

### **Windows Users:**
```bash
# Double-click this file or run in terminal:
start-app.bat
```

### **Mac/Linux Users:**
```bash
# Run in terminal:
./start-app.sh
```

---

## ✨ What Happens Automatically:

### 🔍 **System Checks:**
- ✅ Verifies Node.js installation
- ✅ Verifies Python installation
- ✅ Checks for existing servers

### 📦 **Dependency Installation:**
- ✅ Installs frontend dependencies (`npm install`)
- ✅ Creates Python virtual environment
- ✅ Installs backend dependencies (`pip install -r requirements.txt`)

### 🚀 **Server Startup:**
- ✅ Starts AI Backend Server (Port 8000)
- ✅ Starts React Frontend (Port 3000)
- ✅ Opens application in browser
- ✅ Shows status and access points

---

## 📊 **Access Points After Startup:**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | `http://localhost:3000` | Main application |
| **Backend** | `http://localhost:8000` | AI API server |
| **Admin Panel** | `http://localhost:3000/admin` | Admin dashboard |
| **API Docs** | `http://localhost:8000/docs` | Backend API documentation |

---

## 🔧 **Admin Panel Features:**

### **Login:** `ylikagwa@gmail.com`

### **Features Available:**
- 📈 **User Analytics** - Track registrations, usage
- ⚡ **Model Performance** - Monitor AI response times
- 🤖 **Model Training** - Upload files, train AI
- 📁 **Training Data** - Manage stored data permanently
- 🔧 **System Health** - Monitor server status

---

## 💾 **Persistent Training Data:**

### **Data Storage:**
- ✅ **Permanent storage** in `my_small_model/training_data/`
- ✅ **Unique file IDs** for each uploaded file
- ✅ **Metadata tracking** (upload date, size, processing time)
- ✅ **Admin deletion control** - Only admin can delete

### **Data Management:**
- 📁 View all training files in "Training Data" tab
- ✅ Select multiple files for deletion
- 📊 Storage statistics and usage
- 🔍 File details and metadata

---

## 🛑 **How to Stop:**

### **Windows:**
- Close the backend and frontend terminal windows
- Or run: `taskkill /F /IM node.exe && taskkill /F /IM python.exe`

### **Mac/Linux:**
- Press `Ctrl+C` in the startup terminal
- Or run: `pkill -f "node.*start" && pkill -f "python.*app.py"`

---

## 🔧 **Troubleshooting:**

### **If startup fails:**

1. **Check Prerequisites:**
   ```bash
   node --version    # Should show v14+ 
   python --version  # Should show 3.8+
   ```

2. **Manual Installation:**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # OR
   venv\Scripts\activate     # Windows
   pip install -r requirements.txt
   ```

3. **Manual Start:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   source venv/bin/activate  # Linux/Mac
   python app.py
   
   # Terminal 2 - Frontend
   npm start
   ```

### **Common Issues:**

| Problem | Solution |
|---------|----------|
| Port 3000 in use | Kill existing Node processes |
| Port 8000 in use | Kill existing Python processes |
| Dependencies fail | Check internet connection, try manual install |
| Model not loading | Check `my_small_model/model.safetensors` exists |

---

## 📁 **Project Structure After Setup:**

```
Exam-AI-Mw Schools/
├── 🚀 start-app.bat          # Windows one-click start
├── 🚀 start-app.sh           # Mac/Linux one-click start
├── 📱 Frontend (Port 3000)
│   ├── src/components/AdminDashboard.js
│   ├── src/services/adminService.js
│   └── node_modules/
├── 🤖 Backend (Port 8000)
│   ├── app.py
│   ├── training_api.py
│   ├── requirements.txt
│   └── venv/
└── 🧠 AI Model
    ├── model.safetensors      # Your AI model (641 MB)
    ├── training_data/         # Persistent training files
    │   ├── data_20251113_*.txt
    │   └── data_index.json
    └── training_sessions/     # Training logs
```

---

## 🎯 **What You Can Do:**

### **As Regular User:**
- ✅ Register/Login to the application
- ✅ Ask AI questions in any subject
- ✅ Generate custom exams
- ✅ Track your learning progress
- ✅ View your statistics

### **As Admin (`ylikagwa@gmail.com`):**
- ✅ Monitor all user activity
- ✅ Track model performance
- ✅ Upload training files via file explorer
- ✅ Train AI with multithreading
- ✅ Manage training data permanently
- ✅ Delete selected training files
- ✅ View storage statistics
- ✅ Control system health

---

## 🔮 **Training Data Features:**

### **Permanent Storage:**
- 📁 Files stored in `my_small_model/training_data/`
- 🆔 Unique IDs for each file (e.g., `data_20251113_120530_1`)
- 📊 Metadata tracking (size, upload date, processing time)
- 🔒 Only admin can delete files

### **Admin Controls:**
- 📋 View all training files in "Training Data" tab
- ☑️ Select multiple files for deletion
- 🗑️ Bulk delete with confirmation
- 📈 Storage usage statistics
- 🔍 File details and metadata

### **Data Processing:**
- 🧹 Automatic data cleaning
- ✅ Content validation
- 🔄 Multithreaded processing (3 files at once)
- ⏱️ Real-time progress tracking
- 📝 Error logging and reporting

---

## 💡 **Tips:**

1. **First Run:** May take 2-3 minutes to install dependencies
2. **Subsequent Runs:** Start in ~10 seconds
3. **Training:** Upload .txt, .pdf, .doc files for best results
4. **Admin Access:** Use your email `ylikagwa@gmail.com`
5. **Data Persistence:** Training files are kept forever until manually deleted

---

## 📞 **Support:**

- **Email:** ylikagwa@gmail.com
- **Phone/WhatsApp:** +265 880 646 248
- **Organization:** Fatty AI-Ed-Tech

---

**🎉 Your One-Click Exam AI Malawi is Ready!**

**Just run:** `start-app.bat` (Windows) or `./start-app.sh` (Mac/Linux)

**Status:** ✅ Complete Implementation  
**Features:** ✅ Persistent Data + One-Click Start  
**Admin Panel:** ✅ Full Management Dashboard  

**Last Updated:** November 13, 2025
