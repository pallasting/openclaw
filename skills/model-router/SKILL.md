---
name: model-router
description: Intelligently routes model inference requests to either cloud-based models via AIClient-2-API or local (quantized) models based on availability and configuration.
tools:
  - name: route_inference
    command: python3 skill/router_runner.py --model_name {{model_name}} --prompt {{prompt}} --max_tokens {{max_tokens}} --temperature {{temperature}}
    parameters:
      model_name:
        type: string
        description: The name of the model to use for inference (e.g., "gemini-2.5-flash", "qwen3-1.7b-quantized").
        required: true
      prompt:
        type: string
        description: The input prompt for the model.
        required: true
      max_tokens:
        type: number
        description: The maximum number of tokens to generate (default: 100).
        default: 100
      temperature:
        type: number
        description: The sampling temperature for generation (default: 0.7).
        default: 0.7
trigger:
  - "use model {{model_name}} for {{prompt}}"
  - "route {{model_name}} with {{prompt}}"
---

# Model Router Skill

This skill provides an intelligent routing mechanism for AI model inference requests. It can direct requests to either:

1.  **Cloud-based models** via the deployed AIClient-2-API service.
2.  **Local (quantized) models** if they are available and configured.

The routing logic prioritizes local models if they match the request, falling back to cloud models otherwise.

## Usage

To use this skill, trigger it with the model name and the prompt.

Example:

- `use model gemini-2.5-flash for "Hello, how are you?"`
- `route qwen3-1.7b-quantized with "Write a short story about a robot."`

## Output

The output will include:

- The chosen model backend (AIClient-2-API or Local).
- The inference result from the selected model.
- Any errors encountered during inference or routing.
