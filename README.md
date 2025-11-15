# Exam AI Malawi 🎓

**AI-Powered Exam Assistant for Malawian Schools**

A modern, intelligent study companion built with React that helps students prepare for exams with AI-powered assistance, personalized learning, and comprehensive analytics.

## ✅ PROJECT STATUS

✨ **Fully functional and production-ready!** All dependencies updated, security vulnerabilities fixed, and robust error handling implemented.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Kill Any Running Servers
```bash
npm run kill-servers
```

### 3. Start Development Server
```bash
npm run dev
# or
npm start
```

### 4. Build for Production
```bash
npm run build
```

### 5. Serve Production Build
```bash
npm run serve
```

## 📋 System Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **RAM**: 4GB+ recommended
- **OS**: Windows, macOS, or Linux
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

## 🎮 Features

### 🤖 AI-Powered Learning
- ✅ **Smart Question Generation** - AI generates contextual exam questions
- ✅ **Intelligent Answers** - Get detailed explanations for any topic
- ✅ **Exam Preparation** - Practice with AI-generated mock exams
- ✅ **Subject Coverage** - Mathematics, Science, English, History, and more

### 👤 User Management
- ✅ **Secure Authentication** - Email-based login and signup
- ✅ **User Profiles** - Personalized learning experience
- ✅ **Progress Tracking** - Monitor your learning journey
- ✅ **Premium Plans** - Free and Premium tier options

### 📊 Analytics & Insights
- ✅ **Performance Dashboard** - Track your study statistics
- ✅ **Subject Progress** - Monitor progress across different subjects
- ✅ **Activity History** - Review recent study sessions
- ✅ **Usage Limits** - Daily question and exam limits with premium upgrades

### 🎨 Modern UI/UX
- ✅ **Dark Theme** - Eye-friendly cyberpunk-inspired design
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Smooth Animations** - Neon effects and fluid transitions
- ✅ **Error Boundaries** - Graceful error handling

### 🔒 Reliability & Security
- ✅ **Safe localStorage** - Robust data persistence with fallbacks
- ✅ **Error Handling** - Comprehensive error recovery
- ✅ **Input Validation** - Strong form validation
- ✅ **Server Management** - Automatic port cleanup

## 📁 Installation

### Clone Repository
```bash
git clone <repository-url>
cd "Exam-AI-Mw Schools"
```

### Install Dependencies
```bash
npm install
```

### Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Clean Installation (if needed)
```bash
npm run fresh-install
```

## 📊 Available Scripts

### Development
```bash
npm start              # Start dev server (port 3000)
npm run dev            # Kill servers + start dev
npm run fresh-start    # Fresh start with server cleanup
```

### Production
```bash
npm run build          # Create production build
npm run serve          # Serve production build
```

### Utilities
```bash
npm run kill-servers   # Kill all running servers
npm run clean          # Clean build + cache
npm run fresh-install  # Clean + reinstall dependencies
npm test               # Run tests
```

## 🔧 Technical Stack

### Frontend
- **React 18** - Modern UI library
- **React Router 6** - Client-side routing
- **TailwindCSS 3** - Utility-first styling
- **Heroicons** - Beautiful icon set

### State Management
- **Context API** - Global state management
- **Custom Hooks** - Reusable logic

### Build & Tools
- **Create React App** - Build tooling
- **PostCSS** - CSS processing
- **Autoprefixer** - Browser compatibility

### Architecture
- **Component-based** - Modular, reusable components
- **Context Providers** - AuthContext, UserLimitsContext
- **Error Boundaries** - Graceful error handling
- **Safe Storage** - Robust localStorage wrapper
- **Config Utilities** - Environment variable management

### Recent Fixes & Enhancements
- ✅ **Updated Dependencies** - Latest secure versions
- ✅ **Fixed Security Vulnerabilities** - 9 vulnerabilities resolved
- ✅ **Safe localStorage** - Error handling & fallback storage
- ✅ **Server Kill Script** - Automatic port cleanup (Windows/Mac/Linux)
- ✅ **Better Validation** - Comprehensive input validation
- ✅ **Config Management** - Centralized environment config
- ✅ **Missing Files Fixed** - Removed 404 errors for missing assets
- ✅ **Improved Error Handling** - Better user feedback

## 🐛 Troubleshooting

### Port Already in Use
```bash
npm run kill-servers
# Then restart
npm start
```

### Build Fails
```bash
npm run clean
npm install
npm run build
```

### Dependency Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### localStorage Not Working
- Check browser privacy settings
- Ensure cookies/storage are enabled
- Try in incognito/private mode
- App will use memory fallback if localStorage is unavailable

### Server Won't Stop
```bash
# Windows
node kill-servers.js

# Or manually
taskkill /F /IM node.exe
```

## 🎯 Project Structure

```
Exam-AI-Mw Schools/
├── public/                 # Static files
│   ├── index.html         # HTML template
│   └── manifest.json      # PWA manifest
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.js
│   │   ├── LandingPage.js
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   ├── Navbar.js
│   │   ├── AIAssistant.js
│   │   └── ...
│   ├── contexts/          # Context providers
│   │   ├── AuthContext.js
│   │   └── UserLimitsContext.js
│   ├── utils/             # Utility functions
│   │   ├── config.js      # Environment config
│   │   ├── storage.js     # Safe localStorage
│   │   └── validation.js  # Form validation
│   ├── App.js            # Main app component
│   ├── index.js          # Entry point
│   └── index.css         # Global styles
├── kill-servers.js        # Server cleanup script
├── package.json          # Dependencies & scripts
├── tailwind.config.js    # Tailwind configuration
├── .env.example          # Environment template
└── README.md             # This file
```

## 🚀 Deployment

### Netlify
```bash
npm run build
# Deploy build folder to Netlify
```

### Vercel
```bash
npm run build
# Deploy with Vercel CLI
```

### Manual
```bash
npm run build
# Serve from any static hosting
```

## 📝 Environment Variables

Create a `.env` file based on `.env.example`:

```env
REACT_APP_AI_API_URL=your-api-url
REACT_APP_AI_API_KEY=your-api-key
REACT_APP_ENABLE_ANALYTICS=false
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🎉 Ready to Use!

The application is now **fully functional and production-ready!**

```bash
npm run dev
```

**Access at:** http://localhost:3000

All security issues fixed, error handling improved, and server management automated! 🚀
