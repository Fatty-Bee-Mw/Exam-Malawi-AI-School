#!/usr/bin/env python3
"""
Integrate trained model with web platform
"""

import json
import shutil
from pathlib import Path
from datetime import datetime

def backup_current_model():
    """Backup current model before replacing"""
    model_dir = Path("my_small_model")
    backup_dir = Path("model_backups")
    backup_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = backup_dir / f"model_backup_{timestamp}"
    
    if model_dir.exists():
        shutil.copytree(model_dir, backup_path)
        print(f"Backed up current model to: {backup_path}")
        return backup_path
    return None

def update_model_info():
    """Update model information for the web platform"""
    
    model_info = {
        "model_name": "Exam AI Malawi (Custom Trained)",
        "training_date": datetime.now().isoformat(),
        "version": "1.0.0",
        "description": "Custom trained model for Malawian education",
        "capabilities": [
            "Mathematics problem solving",
            "English grammar explanations", 
            "Science concept explanations",
            "Malawian history and geography",
            "Study tips and guidance"
        ],
        "training_data_sources": [
            "Chat interactions",
            "Educational content",
            "Malawi-specific examples"
        ]
    }
    
    # Save model info
    model_dir = Path("my_small_model")
    model_dir.mkdir(exist_ok=True)
    
    with open(model_dir / "model_info.json", 'w') as f:
        json.dump(model_info, f, indent=2)
    
    print("Updated model information")
    return model_info

def restart_backend():
    """Restart backend to load new model"""
    print("\nTo use your newly trained model:")
    print("1. Stop the current backend server (Ctrl+C)")
    print("2. Run: python backend/production_app.py")
    print("3. Your AI will now use the trained model!")
    print("\nThe web platform will automatically detect and use your custom model.")

def main():
    print("="*50)
    print("    INTEGRATING TRAINED MODEL")
    print("="*50)
    print()
    
    # Check if trained model exists
    model_dir = Path("my_small_model")
    model_file = model_dir / "model.safetensors"
    
    if not model_file.exists():
        print("No trained model found!")
        print("Please run the training GUI first:")
        print("python start_training_gui.py")
        return
    
    print(f"Found trained model: {model_file}")
    print(f"Model size: {model_file.stat().st_size / (1024*1024):.1f} MB")
    print()
    
    # Backup current model
    backup_path = backup_current_model()
    
    # Update model information
    model_info = update_model_info()
    
    print("\nModel Integration Complete!")
    print(f"Model Name: {model_info['model_name']}")
    print(f"Training Date: {model_info['training_date']}")
    print()
    
    restart_backend()

if __name__ == "__main__":
    main()
