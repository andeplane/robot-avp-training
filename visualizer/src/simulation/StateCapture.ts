import type { GraspManager } from "../physics/GraspManager";
import type { PhysicsWorld } from "../physics/PhysicsWorld";
import type { ArmSide } from "../robot/types";
import type { ArmState, ObjectState, SimulationState } from "./types";
import { createDefaultArmState } from "./types";

export interface StateCaptureConfig {
	armIds: Record<ArmSide, string>;
	objectIds: string[];
	objectTypes: Record<string, string>;
}

export interface StateCaptureDependencies {
	physicsWorld: PhysicsWorld;
	graspManager: GraspManager;
}

export function captureState(
	deps: StateCaptureDependencies,
	config: StateCaptureConfig,
): SimulationState {
	const leftArm = captureArmState(deps, config.armIds.left);
	const rightArm = captureArmState(deps, config.armIds.right);
	const objects = config.objectIds.map((id) => captureObjectState(deps, id, config.objectTypes));

	return {
		timestamp: performance.now(),
		leftArm,
		rightArm,
		objects,
	};
}

function captureArmState(deps: StateCaptureDependencies, gripperId: string): ArmState {
	const body = deps.physicsWorld.getBody(gripperId);
	if (!body) return createDefaultArmState();

	const pos = body.rigidBody.translation();
	const rot = body.rigidBody.rotation();

	return {
		endEffectorPosition: { x: pos.x, y: pos.y, z: pos.z },
		endEffectorOrientation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
		gripperOpen: 1,
		isGrasping: deps.graspManager.isGrasping(gripperId),
		graspedObjectId: deps.graspManager.getGraspedObjectId(gripperId),
	};
}

function captureObjectState(
	deps: StateCaptureDependencies,
	id: string,
	objectTypes: Record<string, string>,
): ObjectState {
	const body = deps.physicsWorld.getBody(id);
	if (!body) {
		return {
			id,
			position: { x: 0, y: 0, z: 0 },
			orientation: { x: 0, y: 0, z: 0, w: 1 },
			type: objectTypes[id] ?? "unknown",
		};
	}

	const pos = body.rigidBody.translation();
	const rot = body.rigidBody.rotation();

	return {
		id,
		position: { x: pos.x, y: pos.y, z: pos.z },
		orientation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
		type: objectTypes[id] ?? "unknown",
	};
}
