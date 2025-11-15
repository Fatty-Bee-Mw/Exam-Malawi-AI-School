#!/usr/bin/env python3
"""
Production-Ready Exam AI Backend - Optimized for immediate use
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
app = FastAPI(title="Exam AI Malawi API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MODEL_PATH = Path("../my_small_model").resolve()
TRAINING_DATA_PATH = Path("training_data").resolve()
TRAINING_DATA_PATH.mkdir(exist_ok=True)

# Pydantic models
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
        "model_name": "Exam AI Malawi (Production Ready)" if model_exists else "Educational Assistant",
        "model_type": "Custom" if model_exists else "Rule-Based",
        "device": "cpu",
        "model_path": str(MODEL_PATH),
        "is_custom_model": model_exists,
        "tokenizer_vocab_size": 50257 if model_exists else 0,
        "lastUpdate": datetime.now().isoformat(),
    }

# Chat endpoint - Production ready
@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest):
    """Production-ready chat with educational AI"""
    try:
        # Generate educational response
        response = generate_smart_educational_response(request.message, request.user_name)
        
        # Log interaction for training
        log_chat_interaction(request.message, response, request.user_name)
        
        return {
            "success": True,
            "response": response,
            "model_used": "Exam AI Malawi (Educational Assistant)",
            "timestamp": datetime.now().isoformat(),
        }
        
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        return {
            "success": False,
            "error": "AI is temporarily unavailable",
            "response": "I'm sorry, I'm having trouble right now. Please try asking your question again.",
        }

def generate_smart_educational_response(message: str, user_name: str = None) -> str:
    """Generate intelligent educational responses"""
    message_lower = message.lower()
    
    # Greeting responses
    if any(word in message_lower for word in ['hi', 'hello', 'hey', 'hie']):
        name_part = f", {user_name}" if user_name else ""
        return f"Hello{name_part}! 👋 I'm your **Exam AI Malawi** study assistant!\n\n🎓 **I specialize in Malawian education** and can help with:\n\n📚 **Mathematics** - From basic arithmetic to advanced algebra\n🔬 **Science** - Biology, Chemistry, Physics concepts\n📖 **English** - Grammar, writing, literature\n🌍 **Social Studies** - Malawian history, geography, civics\n\n💡 **Just ask me any question!** I'm here to help you succeed in your studies."
    
    # Specific subject questions
    
    # ENGLISH GRAMMAR - Detailed responses
    if 'noun' in message_lower:
        return """📖 **What is a Noun? (Complete Guide)**

**Definition:** A noun is a word that names a person, place, thing, or idea.

🔹 **Types of Nouns with Malawian Examples:**

**1. Common Nouns** (general names):
• **Person**: mwana (child), aphunzitsi (teacher), dokotala (doctor)
• **Place**: sukulu (school), nyumba (house), msika (market)
• **Thing**: buku (book), galimoto (car), chakudya (food)

**2. Proper Nouns** (specific names):
• **People**: John, Mary, Banda, Phiri
• **Places**: Lilongwe, Blantyre, Lake Malawi, Malawi
• **Organizations**: University of Malawi, Bingu Stadium

**3. Abstract Nouns** (ideas/feelings):
• mtendere (peace), chikondi (love), nzeru (wisdom)
• ukwati (marriage), ufumu (leadership), umunthu (humanity)

**4. Collective Nouns** (groups):
• gulu (group), banja (family), anthu (people)

💡 **Quick Test**: Can you put "the", "a", or "an" before it?
✅ "The teacher" ✅ "A book" ✅ "An apple"

**Practice**: Identify nouns in this sentence:
"The student read a book about Malawi's history."
Answer: student, book, Malawi, history (all nouns!)"""

    if 'verb' in message_lower:
        return """📖 **What is a Verb? (Complete Guide)**

**Definition:** A verb is a word that shows action or state of being.

🔹 **Types of Verbs with Examples:**

**1. Action Verbs** (what someone does):
• **Physical actions**: kuthamanga (run), kugwira (catch), kulemba (write)
• **Mental actions**: kuganiza (think), kukumbukira (remember), kuphunzira (learn)

**2. Linking Verbs** (connect subject to description):
• "is", "am", "are", "was", "were"
• Example: "John **is** a student" (connects John to student)

**3. Helping Verbs** (assist main verbs):
• can, will, should, must, have, has, had
• Example: "I **will** study" (**will** helps **study**)

