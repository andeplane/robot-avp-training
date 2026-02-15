import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { createRobotArm, setArmPose } from "./RobotArm";
import type { ArmConfig, ArmPose } from "./types";

describe(createRobotArm.name, () => {
	it("should create arm with all expected groups in hierarchy", () => {
		const arm = createRobotArm(createConfig("left"));

		expect(arm.id).toBe("left");
		expect(arm.root).toBeInstanceOf(THREE.Group);
		expect(arm.base).toBeInstanceOf(THREE.Group);
		expect(arm.shoulder).toBeInstanceOf(THREE.Group);
		expect(arm.upperArm).toBeInstanceOf(THREE.Group);
		expect(arm.elbow).toBeInstanceOf(THREE.Group);
		expect(arm.forearm).toBeInstanceOf(THREE.Group);
		expect(arm.wrist).toBeInstanceOf(THREE.Group);
		expect(arm.gripper.base).toBeInstanceOf(THREE.Group);
	});

	it("should position root at the configured base position", () => {
		const arm = createRobotArm(
			createConfig("right", { basePosition: { x: 0.4, y: 0.8, z: -0.3 } }),
		);

		expect(arm.root.position.x).toBeCloseTo(0.4);
		expect(arm.root.position.y).toBeCloseTo(0.8);
		expect(arm.root.position.z).toBeCloseTo(-0.3);
	});

	it("should name groups with the arm side", () => {
		const arm = createRobotArm(createConfig("right"));

		expect(arm.root.name).toContain("right");
		expect(arm.base.name).toContain("right");
		expect(arm.shoulder.name).toContain("right");
	});

	it("should create a gripper with two fingers", () => {
		const arm = createRobotArm(createConfig("left"));

		expect(arm.gripper.fingerLeft).toBeInstanceOf(THREE.Mesh);
		expect(arm.gripper.fingerRight).toBeInstanceOf(THREE.Mesh);
	});

	it("should start with gripper fully open", () => {
		const arm = createRobotArm(createConfig("left"));

		expect(arm.gripper.openAmount).toBe(1);
	});
});

describe(setArmPose.name, () => {
	it("should update gripper open amount", () => {
		const arm = createRobotArm(createConfig("left"));
		const pose: ArmPose = {
			endEffectorPosition: new THREE.Vector3(0, 1, 0),
			endEffectorOrientation: new THREE.Quaternion(),
			gripperOpen: 0.3,
		};

		setArmPose(arm, pose, 0.04);

		expect(arm.gripper.openAmount).toBeCloseTo(0.3);
	});
});

function createConfig(side: "left" | "right", overrides?: Partial<ArmConfig>): ArmConfig {
	return {
		side,
		basePosition: { x: 0, y: 0.8, z: 0 },
		color: side === "left" ? 0x2563eb : 0xea580c,
		upperArmLength: 0.25,
		forearmLength: 0.2,
		segmentRadius: 0.025,
		fingerLength: 0.06,
		fingerWidth: 0.01,
		maxFingerSpread: 0.04,
		...overrides,
	};
}
