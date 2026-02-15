# Task 5: Robot Control API

## Summary

Define the control API that bridges hand tracking input to robot arm movement. Includes the 7-DoF action space per arm, state interface, simulation step function, and episode reset.

## Acceptance Criteria

- [ ] 7-DoF action space defined per arm (dx, dy, dz, droll, dpitch, dyaw, gripper)
- [ ] Hand tracking mapped to robot arm end-effector in real-time
- [ ] Left hand controls left arm, right hand controls right arm
- [ ] `stepSimulation()` function applies actions and advances physics
- [ ] `resetEpisode()` resets arms and objects to initial state
- [ ] State interface returns current poses, gripper states, object positions
- [ ] TypeScript types for all interfaces

## Technical Details

### Action Space (per arm)
```typescript
interface ArmAction {
  dx: number;     // translation delta X (meters)
  dy: number;     // translation delta Y
  dz: number;     // translation delta Z
  droll: number;  // rotation delta roll (radians)
  dpitch: number; // rotation delta pitch
  dyaw: number;   // rotation delta yaw
  gripper: number; // 0 = closed, 1 = open
}

interface DualArmAction {
  left: ArmAction;
  right: ArmAction;
}
```

### State Interface
```typescript
interface SimulationState {
  timestamp: number;
  leftArm: ArmState;
  rightArm: ArmState;
  objects: ObjectState[];
  cameraImage?: ImageData; // 224x224 for VLA
}

interface ArmState {
  endEffectorPosition: { x: number; y: number; z: number };
  endEffectorOrientation: { x: number; y: number; z: number; w: number };
  gripperOpen: number;
  isGrasping: boolean;
  graspedObjectId: string | null;
}

interface ObjectState {
  id: string;
  position: { x: number; y: number; z: number };
  orientation: { x: number; y: number; z: number; w: number };
  type: 'cube' | 'valve' | 'handle' | 'bottle';
}
```

### Simulation Step
```typescript
function stepSimulation(action: DualArmAction): SimulationState {
  applyActionToArm('left', action.left);
  applyActionToArm('right', action.right);
  physicsWorld.step();
  syncAllBodies();
  renderScene();
  return getCurrentState();
}
```

### Episode Reset
```typescript
interface EpisodeConfig {
  task: 'pick-and-place' | 'valve-turning' | 'handle-rotation';
  randomize?: boolean; // slight randomization of object positions
}

function resetEpisode(config: EpisodeConfig): SimulationState;
```

### Hand-to-Action Mapping
```typescript
function handPoseToAction(
  currentHandPose: HandPose,
  previousHandPose: HandPose
): ArmAction {
  return {
    dx: currentHandPose.wristPosition.x - previousHandPose.wristPosition.x,
    dy: currentHandPose.wristPosition.y - previousHandPose.wristPosition.y,
    dz: currentHandPose.wristPosition.z - previousHandPose.wristPosition.z,
    droll: /* delta from orientation diff */,
    dpitch: /* delta from orientation diff */,
    dyaw: /* delta from orientation diff */,
    gripper: currentHandPose.pinchState.isPinching ? 0 : 1,
  };
}
```

## References

- PDF: "7-DoF action (3D translation, 3D rotation, gripper open/close)"
- PDF: `stepSimulation(action)` interface
