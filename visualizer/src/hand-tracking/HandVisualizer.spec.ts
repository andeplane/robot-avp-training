import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";
import { createHandVisualizer } from "./HandVisualizer";
import type { HandPose, JointData } from "./types";

describe(createHandVisualizer.name, () => {
	let scene: THREE.Scene;

	beforeEach(() => {
		scene = new THREE.Scene();
	});

	function createHandPose(
		handedness: "left" | "right",
		isPinching: boolean,
		jointPositions: Array<[XRHandJoint, { x: number; y: number; z: number }]>,
	): HandPose {
		const joints = new Map<XRHandJoint, JointData>();
		for (const [name, pos] of jointPositions) {
			joints.set(name, {
				position: pos,
				orientation: { x: 0, y: 0, z: 0, w: 1 },
				radius: 0.005,
			});
		}
		return {
			handedness,
			timestamp: 0,
			joints,
			pinchState: { isPinching, distance: isPinching ? 0.01 : 0.1 },
			wristPosition: { x: 0, y: 0, z: 0 },
			wristOrientation: { x: 0, y: 0, z: 0, w: 1 },
		};
	}

	it("should add joint spheres to scene when updating with hand poses", () => {
		const visualizer = createHandVisualizer(scene);
		const pose = createHandPose("left", false, [
			["wrist", { x: 0, y: 0, z: 0 }],
			["thumb-tip", { x: 0.1, y: 0, z: 0 }],
		]);

		visualizer.update(new Map([["left", pose]]));

		const meshes = scene.children.filter((c) => c instanceof THREE.Mesh);
		expect(meshes.length).toBeGreaterThanOrEqual(2);
	});

	it("should hide all meshes when no poses are provided", () => {
		const visualizer = createHandVisualizer(scene);
		const pose = createHandPose("left", false, [["wrist", { x: 0, y: 0, z: 0 }]]);

		visualizer.update(new Map([["left", pose]]));
		visualizer.update(new Map());

		for (const child of scene.children) {
			if (child instanceof THREE.Mesh) {
				expect(child.visible).toBe(false);
			}
		}
	});

	it("should position joint meshes at joint coordinates", () => {
		const visualizer = createHandVisualizer(scene);
		const pose = createHandPose("right", false, [["wrist", { x: 0.5, y: 1.0, z: -0.3 }]]);

		visualizer.update(new Map([["right", pose]]));

		const visibleMeshes = scene.children.filter((c) => c instanceof THREE.Mesh && c.visible);
		expect(visibleMeshes.length).toBe(1);
		const mesh = visibleMeshes[0] as THREE.Mesh;
		expect(mesh.position.x).toBeCloseTo(0.5);
		expect(mesh.position.y).toBeCloseTo(1.0);
		expect(mesh.position.z).toBeCloseTo(-0.3);
	});

	it("should remove all meshes from scene on dispose", () => {
		const visualizer = createHandVisualizer(scene);
		const pose = createHandPose("left", false, [["wrist", { x: 0, y: 0, z: 0 }]]);

		visualizer.update(new Map([["left", pose]]));
		expect(scene.children.length).toBeGreaterThan(0);

		visualizer.dispose();

		const meshes = scene.children.filter((c) => c instanceof THREE.Mesh);
		expect(meshes.length).toBe(0);
	});
});
