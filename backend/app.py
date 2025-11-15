"""
Exam AI Malawi - Backend API Server
FastAPI server to serve the language model for the React frontend
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import logging
import os
from pathlib import Path
import json
import time
import uvicorn
try:
    from training_api import start_model_training, get_training_status, stop_model_training, get_model_information, trainer
    TRAINING_API_AVAILABLE = True
    logger.info("✅ Training API imported successfully")
except ImportError as e:
    logger.warning(f"⚠️ Training API not available: {e}")
    TRAINING_API_AVAILABLE = False
    # Create dummy functions
    async def start_model_training(files_data): return {"success": False, "error": "Training API not available"}
    def get_training_status(): return {"is_training": False, "progress": 0}
    def stop_model_training(): return {"success": False, "error": "Training API not available"}
    def get_model_information(): return {"model_exists": False}
    trainer = None
from ai_tutor import process_ai_message

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Exam AI Malawi API",
    description="AI-powered exam assistant API for Malawian students",
    version="1.0.0"
)

# Configure CORS to allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:3000",
        "http://192.168.1.187:3000",  # Your network
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and tokenizer
model = None
tokenizer = None
generator = None

# Model configuration
MODEL_PATH = Path("../my_small_model").resolve()  # Use absolute path
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

class QuestionRequest(BaseModel):
    """Request model for question generation"""
    subject: str
    topic: str
    difficulty: str = "medium"
    question_type: str = "multiple_choice"
    num_questions: int = 1

class AnswerRequest(BaseModel):
    """Request model for answer generation"""
    question: str
    context: Optional[str] = None

class ExamRequest(BaseModel):
    """Request model for exam generation"""
    subject: str
    topics: List[str]
    num_questions: int = 10
    difficulty: str = "medium"

class ChatRequest(BaseModel):
    """Request model for chat/conversation"""
    message: str
    conversation_history: List[Dict[str, str]] = []
    user_name: Optional[str] = None
    is_premium: bool = False
    user_id: Optional[str] = None

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Server is running"}

@app.on_event("startup")
async def load_model():
    """Load the language model on startup"""
    global model, tokenizer, generator
    
    try:
        logger.info(f"Starting server...")
        logger.info(f"Model path: {MODEL_PATH}")
        logger.info(f"Using device: {DEVICE}")
        
        # Check if model directory exists
        if not MODEL_PATH.exists():
            logger.warning(f"Model directory not found at {MODEL_PATH}")
            logger.info("Server will start without custom model - using fallback")
        
        # Check if model file exists
        model_file = MODEL_PATH / "model.safetensors"
        config_file = MODEL_PATH / "config.json"
        
        logger.info(f"Checking for model files...")
        logger.info(f"Model file exists: {model_file.exists()}")
        logger.info(f"Config file exists: {config_file.exists()}")
        
        if not model_file.exists() and not config_file.exists():
            logger.warning(f"Custom model not found at {MODEL_PATH}")
            logger.info("Will use fallback GPT-2 model for immediate functionality")
        
        # Try to load tokenizer (might need to be downloaded)
        try:
            tokenizer = AutoTokenizer.from_pretrained(str(MODEL_PATH))
            logger.info("✅ Tokenizer loaded from local directory")
        except Exception as e:
            logger.warning(f"Could not load local tokenizer: {e}")
            # Fallback to GPT-2 tokenizer
            logger.info("Using GPT-2 tokenizer as fallback...")
            tokenizer = AutoTokenizer.from_pretrained("gpt2")
        
        # Load the model
        model_loaded = False
        
        # Try loading custom model first
        if model_file.exists() or config_file.exists():
            try:
                model = AutoModelForCausalLM.from_pretrained(
                    str(MODEL_PATH),
                    local_files_only=True,
                    torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32
                )
                model.to(DEVICE)
                model.eval()  # Set to evaluation mode
                logger.info("✅ Custom model loaded successfully!")
                model_loaded = True
            except Exception as e:
                logger.warning(f"Could not load custom model: {e}")
        
        # Fallback to GPT-2 if custom model not available or failed
        if not model_loaded:
            try:
                logger.info("Loading fallback GPT-2 model for immediate functionality...")
                model = AutoModelForCausalLM.from_pretrained("gpt2")
                model.to(DEVICE)
                model.eval()
                logger.info("✅ GPT-2 fallback model loaded successfully!")
                model_loaded = True
            except Exception as e:
                logger.error(f"Failed to load fallback model: {e}")
                raise e
        
        # Create text generation pipeline
        if model and tokenizer:
            generator = pipeline(
                "text-generation",
                model=model,
                tokenizer=tokenizer,
                device=0 if DEVICE == "cuda" else -1
            )
            logger.info("✅ Text generation pipeline created successfully!")
        else:
            logger.warning("⚠️ No model/tokenizer available - pipeline not created")
        
        logger.info("🚀 Model is ready to serve requests!")
        
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        logger.info("API will run without model. Please check model files.")

def get_real_analytics():
    """Get real analytics data from storage/database"""
    try:
        # In a real application, this would query a database
        # For now, we'll use a simple JSON file to store analytics
        analytics_file = Path("analytics_data.json")
        
        if analytics_file.exists():
            with open(analytics_file, 'r') as f:
                analytics = json.load(f)
        else:
            # Initialize with default values
            analytics = {
                "totalUsers": 0,
                "freeUsers": 0,
                "premiumUsers": 0,
                "totalQuestions": 0,
                "totalExams": 0,
                "averageScore": 0,
                "uptime": 0,
                "subjectUsage": {},
                "userActivity": []
            }
            # Save the initial file
            with open(analytics_file, 'w') as f:
                json.dump(analytics, f, indent=2)
        
        return analytics
    except Exception as e:
        logger.error(f"Error loading analytics: {e}")
        return {
            "totalUsers": 0,
            "freeUsers": 0,
            "premiumUsers": 0,
            "totalQuestions": 0,
            "totalExams": 0,
            "averageScore": 0,
            "uptime": 0,
            "subjectUsage": {},
            "userActivity": []
        }

def update_analytics(key, value):
    """Update analytics data"""
    try:
        analytics = get_real_analytics()
        analytics[key] = value
        
        analytics_file = Path("analytics_data.json")
        with open(analytics_file, 'w') as f:
            json.dump(analytics, f, indent=2)
        
        logger.info(f"Updated analytics: {key} = {value}")
    except Exception as e:
        logger.error(f"Error updating analytics: {e}")

def increment_analytics(key, increment=1):
    """Increment analytics counter"""
    try:
        analytics = get_real_analytics()
        analytics[key] = analytics.get(key, 0) + increment
        
        analytics_file = Path("analytics_data.json")
        with open(analytics_file, 'w') as f:
            json.dump(analytics, f, indent=2)
        
        logger.info(f"Incremented analytics: {key} += {increment}")
    except Exception as e:
        logger.error(f"Error incrementing analytics: {e}")

@app.get("/")
async def root():
    """Root endpoint"""
    model_status = "loaded" if model is not None else "not loaded"
    return {
        "message": "Exam AI Malawi API",
        "status": "online",
        "model_status": model_status,
        "device": DEVICE,
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Enhanced health check endpoint with real analytics"""
    model_loaded = model is not None
    generator_ready = generator is not None
    tokenizer_ready = tokenizer is not None
    
    # Get real analytics data from storage/database
    analytics = get_real_analytics()
    
    return {
        "status": "healthy" if model_loaded else "degraded",
        "online": True,
        "modelLoaded": model_loaded,
        "generatorReady": generator_ready,
        "tokenizerReady": tokenizer_ready,
        "device": DEVICE,
        "ready": model_loaded and generator_ready and tokenizer_ready,
        "timestamp": time.time(),
        # Real analytics data
        "totalUsers": analytics.get("totalUsers", 0),
        "freeUsers": analytics.get("freeUsers", 0),
        "premiumUsers": analytics.get("premiumUsers", 0),
        "totalQuestions": analytics.get("totalQuestions", 0),
        "totalExams": analytics.get("totalExams", 0),
        "averageScore": analytics.get("averageScore", 0),
        "uptime": analytics.get("uptime", 0),
        "subjectUsage": analytics.get("subjectUsage", {}),
        "userActivity": analytics.get("userActivity", [])
    }

