import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHandTracker, type HandTrackerDependencies } from "./HandTracker";

describe(createHandTracker.name, () => {
	let mockGetJointPose: ReturnType<typeof vi.fn>;
	let mockFrame: XRFrame;
	let mockReferenceSpace: XRReferenceSpace;

	beforeEach(() => {
		mockGetJointPose = vi.fn();
		mockReferenceSpace = {} as XRReferenceSpace;
		mockFrame = {
			session: { inputSources: [] },
			getJointPose: mockGetJointPose,
		} as unknown as XRFrame;
	});

	function createMockHand(joints: Record<string, object>): XRHand {
		const map = new Map(Object.entries(joints));
		return {
			get: (name: string) => map.get(name),
			[Symbol.iterator]: () => map[Symbol.iterator](),
			size: map.size,
		} as unknown as XRHand;
	}

	function createMockInputSource(handedness: XRHandedness, hand: XRHand | null): XRInputSource {
		return { handedness, hand } as unknown as XRInputSource;
	}

	function createMockJointPose(x: number, y: number, z: number, radius = 0.005): XRJointPose {
		return {
			transform: {
				position: { x, y, z, w: 1 },
				orientation: { x: 0, y: 0, z: 0, w: 1 },
				matrix: new Float32Array(16),
				inverse: {} as unknown as DOMPointReadOnly,
			},
			radius,
			emulatedPosition: false,
		} as unknown as XRJointPose;
	}

	function createDeps(inputSources: XRInputSource[]): HandTrackerDependencies {
		return {
			getInputSources: () => inputSources,
		};
	}

	it("should return empty map when no input sources have hands", () => {
		const deps = createDeps([createMockInputSource("none", null)]);
		const tracker = createHandTracker(deps);

		const result = tracker.update(mockFrame, mockReferenceSpace);

		expect(result.size).toBe(0);
	});

	it("should track a left hand with joint data", () => {
		const wristSpace = {};
		const hand = createMockHand({ wrist: wristSpace });
		const inputSources = [createMockInputSource("left", hand)];
		const deps = createDeps(inputSources);

		mockGetJointPose.mockReturnValue(createMockJointPose(0.1, 0.2, 0.3));

		const tracker = createHandTracker(deps);
		const result = tracker.update(mockFrame, mockReferenceSpace);

		expect(result.has("left")).toBe(true);
		const pose = result.get("left");
		expect(pose?.handedness).toBe("left");
		expect(pose?.wristPosition).toEqual({ x: 0.1, y: 0.2, z: 0.3 });
	});

	it("should track both hands simultaneously", () => {
		const leftHand = createMockHand({ wrist: {} });
		const rightHand = createMockHand({ wrist: {} });
		const inputSources = [
			createMockInputSource("left", leftHand),
			createMockInputSource("right", rightHand),
		];
		const deps = createDeps(inputSources);

		mockGetJointPose.mockReturnValue(createMockJointPose(0, 1, 0));

		const tracker = createHandTracker(deps);
		const result = tracker.update(mockFrame, mockReferenceSpace);

		expect(result.has("left")).toBe(true);
		expect(result.has("right")).toBe(true);
	});

	it("should detect pinch when thumb and index tips are close", () => {
		const thumbTipSpace = { id: "thumb-tip" };
		const indexTipSpace = { id: "index-finger-tip" };
		const wristSpace = { id: "wrist" };
		const hand = createMockHand({
			wrist: wristSpace,
			"thumb-tip": thumbTipSpace,
			"index-finger-tip": indexTipSpace,
		});
		const deps = createDeps([createMockInputSource("right", hand)]);

		mockGetJointPose.mockImplementation((space: unknown) => {
			if (space === thumbTipSpace) return createMockJointPose(0, 0, 0);
			if (space === indexTipSpace) return createMockJointPose(0.01, 0, 0);
			return createMockJointPose(0, 0, 0);
		});

		const tracker = createHandTracker(deps);
		const result = tracker.update(mockFrame, mockReferenceSpace);

		expect(result.get("right")?.pinchState.isPinching).toBe(true);
	});

	it("should not detect pinch when thumb and index tips are far", () => {
		const thumbTipSpace = { id: "thumb-tip" };
		const indexTipSpace = { id: "index-finger-tip" };
		const wristSpace = { id: "wrist" };
		const hand = createMockHand({
			wrist: wristSpace,
			"thumb-tip": thumbTipSpace,
			"index-finger-tip": indexTipSpace,
		});
		const deps = createDeps([createMockInputSource("left", hand)]);

		mockGetJointPose.mockImplementation((space: unknown) => {
			if (space === thumbTipSpace) return createMockJointPose(0, 0, 0);
			if (space === indexTipSpace) return createMockJointPose(0.1, 0, 0);
			return createMockJointPose(0, 0, 0);
		});

		const tracker = createHandTracker(deps);
		const result = tracker.update(mockFrame, mockReferenceSpace);

		expect(result.get("left")?.pinchState.isPinching).toBe(false);
	});

	it("should return null for hand when no joint poses are available", () => {
		const hand = createMockHand({ wrist: {} });
		const deps = createDeps([createMockInputSource("left", hand)]);

		mockGetJointPose.mockReturnValue(null);

		const tracker = createHandTracker(deps);
		const result = tracker.update(mockFrame, mockReferenceSpace);

		expect(result.has("left")).toBe(false);
	});

	it("should persist latest poses via getLatestPoses()", () => {
		const hand = createMockHand({ wrist: {} });
		const deps = createDeps([createMockInputSource("right", hand)]);
		mockGetJointPose.mockReturnValue(createMockJointPose(0, 0, 0));

		const tracker = createHandTracker(deps);
		tracker.update(mockFrame, mockReferenceSpace);

		const latest = tracker.getLatestPoses();
		expect(latest.has("right")).toBe(true);
	});

	it("should ignore input sources with handedness 'none'", () => {
		const hand = createMockHand({ wrist: {} });
		const deps = createDeps([createMockInputSource("none", hand)]);
		mockGetJointPose.mockReturnValue(createMockJointPose(0, 0, 0));

		const tracker = createHandTracker(deps);
		const result = tracker.update(mockFrame, mockReferenceSpace);

		expect(result.size).toBe(0);
	});
});
