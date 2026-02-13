---
name: angelslim-quantize
description: Quantizes a specified AI model using AngelSlim principles for efficient local inference. Due to environment constraints, this skill currently simulates the quantization process and provides instructions for manual execution in a suitable environment.
tools:
  - name: run_quantization
    command: python3 skill/quantize_runner.py --model_name {{model_name}} --output_dir {{output_dir}} --quant_type {{quant_type}}
    parameters:
      model_name:
        type: string
        description: The Hugging Face model ID to quantize (e.g., "Qwen/Qwen3-1.7B").
        required: true
      output_dir:
        type: string
        description: The directory to save the quantized model (default: "~/models/quantized").
        default: "~/models/quantized"
      quant_type:
        type: string
        description: The quantization type (e.g., "8bit", "4bit"). Note: Currently simulates 8-bit.
        default: "8bit"
trigger:
  - "quantize model {{model_name}}"
  - "compress model {{model_name}}"
  - "angelslim quantize {{model_name}}"
---

# AngelSlim Quantization Skill

This skill allows you to "quantize" large AI models using the principles of AngelSlim for more efficient local inference.

## Usage

To use this skill, simply trigger it with the model name you wish to quantize.

Example:

- `quantize model Qwen/Qwen3-1.7B`
- `angelslim quantize microsoft/DialoGPT-small`

The skill will simulate the quantization process and provide instructions for how to perform actual quantization in an environment with GPU and appropriate dependencies.

## Output

The output will include:

- A confirmation of the simulated quantization.
- Instructions on how to manually perform the actual quantization using `tools/quantization/quantize_simple.py` or the full AngelSlim toolkit in a suitable environment.
- The path where the (simulated) quantized model would be saved.