@app.post("/api/generate-question")
async def generate_question(request: QuestionRequest):
    """Generate exam questions based on subject and topic"""
    if model is None or generator is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Create prompt for question generation
        prompt = f"""Generate a {request.difficulty} difficulty {request.question_type} question about {request.topic} in {request.subject}.

Question:"""
        
        # Generate text
        response = generator(
            prompt,
            max_new_tokens=150,
            num_return_sequences=1,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )
        
        generated_text = response[0]['generated_text']
        question_text = generated_text.replace(prompt, "").strip()
        
        return {
            "success": True,
            "question": question_text,
            "subject": request.subject,
            "topic": request.topic,
            "difficulty": request.difficulty
        }
        
    except Exception as e:
        logger.error(f"Error generating question: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/answer-question")
async def answer_question(request: AnswerRequest):
    """Answer a student's question"""
    if model is None or generator is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Create prompt for answer generation
        context_text = f"\nContext: {request.context}" if request.context else ""
        prompt = f"""Question: {request.question}{context_text}

Answer:"""
        
        # Generate answer
        response = generator(
            prompt,
            max_new_tokens=200,
            num_return_sequences=1,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )
        
        generated_text = response[0]['generated_text']
        answer_text = generated_text.replace(prompt, "").strip()
        
        return {
            "success": True,
            "question": request.question,
            "answer": answer_text
        }
        
    except Exception as e:
        logger.error(f"Error answering question: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-exam")