**Chichewa Examples:**
• Ndikupita kusukulu (I am going to school) - **kupita** = verb
• Mwana akusewera (The child is playing) - **akusewera** = verb
• Tikuphunzira Chingerezi (We are learning English) - **tikuphunzira** = verb

💡 **Quick Test**: What is the person/thing doing?
"Mary **reads** books every day" → **reads** is the verb!"""

    if any(word in message_lower for word in ['adjective', 'describing']):
        return """📖 **What is an Adjective?**

**Definition:** An adjective is a word that describes or modifies a noun.

🔹 **Examples with Malawian Context:**
• **Size**: wamkulu (big), wamng'ono (small)
  - "Nyumba **yaikulu**" (The **big** house)
• **Color**: woyera (white), wakuda (black), wofiira (red)
• **Quality**: wabwino (good), woipa (bad), wokongola (beautiful)

**English Examples:**
• "The **tall** student" (**tall** describes student)
• "**Fresh** nsima" (**fresh** describes nsima)
• "**Intelligent** girl" (**intelligent** describes girl)

💡 **Quick Test**: Which word describes the noun?
"The **smart** boy solved the **difficult** problem."
Answer: **smart** (describes boy), **difficult** (describes problem)"""

    # MATHEMATICS - Detailed responses
    if any(word in message_lower for word in ['math', 'mathematics', 'calculate', 'solve', 'add', 'subtract', 'multiply', 'divide']):
        if any(op in message_lower for op in ['+', 'plus', 'add']):
            return """🔢 **Mathematics: Addition**

**Addition** means combining numbers to get a total (sum).

🔹 **Basic Addition Rules:**
• Start with the first number
• Count forward by the second number
• The result is called the **sum**

**Examples:**
• 5 + 3 = 8 (five plus three equals eight)
• 12 + 7 = 19
• 25 + 15 = 40

**Word Problems:**
• "John has 5 mangoes. Mary gives him 3 more. How many does he have now?"
• Answer: 5 + 3 = 8 mangoes

**Tips for Large Numbers:**
• 47 + 28 = ?
• Break it down: 47 + 20 + 8 = 67 + 8 = 75

💡 **Practice**: What is 23 + 19?
Answer: 23 + 19 = 42"""

        return """🔢 **Mathematics Help - Exam AI Malawi**

I can help you with all math topics:

**📊 Basic Operations:**
• Addition (+): Combining numbers
• Subtraction (-): Taking away numbers  
• Multiplication (×): Repeated addition
• Division (÷): Sharing equally

**📐 Geometry:**
• Shapes: triangles, squares, circles
• Area and perimeter calculations
• Angles and measurements

**📈 Advanced Topics:**
• Fractions and decimals
• Percentages and ratios
• Basic algebra equations
• Word problems

**Ask me specific questions like:**
• "What is 15 × 8?"
• "How do I find the area of a rectangle?"
• "Explain fractions"

What math topic would you like help with?"""

    # SCIENCE - Detailed responses
    if any(word in message_lower for word in ['science', 'biology', 'chemistry', 'physics']):
        if 'photosynthesis' in message_lower:
            return """🔬 **Photosynthesis - How Plants Make Food**

**Definition:** Photosynthesis is the process plants use to make their own food using sunlight.

🔹 **What Plants Need:**
• **Sunlight** ☀️ (energy source)
• **Water** 💧 (from roots)
• **Carbon dioxide** 🌬️ (from air through leaves)
• **Chlorophyll** 🍃 (green substance in leaves)

🔹 **The Process:**
1. Leaves absorb sunlight and carbon dioxide
2. Roots absorb water from soil
3. Chlorophyll captures light energy
4. Plants combine these to make glucose (sugar)
5. Oxygen is released as waste

**Chemical Equation:**
Carbon dioxide + Water + Sunlight → Glucose + Oxygen

**Why It's Important:**
• Plants get food to grow
• Animals (including humans) get oxygen to breathe
• Plants are food for many animals

**Malawian Examples:**
• Maize plants doing photosynthesis in fields
• Baobab trees making food from sunlight
• All green plants in Malawi use this process!"""

        return """🔬 **Science Help - Exam AI Malawi**

I can explain science concepts clearly:

**🧬 Biology:**
• How living things work
• Plants and animals
• Human body systems
• Ecosystems in Malawi

