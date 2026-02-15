import * as THREE from "three";
import type { HandPose } from "./types";
import { ALL_JOINTS } from "./types";

const JOINT_SPHERE_RADIUS = 0.005;
const DEFAULT_COLOR = 0x00aaff;
const PINCH_COLOR = 0x00ff00;

export interface HandVisualizer {
	update(poses: Map<string, HandPose>): void;
	dispose(): void;
}

export function createHandVisualizer(scene: THREE.Scene): HandVisualizer {
	const jointMeshes = new Map<string, THREE.Mesh>();
	const sphereGeometry = new THREE.SphereGeometry(JOINT_SPHERE_RADIUS, 8, 8);
	const defaultMaterial = new THREE.MeshStandardMaterial({ color: DEFAULT_COLOR });
	const pinchMaterial = new THREE.MeshStandardMaterial({ color: PINCH_COLOR });

	function getOrCreateJointMesh(key: string): THREE.Mesh {
		let mesh = jointMeshes.get(key);
		if (!mesh) {
			mesh = new THREE.Mesh(sphereGeometry, defaultMaterial.clone());
			mesh.visible = false;
			scene.add(mesh);
			jointMeshes.set(key, mesh);
		}
		return mesh;
	}

	function update(poses: Map<string, HandPose>): void {
		for (const mesh of jointMeshes.values()) {
			mesh.visible = false;
		}

		for (const [handedness, pose] of poses) {
			const isPinching = pose.pinchState.isPinching;
			const material = isPinching ? pinchMaterial : defaultMaterial;

			for (const jointName of ALL_JOINTS) {
				const joint = pose.joints.get(jointName);
				if (!joint) continue;

				const key = `${handedness}-${jointName}`;
				const mesh = getOrCreateJointMesh(key);
				mesh.position.set(joint.position.x, joint.position.y, joint.position.z);
				mesh.material = material;
				mesh.visible = true;
			}
		}
	}

	function dispose(): void {
		for (const mesh of jointMeshes.values()) {
			scene.remove(mesh);
			mesh.geometry.dispose();
			if (mesh.material instanceof THREE.Material) {
				mesh.material.dispose();
			}
		}
		jointMeshes.clear();
		sphereGeometry.dispose();
		defaultMaterial.dispose();
		pinchMaterial.dispose();
	}

	return { update, dispose };
}
