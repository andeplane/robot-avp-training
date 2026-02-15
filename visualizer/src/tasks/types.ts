import type * as THREE from "three";
import type { PhysicsWorld } from "../physics/PhysicsWorld";
import type { TaskType } from "../simulation/types";

export interface TaskEnvironment {
	type: TaskType;
	setup(): void;
	teardown(): void;
	checkSuccess(): boolean;
	reset(): void;
	getProgress(): number;
}

export interface Vec3Config {
	x: number;
	y: number;
	z: number;
}

export interface TargetZone {
	position: Vec3Config;
	radius: number;
}

export interface PickPlaceConfig {
	objectCount: number;
	objectPositions: Vec3Config[];
	targetZones: TargetZone[];
	objectSize: number;
	tableHeight: number;
}

export interface ValveConfig {
	position: Vec3Config;
	axis: Vec3Config;
	targetAngle: number;
	friction: number;
	radius: number;
}

export interface HandleConfig {
	position: Vec3Config;
	axis: Vec3Config;
	minAngle: number;
	maxAngle: number;
	targetAngle: number;
	length: number;
}

export interface TaskEnvironmentDependencies {
	scene: THREE.Scene;
	physicsWorld: PhysicsWorld;
}

export const SUCCESS_COLOR = 0x22c55e;
export const DEFAULT_OBJECT_COLOR = 0xfbbf24;
export const TARGET_ZONE_COLOR = 0x22c55e;
export const VALVE_COLOR = 0xef4444;
export const HANDLE_COLOR = 0x8b5cf6;
