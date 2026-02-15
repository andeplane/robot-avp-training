import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import type {
	PickPlaceConfig,
	TaskEnvironment,
	TaskEnvironmentDependencies,
	Vec3Config,
} from "./types";
import { DEFAULT_OBJECT_COLOR, TARGET_ZONE_COLOR } from "./types";

const defaultConfig: PickPlaceConfig = {
	objectCount: 2,
	objectPositions: [
		{ x: -0.1, y: 0.85, z: 0 },
		{ x: 0.1, y: 0.85, z: 0 },
	],
	targetZones: [
		{ position: { x: 0.2, y: 0.81, z: 0.15 }, radius: 0.06 },
		{ position: { x: -0.2, y: 0.81, z: 0.15 }, radius: 0.06 },
	],
	objectSize: 0.05,
	tableHeight: 0.8,
};

export function createPickAndPlaceTask(
	deps: TaskEnvironmentDependencies,
	configOverrides?: Partial<PickPlaceConfig>,
): TaskEnvironment {
	const config = { ...defaultConfig, ...configOverrides };
	const objectIds: string[] = [];
	const meshes: THREE.Object3D[] = [];
	const targetMeshes: THREE.Mesh[] = [];
	let tableMesh: THREE.Mesh | null = null;

	function setup(): void {
		// Table
		const tableGeom = new THREE.BoxGeometry(0.8, 0.02, 0.6);
		const tableMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.8 });
		tableMesh = new THREE.Mesh(tableGeom, tableMat);
		tableMesh.position.set(0, config.tableHeight, 0);
		deps.scene.add(tableMesh);
		meshes.push(tableMesh);

		deps.physicsWorld.addBody({
			id: "table",
			bodyType: "fixed",
			position: { x: 0, y: config.tableHeight, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.4, 0.01, 0.3),
		});

		// Target zones
		for (let i = 0; i < config.targetZones.length; i++) {
			const zone = config.targetZones[i];
			if (!zone) continue;
			const zoneGeom = new THREE.RingGeometry(zone.radius * 0.8, zone.radius, 32);
			const zoneMat = new THREE.MeshStandardMaterial({
				color: TARGET_ZONE_COLOR,
				transparent: true,
				opacity: 0.4,
				side: THREE.DoubleSide,
			});
			const zoneMesh = new THREE.Mesh(zoneGeom, zoneMat);
			zoneMesh.position.set(zone.position.x, zone.position.y, zone.position.z);
			zoneMesh.rotation.x = -Math.PI / 2;
			deps.scene.add(zoneMesh);
			targetMeshes.push(zoneMesh);
			meshes.push(zoneMesh);
		}

		// Objects (cubes)
		for (let i = 0; i < config.objectCount; i++) {
			const pos = config.objectPositions[i] ?? { x: 0, y: 0.85, z: 0 };
			const id = `pick-object-${i}`;
			objectIds.push(id);

			const cubeGeom = new THREE.BoxGeometry(
				config.objectSize,
				config.objectSize,
				config.objectSize,
			);
			const cubeMat = new THREE.MeshStandardMaterial({ color: DEFAULT_OBJECT_COLOR });
			const cubeMesh = new THREE.Mesh(cubeGeom, cubeMat);
			cubeMesh.position.set(pos.x, pos.y, pos.z);
			deps.scene.add(cubeMesh);
			meshes.push(cubeMesh);

			deps.physicsWorld.addBody({
				id,
				bodyType: "dynamic",
				position: pos,
				rotation: { x: 0, y: 0, z: 0, w: 1 },
				colliderDesc: RAPIER.ColliderDesc.cuboid(
					config.objectSize / 2,
					config.objectSize / 2,
					config.objectSize / 2,
				),
				mesh: cubeMesh,
			});
		}
	}

	function teardown(): void {
		for (const mesh of meshes) {
			deps.scene.remove(mesh);
		}
		for (const id of objectIds) {
			deps.physicsWorld.removeBody(id);
		}
		deps.physicsWorld.removeBody("table");
		objectIds.length = 0;
		meshes.length = 0;
		targetMeshes.length = 0;
		tableMesh = null;
	}

	function checkSuccess(): boolean {
		const zones = config.targetZones;
		if (zones.length === 0 || objectIds.length === 0) return false;

		let matchedZones = 0;
		for (const zone of zones) {
			for (const id of objectIds) {
				const body = deps.physicsWorld.getBody(id);
				if (!body) continue;
				const pos = body.rigidBody.translation();
				if (isInZone(pos, zone.position, zone.radius)) {
					matchedZones++;
					break;
				}
			}
		}

		return matchedZones >= zones.length;
	}

	function getProgress(): number {
		const zones = config.targetZones;
		if (zones.length === 0) return 0;

		let matched = 0;
		for (const zone of zones) {
			for (const id of objectIds) {
				const body = deps.physicsWorld.getBody(id);
				if (!body) continue;
				const pos = body.rigidBody.translation();
				if (isInZone(pos, zone.position, zone.radius)) {
					matched++;
					break;
				}
			}
		}

		return matched / zones.length;
	}

	function reset(): void {
		for (let i = 0; i < objectIds.length; i++) {
			const id = objectIds[i];
			const pos = config.objectPositions[i] ?? { x: 0, y: 0.85, z: 0 };
			if (!id) continue;
			const body = deps.physicsWorld.getBody(id);
			if (body) {
				body.rigidBody.setTranslation({ x: pos.x, y: pos.y, z: pos.z }, true);
				body.rigidBody.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
				body.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
				body.rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
			}
		}

		for (const mesh of targetMeshes) {
			if (mesh.material instanceof THREE.MeshStandardMaterial) {
				mesh.material.color.setHex(TARGET_ZONE_COLOR);
			}
		}
	}

	return { type: "pick-and-place", setup, teardown, checkSuccess, reset, getProgress };
}

function isInZone(
	pos: { x: number; y: number; z: number },
	zoneCenter: Vec3Config,
	radius: number,
): boolean {
	const dx = pos.x - zoneCenter.x;
	const dz = pos.z - zoneCenter.z;
	return Math.sqrt(dx * dx + dz * dz) <= radius;
}
