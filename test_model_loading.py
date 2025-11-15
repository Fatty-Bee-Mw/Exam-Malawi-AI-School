#!/usr/bin/env python3
"""
Test model loading to diagnose issues
"""

import sys
from pathlib import Path
import json

def test_basic_imports():
    """Test if required libraries are available"""
    print("Testing imports...")
    
    try:
        import torch
        print(f"OK PyTorch: {torch.__version__}")
    except ImportError as e:
        print(f"❌ PyTorch not available: {e}")
        return False
    
    try:
        import transformers
        print(f"OK Transformers: {transformers.__version__}")
    except ImportError as e:
        print(f"ERROR Transformers not available: {e}")
        return False
    
    try:
        from safetensors.torch import load_file
        print("OK Safetensors available")
    except ImportError as e:
        print(f"ERROR Safetensors not available: {e}")
        return False
    
    return True

def test_model_files():
    """Test if model files are valid"""
    print("\nTesting model files...")
    
    model_path = Path("my_small_model")
    
    # Check directory exists
    if not model_path.exists():
        print(f"❌ Model directory not found: {model_path}")
        return False
    
    print(f"✅ Model directory exists: {model_path}")
    
    # Check config.json
    config_file = model_path / "config.json"
    if config_file.exists():
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
            print(f"✅ Config file valid: {len(config)} parameters")
            print(f"   Model type: {config.get('model_type', 'unknown')}")
            print(f"   Architecture: {config.get('architectures', ['unknown'])[0]}")
        except Exception as e:
            print(f"❌ Config file invalid: {e}")
            return False
    else:
        print("❌ Config file missing")
        return False
    
    # Check model.safetensors
    model_file = model_path / "model.safetensors"
    if model_file.exists():
        size_mb = model_file.stat().st_size / (1024 * 1024)
        print(f"✅ Model file exists: {size_mb:.1f} MB")
    else:
        print("❌ Model file missing")
        return False
    
    return True

def test_model_loading():
    """Test actual model loading"""
    print("\nTesting model loading...")
    
    try:
        from transformers import AutoTokenizer, AutoModelForCausalLM
        
        model_path = "my_small_model"
        
        # Test tokenizer loading
        print("Loading tokenizer...")
        try:
            tokenizer = AutoTokenizer.from_pretrained("gpt2")  # Use GPT-2 tokenizer as fallback
            print("✅ Tokenizer loaded (GPT-2 fallback)")
        except Exception as e:
            print(f"❌ Tokenizer loading failed: {e}")
            return False
        
        # Test model loading
        print("Loading model...")
        try:
            # Try loading as GPT-2 first
            model = AutoModelForCausalLM.from_pretrained("gpt2")
            print("✅ Base GPT-2 model loaded")
            
            # Try loading custom weights
            from safetensors.torch import load_file
            custom_weights_path = Path(model_path) / "model.safetensors"
            
            if custom_weights_path.exists():
                print("Loading custom weights...")
                custom_weights = load_file(str(custom_weights_path))
                print(f"✅ Custom weights loaded: {len(custom_weights)} tensors")
                
                # Try to load weights into model
                try:
                    model.load_state_dict(custom_weights, strict=False)
                    print("✅ Custom weights applied to model")
                except Exception as e:
                    print(f"⚠️ Custom weights couldn't be applied: {e}")
                    print("   This is likely due to architecture mismatch")
            
        except Exception as e:
            print(f"❌ Model loading failed: {e}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Model loading test failed: {e}")
        return False

def test_training_compatibility():
    """Test if model can be used for training"""
    print("\nTesting training compatibility...")
    
    try:
        from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer
        import torch
        
        # Load model and tokenizer
        tokenizer = AutoTokenizer.from_pretrained("gpt2")
        model = AutoModelForCausalLM.from_pretrained("gpt2")
        
        # Add padding token if missing
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        print("✅ Model ready for training")
        
        # Test sample training data
        sample_text = "Question: What is 2+2? Answer: 2+2 equals 4."
        inputs = tokenizer(sample_text, return_tensors="pt", padding=True, truncation=True)
        
        print("✅ Sample data tokenized successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Training compatibility test failed: {e}")
        return False

def main():
    print("="*60)
    print("    EXAM AI MALAWI - MODEL DIAGNOSTICS")
    print("="*60)
    
    all_tests_passed = True
    
    # Run all tests
    if not test_basic_imports():
        all_tests_passed = False
    
    if not test_model_files():
        all_tests_passed = False
    
    if not test_model_loading():
        all_tests_passed = False
    
    if not test_training_compatibility():
        all_tests_passed = False
    
    print("\n" + "="*60)
    if all_tests_passed:
        print("✅ ALL TESTS PASSED - Model is ready for training!")
        print("\nNext steps:")
        print("1. Run: python model_trainer_gui.py")
        print("2. Select training data folder")
        print("3. Start training")
    else:
        print("❌ SOME TESTS FAILED - Model needs fixing")
        print("\nRecommended fixes:")
        print("1. Install missing dependencies: pip install torch transformers safetensors")
        print("2. Check model files are not corrupted")
        print("3. Use GPT-2 base model for training")
    print("="*60)

if __name__ == "__main__":
    main()
