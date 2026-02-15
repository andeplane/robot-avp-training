import { describe, expect, it } from "vitest";
import type { HandPose } from "../hand-tracking/types";
import { createHandToArmMapper, quaternionToEuler } from "./HandToArmMapper";

describe(createHandToArmMapper.name, () => {
	it("should return zero deltas when no previous pose", () => {
		const mapper = createHandToArmMapper();
		const current = createHandPose({ x: 0.5, y: 1.0, z: -0.3 }, false);

		const action = mapper.mapHandToAction(current, null);

		expect(action.dx).toBe(0);
		expect(action.dy).toBe(0);
		expect(action.dz).toBe(0);
		expect(action.gripper).toBe(1);
	});

	it("should compute translation deltas from wrist position changes", () => {
		const mapper = createHandToArmMapper();
		const previous = createHandPose({ x: 0, y: 1, z: 0 }, false);
		const current = createHandPose({ x: 0.1, y: 1.05, z: -0.02 }, false);

		const action = mapper.mapHandToAction(current, previous);

		expect(action.dx).toBeCloseTo(0.1);
		expect(action.dy).toBeCloseTo(0.05);
		expect(action.dz).toBeCloseTo(-0.02);
	});

	it("should map pinch to gripper closed (0)", () => {
		const mapper = createHandToArmMapper();
		const previous = createHandPose({ x: 0, y: 0, z: 0 }, false);
		const current = createHandPose({ x: 0, y: 0, z: 0 }, true);

		const action = mapper.mapHandToAction(current, previous);

		expect(action.gripper).toBe(0);
	});

	it("should map no pinch to gripper open (1)", () => {
		const mapper = createHandToArmMapper();
		const previous = createHandPose({ x: 0, y: 0, z: 0 }, true);
		const current = createHandPose({ x: 0, y: 0, z: 0 }, false);

		const action = mapper.mapHandToAction(current, previous);

		expect(action.gripper).toBe(1);
	});

	it("should apply translation scale", () => {
		const mapper = createHandToArmMapper({ translationScale: 2.0 });
		const previous = createHandPose({ x: 0, y: 0, z: 0 }, false);
		const current = createHandPose({ x: 0.1, y: 0, z: 0 }, false);

		const action = mapper.mapHandToAction(current, previous);

		expect(action.dx).toBeCloseTo(0.2);
	});

	it("should return zero rotation deltas when orientation unchanged", () => {
		const mapper = createHandToArmMapper();
		const previous = createHandPose({ x: 0, y: 0, z: 0 }, false);
		const current = createHandPose({ x: 0, y: 0, z: 0 }, false);

		const action = mapper.mapHandToAction(current, previous);

		expect(action.droll).toBeCloseTo(0);
		expect(action.dpitch).toBeCloseTo(0);
		expect(action.dyaw).toBeCloseTo(0);
	});
});

describe(quaternionToEuler.name, () => {
	it("should return zero angles for identity quaternion", () => {
		const euler = quaternionToEuler({ x: 0, y: 0, z: 0, w: 1 });

		expect(euler.roll).toBeCloseTo(0);
		expect(euler.pitch).toBeCloseTo(0);
		expect(euler.yaw).toBeCloseTo(0);
	});

	it.each([
		{
			name: "90 deg around Z (yaw)",
			q: { x: 0, y: 0, z: Math.SQRT1_2, w: Math.SQRT1_2 },
			expectedYaw: Math.PI / 2,
		},
		{
			name: "90 deg around X (roll)",
			q: { x: Math.SQRT1_2, y: 0, z: 0, w: Math.SQRT1_2 },
			expectedYaw: 0,
		},
	])("should compute angles for $name", ({ q, expectedYaw }) => {
		const euler = quaternionToEuler(q);
		expect(euler.yaw).toBeCloseTo(expectedYaw, 3);
	});
});

function createHandPose(
	wristPos: { x: number; y: number; z: number },
	isPinching: boolean,
): HandPose {
	return {
		handedness: "right",
		timestamp: 0,
		joints: new Map(),
		pinchState: { isPinching, distance: isPinching ? 0.01 : 0.1 },
		wristPosition: wristPos,
		wristOrientation: { x: 0, y: 0, z: 0, w: 1 },
	};
}
