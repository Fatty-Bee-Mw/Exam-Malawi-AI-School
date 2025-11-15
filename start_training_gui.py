#!/usr/bin/env python3
"""
Start Training GUI with proper setup
"""

import os
import sys
from pathlib import Path

def main():
    print("="*50)
    print("    EXAM AI MALAWI - LOCAL TRAINING")
    print("="*50)
    print()
    
    # Check if training data exists
    training_dir = Path("training_data_prepared")
    if not training_dir.exists() or not list(training_dir.glob("*.txt")):
        print("No training data found!")
        print("Running data preparation first...")
        print()
        
        # Run data preparation
        os.system("python prepare_training_data.py")
        print()
    
    # Check if model directory exists
    model_dir = Path("my_small_model")
    if not model_dir.exists():
        print(f"Creating model directory: {model_dir}")
        model_dir.mkdir(exist_ok=True)
    
    print("Starting Model Training GUI...")
    print()
    print("INSTRUCTIONS:")
    print("1. Set 'Model Path' to: my_small_model")
    print("2. Click 'Select Folder' and choose: training_data_prepared")
    print("3. Click 'Start Training' to begin")
    print("4. Monitor progress in the GUI")
    print()
    
    # Start the GUI
    try:
        os.system("python model_trainer_gui.py")
    except KeyboardInterrupt:
        print("\nTraining interrupted by user")
    except Exception as e:
        print(f"Error starting training GUI: {e}")

if __name__ == "__main__":
    main()
