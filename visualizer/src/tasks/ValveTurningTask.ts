import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import type { TaskEnvironment, TaskEnvironmentDependencies, ValveConfig } from "./types";
import { VALVE_COLOR } from "./types";

const defaultConfig: ValveConfig = {
	position: { x: 0, y: 1.0, z: -0.4 },
	axis: { x: 0, y: 0, z: 1 },
	targetAngle: Math.PI,
	friction: 0.5,
	radius: 0.1,
};

export function createValveTurningTask(
	deps: TaskEnvironmentDependencies,
	configOverrides?: Partial<ValveConfig>,
): TaskEnvironment {
	const config = { ...defaultConfig, ...configOverrides };
	const meshes: THREE.Object3D[] = [];
	let valveMesh: THREE.Mesh | null = null;
	let joint: RAPIER.ImpulseJoint | null = null;

	function setup(): void {
		// Valve mount (fixed)
		const mountGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.05, 16);
		const mountMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
		const mountMesh = new THREE.Mesh(mountGeom, mountMat);
		mountMesh.position.set(config.position.x, config.position.y, config.position.z);
		deps.scene.add(mountMesh);
		meshes.push(mountMesh);

		deps.physicsWorld.addBody({
			id: "valve-mount",
			bodyType: "fixed",
			position: config.position,
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cylinder(0.025, 0.03),
		});

		// Valve handle (torus)
		const torusGeom = new THREE.TorusGeometry(config.radius, 0.015, 16, 32);
		const torusMat = new THREE.MeshStandardMaterial({
			color: VALVE_COLOR,
			roughness: 0.3,
			metalness: 0.7,
		});
		valveMesh = new THREE.Mesh(torusGeom, torusMat);
		valveMesh.position.set(config.position.x, config.position.y, config.position.z);
		deps.scene.add(valveMesh);
		meshes.push(valveMesh);

		deps.physicsWorld.addBody({
			id: "valve-handle",
			bodyType: "dynamic",
			position: config.position,
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.ball(config.radius).setDensity(2.0),
		});

		// Revolute joint
		joint = deps.physicsWorld.createRevoluteJoint(
			"valve-mount",
			"valve-handle",
			{ x: 0, y: 0, z: 0 },
			{ x: 0, y: 0, z: 0 },
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
		deps.physicsWorld.removeBody("valve-mount");
		deps.physicsWorld.removeBody("valve-handle");
		meshes.length = 0;
		valveMesh = null;
	}

	function getCurrentAngle(): number {
		const body = deps.physicsWorld.getBody("valve-handle");
		if (!body) return 0;

		const rot = body.rigidBody.rotation();
		// Extract angle around the configured axis using atan2 of quaternion components
		const angle = 2 * Math.acos(Math.min(1, Math.abs(rot.w)));
		return angle;
	}

	function checkSuccess(): boolean {
		return Math.abs(getCurrentAngle()) >= Math.abs(config.targetAngle);
	}

	function getProgress(): number {
		if (config.targetAngle === 0) return 1;
		return Math.min(1, Math.abs(getCurrentAngle()) / Math.abs(config.targetAngle));
	}

	function reset(): void {
		const body = deps.physicsWorld.getBody("valve-handle");
		if (body) {
			body.rigidBody.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
			body.rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
			body.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
		}

		if (valveMesh && valveMesh.material instanceof THREE.MeshStandardMaterial) {
			valveMesh.material.color.setHex(VALVE_COLOR);
		}
	}

	return { type: "valve-turning", setup, teardown, checkSuccess, reset, getProgress };
}
