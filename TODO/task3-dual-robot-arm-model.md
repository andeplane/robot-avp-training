# Task 3: Dual Robot Arm Model

## Summary

Create two robot arm models in Three.js. Each arm has a base, articulated segments, and a gripper end-effector. Arms are positioned on left and right sides of the workspace.

## Acceptance Criteria

- [ ] Two robot arm meshes rendered in the scene
- [ ] Each arm: base, upper arm, forearm, wrist, gripper
- [ ] Gripper has two finger meshes that open/close
- [ ] Arms positioned at left/right of workspace table
- [ ] Arms can be driven programmatically (set joint angles or end-effector pose)
- [ ] TypeScript class/interface for RobotArm entity

## Technical Details

### Arm Structure
```typescript
interface RobotArm {
  id: 'left' | 'right';
  base: THREE.Group;        // fixed mount point
  shoulder: THREE.Group;    // rotation joint
  upperArm: THREE.Group;    // segment
  elbow: THREE.Group;       // rotation joint
  forearm: THREE.Group;     // segment
  wrist: THREE.Group;       // rotation joint
  gripper: Gripper;         // end-effector
}

interface Gripper {
  base: THREE.Group;
  fingerLeft: THREE.Mesh;
  fingerRight: THREE.Mesh;
  openAmount: number;       // 0 = closed, 1 = fully open
}
```

### Positioning
- Left arm: position `(-0.4, 0.8, -0.3)` relative to table center
- Right arm: position `(0.4, 0.8, -0.3)` mirrored
- Table/workspace at origin, ~0.8m height

### Geometry
- Arm segments: cylinders or rounded boxes
- Joints: spheres at articulation points
- Gripper fingers: thin boxes that translate along local X axis
- Distinct colors per arm (e.g., blue=left, orange=right)

### Control Interface
```typescript
interface ArmPose {
  endEffectorPosition: THREE.Vector3;
  endEffectorOrientation: THREE.Quaternion;
  gripperOpen: number; // 0-1
}

function setArmPose(arm: RobotArm, pose: ArmPose): void;
```

### Hand-to-Arm Mapping (prepared for task5)
- Left hand drives left arm
- Right hand drives right arm
- Pinch maps to gripper close
- Hand wrist position/orientation maps to end-effector pose

## References

- [Three.js Groups and hierarchies](https://threejs.org/docs/#api/en/objects/Group)
- PDF Section: "The agent's embodiment in simulation"
