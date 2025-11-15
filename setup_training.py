#!/usr/bin/env python3
"""
Setup script for Small Language Model Training
Installs dependencies and checks system requirements
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is required")
        print(f"   Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python version: {version.major}.{version.minor}.{version.micro}")
    return True

def check_tesseract():
    """Check if Tesseract OCR is installed"""
    try:
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"✅ Tesseract OCR: {version_line}")
            return True
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    print("❌ Tesseract OCR is not installed")
    print_system_specific_install = {
        'Windows': "Download from: https://github.com/UB-Mannheim/tesseract/wiki",
        'Darwin': "Run: brew install tesseract",
        'Linux': "Run: sudo apt-get install tesseract-ocr"
    }
    
    system = platform.system()
    if system in print_system_specific_install:
        print(f"   {print_system_specific_install[system]}")
    
    return False

def install_dependencies():
    """Install Python dependencies"""
    print("\n📦 Installing Python dependencies...")
    
    requirements_file = Path(__file__).parent / "training_requirements.txt"
    
    if not requirements_file.exists():
        print("❌ requirements.txt not found")
        return False
    
    try:
        # Upgrade pip first
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], 
                      check=True, capture_output=True)
        
        # Install requirements
        result = subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)], 
                              check=True, capture_output=True, text=True)
        
        print("✅ Dependencies installed successfully")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        print("   Error output:", e.stderr)
        return False

def check_model_directory():
    """Check if model directory exists"""
    model_path = Path("./my_small_model")
    
    if model_path.exists() and model_path.is_dir():
        files = list(model_path.rglob("*"))
        print(f"✅ Model directory found: {len(files)} files")
        
        # Check for essential files
        essential_files = ["config.json", "pytorch_model.bin"]
        for file in essential_files:
            if (model_path / file).exists():
                print(f"   ✅ {file}")
            else:
                print(f"   ⚠️  {file} not found (may be named differently)")
        
        return True
    else:
        print("⚠️  Model directory './my_small_model' not found")
        print("   You can still use the GUI, but need to select your model directory")
        return False

def create_sample_data():
    """Create sample training data for testing"""
    sample_dir = Path("./sample_training_data")
    sample_dir.mkdir(exist_ok=True)
    
    # Create sample text file
    with open(sample_dir / "sample_document.txt", "w", encoding="utf-8") as f:
        f.write("""
Sample Training Document

This is a sample document for testing the small language model trainer.
The system can process various file formats including TXT, PDF, DOCX, and images.

Chapter 1: Introduction
Machine learning models require training data to learn patterns and generate
coherent responses. Small models are particularly useful for specific domains
and can be trained on custom datasets.

Chapter 2: Training Process
The training process involves:
1. Data collection and preprocessing
2. Text chunking for manageable processing
3. Model fine-tuning with the prepared dataset
4. Evaluation and testing

Chapter 3: Best Practices
- Use clean, high-quality training data
- Ensure diverse coverage of topics
- Monitor training progress carefully
- Save model checkpoints regularly

This sample document demonstrates the text processing capabilities
of the training system.
        """)
    
    print(f"✅ Created sample data in: {sample_dir}")
    return True

def test_imports():
    """Test if all required modules can be imported"""
    print("\n🧪 Testing imports...")
    
    required_modules = [
        "torch", "transformers", "tkinter", 
        "nltk", "fitz", "docx", "PIL", "pytesseract"
    ]
    
    failed_imports = []
    
    for module in required_modules:
        try:
            if module == "tkinter":
                import tkinter
            elif module == "fitz":
                import fitz  # PyMuPDF
            elif module == "docx":
                import docx
            elif module == "PIL":
                import PIL
            else:
                __import__(module)
            print(f"   ✅ {module}")
        except ImportError as e:
            print(f"   ❌ {module}: {e}")
            failed_imports.append(module)
    
    if failed_imports:
        print(f"\n❌ {len(failed_imports)} modules failed to import")
        return False
    else:
        print("\n✅ All modules imported successfully")
        return True

def main():
    """Main setup function"""
    print("🚀 Small Language Model Training Setup")
    print("=" * 50)
    
    # Check requirements
    checks_passed = 0
    total_checks = 5
    
    if check_python_version():
        checks_passed += 1
    
    if check_tesseract():
        checks_passed += 1
    
    if install_dependencies():
        checks_passed += 1
    
    if test_imports():
        checks_passed += 1
    
    check_model_directory()  # This is optional, so don't count it
    create_sample_data()
    
    print("\n" + "=" * 50)
    print(f"Setup Summary: {checks_passed}/{total_checks} checks passed")
    
    if checks_passed == total_checks:
        print("🎉 Setup completed successfully!")
        print("\nNext steps:")
        print("1. Run: python model_trainer_gui.py")
        print("2. Select your model directory (./my_small_model or your custom model)")
        print("3. Select a folder with training data")
        print("4. Click 'Train Model' to start training")
    else:
        print("⚠️  Setup incomplete. Please fix the issues above before proceeding.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
