import RAPIER from "@dimforge/rapier3d-compat";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createGraspManager, type GraspManager } from "./GraspManager";
import { createPhysicsWorld, type PhysicsWorld } from "./PhysicsWorld";

describe(createGraspManager.name, () => {
	beforeAll(async () => {
		await RAPIER.init();
	});

	let physicsWorld: PhysicsWorld;
	let graspManager: GraspManager;

	beforeEach(() => {
		physicsWorld = createPhysicsWorld();
		graspManager = createGraspManager({ physicsWorld });

		physicsWorld.addBody({
			id: "gripper-left",
			bodyType: "kinematic",
			position: { x: 0, y: 1, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.03, 0.03, 0.03),
		});

		physicsWorld.addBody({
			id: "cube-1",
			bodyType: "dynamic",
			position: { x: 0, y: 1, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.025, 0.025, 0.025),
		});
	});

	it("should create a grasp constraint", () => {
		const result = graspManager.tryGrasp("gripper-left", "cube-1");

		expect(result).not.toBeNull();
		expect(result?.objectId).toBe("cube-1");
		expect(graspManager.isGrasping("gripper-left")).toBe(true);
	});

	it("should not double-grasp with the same gripper", () => {
		graspManager.tryGrasp("gripper-left", "cube-1");
		const second = graspManager.tryGrasp("gripper-left", "cube-1");

		expect(second).toBeNull();
	});

	it("should return null when gripper body does not exist", () => {
		const result = graspManager.tryGrasp("nonexistent", "cube-1");

		expect(result).toBeNull();
	});

	it("should return null when object body does not exist", () => {
		const result = graspManager.tryGrasp("gripper-left", "nonexistent");

		expect(result).toBeNull();
	});

	it("should release a grasp", () => {
		graspManager.tryGrasp("gripper-left", "cube-1");

		graspManager.release("gripper-left");

		expect(graspManager.isGrasping("gripper-left")).toBe(false);
		expect(graspManager.getGraspedObjectId("gripper-left")).toBeNull();
	});

	it("should allow re-grasping after release", () => {
		graspManager.tryGrasp("gripper-left", "cube-1");
		graspManager.release("gripper-left");

		const result = graspManager.tryGrasp("gripper-left", "cube-1");

		expect(result).not.toBeNull();
	});

	it("should report grasped object id", () => {
		graspManager.tryGrasp("gripper-left", "cube-1");

		expect(graspManager.getGraspedObjectId("gripper-left")).toBe("cube-1");
	});

	it("should return null for ungrasped gripper object id", () => {
		expect(graspManager.getGraspedObjectId("gripper-left")).toBeNull();
	});

	it("should release all grasps", () => {
		physicsWorld.addBody({
			id: "gripper-right",
			bodyType: "kinematic",
			position: { x: 0.5, y: 1, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.03, 0.03, 0.03),
		});
		physicsWorld.addBody({
			id: "cube-2",
			bodyType: "dynamic",
			position: { x: 0.5, y: 1, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.025, 0.025, 0.025),
		});

		graspManager.tryGrasp("gripper-left", "cube-1");
		graspManager.tryGrasp("gripper-right", "cube-2");

		graspManager.releaseAll();

		expect(graspManager.isGrasping("gripper-left")).toBe(false);
		expect(graspManager.isGrasping("gripper-right")).toBe(false);
	});
});
