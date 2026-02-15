import type * as THREE from "three";

export type ArmSide = "left" | "right";

export interface Gripper {
	base: THREE.Group;
	fingerLeft: THREE.Mesh;
	fingerRight: THREE.Mesh;
	openAmount: number;
}

export interface RobotArm {
	id: ArmSide;
	root: THREE.Group;
	base: THREE.Group;
	shoulder: THREE.Group;
	upperArm: THREE.Group;
	elbow: THREE.Group;
	forearm: THREE.Group;
	wrist: THREE.Group;
	gripper: Gripper;
}

export interface ArmPose {
	endEffectorPosition: THREE.Vector3;
	endEffectorOrientation: THREE.Quaternion;
	gripperOpen: number;
}

export interface ArmConfig {
	side: ArmSide;
	basePosition: { x: number; y: number; z: number };
	color: number;
	upperArmLength: number;
	forearmLength: number;
	segmentRadius: number;
	fingerLength: number;
	fingerWidth: number;
	maxFingerSpread: number;
}
