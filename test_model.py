#!/usr/bin/env python3
"""
Quick test script to verify AI model is working
Run this to test the model before starting the full application
"""

import requests
import json
import time

def test_backend_health():
    """Test if backend is running and model is loaded"""
    try:
        print("🔍 Testing backend health...")
        response = requests.get("http://localhost:8000/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend is running!")
            print(f"   Model loaded: {data.get('modelLoaded', False)}")
            print(f"   Generator ready: {data.get('generatorReady', False)}")
            print(f"   Device: {data.get('device', 'unknown')}")
            print(f"   Status: {data.get('status', 'unknown')}")
            return data.get('ready', False)
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_ai_chat():
    """Test AI chat functionality"""
    try:
        print("\n🤖 Testing AI chat...")
        
        chat_data = {
            "message": "What is 2 + 2?",
            "conversation_history": [],
            "user_name": "Test User",
            "is_premium": False,
            "user_id": "test_123"
        }
        
        response = requests.post(
            "http://localhost:8000/api/chat", 
            json=chat_data,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ AI chat is working!")
            print(f"   Response: {data.get('response', 'No response')[:100]}...")
            return True
        else:
            print(f"❌ AI chat failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Chat test error: {e}")
        return False

def test_question_generation():
    """Test question generation"""
    try:
        print("\n📝 Testing question generation...")
        
        question_data = {
            "subject": "Mathematics",
            "topic": "Basic arithmetic",
            "difficulty": "easy",
            "question_type": "multiple choice"
        }
        
        response = requests.post(
            "http://localhost:8000/api/generate-question",
            json=question_data,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Question generation is working!")
            print(f"   Generated: {len(data.get('questions', []))} questions")
            return True
        else:
            print(f"❌ Question generation failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Question generation test error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Exam AI Malawi Backend...")
    print("=" * 50)
    
    # Test 1: Health check
    health_ok = test_backend_health()
    
    if not health_ok:
        print("\n❌ Backend is not ready. Please start the backend first:")
        print("   cd backend && python app.py")
        return
    
    # Test 2: AI Chat
    chat_ok = test_ai_chat()
    
    # Test 3: Question Generation
    question_ok = test_question_generation()
    
    # Summary
    print("\n" + "=" * 50)
    print("🧪 Test Results:")
    print(f"   Health Check: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"   AI Chat: {'✅ PASS' if chat_ok else '❌ FAIL'}")
    print(f"   Question Gen: {'✅ PASS' if question_ok else '❌ FAIL'}")
    
    if health_ok and chat_ok and question_ok:
        print("\n🎉 All tests passed! Your AI model is ready to use!")
        print("   You can now start the full application with start-app.bat")
    else:
        print("\n⚠️  Some tests failed. Check the backend console for errors.")
        print("   The app may still work with limited functionality.")

if __name__ == "__main__":
    main()
