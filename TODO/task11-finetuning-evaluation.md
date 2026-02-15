# Task 11: Fine-Tuning & Evaluation (Last Priority)

## Summary

Fine-tune the VLA model on collected demonstrations using LoRA. Evaluate the trained policy by running it in closed-loop in the Three.js simulation. Iterate based on results.

## Acceptance Criteria

- [ ] LoRA adapters configured and training runs without OOM
- [ ] Training loss decreases and converges
- [ ] Trained model exported / checkpointed
- [ ] Policy runs in closed-loop: image -> model -> action -> sim -> repeat
- [ ] Task success rate measured per environment
- [ ] Comparison: OpenVLA vs SmolVLA (if both trained)

## Technical Details

### LoRA Fine-Tuning
```python
from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
)
model = get_peft_model(model, lora_config)
```

### Training Loop
- Loss: cross-entropy on predicted action tokens vs ground truth
- Optimizer: AdamW, lr=1e-4 with cosine schedule
- Batch size: 1-4 (memory dependent)
- Epochs: 50-100 over small dataset, monitor for overfitting
- Save checkpoints every N epochs

### Data Augmentation
- Random background color/texture changes
- Slight jitter in object positions
- Image augmentations: brightness, contrast, small crops

### Closed-Loop Evaluation
```
1. Reset simulation to task initial state
2. Capture camera image (224x224)
3. Feed image + instruction to model
4. Model outputs action tokens
5. Decode tokens to continuous action
6. Apply action via stepSimulation()
7. Repeat from step 2 until done or max steps
8. Check task success
```

### Integration with Three.js
- Python model server (Flask/FastAPI) exposes `/predict` endpoint
- Three.js client sends camera image + instruction
- Server returns action tokens
- Client applies action in sim, sends next frame
- WebSocket for lower latency if needed

### Metrics
- Success rate per task (% of episodes completed)
- Average steps to completion
- Position error at task end
- Comparison table across model sizes

### Iteration
- If success rate low: collect more demos for failure cases
- If jerky: try FAST tokenizer or action smoothing
- If slow: quantize model further or switch to SmolVLA

## References

- PDF: "LoRA fine-tuning" section
- PDF: "Evaluation in Simulation" section
- [OpenVLA fine-tuning guide](https://github.com/openvla/openvla)
- [PEFT LoRA docs](https://huggingface.co/docs/peft)
