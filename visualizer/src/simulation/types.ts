export interface ArmAction {
	dx: number;
	dy: number;
	dz: number;
	droll: number;
	dpitch: number;
	dyaw: number;
	gripper: number;
}

export interface DualArmAction {
	left: ArmAction;
	right: ArmAction;
}

export interface ArmState {
	endEffectorPosition: { x: number; y: number; z: number };
	endEffectorOrientation: { x: number; y: number; z: number; w: number };
	gripperOpen: number;
	isGrasping: boolean;
	graspedObjectId: string | null;
}

export interface ObjectState {
	id: string;
	position: { x: number; y: number; z: number };
	orientation: { x: number; y: number; z: number; w: number };
	type: string;
}

export interface SimulationState {
	timestamp: number;
	leftArm: ArmState;
	rightArm: ArmState;
	objects: ObjectState[];
}

export type TaskType = "pick-and-place" | "valve-turning" | "handle-rotation";

export interface EpisodeConfig {
	task: TaskType;
	randomize?: boolean;
}

export function createZeroAction(): ArmAction {
	return { dx: 0, dy: 0, dz: 0, droll: 0, dpitch: 0, dyaw: 0, gripper: 1 };
}

export function createZeroDualAction(): DualArmAction {
	return { left: createZeroAction(), right: createZeroAction() };
}

export function createDefaultArmState(): ArmState {
	return {
		endEffectorPosition: { x: 0, y: 0, z: 0 },
		endEffectorOrientation: { x: 0, y: 0, z: 0, w: 1 },
		gripperOpen: 1,
		isGrasping: false,
		graspedObjectId: null,
	};
}
