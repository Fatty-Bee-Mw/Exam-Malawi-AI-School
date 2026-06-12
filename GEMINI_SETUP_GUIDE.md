# Gemini AI Integration Setup Guide

## ✅ Integration Complete!

All backend code has been updated to use Google's Gemini AI API with fallback to your local model.

## 📋 Setup Instructions

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key from Google AI Studio

### 2. Configure Environment Variables

Create or edit the `.env` file in the `backend` directory:

```bash
cd backend
```

Create `.env` file with:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Example:**
```env
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
```

### 3. Install Dependencies (Already Done)

The `google-generativeai` package has been installed.

### 4. Start the Backend Server

```bash
cd backend
python app.py
```

You should see:
```
✅ Gemini API configured successfully!
🚀 Model is ready to serve requests!
```

### 5. Test the Integration

Start your frontend:
```bash
npm run dev
```

Open http://localhost:3000 and try the AI chat. The system will now use Gemini API for:
- ✅ Chat responses
- ✅ Question generation
- ✅ Exam generation

## 🔍 How It Works

**Priority Order:**
1. **Gemini API** (if API key is configured) - Uses Google's advanced AI
2. **Local Model** (fallback) - Your custom GPT-2 model
3. **GPT-2 Fallback** - If custom model fails

**Benefits of Gemini:**
- Better educational content quality
- More accurate responses
- Multilingual support (great for Malawi)
- No local model management needed
- Faster response times

## 🧪 Testing

Test each feature:

1. **Chat:** Ask "What is photosynthesis?"
2. **Question Generation:** Generate a math question
3. **Exam Generation:** Create a science exam

Check backend logs for:
- `✅ Used Gemini API for educational response`
- `✅ Used Gemini API for question generation`
- `✅ Used Gemini API for exam question X`

## 🐛 Troubleshooting

**Gemini not working?**
- Check API key is correct in `.env`
- Verify you have internet connection
- Check backend logs for errors
- System will automatically fall back to local model

**API Key Issues:**
- Make sure no extra spaces in `.env`
- Set `GEMINI_MODEL=gemini-2.5-flash-lite` (do not use retired `gemini-pro`)
- Verify key is active in Google AI Studio

## 📊 Next Steps

After Gemini is working, we'll integrate PayChangu for payments!

## 📞 Support

If you need help:
- Email: ylikagwa@gmail.com
- Phone: +265 880 646 248
