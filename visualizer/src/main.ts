import { createScene } from "./scene/SceneSetup";
import { createXRSessionManager } from "./xr/XRSessionManager";

function main(): void {
	const container = document.getElementById("app");
	if (!container) throw new Error("Missing #app container");

	const { scene, camera, renderer } = createScene();
	container.appendChild(renderer.domElement);

	const xrManager = createXRSessionManager(renderer);

	const enterButton = document.getElementById("enter-ar") as HTMLButtonElement | null;
	if (enterButton) {
		xrManager.isSupported().then((supported) => {
			enterButton.disabled = !supported;
			enterButton.textContent = supported ? "Start AR" : "AR Not Supported";
		});

		enterButton.addEventListener("click", async () => {
			try {
				await xrManager.startSession();
				enterButton.textContent = "In AR Session";
				enterButton.disabled = true;
			} catch (error) {
				console.error("Failed to start AR session:", error);
			}
		});
	}

	renderer.setAnimationLoop((_time: number, frame?: XRFrame) => {
		if (frame) {
			// XR frame processing will be added in later tasks
		}
		renderer.render(scene, camera);
	});

	window.addEventListener("resize", () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});
}

main();
