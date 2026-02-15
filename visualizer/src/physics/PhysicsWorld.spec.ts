import RAPIER from "@dimforge/rapier3d-compat";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createPhysicsWorld, type PhysicsWorld } from "./PhysicsWorld";

describe(createPhysicsWorld.name, () => {
	beforeAll(async () => {
		await RAPIER.init();
	});

	let world: PhysicsWorld;

	beforeEach(() => {
		world = createPhysicsWorld();
	});

	it("should create a physics world with gravity", () => {
		expect(world.getWorld()).toBeDefined();
	});

	it("should add a dynamic rigid body", () => {
		const handle = world.addBody({
			id: "box1",
			bodyType: "dynamic",
			position: { x: 0, y: 5, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5),
		});

		expect(handle.id).toBe("box1");
		expect(handle.rigidBody).toBeDefined();
		expect(world.getBody("box1")).toBe(handle);
	});

	it("should add a fixed rigid body", () => {
		const handle = world.addBody({
			id: "ground",
			bodyType: "fixed",
			position: { x: 0, y: 0, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(5, 0.1, 5),
		});

		expect(handle.rigidBody.isFixed()).toBe(true);
	});

	it("should add a kinematic rigid body", () => {
		const handle = world.addBody({
			id: "arm-segment",
			bodyType: "kinematic",
			position: { x: 0, y: 1, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cylinder(0.1, 0.02),
		});

		expect(handle.rigidBody.isKinematic()).toBe(true);
	});

	it("should step the physics world and apply gravity", () => {
		world.addBody({
			id: "falling-box",
			bodyType: "dynamic",
			position: { x: 0, y: 5, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5),
		});

		for (let i = 0; i < 10; i++) {
			world.step();
		}

		const body = world.getBody("falling-box");
		expect(body?.rigidBody.translation().y).toBeLessThan(5);
	});

	it("should remove a body", () => {
		world.addBody({
			id: "temp",
			bodyType: "dynamic",
			position: { x: 0, y: 0, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.ball(0.5),
		});

		world.removeBody("temp");

		expect(world.getBody("temp")).toBeUndefined();
	});

	it("should create a revolute joint between two bodies", () => {
		world.addBody({
			id: "body-a",
			bodyType: "fixed",
			position: { x: 0, y: 0, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.1, 0.1, 0.1),
		});
		world.addBody({
			id: "body-b",
			bodyType: "dynamic",
			position: { x: 0, y: 0.5, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.1, 0.1, 0.1),
		});

		const joint = world.createRevoluteJoint(
			"body-a",
			"body-b",
			{ x: 0, y: 0.25, z: 0 },
			{ x: 0, y: -0.25, z: 0 },
			{ x: 0, y: 0, z: 1 },
		);

		expect(joint).toBeDefined();
	});

	it("should create a fixed joint between two bodies", () => {
		world.addBody({
			id: "gripper",
			bodyType: "kinematic",
			position: { x: 0, y: 1, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.05, 0.05, 0.05),
		});
		world.addBody({
			id: "object",
			bodyType: "dynamic",
			position: { x: 0, y: 1, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.05, 0.05, 0.05),
		});

		const joint = world.createFixedJoint(
			"gripper",
			"object",
			{ x: 0, y: 0, z: 0 },
			{ x: 0, y: 0, z: 0, w: 1 },
			{ x: 0, y: 0, z: 0 },
			{ x: 0, y: 0, z: 0, w: 1 },
		);

		expect(joint).toBeDefined();
	});

	it("should throw when creating joint with non-existent body", () => {
		world.addBody({
			id: "exists",
			bodyType: "dynamic",
			position: { x: 0, y: 0, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.ball(0.1),
		});

		expect(() =>
			world.createRevoluteJoint(
				"exists",
				"nonexistent",
				{ x: 0, y: 0, z: 0 },
				{ x: 0, y: 0, z: 0 },
				{ x: 0, y: 1, z: 0 },
			),
		).toThrow("Body not found");
	});

	it("should return all bodies", () => {
		world.addBody({
			id: "a",
			bodyType: "dynamic",
			position: { x: 0, y: 0, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.ball(0.1),
		});
		world.addBody({
			id: "b",
			bodyType: "fixed",
			position: { x: 1, y: 0, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.ball(0.1),
		});

		const all = world.getAllBodies();
		expect(all.size).toBe(2);
		expect(all.has("a")).toBe(true);
		expect(all.has("b")).toBe(true);
	});

	it("should accept custom gravity and timestep", () => {
		const custom = createPhysicsWorld({
			gravity: { x: 0, y: -1.62, z: 0 },
			timestep: 1 / 60,
		});

		expect(custom.getWorld().timestep).toBeCloseTo(1 / 60);
	});
});
