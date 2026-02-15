# Task 4: Physics Engine (Rapier.js) Integration

## Summary

Integrate Rapier.js (WASM-based physics) into the Three.js scene. Add rigid bodies to robot arms and manipulable objects. Configure joints for constrained objects (valves, handles) and implement grasp mechanics.

## Acceptance Criteria

- [ ] Rapier.js WASM loaded and running alongside Three.js
- [ ] Rigid bodies synced with Three.js meshes each frame
- [ ] Objects fall with gravity, collide with table/ground
- [ ] Hinge joints working (for valves/handles)
- [ ] Grasp mechanic: fixed constraint created on pinch + contact
- [ ] Grasp release: constraint removed on pinch release
- [ ] Physics timestep stable at 60-120 Hz

## Technical Details

### Rapier.js Setup
```typescript
import RAPIER from '@dimforge/rapier3d-compat';

await RAPIER.init();

const gravity = { x: 0.0, y: -9.81, z: 0.0 };
const world = new RAPIER.World(gravity);
```

### Rigid Body Sync
```typescript
function syncPhysicsToGraphics(
  body: RAPIER.RigidBody,
  mesh: THREE.Object3D
): void {
  const pos = body.translation();
  const rot = body.rotation();
  mesh.position.set(pos.x, pos.y, pos.z);
  mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
}
```

### Object Types
- **Dynamic**: cubes, bottles, movable objects (affected by gravity + forces)
- **Fixed/Static**: table, ground, valve base, wall mounts
- **Kinematic**: robot arm segments (driven by hand tracking, not physics)

### Hinge Joints (for valves/handles)
```typescript
const jointParams = RAPIER.JointData.revolute(
  anchor1,    // local anchor on body1
  anchor2,    // local anchor on body2
  axis        // rotation axis
);
world.createImpulseJoint(jointParams, body1, body2, true);
```

### Grasp Mechanics
```typescript
// On pinch detected + gripper overlapping object:
const graspJoint = RAPIER.JointData.fixed(
  gripperAnchor,
  gripperRotation,
  objectAnchor,
  objectRotation
);
const joint = world.createImpulseJoint(graspJoint, gripperBody, objectBody, true);

// On release:
world.removeImpulseJoint(joint, true);
```

### Collision Detection
- Use Rapier's contact pair queries to detect gripper-object overlap
- Collision groups to prevent arm self-collision

### Physics Config
- Fixed timestep: `1/120` seconds (120 Hz)
- Render at display refresh rate, step physics multiple times if needed
- Rapier's `world.step()` called in the animation loop

## References

- [Rapier.js docs](https://rapier.rs/docs/user_guides/javascript/getting_started_js)
- [Rapier joints](https://rapier.rs/docs/user_guides/javascript/joints)
- PDF: "Rapier offers excellent performance — 5-8x faster than older libraries"
