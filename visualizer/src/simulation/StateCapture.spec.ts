import RAPIER from "@dimforge/rapier3d-compat";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createGraspManager, type GraspManager } from "../physics/GraspManager";
import { createPhysicsWorld, type PhysicsWorld } from "../physics/PhysicsWorld";
import { captureState, type StateCaptureConfig } from "./StateCapture";

describe(captureState.name, () => {
	beforeAll(async () => {
		await RAPIER.init();
	});

	let physicsWorld: PhysicsWorld;
	let graspManager: GraspManager;
	let config: StateCaptureConfig;

	beforeEach(() => {
		physicsWorld = createPhysicsWorld();
		graspManager = createGraspManager({ physicsWorld });

		physicsWorld.addBody({
			id: "gripper-left",
			bodyType: "kinematic",
			position: { x: -0.4, y: 1.0, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.03, 0.03, 0.03),
		});
		physicsWorld.addBody({
			id: "gripper-right",
			bodyType: "kinematic",
			position: { x: 0.4, y: 1.0, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.03, 0.03, 0.03),
		});
		physicsWorld.addBody({
			id: "cube-1",
			bodyType: "dynamic",
			position: { x: 0, y: 0.85, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.025, 0.025, 0.025),
		});

		config = {
			armIds: { left: "gripper-left", right: "gripper-right" },
			objectIds: ["cube-1"],
			objectTypes: { "cube-1": "cube" },
		};
	});

	it("should capture arm positions from physics bodies", () => {
		const state = captureState({ physicsWorld, graspManager }, config);

		expect(state.leftArm.endEffectorPosition.x).toBeCloseTo(-0.4);
		expect(state.rightArm.endEffectorPosition.x).toBeCloseTo(0.4);
	});

	it("should capture object state", () => {
		const state = captureState({ physicsWorld, graspManager }, config);

		expect(state.objects).toHaveLength(1);
		expect(state.objects[0]?.id).toBe("cube-1");
		expect(state.objects[0]?.type).toBe("cube");
		expect(state.objects[0]?.position.y).toBeCloseTo(0.85);
	});

	it("should report grasping state", () => {
		graspManager.tryGrasp("gripper-left", "cube-1");

		const state = captureState({ physicsWorld, graspManager }, config);

		expect(state.leftArm.isGrasping).toBe(true);
		expect(state.leftArm.graspedObjectId).toBe("cube-1");
		expect(state.rightArm.isGrasping).toBe(false);
	});

	it("should return default arm state for missing body", () => {
		const configWithMissing: StateCaptureConfig = {
			armIds: { left: "nonexistent", right: "gripper-right" },
			objectIds: [],
			objectTypes: {},
		};

		const state = captureState({ physicsWorld, graspManager }, configWithMissing);

		expect(state.leftArm.endEffectorPosition).toEqual({ x: 0, y: 0, z: 0 });
		expect(state.leftArm.gripperOpen).toBe(1);
	});

	it("should include timestamp", () => {
		const state = captureState({ physicsWorld, graspManager }, config);

		expect(state.timestamp).toBeGreaterThan(0);
	});
});
