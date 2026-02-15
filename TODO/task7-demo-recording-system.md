# Task 7: Demonstration Recording System

## Summary

Build a recording system that captures hand poses, arm actions, gripper states, and rendered camera frames during task demonstrations. Provides start/stop controls and saves data per episode.

## Acceptance Criteria

- [ ] Start/stop recording via UI button or gesture
- [ ] Each frame: hand poses, arm states, object states captured
- [ ] Camera view rendered to offscreen canvas (224x224)
- [ ] Data saved as timestamped JSON + image sequence
- [ ] Episode metadata stored (task type, instruction, duration)
- [ ] Recording indicator visible in scene

## Technical Details

### Recording Data Per Frame
```typescript
interface RecordedFrame {
  frameIndex: number;
  timestamp: number;
  leftHand: HandPose;
  rightHand: HandPose;
  leftArmAction: ArmAction;
  rightArmAction: ArmAction;
  simulationState: SimulationState;
}
```

### Episode Structure
```typescript
interface RecordedEpisode {
  id: string;
  task: TaskType;
  instruction: string;  // e.g., "Pick up the red cube and place it in the bowl"
  startTime: number;
  endTime: number;
  frames: RecordedFrame[];
  success: boolean;
}
```

### Camera Capture
```typescript
// Offscreen renderer for observation images
const offscreenRenderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
offscreenRenderer.setSize(224, 224);

function captureObservation(scene: THREE.Scene, camera: THREE.Camera): ImageData {
  offscreenRenderer.render(scene, camera);
  const gl = offscreenRenderer.getContext();
  const pixels = new Uint8Array(224 * 224 * 4);
  gl.readPixels(0, 0, 224, 224, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return new ImageData(new Uint8ClampedArray(pixels), 224, 224);
}
```

### Storage
- Save to IndexedDB or download as JSON + zip of frames
- File structure per episode:
  ```
  episode_001/
    metadata.json
    actions.json
    frames/
      frame_000.png
      frame_001.png
      ...
  ```

### UI Controls
- Floating panel in AR with Start/Stop/Discard buttons
- Visual recording indicator (red dot)
- Timer showing elapsed recording time
- Counter showing frame count

## References

- PDF: "Record hand pose at each frame"
- PDF: "Simultaneously record the first-person video"
- PDF: "Data Storage Format" section
