import type { TaskType } from "../simulation/types";
import { createHandleRotationTask } from "./HandleRotationTask";
import { createPickAndPlaceTask } from "./PickAndPlaceTask";
import type { TaskEnvironment, TaskEnvironmentDependencies } from "./types";
import { createValveTurningTask } from "./ValveTurningTask";

export interface TaskManager {
	loadTask(type: TaskType): TaskEnvironment;
	getCurrentTask(): TaskEnvironment | null;
	unloadTask(): void;
	checkSuccess(): boolean;
	getProgress(): number;
	resetCurrentTask(): void;
}

export function createTaskManager(deps: TaskEnvironmentDependencies): TaskManager {
	let currentTask: TaskEnvironment | null = null;

	function createTaskByType(type: TaskType): TaskEnvironment {
		switch (type) {
			case "pick-and-place":
				return createPickAndPlaceTask(deps);
			case "valve-turning":
				return createValveTurningTask(deps);
			case "handle-rotation":
				return createHandleRotationTask(deps);
		}
	}

	function loadTask(type: TaskType): TaskEnvironment {
		if (currentTask) {
			currentTask.teardown();
		}

		const task = createTaskByType(type);
		task.setup();
		currentTask = task;
		return task;
	}

	function getCurrentTask(): TaskEnvironment | null {
		return currentTask;
	}

	function unloadTask(): void {
		if (currentTask) {
			currentTask.teardown();
			currentTask = null;
		}
	}

	function checkSuccess(): boolean {
		return currentTask?.checkSuccess() ?? false;
	}

	function getProgress(): number {
		return currentTask?.getProgress() ?? 0;
	}

	function resetCurrentTask(): void {
		currentTask?.reset();
	}

	return { loadTask, getCurrentTask, unloadTask, checkSuccess, getProgress, resetCurrentTask };
}
