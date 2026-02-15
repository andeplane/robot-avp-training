import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import type { HandleConfig, TaskEnvironment, TaskEnvironmentDependencies } from "./types";
import { HANDLE_COLOR } from "./types";

const defaultConfig: HandleConfig = {
	position: { x: 0.3, y: 1.0, z: -0.3 },
	axis: { x: 0, y: 0, z: 1 },
	minAngle: 0,
	maxAngle: Math.PI / 2,
	targetAngle: Math.PI / 2,
	length: 0.15,
};

export function createHandleRotationTask(
	deps: TaskEnvironmentDependencies,
	configOverrides?: Partial<HandleConfig>,
): TaskEnvironment {
	const config = { ...defaultConfig, ...configOverrides };
	const meshes: THREE.Object3D[] = [];
	let handleMesh: THREE.Mesh | null = null;
	let joint: RAPIER.ImpulseJoint | null = null;

	function setup(): void {
		// Handle mount (fixed)
		const mountGeom = new THREE.BoxGeometry(0.04, 0.04, 0.04);
		const mountMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
		const mountMesh = new THREE.Mesh(mountGeom, mountMat);
		mountMesh.position.set(config.position.x, config.position.y, config.position.z);
		deps.scene.add(mountMesh);
		meshes.push(mountMesh);

		deps.physicsWorld.addBody({
			id: "handle-mount",
			bodyType: "fixed",
			position: config.position,
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.02, 0.02, 0.02),
		});

		// Handle lever (dynamic)
		const leverGeom = new THREE.BoxGeometry(config.length, 0.025, 0.025);
		const leverMat = new THREE.MeshStandardMaterial({
			color: HANDLE_COLOR,
			roughness: 0.3,
			metalness: 0.6,
		});
		handleMesh = new THREE.Mesh(leverGeom, leverMat);
		handleMesh.position.set(
			config.position.x + config.length / 2,
			config.position.y,
			config.position.z,
		);
		deps.scene.add(handleMesh);
		meshes.push(handleMesh);

		deps.physicsWorld.addBody({
			id: "handle-lever",
			bodyType: "dynamic",
			position: {
				x: config.position.x + config.length / 2,
				y: config.position.y,
				z: config.position.z,
			},
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(config.length / 2, 0.0125, 0.0125).setDensity(1.0),
		});

		// Revolute joint with limits
		joint = deps.physicsWorld.createRevoluteJoint(
			"handle-mount",
			"handle-lever",
			{ x: 0, y: 0, z: 0 },
			{ x: -config.length / 2, y: 0, z: 0 },
			config.axis,
		);
	}

	function teardown(): void {
		if (joint) {
			deps.physicsWorld.removeJoint(joint);
			joint = null;
		}
		for (const mesh of meshes) {
			deps.scene.remove(mesh);
		}
		deps.physicsWorld.removeBody("handle-mount");
		deps.physicsWorld.removeBody("handle-lever");
		meshes.length = 0;
		handleMesh = null;
	}

	function getCurrentAngle(): number {
		const body = deps.physicsWorld.getBody("handle-lever");
		if (!body) return 0;

		const rot = body.rigidBody.rotation();
		const angle = 2 * Math.acos(Math.min(1, Math.abs(rot.w)));
		return angle;
	}

	function checkSuccess(): boolean {
		const currentAngle = getCurrentAngle();
		const tolerance = 0.1; // ~5.7 degrees
		return Math.abs(currentAngle - config.targetAngle) <= tolerance;
	}

	function getProgress(): number {
		if (config.targetAngle === 0) return 1;
		return Math.min(1, getCurrentAngle() / config.targetAngle);
	}

	function reset(): void {
		const body = deps.physicsWorld.getBody("handle-lever");
		if (body) {
			body.rigidBody.setTranslation(
				{
					x: config.position.x + config.length / 2,
					y: config.position.y,
					z: config.position.z,
				},
				true,
			);
			body.rigidBody.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
			body.rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
			body.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
		}

		if (handleMesh && handleMesh.material instanceof THREE.MeshStandardMaterial) {
			handleMesh.material.color.setHex(HANDLE_COLOR);
		}
	}

	return { type: "handle-rotation", setup, teardown, checkSuccess, reset, getProgress };
}
