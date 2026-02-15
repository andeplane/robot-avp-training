import { syncAllBodiesToGraphics } from "../physics/BodySync";
import type { GraspManager } from "../physics/GraspManager";
import type { PhysicsWorld } from "../physics/PhysicsWorld";
import type { ArmSide } from "../robot/types";
import type { StateCaptureConfig } from "./StateCapture";
import { captureState } from "./StateCapture";
import type { DualArmAction, SimulationState } from "./types";
import { createDefaultArmState } from "./types";

export interface SimulationManager {
	step(action: DualArmAction): SimulationState;
	getState(): SimulationState;
	reset(): SimulationState;
}

export interface SimulationManagerDependencies {
	physicsWorld: PhysicsWorld;
	graspManager: GraspManager;
	applyArmAction: (side: ArmSide, action: DualArmAction) => void;
	stateCaptureConfig: StateCaptureConfig;
}

export function createSimulationManager(deps: SimulationManagerDependencies): SimulationManager {
	let currentState: SimulationState = {
		timestamp: 0,
		leftArm: createDefaultArmState(),
		rightArm: createDefaultArmState(),
		objects: [],
	};

	function step(action: DualArmAction): SimulationState {
		deps.applyArmAction("left", action);
		deps.applyArmAction("right", action);

		deps.physicsWorld.step();
		syncAllBodiesToGraphics(deps.physicsWorld.getAllBodies());

		currentState = captureState(
			{
				physicsWorld: deps.physicsWorld,
				graspManager: deps.graspManager,
			},
			deps.stateCaptureConfig,
		);

		return currentState;
	}

	function getState(): SimulationState {
		return currentState;
	}

	function reset(): SimulationState {
		deps.graspManager.releaseAll();

		currentState = captureState(
			{
				physicsWorld: deps.physicsWorld,
				graspManager: deps.graspManager,
			},
			deps.stateCaptureConfig,
		);

		return currentState;
	}

	return { step, getState, reset };
}
