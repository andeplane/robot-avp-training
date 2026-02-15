# Task 2: WebXR Hand Tracking API

## Summary

Implement hand tracking using the WebXR Hand API. Track both left and right hands, extract joint positions, and detect pinch gestures for gripper control.

## Acceptance Criteria

- [ ] Left and right hands tracked via `XRHand` interface
- [ ] Joint positions extracted: wrist, palm, all fingertips
- [ ] Pinch detection working (thumb tip to index tip distance threshold)
- [ ] Hand skeleton visualized in the scene (debug spheres at joints)
- [ ] Hand data logged per frame (~60-90 Hz)
- [ ] TypeScript types defined for hand pose data

## Technical Details

### WebXR Hand API
```typescript
// Inside XR frame loop
const frame: XRFrame = ...;
const referenceSpace: XRReferenceSpace = ...;

for (const inputSource of session.inputSources) {
  if (inputSource.hand) {
    const hand: XRHand = inputSource.hand;
    // 25 joints per hand
    for (const [jointName, jointSpace] of hand) {
      const pose = frame.getJointPose(jointSpace, referenceSpace);
      if (pose) {
        const { x, y, z } = pose.transform.position;
        const { x: qx, y: qy, z: qz, w: qw } = pose.transform.orientation;
      }
    }
  }
}
```

### Key Joints
- `wrist` — base reference
- `thumb-tip`, `index-finger-tip` — pinch detection
- `middle-finger-tip`, `ring-finger-tip`, `pinky-finger-tip`
- `thumb-metacarpal` through `thumb-tip` (4 joints per finger)

### Pinch Detection
```typescript
interface PinchState {
  isPinching: boolean;
  distance: number; // thumb-tip to index-tip in meters
}

const PINCH_THRESHOLD = 0.02; // 2cm
```

### Data Types
```typescript
interface HandPose {
  handedness: 'left' | 'right';
  timestamp: number;
  joints: Map<XRHandJoint, JointData>;
  pinchState: PinchState;
  wristPosition: Vector3;
  wristOrientation: Quaternion;
}

interface JointData {
  position: { x: number; y: number; z: number };
  orientation: { x: number; y: number; z: number; w: number };
  radius: number;
}
```

### Debug Visualization
- Small spheres at each joint position
- Line segments connecting joints (skeleton wireframe)
- Color change on pinch (e.g., green when pinching)

## References

- [WebXR Hand Input spec](https://www.w3.org/TR/webxr-hand-input-1/)
- [XRHand joint list](https://www.w3.org/TR/webxr-hand-input-1/#skeleton-joints-section)
- [Three.js XRHandModelFactory](https://threejs.org/docs/#examples/en/webxr/XRHandModelFactory)
