import type { PhysicsWorld } from "./PhysicsWorld";
import type { GraspConstraint } from "./types";

export interface GraspManager {
	tryGrasp(gripperId: string, objectId: string): GraspConstraint | null;
	release(gripperId: string): void;
	isGrasping(gripperId: string): boolean;
	getGraspedObjectId(gripperId: string): string | null;
	releaseAll(): void;
}

export interface GraspManagerDependencies {
	physicsWorld: PhysicsWorld;
}

export function createGraspManager(deps: GraspManagerDependencies): GraspManager {
	const activeGrasps = new Map<string, GraspConstraint>();

	function tryGrasp(gripperId: string, objectId: string): GraspConstraint | null {
		if (activeGrasps.has(gripperId)) return null;

		const gripperBody = deps.physicsWorld.getBody(gripperId);
		const objectBody = deps.physicsWorld.getBody(objectId);
		if (!gripperBody || !objectBody) return null;

		try {
			const joint = deps.physicsWorld.createFixedJoint(
				gripperId,
				objectId,
				{ x: 0, y: 0, z: 0 },
				{ x: 0, y: 0, z: 0, w: 1 },
				{ x: 0, y: 0, z: 0 },
				{ x: 0, y: 0, z: 0, w: 1 },
			);

			const constraint: GraspConstraint = { objectId, joint };
			activeGrasps.set(gripperId, constraint);
			return constraint;
		} catch {
			return null;
		}
	}

	function release(gripperId: string): void {
		const constraint = activeGrasps.get(gripperId);
		if (constraint) {
			deps.physicsWorld.removeJoint(constraint.joint);
			activeGrasps.delete(gripperId);
		}
	}

	function isGrasping(gripperId: string): boolean {
		return activeGrasps.has(gripperId);
	}

	function getGraspedObjectId(gripperId: string): string | null {
		return activeGrasps.get(gripperId)?.objectId ?? null;
	}

	function releaseAll(): void {
		for (const [gripperId] of activeGrasps) {
			release(gripperId);
		}
	}

	return { tryGrasp, release, isGrasping, getGraspedObjectId, releaseAll };
}
