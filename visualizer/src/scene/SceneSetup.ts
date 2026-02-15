import * as THREE from "three";

export interface SceneComponents {
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	renderer: THREE.WebGLRenderer;
	groundPlane: THREE.Mesh;
}

export interface Viewport {
	width: number;
	height: number;
	pixelRatio: number;
}

export type SceneSetupDependencies = {
	createRenderer: (viewport: Viewport) => THREE.WebGLRenderer;
	getViewport: () => Viewport;
};

const defaultDependencies: SceneSetupDependencies = {
	getViewport: () => ({
		width: window.innerWidth,
		height: window.innerHeight,
		pixelRatio: window.devicePixelRatio,
	}),
	createRenderer: (viewport: Viewport) => {
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(viewport.pixelRatio);
		renderer.setSize(viewport.width, viewport.height);
		renderer.xr.enabled = true;
		return renderer;
	},
};

export function createScene(
	dependencyOverrides?: Partial<SceneSetupDependencies>,
): SceneComponents {
	const deps = { ...defaultDependencies, ...dependencyOverrides };

	const scene = new THREE.Scene();

	const viewport = deps.getViewport();

	const camera = new THREE.PerspectiveCamera(70, viewport.width / viewport.height, 0.01, 100);
	camera.position.set(0, 1.6, 3);

	const renderer = deps.createRenderer(viewport);

	addLighting(scene);
	const groundPlane = createGroundPlane();
	scene.add(groundPlane);

	return { scene, camera, renderer, groundPlane };
}

function addLighting(scene: THREE.Scene): void {
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
	scene.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
	directionalLight.position.set(5, 10, 7);
	directionalLight.castShadow = true;
	scene.add(directionalLight);
}

function createGroundPlane(): THREE.Mesh {
	const geometry = new THREE.PlaneGeometry(10, 10);
	const material = new THREE.MeshStandardMaterial({
		color: 0x808080,
		roughness: 0.8,
		metalness: 0.2,
		transparent: true,
		opacity: 0.5,
	});
	const plane = new THREE.Mesh(geometry, material);
	plane.rotation.x = -Math.PI / 2;
	plane.position.y = 0;
	plane.receiveShadow = true;
	return plane;
}
