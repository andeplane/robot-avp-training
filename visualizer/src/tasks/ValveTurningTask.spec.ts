import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createPhysicsWorld, type PhysicsWorld } from "../physics/PhysicsWorld";
import type { TaskEnvironmentDependencies } from "./types";
import { createValveTurningTask } from "./ValveTurningTask";

describe(createValveTurningTask.name, () => {
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

	it("should set up valve mount and handle", () => {
		const task = createValveTurningTask(deps);
		task.setup();

		expect(physicsWorld.getBody("valve-mount")).toBeDefined();
		expect(physicsWorld.getBody("valve-handle")).toBeDefined();
		expect(scene.children.length).toBeGreaterThan(0);
	});

	it("should report type as valve-turning", () => {
		const task = createValveTurningTask(deps);
		expect(task.type).toBe("valve-turning");
	});

	it("should teardown cleanly", () => {
		const task = createValveTurningTask(deps);
		task.setup();
		task.teardown();

		expect(physicsWorld.getBody("valve-mount")).toBeUndefined();
		expect(physicsWorld.getBody("valve-handle")).toBeUndefined();
	});

	it("should report not successful at initial state", () => {
		const task = createValveTurningTask(deps);
		task.setup();

		expect(task.checkSuccess()).toBe(false);
	});

	it("should return progress between 0 and 1", () => {
		const task = createValveTurningTask(deps);
		task.setup();

		const progress = task.getProgress();
		expect(progress).toBeGreaterThanOrEqual(0);
		expect(progress).toBeLessThanOrEqual(1);
	});

	it("should reset valve rotation", () => {
		const task = createValveTurningTask(deps);
		task.setup();

		task.reset();

		const body = physicsWorld.getBody("valve-handle");
		const rot = body?.rigidBody.rotation();
		expect(rot?.w).toBeCloseTo(1);
	});
});
