# Task 10: ML Training Environment Setup (Last Priority)

## Summary

Set up the Python/PyTorch environment for training VLA models on Mac (MPS backend). Download pretrained model weights and verify they load and run forward passes.

## Acceptance Criteria

- [ ] Python environment with PyTorch + MPS backend working
- [ ] OpenVLA-7B or SmolVLA-450M weights downloaded from Hugging Face
- [ ] Model loads successfully with bfloat16 / 4-bit quantization
- [ ] Forward pass works with dummy image + text input
- [ ] Dataset loader reads exported episodes from task8
- [ ] Memory usage documented (fits in 48GB unified memory)

## Technical Details

### Environment
- Python via conda
- PyTorch 2.x with MPS support
- Hugging Face Transformers
- bitsandbytes (for quantization, if Mac-compatible) or GPTQ alternative

### Model Loading
```python
from transformers import AutoModelForVision2Seq, AutoProcessor

model = AutoModelForVision2Seq.from_pretrained(
    "openvla/openvla-7b",
    torch_dtype=torch.bfloat16,
    low_cpu_mem_usage=True,
).to("mps")

processor = AutoProcessor.from_pretrained("openvla/openvla-7b")
```

### Fallback: SmolVLA (450M)
If OpenVLA-7B is too large or MPS has issues:
```python
# SmolVLA - 450M params, fits easily in 48GB
model = AutoModelForVision2Seq.from_pretrained(
    "HuggingFaceTB/SmolVLA-450M",
    torch_dtype=torch.bfloat16,
).to("mps")
```

### Dataset Loader
- Read episodes exported by task8 (JSON + images)
- Yield `(image_tensor, instruction_text, action_tokens)` tuples
- Apply OpenVLA's expected preprocessing (resize, normalize)

### Cloud Fallback
If local training is infeasible:
- AWS EC2 with NVIDIA A10/A100
- Google Colab Pro (24GB GPU)
- Upload dataset, run fine-tuning remotely

## References

- [OpenVLA Hugging Face](https://huggingface.co/openvla/openvla-7b)
- [SmolVLA](https://huggingface.co/blog/smolvla)
- PDF: "Running on Mac (Metal Performance Shaders)" section
