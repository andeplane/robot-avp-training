import * as THREE from "three";
import type { ArmConfig, Gripper } from "./types";

export function createGripper(config: ArmConfig): Gripper {
	const base = new THREE.Group();
	base.name = `gripper-base-${config.side}`;

	const gripperBaseMesh = new THREE.Mesh(
		new THREE.CylinderGeometry(config.segmentRadius * 0.8, config.segmentRadius, 0.02, 16),
		new THREE.MeshStandardMaterial({ color: config.color }),
	);
	base.add(gripperBaseMesh);

	const fingerGeometry = new THREE.BoxGeometry(
		config.fingerWidth,
		config.fingerLength,
		config.fingerWidth,
	);
	const fingerMaterial = new THREE.MeshStandardMaterial({
		color: config.color,
		roughness: 0.5,
	});

	const fingerLeft = new THREE.Mesh(fingerGeometry, fingerMaterial);
	fingerLeft.name = `finger-left-${config.side}`;
	fingerLeft.position.set(-config.maxFingerSpread / 2, -config.fingerLength / 2, 0);
	base.add(fingerLeft);

	const fingerRight = new THREE.Mesh(fingerGeometry, fingerMaterial.clone());
	fingerRight.name = `finger-right-${config.side}`;
	fingerRight.position.set(config.maxFingerSpread / 2, -config.fingerLength / 2, 0);
	base.add(fingerRight);

	return {
		base,
		fingerLeft,
		fingerRight,
		openAmount: 1,
	};
}

export function setGripperOpen(gripper: Gripper, openAmount: number, maxSpread: number): void {
	const clamped = Math.max(0, Math.min(1, openAmount));
	gripper.openAmount = clamped;

	const offset = (clamped * maxSpread) / 2;
	gripper.fingerLeft.position.x = -offset;
	gripper.fingerRight.position.x = offset;
}
