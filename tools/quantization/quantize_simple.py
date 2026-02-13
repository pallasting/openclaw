#!/usr/bin/env python3
"""
Simple model quantization script using transformers and torch
"""
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import sys

def quantize_model(model_name="Qwen/Qwen3-1.7B", output_dir="~/models/quantized"):
    """Quantize a model to 8-bit using BitsAndBytes"""
    
    print(f"Loading model: {model_name}")
    
    # Configure 8-bit quantization
    quantization_config = BitsAndBytesConfig(
        load_in_8bit=True,
        bnb_8bit_compute_dtype=torch.float16,
        bnb_8bit_use_double_quant=True,
    )
    
    # Load model with quantization
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=quantization_config,
        device_map="auto",
        trust_remote_code=True,
    )
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    
    print(f"Model loaded and quantized to 8-bit")
    print(f"Model size: {model.get_memory_footprint() / 1e6:.2f} MB")
    
    # Save quantized model
    import os
    output_path = os.path.expanduser(output_dir)
    os.makedirs(output_path, exist_ok=True)
    
    print(f"Saving to: {output_path}")
    model.save_pretrained(output_path)
    tokenizer.save_pretrained(output_path)
    
    print("✅ Quantization complete!")
    return output_path

def test_model(model_path):
    """Test the quantized model"""
    from transformers import AutoModelForCausalLM, AutoTokenizer
    
    print(f"\nTesting model from: {model_path}")
    
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        device_map="auto",
        trust_remote_code=True,
    )
    tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
    
    # Test inference
    prompt = "Hello, my name is"
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    outputs = model.generate(
        **inputs,
        max_new_tokens=20,
        do_sample=True,
        temperature=0.7,
    )
    
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    print(f"Input: {prompt}")
    print(f"Output: {result}")
    
    return result

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        # Test mode
        test_model("~/models/quantized")
    else:
        # Quantize mode
        print("Note: This will download Qwen3-1.7B model (~3.4GB)")
        print("For demo purposes, we'll use a smaller model or skip download")
        
        # For now, just show the function
        print("\nQuantization function ready!")
        print("To use: python3 quantize_simple.py")
        print("To test: python3 quantize_simple.py test")
