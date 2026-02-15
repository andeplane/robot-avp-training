import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { syncAllBodiesToGraphics } from "./physics/BodySync";
import { createPhysicsWorld, initPhysics } from "./physics/PhysicsWorld";
import { createDualArms } from "./robot/ArmFactory";
import { createScene } from "./scene/SceneSetup";
import type { TaskType } from "./simulation/types";
import { createTaskManager } from "./tasks/TaskManager";
import { createXRSessionManager } from "./xr/XRSessionManager";

const MOVE_SPEED = 2.0; // meters per second
const TASK_KEYS: Record<string, TaskType> = {
	"1": "pick-and-place",
	"2": "valve-turning",
	"3": "handle-rotation",
};

async function main(): Promise<void> {
	const container = document.getElementById("app");
	if (!container) throw new Error("Missing #app container");

	const { scene, camera, renderer } = createScene();
	container.appendChild(renderer.domElement);

	// Desktop orbit controls -- mouse to look, scroll to zoom
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0.8, 0);
	controls.enableDamping = true;
	controls.dampingFactor = 0.1;
	controls.update();

	// WASD movement state
	const keysDown = new Set<string>();

	// Initialize physics
	await initPhysics();
	const physicsWorld = createPhysicsWorld();

	// Add robot arms to the scene
	createDualArms(scene);

	// Task manager for switching environments
	const taskManager = createTaskManager({ scene, physicsWorld });

	// Load default task
	let currentTaskType: TaskType = "pick-and-place";
	taskManager.loadTask(currentTaskType);
	updateHUD(currentTaskType, taskManager.getProgress(), taskManager.checkSuccess());

	// XR session support
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
				controls.enabled = false;
			} catch (error) {
				console.error("Failed to start AR session:", error);
			}
		});
	}

	// Keyboard input
	window.addEventListener("keydown", (e) => {
		keysDown.add(e.key.toLowerCase());

		// Task switching
		const newTask = TASK_KEYS[e.key];
		if (newTask && newTask !== currentTaskType) {
			currentTaskType = newTask;
			taskManager.loadTask(currentTaskType);
			console.log(`Switched to task: ${currentTaskType}`);
		}

		if (e.key.toLowerCase() === "r") {
			taskManager.resetCurrentTask();
			console.log("Task reset");
		}
	});

	window.addEventListener("keyup", (e) => {
		keysDown.delete(e.key.toLowerCase());
	});

	// Ensure canvas gets focus so keyboard events fire
	renderer.domElement.tabIndex = 0;
	renderer.domElement.focus();
	renderer.domElement.addEventListener("click", () => renderer.domElement.focus());

	// Clock for delta time
	const clock = new THREE.Clock();

	// Animation loop
	renderer.setAnimationLoop((_time: number, frame?: XRFrame) => {
		const dt = clock.getDelta();

		if (frame) {
			// XR frame processing (hand tracking, etc.) for later
		}

		// WASD camera movement
		applyWASDMovement(camera, controls, keysDown, dt);

		// Step physics and sync meshes
		physicsWorld.step();
		syncAllBodiesToGraphics(physicsWorld.getAllBodies());

		// Update HUD
		updateHUD(currentTaskType, taskManager.getProgress(), taskManager.checkSuccess());

		controls.update();
		renderer.render(scene, camera);
	});

	window.addEventListener("resize", () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});
}

function applyWASDMovement(
	camera: THREE.PerspectiveCamera,
	controls: OrbitControls,
	keysDown: Set<string>,
	dt: number,
): void {
	const forward = new THREE.Vector3();
	camera.getWorldDirection(forward);
	forward.y = 0;
	forward.normalize();

	const right = new THREE.Vector3();
	right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

	const move = new THREE.Vector3();

	if (keysDown.has("w")) move.add(forward);
	if (keysDown.has("s")) move.sub(forward);
	if (keysDown.has("a")) move.sub(right);
	if (keysDown.has("d")) move.add(right);
	if (keysDown.has("q") || keysDown.has(" ")) move.y += 1;
	if (keysDown.has("e") || keysDown.has("shift")) move.y -= 1;

	if (move.lengthSq() === 0) return;

	move.normalize().multiplyScalar(MOVE_SPEED * dt);
	camera.position.add(move);
	controls.target.add(move);
}

function updateHUD(task: TaskType, progress: number, success: boolean): void {
	let hud = document.getElementById("hud");
	if (!hud) {
		hud = document.createElement("div");
		hud.id = "hud";
		hud.style.cssText =
			"position:fixed;top:16px;left:16px;color:#fff;font-family:system-ui,sans-serif;font-size:14px;background:rgba(0,0,0,0.6);padding:12px 16px;border-radius:8px;z-index:10;line-height:1.6;";
		document.body.appendChild(hud);
	}
	const taskLabel = task.replace(/-/g, " ");
	const pct = Math.round(progress * 100);
	const statusText = success ? '<span style="color:#22c55e">SUCCESS</span>' : `${pct}%`;

	hud.innerHTML = [
		`<strong>Task:</strong> ${taskLabel} ${statusText}`,
		"",
		'<span style="color:#999;font-size:12px">',
		"[1] Pick &amp; Place  [2] Valve  [3] Handle  [R] Reset",
		"WASD move · Mouse look · Scroll zoom · Q/E up/down",
		"</span>",
	].join("<br>");
}

main();
