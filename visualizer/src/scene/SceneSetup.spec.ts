import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import { createScene, type SceneSetupDependencies, type Viewport } from "./SceneSetup";

describe(createScene.name, () => {
	function createMockRenderer(): THREE.WebGLRenderer {
		return {
			setPixelRatio: vi.fn(),
			setSize: vi.fn(),
			xr: { enabled: false },
		} as unknown as THREE.WebGLRenderer;
	}

	const mockViewport: Viewport = { width: 1920, height: 1080, pixelRatio: 1 };

	function createDeps(overrides?: Partial<SceneSetupDependencies>): SceneSetupDependencies {
		return {
			createRenderer: () => createMockRenderer(),
			getViewport: () => mockViewport,
			...overrides,
		};
	}

	it("should create a scene with all components", () => {
		const deps = createDeps();
		const result = createScene(deps);

		expect(result.scene).toBeInstanceOf(THREE.Scene);
		expect(result.camera).toBeInstanceOf(THREE.PerspectiveCamera);
		expect(result.renderer).toBeDefined();
		expect(result.groundPlane).toBeInstanceOf(THREE.Mesh);
	});

	it("should add lighting to the scene", () => {
		const deps = createDeps();
		const { scene } = createScene(deps);

		const lights = scene.children.filter((child) => child instanceof THREE.Light);
		expect(lights.length).toBeGreaterThanOrEqual(2);
	});

	it("should create a horizontal ground plane", () => {
		const deps = createDeps();
		const { groundPlane } = createScene(deps);

		expect(groundPlane.rotation.x).toBeCloseTo(-Math.PI / 2);
		expect(groundPlane.position.y).toBe(0);
	});

	it("should add the ground plane to the scene", () => {
		const deps = createDeps();
		const { scene, groundPlane } = createScene(deps);

		expect(scene.children).toContain(groundPlane);
	});

	it("should use injected renderer factory", () => {
		const mockRenderer = createMockRenderer();
		const factory = vi.fn(() => mockRenderer);
		const deps = createDeps({ createRenderer: factory });

		const { renderer } = createScene(deps);

		expect(factory).toHaveBeenCalled();
		expect(renderer).toBe(mockRenderer);
	});
});
