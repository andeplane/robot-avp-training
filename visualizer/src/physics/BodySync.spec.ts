import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { syncAllBodiesToGraphics, syncGraphicsToPhysics, syncPhysicsToGraphics } from "./BodySync";
import { createPhysicsWorld, type PhysicsWorld } from "./PhysicsWorld";

describe("BodySync", () => {
	beforeAll(async () => {
		await RAPIER.init();
	});

	let world: PhysicsWorld;

	beforeEach(() => {
		world = createPhysicsWorld();
	});

	describe(syncPhysicsToGraphics.name, () => {
		it("should update mesh position and rotation from rigid body", () => {
			const mesh = new THREE.Mesh();
			const handle = world.addBody({
				id: "box",
				bodyType: "dynamic",
				position: { x: 1, y: 2, z: 3 },
				rotation: { x: 0, y: 0, z: 0, w: 1 },
				colliderDesc: RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5),
				mesh,
			});

			syncPhysicsToGraphics(handle);

			expect(mesh.position.x).toBeCloseTo(1);
			expect(mesh.position.y).toBeCloseTo(2);
			expect(mesh.position.z).toBeCloseTo(3);
		});

		it("should do nothing when handle has no mesh", () => {
			const handle = world.addBody({
				id: "no-mesh",
				bodyType: "dynamic",
				position: { x: 1, y: 2, z: 3 },
				rotation: { x: 0, y: 0, z: 0, w: 1 },
				colliderDesc: RAPIER.ColliderDesc.ball(0.5),
			});

			expect(() => syncPhysicsToGraphics(handle)).not.toThrow();
		});
	});

	describe(syncAllBodiesToGraphics.name, () => {
		it("should sync all bodies with meshes", () => {
			const mesh1 = new THREE.Mesh();
			const mesh2 = new THREE.Mesh();

			world.addBody({
				id: "a",
				bodyType: "dynamic",
				position: { x: 1, y: 0, z: 0 },
				rotation: { x: 0, y: 0, z: 0, w: 1 },
				colliderDesc: RAPIER.ColliderDesc.ball(0.1),
				mesh: mesh1,
			});
			world.addBody({
				id: "b",
				bodyType: "dynamic",
				position: { x: 0, y: 2, z: 0 },
				rotation: { x: 0, y: 0, z: 0, w: 1 },
				colliderDesc: RAPIER.ColliderDesc.ball(0.1),
				mesh: mesh2,
			});

			syncAllBodiesToGraphics(world.getAllBodies());

			expect(mesh1.position.x).toBeCloseTo(1);
			expect(mesh2.position.y).toBeCloseTo(2);
		});
	});

	describe(syncGraphicsToPhysics.name, () => {
		it("should update rigid body position from mesh", () => {
			const handle = world.addBody({
				id: "kinematic",
				bodyType: "kinematic",
				position: { x: 0, y: 0, z: 0 },
				rotation: { x: 0, y: 0, z: 0, w: 1 },
				colliderDesc: RAPIER.ColliderDesc.ball(0.1),
			});

			const newPos = new THREE.Vector3(5, 6, 7);
			const newQuat = new THREE.Quaternion(0, 0, 0, 1);

			syncGraphicsToPhysics(handle, newPos, newQuat);

			const t = handle.rigidBody.translation();
			expect(t.x).toBeCloseTo(5);
			expect(t.y).toBeCloseTo(6);
			expect(t.z).toBeCloseTo(7);
		});
	});
});
