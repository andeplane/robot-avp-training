# Task 9: Validation & Replay

## Summary

Replay recorded demonstrations in the Three.js simulation to verify that actions produce the expected object movements. Debug coordinate alignment and action encoding issues before training.

## Acceptance Criteria

- [ ] Load a recorded episode and replay actions step-by-step in sim
- [ ] Visual comparison: original vs replayed trajectory
- [ ] Trajectory overlay visualization (ghost path)
- [ ] Report on action accuracy: position error, rotation error per frame
- [ ] Flag episodes with large drift or failures
- [ ] Interactive controls: play, pause, step forward/back, speed control

## Technical Details

### Replay Loop
```typescript
async function replayEpisode(episode: TrainingEpisode): Promise<ReplayResult> {
  const state = resetEpisode({ task: episode.task });
  const errors: FrameError[] = [];

  for (let i = 0; i < episode.steps.length; i++) {
    const action = decodeActionTokens(episode.steps[i].action_tokens);
    const newState = stepSimulation(action);

    const error = computeError(
      newState,
      episode.frames[i + 1].simulationState
    );
    errors.push(error);

    await renderAndWait(); // visualize at controlled speed
  }

  return { errors, success: checkTaskSuccess() };
}
```

### Error Metrics
```typescript
interface FrameError {
  frameIndex: number;
  positionError: number;   // Euclidean distance (meters)
  rotationError: number;   // angular difference (radians)
  objectErrors: { id: string; posError: number }[];
}
```

### Trajectory Overlay
- Render original hand path as a line (e.g., blue)
- Render replayed end-effector path as another line (e.g., red)
- Divergence visible as gap between the two lines

### Playback UI
- Play/Pause button
- Frame slider (scrub through episode)
- Speed control (0.25x, 0.5x, 1x, 2x)
- Step forward / step back buttons
- Error heatmap overlay (color frames by error magnitude)

### Diagnostics
- If replay diverges: check coordinate transform (AVP space vs sim space)
- If objects don't move: check physics body types (kinematic vs dynamic)
- If grasps fail: check collision detection thresholds and pinch mapping

## References

- PDF: "Replay the demonstrations in the Three.js simulation to verify"
- PDF: "Checks your coordinate alignment and action encoding"
