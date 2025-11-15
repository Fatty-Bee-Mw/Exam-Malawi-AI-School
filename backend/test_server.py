#!/usr/bin/env python3
"""
Simple test server to check if FastAPI works without model loading
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Test Server", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Test server is running!"}

@app.get("/health")
async def health():
    return {"status": "healthy", "message": "Server is working"}

@app.get("/api/admin/model-info")
async def get_model_info():
    return {
        "success": True,
        "model_name": "Test Model",
        "model_type": "TestModel",
        "device": "cpu",
        "model_path": "test_path",
        "is_custom_model": True,
        "tokenizer_vocab_size": 50257,
    }

if __name__ == "__main__":
    logger.info("Starting test server...")
    uvicorn.run(
        "test_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