async def generate_exam(request: ExamRequest):
    """Generate a complete exam with multiple questions"""
    if model is None or generator is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        questions = []
        
        for i in range(request.num_questions):
            topic = request.topics[i % len(request.topics)]  # Rotate through topics
            
            prompt = f"""Generate exam question {i+1} about {topic} in {request.subject} ({request.difficulty} difficulty):

Question:"""
            
            response = generator(
                prompt,
                max_new_tokens=100,
                num_return_sequences=1,
                temperature=0.8,
                do_sample=True
            )
            
            question_text = response[0]['generated_text'].replace(prompt, "").strip()
            
            questions.append({
                "question_number": i + 1,
                "question": question_text,
                "topic": topic,
                "points": 10
            })
        
        return {
            "success": True,
            "exam": {
                "subject": request.subject,
                "difficulty": request.difficulty,
                "total_questions": len(questions),
                "total_points": len(questions) * 10,
                "questions": questions
            }
        }
        
    except Exception as e:
        logger.error(f"Error generating exam: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat with the AI tutor system"""
    try:
        # First, process the message through the AI tutor system
        tutor_response = process_ai_message(
            message=request.message,
            user_name=request.user_name,
            is_premium=request.is_premium,
            user_id=request.user_id,
            conversation_history=request.conversation_history
        )
        
        # If it's an educational question, also get AI model response
        if tutor_response["type"] == "educational" and model is not None and generator is not None:
            try:
                # Build conversation context for educational content
                conversation = ""
                if request.conversation_history:
                    for msg in request.conversation_history[-3:]:  # Last 3 messages
                        role = msg.get("role", "user")
                        content = msg.get("content", "")
                        conversation += f"{role.capitalize()}: {content}\n"
                
                # Create educational prompt focused on Malawian curriculum
                educational_prompt = f"""You are an AI tutor for Malawian educational curriculum. Answer this question with:
- Clear, simple explanations
- Relevant examples from Malawian context
- Step-by-step breakdown
- Ask if they understand

{conversation}Student: {request.message}
Tutor:"""
                
                # Generate response from AI model
                model_response = generator(
                    educational_prompt,
                    max_new_tokens=200,
                    num_return_sequences=1,
                    temperature=0.6,
                    top_p=0.8,
                    do_sample=True
                )
                
                generated_text = model_response[0]['generated_text']
                ai_content = generated_text.replace(educational_prompt, "").strip()
                
                # Combine tutor system response with AI model content
                if ai_content and len(ai_content) > 20:
                    # Replace the placeholder content in tutor response
                    enhanced_response = tutor_response["response"].replace(
                        "[This is where your AI model would generate the actual educational content based on the trained Malawian curriculum data]",
                        ai_content
                    )
                    tutor_response["response"] = enhanced_response
                    
            except Exception as model_error:
                logger.warning(f"AI model generation failed, using tutor system only: {model_error}")
        
        return {
            "success": True,
            "response": tutor_response["response"],
            "type": tutor_response["type"],
            "subject": tutor_response.get("subject"),
            "requires_followup": tutor_response.get("requires_followup", False),
            "user_weaknesses": tutor_response.get("user_weaknesses", []),
            "conversation_id": "default"
        }
        
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Training endpoints
class TrainingFileData(BaseModel):
    name: str
    content: str

class TextPasteData(BaseModel):
    name: str
    content: str
    contentType: str = "general"
    source: str = "text_paste"
    wordCount: Optional[int] = None
    size: int

class TrainingRequest(BaseModel):
    files: List[TrainingFileData]

@app.post("/api/admin/start-training")
async def start_training_endpoint(request: TrainingRequest):
    """Start model training with uploaded files"""
    try:
        files_data = [file.dict() for file in request.files]
        result = await start_model_training(files_data)
        return result
    except Exception as e:
        logger.error(f"Training start failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/training-status")
async def get_training_status_endpoint():
    """Get current training status"""
    try:
        status = await get_training_status()
        return status
    except Exception as e:
        logger.error(f"Failed to get training status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/stop-training")
async def stop_training_endpoint():
    """Stop current training process"""
    try:
        result = await stop_model_training()
        return result
    except Exception as e:
        logger.error(f"Failed to stop training: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/model-info")
async def get_model_info_endpoint():
    """Get model information and metadata"""
    try:
        result = get_model_information()
        
        # Add model name and additional info
        if model is not None:
            model_name = "Custom Exam AI Model"
            if hasattr(model, 'config') and hasattr(model.config, 'name_or_path'):
                model_name = model.config.name_or_path
            elif hasattr(model, 'name_or_path'):
                model_name = model.name_or_path
            
            # Check if it's the fallback GPT-2 model
            if "gpt2" in str(model_name).lower():
                model_name = "GPT-2 (Fallback Model)"
            elif "my_small_model" in str(model_name) or model_name == "Custom Exam AI Model":
                model_name = "Exam AI Malawi (Custom Model)"
            
            result.update({
                "model_name": model_name,
                "model_type": type(model).__name__,
                "device": str(DEVICE),
                "model_path": str(MODEL_PATH),
                "is_custom_model": "gpt2" not in str(model_name).lower(),
                "tokenizer_vocab_size": len(tokenizer) if tokenizer else 0,
            })
        else:
            result.update({
                "model_name": "No Model Loaded",
                "model_type": "None",
                "device": str(DEVICE),
                "model_path": str(MODEL_PATH),
                "is_custom_model": False,
                "tokenizer_vocab_size": 0,
            })
        
        return result
    except Exception as e:
        logger.error(f"Failed to get model info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/upload-training-files")
async def upload_training_files(files: List[UploadFile]):
    """Upload multiple training files with support for various formats"""
    try:
        file_data = []
        supported_formats = {'.txt', '.pdf', '.docx', '.doc', '.csv', '.xlsx', '.xls', 
                           '.json', '.xml', '.html', '.htm', '.md', '.rtf'}
        
        for file in files:
            # Check file format
            file_ext = Path(file.filename).suffix.lower()
            if file_ext not in supported_formats:
                logger.warning(f"Unsupported file format: {file.filename}")
                continue
            
            # Read file content as bytes
            content = await file.read()
            
            file_data.append({
                "name": file.filename,
                "content": content,  # Keep as bytes for proper processing
                "size": len(content),
                "format": file_ext,
                "contentType": "general"  # Default content type for file uploads
            })
        
        if not file_data:
            raise HTTPException(status_code=400, detail="No supported files found")
        
        # Start training process
        result = await trainer.train_model(file_data)
        
        return {
            "success": True,
            "message": f"Training started successfully with {len(file_data)} files",
            "session_id": result.get("session_id"),
            "files_processed": len(file_data),
            "supported_formats": list(supported_formats)
        }
        
    except Exception as e:
        logger.error(f"File upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/upload-text-content")
async def upload_text_content(text_data: TextPasteData):
    """Upload text content for training"""
    try:
        # Convert text data to file-like format
        file_data = [{
            "name": text_data.name,
            "content": text_data.content.encode('utf-8'),  # Convert to bytes
            "size": len(text_data.content.encode('utf-8')),
            "contentType": text_data.contentType,
            "source": text_data.source
        }]
        
        # Start training process
        result = await trainer.train_model(file_data)
        
        return {
            "success": True,
            "message": f"Text content added to training successfully",
            "session_id": result.get("session_id"),
            "content_type": text_data.contentType,
            "word_count": text_data.wordCount or len(text_data.content.split()),
            "files_processed": 1
        }
        
    except Exception as e:
        logger.error(f"Text content upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/training-data")
async def get_training_data_list():
    """Get list of all stored training data"""
    try:
        data_list = trainer.get_training_data_list()
        return {"success": True, "data": data_list}
    except Exception as e:
        logger.error(f"Failed to get training data list: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class DeleteDataRequest(BaseModel):
    file_ids: List[str]

@app.post("/api/admin/delete-training-data")
async def delete_training_data(request: DeleteDataRequest):
    """Delete selected training data files"""
    try:
        result = trainer.delete_training_data(request.file_ids)
        return result
    except Exception as e:
        logger.error(f"Failed to delete training data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/storage-stats")
async def get_storage_stats():
    """Get storage statistics for training data"""
    try:
        stats = trainer.get_storage_stats()
        return {"success": True, "stats": stats}
    except Exception as e:
        logger.error(f"Failed to get storage stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Live tracking and analytics endpoints
@app.get("/api/admin/live-stats")
async def get_live_stats():
    """Get real-time system statistics for live tracking"""
    try:
        # Get current system metrics
        stats = {
            "totalUsers": 0,  # This would come from your user database
            "freeUsers": 0,
            "premiumUsers": 0,
            "totalQuestions": 0,  # This would come from your analytics
            "totalExams": 0,
            "averageScore": 0,
            "modelPerformance": {
                "averageResponseTime": 0,
                "successRate": 100,
                "totalRequests": 0,
                "errorCount": 0,
            },
            "subjectUsage": {},  # This would come from your analytics
            "userActivity": [],  # Recent user activities
            "systemHealth": {
                "modelStatus": "healthy" if model is not None else "not_loaded",
                "lastModelUpdate": None,
                "datasetSize": 0,
            }
        }
        
        # Add training status
        training_status = get_training_status()
        stats["trainingStatus"] = training_status
        
        # Add model info
        model_info = get_model_information()
        stats["modelInfo"] = model_info
        
        return {"success": True, "data": stats}
    except Exception as e:
        logger.error(f"Failed to get live stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/system-health")
async def get_system_health():
    """Get detailed system health information"""
    try:
        health_data = {
            "status": "healthy",
            "uptime": time.time(),  # You'd calculate actual uptime
            "modelStatus": "loaded" if model is not None else "not_loaded",
            "trainingStatus": get_training_status(),
            "memoryUsage": 0,  # You'd get actual memory usage
            "diskUsage": 0,    # You'd get actual disk usage
            "lastCheck": time.time(),
        }
        return {"success": True, "data": health_data}
    except Exception as e:
        logger.error(f"Failed to get system health: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/user-analytics")
async def get_user_analytics():
    """Get user analytics for live tracking"""
    try:
        # This would integrate with your actual user analytics system
        analytics = {
            "activeUsers": 0,
            "newRegistrations": 0,
            "premiumUpgrades": 0,
            "userActivity": [],
            "popularSubjects": [],
            "usagePatterns": {},
        }
        return {"success": True, "data": analytics}
    except Exception as e:
        logger.error(f"Failed to get user analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
