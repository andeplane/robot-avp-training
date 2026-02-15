import type * as THREE from "three";

export interface XRSessionManagerConfig {
	requiredFeatures: string[];
	optionalFeatures: string[];
}

const defaultConfig: XRSessionManagerConfig = {
	requiredFeatures: ["hand-tracking"],
	optionalFeatures: ["local-floor", "bounded-floor"],
};

export interface XRSessionManager {
	isSupported: () => Promise<boolean>;
	startSession: () => Promise<XRSession>;
	endSession: () => Promise<void>;
	getSession: () => XRSession | null;
	getReferenceSpace: () => XRReferenceSpace | null;
}

export type XRSessionManagerDependencies = {
	getXRSystem: () => XRSystem | undefined;
};

const defaultDependencies: XRSessionManagerDependencies = {
	getXRSystem: () => navigator.xr,
};

export function createXRSessionManager(
	renderer: THREE.WebGLRenderer,
	config: Partial<XRSessionManagerConfig> = {},
	dependencyOverrides?: Partial<XRSessionManagerDependencies>,
): XRSessionManager {
	const mergedConfig = { ...defaultConfig, ...config };
	const deps = { ...defaultDependencies, ...dependencyOverrides };

	let currentSession: XRSession | null = null;
	let referenceSpace: XRReferenceSpace | null = null;

	async function isSupported(): Promise<boolean> {
		const xr = deps.getXRSystem();
		if (!xr) return false;
		return xr.isSessionSupported("immersive-ar");
	}

	async function startSession(): Promise<XRSession> {
		const xr = deps.getXRSystem();
		if (!xr) {
			throw new Error("WebXR not available");
		}

		const session = await xr.requestSession("immersive-ar", {
			requiredFeatures: mergedConfig.requiredFeatures,
			optionalFeatures: mergedConfig.optionalFeatures,
		});

		currentSession = session;
		await renderer.xr.setSession(session);

		referenceSpace = await session.requestReferenceSpace("local-floor");

		session.addEventListener("end", () => {
			currentSession = null;
			referenceSpace = null;
		});

		return session;
	}

	async function endSession(): Promise<void> {
		if (currentSession) {
			await currentSession.end();
			currentSession = null;
			referenceSpace = null;
		}
	}

	function getSession(): XRSession | null {
		return currentSession;
	}

	function getReferenceSpace(): XRReferenceSpace | null {
		return referenceSpace;
	}

	return {
		isSupported,
		startSession,
		endSession,
		getSession,
		getReferenceSpace,
	};
}
