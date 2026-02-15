import type * as THREE from "three";
import type { PhysicsBodyHandle } from "./types";

export function syncPhysicsToGraphics(handle: PhysicsBodyHandle): void {
	if (!handle.mesh) return;

	const pos = handle.rigidBody.translation();
	const rot = handle.rigidBody.rotation();

	handle.mesh.position.set(pos.x, pos.y, pos.z);
	handle.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
}

export function syncAllBodiesToGraphics(bodies: Map<string, PhysicsBodyHandle>): void {
	for (const handle of bodies.values()) {
		syncPhysicsToGraphics(handle);
	}
}

export function syncGraphicsToPhysics(
	handle: PhysicsBodyHandle,
	position: THREE.Vector3,
	quaternion: THREE.Quaternion,
): void {
	handle.rigidBody.setTranslation({ x: position.x, y: position.y, z: position.z }, true);
	handle.rigidBody.setRotation(
		{ x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w },
		true,
	);
}