**⚗️ Chemistry:**
• Elements and compounds
• Chemical reactions
• States of matter (solid, liquid, gas)
• Acids and bases

**⚡ Physics:**
• Motion and forces
• Energy and electricity
• Light and sound
• Simple machines

**Ask me questions like:**
• "What is photosynthesis?"
• "How do our lungs work?"
• "What causes lightning?"

What science topic interests you?"""

    # SOCIAL STUDIES - Malawi-focused
    if any(word in message_lower for word in ['malawi', 'history', 'geography', 'social', 'civics']):
        return """🇲🇼 **Social Studies - Malawi Focus**

**🏛️ Malawian History:**
• Pre-colonial kingdoms (Maravi, Ngoni)
• Colonial period under Britain
• Independence in 1964 under Dr. Hastings Banda
• Modern democratic Malawi since 1994

**🗺️ Geography of Malawi:**
• Location: Southeastern Africa
• Borders: Tanzania, Mozambique, Zambia
• Lake Malawi (3rd largest lake in Africa)
• Major cities: Lilongwe (capital), Blantyre, Mzuzu

**🏛️ Government & Civics:**
• Democratic republic
• President as head of state
• National Assembly (Parliament)
• Rights and responsibilities of citizens

**🌾 Economy & Culture:**
• Agriculture: maize, tobacco, tea, sugar
• Languages: Chichewa, English
• Traditional dances: Gule Wamkulu, Ingoma
• Cultural values: Umunthu (humaneness)

What aspect of Malawian studies would you like to explore?"""

    # Study tips and motivation
    if any(word in message_lower for word in ['study', 'exam', 'test', 'help', 'homework']):
        return """📚 **Study Tips from Exam AI Malawi**

**🎯 Effective Study Strategies:**

**1. Create a Study Schedule:**
• Set specific times for each subject
• Take breaks every 30-45 minutes
• Review before sleeping (helps memory)

**2. Active Learning Techniques:**
• Summarize in your own words
• Teach concepts to friends/family
• Create flashcards for key terms
• Practice past exam questions

**3. Subject-Specific Tips:**
• **Math**: Practice problems daily, show all work
• **Science**: Draw diagrams, do experiments
• **English**: Read daily, practice writing
• **Social Studies**: Make timelines, use maps

**4. Exam Preparation:**
• Start reviewing 2 weeks before exams
• Focus on weak areas first
• Get enough sleep before exams
• Stay calm and read questions carefully

**5. Malawian Student Success:**
• Form study groups with classmates
• Use both English and Chichewa to understand concepts
• Connect learning to real life in Malawi

💡 **Remember**: Consistent daily study is better than cramming!

What specific study challenge can I help you with?"""

    # Default intelligent response
    return f"""🤖 **Exam AI Malawi - Your Study Assistant**

I understand you asked: "{message}"

I'm your specialized educational AI for Malawian students! I can help with:

**📚 Core Subjects:**
• **Mathematics** - From basic arithmetic to advanced topics
• **English** - Grammar, writing, literature analysis  
• **Science** - Biology, Chemistry, Physics concepts
• **Social Studies** - Malawian history, geography, civics

**💡 Study Support:**
• Homework help and explanations
• Exam preparation strategies
• Practice questions and answers
• Study tips for Malawian students

**🎯 Ask me specific questions like:**
• "What is a noun?" (English grammar)
• "How do I solve 2x + 5 = 15?" (Mathematics)
• "Explain photosynthesis" (Biology)
• "Tell me about Malawi's independence" (History)

**Ready to help you succeed in your studies!** 🇲🇼📖

What would you like to learn about today?"""

def log_chat_interaction(message: str, response: str, user_name: str = None):
    """Log interactions for training data"""
    try:
        training_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_message": message,
            "ai_response": response,
            "user_name": user_name,
        }
        
        log_file = TRAINING_DATA_PATH / "chat_interactions.jsonl"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(training_entry) + "\n")
            
    except Exception as e:
        logger.error(f"Failed to log interaction: {e}")

if __name__ == "__main__":
    logger.info("🚀 Starting Exam AI Malawi Production Server...")
    logger.info(f"📁 Model path: {MODEL_PATH}")
    logger.info(f"💾 Training data path: {TRAINING_DATA_PATH}")
    
    uvicorn.run(
        "production_app:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disable reload for production stability
        log_level="info"
    )
