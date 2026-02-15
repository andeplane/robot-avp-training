import { describe, expect, it } from "vitest";
import { createPinchDetector, vec3Distance } from "./PinchDetector";
import type { JointData, Vec3 } from "./types";
import { PINCH_THRESHOLD } from "./types";

describe(createPinchDetector.name, () => {
	function createJointMap(
		thumbTipPos: Vec3 | null,
		indexTipPos: Vec3 | null,
	): Map<XRHandJoint, JointData> {
		const joints = new Map<XRHandJoint, JointData>();
		if (thumbTipPos) {
			joints.set("thumb-tip", createJointData(thumbTipPos));
		}
		if (indexTipPos) {
			joints.set("index-finger-tip", createJointData(indexTipPos));
		}
		return joints;
	}

	it.each([
		{
			name: "pinching when fingers are close",
			thumbPos: { x: 0, y: 0, z: 0 },
			indexPos: { x: 0.01, y: 0, z: 0 },
			expectedPinching: true,
		},
		{
			name: "not pinching when fingers are far apart",
			thumbPos: { x: 0, y: 0, z: 0 },
			indexPos: { x: 0.1, y: 0, z: 0 },
			expectedPinching: false,
		},
		{
			name: "pinching at exactly threshold distance",
			thumbPos: { x: 0, y: 0, z: 0 },
			indexPos: { x: PINCH_THRESHOLD - 0.001, y: 0, z: 0 },
			expectedPinching: true,
		},
		{
			name: "not pinching at just over threshold",
			thumbPos: { x: 0, y: 0, z: 0 },
			indexPos: { x: PINCH_THRESHOLD + 0.001, y: 0, z: 0 },
			expectedPinching: false,
		},
	])("should detect $name", ({ thumbPos, indexPos, expectedPinching }) => {
		const detector = createPinchDetector();
		const joints = createJointMap(thumbPos, indexPos);

		const result = detector.detect(joints);

		expect(result.isPinching).toBe(expectedPinching);
	});

	it("should return not pinching when thumb tip is missing", () => {
		const detector = createPinchDetector();
		const joints = createJointMap(null, { x: 0, y: 0, z: 0 });

		const result = detector.detect(joints);

		expect(result.isPinching).toBe(false);
		expect(result.distance).toBe(Number.POSITIVE_INFINITY);
	});

	it("should return not pinching when index tip is missing", () => {
		const detector = createPinchDetector();
		const joints = createJointMap({ x: 0, y: 0, z: 0 }, null);

		const result = detector.detect(joints);

		expect(result.isPinching).toBe(false);
	});

	it("should use custom threshold when provided", () => {
		const detector = createPinchDetector({ threshold: 0.05 });
		const joints = createJointMap({ x: 0, y: 0, z: 0 }, { x: 0.04, y: 0, z: 0 });

		const result = detector.detect(joints);

		expect(result.isPinching).toBe(true);
	});

	it("should calculate correct distance", () => {
		const detector = createPinchDetector();
		const joints = createJointMap({ x: 0, y: 0, z: 0 }, { x: 0.03, y: 0.04, z: 0 });

		const result = detector.detect(joints);

		expect(result.distance).toBeCloseTo(0.05, 6);
	});
});

describe(vec3Distance.name, () => {
	it.each([
		{ a: { x: 0, y: 0, z: 0 }, b: { x: 1, y: 0, z: 0 }, expected: 1 },
		{ a: { x: 0, y: 0, z: 0 }, b: { x: 3, y: 4, z: 0 }, expected: 5 },
		{ a: { x: 1, y: 2, z: 3 }, b: { x: 1, y: 2, z: 3 }, expected: 0 },
		{ a: { x: 0, y: 0, z: 0 }, b: { x: 1, y: 1, z: 1 }, expected: Math.sqrt(3) },
	])("should return $expected for ($a.x,$a.y,$a.z) to ($b.x,$b.y,$b.z)", ({ a, b, expected }) => {
		expect(vec3Distance(a, b)).toBeCloseTo(expected, 6);
	});
});

function createJointData(position: Vec3): JointData {
	return {
		position,
		orientation: { x: 0, y: 0, z: 0, w: 1 },
		radius: 0.005,
	};
}
