import { describe, expect, it } from "vitest";
import { createGripper, setGripperOpen } from "./Gripper";
import type { ArmConfig } from "./types";

describe(createGripper.name, () => {
	it("should create a gripper with two fingers and a base group", () => {
		const gripper = createGripper(createConfig());

		expect(gripper.base).toBeDefined();
		expect(gripper.fingerLeft).toBeDefined();
		expect(gripper.fingerRight).toBeDefined();
		expect(gripper.openAmount).toBe(1);
	});

	it("should name fingers with arm side", () => {
		const gripper = createGripper(createConfig("left"));

		expect(gripper.fingerLeft.name).toBe("finger-left-left");
		expect(gripper.fingerRight.name).toBe("finger-right-left");
	});
});

describe(setGripperOpen.name, () => {
	const maxSpread = 0.04;

	it.each([
		{ openAmount: 0, expectedLeft: 0, expectedRight: 0, label: "closed" },
		{ openAmount: 1, expectedLeft: -0.02, expectedRight: 0.02, label: "fully open" },
		{ openAmount: 0.5, expectedLeft: -0.01, expectedRight: 0.01, label: "half open" },
	])("should position fingers correctly when $label", ({
		openAmount,
		expectedLeft,
		expectedRight,
	}) => {
		const gripper = createGripper(createConfig());

		setGripperOpen(gripper, openAmount, maxSpread);

		expect(gripper.fingerLeft.position.x).toBeCloseTo(expectedLeft);
		expect(gripper.fingerRight.position.x).toBeCloseTo(expectedRight);
		expect(gripper.openAmount).toBe(openAmount);
	});

	it.each([
		{ input: -0.5, expected: 0 },
		{ input: 1.5, expected: 1 },
	])("should clamp openAmount $input to $expected", ({ input, expected }) => {
		const gripper = createGripper(createConfig());

		setGripperOpen(gripper, input, maxSpread);

		expect(gripper.openAmount).toBe(expected);
	});
});

function createConfig(side: "left" | "right" = "left"): ArmConfig {
	return {
		side,
		basePosition: { x: 0, y: 0, z: 0 },
		color: 0x2563eb,
		upperArmLength: 0.25,
		forearmLength: 0.2,
		segmentRadius: 0.025,
		fingerLength: 0.06,
		fingerWidth: 0.01,
		maxFingerSpread: 0.04,
	};
}
