import RAPIER from "@dimforge/rapier3d-compat";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createGraspManager, type GraspManager } from "../physics/GraspManager";
import { createPhysicsWorld, type PhysicsWorld } from "../physics/PhysicsWorld";
import type { ArmSide } from "../robot/types";
import { createSimulationManager, type SimulationManager } from "./SimulationManager";
import type { StateCaptureConfig } from "./StateCapture";
import type { DualArmAction } from "./types";
import { createZeroDualAction } from "./types";

describe(createSimulationManager.name, () => {
	beforeAll(async () => {
		await RAPIER.init();
	});

	let physicsWorld: PhysicsWorld;
	let graspManager: GraspManager;
	let simManager: SimulationManager;
	let applyArmAction: ReturnType<typeof vi.fn<(side: ArmSide, action: DualArmAction) => void>>;

	const captureConfig: StateCaptureConfig = {
		armIds: { left: "gripper-left", right: "gripper-right" },
		objectIds: ["cube-1"],
		objectTypes: { "cube-1": "cube" },
	};

	beforeEach(() => {
		physicsWorld = createPhysicsWorld();
		graspManager = createGraspManager({ physicsWorld });
		applyArmAction = vi.fn();

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
			position: { x: 0, y: 5, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.025, 0.025, 0.025),
		});

		simManager = createSimulationManager({
			physicsWorld,
			graspManager,
			applyArmAction,
			stateCaptureConfig: captureConfig,
		});
	});

	it("should step the simulation and return state", () => {
		const action = createZeroDualAction();
		const state = simManager.step(action);

		expect(state.leftArm).toBeDefined();
		expect(state.rightArm).toBeDefined();
		expect(state.objects).toHaveLength(1);
	});

	it("should call applyArmAction for both arms", () => {
		const action = createZeroDualAction();
		simManager.step(action);

		expect(applyArmAction).toHaveBeenCalledWith("left", action);
		expect(applyArmAction).toHaveBeenCalledWith("right", action);
	});

	it("should advance physics on step (object should fall)", () => {
		const action = createZeroDualAction();

		for (let i = 0; i < 60; i++) {
			simManager.step(action);
		}

		const state = simManager.getState();
		expect(state.objects[0]?.position.y).toBeLessThan(5);
	});

	it("should return current state via getState()", () => {
		const state = simManager.getState();

		expect(state.timestamp).toBeDefined();
		expect(state.leftArm).toBeDefined();
	});

	it("should release all grasps on reset", () => {
		graspManager.tryGrasp("gripper-left", "cube-1");
		expect(graspManager.isGrasping("gripper-left")).toBe(true);

		simManager.reset();

		expect(graspManager.isGrasping("gripper-left")).toBe(false);
	});

	it("should return fresh state after reset", () => {
		const action = createZeroDualAction();
		simManager.step(action);

		const resetState = simManager.reset();

		expect(resetState.timestamp).toBeGreaterThan(0);
		expect(resetState.leftArm.isGrasping).toBe(false);
	});
});
