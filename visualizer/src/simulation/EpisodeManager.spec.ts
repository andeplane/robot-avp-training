import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEpisodeManager, type EpisodeManagerDependencies } from "./EpisodeManager";
import type { SimulationManager } from "./SimulationManager";
import type { EpisodeConfig, SimulationState } from "./types";
import { createDefaultArmState } from "./types";

describe(createEpisodeManager.name, () => {
	let mockSimManager: SimulationManager;
	let setupTask: ReturnType<typeof vi.fn<(config: EpisodeConfig) => void>>;
	let teardownTask: ReturnType<typeof vi.fn<() => void>>;
	let deps: EpisodeManagerDependencies;

	const mockState: SimulationState = {
		timestamp: 1000,
		leftArm: createDefaultArmState(),
		rightArm: createDefaultArmState(),
		objects: [],
	};

	beforeEach(() => {
		mockSimManager = {
			step: vi.fn(() => mockState),
			getState: vi.fn(() => mockState),
			reset: vi.fn(() => mockState),
		};
		setupTask = vi.fn();
		teardownTask = vi.fn();
		deps = {
			simulationManager: mockSimManager,
			setupTask,
			teardownTask,
		};
	});

	it("should start an episode and return initial state", () => {
		const manager = createEpisodeManager(deps);
		const config: EpisodeConfig = { task: "pick-and-place" };

		const state = manager.startEpisode(config);

		expect(setupTask).toHaveBeenCalledWith(config);
		expect(mockSimManager.reset).toHaveBeenCalled();
		expect(state).toBe(mockState);
	});

	it("should report active episode", () => {
		const manager = createEpisodeManager(deps);

		expect(manager.isEpisodeActive()).toBe(false);

		manager.startEpisode({ task: "pick-and-place" });

		expect(manager.isEpisodeActive()).toBe(true);
	});

	it("should return current episode config", () => {
		const manager = createEpisodeManager(deps);
		const config: EpisodeConfig = { task: "valve-turning", randomize: true };

		manager.startEpisode(config);

		expect(manager.getCurrentConfig()).toEqual(config);
	});

	it("should end episode and teardown", () => {
		const manager = createEpisodeManager(deps);
		manager.startEpisode({ task: "handle-rotation" });

		manager.endEpisode();

		expect(teardownTask).toHaveBeenCalled();
		expect(manager.isEpisodeActive()).toBe(false);
		expect(manager.getCurrentConfig()).toBeNull();
	});

	it("should teardown previous episode when starting a new one", () => {
		const manager = createEpisodeManager(deps);
		manager.startEpisode({ task: "pick-and-place" });

		manager.startEpisode({ task: "valve-turning" });

		expect(teardownTask).toHaveBeenCalledTimes(1);
		expect(setupTask).toHaveBeenCalledTimes(2);
	});

	it("should not teardown when no active episode on end", () => {
		const manager = createEpisodeManager(deps);

		manager.endEpisode();

		expect(teardownTask).not.toHaveBeenCalled();
	});
});
