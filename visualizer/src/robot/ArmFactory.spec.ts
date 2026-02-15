import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { createArm, createDualArms, getArmConfig } from "./ArmFactory";

describe(createArm.name, () => {
	it.each([
		{ side: "left" as const, expectedColor: 0x2563eb, expectedX: -0.4 },
		{ side: "right" as const, expectedColor: 0xea580c, expectedX: 0.4 },
	])("should create $side arm with correct defaults", ({ side, expectedX }) => {
		const arm = createArm(side);

		expect(arm.id).toBe(side);
		expect(arm.root.position.x).toBeCloseTo(expectedX);
		expect(arm.root.position.y).toBeCloseTo(0.8);
	});

	it("should allow config overrides", () => {
		const arm = createArm("left", { basePosition: { x: -1, y: 2, z: 0 } });

		expect(arm.root.position.x).toBeCloseTo(-1);
		expect(arm.root.position.y).toBeCloseTo(2);
	});
});

describe(getArmConfig.name, () => {
	it.each(["left" as const, "right" as const])("should return config for %s arm", (side) => {
		const config = getArmConfig(side);
		expect(config.side).toBe(side);
		expect(config.upperArmLength).toBeGreaterThan(0);
	});
});

describe(createDualArms.name, () => {
	it("should create both arms and add them to the scene", () => {
		const scene = new THREE.Scene();

		const { left, right } = createDualArms(scene);

		expect(left.id).toBe("left");
		expect(right.id).toBe("right");
		expect(scene.children).toContain(left.root);
		expect(scene.children).toContain(right.root);
	});

	it("should position arms on opposite sides", () => {
		const scene = new THREE.Scene();

		const { left, right } = createDualArms(scene);

		expect(left.root.position.x).toBeLessThan(0);
		expect(right.root.position.x).toBeGreaterThan(0);
	});
});
