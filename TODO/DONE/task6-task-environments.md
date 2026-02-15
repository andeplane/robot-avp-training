# Task 6: Task Environments

## Summary

Create distinct task environment configurations within the Three.js scene. Each task has specific objects, constraints, and success conditions. Support switching between tasks.

## Acceptance Criteria

- [ ] Pick-and-place environment: table, cubes/objects, target zones
- [ ] Valve turning environment: rotatable wheel with hinge joint
- [ ] Handle rotation environment: lever with angular limits
- [ ] Visual feedback for success (e.g., color change, particle effect)
- [ ] Task switching via configuration
- [ ] Success condition checks per task

## Technical Details

### Pick-and-Place
- Table surface at y=0.8m
- Cubes (5cm) at random positions on table
- Target zone marked with outline or colored area
- Success: object center within target zone bounds

```typescript
interface PickPlaceConfig {
  objectCount: number;
  objectPositions: Vector3[];
  targetZones: { position: Vector3; radius: number }[];
}
```

### Valve Turning
- Circular valve handle (torus geometry) mounted on wall/surface
- Hinge joint constraining to single rotation axis
- Add friction/resistance to the joint
- Success: valve rotated past target angle (e.g., 180 degrees)

```typescript
interface ValveConfig {
  position: Vector3;
  axis: Vector3;        // rotation axis
  targetAngle: number;  // radians
  friction: number;
}
```

### Handle Rotation
- Lever/handle attached via hinge with angular limits
- Limits: e.g., 0 to 90 degrees
- Success: handle rotated to target angle

```typescript
interface HandleConfig {
  position: Vector3;
  axis: Vector3;
  minAngle: number;
  maxAngle: number;
  targetAngle: number;
}
```

### Task Manager
```typescript
type TaskType = 'pick-and-place' | 'valve-turning' | 'handle-rotation';

interface TaskEnvironment {
  type: TaskType;
  setup(): void;          // create objects in scene + physics
  teardown(): void;       // remove objects
  checkSuccess(): boolean;
  reset(): void;          // reset to initial state
}
```

### Visual Feedback
- Green glow/outline on successful task completion
- Progress indicator for continuous tasks (valve angle %)
- Object highlight when hovered/grasped

## References

- PDF: "Pick-and-Place", "Valve Turning", "Handle Rotation" sections
- PDF: "Implement a way to reset the scene to initial conditions"
