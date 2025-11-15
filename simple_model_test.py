#!/usr/bin/env python3
"""
Simple model loading test
"""

import sys
from pathlib import Path

def test_imports():
    print("Testing imports...")
    
    try:
        import torch
        print(f"PyTorch: {torch.__version__}")
    except ImportError as e:
        print(f"PyTorch ERROR: {e}")
        return False
    
    try:
        import transformers
        print(f"Transformers: {transformers.__version__}")
    except ImportError as e:
        print(f"Transformers ERROR: {e}")
        return False
    
    try:
        from safetensors.torch import load_file
        print("Safetensors: Available")
    except ImportError as e:
        print(f"Safetensors ERROR: {e}")
        return False
    
    return True

def test_model():
    print("\nTesting model loading...")
    
    try:
        from transformers import AutoTokenizer, AutoModelForCausalLM
        from safetensors.torch import load_file
        
        # Test GPT-2 base model
        print("Loading GPT-2 base model...")
        tokenizer = AutoTokenizer.from_pretrained("gpt2")
        model = AutoModelForCausalLM.from_pretrained("gpt2")
        print("GPT-2 model loaded successfully")
        
        # Test custom weights
        model_file = Path("my_small_model/model.safetensors")
        if model_file.exists():
            print(f"Custom model file found: {model_file.stat().st_size / (1024*1024):.1f} MB")
            
            try:
                weights = load_file(str(model_file))
                print(f"Custom weights loaded: {len(weights)} tensors")
                
                # Try to apply weights
                missing_keys, unexpected_keys = model.load_state_dict(weights, strict=False)
                print(f"Applied weights - Missing: {len(missing_keys)}, Unexpected: {len(unexpected_keys)}")
                
                if len(missing_keys) == 0 and len(unexpected_keys) == 0:
                    print("Perfect weight match!")
                elif len(missing_keys) < 10 and len(unexpected_keys) < 10:
                    print("Good weight compatibility")
                else:
                    print("Weight architecture mismatch - will use base GPT-2")
                
            except Exception as e:
                print(f"Weight loading error: {e}")
        else:
            print("No custom model file found")
        
        return True
        
    except Exception as e:
        print(f"Model loading error: {e}")
        return False

def main():
    print("="*50)
    print("  EXAM AI MODEL DIAGNOSTICS")
    print("="*50)
    
    if not test_imports():
        print("\nFAILED: Missing required libraries")
        print("Install with: pip install torch transformers safetensors")
        return
    
    if not test_model():
        print("\nFAILED: Model loading issues")
        return
    
    print("\n" + "="*50)
    print("SUCCESS: Model is ready for training!")
    print("="*50)

if __name__ == "__main__":
    main()
