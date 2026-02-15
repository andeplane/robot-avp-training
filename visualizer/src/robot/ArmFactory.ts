import type * as THREE from "three";
import { createRobotArm } from "./RobotArm";
import type { ArmConfig, ArmSide, RobotArm } from "./types";

const LEFT_ARM_CONFIG: ArmConfig = {
	side: "left",
	basePosition: { x: -0.4, y: 0.8, z: -0.3 },
	color: 0x2563eb,
	upperArmLength: 0.25,
	forearmLength: 0.2,
	segmentRadius: 0.025,
	fingerLength: 0.06,
	fingerWidth: 0.01,
	maxFingerSpread: 0.04,
};

const RIGHT_ARM_CONFIG: ArmConfig = {
	side: "right",
	basePosition: { x: 0.4, y: 0.8, z: -0.3 },
	color: 0xea580c,
	upperArmLength: 0.25,
	forearmLength: 0.2,
	segmentRadius: 0.025,
	fingerLength: 0.06,
	fingerWidth: 0.01,
	maxFingerSpread: 0.04,
};

const ARM_CONFIGS: Record<ArmSide, ArmConfig> = {
	left: LEFT_ARM_CONFIG,
	right: RIGHT_ARM_CONFIG,
};

export function getArmConfig(side: ArmSide): ArmConfig {
	return { ...ARM_CONFIGS[side] };
}

export function createArm(side: ArmSide, configOverrides?: Partial<ArmConfig>): RobotArm {
	const config = { ...ARM_CONFIGS[side], ...configOverrides };
	return createRobotArm(config);
}

export interface DualArms {
	left: RobotArm;
	right: RobotArm;
}

export function createDualArms(scene: THREE.Scene): DualArms {
	const left = createArm("left");
	const right = createArm("right");
	scene.add(left.root);
	scene.add(right.root);
	return { left, right };
}
