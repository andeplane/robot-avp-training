# Task 8: Data Pipeline

## Summary

Process recorded demonstration episodes into training-ready format. Convert hand trajectories to action deltas, discretize into tokens compatible with OpenVLA, and export in RLDS-compatible structure.

## Acceptance Criteria

- [ ] Raw hand trajectories converted to action deltas (per-frame diffs)
- [ ] Actions discretized into 256 bins per DoF
- [ ] Episodes exported as: instruction + image frames + action tokens
- [ ] Export format compatible with RLDS / OpenVLA data loaders
- [ ] Statistics computed: action ranges, mean/std per dimension
- [ ] Normalization parameters saved for inference-time denormalization

## Technical Details

### Action Delta Computation
```typescript
function computeActionDeltas(episode: RecordedEpisode): ArmAction[] {
  const actions: ArmAction[] = [];
  for (let i = 0; i < episode.frames.length - 1; i++) {
    const curr = episode.frames[i];
    const next = episode.frames[i + 1];
    actions.push({
      dx: next.leftHand.wristPosition.x - curr.leftHand.wristPosition.x,
      dy: next.leftHand.wristPosition.y - curr.leftHand.wristPosition.y,
      dz: next.leftHand.wristPosition.z - curr.leftHand.wristPosition.z,
      // ... rotation deltas from quaternion diff
      gripper: next.leftHand.pinchState.isPinching ? 0 : 1,
    });
  }
  return actions;
}
```

### Discretization (256 bins per DoF)
```typescript
interface TokenizerConfig {
  bins: number;         // 256
  ranges: {             // per DoF min/max
    dx: [number, number];
    dy: [number, number];
    dz: [number, number];
    droll: [number, number];
    dpitch: [number, number];
    dyaw: [number, number];
    gripper: [number, number];
  };
}

function discretize(value: number, min: number, max: number, bins: number): number {
  const clamped = Math.max(min, Math.min(max, value));
  const normalized = (clamped - min) / (max - min);
  return Math.floor(normalized * (bins - 1));
}

function undiscretize(token: number, min: number, max: number, bins: number): number {
  return min + (token / (bins - 1)) * (max - min);
}
```

### Export Format (RLDS-style)
```typescript
interface TrainingEpisode {
  instruction: string;
  steps: TrainingStep[];
}

interface TrainingStep {
  observation: string;     // path to frame image (224x224)
  action_tokens: number[]; // 7 tokens for single arm, 14 for dual
  is_terminal: boolean;
}
```

### Normalization Stats
```typescript
interface NormalizationStats {
  mean: number[];   // per DoF
  std: number[];    // per DoF
  min: number[];
  max: number[];
}
```

Saved alongside the dataset so the model can un-normalize at inference time.

## References

- PDF: "Action encoding" section
- PDF: "Each demonstration can be structured in an RLDS format"
- PDF: "256 bins per dimension" tokenization
