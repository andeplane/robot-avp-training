import type RAPIER from "@dimforge/rapier3d-compat";
import type * as THREE from "three";

export type RigidBodyType = "dynamic" | "fixed" | "kinematic";

export interface PhysicsBodyDescriptor {
	id: string;
	bodyType: RigidBodyType;
	position: { x: number; y: number; z: number };
	rotation: { x: number; y: number; z: number; w: number };
	colliderDesc: RAPIER.ColliderDesc;
	mesh?: THREE.Object3D;
}

export interface PhysicsBodyHandle {
	id: string;
	rigidBody: RAPIER.RigidBody;
	collider: RAPIER.Collider;
	mesh?: THREE.Object3D;
}

export interface GraspConstraint {
	objectId: string;
	joint: RAPIER.ImpulseJoint;
}

export interface CollisionGroupConfig {
	membership: number;
	filter: number;
}

export const CollisionGroups = {
	DEFAULT: { membership: 0x0001, filter: 0xffff },
	ARM_LEFT: { membership: 0x0002, filter: 0xfffd },
	ARM_RIGHT: { membership: 0x0004, filter: 0xfffb },
	OBJECT: { membership: 0x0008, filter: 0xffff },
	GROUND: { membership: 0x0010, filter: 0xffff },
} as const;
