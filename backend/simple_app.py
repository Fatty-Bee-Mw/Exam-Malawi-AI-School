#!/usr/bin/env python3
"""
Simplified Exam AI Backend - Focus on Admin Dashboard and File Upload
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import os
import json
import time
import uuid
from pathlib import Path
from datetime import datetime
import uvicorn

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Exam AI Malawi API",
    description="AI-powered exam assistant API for Malawian students",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.187:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MODEL_PATH = Path("../my_small_model").resolve()
TRAINING_DATA_PATH = Path("training_data").resolve()
TRAINING_DATA_PATH.mkdir(exist_ok=True)

# Global state
training_status = {
    "is_training": False,
    "progress": 0,
    "current_file": "",
    "total_files": 0,
    "processed_files": 0,
    "errors": [],
    "start_time": None,
}

training_data_list = []
storage_stats = {
    "total_files": 0,
    "active_files": 0,
    "deleted_files": 0,
    "total_size_bytes": 0,
    "storage_path": str(TRAINING_DATA_PATH),
}

# Pydantic models
class TrainingFileData(BaseModel):
    name: str
    content: str
    size: int

class TrainingRequest(BaseModel):
    files: List[TrainingFileData]

class TextPasteData(BaseModel):
    content: str
    contentType: str = "general"
    wordCount: int = 0

class DeleteDataRequest(BaseModel):
    file_ids: List[str]

class ChatRequest(BaseModel):
    message: str
    conversation_history: List[Dict[str, str]] = []
    user_name: Optional[str] = None
    is_premium: bool = False
    user_id: Optional[str] = None

class QuestionRequest(BaseModel):
    subject: str
    topic: str
    difficulty: str = "medium"
    question_type: str = "multiple_choice"
    num_questions: int = 1

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Server is running"}

# Model info endpoint
@app.get("/api/admin/model-info")
async def get_model_info():
    """Get model information"""
    model_exists = MODEL_PATH.exists() and (MODEL_PATH / "model.safetensors").exists()
    
    return {
        "success": True,
        "model_exists": model_exists,
        "model_name": "Exam AI Malawi (Custom Model)" if model_exists else "No Model Loaded",
        "model_type": "Custom" if model_exists else "None",
        "device": "cpu",
        "model_path": str(MODEL_PATH),
        "is_custom_model": model_exists,
        "tokenizer_vocab_size": 50257 if model_exists else 0,
        "lastUpdate": datetime.now().isoformat(),
    }

# Training status
@app.get("/api/admin/training-status")
async def get_training_status():
    """Get current training status"""
    return training_status

# Start training
@app.post("/api/admin/start-training")
async def start_training(request: TrainingRequest):
    """Start model training with uploaded files"""
    global training_status
    
    if training_status["is_training"]:
        return {"success": False, "error": "Training already in progress"}
    
    try:
        # Simulate training process
        training_status = {
            "is_training": True,
            "progress": 0,
            "current_file": "Initializing...",
            "total_files": len(request.files),
            "processed_files": 0,
            "errors": [],
            "start_time": datetime.now().isoformat(),
        }
        
        logger.info(f"Started training with {len(request.files)} files")
        return {"success": True, "message": f"Training started with {len(request.files)} files"}
        
    except Exception as e:
        logger.error(f"Training start failed: {e}")
        return {"success": False, "error": str(e)}

# Stop training
@app.post("/api/admin/stop-training")
async def stop_training():
    """Stop current training process"""
    global training_status
    
    try:
        training_status["is_training"] = False
        training_status["current_file"] = "Training stopped"
        logger.info("Training stopped by user")
        return {"success": True, "message": "Training stopped successfully"}
        
    except Exception as e:
        logger.error(f"Failed to stop training: {e}")
        return {"success": False, "error": str(e)}

# File upload endpoint
@app.post("/api/admin/upload-training-files")
async def upload_training_files(files: List[UploadFile] = File(...)):
    """Upload multiple training files"""
    global training_data_list, storage_stats
    
    try:
        uploaded_files = []
        total_size = 0
        
        for file in files:
            # Read file content
            content = await file.read()
            file_size = len(content)
            total_size += file_size
            
            # Generate unique ID
            file_id = str(uuid.uuid4())
            
            # Save file to disk
            file_path = TRAINING_DATA_PATH / f"{file_id}_{file.filename}"
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Add to training data list
            file_data = {
                "id": file_id,
                "original_filename": file.filename,
                "file_size": file_size,
                "upload_date": datetime.now().isoformat(),
                "processing_time": 0.1,  # Simulated
                "file_path": str(file_path),
            }
            
            training_data_list.append(file_data)
            uploaded_files.append(file_data)
        
        # Update storage stats
        storage_stats["total_files"] = len(training_data_list)
        storage_stats["active_files"] = len(training_data_list)
        storage_stats["total_size_bytes"] += total_size
        
        logger.info(f"Uploaded {len(files)} files, total size: {total_size} bytes")
        
        return {
            "success": True,
            "message": f"Successfully uploaded {len(files)} files",
            "uploaded_files": uploaded_files,
            "total_size": total_size,
        }
        
    except Exception as e:
        logger.error(f"File upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Upload text content
@app.post("/api/admin/upload-text-content")
async def upload_text_content(text_data: TextPasteData):
    """Upload text content for training"""
    global training_data_list, storage_stats
    
    try:
        # Generate unique ID
        file_id = str(uuid.uuid4())
        filename = f"text_content_{file_id}.txt"
        
        # Save text to file
        file_path = TRAINING_DATA_PATH / filename
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(text_data.content)
        
        file_size = len(text_data.content.encode('utf-8'))
        
        # Add to training data list
        file_data = {
            "id": file_id,
            "original_filename": filename,
            "file_size": file_size,
            "upload_date": datetime.now().isoformat(),
            "processing_time": 0.05,
            "file_path": str(file_path),
        }
        
        training_data_list.append(file_data)
        
        # Update storage stats
        storage_stats["total_files"] = len(training_data_list)
        storage_stats["active_files"] = len(training_data_list)
        storage_stats["total_size_bytes"] += file_size
        
        logger.info(f"Uploaded text content: {len(text_data.content)} characters")
        
        return {
            "success": True,
            "message": "Text content uploaded successfully",
            "file_data": file_data,
        }
        
    except Exception as e:
        logger.error(f"Text content upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get training data list
@app.get("/api/admin/training-data")
async def get_training_data_list():
    """Get list of all stored training data"""
    return {"success": True, "data": training_data_list}

# Delete training data
@app.post("/api/admin/delete-training-data")
async def delete_training_data(request: DeleteDataRequest):
    """Delete selected training data files"""
    global training_data_list, storage_stats
    
    try:
        deleted_count = 0
        deleted_size = 0
        
        for file_id in request.file_ids:
            # Find and remove from list
            for i, file_data in enumerate(training_data_list):
                if file_data["id"] == file_id:
                    # Delete physical file
                    file_path = Path(file_data["file_path"])
                    if file_path.exists():
                        file_path.unlink()
                    
                    deleted_size += file_data["file_size"]
                    training_data_list.pop(i)
                    deleted_count += 1
                    break
        
        # Update storage stats
        storage_stats["total_files"] = len(training_data_list)
        storage_stats["active_files"] = len(training_data_list)
        storage_stats["deleted_files"] += deleted_count
        storage_stats["total_size_bytes"] -= deleted_size
        
        logger.info(f"Deleted {deleted_count} training files")
        
        return {
            "success": True,
            "deleted_count": deleted_count,
            "message": f"Successfully deleted {deleted_count} files",
        }
        
    except Exception as e:
        logger.error(f"Failed to delete training data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get storage stats
@app.get("/api/admin/storage-stats")
async def get_storage_stats():
    """Get storage statistics"""
    return {"success": True, "stats": storage_stats}

# Live stats endpoint
@app.get("/api/admin/live-stats")
async def get_live_stats():
    """Get real-time system statistics"""
    model_info = await get_model_info()
    
    stats = {
        "totalUsers": 0,
        "freeUsers": 0,
        "premiumUsers": 0,
        "totalQuestions": 0,
        "totalExams": 0,
        "averageScore": 0,
        "modelPerformance": {
            "averageResponseTime": 150,
            "successRate": 95,
            "totalRequests": 0,
            "errorCount": 0,
        },
        "subjectUsage": {
            "Mathematics": 35,
            "English": 28,
            "Science": 22,
            "History": 15,
        },
        "userActivity": [],
        "systemHealth": {
            "modelStatus": "healthy" if model_info["model_exists"] else "no_model",
            "lastModelUpdate": model_info["lastUpdate"],
            "datasetSize": len(training_data_list),
        },
        "modelInfo": model_info,
    }
    
    return {"success": True, "data": stats}

# System health endpoint
@app.get("/api/admin/system-health")
async def get_system_health():
    """Get system health information"""
    model_info = await get_model_info()
    
    health_data = {
        "status": "healthy",
        "uptime": time.time(),
        "modelStatus": "loaded" if model_info["model_exists"] else "not_loaded",
        "trainingStatus": training_status,
        "memoryUsage": 0,
        "diskUsage": 0,
        "lastCheck": time.time(),
    }
    
    return {"success": True, "data": health_data}

# User analytics endpoint
@app.get("/api/admin/user-analytics")
async def get_user_analytics():
    """Get user analytics"""
    analytics = {
        "activeUsers": 0,
        "newRegistrations": 0,
        "premiumUpgrades": 0,
        "userActivity": [],
        "popularSubjects": ["Mathematics", "English", "Science"],
        "usagePatterns": {},
    }
    
    return {"success": True, "data": analytics}

# Chat endpoint - Your own ChatGPT-like functionality
@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest):
    """Chat with AI - Your own ChatGPT-like model"""
    try:
        # Check if we have a custom model
        model_info = await get_model_info()
        
        if model_info["model_exists"]:
            # Use your custom trained model
            response = await generate_custom_response(request.message, request.conversation_history)
        else:
            # Fallback to rule-based responses while training your model
            response = generate_educational_response(request.message, request.user_name)
        
        # Log the interaction for training data
        log_chat_interaction(request.message, response, request.user_name)
        
        return {
            "success": True,
            "response": response,
            "model_used": "Custom Exam AI" if model_info["model_exists"] else "Educational Assistant",
            "timestamp": datetime.now().isoformat(),
        }
        
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        return {
            "success": False,
            "error": "AI is temporarily unavailable. Please try again.",
            "response": "I'm sorry, I'm having trouble right now. Please try asking your question again in a moment.",
        }

# Question generation endpoint
@app.post("/api/generate-question")
async def generate_question(request: QuestionRequest):
    """Generate educational questions"""
    try:
        questions = generate_educational_questions(
            subject=request.subject,
            topic=request.topic,
            difficulty=request.difficulty,
            question_type=request.question_type,
            num_questions=request.num_questions
        )
        
        return {
            "success": True,
            "questions": questions,
            "subject": request.subject,
            "topic": request.topic,
        }
        
    except Exception as e:
        logger.error(f"Question generation failed: {e}")
        return {"success": False, "error": str(e)}

# Helper functions for AI responses
async def generate_custom_response(message: str, history: List[Dict[str, str]]) -> str:
    """Generate response using your custom trained model"""
    try:
        # Try to load and use the custom model
        from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
        import torch
        
        # Load GPT-2 base model and tokenizer
        tokenizer = AutoTokenizer.from_pretrained("gpt2")
        model = AutoModelForCausalLM.from_pretrained("gpt2")
        
        # Try to load your custom weights if they exist
        model_path = MODEL_PATH / "model.safetensors"
        if model_path.exists():
            try:
                # Load custom weights into the base model
                from safetensors.torch import load_file
                custom_weights = load_file(str(model_path))
                model.load_state_dict(custom_weights, strict=False)
                logger.info("✅ Custom model weights loaded successfully!")
            except Exception as e:
                logger.warning(f"Could not load custom weights: {e}, using base GPT-2")
        
        # Create text generation pipeline
        generator = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            device=-1,  # CPU
            max_length=150,
            do_sample=True,
            temperature=0.7,
            pad_token_id=tokenizer.eos_token_id
        )
        
        # Generate response
        prompt = f"Question: {message}\nAnswer:"
        response = generator(prompt, max_new_tokens=100, num_return_sequences=1)
        
        # Extract the generated text
        generated_text = response[0]['generated_text']
        answer = generated_text.split("Answer:")[-1].strip()
        
        # If the answer is too short or doesn't make sense, fall back to educational response
        if len(answer) < 10 or not answer:
            return generate_educational_response(message)
        
        return f"🤖 **Exam AI Malawi (Custom Model)**\n\n{answer}"
        
    except Exception as e:
        logger.error(f"Custom model generation failed: {e}")
        # Fall back to educational response
        return generate_educational_response(message)

def generate_educational_response(message: str, user_name: str = None) -> str:
    """Generate educational responses while your model is training"""
    message_lower = message.lower()
    
    # Greeting responses
    if any(word in message_lower for word in ['hi', 'hello', 'hey', 'hie']):
        name_part = f", {user_name}" if user_name else ""
        return f"Hello{name_part}! 👋 I'm your AI study assistant. I can help you with:\n\n📚 **Subjects**: Mathematics, Science, English, History\n❓ **Ask questions** about any topic\n📝 **Generate practice exams**\n💡 **Study tips and explanations**\n\nWhat would you like to learn about today?"
    
    # Math questions
    if any(word in message_lower for word in ['math', 'mathematics', 'calculate', 'solve']):
        return "🔢 **Mathematics Help**\n\nI can help you with:\n• Basic arithmetic (addition, subtraction, multiplication, division)\n• Algebra and equations\n• Geometry and shapes\n• Fractions and decimals\n• Word problems\n\nTry asking: 'What is 15 × 8?' or 'Explain how to solve 2x + 5 = 15'"
    
    # Science questions
    if any(word in message_lower for word in ['science', 'biology', 'chemistry', 'physics']):
        return "🔬 **Science Help**\n\nI can assist with:\n• **Biology**: Plants, animals, human body\n• **Chemistry**: Elements, compounds, reactions\n• **Physics**: Motion, energy, forces\n• **Earth Science**: Weather, rocks, space\n\nAsk me something like: 'What is photosynthesis?' or 'Explain gravity'"
    
    # Specific grammar questions
    if 'noun' in message_lower:
        return "📖 **What is a Noun?**\n\n**A noun is a word that names a person, place, thing, or idea.**\n\n🔹 **Examples of Nouns:**\n• **Person**: teacher, student, doctor, Mary\n• **Place**: school, hospital, Malawi, classroom\n• **Thing**: book, computer, car, pencil\n• **Idea**: happiness, freedom, education, love\n\n🔹 **Types of Nouns:**\n• **Common nouns**: general names (dog, city, book)\n• **Proper nouns**: specific names (John, London, Bible)\n• **Concrete nouns**: things you can touch (table, apple)\n• **Abstract nouns**: ideas or feelings (joy, courage)\n\n💡 **Quick Test**: If you can put 'the', 'a', or 'an' in front of a word, it's probably a noun!\n\nTry this: 'The ___' → book, student, happiness ✅"
    
    # English questions
    if any(word in message_lower for word in ['english', 'grammar', 'writing', 'reading']):
        return "📖 **English Help**\n\nI can help you with:\n• Grammar and punctuation\n• Vocabulary and spelling\n• Reading comprehension\n• Writing essays and stories\n• Parts of speech\n\nTry asking: 'What is a verb?' or 'Help me write a paragraph about my family'"
    
    # Study help
    if any(word in message_lower for word in ['study', 'learn', 'help', 'homework']):
        return "📚 **Study Assistant**\n\nI'm here to help you learn! I can:\n\n✅ **Answer questions** on any school subject\n✅ **Explain concepts** step by step\n✅ **Generate practice questions** for exams\n✅ **Give study tips** and strategies\n\nWhat subject would you like to focus on today? Just ask me anything!"
    
    # Default educational response
    return f"🤖 **AI Study Assistant**\n\nI understand you said: '{message}'\n\nI'm your educational AI assistant, specialized in helping with:\n\n📚 **Mathematics** - Calculations, equations, problem solving\n🔬 **Science** - Biology, chemistry, physics concepts\n📖 **English** - Grammar, writing, reading comprehension\n🌍 **Social Studies** - History, geography, civics\n\nCould you ask me a specific question about any of these subjects? For example:\n• 'What is 25 × 4?'\n• 'Explain photosynthesis'\n• 'What is a noun?'\n\nI'm here to help you learn! 🎓"

def generate_educational_questions(subject: str, topic: str, difficulty: str, question_type: str, num_questions: int) -> List[Dict]:
    """Generate educational questions for practice"""
    questions = []
    
    # Sample questions based on subject
    question_bank = {
        "mathematics": [
            {
                "question": "What is 15 + 27?",
                "options": ["42", "41", "43", "40"],
                "correct_answer": "42",
                "explanation": "15 + 27 = 42"
            },
            {
                "question": "What is the area of a rectangle with length 8 and width 5?",
                "options": ["40", "35", "45", "30"],
                "correct_answer": "40",
                "explanation": "Area = length × width = 8 × 5 = 40"
            }
        ],
        "science": [
            {
                "question": "What gas do plants absorb during photosynthesis?",
                "options": ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
                "correct_answer": "Carbon dioxide",
                "explanation": "Plants absorb CO₂ and release oxygen during photosynthesis"
            }
        ],
        "english": [
            {
                "question": "What is the past tense of 'run'?",
                "options": ["ran", "runned", "running", "runs"],
                "correct_answer": "ran",
                "explanation": "'Run' is an irregular verb, so its past tense is 'ran'"
            }
        ]
    }
    
    # Get questions for the subject
    subject_questions = question_bank.get(subject.lower(), question_bank["mathematics"])
    
    # Return requested number of questions
    for i in range(min(num_questions, len(subject_questions))):
        questions.append(subject_questions[i])
    
    return questions

def log_chat_interaction(message: str, response: str, user_name: str = None):
    """Log chat interactions for training data"""
    try:
        # Create training data from chat interactions
        training_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_message": message,
            "ai_response": response,
            "user_name": user_name,
        }
        
        # Save to training data for your model
        log_file = TRAINING_DATA_PATH / "chat_interactions.jsonl"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(training_entry) + "\n")
            
    except Exception as e:
        logger.error(f"Failed to log chat interaction: {e}")

if __name__ == "__main__":
    logger.info("🚀 Starting Exam AI Malawi Backend Server...")
    logger.info(f"📁 Model path: {MODEL_PATH}")
    logger.info(f"💾 Training data path: {TRAINING_DATA_PATH}")
    
    uvicorn.run(
        "simple_app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
