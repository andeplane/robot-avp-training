import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createPhysicsWorld, type PhysicsWorld } from "../physics/PhysicsWorld";
import type { TaskType } from "../simulation/types";
import { createTaskManager, type TaskManager } from "./TaskManager";
import type { TaskEnvironmentDependencies } from "./types";

describe(createTaskManager.name, () => {
	beforeAll(async () => {
		await RAPIER.init();
	});

	let scene: THREE.Scene;
	let physicsWorld: PhysicsWorld;
	let deps: TaskEnvironmentDependencies;
	let manager: TaskManager;

	beforeEach(() => {
		scene = new THREE.Scene();
		physicsWorld = createPhysicsWorld();
		deps = { scene, physicsWorld };
		manager = createTaskManager(deps);
	});

	it.each([
		"pick-and-place" as TaskType,
		"valve-turning" as TaskType,
		"handle-rotation" as TaskType,
	])("should load %s task environment", (taskType) => {
		const task = manager.loadTask(taskType);

		expect(task.type).toBe(taskType);
		expect(manager.getCurrentTask()).toBe(task);
		expect(scene.children.length).toBeGreaterThan(0);
	});

	it("should unload task and clear scene objects", () => {
		manager.loadTask("pick-and-place");
		manager.unloadTask();

		expect(manager.getCurrentTask()).toBeNull();
	});

	it("should teardown previous task when loading new one", () => {
		manager.loadTask("pick-and-place");
		const pickBodies = physicsWorld.getBody("pick-object-0");
		expect(pickBodies).toBeDefined();

		manager.loadTask("valve-turning");

		expect(physicsWorld.getBody("pick-object-0")).toBeUndefined();
		expect(physicsWorld.getBody("valve-mount")).toBeDefined();
	});

	it("should delegate checkSuccess to current task", () => {
		manager.loadTask("pick-and-place");
		expect(manager.checkSuccess()).toBe(false);
	});

	it("should return 0 for checkSuccess when no task loaded", () => {
		expect(manager.checkSuccess()).toBe(false);
	});

	it("should return progress from current task", () => {
		manager.loadTask("pick-and-place");
		const progress = manager.getProgress();

		expect(progress).toBeGreaterThanOrEqual(0);
		expect(progress).toBeLessThanOrEqual(1);
	});

	it("should return 0 progress when no task loaded", () => {
		expect(manager.getProgress()).toBe(0);
	});

	it("should reset current task", () => {
		manager.loadTask("pick-and-place");

		// Move object away
		const body = physicsWorld.getBody("pick-object-0");
		body?.rigidBody.setTranslation({ x: 99, y: 99, z: 99 }, true);

		manager.resetCurrentTask();

		const pos = body?.rigidBody.translation();
		expect(pos?.x).toBeCloseTo(-0.1);
	});
});
