import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createPhysicsWorld, type PhysicsWorld } from "../physics/PhysicsWorld";
import { createPickAndPlaceTask } from "./PickAndPlaceTask";
import type { TaskEnvironmentDependencies } from "./types";

describe(createPickAndPlaceTask.name, () => {
	beforeAll(async () => {
		await RAPIER.init();
	});

	let scene: THREE.Scene;
	let physicsWorld: PhysicsWorld;
	let deps: TaskEnvironmentDependencies;

	beforeEach(() => {
		scene = new THREE.Scene();
		physicsWorld = createPhysicsWorld();
		deps = { scene, physicsWorld };
	});

	it("should set up objects and table in the scene", () => {
		const task = createPickAndPlaceTask(deps);
		task.setup();

		expect(scene.children.length).toBeGreaterThan(0);
		expect(physicsWorld.getBody("table")).toBeDefined();
		expect(physicsWorld.getBody("pick-object-0")).toBeDefined();
		expect(physicsWorld.getBody("pick-object-1")).toBeDefined();
	});

	it("should report type as pick-and-place", () => {
		const task = createPickAndPlaceTask(deps);
		expect(task.type).toBe("pick-and-place");
	});

	it("should teardown and remove all objects", () => {
		const task = createPickAndPlaceTask(deps);
		task.setup();
		task.teardown();

		expect(physicsWorld.getBody("table")).toBeUndefined();
		expect(physicsWorld.getBody("pick-object-0")).toBeUndefined();
	});

	it("should report not successful when objects are not in target zones", () => {
		const task = createPickAndPlaceTask(deps);
		task.setup();

		expect(task.checkSuccess()).toBe(false);
	});

	it("should report successful when objects are in target zones", () => {
		const task = createPickAndPlaceTask(deps, {
			objectCount: 1,
			objectPositions: [{ x: 0.2, y: 0.85, z: 0.15 }],
			targetZones: [{ position: { x: 0.2, y: 0.81, z: 0.15 }, radius: 0.06 }],
		});
		task.setup();

		expect(task.checkSuccess()).toBe(true);
	});

	it("should return progress between 0 and 1", () => {
		const task = createPickAndPlaceTask(deps);
		task.setup();

		const progress = task.getProgress();
		expect(progress).toBeGreaterThanOrEqual(0);
		expect(progress).toBeLessThanOrEqual(1);
	});

	it("should reset objects to initial positions", () => {
		const task = createPickAndPlaceTask(deps);
		task.setup();

		// Move object away
		const body = physicsWorld.getBody("pick-object-0");
		body?.rigidBody.setTranslation({ x: 5, y: 5, z: 5 }, true);

		task.reset();

		const pos = body?.rigidBody.translation();
		expect(pos?.x).toBeCloseTo(-0.1);
		expect(pos?.y).toBeCloseTo(0.85);
	});
});
