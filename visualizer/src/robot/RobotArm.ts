import * as THREE from "three";
import { createGripper, setGripperOpen } from "./Gripper";
import type { ArmConfig, ArmPose, RobotArm } from "./types";

export function createRobotArm(config: ArmConfig): RobotArm {
	const root = new THREE.Group();
	root.name = `arm-root-${config.side}`;
	root.position.set(config.basePosition.x, config.basePosition.y, config.basePosition.z);

	const segmentMaterial = new THREE.MeshStandardMaterial({
		color: config.color,
		roughness: 0.4,
		metalness: 0.6,
	});
	const jointMaterial = new THREE.MeshStandardMaterial({
		color: 0x333333,
		roughness: 0.3,
		metalness: 0.8,
	});

	// Base
	const base = new THREE.Group();
	base.name = `base-${config.side}`;
	const baseMesh = new THREE.Mesh(
		new THREE.CylinderGeometry(config.segmentRadius * 1.5, config.segmentRadius * 1.5, 0.04, 24),
		segmentMaterial,
	);
	base.add(baseMesh);
	root.add(base);

	// Shoulder joint
	const shoulder = new THREE.Group();
	shoulder.name = `shoulder-${config.side}`;
	shoulder.position.set(0, 0.02, 0);
	const shoulderJoint = new THREE.Mesh(
		new THREE.SphereGeometry(config.segmentRadius * 1.2, 16, 16),
		jointMaterial,
	);
	shoulder.add(shoulderJoint);
	base.add(shoulder);

	// Upper arm
	const upperArm = new THREE.Group();
	upperArm.name = `upper-arm-${config.side}`;
	const upperArmMesh = new THREE.Mesh(
		new THREE.CylinderGeometry(
			config.segmentRadius,
			config.segmentRadius,
			config.upperArmLength,
			16,
		),
		segmentMaterial,
	);
	upperArmMesh.position.set(0, -config.upperArmLength / 2, 0);
	upperArm.add(upperArmMesh);
	shoulder.add(upperArm);

	// Elbow joint
	const elbow = new THREE.Group();
	elbow.name = `elbow-${config.side}`;
	elbow.position.set(0, -config.upperArmLength, 0);
	const elbowJoint = new THREE.Mesh(
		new THREE.SphereGeometry(config.segmentRadius * 1.1, 16, 16),
		jointMaterial,
	);
	elbow.add(elbowJoint);
	upperArm.add(elbow);

	// Forearm
	const forearm = new THREE.Group();
	forearm.name = `forearm-${config.side}`;
	const forearmMesh = new THREE.Mesh(
		new THREE.CylinderGeometry(
			config.segmentRadius * 0.9,
			config.segmentRadius * 0.9,
			config.forearmLength,
			16,
		),
		segmentMaterial,
	);
	forearmMesh.position.set(0, -config.forearmLength / 2, 0);
	forearm.add(forearmMesh);
	elbow.add(forearm);

	// Wrist joint
	const wrist = new THREE.Group();
	wrist.name = `wrist-${config.side}`;
	wrist.position.set(0, -config.forearmLength, 0);
	const wristJoint = new THREE.Mesh(
		new THREE.SphereGeometry(config.segmentRadius * 0.9, 16, 16),
		jointMaterial,
	);
	wrist.add(wristJoint);
	forearm.add(wrist);

	// Gripper
	const gripper = createGripper(config);
	gripper.base.position.set(0, -0.02, 0);
	wrist.add(gripper.base);

	return {
		id: config.side,
		root,
		base,
		shoulder,
		upperArm,
		elbow,
		forearm,
		wrist,
		gripper,
	};
}

export function setArmPose(arm: RobotArm, pose: ArmPose, maxFingerSpread: number): void {
	arm.wrist.position.copy(
		new THREE.Vector3().subVectors(pose.endEffectorPosition, arm.root.position),
	);
	arm.wrist.quaternion.copy(pose.endEffectorOrientation);
	setGripperOpen(arm.gripper, pose.gripperOpen, maxFingerSpread);
}
