import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createPhysicsWorld, type PhysicsWorld } from "../physics/PhysicsWorld";
import { createHandleRotationTask } from "./HandleRotationTask";
import type { TaskEnvironmentDependencies } from "./types";

describe(createHandleRotationTask.name, () => {
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

	it("should set up handle mount and lever", () => {
		const task = createHandleRotationTask(deps);
		task.setup();

		expect(physicsWorld.getBody("handle-mount")).toBeDefined();
		expect(physicsWorld.getBody("handle-lever")).toBeDefined();
		expect(scene.children.length).toBeGreaterThan(0);
	});

	it("should report type as handle-rotation", () => {
		const task = createHandleRotationTask(deps);
		expect(task.type).toBe("handle-rotation");
	});

	it("should teardown cleanly", () => {
		const task = createHandleRotationTask(deps);
		task.setup();
		task.teardown();

		expect(physicsWorld.getBody("handle-mount")).toBeUndefined();
		expect(physicsWorld.getBody("handle-lever")).toBeUndefined();
	});

	it("should report not successful at initial state", () => {
		const task = createHandleRotationTask(deps);
		task.setup();

		expect(task.checkSuccess()).toBe(false);
	});

	it("should return progress between 0 and 1", () => {
		const task = createHandleRotationTask(deps);
		task.setup();

		const progress = task.getProgress();
		expect(progress).toBeGreaterThanOrEqual(0);
		expect(progress).toBeLessThanOrEqual(1);
	});

	it("should reset handle to initial position", () => {
		const task = createHandleRotationTask(deps);
		task.setup();

		task.reset();

		const body = physicsWorld.getBody("handle-lever");
		const rot = body?.rigidBody.rotation();
		expect(rot?.w).toBeCloseTo(1);
	});
});
