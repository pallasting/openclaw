#!/usr/bin/env python3
"""
Router script for the model-router OpenClaw skill.
This script intelligently routes model inference requests to either
cloud-based models via AIClient-2-API or local (quantized) models.
"""
import argparse
import os
import requests
import json
from typing import Dict, Any

# --- Configuration ---
AICLIENT_API_URL = os.getenv("AICLIENT_API_URL", "http://localhost:8046/v1/chat/completions")
AICLIENT_API_KEY = os.getenv("AICLIENT_API_KEY", "sk-0437c02b1560470981866f50b05759e3") # Default from previous setup

# Placeholder for local model paths (simulate for now)
LOCAL_MODELS_CONFIG = {
    "qwen3-1.7b-quantized": {
        "path": os.path.expanduser("~/models/quantized/qwen3-1.7b-quantized"),
        "backend": "llama.cpp-like-api", # Assuming a local API endpoint or direct load
        "api_url": "http://localhost:8083/v1/chat/completions" # Placeholder local API endpoint
    },
    # Add other local models here
}

def call_aiclient_api(model_name: str, prompt: str, max_tokens: int, temperature: float) -> Dict[str, Any]:
    """
    Calls the AIClient-2-API for inference.
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {AICLIENT_API_KEY}"
    }
    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": temperature,
        "stream": False # For simplicity, not streaming for now
    }
    try:
        response = requests.post(AICLIENT_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"AIClient-2-API call failed: {e}", "backend": "AIClient-2-API"}

def call_local_model_api(local_model_config: Dict[str, Any], prompt: str, max_tokens: int, temperature: float) -> Dict[str, Any]:
    """
    Simulates calling a local model API for inference.
    In a real scenario, this would load the model or call a local server.
    """
    model_path = local_model_config["path"]
    api_url = local_model_config["api_url"]
    
    # Simulate local model availability
    if not os.path.exists(model_path):
        return {
            "error": f"Local model not found at {model_path}. Simulation.",
            "backend": "Local Model (Simulated)"
        }
    
    print(f"Simulating local model inference from {model_path} via {api_url}...")
    # In a real setup, you'd make an actual API call or load the model.
    # For now, we return a canned response.
    simulated_response = {
        "id": f"chatcmpl-{uuid.uuid4()}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": "local-" + os.path.basename(model_path),
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": f"This is a simulated response from local model {os.path.basename(model_path)} for prompt: '{prompt[:50]}...'."
                },
                "logprobs": None,
                "finish_reason": "stop"
            }
        ],
        "usage": {
            "prompt_tokens": len(prompt.split()),
            "completion_tokens": 20,
            "total_tokens": len(prompt.split()) + 20
        },
        "backend": "Local Model (Simulated)"
    }
    return simulated_response

def route_inference(model_name: str, prompt: str, max_tokens: int, temperature: float) -> Dict[str, Any]:
    """
    Routes the inference request based on available backends.
    Priority: Local Model -> AIClient-2-API
    """
    print(f"Routing request for model: {model_name}, prompt: '{prompt[:30]}...'")

    # 1. Try local models first
    if model_name in LOCAL_MODELS_CONFIG:
        local_model_config = LOCAL_MODELS_CONFIG[model_name]
        # Check if local model path exists (for a more realistic simulation)
        if os.path.exists(os.path.expanduser(local_model_config["path"])):
            print(f"Attempting to use local model: {model_name}")
            result = call_local_model_api(local_model_config, prompt, max_tokens, temperature)
            if "error" not in result:
                print(f"✅ Successfully routed to Local Model: {model_name}")
                return result
            else:
                print(f"❌ Local model failed or not fully available. Error: {result['error']}. Falling back to AIClient-2-API.")
        else:
            print(f"Local model path for '{model_name}' not found. Falling back to AIClient-2-API.")


    # 2. Fallback to AIClient-2-API
    print(f"Attempting to use AIClient-2-API for model: {model_name}")
    result = call_aiclient_api(model_name, prompt, max_tokens, temperature)
    if "error" not in result:
        print(f"✅ Successfully routed to AIClient-2-API for model: {model_name}")
        result["backend"] = "AIClient-2-API"
    else:
        print(f"❌ Failed to route to AIClient-2-API. Error: {result['error']}")
        result["backend"] = "None (Fallback failed)"
    return result


if __name__ == "__main__":
    import uuid
    import time # Ensure time is imported for simulated response

    parser = argparse.ArgumentParser(
        description="Intelligent model inference router."
    )
    parser.add_argument("--model_name", type=str, required=True,
                        help="The name of the model to use for inference.")
    parser.add_argument("--prompt", type=str, required=True,
                        help="The input prompt for the model.")
    parser.add_argument("--max_tokens", type=int, default=100,
                        help="The maximum number of tokens to generate.")
    parser.add_argument("--temperature", type=float, default=0.7,
                        help="The sampling temperature for generation.")
    
    args = parser.parse_args()

    # Create a dummy local model path for testing the routing logic
    dummy_local_model_path = os.path.expanduser(LOCAL_MODELS_CONFIG["qwen3-1.7b-quantized"]["path"])
    os.makedirs(dummy_local_model_path, exist_ok=True)
    with open(os.path.join(dummy_local_model_path, "model.bin"), "w") as f:
        f.write("dummy model data")

    try:
        response = route_inference(
            args.model_name, args.prompt, args.max_tokens, args.temperature
        )
        print("\n--- INFERENCE RESULT ---")
        print(json.dumps(response, indent=2, ensure_ascii=False))
    finally:
        # Clean up dummy local model path
        import shutil
        shutil.rmtree(dummy_local_model_path, ignore_errors=True)
