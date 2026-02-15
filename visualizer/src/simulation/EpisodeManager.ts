import type { SimulationManager } from "./SimulationManager";
import type { EpisodeConfig, SimulationState } from "./types";

export interface EpisodeManager {
	startEpisode(config: EpisodeConfig): SimulationState;
	isEpisodeActive(): boolean;
	getCurrentConfig(): EpisodeConfig | null;
	endEpisode(): void;
}

export interface EpisodeManagerDependencies {
	simulationManager: SimulationManager;
	setupTask: (config: EpisodeConfig) => void;
	teardownTask: () => void;
}

export function createEpisodeManager(deps: EpisodeManagerDependencies): EpisodeManager {
	let activeConfig: EpisodeConfig | null = null;

	function startEpisode(config: EpisodeConfig): SimulationState {
		if (activeConfig) {
			deps.teardownTask();
		}

		activeConfig = config;
		deps.setupTask(config);
		return deps.simulationManager.reset();
	}

	function isEpisodeActive(): boolean {
		return activeConfig !== null;
	}

	function getCurrentConfig(): EpisodeConfig | null {
		return activeConfig;
	}

	function endEpisode(): void {
		if (activeConfig) {
			deps.teardownTask();
			activeConfig = null;
		}
	}

	return { startEpisode, isEpisodeActive, getCurrentConfig, endEpisode };
}
