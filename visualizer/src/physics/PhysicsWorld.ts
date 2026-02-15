import RAPIER from "@dimforge/rapier3d-compat";
import type { PhysicsBodyDescriptor, PhysicsBodyHandle } from "./types";

export interface PhysicsWorld {
	step(): void;
	addBody(descriptor: PhysicsBodyDescriptor): PhysicsBodyHandle;
	removeBody(id: string): void;
	getBody(id: string): PhysicsBodyHandle | undefined;
	getAllBodies(): Map<string, PhysicsBodyHandle>;
	getWorld(): RAPIER.World;
	createRevoluteJoint(
		body1Id: string,
		body2Id: string,
		anchor1: { x: number; y: number; z: number },
		anchor2: { x: number; y: number; z: number },
		axis: { x: number; y: number; z: number },
	): RAPIER.ImpulseJoint;
	createFixedJoint(
		body1Id: string,
		body2Id: string,
		anchor1: { x: number; y: number; z: number },
		rotation1: { x: number; y: number; z: number; w: number },
		anchor2: { x: number; y: number; z: number },
		rotation2: { x: number; y: number; z: number; w: number },
	): RAPIER.ImpulseJoint;
	removeJoint(joint: RAPIER.ImpulseJoint): void;
	dispose(): void;
}

export interface PhysicsWorldConfig {
	gravity: { x: number; y: number; z: number };
	timestep: number;
}

const defaultConfig: PhysicsWorldConfig = {
	gravity: { x: 0, y: -9.81, z: 0 },
	timestep: 1 / 120,
};

export async function initPhysics(): Promise<void> {
	await RAPIER.init();
}

export function createPhysicsWorld(configOverrides?: Partial<PhysicsWorldConfig>): PhysicsWorld {
	const config = { ...defaultConfig, ...configOverrides };
	const gravity = new RAPIER.Vector3(config.gravity.x, config.gravity.y, config.gravity.z);
	const world = new RAPIER.World(gravity);
	world.timestep = config.timestep;

	const bodies = new Map<string, PhysicsBodyHandle>();

	function step(): void {
		world.step();
	}

	function addBody(descriptor: PhysicsBodyDescriptor): PhysicsBodyHandle {
		let bodyDesc: RAPIER.RigidBodyDesc;
		switch (descriptor.bodyType) {
			case "dynamic":
				bodyDesc = RAPIER.RigidBodyDesc.dynamic();
				break;
			case "fixed":
				bodyDesc = RAPIER.RigidBodyDesc.fixed();
				break;
			case "kinematic":
				bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
				break;
		}

		bodyDesc
			.setTranslation(descriptor.position.x, descriptor.position.y, descriptor.position.z)
			.setRotation(descriptor.rotation);

		const rigidBody = world.createRigidBody(bodyDesc);
		const collider = world.createCollider(descriptor.colliderDesc, rigidBody);

		const handle: PhysicsBodyHandle = {
			id: descriptor.id,
			rigidBody,
			collider,
			mesh: descriptor.mesh,
		};

		bodies.set(descriptor.id, handle);
		return handle;
	}

	function removeBody(id: string): void {
		const handle = bodies.get(id);
		if (handle) {
			world.removeRigidBody(handle.rigidBody);
			bodies.delete(id);
		}
	}

	function getBody(id: string): PhysicsBodyHandle | undefined {
		return bodies.get(id);
	}

	function getAllBodies(): Map<string, PhysicsBodyHandle> {
		return bodies;
	}

	function getWorld(): RAPIER.World {
		return world;
	}

	function createRevoluteJoint(
		body1Id: string,
		body2Id: string,
		anchor1: { x: number; y: number; z: number },
		anchor2: { x: number; y: number; z: number },
		axis: { x: number; y: number; z: number },
	): RAPIER.ImpulseJoint {
		const b1 = bodies.get(body1Id);
		const b2 = bodies.get(body2Id);
		if (!b1 || !b2) throw new Error(`Body not found: ${body1Id} or ${body2Id}`);

		const params = RAPIER.JointData.revolute(
			new RAPIER.Vector3(anchor1.x, anchor1.y, anchor1.z),
			new RAPIER.Vector3(anchor2.x, anchor2.y, anchor2.z),
			new RAPIER.Vector3(axis.x, axis.y, axis.z),
		);

		return world.createImpulseJoint(params, b1.rigidBody, b2.rigidBody, true);
	}

	function createFixedJoint(
		body1Id: string,
		body2Id: string,
		anchor1: { x: number; y: number; z: number },
		rotation1: { x: number; y: number; z: number; w: number },
		anchor2: { x: number; y: number; z: number },
		rotation2: { x: number; y: number; z: number; w: number },
	): RAPIER.ImpulseJoint {
		const b1 = bodies.get(body1Id);
		const b2 = bodies.get(body2Id);
		if (!b1 || !b2) throw new Error(`Body not found: ${body1Id} or ${body2Id}`);

		const params = RAPIER.JointData.fixed(
			new RAPIER.Vector3(anchor1.x, anchor1.y, anchor1.z),
			new RAPIER.Quaternion(rotation1.x, rotation1.y, rotation1.z, rotation1.w),
			new RAPIER.Vector3(anchor2.x, anchor2.y, anchor2.z),
			new RAPIER.Quaternion(rotation2.x, rotation2.y, rotation2.z, rotation2.w),
		);

		return world.createImpulseJoint(params, b1.rigidBody, b2.rigidBody, true);
	}

	function removeJoint(joint: RAPIER.ImpulseJoint): void {
		world.removeImpulseJoint(joint, true);
	}

	function dispose(): void {
		world.free();
		bodies.clear();
	}

	return {
		step,
		addBody,
		removeBody,
		getBody,
		getAllBodies,
		getWorld,
		createRevoluteJoint,
		createFixedJoint,
		removeJoint,
		dispose,
	};
}
