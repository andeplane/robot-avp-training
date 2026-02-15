import type * as THREE from "three";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createXRSessionManager, type XRSessionManagerDependencies } from "./XRSessionManager";

describe(createXRSessionManager.name, () => {
	let mockRenderer: THREE.WebGLRenderer;
	let mockXRSystem: XRSystem;
	let mockSession: XRSession;

	beforeEach(() => {
		mockSession = {
			end: vi.fn(async () => {}),
			addEventListener: vi.fn(),
			requestReferenceSpace: vi.fn(async () => ({}) as XRReferenceSpace),
		} as unknown as XRSession;

		mockXRSystem = {
			isSessionSupported: vi.fn(async () => true),
			requestSession: vi.fn(async () => mockSession),
		} as unknown as XRSystem;

		mockRenderer = {
			xr: {
				setSession: vi.fn(async () => {}),
			},
		} as unknown as THREE.WebGLRenderer;
	});

	function createDeps(
		overrides?: Partial<XRSessionManagerDependencies>,
	): XRSessionManagerDependencies {
		return {
			getXRSystem: () => mockXRSystem,
			...overrides,
		};
	}

	it("should report supported when XR system supports immersive-ar", async () => {
		const manager = createXRSessionManager(mockRenderer, {}, createDeps());

		const supported = await manager.isSupported();

		expect(supported).toBe(true);
		expect(mockXRSystem.isSessionSupported).toHaveBeenCalledWith("immersive-ar");
	});

	it("should report not supported when XR system is unavailable", async () => {
		const deps = createDeps({ getXRSystem: () => undefined });
		const manager = createXRSessionManager(mockRenderer, {}, deps);

		const supported = await manager.isSupported();

		expect(supported).toBe(false);
	});

	it("should start an immersive-ar session with hand-tracking", async () => {
		const manager = createXRSessionManager(mockRenderer, {}, createDeps());

		const session = await manager.startSession();

		expect(mockXRSystem.requestSession).toHaveBeenCalledWith("immersive-ar", {
			requiredFeatures: ["hand-tracking"],
			optionalFeatures: ["local-floor", "bounded-floor"],
		});
		expect(session).toBe(mockSession);
		expect(manager.getSession()).toBe(mockSession);
	});

	it("should throw when starting session without XR system", async () => {
		const deps = createDeps({ getXRSystem: () => undefined });
		const manager = createXRSessionManager(mockRenderer, {}, deps);

		await expect(manager.startSession()).rejects.toThrow("WebXR not available");
	});

	it("should set the renderer XR session", async () => {
		const manager = createXRSessionManager(mockRenderer, {}, createDeps());

		await manager.startSession();

		expect(mockRenderer.xr.setSession).toHaveBeenCalledWith(mockSession);
	});

	it("should request local-floor reference space", async () => {
		const manager = createXRSessionManager(mockRenderer, {}, createDeps());

		await manager.startSession();

		expect(mockSession.requestReferenceSpace).toHaveBeenCalledWith("local-floor");
		expect(manager.getReferenceSpace()).toBeDefined();
	});

	it("should end the session and clear state", async () => {
		const manager = createXRSessionManager(mockRenderer, {}, createDeps());
		await manager.startSession();

		await manager.endSession();

		expect(mockSession.end).toHaveBeenCalled();
		expect(manager.getSession()).toBeNull();
		expect(manager.getReferenceSpace()).toBeNull();
	});

	it("should handle session end event", async () => {
		let endCallback: (() => void) | undefined;
		vi.mocked(mockSession.addEventListener).mockImplementation(
			(event: string, callback: EventListenerOrEventListenerObject) => {
				if (event === "end") endCallback = callback as () => void;
			},
		);

		const manager = createXRSessionManager(mockRenderer, {}, createDeps());
		await manager.startSession();
		expect(manager.getSession()).toBe(mockSession);

		endCallback?.();

		expect(manager.getSession()).toBeNull();
		expect(manager.getReferenceSpace()).toBeNull();
	});

	it("should accept custom config features", async () => {
		const manager = createXRSessionManager(
			mockRenderer,
			{
				requiredFeatures: ["hand-tracking", "hit-test"],
				optionalFeatures: ["local-floor"],
			},
			createDeps(),
		);

		await manager.startSession();

		expect(mockXRSystem.requestSession).toHaveBeenCalledWith("immersive-ar", {
			requiredFeatures: ["hand-tracking", "hit-test"],
			optionalFeatures: ["local-floor"],
		});
	});
});
